import { apiRequest } from './client';

const ENDPOINTS = {
  gym: 'gyms',
  trainer: 'trainers',
  shop: 'shops',
};

export function fetchPlace(type, id) {
  return apiRequest(`/${ENDPOINTS[type]}/${id}`);
}
