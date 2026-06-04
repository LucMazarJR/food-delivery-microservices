import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate } from 'k6/metrics';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export const authDuration = new Trend('auth_login_duration');
export const authErrorRate = new Rate('auth_login_errors');

export function authScenario() {
  const res = http.post(
    `${BASE_URL}/auth/login`,
    JSON.stringify({ email: __ENV.TEST_EMAIL || 'test@test.com', password: __ENV.TEST_PASSWORD || '123456' }),
    { headers: { 'Content-Type': 'application/json' } },
  );

  authDuration.add(res.timings.duration);
  authErrorRate.add(res.status !== 201);

  check(res, {
    'auth: status 201': (r) => r.status === 201,
    'auth: tem access_token': (r) => JSON.parse(r.body).access_token !== undefined,
    'auth: duração < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);
}
