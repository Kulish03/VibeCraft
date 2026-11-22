const http = require('http');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: 'C:/Users/kulis/.gemini/antigravity/scratch/ai-code-reviewer/backend/.env' });
process.env.OLLAMA_SIMULATE = 'true';

const {
  buildStructuredUserPrompt,
  SYSTEM_PROMPT,
  LANGUAGE_GUIDELINES,
  MODE_DIRECTIVES,
} = require('../src/services/promptTemplates');
const { getAIProvider, OllamaProvider } = require('../src/services/aiProvider');
const app = require('../src/app');
const User = require('../src/models/User');
const CodeReview = require('../src/models/CodeReview');

const TEST_PORT = 5058;
const BASE_URL = `http://127.0.0.1:${TEST_PORT}`;

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const payload = body ? JSON.stringify(body) : null;
    if (payload) headers['Content-Length'] = Buffer.byteLength(payload);

    const req = http.request(url, { method, headers }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

let passed = 0;
let failed = 0;

function assert(condition, name) {
  if (condition) {
    console.log(`  [PASS] ${name}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${name}`);
    failed++;
  }
}

async function runStructuredEngineTests() {
  console.log('\n============================================================');
  console.log(' VIBECRAFT 7-Section Structured AI Review Engine Test Suite');
  console.log('============================================================\n');

  // --- 1. Reusable Prompt Templates for Each Language ---
  console.log('--- 1. Reusable Language-Specific Prompt Templates ---');
  ['cpp', 'java', 'python', 'javascript'].forEach((lang) => {
    const prompt = buildStructuredUserPrompt(lang, 'void example() {}', 'detailed', 'Check safety');
    assert(
      prompt.includes(lang.toUpperCase()) && prompt.includes('USER CUSTOM INSTRUCTIONS'),
      `Prompt template correctly built for ${lang.toUpperCase()}`
    );
  });
  assert(LANGUAGE_GUIDELINES.cpp.includes('smart pointers') && LANGUAGE_GUIDELINES.cpp.includes('buffer overruns'), 'C++ guidelines cover RAII and buffer safety');
  assert(LANGUAGE_GUIDELINES.java.includes('NullPointerExceptions') && LANGUAGE_GUIDELINES.java.includes('try-with-resources'), 'Java guidelines cover null-safety and resource lifecycle');
  assert(LANGUAGE_GUIDELINES.python.includes('mutable default') && LANGUAGE_GUIDELINES.python.includes('PEP 8'), 'Python guidelines cover mutable defaults and idioms');
  assert(LANGUAGE_GUIDELINES.javascript.includes('ES6+') && LANGUAGE_GUIDELINES.javascript.includes('Cross-Site Scripting'), 'JavaScript guidelines cover async and XSS');

  // --- 2. Review Mode Directives ---
  console.log('\n--- 2. Review Mode Selector Directives ---');
  const modes = ['basic', 'detailed', 'security', 'performance'];
  modes.forEach((mode) => {
    assert(typeof MODE_DIRECTIVES[mode] === 'string', `Review mode '${mode}' configured with dedicated directives`);
  });

  // --- 3. Important AI Behavior Constraints in System Prompt ---
  console.log('\n--- 3. Pedagogical & Security Constraints ---');
  assert(SYSTEM_PROMPT.includes('NEVER INVENT BUGS'), 'Enforces constraint: Never invent bugs on valid code');
  assert(SYSTEM_PROMPT.includes('NO FULL REWRITTEN SOLUTIONS'), 'Enforces constraint: Never provide full rewritten solution by default');
  assert(SYSTEM_PROMPT.includes('EDUCATIONAL GUIDANCE'), 'Enforces constraint: Teach developer how to identify and fix issues');
  assert(SYSTEM_PROMPT.includes('HANDLING INCOMPLETE CODE'), 'Enforces constraint: Mention uncertainty when code is incomplete');
  assert(SYSTEM_PROMPT.includes('NO EXECUTION CLAIMS'), 'Enforces constraint: Never claim code was executed or run dynamically');

  // --- 4. Testing Correct Programs (Clean, sound code) ---
  console.log('\n--- 4. Correct Programs Verification (Zero False Positives) ---');
  const provider = getAIProvider();
  
  const correctPythonCode = `def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = left + (right - left) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1`;

  const cleanReview = await provider.generateReview({
    programmingLanguage: 'python',
    sourceCode: correctPythonCode,
    reviewMode: 'detailed',
  });

  assert(cleanReview.overallScore >= 90, 'Correct program receives high score (>= 90)');
  assert(cleanReview.reviewResult.overallAssessment.qualityLevel === 'Excellent', 'Quality level identified as Excellent');
  assert(cleanReview.reviewResult.bugsAndErrors.length === 0, 'No bugs fabricated for sound binary search algorithm');
  assert(cleanReview.reviewResult.securityAnalysis.sqlInjection === 'None identified', 'No false security vulnerabilities reported');
  assert(cleanReview.reviewResult.complexityAnalysis.timeComplexity === 'O(log n)', 'Asymptotic time complexity correctly calculated as O(log n)');

  // --- 5. Testing Intentionally Incorrect Programs ---
  console.log('\n--- 5. Intentionally Incorrect Programs (Detection & Education) ---');
  
  // Test program with mutable default & SQL injection
  const flawedPythonCode = `import sqlite3
def get_user_records(user_id, memo={}):
    query = f"SELECT * FROM users WHERE id = '{user_id}'"
    return query`;

  const flawedReview = await provider.generateReview({
    programmingLanguage: 'python',
    sourceCode: flawedPythonCode,
    reviewMode: 'security',
    reviewInstructions: 'Focus on injection risks and mutable default arguments',
  });

  assert(flawedReview.overallScore < 60, 'Flawed program receives appropriately penalized score (< 60)');
  assert(flawedReview.reviewResult.overallAssessment.qualityLevel === 'Critical Issues', 'Quality level flagged as Critical Issues');
  assert(flawedReview.reviewResult.bugsAndErrors.length > 0, 'Accurately detected intentional defect');
  
  // Check that Section 2 (Bugs and Errors) has all required schema fields
  const bug = flawedReview.reviewResult.bugsAndErrors[0];
  assert(bug.title && bug.category && bug.severity && bug.explanation && bug.debuggingHint, 'Bug report contains Title, Category, Severity, Explanation, and Debugging Hint');
  
  // Check Section 3 (Security Analysis)
  assert(flawedReview.reviewResult.securityAnalysis.sqlInjection.toLowerCase().includes('critical') || flawedReview.reviewResult.securityAnalysis.sqlInjection.toLowerCase().includes('sql'), 'Security analysis flags SQL Injection risk');

  // Check Section 7 (Learning Assistance & Non-Rewrite Example)
  const learn = flawedReview.reviewResult.learningAssistance;
  assert(learn.whyIssuesOccur.length > 0, 'Section 7 explains why the defect occurs');
  assert(learn.stepByStepDebugging.length > 0, 'Section 7 provides step-by-step debugging walkthrough');
  assert(learn.illustrativeExamples.length > 0 && learn.illustrativeExamples[0].antiPattern && learn.illustrativeExamples[0].improvedPattern, 'Section 7 illustrates anti-pattern vs improved pattern without full rewrite');

  // --- 6. End-to-End API Integration & MongoDB Persistence ---
  console.log('\n--- 6. End-to-End REST API Submission & Persistence ---');
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai_code_reviewer';
  await mongoose.connect(mongoUri);

  const server = app.listen(TEST_PORT);
  const testUser = {
    name: 'Pipeline Architect',
    email: `pipeline_test_${Date.now()}@test.io`,
    password: 'password123',
  };

  try {
    // Register user
    const regRes = await request('POST', '/api/auth/register', testUser);
    const token = regRes.body.token;

    // Test rejection of empty code
    const emptyRes = await request('POST', '/api/reviews', { programmingLanguage: 'cpp', sourceCode: '   ' }, token);
    assert(emptyRes.status === 400, 'POST /api/reviews rejects empty code with 400');

    // Test successful submission with Review Mode
    const submitRes = await request(
      'POST',
      '/api/reviews',
      {
        title: 'Binary Search Audit Session',
        programmingLanguage: 'python',
        reviewMode: 'detailed',
        sourceCode: correctPythonCode,
        reviewInstructions: 'Verify loop invariants',
      },
      token
    );
    assert(submitRes.status === 201 && submitRes.body.review.reviewMode === 'detailed', 'POST /api/reviews accepts and persists reviewMode');
    
    const reviewId = submitRes.body.review._id;
    const resResult = submitRes.body.review.reviewResult;

    // Validate that all 7 sections exist in MongoDB response
    assert(typeof resResult.overallAssessment === 'object', 'Section 1: overallAssessment persisted');
    assert(Array.isArray(resResult.bugsAndErrors), 'Section 2: bugsAndErrors persisted');
    assert(typeof resResult.securityAnalysis === 'object', 'Section 3: securityAnalysis persisted');
    assert(typeof resResult.codeQuality === 'object', 'Section 4: codeQuality persisted');
    assert(typeof resResult.performanceAnalysis === 'object', 'Section 5: performanceAnalysis persisted');
    assert(typeof resResult.complexityAnalysis === 'object', 'Section 6: complexityAnalysis persisted');
    assert(typeof resResult.learningAssistance === 'object', 'Section 7: learningAssistance persisted');

    // Fetch review by ID
    const fetchRes = await request('GET', `/api/reviews/${reviewId}`, null, token);
    assert(fetchRes.status === 200 && fetchRes.body.review._id === reviewId, 'GET /api/reviews/:id retrieves saved 7-section review');

    // Delete review
    const delRes = await request('DELETE', `/api/reviews/${reviewId}`, null, token);
    assert(delRes.status === 200, 'DELETE /api/reviews/:id deletes review cleanly');

  } finally {
    await User.deleteMany({ email: testUser.email });
    await CodeReview.deleteMany({ title: 'Binary Search Audit Session' });
    server.close();
    await mongoose.connection.close();
  }

  console.log('\n============================================================');
  console.log(` Test Summary: ${passed} passed, ${failed} failed`);
  console.log('============================================================\n');

  if (failed > 0) process.exit(1);
  else process.exit(0);
}

runStructuredEngineTests().catch((err) => {
  console.error('[Structured Engine Test Error]:', err);
  process.exit(1);
});
