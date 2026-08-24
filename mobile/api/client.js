const BASE_URL = 'http://localhost:8000/api';

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
