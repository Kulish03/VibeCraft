import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/app.js';

let server;
let baseUrl;

before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      resolve();
    });
  });
});

after(async () => {
  await new Promise((resolve) => {
    if (server) {
      server.close(resolve);
    } else {
      resolve();
    }
  });
});

describe('Backend API: Health Check & Review Endpoints', () => {
  it('GET /api/health should return status ok', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.status, 'ok');
  });

  it('POST /api/review with valid python code should succeed with 200', async () => {
    const res = await fetch(`${baseUrl}/api/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: 'print(1 + 2)',
        language: 'python'
      })
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.data);
    assert.ok(body.data.summary);
    assert.ok(Array.isArray(body.data.issues));
    assert.ok(body.data.explanation);
    assert.ok(Array.isArray(body.data.hints));
    assert.ok(body.data.improvedCode);
    assert.ok(Array.isArray(body.data.takeaways));
    assert.equal(body.meta.language, 'python');
    assert.equal(body.meta.isMock, true);
  });

  it('POST /api/review with language alias "py" should normalize to "python"', async () => {
    const res = await fetch(`${baseUrl}/api/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: 'def add(a, b):\n    return a + b',
        language: '  PY  '
      })
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.meta.language, 'python');
  });

  it('POST /api/review with language alias "c++" or "js" should normalize properly', async () => {
    const res = await fetch(`${baseUrl}/api/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: 'const x = 10;',
        language: 'JS'
      })
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.meta.language, 'javascript');
  });

  it('POST /api/review should return 400 when code is missing', async () => {
    const res = await fetch(`${baseUrl}/api/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: 'python'
      })
    });

    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'MISSING_CODE');
  });

  it('POST /api/review should return 400 when code is empty string or only whitespace', async () => {
    const res = await fetch(`${baseUrl}/api/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: '    \n\t   ',
        language: 'python'
      })
    });

    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'EMPTY_CODE');
  });

  it('POST /api/review should return 400 when code is not a string (e.g. number/object)', async () => {
    const res = await fetch(`${baseUrl}/api/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: 12345,
        language: 'python'
      })
    });

    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'INVALID_CODE_TYPE');
  });

  it('POST /api/review should return 400 when language is missing', async () => {
    const res = await fetch(`${baseUrl}/api/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: 'print("hello")'
      })
    });

    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'MISSING_LANGUAGE');
  });

  it('POST /api/review should return 400 when language is unsupported', async () => {
    const res = await fetch(`${baseUrl}/api/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: 'puts "hello world"',
        language: 'ruby'
      })
    });

    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'UNSUPPORTED_LANGUAGE');
  });

  it('POST /api/review should return 413 when code exceeds MAX_CODE_LENGTH (15000 chars)', async () => {
    const hugeCode = 'a'.repeat(15001);
    const res = await fetch(`${baseUrl}/api/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: hugeCode,
        language: 'python'
      })
    });

    assert.equal(res.status, 413);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'CODE_TOO_LARGE');
  });

  it('POST /api/review should return 400 with friendly message on malformed JSON payload', async () => {
    const res = await fetch(`${baseUrl}/api/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{"code": "print(1)", language: python' // invalid JSON
    });

    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'MALFORMED_JSON');
    assert.ok(!body.stack, 'Stack trace must not be returned');
  });

  it('GET /api/unknown-route should return 404 with clean error schema and no stack trace', async () => {
    const res = await fetch(`${baseUrl}/api/unknown-route`);
    assert.equal(res.status, 404);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'ROUTE_NOT_FOUND');
    assert.ok(!body.stack);
  });
});
