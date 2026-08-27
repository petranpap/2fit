import Constants from 'expo-constants';

// In dev, Expo Go / a simulator on another device (or the Android emulator,
// where "localhost" means the emulator itself) can't reach the API through
// "localhost" — derive the dev machine's LAN IP from the Expo host instead.
// Falls back to localhost for the web/iOS-simulator case where that works.
function resolveBaseUrl() {
  if (__DEV__) {
    const hostUri = Constants.expoConfig?.hostUri;
    const host = hostUri?.split(':')?.[0];

    if (host) {
      return `http://${host}:8000/api`;
    }
  }

  return 'http://localhost:8000/api';
}

const BASE_URL = resolveBaseUrl();

let authToken = null;

export function setAuthToken(token) {
  authToken = token;
}

export async function apiRequest(path, { method = 'GET', body, headers = {} } = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw Object.assign(new Error(data?.message ?? 'Request failed'), {
      status: response.status,
      errors: data?.errors,
    });
  }

  return data;
}
