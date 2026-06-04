import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate } from 'k6/metrics';
import { authHeaders } from '../helpers/auth.js';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export const paymentDuration = new Trend('payment_list_duration');
export const deliveryDuration = new Trend('delivery_list_duration');
export const fulfillmentErrorRate = new Rate('fulfillment_errors');

export function fulfillmentScenario(token) {
  const payRes = http.get(`${BASE_URL}/payments`, authHeaders(token));
  paymentDuration.add(payRes.timings.duration);
  fulfillmentErrorRate.add(payRes.status !== 200);

  check(payRes, {
    'payments: list status 200': (r) => r.status === 200,
    'payments: duração < 800ms': (r) => r.timings.duration < 800,
  });

  const delRes = http.get(`${BASE_URL}/delivery`, authHeaders(token));
  deliveryDuration.add(delRes.timings.duration);
  fulfillmentErrorRate.add(delRes.status !== 200);

  check(delRes, {
    'delivery: list status 200': (r) => r.status === 200,
    'delivery: duração < 800ms': (r) => r.timings.duration < 800,
  });

  sleep(1);
}
