import { Platform } from 'react-native';

import { apiRequest } from './client';

// Stable per-install label sent as the Sanctum token's device_name.
const DEVICE_NAME = `${Platform.OS}-2fit-app`;

export function register({ name, email, phone, password, passwordConfirmation }) {
  return apiRequest('/auth/register', {
    method: 'POST',
    body: {
      name,
      email,
      phone: phone || undefined,
      role: 'user',
      password,
      password_confirmation: passwordConfirmation,
    },
  });
}

export function login({ email, password }) {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: { email, password, device_name: DEVICE_NAME },
  });
}

export function logout() {
  return apiRequest('/auth/logout', { method: 'POST' });
}
