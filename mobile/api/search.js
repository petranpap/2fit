import { apiRequest } from './client';

/**
 * @param {{ q?: string, category?: string, type?: 'gym'|'trainer'|'shop'|'all', lat?: number, lng?: number, radiusKm?: number, perPage?: number }} filters
 */
export function search(filters = {}) {
  const params = new URLSearchParams();

  if (filters.q) params.set('q', filters.q);
  if (filters.category) params.set('category', filters.category);
  if (filters.type) params.set('type', filters.type);
  if (filters.lat != null) params.set('lat', String(filters.lat));
  if (filters.lng != null) params.set('lng', String(filters.lng));
  if (filters.radiusKm != null) params.set('radius_km', String(filters.radiusKm));
  if (filters.perPage != null) params.set('per_page', String(filters.perPage));

  const query = params.toString();

  return apiRequest(`/search${query ? `?${query}` : ''}`);
}
