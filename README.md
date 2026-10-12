# Game Library — Frontend (MVP)

Dự án Frontend MVP cho nền tảng **Game Library** (Kho Game Độc Bản & Cộng Đồng Indie / Sinh viên), được xây dựng theo tài liệu bàn giao kỹ thuật [`FRONTEND_HANDOFF_REPORT.md`](./FRONTEND_HANDOFF_REPORT.md). Một số hạng mục integration phụ thuộc backend/OpenAPI thật nên hiện được mô phỏng bằng mock client.

---

## 1. Công nghệ sử dụng

- **React 18** + **TypeScript** + **Vite**: Nền tảng ứng dụng hiện đại, hiệu năng cao, strict type-checking.
- **Tailwind CSS**: Thiết kế giao diện tối giản, responsive, tối ưu trải nghiệm đọc/chơi game.
- **React Router DOM v6**: Định tuyến trang client-side đầy đủ 8 màn hình theo đặc tả.
- **Lucide Icons**: Bộ icon tinh tế, chuẩn xác cho từng chức năng.

---

## 2. Bản đồ 8 Màn hình hoàn thiện (Mục 4)

| STT | Màn hình | Route Frontend | API Contract | Tính năng chính |
|-----|----------|----------------|--------------|-----------------|
| 1 | **Kho game (Catalog)** | `/` | `GET /api/v1/games`<br>`GET /api/v1/tags` | Grid GameCard, tìm kiếm debounce 300ms, lọc tag (AND tối đa 5 tag), lọc thiết bị (desktop/mobile), sắp xếp, phân trang con trỏ (cursor + load more), xử lý null thumbnail fallback an toàn. |
| 2 | **Chi tiết & Chơi** | `/games/:slug` | `GET /api/v1/games/{slug}` | Trình phát Web Sandbox Iframe an toàn với timeout/retry/fullscreen, tỷ lệ khung hình tự co giãn theo aspect ratio, hướng dẫn điều khiển bàn phím/cảm ứng, credits, cảnh báo nội dung, gallery screenshots. |
| 3 | **Nộp game** | `/submit` | `GET /api/v1/submission-rules`<br>`GET /api/v1/tags`<br>`POST /api/v1/submissions` | Form 14 trường metadata hợp lệ, xác thực lỗi gắn đúng tên trường, bảo vệ bot bằng Honeypot & CAPTCHA, Idempotency-Key chống gửi trùng, màn hình thành công hiển thị mã **Tracking Token** và nút copy an toàn. |
| 4 | **Tra cứu hồ sơ** | `/submission-status` | `POST /api/v1/submissions/status` | Tra cứu theo tracking token, ánh xạ trạng thái thân thiện (Mục 8.2), gợi ý thao tác kế tiếp (Next Action), timeline công khai (không lộ ghi chú nội bộ hay email kiểm duyệt), link chơi game trực tiếp khi đã phát hành. |
| 5 | **Đăng nhập nhân sự** | `/admin/login` | Provider Auth<br>`GET /api/v1/admin/me` | Cổng đăng nhập cho staff với các tài khoản mẫu định danh từng vai trò (Cường QA, Hà Nội dung, Tùng Vận hành, Minh Admin). |
| 6 | **Hàng chờ duyệt** | `/admin/submissions` | `GET /api/v1/admin/submissions` | Bảng quản trị hồ sơ, lọc theo trạng thái duyệt (`pending_technical`, `pending_content`, `approved`, `rejected`), thông tin tác giả và link chuyển sang chi tiết. |
| 7 | **Chi tiết duyệt** | `/admin/submissions/:id` | `GET/PATCH /admin/submissions/{id}`<br>`POST .../technical-review`<br>`POST .../content-review` | Cổng 1 QA kỹ thuật (Checklist sandbox, 60fps, eval), Cổng 2 kiểm duyệt nội dung (Checklist văn hóa, bản quyền), bắt buộc public reason khi reject, chỉnh sửa metadata trước phát hành, xử lý xung đột phiên bản (409 VERSION_CONFLICT). |
| 8 | **Vận hành game** | `/admin/games/:id` | `GET /admin/games/{id}`<br>`POST /admin/games/{id}/publish`<br>`POST /admin/games/{id}/suspend`<br>`POST /admin/releases/{id}/activate` | Quản lý danh sách các bản build/release, kích hoạt / rollback phiên bản game đang phục vụ, thao tác Publish và Suspend nghiêm ngặt theo server permissions. |

---

## 3. Kiến trúc API Client (Mục 5 & Mục 10)

- **Tách biệt Client & Component**: Mọi truy vấn đều qua interface `ApiClient` (`src/services/apiClient.ts`).
- **Chế độ Mock & Real API cùng Interface**:
  - `MockApiClient` (`src/services/mockClient.ts`): Cung cấp đầy đủ fixtures dữ liệu mẫu, mô phỏng delay mạng, lưu trữ trạng thái phiên trong `sessionStorage`, phân trang cursor chuẩn RFC, kiểm tra idempotency, và mô phỏng phản hồi lỗi RFC 7807 `application/problem+json`.
  - `RealApiClient` (`src/services/realClient.ts`): Gọi trực tiếp tới backend origin với prefix cấu hình `VITE_API_BASE_URL` (mặc định `/api/v1`), tự động gắn header `Authorization: Bearer <token>` và `Idempotency-Key`.
- **Nút chuyển đổi chế độ tức thì**: Trên thanh Navbar có nút bấm chuyển đổi giữa chế độ **Mock (Spec)** và **Backend Real** khi đang chạy dev hoặc khi bật `VITE_ENABLE_MOCK=true`; production mặc định dùng API thật để không che lỗi server.

---

## 4. Nghiệm thu theo Acceptance Checklist (Mục 12)

1. [x] **Checklist 1:** Home đọc `data` và `page`, xử lý null thumbnail với placeholder ổn định tỷ lệ khung hình.
2. [x] **Checklist 2:** Tìm kiếm/bộ lọc reset cursor về đầu trang; debounce 300ms và discard request cũ chống race condition.
3. [x] **Checklist 3:** Chi tiết game lấy `play.url` từ release active, tuyệt đối không dùng link bàn giao để iframe.
4. [x] **Checklist 4:** Form nộp không mở public file uploader ở P0 và không gửi trường đặc quyền (role, VIP, published_at).
5. [x] **Checklist 5:** Gắn lỗi validation chính xác theo từng field API từ `problem.errors`.
6. [x] **Checklist 6:** Idempotency-Key bảo vệ việc gửi lặp lại; màn hình success có nút sao chép tracking token.
7. [x] **Checklist 7:** Token không lọt vào URL param hay logs; màn hình tra cứu không để lộ email hay ghi chú riêng của kiểm duyệt viên.
8. [x] **Checklist 8:** Trạng thái approved không render nút chơi nếu chưa published.
9. [x] **Checklist 9:** Nút admin hiển thị theo `allowed_actions`; xử lý 401/403/409 riêng biệt.
10. [x] **Checklist 10:** Iframe có loading overlay, timeout và retry; ảnh lỗi không làm trắng trang.
11. [x] **Checklist 11:** Không âm thầm fallback sang mock trong production để che lỗi server thật.
12. [x] **Checklist 12:** Phân biệt rõ ràng giữa mock contract và backend thật.

---

## 5. Hướng dẫn chạy thử nghiệm

```bash
# Cài đặt thư viện (nếu chưa có)
npm install

# Khởi chạy server phát triển
npm run dev

# Build kiểm tra kiểu và đóng gói
npm run build
```
Truy cập ứng dụng tại: `http://localhost:3000` (hoặc cổng hiển thị bởi Vite).
