import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate } from 'k6/metrics';
import { authHeaders } from '../helpers/auth.js';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export const orderListDuration = new Trend('order_list_duration');
export const orderRouteDuration = new Trend('order_route_duration');
export const orderErrorRate = new Rate('order_errors');

export function ordersScenario(token) {
  const listRes = http.get(`${BASE_URL}/orders`, authHeaders(token));
  orderListDuration.add(listRes.timings.duration);
  orderErrorRate.add(listRes.status !== 200);

  check(listRes, {
    'orders: list status 200': (r) => r.status === 200,
    'orders: duração < 800ms': (r) => r.timings.duration < 800,
  });

  const routeRes = http.get(`${BASE_URL}/orders/route`, authHeaders(token));
  orderRouteDuration.add(routeRes.timings.duration);

  check(routeRes, {
    'orders: route status 200': (r) => r.status === 200,
  });

  sleep(1);
}
