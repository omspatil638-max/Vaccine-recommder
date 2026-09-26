import { useEffect, useState } from 'react';
import { request } from './api';

/** Service facts (demo mode, version). `null` until loaded or if unreachable. */
export function useMeta() {
  const [meta, setMeta] = useState(null);
  useEffect(() => {
    const ctrl = new AbortController();
    request('/meta', { signal: ctrl.signal })
      .then(setMeta)
      .catch(() => setMeta(null));
    return () => ctrl.abort();
  }, []);
  return meta;
}
