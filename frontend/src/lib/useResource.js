import { useCallback, useEffect, useState } from 'react';
import { api } from './api';

/**
 * Fetch a JSON resource. A `path` of null skips the request.
 * `loading` is derived from whether the current path has finished loading, so a
 * component never sees stale "not loading, no data" between path changes.
 */
export function useResource(path) {
  const [state, setState] = useState({ forPath: null, data: undefined, error: null });
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    if (!path) return undefined;
    const ctrl = new AbortController();
    api
      .get(path, { signal: ctrl.signal })
      .then((data) => setState({ forPath: path, data, error: null }))
      .catch((error) => {
        if (error.name !== 'AbortError') setState({ forPath: path, data: undefined, error });
      });
    return () => ctrl.abort();
  }, [path, nonce]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);
  const current = state.forPath === path;
  return {
    data: current ? state.data : undefined,
    error: current ? state.error : null,
    loading: Boolean(path) && !current,
    reload,
  };
}

let catalogPromise = null;

/** Answer vocabularies and vaccine lists; fetched once per page load. */
export function useCatalog() {
  const [catalog, setCatalog] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => {
    catalogPromise ??= api.get('/catalog').catch((e) => {
      catalogPromise = null;
      throw e;
    });
    catalogPromise.then(setCatalog).catch(setError);
  }, []);
  return { catalog, error };
}
