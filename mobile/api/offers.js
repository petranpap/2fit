import { apiRequest } from './client';

export function fetchOffers({ type, page } = {}) {
  const params = new URLSearchParams();

  if (type) params.set('type', type);
  if (page) params.set('page', String(page));

  const query = params.toString();

  return apiRequest(`/offers${query ? `?${query}` : ''}`);
}

export function fetchOffer(id) {
  return apiRequest(`/offers/${id}`);
}

export function claimOffer(id) {
  return apiRequest(`/offers/${id}/claim`, { method: 'POST' });
}
