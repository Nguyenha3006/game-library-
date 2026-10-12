import { ApiClient } from './apiClient';
import { MockApiClient } from './mockClient';
import { RealApiClient } from './realClient';

// Store preference in localStorage so developer/tester can switch seamlessly
const MODE_STORAGE_KEY = 'gamelib_client_mode'; // 'mock' | 'real'
const allowMockClient =
  Boolean((import.meta as any).env?.DEV) || (import.meta as any).env?.VITE_ENABLE_MOCK === 'true';

const mockInstance = new MockApiClient();
const realInstance = new RealApiClient();

export function isMockMode(): boolean {
  if (!allowMockClient) return false;
  const saved = localStorage.getItem(MODE_STORAGE_KEY);
  if (saved) return saved === 'mock';
  // Default to mock mode because backend is not yet live per handoff report
  return true;
}

export function setClientMode(mode: 'mock' | 'real') {
  if (mode === 'mock' && !allowMockClient) {
    localStorage.setItem(MODE_STORAGE_KEY, 'real');
    window.location.reload();
    return;
  }
  localStorage.setItem(MODE_STORAGE_KEY, mode);
  window.location.reload();
}

export function getApiClient(): ApiClient {
  return isMockMode() ? mockInstance : realInstance;
}

export const api: ApiClient = {
  getGames: (params) => getApiClient().getGames(params),
  getGameDetail: (slug) => getApiClient().getGameDetail(slug),
  getTags: () => getApiClient().getTags(),
  getSubmissionRules: () => getApiClient().getSubmissionRules(),
  submitGame: (payload, idempotencyKey) => getApiClient().submitGame(payload, idempotencyKey),
  checkSubmissionStatus: (trackingToken) => getApiClient().checkSubmissionStatus(trackingToken),
  adminLogin: (email, password) => getApiClient().adminLogin(email, password),
  getAdminMe: (token) => getApiClient().getAdminMe(token),
  getAdminSubmissions: (token, filter) => getApiClient().getAdminSubmissions(token, filter),
  getAdminSubmission: (token, id) => getApiClient().getAdminSubmission(token, id),
  updateAdminSubmissionMetadata: (token, id, metadata, expectedVersion) =>
    getApiClient().updateAdminSubmissionMetadata(token, id, metadata, expectedVersion),
  technicalReview: (token, id, payload) => getApiClient().technicalReview(token, id, payload),
  contentReview: (token, id, payload) => getApiClient().contentReview(token, id, payload),
  getAdminGame: (token, id) => getApiClient().getAdminGame(token, id),
  publishGame: (token, id, expectedVersion) => getApiClient().publishGame(token, id, expectedVersion),
  suspendGame: (token, id, reason, expectedVersion) => getApiClient().suspendGame(token, id, reason, expectedVersion),
  activateRelease: (token, gameId, releaseId) => getApiClient().activateRelease(token, gameId, releaseId),
};
