import http from 'k6/http';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export function getToken() {
  const res = http.post(
    `${BASE_URL}/auth/login`,
    JSON.stringify({ email: __ENV.TEST_EMAIL || 'test@test.com', password: __ENV.TEST_PASSWORD || '123456' }),
    { headers: { 'Content-Type': 'application/json' } },
  );

  if (res.status !== 201) {
    console.error(`Login falhou: ${res.status} ${res.body}`);
    return null;
  }

  return JSON.parse(res.body).access_token;
}

export function authHeaders(token) {
  return { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } };
}
