const http = require('http');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: 'C:/Users/kulis/.gemini/antigravity/scratch/ai-code-reviewer/backend/.env' });
process.env.OLLAMA_SIMULATE = 'true';

const app = require('../src/app');
const User = require('../src/models/User');
const CodeReview = require('../src/models/CodeReview');

const TEST_PORT = 5055;
const BASE_URL = `http://127.0.0.1:${TEST_PORT}`;

// Helper function to make HTTP requests
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

    const req = http.request(
      url,
      {
        method,
        headers,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          let parsed;
          try {
            parsed = JSON.parse(data);
          } catch {
            parsed = data;
          }
          resolve({ status: res.statusCode, body: parsed });
        });
      }
    );

    req.on('error', reject);
    if (payload) {
      req.write(payload);
    }
    req.end();
  });
}

// Simple test runner
let passedTests = 0;
let failedTests = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  [PASS] ${testName}`);
    passedTests++;
  } else {
    console.error(`  [FAIL] ${testName}`);
    failedTests++;
  }
}

async function runTests() {
  console.log('\n============================================================');
  console.log(' Starting End-to-End API and MongoDB Integration Tests');
  console.log('============================================================\n');

  // 1. Connect Mongoose to local MongoDB
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai_code_reviewer';
  await mongoose.connect(mongoUri);
  console.log(`[DB] Connected to MongoDB at: ${mongoUri}`);

  // 2. Clean previous test artifacts
  const testEmailA = `test_architect_a_${Date.now()}@example.com`;
  const testEmailB = `test_architect_b_${Date.now()}@example.com`;
  await User.deleteMany({ email: { $in: [testEmailA, testEmailB] } });

  // 3. Start test HTTP server
  const server = app.listen(TEST_PORT);
  console.log(`[Server] Test server listening on ${BASE_URL}\n`);

  try {
    // --- Health Check ---
    console.log('--- 1. System Health ---');
    const healthRes = await request('GET', '/api/health');
    assert(healthRes.status === 200 && healthRes.body.success === true, 'GET /api/health returns 200 OK');

    // --- User Registration & Validation ---
    console.log('\n--- 2. User Registration ---');
    const regRes = await request('POST', '/api/auth/register', {
      name: 'Senior Architect',
      email: testEmailA,
      password: 'securePassword123',
    });
    assert(regRes.status === 201 && regRes.body.token && regRes.body.user.email === testEmailA, 'POST /api/auth/register creates user and returns JWT');
    const tokenA = regRes.body.token;

    // Test duplicate registration
    const dupRes = await request('POST', '/api/auth/register', {
      name: 'Duplicate User',
      email: testEmailA,
      password: 'securePassword123',
    });
    assert(dupRes.status === 409 && dupRes.body.success === false, 'POST /api/auth/register rejects duplicate email with 409');

    // Test registration validation (short password)
    const invalidReg = await request('POST', '/api/auth/register', {
      name: 'Invalid',
      email: 'invalid@example.com',
      password: '123',
    });
    assert(invalidReg.status === 400, 'POST /api/auth/register validates minimum password length with 400');

    // --- User Login ---
    console.log('\n--- 3. User Authentication ---');
    const loginRes = await request('POST', '/api/auth/login', {
      email: testEmailA,
      password: 'securePassword123',
    });
    assert(loginRes.status === 200 && loginRes.body.token, 'POST /api/auth/login authenticates with valid credentials');

    const wrongLogin = await request('POST', '/api/auth/login', {
      email: testEmailA,
      password: 'incorrectPassword',
    });
    assert(wrongLogin.status === 401, 'POST /api/auth/login rejects wrong password with 401');

    // --- Current User Profile ---
    console.log('\n--- 4. Current User Profile ---');
    const meRes = await request('GET', '/api/auth/me', null, tokenA);
    assert(meRes.status === 200 && meRes.body.user.email === testEmailA, 'GET /api/auth/me returns authenticated user details');

    const unauthMe = await request('GET', '/api/auth/me');
    assert(unauthMe.status === 401, 'GET /api/auth/me rejects unauthenticated request with 401');

    // --- Submit Code Reviews ---
    console.log('\n--- 5. Code Review Submission ---');
    // Test unauthenticated submission
    const unauthReview = await request('POST', '/api/reviews', {
      programmingLanguage: 'python',
      sourceCode: 'print("hello world")',
    });
    assert(unauthReview.status === 401, 'POST /api/reviews rejects submission without JWT with 401');

    // Test Python submission
    const pyReviewRes = await request(
      'POST',
      '/api/reviews',
      {
        title: 'Binary Search Implementation',
        programmingLanguage: 'python',
        sourceCode: 'def binary_search(arr, x):\n    low = 0\n    high = len(arr) - 1\n    while low <= high:\n        mid = (high + low) // 2\n        if arr[mid] < x:\n            low = mid + 1\n        elif arr[mid] > x:\n            high = mid - 1\n        else:\n            return mid\n    return -1',
        overallScore: 92,
      },
      tokenA
    );
    assert(pyReviewRes.status === 201 && pyReviewRes.body.review.programmingLanguage === 'python', 'POST /api/reviews creates Python review with 201');
    const pyReviewId = pyReviewRes.body.review._id;

    // Verify all 8 reviewResult dimensions
    const rr = pyReviewRes.body.review.reviewResult;
    const hasAllDimensions =
      Array.isArray(rr.bugs) &&
      Array.isArray(rr.logicalErrors) &&
      Array.isArray(rr.securityIssues) &&
      typeof rr.codeQuality !== 'undefined' &&
      Array.isArray(rr.optimizationSuggestions) &&
      typeof rr.timeComplexity === 'string' &&
      typeof rr.spaceComplexity === 'string' &&
      Array.isArray(rr.debuggingHints);
    assert(hasAllDimensions, 'ReviewResult contains all 8 required analytical dimensions');

    // Test C++ submission
    const cppReviewRes = await request(
      'POST',
      '/api/reviews',
      {
        title: 'Vector Sorting Function',
        programmingLanguage: 'cpp',
        sourceCode: '#include <vector>\n#include <algorithm>\nvoid sortVec(std::vector<int>& v) { std::sort(v.begin(), v.end()); }',
      },
      tokenA
    );
    assert(cppReviewRes.status === 201 && cppReviewRes.body.review.programmingLanguage === 'cpp', 'POST /api/reviews creates C++ review');

    // Test unsupported language rejection
    const invalidLangRes = await request(
      'POST',
      '/api/reviews',
      {
        programmingLanguage: 'rust',
        sourceCode: 'fn main() { println!("hi"); }',
      },
      tokenA
    );
    assert(invalidLangRes.status === 400, 'POST /api/reviews rejects unsupported language with 400');

    // Test empty source code rejection
    const emptyCodeRes = await request(
      'POST',
      '/api/reviews',
      {
        programmingLanguage: 'javascript',
        sourceCode: '   ',
      },
      tokenA
    );
    assert(emptyCodeRes.status === 400, 'POST /api/reviews rejects empty source code with 400');

    // --- Fetch Review History ---
    console.log('\n--- 6. Review History & Filtering ---');
    const historyRes = await request('GET', '/api/reviews', null, tokenA);
    assert(historyRes.status === 200 && historyRes.body.count >= 2, 'GET /api/reviews returns review history list');

    // Filter by language
    const langFilterRes = await request('GET', '/api/reviews?language=python', null, tokenA);
    assert(
      langFilterRes.status === 200 &&
        langFilterRes.body.reviews.every((r) => r.programmingLanguage === 'python'),
      'GET /api/reviews?language=python filters results strictly by language'
    );

    // --- Fetch Particular Review ---
    console.log('\n--- 7. Fetch Particular Review by ID ---');
    const singleReviewRes = await request('GET', `/api/reviews/${pyReviewId}`, null, tokenA);
    assert(singleReviewRes.status === 200 && singleReviewRes.body.review._id === pyReviewId, 'GET /api/reviews/:id returns single review details');

    const invalidIdRes = await request('GET', '/api/reviews/not-a-valid-objectid', null, tokenA);
    assert(invalidIdRes.status === 400, 'GET /api/reviews/:id handles malformed ObjectId with 400');

    // --- Multi-User Ownership & Authorization Guard ---
    console.log('\n--- 8. Multi-User Authorization & Security ---');
    const regUserB = await request('POST', '/api/auth/register', {
      name: 'Second User',
      email: testEmailB,
      password: 'passwordUserB123',
    });
    const tokenB = regUserB.body.token;

    // User B tries to view User A's review -> 403 Forbidden
    const crossAccess = await request('GET', `/api/reviews/${pyReviewId}`, null, tokenB);
    assert(crossAccess.status === 403, 'User B cannot access User A review (403 Forbidden)');

    // User B tries to delete User A's review -> 403 Forbidden
    const crossDelete = await request('DELETE', `/api/reviews/${pyReviewId}`, null, tokenB);
    assert(crossDelete.status === 403, 'User B cannot delete User A review (403 Forbidden)');

    // --- Delete Review ---
    console.log('\n--- 9. Delete Review ---');
    const deleteRes = await request('DELETE', `/api/reviews/${pyReviewId}`, null, tokenA);
    assert(deleteRes.status === 200, 'DELETE /api/reviews/:id deletes review by owner');

    // Verify it is gone
    const verifyDeleted = await request('GET', `/api/reviews/${pyReviewId}`, null, tokenA);
    assert(verifyDeleted.status === 404, 'GET /api/reviews/:id returns 404 for deleted review');

  } finally {
    // Cleanup test users and reviews created in this run
    console.log('\n--- 10. Database Clean-up ---');
    await User.deleteMany({ email: { $in: [testEmailA, testEmailB] } });
    await CodeReview.deleteMany({ title: { $in: ['Binary Search Implementation', 'Vector Sorting Function'] } });
    console.log('[DB] Test documents cleaned successfully.');

    // Close connections
    server.close();
    await mongoose.connection.close();
  }

  console.log('\n============================================================');
  console.log(` Test Summary: ${passedTests} passed, ${failedTests} failed`);
  console.log('============================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch((err) => {
  console.error('[Test Execution Error]:', err);
  process.exit(1);
});
