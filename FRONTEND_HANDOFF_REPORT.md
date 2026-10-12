# Báo cáo bàn giao yêu cầu Frontend — Game Library

**Ngày:** 10/10/2026 · **Phiên bản:** 1.0 đề xuất chốt  
**Gửi:** Hà — Frontend; Minh — Backend/Product; Tùng — Game Integrator; Cường — QA  
**Mục tiêu:** frontend xây đúng màn hình, dữ liệu và luồng tích hợp; tránh lệch giữa kế hoạch FED cũ và thiết kế backend mới.

## 1. Kết luận bàn giao

Frontend có thể bắt đầu wireframe, component và mock theo báo cáo này. Chỉ chuyển sang API thật khi endpoint được backend bàn giao cùng schema và kết quả kiểm thử. Báo cáo là đặc tả đề xuất để hai bên xác nhận, chưa phải contract đã ký hoặc mô tả API đã hoạt động.

**Hiện trạng đã kiểm tra trong repo:** `index.js` chỉ trả `{message,status,timestamp}` với HTTP 200 cho mọi request. Chưa có API game, Auth, database, submission, upload, OpenAPI hoặc fixture pack. HTTP 200 hiện tại không chứng minh endpoint nghiệp vụ tồn tại.

**Đường dữ liệu thống nhất đề xuất:** frontend gọi backend `/api/v1` cho dữ liệu và mutation nghiệp vụ. Auth provider phục vụ đăng nhập nhân sự; ảnh/build tải trực tiếp từ storage/CDN qua URL do hệ thống cấp. Frontend không đọc/ghi bảng nghiệp vụ trực tiếp bằng Supabase SDK trong thiết kế này.

## 2. Phạm vi giao diện

| Mức             | Chức năng                                                                                                          | Yêu cầu frontend                                                     |
| --------------- | ------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------- |
| P0 — launch     | Kho game, search/filter, detail/chơi, form metadata, tra cứu, staff login, hàng chờ/duyệt, vận hành game tối thiểu | Dựng đủ màn hình và trạng thái ở mục 4                               |
| P1 — sau P0     | Game tương tự, upload ZIP tự phục vụ cho tác giả, báo lỗi game, dashboard/tag editor                               | Không để thiếu P1 chặn P0; chưa làm integration khi contract chưa có |
| P2 — sau launch | Đăng ký người chơi, favorites, collection, review, leaderboard                                                     | Chưa đưa vào UI MVP                                                  |

Người chơi và người nộp game không cần tài khoản. Chỉ nhân sự quản trị đăng nhập bằng tài khoản được mời. Form MVP nhận metadata và link bàn giao; Tùng tiếp nhận build rồi upload qua công cụ nội bộ.

P0/P1 trong báo cáo là mức ưu tiên feature, không phải severity của bug.

## 3. Những nội dung cũ không dùng để code integration

| Nội dung cũ                             | Quy ước mới cần dùng                                   | Lý do                                                 |
| --------------------------------------- | ------------------------------------------------------ | ----------------------------------------------------- |
| Frontend fetch bảng Supabase trực tiếp  | Backend REST `/api/v1`                                 | Một nơi kiểm quyền, lọc dữ liệu và chuẩn hóa response |
| `/games?tag=&q=`                        | `/api/v1/games?tags=&query=`                           | Chốt một tên route và query                           |
| `author` là chuỗi                       | `author.display_name` trong public DTO                 | Tách tên public khỏi contact riêng                    |
| `thumbnail_url`                         | `thumbnail = {url,alt,width,height}` hoặc null         | Có alt/dimensions và placeholder                      |
| Tags dạng chuỗi tự do                   | `tags = [{slug,label}]` ở response; `tag_slugs` ở form | Backend kiểm taxonomy, frontend hiển thị label        |
| `build_url` nhập tùy ý rồi iframe       | `play.url` của release active do hệ thống quản lý      | Không chạy trực tiếp link bàn giao chưa kiểm          |
| Một `status=approved` nghĩa là lên web  | Review/build/publication là ba phần riêng              | Đã duyệt vẫn có thể đang publish hoặc publish lỗi     |
| Phân trang chưa xác định                | Cursor + load more                                     | Không dựng số trang hoặc total count ở P0             |
| Duyệt bằng sửa status trên dashboard DB | API transition có kiểm quyền và audit                  | UI và backend cùng tuân theo cổng duyệt               |

Không tự viết adapter đoán cả hai schema rồi bỏ qua lỗi. Nếu backend trả field khác, báo sai contract và xử lý tại nguồn. Khi OpenAPI được chốt, OpenAPI là nguồn chuẩn cho request/response; báo cáo này là hướng dẫn UI và nghiệp vụ.

## 4. Bản đồ màn hình và API

Các endpoint dưới đây là **đề xuất, chưa live**. Prefix được ghi đầy đủ để tránh gọi sai.

| UI             | Route frontend           | API cần dùng                                                                   | Nội dung bắt buộc                                              |
| -------------- | ------------------------ | ------------------------------------------------------------------------------ | -------------------------------------------------------------- |
| Kho game       | `/`                      | `GET /api/v1/games`, `GET /api/v1/tags`                                        | Cards, search, filter tags/device, sort, load more             |
| Chi tiết/chơi  | `/games/:slug`           | `GET /api/v1/games/{slug}`                                                     | Description, media, credit, controls, iframe từ `play.url`     |
| Nộp game       | `/submit`                | `GET /api/v1/submission-rules`, `GET /api/v1/tags`, `POST /api/v1/submissions` | Form, consent, CAPTCHA, field errors, success và copy token    |
| Tra cứu        | `/submission-status`     | `POST /api/v1/submissions/status`                                              | Nhập token, trạng thái/timeline/lý do, link game nếu đã public |
| Login nhân sự  | `/admin/login`           | Auth provider + `GET /api/v1/admin/me`                                         | Login, MFA/reset theo provider, session expiry, permission     |
| Hàng chờ       | `/admin/submissions`     | `GET /api/v1/admin/submissions`                                                | List/table, filter review status, pagination                   |
| Chi tiết duyệt | `/admin/submissions/:id` | Detail, metadata patch, technical/content review ở mục 9                       | Checklist, preview an toàn, pass/reject, lịch sử, conflict     |
| Vận hành game  | `/admin/games/:id`       | Staff game detail + publish/suspend/activate/metadata APIs                     | Build state, release list, publish retry, suspend/rollback     |

Trang About/Credits và hướng dẫn nộp có thể dùng nội dung tĩnh. UI quản trị chỉ cần đủ chức năng; không cần CMS/dashboard tổng quát trước launch.

## 5. Quy tắc API client

- Cấu hình `API_BASE_URL = <backend-origin>/api/v1`; phần gọi endpoint nối `/games`, không nối `/api/v1` lần hai. Origin thật cho local/staging/prod do backend/deploy bàn giao, không tự giả định domain.
- UI route `/games/:slug` và API route `/api/v1/games/{slug}` là hai đường khác nhau.
- Public JSON request dùng `Content-Type: application/json`; staff API dùng `Authorization: Bearer <access_token>` đã nhận từ Auth. Không gửi secret/service-role key.
- Tách API client khỏi component. Mock và API thật dùng cùng interface; không bật mock fallback trong production để che lỗi API.
- Nếu frontend/backend khác origin, backend phải cho phép origin cụ thể và preflight cho method/header thực tế, bao gồm `Authorization`, `Idempotency-Key`, `Content-Type`; expose `Retry-After` để UI đọc khi rate limit. Chốt/test trên staging thật.
- Xác thực staff và refresh session theo Auth SDK/config bàn giao. Không mặc định bật cookie credentials khi thiết kế đang dùng Bearer token; nếu đổi sang cookie phải chốt lại CORS và CSRF.
- Public GET có thể retry giới hạn. Mutation không retry tự động nếu chưa có quy tắc idempotency; không tự resend sau đăng nhập lại.

Phân biệt lỗi khi báo backend: không tới được origin / CORS / HTTP 401–403 / sai response schema / file game iframe lỗi. Gửi endpoint, method, HTTP status nếu có, `request_id`, thời gian và bước tái hiện; không gửi token/PII/secret trong ảnh log hoặc nhóm chat.

## 6. Dữ liệu cho Home và Detail

### 6.1 GameCard

| Field                        | Kiểu đề xuất                       | Cách dùng                                   |
| ---------------------------- | ---------------------------------- | ------------------------------------------- |
| `id`                         | UUID string                        | React/list key; không dùng làm tên hiển thị |
| `slug`                       | string                             | Navigation tới detail                       |
| `title`, `short_description` | string                             | Card title/summary                          |
| `author`                     | `{display_name:string}`            | Tên tác giả/nhóm; không có email            |
| `thumbnail`                  | `{url,alt,width,height}` hoặc null | Ảnh/placeholder, giữ tỷ lệ ổn định          |
| `tags`                       | `[{slug:string,label:string}]`     | Chips/filter label                          |
| `supported_devices`          | array `desktop`/`mobile`           | Badge thiết bị đã được QA                   |
| `published_at`               | ISO 8601 UTC string                | Format theo locale phía UI                  |

Response list: `{data: GameCard[], page: {next_cursor: string|null, has_more: boolean}}`. Detail và các response object dùng `{data: ...}`; lỗi không nằm trong envelope `data`. Mảng không có dữ liệu dùng `[]`, không dùng null. Optional object như thumbnail dùng null.

```json
{
  "data": [
    {
      "id": "00000000-0000-4000-8000-000000000001",
      "slug": "pixel-runner",
      "title": "Pixel Runner",
      "short_description": "Game platformer do sinh viên thực hiện.",
      "author": { "display_name": "Nhóm Pixel" },
      "thumbnail": null,
      "tags": [{ "slug": "platformer", "label": "Platformer" }],
      "supported_devices": ["desktop", "mobile"],
      "published_at": "2026-12-25T02:00:00Z"
    }
  ],
  "page": { "next_cursor": null, "has_more": false }
}
```

Ví dụ trên là dữ liệu mẫu, không phải response hiện có từ backend.

### 6.2 Tìm kiếm và pagination

`query`: tối đa 100 ký tự; `tags`: tối đa 5 slug, phân cách dấu phẩy, semantics AND; `device`: desktop hoặc mobile; `sort`: newest hoặc title_asc; `limit`: mặc định 24, tối đa 48; `cursor`: token opaque từ response trước.

Khi đổi filter/search/sort, bỏ cursor và tải lại từ đầu. Nên debounce search khoảng 300 ms, cancel/ignore request cũ để response chậm không ghi đè kết quả mới. Backend sắp xếp ổn định với ID tie-breaker. Chưa có `total_count`, không hiển thị số trang hoặc số kết quả chính xác tự suy ra.

### 6.3 GameDetail và chơi

GameDetail bổ sung vào GameCard: description plain text, screenshots, credits, controls, languages, content warnings và play. Đề xuất chuẩn hóa `screenshots` thành media objects, `credits` thành `[{name,role}]`, `controls` thành `{keyboard:string|null,touch:string|null}`, languages/content warnings thành string arrays. Các shape này cần đưa vào OpenAPI trước integration; form credits/controls dạng text phải được backend/editor chuẩn hóa, frontend không tự parse text để suy ra object.

`play = {url, release_version, aspect_ratio, orientation, fullscreen_supported}`; `aspect_ratio` là số width/height > 0; orientation là landscape/portrait/auto. URL là release active trên origin chơi riêng. Các field proposed ở đây không được coi là Auth secret.

Giữ placeholder khi ảnh lỗi; nút chơi chỉ render khi detail có play hợp lệ. Iframe có loading/timeout/retry; `load` không chứng minh game engine chạy thành công. Chính sách sandbox, fullscreen, permissions và kiểm tra `postMessage` nếu có phải theo embed spec do Tùng/Hà bàn giao, không tự mở mọi quyền cho iframe.

## 7. Form nộp và tra cứu

### 7.1 Trường form

| Field API               | Validation đề xuất                                                   |
| ----------------------- | -------------------------------------------------------------------- |
| `title`                 | Required, 3–100 ký tự                                                |
| `author_name`           | Required, 2–100                                                      |
| `contact_email`         | Required, email, ≤ 254; ghi rõ không công khai                       |
| `short_description`     | Required, 20–160                                                     |
| `description`           | Required, 50–5000, plain text                                        |
| `tag_slugs`             | Required, 1–5 tag hợp lệ                                             |
| `supported_devices`     | Required, ít nhất một trong desktop/mobile; claim chờ QA             |
| `controls`              | Required text, 10–1000                                               |
| `handoff_url`           | Required, HTTPS, ≤ 2048; link bàn giao không dùng để chơi            |
| `thumbnail_handoff_url` | Optional, HTTPS, ≤ 2048 nếu có                                       |
| `credits`               | Required text, 1–2000                                                |
| `consent`               | `{accepted:true, version:<current-version>}`                         |
| `captcha_token`         | Token xác minh server theo provider                                  |
| `website`               | Honeypot string, phải rỗng; không dùng như thông tin website tác giả |

`submission-rules` sẽ cung cấp validation limits, enum, consent version/URL và hướng dẫn bàn giao; CAPTCHA site key/chế độ môi trường do cấu hình bàn giao. CAPTCHA secret chỉ ở server. Không dựng public file uploader cho P0.

Không gửi role, VIP, status, owner, published_at hoặc build_url. Gắn lỗi theo field API; không chỉ hiển thị toast chung khi một trường sai. Metadata render dưới dạng text, không raw HTML.

### 7.2 Nộp, success và retry

POST submissions đề xuất trả HTTP 201: `{data:{submission_id,tracking_token,review_status,build_status,publication_status,display_status,next_action}}`. Key `tracking_token` là tên thống nhất; không đổi thành `token`/`tracking_code` trong API client.

Mỗi lần nộp logic có một `Idempotency-Key`. Khi timeout không xác định kết quả, giữ input và retry cùng key; không tạo bài mới tự động. Backend phải bàn giao quy tắc replay/CAPTCHA, TTL và response phục hồi token trước khi nối form thật. Đề xuất TTL replay 24 giờ; đây chưa phải cam kết đã triển khai.

Success cần hiển thị copy/lưu token, hướng dẫn tra cứu và cảnh báo không chia sẻ token. Không đưa token vào URL, analytics hoặc log. Không tự lưu dài hạn trong localStorage như mặc định; việc giữ token qua reload cần quyết định riêng. Mất token ngoài cửa sổ retry hiện chưa có API recovery.

### 7.3 Tra cứu

`POST /api/v1/submissions/status` nhận `{tracking_token}` trong body. Đề xuất response `{data:{submission_id,review_status,build_status,publication_status,display_status,next_action,public_reason,public_timeline,game}}`.

`public_reason` là string hoặc null; timeline chỉ chứa sự kiện dành cho người nộp, không có internal note/scanner logs/reviewer email. `game` là `{slug,title}` khi published, ngược lại null. Backend ánh xạ display status và next action; UI không suy luận chỉ từ approved.

## 8. State mapping

### 8.1 Enum backend

- Review: pending_technical, pending_content, approved, rejected.
- Build: awaiting_build, uploaded, processing, ready, failed.
- Publication: unpublished, publishing, published, publish_failed, suspended.

### 8.2 Enum hiển thị đề xuất cho contract

| `display_status`    | Nhãn UI                 |
| ------------------- | ----------------------- |
| `awaiting_build`    | Chờ bàn giao build      |
| `processing_build`  | Đang kiểm tra build     |
| `build_failed`      | Build cần xử lý         |
| `pending_technical` | Chờ QA kỹ thuật         |
| `pending_content`   | Chờ duyệt nội dung      |
| `approved`          | Đã duyệt, chờ phát hành |
| `publishing`        | Đang phát hành          |
| `publish_failed`    | Phát hành gặp lỗi       |
| `published`         | Đã lên kho              |
| `rejected`          | Từ chối                 |
| `suspended`         | Tạm ngừng               |

`next_action` đề xuất: `handoff_build`, `wait`, `contact_team`, `submit_new`, `open_game`; dạng enum, UI map sang text/nút. Khi gặp enum chưa biết, hiển thị trạng thái chưa hỗ trợ và ghi báo lỗi contract, không mặc định coi là approved/published.

Luồng duyệt: metadata → build an toàn → QA kỹ thuật → duyệt nội dung → approved → publishing → published. Game pending/rejected/suspended không xuất hiện trong public catalog. Build/publication fail có thể cần retry vận hành, không nhất thiết là reject bài nộp.

## 9. UI quản trị và quyền

`GET /api/v1/admin/me` đề xuất trả `{data:{actor:{id,display_name},roles,permissions}}`; detail trả `version` và `allowed_actions`. Nút hiển thị theo actions server trả; quyền vẫn được backend kiểm lại mỗi request.

| Actor              | UI action chính                                              |
| ------------------ | ------------------------------------------------------------ |
| Technical reviewer | Technical pass/reject khi build ready                        |
| Content reviewer   | Content pass/reject sau technical pass                       |
| Release operator   | Upload nội bộ, kiểm job, publish/retry/rollback đủ điều kiện |
| Admin              | Quyền được cấp theo API; xử lý ngoại lệ có reason/audit      |

| API / suffix sau `/api/v1`                                              | Mục đích                                              |
| ----------------------------------------------------------------------- | ----------------------------------------------------- |
| `GET /admin/submissions`, `GET /admin/submissions/{id}`                 | Queue/detail                                          |
| `PATCH /admin/submissions/{id}/metadata`                                | Chỉnh metadata trước publish                          |
| `POST /admin/submissions/{id}/technical-review`                         | Technical decision                                    |
| `POST /admin/submissions/{id}/content-review`                           | Content decision                                      |
| `POST /admin/submissions/{id}/releases`                                 | Tạo release và phiên operator upload                  |
| `POST /admin/releases/{id}/complete-upload`, `GET /admin/releases/{id}` | Bắt đầu xử lý và đọc trạng thái                       |
| `GET /admin/games/{id}`                                                 | Detail nội bộ, release list, version, allowed actions |
| `PATCH /admin/games/{id}/metadata`                                      | Chỉnh metadata public                                 |
| `POST /admin/games/{id}/publish`, `POST /admin/games/{id}/suspend`      | Publish/retry, ngừng game                             |
| `POST /admin/releases/{id}/activate`                                    | Activate/rollback release hợp lệ                      |

`GET /admin/games/{id}` được bổ sung để UI vận hành không phải lấy nhầm DTO public hoặc đoán release list. Full schemas/filter/checklist/action enums của các API staff còn phải bàn giao trong OpenAPI trước khi nối UI thật.

Review payload đề xuất: `{decision:"pass"|"reject",checklist,public_reason,internal_note,expected_version}`. Checklist cụ thể do QA/content chốt; reject bắt buộc public reason. Các mutation state dùng version và idempotency theo contract. Khi 409, refresh detail, báo dữ liệu đã thay đổi và yêu cầu người thao tác kiểm lại; không tự duyệt lại.

## 10. Lỗi và trạng thái UI bắt buộc

Lỗi dùng `application/problem+json` với `{type,title,status,code,request_id,errors?}`; validation errors là `[{field,code,message}]`. Đề xuất `type:"about:blank"` khi chưa có URL mô tả lỗi. Frontend xử lý theo code, không parse câu chữ.

| Tình huống                          | Hành vi UI                                                         |
| ----------------------------------- | ------------------------------------------------------------------ |
| 400 VALIDATION_ERROR                | Gắn lỗi theo field, giữ input                                      |
| 400 INVALID_CURSOR                  | Reset pagination và báo tải lại                                    |
| 401 AUTH_REQUIRED/SESSION_EXPIRED   | Login lại, không tự resend mutation                                |
| 403 FORBIDDEN                       | Không có quyền; không giả thành danh sách rỗng                     |
| 404 NOT_FOUND/TRACKING_NOT_FOUND    | Not found/token không hợp lệ; không lộ private data                |
| 409 VERSION_CONFLICT/STATE_CONFLICT | Refresh và kiểm lại thao tác                                       |
| 409 IDEMPOTENCY_CONFLICT            | Không dùng key cũ cho dữ liệu khác                                 |
| 413 PAYLOAD_TOO_LARGE               | Nêu giới hạn theo rules                                            |
| 429 RATE_LIMITED                    | Retry-After countdown, giữ input                                   |
| 5xx/network                         | Error/retry có giới hạn; mutation timeout là kết quả chưa xác định |

| Màn hình    | Mock state bắt buộc                                                                      |
| ----------- | ---------------------------------------------------------------------------------------- |
| Home        | Loading, data, kho trống, search rỗng, load more, hết trang, lỗi                         |
| Detail/play | Loading, 404, thiếu ảnh, iframe loading/timeout, fullscreen unsupported                  |
| Submit      | Field error, CAPTCHA hết hạn, submitting, success, 429, timeout                          |
| Status      | Chưa nhập, token sai, mọi display status, lỗi mạng                                       |
| Admin       | Session expired, forbidden, queue trống, readonly, checklist chưa đủ, conflict, job fail |

Không biến lỗi 403/500 thành empty state. Khối P1 related nếu thêm sau phải lỗi độc lập, không làm hỏng detail P0.

## 11. Trách nhiệm và điều kiện bàn giao

| Chủ trì      | Phải bàn giao                                                                                                  |
| ------------ | -------------------------------------------------------------------------------------------------------------- |
| Minh/backend | OpenAPI v1, field/status/error schemas, fixtures, base URLs, CORS/Auth config, permissions, endpoint readiness |
| Hà/frontend  | Wireframe 8 màn hình, API client, mock states, mapping field/enum, input/error preservation                    |
| Tùng         | Embed spec và game mẫu, origin chơi, operator upload/release instructions                                      |
| Cường        | Test cases đọc/chơi/nộp/tra cứu/quyền/conflict và xác minh hai cổng                                            |

Trước code UI integration phải chốt: MVP operator upload; mô hình Auth; role/actions; detail DTO shapes; checklist review; rules/idempotency/CAPTCHA; embed spec. Frontend có thể làm layout/mock trong lúc các điểm này được hoàn thiện.

Trước đổi mock → live, mỗi endpoint cần đủ: OpenAPI đúng version, fixture tương ứng, URL môi trường, schema test pass, smoke test từ frontend origin thật và các lỗi đã mô phỏng. POST submission cần chứng minh replay không tạo trùng và không mất token khi timeout.

Nếu thay tên field, enum, method, response envelope hoặc quyền: cập nhật OpenAPI + fixtures + báo frontend trước khi merge. Không chỉ nhắn “đổi base URL”.

## 12. Acceptance checklist cho frontend

1. Home đọc `data` và `page`, xử lý null thumbnail; không dựa vào field cũ.
2. Search/filter reset cursor; response cũ không ghi đè query mới.
3. Detail lấy `play.url`, không iframe link bàn giao.
4. Form không có public ZIP upload ở P0 và không gửi trường đặc quyền.
5. Validation client/server dùng cùng rules; backend error gắn đúng field.
6. Timeout submission không tạo lần nộp mới tự động; success có copy token.
7. Token không lọt vào URL/log/analytics; tra cứu không lộ contact/internal notes.
8. Approved chưa có link chơi nếu chưa published; xử lý publish_failed riêng.
9. Nút admin theo allowed actions; 401/403/409 xử lý riêng.
10. Iframe/ảnh lỗi không làm trắng trang; responsive kiểm desktop/mobile.
11. Mock không bật fallback che lỗi ở production; smoke test chạy qua origin thực.
12. API chưa live không được đánh dấu đã tích hợp chỉ vì HTTP 200 từ server mẫu.

## 13. Tình trạng bộ bàn giao

| Artifact                             | Tình trạng ngày 10/10/2026             |
| ------------------------------------ | -------------------------------------- |
| Báo cáo này và functional plan       | Đã soạn; cần backend/frontend xác nhận |
| OpenAPI v1 và fixture pack           | Chưa tạo; bước kế tiếp                 |
| Endpoint nghiệp vụ, Auth, migrations | Chưa triển khai                        |
| CORS/Auth/iframe smoke test staging  | Chưa thực hiện                         |

Nguồn nội bộ: [Bản đồ chức năng](BACKEND_FUNCTIONAL_PLAN.md), [Kế hoạch kiến trúc](../BACKEND_ARCHITECTURE_PLAN.md), [Kế hoạch bảo mật](security/BACKEND_SECURITY_PLAN.md), [server hiện tại](../index.js).

Báo cáo này chưa được gửi qua email/chat cho frontend. Chủ dự án có thể chuyển nguyên tài liệu để hai bên review và xác nhận hợp đồng trước khi triển khai.
