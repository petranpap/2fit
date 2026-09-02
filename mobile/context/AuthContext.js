import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import * as authApi from '../api/auth';
import { setAuthToken, setUnauthorizedHandler } from '../api/client';
import * as secureStorage from '../utils/secureStorage';

const TOKEN_KEY = '2fit_auth_token';
const USER_KEY = '2fit_auth_user';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Drops local session state only — does not call the API (the token is
  // already invalid or gone server-side, so there's nothing to revoke).
  const clearSession = useCallback(async () => {
    setAuthToken(null);
    setUser(null);
    await Promise.all([
      secureStorage.deleteItem(TOKEN_KEY),
      secureStorage.deleteItem(USER_KEY),
    ]);
  }, []);

  // A stored token can go stale server-side (expired, revoked, or — in
  // local dev — the DB got reset) without the app knowing. Without this,
  // every authenticated call would keep failing with a bare 401 while the
  // app still shows the user as logged in. Registering here, rather than
  // only calling it from logout(), means it also fires the moment any
  // screen's API call discovers the token is dead.
  useEffect(() => {
    setUnauthorizedHandler(clearSession);
    return () => setUnauthorizedHandler(null);
  }, [clearSession]);

  // Restore a persisted session on cold start.
  useEffect(() => {
    (async () => {
      try {
        const [storedToken, storedUser] = await Promise.all([
          secureStorage.getItem(TOKEN_KEY),
          secureStorage.getItem(USER_KEY),
        ]);

        if (storedToken && storedUser) {
          setAuthToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const persistSession = useCallback(async (token, sessionUser) => {
    setAuthToken(token);
    setUser(sessionUser);
    await Promise.all([
      secureStorage.setItem(TOKEN_KEY, token),
      secureStorage.setItem(USER_KEY, JSON.stringify(sessionUser)),
    ]);
  }, []);

  const register = useCallback(
    async (data) => {
      await authApi.register(data);
      // Registration doesn't return a token — log the new user straight in.
      const { data: loginData } = await authApi.login({ email: data.email, password: data.password });
      await persistSession(loginData.token, loginData.user);
    },
    [persistSession]
  );

  const login = useCallback(
    async ({ email, password }) => {
      const { data } = await authApi.login({ email, password });
      await persistSession(data.token, data.user);
    },
    [persistSession]
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Token may already be invalid server-side — clear local state regardless.
    }
    await clearSession();
  }, [clearSession]);

  const value = useMemo(
    () => ({ user, isLoading, isAuthenticated: !!user, register, login, logout }),
    [user, isLoading, register, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
