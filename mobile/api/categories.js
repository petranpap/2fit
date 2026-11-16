import { apiRequest } from './client';

export function fetchCategories() {
  return apiRequest('/categories');
}
