import { SAMPLE_PROFILES, INITIAL_VACCINATION_HISTORY } from '../mockData/mockDataset';
import { request } from '../lib/api';

// Medical logic lives only in the backend engine. If it can't be reached, the
// caller shows an error — there is no client-side fallback that could disagree.
export async function fetchRecommendations(profile, history) {
  const data = await request('/recommend', { method: 'POST', body: { profile, history } });
  return data.recommendations;
}

export function getInitialData() {
  return {
    profile: SAMPLE_PROFILES[0],
    history: INITIAL_VACCINATION_HISTORY,
    reviewStatus: null,
  };
}
