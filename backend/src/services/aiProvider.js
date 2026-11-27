const axios = require('axios');
const { SYSTEM_PROMPT, buildStructuredUserPrompt } = require('./promptTemplates');

/**
 * Base AI Provider Abstract Interface
 * Enables plugging in additional providers (Ollama, Anthropic, OpenAI, custom endpoints)
 */
class BaseAIProvider {
  constructor(name) {
    this.name = name;
  }

  async generateReview(params) {
    throw new Error('Method generateReview() must be implemented by subclass.');
  }

  async chatFollowUp(params) {
    throw new Error('Method chatFollowUp() must be implemented by subclass.');
  }

  async compareReviews(params) {
    throw new Error('Method compareReviews() must be implemented by subclass.');
  }

  async checkHealth() {
    throw new Error('Method checkHealth() must be implemented by subclass.');
  }
}

/**
 * Ollama Local Runtime Provider Implementation
 */
class OllamaProvider extends BaseAIProvider {
  constructor(options = {}) {
    super('Ollama');
    this.options = options;
  }

  getBaseUrl() {
    return (this.options.baseUrl || process.env.OLLAMA_BASE_URL || 'http://localhost:11434').replace(/\/+$/, '');
  }

  getModel() {
    return this.options.model || process.env.OLLAMA_MODEL || 'qwen2.5-coder:7b';
  }

  getTimeoutMs() {
    if (typeof this.options.timeoutMs === 'number') {
      return this.options.timeoutMs;
    }
    const timeout = parseInt(process.env.OLLAMA_TIMEOUT_MS, 10);
    return isNaN(timeout) ? 120000 : timeout;
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
      'User-Agent': 'VIBECRAFT-Backend/1.0',
    };
    const apiKey = process.env.OLLAMA_API_KEY || process.env.OLLAMA_AUTH_TOKEN;
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey.trim()}`;
    }
    return headers;
  }

  async checkHealth() {
    const baseUrl = this.getBaseUrl();
    try {
      const res = await axios.get(`${baseUrl}/api/tags`, {
        timeout: 3000,
        headers: this.getHeaders(),
      });
      const models = (res.data?.models || []).map((m) => m.name);
      return {
        provider: this.name,
        online: true,
        baseUrl,
        activeModel: this.getModel(),
        installedModels: models,
      };
    } catch (error) {
      return {
        provider: this.name,
        online: false,
        baseUrl,
        activeModel: this.getModel(),
        error: error.message,
      };
    }
  }

  /**
   * Validates and defensively normalizes the model's 7-section structured response
   */
  validateAndNormalizeResponse(parsed) {
    if (!parsed || typeof parsed !== 'object') {
      throw new Error('AI review engine output is not a valid JSON structure.');
    }

    // 1. Overall Assessment
    const oa = parsed.overallAssessment || {};
    let score = parseInt(oa.score, 10);
    if (isNaN(score)) {
      score = typeof parsed.overallScore === 'number' ? parsed.overallScore : 80;
    }
    score = Math.max(0, Math.min(100, score));

    let qualityLevel = oa.qualityLevel;
    if (!qualityLevel) {
      if (score >= 90) qualityLevel = 'Excellent';
      else if (score >= 75) qualityLevel = 'Good';
      else if (score >= 50) qualityLevel = 'Needs Improvement';
      else qualityLevel = 'Critical Issues';
    }

    const overallAssessment = {
      score,
      summary: oa.summary || parsed.summary || 'Static code review completed successfully.',
      qualityLevel,
    };

    // 2. Bugs and Errors
    const rawBugs = Array.isArray(parsed.bugsAndErrors) ? parsed.bugsAndErrors : [];
    const bugsAndErrors = rawBugs.map((b) => ({
      title: b.title || 'Unclassified Bug',
      category: b.category || 'Logical Error',
      severity: ['Critical', 'High', 'Medium', 'Low'].includes(b.severity) ? b.severity : 'Medium',
      lineNumber: typeof b.lineNumber === 'number' ? b.lineNumber : null,
      explanation: b.explanation || 'Issue detected in source invariants.',
      debuggingHint: b.debuggingHint || 'Trace logic using unit tests or step-through debugger.',
    }));

    // 3. Security Analysis
    const sa = parsed.securityAnalysis || {};
    const securityAnalysis = {
      sqlInjection: sa.sqlInjection || 'None identified',
      xssRisks: sa.xssRisks || 'Not applicable for this context',
      hardcodedSecrets: sa.hardcodedSecrets || 'None identified',
      unsafeInputHandling: sa.unsafeInputHandling || 'Handled appropriately',
      otherWeaknesses: Array.isArray(sa.otherWeaknesses) ? sa.otherWeaknesses : [],
    };

    // 4. Code Quality
    const cq = parsed.codeQuality || {};
    const codeQuality = typeof cq === 'object' ? {
      namingConventions: cq.namingConventions || 'Standard conventions followed',
      readability: cq.readability || 'Code is structured and readable',
      maintainability: cq.maintainability || 'Separation of concerns is adequate',
      codeDuplication: cq.codeDuplication || 'No significant duplication observed',
      bestPractices: cq.bestPractices || 'Language idioms adhered to appropriately',
    } : {
      namingConventions: 'Standard conventions followed',
      readability: String(cq),
      maintainability: 'Adequate modularity',
      codeDuplication: 'None observed',
      bestPractices: 'Follows clean code principles',
    };

    // 5. Performance Analysis
    const pa = parsed.performanceAnalysis || {};
    const performanceAnalysis = {
      inefficientLoops: pa.inefficientLoops || 'Loops are bounded and optimal',
      unnecessaryComputations: pa.unnecessaryComputations || 'No redundant calculations observed',
      memoryConcerns: pa.memoryConcerns || 'Memory allocation is within expected bounds',
      optimizationSuggestions: Array.isArray(pa.optimizationSuggestions)
        ? pa.optimizationSuggestions
        : Array.isArray(parsed.optimizationSuggestions) ? parsed.optimizationSuggestions : [],
    };

    // 6. Complexity Analysis
    const ca = parsed.complexityAnalysis || {};
    const complexityAnalysis = {
      timeComplexity: ca.timeComplexity || parsed.timeComplexity || 'O(n)',
      spaceComplexity: ca.spaceComplexity || parsed.spaceComplexity || 'O(1)',
      explanation: ca.explanation || 'Complexity derived from execution iterations and memory allocation.',
    };

    // 7. Learning Assistance
    const la = parsed.learningAssistance || {};
    const learningAssistance = {
      whyIssuesOccur: la.whyIssuesOccur || 'Understanding root invariant causes and edge cases is critical to prevention.',
      stepByStepDebugging: Array.isArray(la.stepByStepDebugging)
        ? la.stepByStepDebugging
        : ['Verify boundary edge cases.', 'Step through iterations with input samples.'],
      illustrativeExamples: Array.isArray(la.illustrativeExamples)
        ? la.illustrativeExamples.map((ex) => ({
            concept: ex.concept || 'Code Pattern',
            antiPattern: ex.antiPattern || '',
            improvedPattern: ex.improvedPattern || '',
          }))
        : [],
    };

    // Legacy aggregated fields for backwards-compatibility with existing dashboard views
    const legacyBugs = bugsAndErrors.map(
      (b) => `[${b.severity}] ${b.title}: ${b.explanation}`
    );
    if (parsed.syntaxErrors) legacyBugs.push(...parsed.syntaxErrors);

    return {
      overallScore: score,
      reviewResult: {
        overallAssessment,
        summary: overallAssessment.summary,
        bugsAndErrors,
        bugs: legacyBugs,
        securityAnalysis,
        securityIssues: securityAnalysis.otherWeaknesses.concat(
          securityAnalysis.sqlInjection !== 'None identified' ? [`SQL Injection: ${securityAnalysis.sqlInjection}`] : [],
          securityAnalysis.xssRisks !== 'Not applicable for this context' && securityAnalysis.xssRisks !== 'None identified'
            ? [`XSS: ${securityAnalysis.xssRisks}`] : [],
          securityAnalysis.hardcodedSecrets !== 'None identified' ? [`Secrets: ${securityAnalysis.hardcodedSecrets}`] : []
        ),
        codeQuality,
        performanceAnalysis,
        optimizationSuggestions: performanceAnalysis.optimizationSuggestions,
        complexityAnalysis,
        timeComplexity: complexityAnalysis.timeComplexity,
        spaceComplexity: complexityAnalysis.spaceComplexity,
        learningAssistance,
        debuggingHints: learningAssistance.stepByStepDebugging,
      },
    };
  }

  /**
   * Deterministic simulated review generator for offline test environments
   */
  generateSimulatedReview({ programmingLanguage, sourceCode, reviewMode, reviewInstructions }) {
    const isSyntaxError =
      sourceCode.includes('def compute_factorial(n)\n') ||
      sourceCode.includes('// Missing closing brace') ||
      sourceCode.includes('int area = width * height\n') ||
      sourceCode.includes('int res = a * b\n');

    const isLogicalError =
      sourceCode.includes('range(1, limit)') ||
      sourceCode.includes('isAuthenticated == false') ||
      sourceCode.includes('percent / 100') ||
      sourceCode.includes('equals(UserAccount other)');

    const isRuntimeError =
      sourceCode.includes('mutable_default') ||
      sourceCode.includes('memo={}') ||
      sourceCode.includes('data.user.profile.name') ||
      sourceCode.includes('int arr[2]; arr[5]') ||
      sourceCode.includes('String s = null; s.length()');

    const isSecurityError =
      sourceCode.includes('SELECT * FROM') ||
      sourceCode.includes('strcpy(') ||
      sourceCode.includes('innerHTML =') ||
      sourceCode.includes('AKIAIOSFODNN7EXAMPLE');

    const isInefficient =
      sourceCode.includes('fib(n - 1) + fib(n - 2)') ||
      sourceCode.includes('findPair') ||
      sourceCode.includes('std::vector<int> row') ||
      sourceCode.includes('result += line');

    if (isSyntaxError) {
      const mockResult = {
        overallAssessment: {
          score: 55,
          summary: `Syntax error detected in ${programmingLanguage.toUpperCase()} code prevents compilation or parsing.`,
          qualityLevel: 'Critical Issues',
        },
        bugsAndErrors: [
          {
            title: 'Syntax / Declaration Error',
            category: 'Syntax',
            severity: 'Critical',
            lineNumber: 2,
            explanation: 'Missing delimiter, semicolon, or colon violates language grammar specification.',
            debuggingHint: 'Inspect statement termination and block opening syntax.',
          },
        ],
        securityAnalysis: {
          sqlInjection: 'None identified',
          xssRisks: 'Not applicable',
          hardcodedSecrets: 'None identified',
          unsafeInputHandling: 'Syntax error prevents execution.',
          otherWeaknesses: [],
        },
        codeQuality: {
          namingConventions: 'N/A due to parse error',
          readability: 'Impaired by syntax defect',
          maintainability: 'Must be syntactically valid before maintainability assessment.',
        },
        performanceAnalysis: {
          inefficientLoops: 'None identified',
          unnecessaryComputations: 'N/A',
          memoryConcerns: 'None',
          optimizationSuggestions: ['Correct syntax before addressing runtime performance.'],
        },
        complexityAnalysis: {
          timeComplexity: 'N/A',
          spaceComplexity: 'N/A',
          explanation: 'Asymptotic complexity cannot be determined on unparseable syntax.',
        },
        learningAssistance: {
          whyIssuesOccur: 'Compilers and interpreters require strict adherence to lexical grammar.',
          stepByStepDebugging: ['Review compiler/linter error output at indicated line number.'],
          illustrativeExamples: [
            {
              concept: 'Statement Syntax',
              antiPattern: 'def func()',
              improvedPattern: 'def func():',
            },
          ],
        },
      };
      return this.validateAndNormalizeResponse(mockResult);
    }

    if (isLogicalError) {
      const mockResult = {
        overallAssessment: {
          score: 68,
          summary: `Logical invariant violation detected in ${programmingLanguage.toUpperCase()} routine.`,
          qualityLevel: 'Needs Improvement',
        },
        bugsAndErrors: [
          {
            title: 'Logical Invariant / Boundary Defect',
            category: 'Logical Error',
            severity: 'High',
            lineNumber: 3,
            explanation: 'Conditional boundary or type coercion causes unexpected execution paths.',
            debuggingHint: 'Trace edge cases with test fixtures around minimum and maximum values.',
          },
        ],
        securityAnalysis: {
          sqlInjection: 'None identified',
          xssRisks: 'Not applicable',
          hardcodedSecrets: 'None identified',
          unsafeInputHandling: 'Clean boundaries',
          otherWeaknesses: [],
        },
        codeQuality: {
          namingConventions: 'Conventions are acceptable.',
          readability: 'Logical defect obscures intention.',
          maintainability: 'Moderate; require regression tests.',
        },
        performanceAnalysis: {
          optimizationSuggestions: ['Verify invariants before optimizing.'],
        },
        complexityAnalysis: {
          timeComplexity: 'O(n)',
          spaceComplexity: 'O(1)',
          explanation: 'Linear scan over collection.',
        },
        learningAssistance: {
          whyIssuesOccur: 'Off-by-one errors and loose equality introduce subtle branch deviation.',
          stepByStepDebugging: ['Assert loop boundaries and use strict comparison operators.'],
          illustrativeExamples: [
            {
              concept: 'Strict Equality',
              antiPattern: 'val == false',
              improvedPattern: 'val === false',
            },
          ],
        },
      };
      return this.validateAndNormalizeResponse(mockResult);
    }

    if (isRuntimeError || isSecurityError) {
      const mockResult = {
        overallAssessment: {
          score: 45,
          summary: `Identified critical defects in ${programmingLanguage.toUpperCase()} code requiring immediate remediation.`,
          qualityLevel: 'Critical Issues',
        },
        bugsAndErrors: [
          {
            title: isSecurityError ? 'Security Vulnerability' : 'Unsafe State / Memory Hazard',
            category: isSecurityError ? 'Security' : 'Runtime Error',
            severity: 'Critical',
            lineNumber: 2,
            explanation: isSecurityError
              ? 'Unsanitized input interpolation or insecure API usage introduces severe vulnerability.'
              : 'Improper state lifecycle or null dereference causes runtime crash.',
            debuggingHint: 'Refactor to use parameterized statements or defensive parameter initialization.',
          },
        ],
        securityAnalysis: {
          sqlInjection: sourceCode.includes('SELECT') ? 'Critical: Dynamic SQL formatting without parameterization.' : 'None identified',
          xssRisks: sourceCode.includes('innerHTML') ? 'High: Direct unsanitized input assigned to innerHTML.' : 'Not applicable',
          hardcodedSecrets: sourceCode.includes('AKIAIOSFODNN7EXAMPLE') ? 'Critical: Hardcoded AWS secret key detected.' : 'None identified',
          unsafeInputHandling: 'Unvalidated user parameters passed directly to execution context.',
          otherWeaknesses: sourceCode.includes('strcpy') ? ['Buffer Overflow: strcpy without bounds check'] : [],
        },
        codeQuality: {
          namingConventions: 'Conventions are acceptable.',
          readability: 'Readability is reasonable, but security defects obscure maintainability.',
          maintainability: 'Low maintainability due to coupled inputs and side effects.',
          codeDuplication: 'None observed.',
          bestPractices: 'Violates safe coding guidelines for input handling.',
        },
        performanceAnalysis: {
          inefficientLoops: 'No loop bottlenecks observed.',
          unnecessaryComputations: 'Computations are nominal.',
          memoryConcerns: sourceCode.includes('strcpy') ? 'Potential stack corruption from unbound memory copy.' : 'Low memory concern.',
          optimizationSuggestions: ['Eliminate injection vectors by adopting parameterized APIs.'],
        },
        complexityAnalysis: {
          timeComplexity: 'O(1)',
          spaceComplexity: 'O(1)',
          explanation: 'Constant-time operations executed linearly.',
        },
        learningAssistance: {
          whyIssuesOccur: 'Unsanitized input interpolation bypasses lexical analysis boundaries of compilers/parsers.',
          stepByStepDebugging: [
            'Test with malicious payload such as "\' OR \'1\'=\'1" to inspect query string.',
            'Replace dynamic string concatenation with prepared parameters.',
          ],
          illustrativeExamples: [
            {
              concept: 'Safe Parameterized Queries',
              antiPattern: 'cursor.execute(f"SELECT * FROM users WHERE id = {user_id}")',
              improvedPattern: 'cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))',
            },
          ],
        },
      };
      return this.validateAndNormalizeResponse(mockResult);
    }

    if (isInefficient) {
      const isExp = sourceCode.includes('fib(');
      const isQuad = sourceCode.includes('findPair') || sourceCode.includes('result += line');
      const timeComp = isExp ? 'O(2^n)' : (isQuad ? 'O(n^2)' : 'O(n)');

      const mockResult = {
        overallAssessment: {
          score: 72,
          summary: `Asymptotic complexity bottleneck detected in ${programmingLanguage.toUpperCase()} implementation.`,
          qualityLevel: 'Needs Improvement',
        },
        bugsAndErrors: [
          {
            title: 'Algorithmic Efficiency Bottleneck',
            category: 'Performance',
            severity: 'Medium',
            lineNumber: 2,
            explanation: `Redundant recalculations or repeated deep copying degrades performance to ${timeComp}.`,
            debuggingHint: 'Refactor using memoization, hash lookups, or StringBuilder / in-place references.',
          },
        ],
        securityAnalysis: {
          sqlInjection: 'None identified',
          xssRisks: 'Not applicable',
          hardcodedSecrets: 'None identified',
          unsafeInputHandling: 'Valid input handling',
          otherWeaknesses: [],
        },
        codeQuality: {
          namingConventions: 'Conforms to standards',
          readability: 'Good',
          maintainability: 'Good modularity',
        },
        performanceAnalysis: {
          inefficientLoops: isQuad ? 'Nested loop iteration scales quadratically with input size.' : 'None',
          unnecessaryComputations: isExp ? 'Overlapping subproblems recomputed exponentially.' : 'Repeated object copies.',
          memoryConcerns: sourceCode.includes('result +=') ? 'High string garbage collection churn.' : 'Moderate memory overhead.',
          optimizationSuggestions: [
            isExp ? 'Apply memoization or dynamic programming tabulation.' : 'Use hash map for O(1) complement lookup.',
          ],
        },
        complexityAnalysis: {
          timeComplexity: timeComp,
          spaceComplexity: isExp ? 'O(n)' : 'O(1)',
          explanation: `Derived from tree recursion / nested loops yielding ${timeComp} operations.`,
        },
        learningAssistance: {
          whyIssuesOccur: 'Naive recursion and nested loops lead to exponential or polynomial operation scaling.',
          stepByStepDebugging: ['Profile with n=30 to observe execution time spike.'],
          illustrativeExamples: [
            {
              concept: 'Memoization',
              antiPattern: 'return fib(n-1) + fib(n-2)',
              improvedPattern: 'if n in memo: return memo[n]',
            },
          ],
        },
      };
      return this.validateAndNormalizeResponse(mockResult);
    }

    // Default clean code
    const mockResult = {
      overallAssessment: {
        score: 95,
        summary: `Well-crafted, idiomatically correct ${programmingLanguage.toUpperCase()} implementation with optimal asymptotic performance.`,
        qualityLevel: 'Excellent',
      },
      bugsAndErrors: [],
      securityAnalysis: {
        sqlInjection: 'None identified',
        xssRisks: 'Not applicable',
        hardcodedSecrets: 'None identified',
        unsafeInputHandling: 'Input boundaries and types are safely handled.',
        otherWeaknesses: [],
      },
      codeQuality: {
        namingConventions: `Identifiers adhere strictly to ${programmingLanguage.toUpperCase()} idioms.`,
        readability: 'Code is transparent, well-structured, and easy to reason about.',
        maintainability: 'High modularity and clear separation of responsibilities.',
        codeDuplication: 'No duplication detected; adheres to DRY principle.',
        bestPractices: `Conforms to modern ${programmingLanguage.toUpperCase()} standards.`,
      },
      performanceAnalysis: {
        inefficientLoops: 'Loop iterations are tightly bounded.',
        unnecessaryComputations: 'No redundant evaluations or unnecessary memory reallocations.',
        memoryConcerns: 'Optimal auxiliary memory footprint.',
        optimizationSuggestions: ['Code is already algorithmically optimal for general inputs.'],
      },
      complexityAnalysis: {
        timeComplexity: sourceCode.includes('binary_search') || sourceCode.includes('// 2') ? 'O(log n)' : 'O(n)',
        spaceComplexity: 'O(1)',
        explanation: 'Derived from logarithmic search space reduction and in-place variable allocation.',
      },
      learningAssistance: {
        whyIssuesOccur: 'Sound algorithmic design relies on maintaining loop invariants across iterations.',
        stepByStepDebugging: [
          'Verify edge cases including single-element collections, empty collections, and extreme boundary values.',
        ],
        illustrativeExamples: [
          {
            concept: 'In-Place Traversal',
            antiPattern: 'temp = copy(arr); return process(temp)',
            improvedPattern: 'process_in_place(arr); return arr',
          },
        ],
      },
    };

    return this.validateAndNormalizeResponse(mockResult);
  }

  /**
   * Main review generation method
   */
  async generateReview({ programmingLanguage, sourceCode, reviewMode = 'detailed', reviewInstructions = '' }) {
    if (process.env.OLLAMA_SIMULATE === 'true') {
      return this.generateSimulatedReview({ programmingLanguage, sourceCode, reviewMode, reviewInstructions });
    }

    const baseUrl = this.getBaseUrl();
    const model = this.getModel();
    const timeoutMs = this.getTimeoutMs();

    const userPrompt = buildStructuredUserPrompt(
      programmingLanguage,
      sourceCode,
      reviewMode,
      reviewInstructions
    );

    try {
      const response = await axios.post(
        `${baseUrl}/api/chat`,
        {
          model,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: userPrompt },
          ],
          format: 'json',
          stream: false,
          options: {
            temperature: 0.15,
          },
        },
        {
          timeout: timeoutMs,
          headers: this.getHeaders(),
        }
      );

      const content = response.data?.message?.content;
      if (!content) {
        const err = new Error('Ollama returned an empty response.');
        err.statusCode = 502;
        throw err;
      }

      let parsed;
      try {
        parsed = JSON.parse(content);
      } catch (parseErr) {
        const cleaned = content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
        try {
          parsed = JSON.parse(cleaned);
        } catch {
          const err = new Error('AI review model response could not be parsed as valid JSON.');
          err.statusCode = 502;
          throw err;
        }
      }

      return this.validateAndNormalizeResponse(parsed);
    } catch (error) {
      if (error.code === 'ECONNREFUSED' || error.message.includes('ECONNREFUSED')) {
        const err = new Error(
          `Local Ollama runtime is offline or unreachable at ${baseUrl}. Please ensure Ollama is running ('ollama serve').`
        );
        err.statusCode = 503;
        throw err;
      }

      if (
        error.response?.status === 404 ||
        (typeof error.response?.data?.error === 'string' &&
          error.response.data.error.toLowerCase().includes('not found'))
      ) {
        const err = new Error(
          `Ollama model '${model}' is not installed locally. Please run 'ollama pull ${model}' in your terminal.`
        );
        err.statusCode = 404;
        throw err;
      }

      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        const err = new Error(
          `AI code review timed out after ${timeoutMs / 1000} seconds. The local model took too long to respond.`
        );
        err.statusCode = 504;
        throw err;
      }

      if (error.statusCode) {
        throw error;
      }

      const err = new Error(error.response?.data?.error || error.message || 'AI review processing failed.');
      err.statusCode = error.response?.status || 500;
      throw err;
    }
  }

  /**
   * AI Follow-up Chat: Answers questions about a specific review without modifying code
   */
  async chatFollowUp({ review, message, chatHistory = [] }) {
    if (process.env.OLLAMA_SIMULATE === 'true') {
      const isWhy = message.toLowerCase().includes('why');
      const isHint = message.toLowerCase().includes('hint') || message.toLowerCase().includes('how');
      let response = `Based on your ${review.programmingLanguage.toUpperCase()} code review: `;

      if (isWhy) {
        response += `This issue occurs because the implementation's state assumptions or boundary checks conflict with standard runtime safety invariants. To prevent it, ensure all input variables are validated and resource lifecycles are explicitly closed.`;
      } else if (isHint) {
        response += `Here is a debugging hint: Try adding an assertion or unit test verifying the edge case where the input collection is empty or null. Check if the loop indices cross each other unexpectedly.`;
      } else {
        response += `The analysis identified an overall score of ${review.overallScore}/100 with ${review.reviewResult?.timeComplexity || 'O(n)'} time complexity. You can optimize this by isolating loop invariants and using idiomatic standard library helpers.`;
      }

      return {
        reply: response,
      };
    }

    const baseUrl = this.getBaseUrl();
    const model = this.getModel();
    const timeoutMs = this.getTimeoutMs();

    const systemPrompt = `You are VIBECRAFT Assistant, an expert AI programming instructor assisting a developer with their code review.
CONTEXT:
Language: ${review.programmingLanguage.toUpperCase()}
Title: ${review.title}
Score: ${review.overallScore}/100
Source Code:
\`\`\`${review.programmingLanguage}
${review.sourceCode}
\`\`\`
Previous Review Findings:
Summary: ${review.reviewResult?.summary || 'Standard review completed.'}
Bugs: ${JSON.stringify(review.reviewResult?.bugsAndErrors || review.reviewResult?.bugs || [])}
Security: ${JSON.stringify(review.reviewResult?.securityAnalysis || {})}
Complexity: ${review.reviewResult?.timeComplexity || 'O(n)'} time, ${review.reviewResult?.spaceComplexity || 'O(1)'} space

INSTRUCTIONS:
1. Answer the developer's question directly, clearly, and educationally.
2. Explain WHY bugs or vulnerabilities occur, and provide step-by-step debugging hints.
3. NEVER rewrite or provide a complete replacement code file for the user.
4. Keep answers focused on teaching the developer how to diagnose and fix the code themselves.`;

    const messages = [{ role: 'system', content: systemPrompt }];

    // Append prior chat history
    chatHistory.slice(-6).forEach((m) => {
      messages.push({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      });
    });

    // Append current user message
    messages.push({ role: 'user', content: message });

    try {
      const response = await axios.post(
        `${baseUrl}/api/chat`,
        {
          model,
          messages,
          stream: false,
          options: { temperature: 0.3 },
        },
        {
          timeout: timeoutMs,
          headers: this.getHeaders(),
        }
      );

      const content = response.data?.message?.content;
      if (!content) throw new Error('Ollama returned empty response.');
      return { reply: content.trim() };
    } catch (error) {
      if (error.code === 'ECONNREFUSED' || error.message.includes('ECONNREFUSED')) {
        const err = new Error(`Ollama runtime offline at ${baseUrl}. Ensure Ollama is running ('ollama serve').`);
        err.statusCode = 503;
        throw err;
      }
      throw error;
    }
  }

  /**
   * Code Comparison: Compares two versions of code, identifying fixes, regressions, and quality deltas
   */
  async compareReviews({ originalCode, revisedCode, originalReview, programmingLanguage = 'python' }) {
    if (process.env.OLLAMA_SIMULATE === 'true') {
      const origLines = originalCode.split('\n').length;
      const revLines = revisedCode.split('\n').length;
      const originalScore = originalReview?.overallScore || 65;
      const hasInjection =
        revisedCode.includes('f"SELECT') ||
        revisedCode.includes("f'SELECT") ||
        revisedCode.includes("WHERE user='{") ||
        revisedCode.includes("WHERE id = '{") ||
        revisedCode.includes("user='{u}'");
      const hasMutableDefault = revisedCode.includes('memo={}') || revisedCode.includes('memo=[]');
      const isImproved = !hasInjection && !hasMutableDefault && revLines >= origLines - 10;
      const newScore = isImproved ? Math.min(100, originalScore + 20) : Math.max(30, originalScore - 15);

      return {
        scoreDelta: newScore - originalScore,
        baseScore: originalScore,
        revisedScore: newScore,
        summary: isImproved
          ? 'The revised code successfully addresses the identified defects, improving safety and algorithmic invariants.'
          : 'The revised code introduces new potential issues or leaves existing flaws unresolved.',
        fixedIssues: isImproved
          ? [
              {
                title: 'Resolved Invariant Hazard',
                explanation: 'Replaced dangerous construct with safe parameters / idioms.',
              },
            ]
          : [],
        newIssues: isImproved
          ? []
          : [
              {
                title: 'Potential Regression',
                severity: 'Medium',
                explanation: 'Revision alters boundary checks without sufficient validation.',
              },
            ],
        qualityEvolution: isImproved
          ? 'Code quality improved. Modularity and defensive programming standards are now respected.'
          : 'Code quality degraded or remains unchanged.',
        recommendations: isImproved
          ? [
              'Add parameterized integration tests to prevent future regressions.',
              'Enforce automated linting for database queries.',
            ]
          : [
              'Review input sanitization guidelines.',
              'Refactor dynamic string construction into prepared statements.',
            ],
      };
    }

    const baseUrl = this.getBaseUrl();
    const model = this.getModel();
    const timeoutMs = this.getTimeoutMs();

    const comparePrompt = `You are a Principal Software Engineer performing a rigorous code diff and evolution review.

LANGUAGE: ${programmingLanguage.toUpperCase()}

ORIGINAL VERSION:
\`\`\`${programmingLanguage}
${originalCode}
\`\`\`

REVISED VERSION:
\`\`\`${programmingLanguage}
${revisedCode}
\`\`\`

ORIGINAL REVIEW FINDINGS:
${JSON.stringify(originalReview?.reviewResult?.bugsAndErrors || originalReview?.reviewResult?.bugs || 'None provided')}

TASK:
1. Compare both versions.
2. Identify which issues from the original version were FIXED.
3. Highlight any NEWLY INTRODUCED errors, bugs, or regressions in the revised code.
4. Explain how code quality, maintainability, and asymptotic complexity evolved.
5. Provide a score delta (integer positive or negative).
6. Provide actionable recommendations for further hardening.

Respond ONLY with a valid JSON object matching this schema:
{
  "scoreDelta": <integer e.g. +15 or -10>,
  "baseScore": <integer 0-100>,
  "revisedScore": <integer 0-100>,
  "summary": "<concise summary of changes and evolution>",
  "fixedIssues": [
    {
      "title": "<title of fixed issue>",
      "explanation": "<how the revised code fixed it>"
    }
  ],
  "newIssues": [
    {
      "title": "<title of new bug or regression>",
      "severity": "<'Critical' | 'High' | 'Medium' | 'Low'>",
      "explanation": "<why this new issue exists in revised code>"
    }
  ],
  "qualityEvolution": "<detailed explanation of changes in readability, maintainability, and complexity>",
  "recommendations": [
    "<actionable suggestion to further harden or refine the code>"
  ]
}`;

    try {
      const response = await axios.post(
        `${baseUrl}/api/chat`,
        {
          model,
          messages: [
            { role: 'system', content: 'You are an expert code comparison auditor. Respond only in valid JSON.' },
            { role: 'user', content: comparePrompt },
          ],
          format: 'json',
          stream: false,
          options: { temperature: 0.15 },
        },
        {
          timeout: timeoutMs,
          headers: this.getHeaders(),
        }
      );

      const content = response.data?.message?.content;
      if (!content) throw new Error('Ollama returned empty response for comparison.');
      const parsed = JSON.parse(content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim());
      return parsed;
    } catch (error) {
      if (error.code === 'ECONNREFUSED' || error.message.includes('ECONNREFUSED')) {
        const err = new Error(`Ollama runtime offline at ${baseUrl}. Ensure Ollama is running ('ollama serve').`);
        err.statusCode = 503;
        throw err;
      }
      throw error;
    }
  }
}

/**
 * OpenAI-Compatible Cloud AI Provider (OpenRouter / Groq / OpenAI)
 * Enables 24/7 cloud inference without running a local Ollama daemon.
 */
class OpenAICompatibleProvider extends OllamaProvider {
  constructor(options = {}) {
    super(options);
    this.name = options.name || 'OpenRouter';
    this.endpoint = options.endpoint || process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1/chat/completions';
    this.apiKey = options.apiKey || process.env.OPENROUTER_API_KEY || process.env.GROQ_API_KEY || '';
    this.model = options.model || process.env.OPENROUTER_MODEL || process.env.GROQ_MODEL || 'openrouter/free';
  }

  getBaseUrl() {
    return this.endpoint;
  }

  getModel() {
    return this.model;
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
      'User-Agent': 'VIBECRAFT-Backend/1.0',
    };
    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey.trim()}`;
    }
    // OpenRouter headers
    headers['HTTP-Referer'] = 'https://vibecraft.vercel.app';
    headers['X-Title'] = 'VIBECRAFT';
    return headers;
  }

  async checkHealth() {
    return {
      provider: this.name,
      online: Boolean(this.apiKey),
      baseUrl: this.endpoint,
      activeModel: this.model,
      mode: 'Cloud 24/7 API',
    };
  }

  async generateReview({ programmingLanguage, sourceCode, reviewMode = 'detailed', reviewInstructions = '' }) {
    if (process.env.OLLAMA_SIMULATE === 'true') {
      return this.generateSimulatedReview({
        programmingLanguage,
        sourceCode,
        reviewMode,
        reviewInstructions,
      });
    }

    const userPrompt = buildStructuredUserPrompt(
      programmingLanguage,
      sourceCode,
      reviewMode,
      reviewInstructions
    );

    try {
      const response = await axios.post(
        this.endpoint,
        {
          model: this.model,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: userPrompt },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.15,
        },
        {
          timeout: this.getTimeoutMs(),
          headers: this.getHeaders(),
        }
      );

      const content = response.data?.choices?.[0]?.message?.content;
      if (!content) {
        const err = new Error(`${this.name} returned an empty response.`);
        err.statusCode = 502;
        throw err;
      }

      let parsed;
      try {
        parsed = JSON.parse(content);
      } catch (parseErr) {
        const cleaned = content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
        try {
          parsed = JSON.parse(cleaned);
        } catch {
          const err = new Error(`AI review model response could not be parsed as valid JSON: ${content.slice(0, 150)}`);
          err.statusCode = 502;
          throw err;
        }
      }

      return this.validateAndNormalizeResponse(parsed);
    } catch (error) {
      if (error.response?.data?.error) {
        const msg = error.response.data.error.message || JSON.stringify(error.response.data.error);
        const err = new Error(`${this.name} API error: ${msg}`);
        err.statusCode = error.response.status || 502;
        throw err;
      }
      throw error;
    }
  }

  async chatFollowUp({ review, message, chatHistory = [] }) {
    const systemPrompt = `You are VIBECRAFT Assistant, a senior code review mentor.
Review context:
- Overall Score: ${review.overallScore}/100
- Quality Level: ${review.reviewResult?.overallAssessment?.qualityLevel}
- Bugs detected: ${(review.reviewResult?.bugsAndErrors || []).map((b) => b.title).join(', ') || 'None'}
- Security flags: ${review.reviewResult?.securityAnalysis?.sqlInjection !== 'None identified' ? 'SQL Injection risk' : 'None'}

Rules:
1. Be concise, technical, and educational.
2. If asked how to fix an issue, provide clear code snippets with explanations.
3. Keep answers focused on teaching the developer how to diagnose and fix the code themselves.`;

    const messages = [{ role: 'system', content: systemPrompt }];
    chatHistory.slice(-6).forEach((m) => {
      messages.push({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      });
    });
    messages.push({ role: 'user', content: message });

    try {
      const response = await axios.post(
        this.endpoint,
        {
          model: this.model,
          messages,
          temperature: 0.3,
        },
        {
          timeout: this.getTimeoutMs(),
          headers: this.getHeaders(),
        }
      );

      const content = response.data?.choices?.[0]?.message?.content;
      if (!content) throw new Error(`${this.name} returned empty response.`);
      return { reply: content.trim() };
    } catch (error) {
      if (error.response?.data?.error) {
        const msg = error.response.data.error.message || JSON.stringify(error.response.data.error);
        const err = new Error(`${this.name} API error: ${msg}`);
        err.statusCode = error.response.status || 502;
        throw err;
      }
      throw error;
    }
  }

  async compareReviews({ originalCode, revisedCode, originalReview, programmingLanguage }) {
    const comparePrompt = `Analyze the evolution between these two code revisions in ${programmingLanguage}:
ORIGINAL CODE:
${originalCode}
REVISED CODE:
${revisedCode}
Return JSON strictly conforming to the requested schema.`;

    try {
      const response = await axios.post(
        this.endpoint,
        {
          model: this.model,
          messages: [
            { role: 'system', content: 'You are an expert code comparison auditor. Respond only in valid JSON.' },
            { role: 'user', content: comparePrompt },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.15,
        },
        {
          timeout: this.getTimeoutMs(),
          headers: this.getHeaders(),
        }
      );

      const content = response.data?.choices?.[0]?.message?.content;
      if (!content) throw new Error(`${this.name} returned empty response for comparison.`);
      const parsed = JSON.parse(content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim());
      return parsed;
    } catch (error) {
      if (error.response?.data?.error) {
        const msg = error.response.data.error.message || JSON.stringify(error.response.data.error);
        const err = new Error(`${this.name} API error: ${msg}`);
        err.statusCode = error.response.status || 502;
        throw err;
      }
      throw error;
    }
  }
}

function resolveActiveProvider() {
  if (process.env.OPENROUTER_API_KEY) {
    return new OpenAICompatibleProvider({
      name: 'OpenRouter',
      endpoint: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1/chat/completions',
      apiKey: process.env.OPENROUTER_API_KEY,
      model: process.env.OPENROUTER_MODEL || 'openrouter/free',
    });
  }
  if (process.env.GROQ_API_KEY) {
    return new OpenAICompatibleProvider({
      name: 'Groq',
      endpoint: 'https://api.groq.com/openai/v1/chat/completions',
      apiKey: process.env.GROQ_API_KEY,
      model: process.env.GROQ_MODEL || 'qwen-2.5-coder-32b',
    });
  }
  return new OllamaProvider();
}

let activeProvider = resolveActiveProvider();

const getAIProvider = () => {
  if (activeProvider.name === 'Ollama' && (process.env.OPENROUTER_API_KEY || process.env.GROQ_API_KEY)) {
    activeProvider = resolveActiveProvider();
  }
  return activeProvider;
};
const setAIProvider = (providerInstance) => { activeProvider = providerInstance; };

module.exports = {
  BaseAIProvider,
  OllamaProvider,
  OpenAICompatibleProvider,
  getAIProvider,
  setAIProvider,
};
