import { apiRequest } from './client';

export function fetchCategories() {
  return apiRequest('/categories');
}

// The 4 main categories shown on Home and Explore's "Top Categories" —
// each comes with children + rolled-up listings_count already loaded.
export function fetchPrimaryCategories() {
  return apiRequest('/categories?primary=1');
}

export function fetchCategoryChildren(categoryId) {
  return apiRequest(`/categories/${categoryId}/children`);
}
