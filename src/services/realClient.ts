import {
  ApiClient,
  GameFilterParams,
  TechnicalReviewPayload,
  ContentReviewPayload,
} from './apiClient';
import {
  GameCard,
  GameDetail,
  Tag,
  SubmissionRules,
  SubmissionPayload,
  SubmissionCreatedResponse,
  SubmissionStatusData,
  AdminMeData,
  AdminSubmissionDetail,
  AdminGameDetail,
  PaginatedResponse,
  ApiResponse,
  ApiProblemError,
} from '../types';

export class RealApiClient implements ApiClient {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    const raw = baseUrl || (import.meta as any).env?.VITE_API_BASE_URL || '/api/v1';
    // Ensure no trailing slash
    this.baseUrl = raw.endsWith('/') ? raw.slice(0, -1) : raw;
  }

  private async request<T>(
    path: string,
    options: RequestInit = {},
    token?: string,
    idempotencyKey?: string
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json, application/problem+json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (idempotencyKey) {
      headers['Idempotency-Key'] = idempotencyKey;
    }

    const res = await fetch(url, {
      ...options,
      headers,
    });

    if (!res.ok) {
      let problem: ApiProblemError;
      try {
        problem = await res.json();
      } catch {
        problem = {
          type: 'about:blank',
          title: res.statusText || 'Lỗi kết nối máy chủ',
          status: res.status,
          code: `HTTP_${res.status}`,
          request_id: res.headers.get('x-request-id') || 'unknown',
        };
      }

      const err = new Error(problem.title || 'Lỗi gọi API') as any;
      err.name = 'ApiProblemError';
      err.problem = problem;
      throw err;
    }

    return res.json();
  }

  async getGames(params?: GameFilterParams): Promise<PaginatedResponse<GameCard>> {
    const query = new URLSearchParams();
    if (params?.query) query.set('query', params.query);
    if (params?.tags) query.set('tags', params.tags);
    if (params?.device) query.set('device', params.device);
    if (params?.sort) query.set('sort', params.sort);
    if (params?.limit) query.set('limit', params.limit.toString());
    if (params?.cursor) query.set('cursor', params.cursor);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return this.request<PaginatedResponse<GameCard>>(`/games${queryString}`, { method: 'GET' });
  }

  async getGameDetail(slug: string): Promise<ApiResponse<GameDetail>> {
    return this.request<ApiResponse<GameDetail>>(`/games/${encodeURIComponent(slug)}`, { method: 'GET' });
  }

  async getTags(): Promise<ApiResponse<Tag[]>> {
    return this.request<ApiResponse<Tag[]>>('/tags', { method: 'GET' });
  }

  async getSubmissionRules(): Promise<ApiResponse<SubmissionRules>> {
    return this.request<ApiResponse<SubmissionRules>>('/submission-rules', { method: 'GET' });
  }

  async submitGame(
    payload: SubmissionPayload,
    idempotencyKey?: string
  ): Promise<ApiResponse<SubmissionCreatedResponse>> {
    return this.request<ApiResponse<SubmissionCreatedResponse>>(
      '/submissions',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      undefined,
      idempotencyKey
    );
  }

  async checkSubmissionStatus(trackingToken: string): Promise<ApiResponse<SubmissionStatusData>> {
    return this.request<ApiResponse<SubmissionStatusData>>('/submissions/status', {
      method: 'POST',
      body: JSON.stringify({ tracking_token: trackingToken }),
    });
  }

  async adminLogin(email: string, password?: string): Promise<{ token: string; me: AdminMeData }> {
    return this.request<{ token: string; me: AdminMeData }>('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async getAdminMe(token: string): Promise<ApiResponse<AdminMeData>> {
    return this.request<ApiResponse<AdminMeData>>('/admin/me', { method: 'GET' }, token);
  }

  async getAdminSubmissions(
    token: string,
    filter?: { status?: string; cursor?: string }
  ): Promise<PaginatedResponse<AdminSubmissionDetail>> {
    const query = new URLSearchParams();
    if (filter?.status) query.set('status', filter.status);
    if (filter?.cursor) query.set('cursor', filter.cursor);
    const qs = query.toString() ? `?${query.toString()}` : '';

    return this.request<PaginatedResponse<AdminSubmissionDetail>>(
      `/admin/submissions${qs}`,
      { method: 'GET' },
      token
    );
  }

  async getAdminSubmission(token: string, id: string): Promise<ApiResponse<AdminSubmissionDetail>> {
    return this.request<ApiResponse<AdminSubmissionDetail>>(`/admin/submissions/${id}`, { method: 'GET' }, token);
  }

  async updateAdminSubmissionMetadata(
    token: string,
    id: string,
    metadata: { title?: string; short_description?: string; tag_slugs?: string[] },
    expectedVersion: number
  ): Promise<ApiResponse<AdminSubmissionDetail>> {
    return this.request<ApiResponse<AdminSubmissionDetail>>(
      `/admin/submissions/${id}/metadata`,
      {
        method: 'PATCH',
        body: JSON.stringify({ ...metadata, expected_version: expectedVersion }),
      },
      token
    );
  }

  async technicalReview(
    token: string,
    id: string,
    payload: TechnicalReviewPayload
  ): Promise<ApiResponse<AdminSubmissionDetail>> {
    return this.request<ApiResponse<AdminSubmissionDetail>>(
      `/admin/submissions/${id}/technical-review`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      token
    );
  }

  async contentReview(
    token: string,
    id: string,
    payload: ContentReviewPayload
  ): Promise<ApiResponse<AdminSubmissionDetail>> {
    return this.request<ApiResponse<AdminSubmissionDetail>>(
      `/admin/submissions/${id}/content-review`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      token
    );
  }

  async getAdminGame(token: string, id: string): Promise<ApiResponse<AdminGameDetail>> {
    return this.request<ApiResponse<AdminGameDetail>>(`/admin/games/${id}`, { method: 'GET' }, token);
  }

  async publishGame(token: string, id: string, expectedVersion: number): Promise<ApiResponse<AdminGameDetail>> {
    return this.request<ApiResponse<AdminGameDetail>>(
      `/admin/games/${id}/publish`,
      {
        method: 'POST',
        body: JSON.stringify({ expected_version: expectedVersion }),
      },
      token
    );
  }

  async suspendGame(token: string, id: string, reason: string, expectedVersion: number): Promise<ApiResponse<AdminGameDetail>> {
    return this.request<ApiResponse<AdminGameDetail>>(
      `/admin/games/${id}/suspend`,
      {
        method: 'POST',
        body: JSON.stringify({ reason, expected_version: expectedVersion }),
      },
      token
    );
  }

  async activateRelease(token: string, _gameId: string, releaseId: string): Promise<ApiResponse<AdminGameDetail>> {
    return this.request<ApiResponse<AdminGameDetail>>(
      `/admin/releases/${releaseId}/activate`,
      { method: 'POST' },
      token
    );
  }
}
