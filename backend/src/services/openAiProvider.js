// src/services/openAiProvider.js
// OpenAI provider integration for Code Review Assistant.
// This module is deliberately isolated so that other LLM providers (e.g., Gemini) can be swapped in later.

import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config(); // Ensure env vars are loaded (redundant if already loaded elsewhere, but safe).

/**
 * System prompt placeholder.
 * Replace the string below with the final "Improved Prompt V2" from your Prompt Engineering Phase 2.
 */
const SYSTEM_PROMPT = `<<PLACEHOLDER: Insert Improved Prompt V2 here>>`;

/**
 * Helper to extract a JSON payload from the model's response.
 * The LLM should be instructed to respond with a JSON object matching the review schema.
 */
function safeParseJson(text) {
  try {
    // Trim any surrounding whitespace or markdown fences.
    const cleaned = text.trim().replace(/^```json\n?|\n?```$/g, '');
    return JSON.parse(cleaned);
  } catch (e) {
    // Re‑throw a more descriptive error for the caller.
    throw new Error('Failed to parse JSON from OpenAI response');
  }
}

/**
 * Calls OpenAI's chat completion API to obtain a code review.
 * @param {string} code - The user‑submitted source code.
 * @param {string} language - The programming language (e.g., "python", "javascript").
 * @returns {Promise<Object>} - Review object containing summary, issues, explanation, hints, improvedCode, takeaways.
 */
export async function getOpenAiReview(code, language) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    const err = new Error('OpenAI API key not configured');
    err.code = 'MISSING_OPENAI_KEY';
    throw err;
  }

  const client = new OpenAI({ apiKey, timeout: 10000 }); // 10 s timeout

  // Build the user message – keep it concise while providing necessary context.
  const userMessage = `Language: ${language}\n\nCode:\n${code}`;

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini', // Adjust if you prefer a different model.
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage }
      ],
      temperature: 0.2, // Low temperature for deterministic, educational output.
      // Expect a JSON payload – we rely on the system prompt to enforce this.
    });

    const assistantMessage = response.choices?.[0]?.message?.content;
    if (!assistantMessage) {
      const err = new Error('Empty response from OpenAI');
      err.code = 'EMPTY_OPENAI_RESPONSE';
      throw err;
    }

    // Parse the JSON returned by the model.
    const review = safeParseJson(assistantMessage);
    return review;
  } catch (err) {
    // Normalise various error shapes (network, timeout, OpenAI API errors).
    if (err?.code === 'ETIMEDOUT' || err?.name === 'TimeoutError') {
      const timeoutErr = new Error('OpenAI request timed out');
      timeoutErr.code = 'OPENAI_TIMEOUT';
      throw timeoutErr;
    }
    // Propagate OpenAI‑specific error details without leaking secrets.
    const generic = new Error(err.message || 'OpenAI request failed');
    generic.code = err.code || 'OPENAI_ERROR';
    throw generic;
  }
}
