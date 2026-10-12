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
  NextAction,
} from '../types';
import {
  INITIAL_GAMES,
  INITIAL_TAGS,
  SUBMISSION_RULES,
  INITIAL_SUBMISSIONS,
  INITIAL_ADMIN_GAMES,
} from './mockData';

const STORAGE_KEYS = {
  GAMES: 'gamelib_mock_games',
  SUBMISSIONS: 'gamelib_mock_submissions',
  ADMIN_GAMES: 'gamelib_mock_admin_games',
  IDEMPOTENCY: 'gamelib_mock_idempotency',
};

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function createProblemError(
  status: number,
  code: string,
  title: string,
  errors?: { field: string; code: string; message: string }[]
): ApiProblemError {
  const err = new Error(title) as any;
  err.name = 'ApiProblemError';
  err.problem = {
    type: 'about:blank',
    title,
    status,
    code,
    request_id: 'req-' + Math.random().toString(36).substring(2, 9),
    errors,
  };
  return err;
}

export class MockApiClient implements ApiClient {
  private getStoredGames(): GameDetail[] {
    const raw = sessionStorage.getItem(STORAGE_KEYS.GAMES);
    if (!raw) {
      sessionStorage.setItem(STORAGE_KEYS.GAMES, JSON.stringify(INITIAL_GAMES));
      return [...INITIAL_GAMES];
    }
    return JSON.parse(raw);
  }

  private saveGames(games: GameDetail[]) {
    sessionStorage.setItem(STORAGE_KEYS.GAMES, JSON.stringify(games));
  }

  private getStoredSubmissions(): AdminSubmissionDetail[] {
    const raw = sessionStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
    if (!raw) {
      sessionStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(INITIAL_SUBMISSIONS));
      return [...INITIAL_SUBMISSIONS];
    }
    return JSON.parse(raw);
  }

  private saveSubmissions(subs: AdminSubmissionDetail[]) {
    sessionStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(subs));
  }

  private getStoredAdminGames(): AdminGameDetail[] {
    const raw = sessionStorage.getItem(STORAGE_KEYS.ADMIN_GAMES);
    if (!raw) {
      sessionStorage.setItem(STORAGE_KEYS.ADMIN_GAMES, JSON.stringify(INITIAL_ADMIN_GAMES));
      return [...INITIAL_ADMIN_GAMES];
    }
    return JSON.parse(raw);
  }

  private saveAdminGames(games: AdminGameDetail[]) {
    sessionStorage.setItem(STORAGE_KEYS.ADMIN_GAMES, JSON.stringify(games));
  }

  async getGames(params?: GameFilterParams): Promise<PaginatedResponse<GameCard>> {
    await delay(250);
    const games = this.getStoredGames();

    let filtered = [...games];

    // Filter by query (max 100 chars)
    if (params?.query && params.query.trim()) {
      const q = params.query.trim().toLowerCase().slice(0, 100);
      filtered = filtered.filter(
        (g) => g.title.toLowerCase().includes(q) || g.short_description.toLowerCase().includes(q)
      );
    }

    // Filter by tags (AND semantics, up to 5 slugs)
    if (params?.tags && params.tags.trim()) {
      const tagSlugs = params.tags
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 5);
      if (tagSlugs.length > 0) {
        filtered = filtered.filter((g) => {
          const gameTagSlugs = g.tags.map((t) => t.slug);
          return tagSlugs.every((reqTag) => gameTagSlugs.includes(reqTag));
        });
      }
    }

    // Filter by device
    if (params?.device) {
      filtered = filtered.filter((g) => g.supported_devices.includes(params.device!));
    }

    // Sort: newest or title_asc
    if (params?.sort === 'title_asc') {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      // Default: newest
      filtered.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
    }

    // Pagination using opaque cursor (base64 encoded index)
    const limit = Math.min(Math.max(params?.limit || 24, 1), 48);
    let startIndex = 0;
    if (params?.cursor) {
      try {
        const decoded = parseInt(atob(params.cursor), 10);
        if (!isNaN(decoded) && decoded >= 0) {
          startIndex = decoded;
        } else {
          throw createProblemError(400, 'INVALID_CURSOR', 'Cursor phân trang không hợp lệ');
        }
      } catch {
        throw createProblemError(400, 'INVALID_CURSOR', 'Cursor phân trang không hợp lệ');
      }
    }

    const sliced = filtered.slice(startIndex, startIndex + limit);
    const nextIndex = startIndex + limit;
    const hasMore = nextIndex < filtered.length;
    const nextCursor = hasMore ? btoa(nextIndex.toString()) : null;

    // Map to GameCard (strip detail specific props)
    const cards: GameCard[] = sliced.map((g) => ({
      id: g.id,
      slug: g.slug,
      title: g.title,
      short_description: g.short_description,
      author: g.author,
      thumbnail: g.thumbnail,
      tags: g.tags,
      supported_devices: g.supported_devices,
      published_at: g.published_at,
    }));

    return {
      data: cards,
      page: {
        next_cursor: nextCursor,
        has_more: hasMore,
      },
    };
  }

  async getGameDetail(slug: string): Promise<ApiResponse<GameDetail>> {
    await delay(200);
    const games = this.getStoredGames();
    const game = games.find((g) => g.slug === slug);
    if (!game) {
      throw createProblemError(404, 'NOT_FOUND', `Không tìm thấy trò chơi với mã "${slug}"`);
    }
    return { data: game };
  }

  async getTags(): Promise<ApiResponse<Tag[]>> {
    await delay(100);
    return { data: INITIAL_TAGS };
  }

  async getSubmissionRules(): Promise<ApiResponse<SubmissionRules>> {
    await delay(100);
    return { data: SUBMISSION_RULES };
  }

  async submitGame(
    payload: SubmissionPayload,
    idempotencyKey?: string
  ): Promise<ApiResponse<SubmissionCreatedResponse>> {
    await delay(400);

    // Check honeypot
    if (payload.website && payload.website.trim() !== '') {
      throw createProblemError(400, 'SPAM_DETECTED', 'Phát hiện yêu cầu không hợp lệ từ spam bot.');
    }

    // Check Idempotency
    if (idempotencyKey) {
      const storedMap = JSON.parse(sessionStorage.getItem(STORAGE_KEYS.IDEMPOTENCY) || '{}');
      if (storedMap[idempotencyKey]) {
        const cached = storedMap[idempotencyKey];
        if (cached.payloadHash === JSON.stringify(payload)) {
          return { data: cached.response };
        } else {
          throw createProblemError(
            409,
            'IDEMPOTENCY_CONFLICT',
            'Khóa Idempotency-Key đã được sử dụng với payload khác.'
          );
        }
      }
    }

    // Validate fields according to rules
    const errors: { field: string; code: string; message: string }[] = [];

    if (!payload.title || payload.title.length < 3 || payload.title.length > 100) {
      errors.push({
        field: 'title',
        code: 'INVALID_LENGTH',
        message: 'Tên game phải từ 3 đến 100 ký tự.',
      });
    }

    if (!payload.author_name || payload.author_name.length < 2 || payload.author_name.length > 100) {
      errors.push({
        field: 'author_name',
        code: 'INVALID_LENGTH',
        message: 'Tên tác giả / nhóm phải từ 2 đến 100 ký tự.',
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!payload.contact_email || !emailRegex.test(payload.contact_email) || payload.contact_email.length > 254) {
      errors.push({
        field: 'contact_email',
        code: 'INVALID_EMAIL',
        message: 'Email liên hệ không đúng định dạng hoặc vượt quá 254 ký tự.',
      });
    }

    if (!payload.short_description || payload.short_description.length < 20 || payload.short_description.length > 160) {
      errors.push({
        field: 'short_description',
        code: 'INVALID_LENGTH',
        message: 'Mô tả ngắn phải từ 20 đến 160 ký tự.',
      });
    }

    if (!payload.description || payload.description.length < 50 || payload.description.length > 5000) {
      errors.push({
        field: 'description',
        code: 'INVALID_LENGTH',
        message: 'Mô tả chi tiết phải từ 50 đến 5000 ký tự (chỉ plain text).',
      });
    }

    if (!payload.tag_slugs || payload.tag_slugs.length < 1 || payload.tag_slugs.length > 5) {
      errors.push({
        field: 'tag_slugs',
        code: 'INVALID_TAGS',
        message: 'Vui lòng chọn từ 1 đến 5 thể loại hợp lệ.',
      });
    }

    if (!payload.supported_devices || payload.supported_devices.length === 0) {
      errors.push({
        field: 'supported_devices',
        code: 'REQUIRED_FIELD',
        message: 'Chọn ít nhất một thiết bị hỗ trợ (desktop hoặc mobile).',
      });
    }

    if (!payload.controls || payload.controls.length < 10 || payload.controls.length > 1000) {
      errors.push({
        field: 'controls',
        code: 'INVALID_LENGTH',
        message: 'Hướng dẫn điều khiển phải từ 10 đến 1000 ký tự.',
      });
    }

    const httpsRegex = /^https:\/\/.+/i;
    if (!payload.handoff_url || !httpsRegex.test(payload.handoff_url) || payload.handoff_url.length > 2048) {
      errors.push({
        field: 'handoff_url',
        code: 'INVALID_URL',
        message: 'Link bàn giao build phải là đường dẫn HTTPS hợp lệ và dưới 2048 ký tự.',
      });
    }

    if (
      payload.thumbnail_handoff_url &&
      (!httpsRegex.test(payload.thumbnail_handoff_url) || payload.thumbnail_handoff_url.length > 2048)
    ) {
      errors.push({
        field: 'thumbnail_handoff_url',
        code: 'INVALID_URL',
        message: 'Link ảnh đại diện phải là đường dẫn HTTPS hợp lệ và dưới 2048 ký tự.',
      });
    }

    if (!payload.credits || payload.credits.length < 1 || payload.credits.length > 2000) {
      errors.push({
        field: 'credits',
        code: 'INVALID_LENGTH',
        message: 'Thông tin tác quyền & đóng góp phải từ 1 đến 2000 ký tự.',
      });
    }

    if (!payload.consent || !payload.consent.accepted) {
      errors.push({
        field: 'consent',
        code: 'CONSENT_REQUIRED',
        message: 'Bạn phải đồng ý với Điều khoản nộp và phát hành game.',
      });
    }

    if (!payload.captcha_token) {
      errors.push({
        field: 'captcha_token',
        code: 'CAPTCHA_REQUIRED',
        message: 'Vui lòng xác thực mã CAPTCHA bảo mật.',
      });
    }

    if (errors.length > 0) {
      throw createProblemError(400, 'VALIDATION_ERROR', 'Dữ liệu nộp game không hợp lệ. Vui lòng kiểm tra các trường bị lỗi.', errors);
    }

    // Generate submission
    const subId = 'sub-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6);
    const trackingToken = 'TRK-' + payload.title.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6).toUpperCase() + '-' + Math.random().toString(36).substring(2, 8).toUpperCase();

    const newSub: AdminSubmissionDetail = {
      id: subId,
      version: 1,
      title: payload.title,
      author_name: payload.author_name,
      contact_email: payload.contact_email,
      short_description: payload.short_description,
      description: payload.description,
      tag_slugs: payload.tag_slugs,
      supported_devices: payload.supported_devices,
      controls: payload.controls,
      handoff_url: payload.handoff_url,
      thumbnail_handoff_url: payload.thumbnail_handoff_url,
      credits: payload.credits,
      review_status: 'pending_technical',
      build_status: 'awaiting_build',
      publication_status: 'unpublished',
      display_status: 'awaiting_build',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      tracking_token: trackingToken,
      technical_checklist: {
        sandbox_compliant: false,
        no_eval_unsafe: false,
        clean_console: false,
        performance_60fps: false,
      },
      content_checklist: {
        no_explicit_content: false,
        proper_vietnamese: false,
        accurate_description: false,
      },
      allowed_actions: ['technical_review', 'edit_metadata'],
      internal_notes: ['Hệ thống vừa tiếp nhận bài nộp mới.'],
    };

    const subs = this.getStoredSubmissions();
    subs.unshift(newSub);
    this.saveSubmissions(subs);

    const response: SubmissionCreatedResponse = {
      submission_id: subId,
      tracking_token: trackingToken,
      review_status: 'pending_technical',
      build_status: 'awaiting_build',
      publication_status: 'unpublished',
      display_status: 'awaiting_build',
      next_action: 'wait',
    };

    // Cache idempotency
    if (idempotencyKey) {
      const storedMap = JSON.parse(sessionStorage.getItem(STORAGE_KEYS.IDEMPOTENCY) || '{}');
      storedMap[idempotencyKey] = {
        payloadHash: JSON.stringify(payload),
        response,
      };
      sessionStorage.setItem(STORAGE_KEYS.IDEMPOTENCY, JSON.stringify(storedMap));
    }

    return { data: response };
  }

  async checkSubmissionStatus(trackingToken: string): Promise<ApiResponse<SubmissionStatusData>> {
    await delay(300);
    const trimmed = trackingToken.trim();
    if (!trimmed) {
      throw createProblemError(400, 'MISSING_TOKEN', 'Vui lòng nhập mã tra cứu (tracking token).');
    }

    const subs = this.getStoredSubmissions();
    const found = subs.find((s) => s.tracking_token.toUpperCase() === trimmed.toUpperCase());
    if (!found) {
      throw createProblemError(
        404,
        'TRACKING_NOT_FOUND',
        'Không tìm thấy hồ sơ nộp game tương ứng với mã tra cứu này. Vui lòng kiểm tra lại chính xác mã đã lưu.'
      );
    }

    // Determine next_action based on display_status
    let nextAction: NextAction = 'wait';
    if (found.display_status === 'published') {
      nextAction = 'open_game';
    } else if (found.display_status === 'rejected') {
      nextAction = 'submit_new';
    } else if (found.display_status === 'build_failed' || found.display_status === 'publish_failed') {
      nextAction = 'contact_team';
    } else if (found.display_status === 'awaiting_build') {
      nextAction = 'wait';
    }

    // Construct public timeline without internal private notes or reviewer identity
    const timeline = [
      {
        timestamp: found.created_at,
        event: 'Tiếp nhận bài nộp',
        description: 'Đã nhận hồ sơ metadata và link bàn giao build từ tác giả.',
      },
    ];

    if (found.review_status === 'pending_content' || found.review_status === 'approved') {
      timeline.push({
        timestamp: found.updated_at,
        event: 'Kiểm thử kỹ thuật hoàn tất',
        description: 'Bản build đã vượt qua bài kiểm tra bảo mật và hiệu năng cơ bản.',
      });
    }

    if (found.review_status === 'approved') {
      timeline.push({
        timestamp: found.updated_at,
        event: 'Duyệt nội dung thành công',
        description: 'Trò chơi đã được phê duyệt nội dung và sẵn sàng vào hàng chờ phát hành.',
      });
    }

    if (found.publication_status === 'published') {
      timeline.push({
        timestamp: found.updated_at,
        event: 'Chính thức phát hành',
        description: 'Trò chơi đã xuất hiện công khai trên kho game trực tuyến.',
      });
    }

    if (found.review_status === 'rejected') {
      timeline.push({
        timestamp: found.updated_at,
        event: 'Từ chối hồ sơ',
        description: found.public_reason || 'Hồ sơ chưa đạt tiêu chuẩn kỹ thuật hoặc nội dung của nền tảng.',
      });
    }

    // Look up game if published
    let linkedGame: { slug: string; title: string } | null = null;
    if (found.publication_status === 'published') {
      const games = this.getStoredGames();
      const matched = games.find((g) => g.title.toLowerCase() === found.title.toLowerCase());
      if (matched) {
        linkedGame = { slug: matched.slug, title: matched.title };
      }
    }

    return {
      data: {
        submission_id: found.id,
        review_status: found.review_status,
        build_status: found.build_status,
        publication_status: found.publication_status,
        display_status: found.display_status,
        next_action: nextAction,
        public_reason: found.public_reason || null,
        public_timeline: timeline,
        game: linkedGame,
      },
    };
  }

  // Admin Auth & Functions
  async adminLogin(email: string, _password?: string): Promise<{ token: string; me: AdminMeData }> {
    await delay(300);
    const em = email.toLowerCase().trim();

    let actor = { id: 'usr-001', display_name: 'Minh (Admin)' };
    let roles = ['admin', 'technical_reviewer', 'content_reviewer', 'operator'];
    let permissions = [
      'review:technical',
      'review:content',
      'games:publish',
      'games:suspend',
      'releases:manage',
      'metadata:edit',
    ];

    if (em.includes('cuong') || em.includes('tech')) {
      actor = { id: 'usr-cuong', display_name: 'Cường (QA Kỹ thuật)' };
      roles = ['technical_reviewer'];
      permissions = ['review:technical', 'metadata:edit'];
    } else if (em.includes('ha') || em.includes('content')) {
      actor = { id: 'usr-ha', display_name: 'Hà (Kiểm duyệt nội dung)' };
      roles = ['content_reviewer'];
      permissions = ['review:content', 'metadata:edit'];
    } else if (em.includes('tung') || em.includes('operator')) {
      actor = { id: 'usr-tung', display_name: 'Tùng (Vận hành & Tích hợp)' };
      roles = ['operator'];
      permissions = ['games:publish', 'games:suspend', 'releases:manage'];
    }

    const token = 'mock-bearer-token-' + actor.id + '-' + Date.now();
    sessionStorage.setItem('gamelib_staff_token', token);
    sessionStorage.setItem(
      'gamelib_staff_me',
      JSON.stringify({ actor, roles, permissions })
    );

    return {
      token,
      me: { actor, roles, permissions },
    };
  }

  async getAdminMe(_token: string): Promise<ApiResponse<AdminMeData>> {
    await delay(100);
    const raw = sessionStorage.getItem('gamelib_staff_me');
    if (!raw) {
      throw createProblemError(401, 'SESSION_EXPIRED', 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.');
    }
    return { data: JSON.parse(raw) };
  }

  async getAdminSubmissions(
    _token: string,
    filter?: { status?: string; cursor?: string }
  ): Promise<PaginatedResponse<AdminSubmissionDetail>> {
    await delay(200);
    const subs = this.getStoredSubmissions();
    let filtered = [...subs];

    if (filter?.status && filter.status !== 'all') {
      filtered = filtered.filter(
        (s) => s.review_status === filter.status || s.display_status === filter.status
      );
    }

    return {
      data: filtered,
      page: {
        next_cursor: null,
        has_more: false,
      },
    };
  }

  async getAdminSubmission(_token: string, id: string): Promise<ApiResponse<AdminSubmissionDetail>> {
    await delay(150);
    const subs = this.getStoredSubmissions();
    const found = subs.find((s) => s.id === id);
    if (!found) {
      throw createProblemError(404, 'NOT_FOUND', `Không tìm thấy bài nộp "${id}".`);
    }
    return { data: found };
  }

  async updateAdminSubmissionMetadata(
    _token: string,
    id: string,
    metadata: { title?: string; short_description?: string; tag_slugs?: string[] },
    expectedVersion: number
  ): Promise<ApiResponse<AdminSubmissionDetail>> {
    await delay(250);
    const subs = this.getStoredSubmissions();
    const index = subs.findIndex((s) => s.id === id);
    if (index === -1) {
      throw createProblemError(404, 'NOT_FOUND', `Không tìm thấy bài nộp "${id}".`);
    }

    const current = subs[index];
    if (current.version !== expectedVersion) {
      throw createProblemError(
        409,
        'VERSION_CONFLICT',
        `Dữ liệu đã bị thay đổi bởi người khác (version hiện tại là ${current.version}, mong đợi ${expectedVersion}). Vui lòng tải lại và kiểm tra.`
      );
    }

    current.version += 1;
    current.updated_at = new Date().toISOString();
    if (metadata.title) current.title = metadata.title;
    if (metadata.short_description) current.short_description = metadata.short_description;
    if (metadata.tag_slugs) current.tag_slugs = metadata.tag_slugs;

    subs[index] = current;
    this.saveSubmissions(subs);
    return { data: current };
  }

  async technicalReview(
    _token: string,
    id: string,
    payload: TechnicalReviewPayload
  ): Promise<ApiResponse<AdminSubmissionDetail>> {
    await delay(300);
    const subs = this.getStoredSubmissions();
    const index = subs.findIndex((s) => s.id === id);
    if (index === -1) {
      throw createProblemError(404, 'NOT_FOUND', `Không tìm thấy bài nộp "${id}".`);
    }

    const current = subs[index];
    if (current.version !== payload.expected_version) {
      throw createProblemError(
        409,
        'VERSION_CONFLICT',
        `Dữ liệu đã bị sửa đổi (phiên bản hiện tại là ${current.version}). Vui lòng refresh và thử lại.`
      );
    }

    if (payload.decision === 'reject' && (!payload.public_reason || payload.public_reason.trim() === '')) {
      throw createProblemError(400, 'REASON_REQUIRED', 'Khi từ chối bài nộp, bắt buộc phải cung cấp lý do công khai gửi cho tác giả.');
    }

    current.version += 1;
    current.updated_at = new Date().toISOString();
    current.technical_checklist = payload.checklist;

    if (payload.decision === 'pass') {
      current.review_status = 'pending_content';
      current.display_status = 'pending_content';
      current.allowed_actions = ['content_review', 'edit_metadata'];
    } else {
      current.review_status = 'rejected';
      current.display_status = 'rejected';
      current.public_reason = payload.public_reason;
      current.allowed_actions = [];
    }

    if (payload.internal_note) {
      current.internal_notes = current.internal_notes || [];
      current.internal_notes.push(`[Technical Review] ${payload.internal_note}`);
    }

    subs[index] = current;
    this.saveSubmissions(subs);
    return { data: current };
  }

  async contentReview(
    _token: string,
    id: string,
    payload: ContentReviewPayload
  ): Promise<ApiResponse<AdminSubmissionDetail>> {
    await delay(300);
    const subs = this.getStoredSubmissions();
    const index = subs.findIndex((s) => s.id === id);
    if (index === -1) {
      throw createProblemError(404, 'NOT_FOUND', `Không tìm thấy bài nộp "${id}".`);
    }

    const current = subs[index];
    if (current.version !== payload.expected_version) {
      throw createProblemError(
        409,
        'VERSION_CONFLICT',
        `Dữ liệu đã bị sửa đổi (phiên bản hiện tại là ${current.version}). Vui lòng refresh và kiểm tra lại.`
      );
    }

    if (payload.decision === 'reject' && (!payload.public_reason || payload.public_reason.trim() === '')) {
      throw createProblemError(400, 'REASON_REQUIRED', 'Bắt buộc phải cung cấp lý do công khai khi từ chối.');
    }

    current.version += 1;
    current.updated_at = new Date().toISOString();
    current.content_checklist = payload.checklist;

    if (payload.decision === 'pass') {
      current.review_status = 'approved';
      current.display_status = 'approved';
      current.allowed_actions = ['create_release', 'edit_metadata'];
    } else {
      current.review_status = 'rejected';
      current.display_status = 'rejected';
      current.public_reason = payload.public_reason;
      current.allowed_actions = [];
    }

    if (payload.internal_note) {
      current.internal_notes = current.internal_notes || [];
      current.internal_notes.push(`[Content Review] ${payload.internal_note}`);
    }

    subs[index] = current;
    this.saveSubmissions(subs);
    return { data: current };
  }

  async getAdminGame(_token: string, id: string): Promise<ApiResponse<AdminGameDetail>> {
    await delay(150);
    const games = this.getStoredAdminGames();
    const found = games.find((g) => g.id === id || g.slug === id);
    if (!found) {
      throw createProblemError(404, 'NOT_FOUND', `Không tìm thấy trò chơi quản trị "${id}".`);
    }
    return { data: found };
  }

  async publishGame(_token: string, id: string, expectedVersion: number): Promise<ApiResponse<AdminGameDetail>> {
    await delay(350);
    const adminGames = this.getStoredAdminGames();
    const index = adminGames.findIndex((g) => g.id === id || g.slug === id);
    if (index === -1) {
      throw createProblemError(404, 'NOT_FOUND', `Không tìm thấy trò chơi "${id}".`);
    }

    const current = adminGames[index];
    if (current.version !== expectedVersion) {
      throw createProblemError(
        409,
        'VERSION_CONFLICT',
        `Xung đột phiên bản: dữ liệu đã thay đổi trên hệ thống. Vui lòng tải lại trang.`
      );
    }

    current.version += 1;
    current.publication_status = 'published';
    current.published_at = new Date().toISOString();
    current.allowed_actions = ['suspend', 'activate_release', 'edit_metadata'];

    adminGames[index] = current;
    this.saveAdminGames(adminGames);

    // Also update public catalog
    const catalogGames = this.getStoredGames();
    const catalogIndex = catalogGames.findIndex((cg) => cg.slug === current.slug);
    if (catalogIndex >= 0) {
      catalogGames[catalogIndex].published_at = current.published_at;
      this.saveGames(catalogGames);
    }

    return { data: current };
  }

  async suspendGame(_token: string, id: string, _reason: string, expectedVersion: number): Promise<ApiResponse<AdminGameDetail>> {
    await delay(300);
    const adminGames = this.getStoredAdminGames();
    const index = adminGames.findIndex((g) => g.id === id || g.slug === id);
    if (index === -1) {
      throw createProblemError(404, 'NOT_FOUND', `Không tìm thấy trò chơi "${id}".`);
    }

    const current = adminGames[index];
    if (current.version !== expectedVersion) {
      throw createProblemError(409, 'VERSION_CONFLICT', 'Xung đột phiên bản dữ liệu.');
    }

    current.version += 1;
    current.publication_status = 'suspended';
    current.allowed_actions = ['publish', 'activate_release', 'edit_metadata'];

    adminGames[index] = current;
    this.saveAdminGames(adminGames);
    return { data: current };
  }

  async activateRelease(_token: string, gameId: string, releaseId: string): Promise<ApiResponse<AdminGameDetail>> {
    await delay(300);
    const adminGames = this.getStoredAdminGames();
    const index = adminGames.findIndex((g) => g.id === gameId);
    if (index === -1) {
      throw createProblemError(404, 'NOT_FOUND', `Không tìm thấy trò chơi.`);
    }

    const current = adminGames[index];
    current.releases.forEach((rel) => {
      rel.status = rel.id === releaseId ? 'active' : 'ready';
    });
    current.version += 1;

    adminGames[index] = current;
    this.saveAdminGames(adminGames);
    return { data: current };
  }
}
