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
  ReviewChecklist,
} from '../types';

export interface GameFilterParams {
  query?: string;
  tags?: string;
  device?: 'desktop' | 'mobile';
  sort?: 'newest' | 'title_asc';
  limit?: number;
  cursor?: string | null;
}

export interface TechnicalReviewPayload {
  decision: 'pass' | 'reject';
  checklist: ReviewChecklist;
  public_reason?: string;
  internal_note?: string;
  expected_version: number;
}

export interface ContentReviewPayload {
  decision: 'pass' | 'reject';
  checklist: ReviewChecklist;
  public_reason?: string;
  internal_note?: string;
  expected_version: number;
}

export interface ApiClient {
  getGames(params?: GameFilterParams): Promise<PaginatedResponse<GameCard>>;
  getGameDetail(slug: string): Promise<ApiResponse<GameDetail>>;
  getTags(): Promise<ApiResponse<Tag[]>>;
  getSubmissionRules(): Promise<ApiResponse<SubmissionRules>>;
  submitGame(payload: SubmissionPayload, idempotencyKey?: string): Promise<ApiResponse<SubmissionCreatedResponse>>;
  checkSubmissionStatus(trackingToken: string): Promise<ApiResponse<SubmissionStatusData>>;
  
  // Admin endpoints
  adminLogin(email: string, password?: string): Promise<{ token: string; me: AdminMeData }>;
  getAdminMe(token: string): Promise<ApiResponse<AdminMeData>>;
  getAdminSubmissions(token: string, filter?: { status?: string; cursor?: string }): Promise<PaginatedResponse<AdminSubmissionDetail>>;
  getAdminSubmission(token: string, id: string): Promise<ApiResponse<AdminSubmissionDetail>>;
  updateAdminSubmissionMetadata(
    token: string,
    id: string,
    metadata: { title?: string; short_description?: string; tag_slugs?: string[] },
    expectedVersion: number
  ): Promise<ApiResponse<AdminSubmissionDetail>>;
  technicalReview(token: string, id: string, payload: TechnicalReviewPayload): Promise<ApiResponse<AdminSubmissionDetail>>;
  contentReview(token: string, id: string, payload: ContentReviewPayload): Promise<ApiResponse<AdminSubmissionDetail>>;
  
  getAdminGame(token: string, id: string): Promise<ApiResponse<AdminGameDetail>>;
  publishGame(token: string, id: string, expectedVersion: number): Promise<ApiResponse<AdminGameDetail>>;
  suspendGame(token: string, id: string, reason: string, expectedVersion: number): Promise<ApiResponse<AdminGameDetail>>;
  activateRelease(token: string, gameId: string, releaseId: string): Promise<ApiResponse<AdminGameDetail>>;
}
