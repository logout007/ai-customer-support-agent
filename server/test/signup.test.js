import { test } from 'node:test';
import assert from 'node:assert/strict';

// Integration test: requires the server running (e.g. `docker compose up`) at SERVER_URL.
const BASE_URL = process.env.SERVER_URL || 'http://localhost:5000';

test('signing up twice with the same email returns 409, not a crash', async () => {
  const email = `dup-test-${Date.now()}@example.com`;
  const body = JSON.stringify({ email, password: 'password123' });
  const headers = { 'Content-Type': 'application/json' };

  const first = await fetch(`${BASE_URL}/auth/signup`, { method: 'POST', headers, body });
  assert.equal(first.status, 201);

  const second = await fetch(`${BASE_URL}/auth/signup`, { method: 'POST', headers, body });
  assert.equal(second.status, 409);

  const health = await fetch(`${BASE_URL}/health`);
  assert.equal(health.status, 200, 'server must still be up after the duplicate signup');
});
