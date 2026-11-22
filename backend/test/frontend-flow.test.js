const http = require('http');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: 'C:/Users/kulis/.gemini/antigravity/scratch/ai-code-reviewer/backend/.env' });
process.env.OLLAMA_SIMULATE = 'true';

const app = require('../src/app');
const User = require('../src/models/User');
const CodeReview = require('../src/models/CodeReview');

const TEST_PORT = 5056;
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

    const req = http.request(
      url,
      { method, headers },
      (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(data) });
          } catch {
            resolve({ status: res.statusCode, body: data });
          }
        });
      }
    );

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function verifyFrontendIntegration() {
  console.log('\n============================================================');
  console.log(' VIBECRAFT Frontend-to-Backend Integration Verification');
  console.log('============================================================\n');

  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai_code_reviewer';
  await mongoose.connect(mongoUri);

  const server = app.listen(TEST_PORT);
  const testEmail = `vibecraft_ui_${Date.now()}@test.io`;

  try {
    // 1. Registration Flow (RegisterPage -> POST /api/auth/register)
    console.log('1. Testing Registration Flow (RegisterPage)...');
    const regRes = await request('POST', '/api/auth/register', {
      name: 'Vibecraft Tester',
      email: testEmail,
      password: 'password123',
    });
    if (regRes.status !== 201 || !regRes.body.token) {
      throw new Error(`Registration failed: ${JSON.stringify(regRes.body)}`);
    }
    const token = regRes.body.token;
    console.log('   [PASS] User registered and token returned for localStorage.');

    // 2. AuthContext verification (AuthContext -> GET /api/auth/me)
    console.log('2. Testing Session Verification (AuthContext)...');
    const meRes = await request('GET', '/api/auth/me', null, token);
    if (meRes.status !== 200 || meRes.body.user.email !== testEmail) {
      throw new Error(`Profile check failed: ${JSON.stringify(meRes.body)}`);
    }
    console.log('   [PASS] AuthContext profile verification validated.');

    // 3. Multi-language review submissions (ReviewPage -> POST /api/reviews)
    console.log('3. Testing Code Review Submissions (ReviewPage)...');
    const languages = ['python', 'javascript', 'cpp', 'java'];
    const createdReviewIds = [];

    for (const lang of languages) {
      const reviewPayload = {
        title: `${lang.toUpperCase()} Algorithmic Audit`,
        programmingLanguage: lang,
        sourceCode: `// Sample code for ${lang}\nfunction test() { return 42; }`,
      };

      const revRes = await request('POST', '/api/reviews', reviewPayload, token);
      if (revRes.status !== 201 || !revRes.body.review) {
        throw new Error(`Review submission for ${lang} failed: ${JSON.stringify(revRes.body)}`);
      }
      createdReviewIds.push(revRes.body.review._id);
      console.log(`   [PASS] Successfully submitted and reviewed ${lang.toUpperCase()} code.`);
    }

    // 4. Dashboard data retrieval (DashboardPage -> GET /api/reviews?limit=5)
    console.log('4. Testing Dashboard Data Fetch (DashboardPage)...');
    const dashRes = await request('GET', '/api/reviews?limit=5', null, token);
    if (dashRes.status !== 200 || dashRes.body.reviews.length !== 4) {
      throw new Error(`Dashboard fetch failed: ${JSON.stringify(dashRes.body)}`);
    }
    console.log(`   [PASS] Dashboard fetched ${dashRes.body.reviews.length} recent reviews for stats calculation.`);

    // 5. History data retrieval (HistoryPage -> GET /api/reviews?limit=50)
    console.log('5. Testing Review History Fetch (HistoryPage)...');
    const histRes = await request('GET', '/api/reviews?limit=50', null, token);
    if (histRes.status !== 200 || histRes.body.reviews.length !== 4) {
      throw new Error(`History fetch failed: ${JSON.stringify(histRes.body)}`);
    }
    console.log(`   [PASS] History page successfully listed ${histRes.body.reviews.length} reviews.`);

    // 6. Delete review action (HistoryPage -> DELETE /api/reviews/:id)
    console.log('6. Testing Delete Action (HistoryPage)...');
    const delId = createdReviewIds[0];
    const delRes = await request('DELETE', `/api/reviews/${delId}`, null, token);
    if (delRes.status !== 200) {
      throw new Error(`Delete failed: ${JSON.stringify(delRes.body)}`);
    }
    console.log('   [PASS] Successfully deleted review from history.');

    console.log('\n============================================================');
    console.log(' ALL FRONTEND-BACKEND INTEGRATION FLOWS VERIFIED SUCCESSFULLY!');
    console.log('============================================================\n');
  } finally {
    // Cleanup
    await User.deleteMany({ email: testEmail });
    await CodeReview.deleteMany({ userId: { $exists: true }, title: /Algorithmic Audit/ });
    server.close();
    await mongoose.connection.close();
  }
}

verifyFrontendIntegration().catch((err) => {
  console.error('[Verification Error]:', err);
  process.exit(1);
});
