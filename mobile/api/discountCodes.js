import { apiRequest } from './client';

export function fetchMyDiscountCodes() {
  return apiRequest('/discount-codes/mine');
}

export function fetchDiscountCode(code) {
  return apiRequest(`/discount-codes/${encodeURIComponent(code)}`);
}
