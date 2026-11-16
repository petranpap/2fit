import { apiRequest } from './client';

export function fetchMyFavorites() {
  return apiRequest('/favorites/mine');
}

/**
 * One call toggles either direction — the backend favorites or unfavorites
 * depending on current state and reports back which it did.
 */
export function toggleFavorite(type, id) {
  return apiRequest('/favorites/toggle', {
    method: 'POST',
    body: { favoritable_type: type, favoritable_id: id },
  });
}
