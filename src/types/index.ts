export type DeviceType = 'desktop' | 'mobile';

export interface Author {
  display_name: string;
}

export interface Thumbnail {
  url: string;
  alt: string;
  width: number;
  height: number;
}

export interface Tag {
  slug: string;
  label: string;
}

export interface GameCard {
  id: string;
  slug: string;
  title: string;
  short_description: string;
  author: Author;
  thumbnail: Thumbnail | null;
  tags: Tag[];
  supported_devices: DeviceType[];
  published_at: string;
}

export interface Screenshot {
  url: string;
  alt: string;
  width: number;
  height: number;
}

export interface Credit {
  name: string;
  role: string;
}

export interface Controls {
  keyboard: string | null;
  touch: string | null;
}

export interface PlayInfo {
  url: string;
  release_version: string;
  aspect_ratio: number; // width / height
  orientation: 'landscape' | 'portrait' | 'auto';
  fullscreen_supported: boolean;
}

export interface GameDetail extends GameCard {
  description: string;
  screenshots: Screenshot[];
  credits: Credit[];
  controls: Controls;
  languages: string[];
  content_warnings: string[];
  play: PlayInfo | null;
}

export interface Pagination {
  next_cursor: string | null;
  has_more: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: Pagination;
}

export interface ApiResponse<T> {
  data: T;
}

export type ReviewStatus = 'pending_technical' | 'pending_content' | 'approved' | 'rejected';
export type BuildStatus = 'awaiting_build' | 'uploaded' | 'processing' | 'ready' | 'failed';
export type PublicationStatus = 'unpublished' | 'publishing' | 'published' | 'publish_failed' | 'suspended';

export type DisplayStatus =
  | 'awaiting_build'
  | 'processing_build'
  | 'build_failed'
  | 'pending_technical'
  | 'pending_content'
  | 'approved'
  | 'publishing'
  | 'publish_failed'
  | 'published'
  | 'rejected'
  | 'suspended';

export type NextAction = 'handoff_build' | 'wait' | 'contact_team' | 'submit_new' | 'open_game';

export interface TimelineEvent {
  timestamp: string;
  event: string;
  description: string;
}

export interface SubmissionStatusData {
  submission_id: string;
  review_status: ReviewStatus;
  build_status: BuildStatus;
  publication_status: PublicationStatus;
  display_status: DisplayStatus;
  next_action: NextAction;
  public_reason: string | null;
  public_timeline: TimelineEvent[];
  game: {
    slug: string;
    title: string;
  } | null;
}

export interface SubmissionRules {
  title_min: number;
  title_max: number;
  author_min: number;
  author_max: number;
  short_desc_min: number;
  short_desc_max: number;
  desc_min: number;
  desc_max: number;
  max_tags: number;
  controls_min: number;
  controls_max: number;
  credits_min: number;
  credits_max: number;
  consent_version: string;
  consent_url: string;
  handoff_instructions: string;
}

export interface SubmissionPayload {
  title: string;
  author_name: string;
  contact_email: string;
  short_description: string;
  description: string;
  tag_slugs: string[];
  supported_devices: DeviceType[];
  controls: string;
  handoff_url: string;
  thumbnail_handoff_url?: string;
  credits: string;
  consent: {
    accepted: boolean;
    version: string;
  };
  captcha_token: string;
  website?: string; // honeypot
}

export interface SubmissionCreatedResponse {
  submission_id: string;
  tracking_token: string;
  review_status: ReviewStatus;
  build_status: BuildStatus;
  publication_status: PublicationStatus;
  display_status: DisplayStatus;
  next_action: NextAction;
}

export interface AdminActor {
  id: string;
  display_name: string;
}

export interface AdminMeData {
  actor: AdminActor;
  roles: string[];
  permissions: string[];
}

export interface ReviewChecklist {
  [key: string]: boolean;
}

export interface AdminSubmissionDetail {
  id: string;
  version: number;
  title: string;
  author_name: string;
  contact_email: string;
  short_description: string;
  description: string;
  tag_slugs: string[];
  supported_devices: DeviceType[];
  controls: string;
  handoff_url: string;
  thumbnail_handoff_url?: string;
  credits: string;
  review_status: ReviewStatus;
  build_status: BuildStatus;
  publication_status: PublicationStatus;
  display_status: DisplayStatus;
  created_at: string;
  updated_at: string;
  tracking_token: string;
  technical_checklist?: ReviewChecklist;
  content_checklist?: ReviewChecklist;
  public_reason?: string | null;
  internal_notes?: string[];
  allowed_actions: Array<'technical_review' | 'content_review' | 'create_release' | 'edit_metadata'>;
}

export interface ReleaseInfo {
  id: string;
  version: string;
  status: 'processing' | 'ready' | 'failed' | 'active';
  created_at: string;
  uploaded_by: string;
  file_url?: string;
}

export interface AdminGameDetail {
  id: string;
  version: number;
  slug: string;
  title: string;
  submission_id: string;
  short_description: string;
  description: string;
  author: Author;
  thumbnail: Thumbnail | null;
  tags: Tag[];
  supported_devices: DeviceType[];
  published_at: string | null;
  publication_status: PublicationStatus;
  releases: ReleaseInfo[];
  allowed_actions: Array<'publish' | 'suspend' | 'activate_release' | 'edit_metadata' | 'retry_publish'>;
}

export interface ApiFieldError {
  field: string;
  code: string;
  message: string;
}

export interface ApiProblemError {
  type: string;
  title: string;
  status: number;
  code: string;
  request_id: string;
  errors?: ApiFieldError[];
}
