import { sleep } from 'k6';
import { getToken } from './helpers/auth.js';
import { authScenario } from './scenarios/auth.js';
import { usersScenario } from './scenarios/users.js';
import { catalogScenario } from './scenarios/catalog.js';
import { ordersScenario } from './scenarios/orders.js';
import { fulfillmentScenario } from './scenarios/fulfillment.js';

export const options = {
  stages: [
    { duration: '30s', target: 5 },   // ramp-up
    { duration: '1m', target: 20 },   // carga sustentada
    { duration: '30s', target: 50 },  // pico
    { duration: '30s', target: 0 },   // ramp-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'],   // 95% das requests < 1s
    http_req_failed: ['rate<0.05'],       // menos de 5% de erros
    auth_login_duration: ['p(95)<500'],
    user_list_duration: ['p(95)<800'],
    order_list_duration: ['p(95)<800'],
  },
};

// Token obtido uma vez por VU no setup
export function setup() {
  const token = getToken();
  if (!token) throw new Error('Não foi possível obter token JWT. Verifique TEST_EMAIL e TEST_PASSWORD.');
  return { token };
}

export default function ({ token }) {
  authScenario();
  usersScenario(token);
  catalogScenario(token);
  ordersScenario(token);
  fulfillmentScenario(token);
  sleep(1);
}
