import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [state, setState] = useState({ status: 'loading', user: null, progress: null });

  const apply = useCallback((me) => {
    setState(
      me?.user
        ? { status: 'authed', user: me.user, progress: me.progress }
        : { status: 'anon', user: null, progress: null },
    );
    return me?.user ? me : null;
  }, []);

  const refresh = useCallback(async () => {
    try {
      return apply(await api.get('/auth/me'));
    } catch (err) {
      if (err.status === 401) return apply(null);
      setState((s) => ({ ...s, status: s.status === 'loading' ? 'error' : s.status }));
      throw err;
    }
  }, [apply]);

  useEffect(() => {
    refresh().catch(() => {});
  }, [refresh]);

  const value = useMemo(
    () => ({
      ...state,
      refresh,
      login: async (email, password) => apply(await api.post('/auth/login', { email, password })),
      signup: async (email, password) => apply(await api.post('/auth/signup', { email, password })),
      resetPassword: async (token, password) => apply(await api.post('/auth/reset', { token, password })),
      logout: async () => {
        try {
          await api.post('/auth/logout');
        } finally {
          apply(null);
        }
      },
    }),
    [state, refresh, apply],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}

/** Where a signed-in user should go next. */
// eslint-disable-next-line react-refresh/only-export-components
export function homePathFor(progress) {
  if (!progress) return '/login';
  if (!progress.onboardingComplete) return `/start/${progress.nextStep ?? 'profile'}`;
  return '/home';
}
