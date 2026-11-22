const http = require('http');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: 'C:/Users/kulis/.gemini/antigravity/scratch/ai-code-reviewer/backend/.env' });
process.env.OLLAMA_SIMULATE = 'true';

const app = require('../src/app');
const User = require('../src/models/User');
const CodeReview = require('../src/models/CodeReview');

const TEST_PORT = 5059;
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

async function runAdvancedFeaturesTests() {
  console.log('\n============================================================');
  console.log(' VIBECRAFT Advanced Features & Multi-Filter Test Suite');
  console.log('============================================================\n');

  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai_code_reviewer';
  await mongoose.connect(mongoUri);

  const server = app.listen(TEST_PORT);

  const primaryUser = {
    name: 'Advanced Feature Lead',
    email: `adv_lead_${Date.now()}@test.io`,
    password: 'password123',
  };

  const secondaryUser = {
    name: 'Unauthorized Peer',
    email: `peer_${Date.now()}@test.io`,
    password: 'password123',
  };

  try {
    // 1. Setup authenticated users
    console.log('--- 1. User Setup & Authentication ---');
    const regRes1 = await request('POST', '/api/auth/register', primaryUser);
    const token1 = regRes1.body.token;
    assert(token1, 'Primary user registered and received JWT');

    const regRes2 = await request('POST', '/api/auth/register', secondaryUser);
    const token2 = regRes2.body.token;
    assert(token2, 'Secondary user registered and received JWT');

    // 2. Submit initial reviews across languages and modes
    console.log('\n--- 2. Submitting Reviews with Various Modes & Languages ---');
    
    // Python Security Review
    const pyReviewRes = await request('POST', '/api/reviews', {
      title: 'Legacy Python Auth Handler',
      programmingLanguage: 'python',
      reviewMode: 'security',
      sourceCode: `import sqlite3
def check_creds(u, p):
    query = f"SELECT * FROM users WHERE user='{u}' AND pass='{p}'"
    return query`,
      reviewInstructions: 'Check for injection vulnerabilities',
    }, token1);
    assert(pyReviewRes.status === 201, 'Python security review submitted');
    const pyReview = pyReviewRes.body.review;

    // JavaScript Performance Review
    const jsReviewRes = await request('POST', '/api/reviews', {
      title: 'Array Search Loop Optimization',
      programmingLanguage: 'javascript',
      reviewMode: 'performance',
      sourceCode: `function findDuplicates(arr) {
  let dupes = [];
  for(let i=0; i<arr.length; i++) {
    for(let j=i+1; j<arr.length; j++) {
      if(arr[i] === arr[j]) dupes.push(arr[i]);
    }
  }
  return dupes;
}`,
      reviewInstructions: 'Analyze nested loop complexity',
    }, token1);
    assert(jsReviewRes.status === 201, 'JavaScript performance review submitted');
    const jsReview = jsReviewRes.body.review;

    // C++ Basic Review
    const cppReviewRes = await request('POST', '/api/reviews', {
      title: 'Vector Pointer Routine',
      programmingLanguage: 'cpp',
      reviewMode: 'basic',
      sourceCode: `#include <vector>
void compute(int n) {
  std::vector<int> v(n, 42);
}`,
      reviewInstructions: 'Basic sanity check',
    }, token1);
    assert(cppReviewRes.status === 201, 'C++ basic review submitted');
    const cppReview = cppReviewRes.body.review;

    // 3. Multi-dimensional Review History Filtering
    console.log('\n--- 3. Review History Multi-dimensional Filtering ---');
    
    // Filter by language=python
    const pyFilterRes = await request('GET', '/api/reviews?language=python', null, token1);
    assert(pyFilterRes.status === 200, 'GET /api/reviews?language=python succeeds');
    assert(
      pyFilterRes.body.reviews.every((r) => r.programmingLanguage === 'python'),
      'All filtered reviews have programmingLanguage === "python"'
    );
    assert(pyFilterRes.body.reviews.length >= 1, 'Found at least 1 Python review');

    // Filter by mode=security
    const modeFilterRes = await request('GET', '/api/reviews?mode=security', null, token1);
    assert(modeFilterRes.status === 200, 'GET /api/reviews?mode=security succeeds');
    assert(
      modeFilterRes.body.reviews.every((r) => r.reviewMode === 'security'),
      'All filtered reviews have reviewMode === "security"'
    );

    // Filter by date=today
    const dateTodayRes = await request('GET', '/api/reviews?date=today', null, token1);
    assert(dateTodayRes.status === 200, 'GET /api/reviews?date=today succeeds');
    assert(dateTodayRes.body.reviews.length >= 3, 'Today date filter includes all newly submitted reviews');

    // Combined filter: language=javascript & mode=performance
    const combinedFilterRes = await request('GET', '/api/reviews?language=javascript&mode=performance', null, token1);
    assert(combinedFilterRes.status === 200, 'GET /api/reviews with combined language and mode succeeds');
    assert(
      combinedFilterRes.body.reviews.length === 1 && combinedFilterRes.body.reviews[0].programmingLanguage === 'javascript',
      'Combined query correctly returned exact match'
    );

    // Keyword search filter
    const searchRes = await request('GET', '/api/reviews?search=Duplicates', null, token1);
    assert(searchRes.status === 200 && searchRes.body.reviews.length >= 1, 'Keyword search filter matches title/content');

    // 4. Review Insights Analytics
    console.log('\n--- 4. Review Insights Aggregation Endpoint ---');
    const insightsRes = await request('GET', '/api/reviews/insights', null, token1);
    assert(insightsRes.status === 200, 'GET /api/reviews/insights responds with 200 OK');
    const insights = insightsRes.body.insights;
    assert(insights.totalReviews >= 3, `Insights reflects accurate total reviews: ${insights.totalReviews}`);
    assert(typeof insights.averageScore === 'number' && insights.averageScore > 0, `Average score calculated: ${insights.averageScore}`);
    assert(insights.issuesBySeverity && typeof insights.issuesBySeverity.Critical === 'number', 'Severity breakdown includes Critical count');
    assert(typeof insights.issuesBySeverity.High === 'number', 'Severity breakdown includes High count');
    assert(typeof insights.issuesBySeverity.Medium === 'number', 'Severity breakdown includes Medium count');
    assert(typeof insights.issuesBySeverity.Low === 'number', 'Severity breakdown includes Low count');
    assert(insights.languageDistribution && insights.languageDistribution.python >= 1, 'Language distribution includes Python count');
    assert(insights.languageDistribution.javascript >= 1, 'Language distribution includes JavaScript count');
    assert(insights.languageDistribution.cpp >= 1, 'Language distribution includes C++ count');
    assert(Array.isArray(insights.activityOverTime) && insights.activityOverTime.length > 0, 'Activity timeline has date-stamped records');

    // 5. Code Comparison Feature
    console.log('\n--- 5. Code Comparison (Version Diff & Regression Detection) ---');
    
    // Compare snippet to snippet
    const compareSnippetRes = await request('POST', '/api/reviews/compare', {
      originalCode: `def get_val(d, k):\n    return d[k]`,
      revisedCode: `def get_val(d, k, default=None):\n    return d.get(k, default)`,
      programmingLanguage: 'python',
    }, token1);

    assert(compareSnippetRes.status === 200, 'POST /api/reviews/compare succeeds with direct snippets');
    const comp1 = compareSnippetRes.body.comparison;
    assert(typeof comp1.scoreDelta === 'number', `Score delta computed: ${comp1.scoreDelta}`);
    assert(comp1.qualityEvolution, `Quality evolution narrative provided: ${comp1.qualityEvolution}`);
    assert(Array.isArray(comp1.fixedIssues), 'Fixed issues is an array');
    assert(Array.isArray(comp1.newIssues), 'New/regressed issues is an array');
    assert(Array.isArray(comp1.recommendations), 'Actionable recommendations provided');

    // Compare saved review against revised draft
    const compareSavedRes = await request('POST', '/api/reviews/compare', {
      baseReviewId: pyReview._id,
      revisedCode: `import sqlite3
def check_creds_safe(u, p, conn):
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE user=? AND pass=?", (u, p))
    return cursor.fetchone()`,
      programmingLanguage: 'python',
    }, token1);

    assert(compareSavedRes.status === 200, 'POST /api/reviews/compare succeeds with baseReviewId and revised draft');
    const comp2 = compareSavedRes.body.comparison;
    assert(comp2.scoreDelta >= 0, 'Refactored code achieves non-negative score improvement');

    // Authorization check: User 2 cannot compare User 1's private review
    const unauthCompareRes = await request('POST', '/api/reviews/compare', {
      baseReviewId: pyReview._id,
      revisedCode: 'print(1)',
    }, token2);
    assert(unauthCompareRes.status === 403, 'Unauthorized user cannot access another user base review for comparison (403)');

    // 6. AI Follow-up Chat Feature
    console.log('\n--- 6. AI Contextual Follow-up Chat ---');
    
    // Empty message validation
    const emptyChatRes = await request('POST', `/api/reviews/${pyReview._id}/chat`, { message: '  ' }, token1);
    assert(emptyChatRes.status === 400, 'Rejects empty follow-up chat message with 400');

    // Valid follow-up question
    const chatRes1 = await request('POST', `/api/reviews/${pyReview._id}/chat`, {
      message: 'Why is string concatenation inside an SQL query considered unsafe here?',
    }, token1);

    assert(chatRes1.status === 200, 'POST /api/reviews/:id/chat succeeds with 200 OK');
    assert(chatRes1.body.reply && chatRes1.body.reply.length > 20, 'AI returned thoughtful educational reply');
    assert(Array.isArray(chatRes1.body.chatMessages) && chatRes1.body.chatMessages.length === 2, 'Chat thread contains user question and assistant reply');
    assert(chatRes1.body.chatMessages[0].role === 'user', 'First message is role: user');
    assert(chatRes1.body.chatMessages[1].role === 'assistant', 'Second message is role: assistant');

    // Ask second follow-up question in the same review
    const chatRes2 = await request('POST', `/api/reviews/${pyReview._id}/chat`, {
      message: 'Can you show me a step-by-step hint for parameterizing the query without rewriting my whole program?',
    }, token1);
    assert(chatRes2.status === 200, 'Second follow-up chat message processed successfully');
    assert(chatRes2.body.chatMessages.length === 4, 'Chat history persisted sequentially (4 total messages)');

    // Verify in MongoDB that chatMessages actually persisted
    const dbReview = await CodeReview.findById(pyReview._id);
    assert(dbReview.chatMessages.length === 4, 'MongoDB document accurately contains 4 persisted chat messages');

    // Authorization check: User 2 cannot chat on User 1's review
    const unauthChatRes = await request('POST', `/api/reviews/${pyReview._id}/chat`, { message: 'Unauthorized query' }, token2);
    assert(unauthChatRes.status === 403, 'Unauthorized user cannot send chat messages to another user review (403)');

    // 7. Review Deletion & Lifecycle
    console.log('\n--- 7. Review Deletion Lifecycle ---');
    const delRes = await request('DELETE', `/api/reviews/${cppReview._id}`, null, token1);
    assert(delRes.status === 200, 'DELETE /api/reviews/:id deletes review');

    const getDeletedRes = await request('GET', `/api/reviews/${cppReview._id}`, null, token1);
    assert(getDeletedRes.status === 404, 'Subsequent GET of deleted review yields 404 Not Found');

    console.log(`\n============================================================`);
    console.log(` Test Results: ${passed} passed, ${failed} failed`);
    console.log(`============================================================\n`);

  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  } finally {
    server.close();
    await mongoose.connection.close();
    process.exit(failed > 0 ? 1 : 0);
  }
}

runAdvancedFeaturesTests();
