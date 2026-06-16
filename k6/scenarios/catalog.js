import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate } from 'k6/metrics';
import { authHeaders } from '../helpers/auth.js';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export const restaurantDuration = new Trend('restaurant_list_duration');
export const menuDuration = new Trend('menu_list_duration');
export const catalogErrorRate = new Rate('catalog_errors');

export function catalogScenario(token) {
  const restRes = http.get(`${BASE_URL}/restaurant`, authHeaders(token));
  restaurantDuration.add(restRes.timings.duration);
  catalogErrorRate.add(restRes.status !== 200);

  check(restRes, {
    'restaurant: list status 200': (r) => r.status === 200,
    'restaurant: duração < 800ms': (r) => r.timings.duration < 800,
  });

  const menuRes = http.get(`${BASE_URL}/menu`, authHeaders(token));
  menuDuration.add(menuRes.timings.duration);
  catalogErrorRate.add(menuRes.status !== 200);

  check(menuRes, {
    'menu: list status 200': (r) => r.status === 200,
    'menu: duração < 800ms': (r) => r.timings.duration < 800,
  });

  sleep(1);
}
