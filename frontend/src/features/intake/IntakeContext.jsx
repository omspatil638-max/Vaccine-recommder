import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { useCatalog } from '../../lib/useResource';
import { INTAKE_STEPS } from './steps';
import DataState from '../../components/ui/DataState';

const IntakeContext = createContext(null);

export function IntakeProvider({ children }) {
  const auth = useAuth();
  const { catalog, error: catalogError } = useCatalog();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    try {
      setData(await api.get('/intake'));
      setError(null);
    } catch (err) {
      setError(err);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const save = useCallback(
    async (step, body) => {
      const res = await api.put(`/intake/${step}`, body);
      await Promise.all([reload(), auth.refresh()]);
      return res;
    },
    [reload, auth],
  );

  return (
    <IntakeContext.Provider value={{ data, catalog, error: error || catalogError, reload, save }}>
      {children}
    </IntakeContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useIntake() {
  return useContext(IntakeContext);
}

/** Navigation between steps, honouring ?return=review|profile for edits. */
// eslint-disable-next-line react-refresh/only-export-components
export function useStepNav(stepKey) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const returnTo = params.get('return');
  const index = INTAKE_STEPS.findIndex((s) => s.key === stepKey);
  const prev = INTAKE_STEPS[index - 1];
  const next = INTAKE_STEPS[index + 1];
  const returnPath = returnTo === 'review' ? '/start/review' : returnTo === 'profile' ? '/profile?updated=1' : null;

  return {
    returnTo,
    backTo: returnPath ? returnPath.replace('?updated=1', '') : prev?.path ?? null,
    goNext: () => navigate(returnPath ?? next?.path ?? '/start/review'),
    continueLabel: returnPath ? 'Save and return' : 'Continue',
  };
}

/** Mounts a step only once its data has loaded, so forms start from saved answers. */
export function IntakeReady({ children }) {
  const { data, catalog, error } = useIntake();
  if (error) {
    return (
      <DataState kind="error" title="We couldn’t load your information">
        {error.message}
      </DataState>
    );
  }
  if (!data || !catalog) return <DataState kind="loading" title="Loading your information…" />;
  return children;
}
