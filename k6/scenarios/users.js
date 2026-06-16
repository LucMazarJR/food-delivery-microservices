import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate } from 'k6/metrics';
import { authHeaders } from '../helpers/auth.js';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export const userListDuration = new Trend('user_list_duration');
export const userErrorRate = new Rate('user_errors');

export function usersScenario(token) {
  // Listar usuários
  const listRes = http.get(`${BASE_URL}/user`, authHeaders(token));
  userListDuration.add(listRes.timings.duration);
  userErrorRate.add(listRes.status !== 200);

  check(listRes, {
    'users: list status 200': (r) => r.status === 200,
    'users: list duração < 800ms': (r) => r.timings.duration < 800,
  });

  // Buscar por e-mail
  const emailRes = http.get(
    `${BASE_URL}/user/email/${__ENV.TEST_EMAIL || 'test@test.com'}`,
    authHeaders(token),
  );

  check(emailRes, {
    'users: findByEmail status 200 ou 404': (r) => [200, 404].includes(r.status),
  });

  sleep(1);
}
