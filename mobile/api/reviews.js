import { apiRequest } from './client';

export function fetchReviews(type, id) {
  return apiRequest(`/reviews?type=${type}&id=${id}`);
}

export function fetchMyReviews() {
  return apiRequest('/reviews/mine');
}

/**
 * One call for both write and edit — the backend upserts by user+listing,
 * so submitting again just updates the existing review.
 */
export function submitReview(type, id, { rating, comment }) {
  return apiRequest('/reviews', {
    method: 'POST',
    body: { reviewable_type: type, reviewable_id: id, rating, comment: comment || null },
  });
}

export function deleteReview(reviewId) {
  return apiRequest(`/reviews/${reviewId}`, { method: 'DELETE' });
}
