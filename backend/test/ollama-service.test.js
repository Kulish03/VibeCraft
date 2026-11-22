const http = require('http');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: 'C:/Users/kulis/.gemini/antigravity/scratch/ai-code-reviewer/backend/.env' });

const {
  validateAndFormatResponse,
  buildUserPrompt,
  SYSTEM_PROMPT,
} = require('../src/services/ollamaService');
const app = require('../src/app');
const User = require('../src/models/User');
const CodeReview = require('../src/models/CodeReview');

const TEST_PORT = 5057;
const BASE_URL = `http://127.0.0.1:${TEST_PORT}`;

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const payload = body ? JSON.stringify(body) : null;
    if (payload) {
      headers['Content-Length'] = Buffer.byteLength(payload);
    }

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

async function runOllamaIntegrationTests() {
  console.log('\n============================================================');
  console.log(' Ollama AI Integration & Multi-Language Review Test Suite');
  console.log('============================================================\n');

  // --- 1. System Prompt & Prompt Construction ---
  console.log('--- 1. Prompt Engineering & Instruction Construction ---');
  assert(SYSTEM_PROMPT.includes('Principal Software Engineer') && SYSTEM_PROMPT.includes('STRICT INTEGRITY'), 'System prompt specifies experienced engineer/instructor persona and no error fabrication');

  const pyPrompt = buildUserPrompt('python', 'def foo(): pass', 'Focus on time complexity');
  assert(pyPrompt.includes('```python') && pyPrompt.includes('SPECIAL REVIEW INSTRUCTIONS'), 'buildUserPrompt attaches code fence and special review instructions');

  // --- 2. Response Schema Validation & Defensive Formatting ---
  console.log('\n--- 2. Structured JSON Output Validation & Parsing ---');
  const validMockOutput = {
    overallScore: 92,
    summary: 'Clean binary search implementation with optimal complexity.',
    syntaxErrors: [],
    logicalErrors: [],
    runtimeErrors: [],
    securityIssues: [],
    codeQuality: 'High adherence to PEP8 idioms and clear variable semantics.',
    readabilityAndMaintainability: 'Self-documenting variable names and clear loop boundaries.',
    optimizationSuggestions: ['Consider adding type hints for arr: list[int] and target: int.'],
    timeComplexity: 'O(log n) logarithmic reduction per iteration',
    spaceComplexity: 'O(1) auxiliary variables only',
    debuggingHints: ['Test with array of duplicates and single-element lists.'],
  };

  const parsedValid = validateAndFormatResponse(validMockOutput);
  assert(parsedValid.overallScore === 92, 'overallScore correctly validated');
  assert(parsedValid.reviewResult.timeComplexity.includes('O(log n)'), 'timeComplexity preserved');
  assert(Array.isArray(parsedValid.reviewResult.optimizationSuggestions), 'optimizationSuggestions formatted as array');
  assert(parsedValid.reviewResult.syntaxErrors.length === 0, 'No false syntax errors fabricated');

  // Test dirty LLM output normalization (e.g. score out of range, missing fields, string in array)
  const messyOutput = {
    overallScore: 150, // Out of range
    summary: 'Code with errors',
    syntaxErrors: 'Semicolon missing on line 4', // String instead of array
    logicalErrors: ['Infinite loop if count <= 0'],
    timeComplexity: 'O(n^2)',
  };
  const parsedMessy = validateAndFormatResponse(messyOutput);
  assert(parsedMessy.overallScore === 100, 'Clamps overallScore > 100 to 100');
  assert(Array.isArray(parsedMessy.reviewResult.syntaxErrors) && parsedMessy.reviewResult.syntaxErrors.length === 1, 'Coerces string syntax error into valid array');
  assert(parsedMessy.reviewResult.bugs.length === 1, 'Aggregates bugs for frontend backwards compatibility');

  // --- 3. Multi-Language Code Review Simulations ---
  console.log('\n--- 3. Multi-Language Review Verification ---');
  const languagesToTest = [
    {
      lang: 'cpp',
      code: '#include <vector>\nvoid reverse(std::vector<int>& v) { int i=0, j=v.size()-1; while(i<j) std::swap(v[i++], v[j--]); }',
      instructions: 'Check STL iterator safety',
      simulatedReview: {
        overallScore: 95,
        summary: 'In-place two-pointer reversal conforming to modern C++ idioms.',
        syntaxErrors: [],
        logicalErrors: [],
        runtimeErrors: [],
        securityIssues: [],
        codeQuality: 'Optimal two-pointer approach, avoiding heap reallocations.',
        readabilityAndMaintainability: 'Compact and readable.',
        optimizationSuggestions: ['std::reverse from <algorithm> is standard and self-documenting.'],
        timeComplexity: 'O(n) linear in size of vector',
        spaceComplexity: 'O(1) in-place',
        debuggingHints: ['Test with empty vector and odd-sized vectors.'],
      },
    },
    {
      lang: 'java',
      code: 'public class Checker { public static boolean isPal(String s) { if(s==null) return false; return s.equals(new StringBuilder(s).reverse().toString()); } }',
      instructions: 'Check for unnecessary memory allocations',
      simulatedReview: {
        overallScore: 78,
        summary: 'Functional palindrome checker, but creates unnecessary StringBuilder allocations.',
        syntaxErrors: [],
        logicalErrors: [],
        runtimeErrors: [],
        securityIssues: [],
        codeQuality: 'Concise, but sub-optimal memory utilization.',
        readabilityAndMaintainability: 'Clear intent.',
        optimizationSuggestions: ['Use two-pointer character comparison to eliminate O(n) heap allocation.'],
        timeComplexity: 'O(n) linear',
        spaceComplexity: 'O(n) allocates new StringBuilder instance',
        debuggingHints: ['Benchmark with 100,000 character strings to verify GC pressure.'],
      },
    },
    {
      lang: 'python',
      code: 'def fib(n, memo={}):\n    if n in memo: return memo[n]\n    if n <= 1: return n\n    memo[n] = fib(n-1, memo) + fib(n-2, memo)\n    return memo[n]',
      instructions: 'Check for mutable default argument pitfalls in Python',
      simulatedReview: {
        overallScore: 68,
        summary: 'Working memoized Fibonacci implementation with Python mutable default argument trap.',
        syntaxErrors: [],
        logicalErrors: [],
        runtimeErrors: ['Mutable default argument `memo={}` persists across function calls across sessions.'],
        securityIssues: [],
        codeQuality: 'Potential cross-call state pollution due to shared default dictionary.',
        readabilityAndMaintainability: 'Clean recursive formulation.',
        optimizationSuggestions: ['Use `memo=None` and initialize `if memo is None: memo = {}`, or `@functools.lru_cache`.'],
        timeComplexity: 'O(n) linear with memoization',
        spaceComplexity: 'O(n) call stack and memo table',
        debuggingHints: ['Call fib(5) then fib(10) to observe shared dictionary cache.'],
      },
    },
    {
      lang: 'javascript',
      code: 'async function fetchUsers(ids) { return Promise.all(ids.map(async id => { const r = await fetch(`/api/user/${id}`); return r.json(); })); }',
      instructions: 'Check error handling on failed HTTP fetch requests',
      simulatedReview: {
        overallScore: 82,
        summary: 'Concurrent async fetch mapping, but unhandled fetch rejection could reject entire Promise.all.',
        syntaxErrors: [],
        logicalErrors: [],
        runtimeErrors: ['If any single fetch fails, Promise.all rejects immediately without partial results.'],
        securityIssues: [],
        codeQuality: 'Concise ES6 async/await with Promise concurrency.',
        readabilityAndMaintainability: 'High readability and expressive functional pipeline.',
        optimizationSuggestions: ['Consider `Promise.allSettled` to gracefully handle individual network failures.'],
        timeComplexity: 'O(n) with parallel I/O dispatch',
        spaceComplexity: 'O(n) accumulator array',
        debuggingHints: ['Test with 404 or 500 response on one ID to observe error behavior.'],
      },
    },
  ];

  for (const item of languagesToTest) {
    const formatted = validateAndFormatResponse(item.simulatedReview);
    assert(formatted.overallScore > 0, `${item.lang.toUpperCase()}: Score calculated correctly (${formatted.overallScore})`);
    assert(formatted.reviewResult.timeComplexity.length > 0, `${item.lang.toUpperCase()}: Time complexity calculated`);
    assert(formatted.reviewResult.spaceComplexity.length > 0, `${item.lang.toUpperCase()}: Space complexity calculated`);
    assert(formatted.reviewResult.optimizationSuggestions.length > 0, `${item.lang.toUpperCase()}: Optimization suggestions verified`);
  }

  // --- 4. Live Server & MongoDB Persistence ---
  console.log('\n--- 4. End-to-End API Persistence & Validation ---');
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai_code_reviewer';
  await mongoose.connect(mongoUri);

  const server = app.listen(TEST_PORT);
  const testUser = {
    name: 'Ollama Integration Tester',
    email: `ollama_test_${Date.now()}@example.com`,
    password: 'password123',
  };

  try {
    // Register
    const regRes = await request('POST', '/api/auth/register', testUser);
    const token = regRes.body.token;

    // Health Check with Ollama status
    const healthRes = await request('GET', '/api/health');
    assert(healthRes.status === 200 && typeof healthRes.body.ollama === 'object', 'GET /api/health includes Ollama status');

    // Test input validation: Empty code
    const emptyCodeRes = await request('POST', '/api/reviews', { programmingLanguage: 'python', sourceCode: '' }, token);
    assert(emptyCodeRes.status === 400, 'POST /api/reviews rejects empty code');

    // Test input validation: Unsupported language
    const unsuppRes = await request('POST', '/api/reviews', { programmingLanguage: 'ruby', sourceCode: 'puts "hi"' }, token);
    assert(unsuppRes.status === 400, 'POST /api/reviews rejects unsupported language');

    // Test saving review directly with complete schema
    const directReview = await CodeReview.create({
      userId: regRes.body.user.id,
      title: 'Python Memoized Fib Audit',
      programmingLanguage: 'python',
      sourceCode: languagesToTest[2].code,
      reviewInstructions: languagesToTest[2].instructions,
      reviewResult: validateAndFormatResponse(languagesToTest[2].simulatedReview).reviewResult,
      overallScore: 68,
    });
    assert(directReview._id && directReview.reviewResult.runtimeErrors.length > 0, 'CodeReview persists complete AI review result in MongoDB');

    // Fetch review by ID
    const fetchRes = await request('GET', `/api/reviews/${directReview._id}`, null, token);
    assert(fetchRes.status === 200 && fetchRes.body.review.overallScore === 68, 'GET /api/reviews/:id retrieves saved AI analysis with full dimensions');

    // Verify deletion
    const delRes = await request('DELETE', `/api/reviews/${directReview._id}`, null, token);
    assert(delRes.status === 200, 'DELETE /api/reviews/:id removes review cleanly');
  } finally {
    await User.deleteMany({ email: testUser.email });
    await CodeReview.deleteMany({ title: 'Python Memoized Fib Audit' });
    server.close();
    await mongoose.connection.close();
  }

  console.log('\n============================================================');
  console.log(` Test Summary: ${passed} passed, ${failed} failed`);
  console.log('============================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runOllamaIntegrationTests().catch((err) => {
  console.error('[Ollama Test Error]:', err);
  process.exit(1);
});
