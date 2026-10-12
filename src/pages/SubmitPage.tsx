import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  UploadCloud,
  CheckCircle2,
  Copy,
  Check,
  AlertCircle,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  Info,
  Sparkles,
  Gamepad2,
  Layers,
  Terminal,
} from 'lucide-react';
import { api } from '../services/api';
import { Tag, SubmissionRules, DeviceType, SubmissionCreatedResponse } from '../types';
import { ErrorAlert } from '../components/ErrorAlert';

export const SubmitPage: React.FC = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [rules, setRules] = useState<SubmissionRules | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [tagSlugs, setTagSlugs] = useState<string[]>([]);
  const [supportedDevices, setSupportedDevices] = useState<DeviceType[]>(['desktop']);
  const [controls, setControls] = useState('');
  const [handoffUrl, setHandoffUrl] = useState('');
  const [thumbnailHandoffUrl, setThumbnailHandoffUrl] = useState('');
  const [credits, setCredits] = useState('');
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [honeypotWebsite, setHoneypotWebsite] = useState('');

  // Processing & Success states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<any>(null);
  const [submissionResult, setSubmissionResult] = useState<SubmissionCreatedResponse | null>(null);
  const [hasCopiedToken, setHasCopiedToken] = useState(false);

  // Idempotency key
  const idempotencyKeyRef = useRef<string>('idem-' + Math.random().toString(36).substring(2) + '-' + Date.now());

  useEffect(() => {
    api.getTags().then((r) => setTags(r.data)).catch(console.warn);
    api.getSubmissionRules().then((r) => setRules(r.data)).catch(console.warn);
  }, []);

  const handleTagToggle = (slug: string) => {
    setTagSlugs((prev) => {
      if (prev.includes(slug)) return prev.filter((s) => s !== slug);
      if (prev.length >= (rules?.max_tags || 5)) return prev;
      return [...prev, slug];
    });
  };

  const handleDeviceToggle = (device: DeviceType) => {
    setSupportedDevices((prev) => {
      if (prev.includes(device)) {
        if (prev.length === 1) return prev;
        return prev.filter((d) => d !== device);
      }
      return [...prev, device];
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setGeneralError(null);

    const errors: Record<string, string> = {};
    if (!title || title.length < 3) errors.title = 'Tên game phải từ 3 đến 100 ký tự.';
    if (!authorName || authorName.length < 2) errors.author_name = 'Tên tác giả phải từ 2 đến 100 ký tự.';
    if (!contactEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
      errors.contact_email = 'Email liên hệ không đúng định dạng.';
    }
    if (!shortDescription || shortDescription.length < 20) {
      errors.short_description = 'Mô tả ngắn phải từ 20 đến 160 ký tự.';
    }
    if (!description || description.length < 50) {
      errors.description = 'Mô tả chi tiết phải từ 50 đến 5000 ký tự.';
    }
    if (tagSlugs.length === 0) {
      errors.tag_slugs = 'Chọn ít nhất 1 thể loại game.';
    }
    if (supportedDevices.length === 0) {
      errors.supported_devices = 'Chọn ít nhất một thiết bị hỗ trợ.';
    }
    if (!controls || controls.length < 10) {
      errors.controls = 'Hướng dẫn điều khiển phải từ 10 đến 1000 ký tự.';
    }
    if (!handoffUrl || !handoffUrl.startsWith('https://')) {
      errors.handoff_url = 'Link bàn giao build phải là đường dẫn HTTPS.';
    }
    if (!credits || credits.length < 1) {
      errors.credits = 'Vui lòng điền thông tin tác quyền/credits.';
    }
    if (!consentAccepted) {
      errors.consent = 'Bạn phải đồng ý với điều khoản phát hành.';
    }
    if (!captchaVerified) {
      errors.captcha_token = 'Vui lòng hoàn tất xác thực CAPTCHA bảo mật.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.submitGame(
        {
          title,
          author_name: authorName,
          contact_email: contactEmail,
          short_description: shortDescription,
          description,
          tag_slugs: tagSlugs,
          supported_devices: supportedDevices,
          controls,
          handoff_url: handoffUrl,
          thumbnail_handoff_url: thumbnailHandoffUrl || undefined,
          credits,
          consent: {
            accepted: true,
            version: rules?.consent_version || '2026.1',
          },
          captcha_token: 'captcha-verified-' + Date.now(),
          website: honeypotWebsite,
        },
        idempotencyKeyRef.current
      );

      setSubmissionResult(res.data);
    } catch (err: any) {
      if (err.problem?.errors) {
        const mapped: Record<string, string> = {};
        err.problem.errors.forEach((pe: any) => {
          mapped[pe.field] = pe.message;
        });
        setFieldErrors(mapped);
      }
      setGeneralError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyToken = () => {
    if (submissionResult?.tracking_token) {
      navigator.clipboard.writeText(submissionResult.tracking_token);
      setHasCopiedToken(true);
      setTimeout(() => setHasCopiedToken(false), 2500);
    }
  };

  // Render Futuristic Cyber Success Screen
  if (submissionResult) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <div className="rounded-3xl border border-cyan-500/40 bg-gradient-to-br from-slate-900/90 via-[#0b1329] to-slate-950 p-8 sm:p-10 text-center shadow-2xl backdrop-blur-xl relative overflow-hidden">
          {/* Luminous glow */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-60 h-60 rounded-full bg-cyan-500/20 blur-3xl pointer-events-none" />

          <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-glow-cyan">
            <CheckCircle2 className="h-8 w-8" />
          </div>

          <h2 className="mt-6 text-2xl sm:text-3xl font-extrabold text-white">Nộp hồ sơ thành công!</h2>
          <p className="mt-2 text-sm text-slate-300">
            Dự án <span className="text-cyan-300 font-bold">{title}</span> đã được chuyển vào hàng chờ kiểm thử kỹ thuật nội bộ của hệ thống.
          </p>

          {/* Futuristic Mission Credential Card */}
          <div className="mt-8 rounded-2xl border border-cyan-500/40 bg-slate-950/80 p-5 text-left font-mono relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5" /> MÃ TRA CỨU HỒ SƠ (TRACKING_TOKEN)
              </span>
              <span className="text-[10px] text-slate-400">CHỈ CUNG CẤP 1 LẦN</span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={submissionResult.tracking_token}
                className="w-full rounded-xl border border-cyan-500/30 bg-slate-900 px-4 py-3 font-mono text-base font-bold text-cyan-300 selection:bg-cyan-400 selection:text-slate-950"
              />
              <button
                type="button"
                onClick={handleCopyToken}
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 px-5 py-3 text-xs font-bold text-slate-950 hover:scale-105 transition-all shadow-glow-cyan shrink-0"
              >
                {hasCopiedToken ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{hasCopiedToken ? 'ĐÃ SAO CHÉP' : 'SAO CHÉP'}</span>
              </button>
            </div>

            <div className="mt-4 flex items-start gap-2 text-xs text-amber-300/90 font-sans">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
              <p>
                <strong>Lưu ý bảo mật:</strong> Để đảm bảo tính riêng tư, hệ thống không lưu token vào URL và không hỗ trợ gửi lại qua email. Vui lòng ghi lại mã này vào nơi an toàn.
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/submission-status"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-950 shadow-glow-cyan hover:scale-105 transition-all"
            >
              <span>Đi tới trang Tra cứu hồ sơ</span>
              <ExternalLink className="w-4 h-4" />
            </Link>
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-slate-900/80 px-6 py-3 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Về trang chủ Kho game
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-[#d9cbb8] bg-[#fff7e8] px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-[#8b1d27]">
          <UploadCloud className="w-3.5 h-3.5 text-cyan-400" />
          <span>Creator studio · Quy trình tiếp nhận MVP</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-[#1d2433]">Nộp dự án game lên nền tảng</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[#5f5145]">
          Gửi thông tin metadata và đường dẫn bộ build HTML5/WebGL của bạn. Sau khi nộp, hội đồng kiểm duyệt nội bộ sẽ tiến hành kiểm tra sandbox an toàn và phê duyệt phát hành.
        </p>
      </div>

      {generalError && (
        <div className="mb-8">
          <ErrorAlert error={generalError} />
        </div>
      )}

      {/* Main Grid: Form Left, Real-time Live Preview Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Container */}
        <div className="lg:col-span-8">
          <form
            onSubmit={handleSubmit}
            className="space-y-8 rounded-3xl border border-white/[0.08] bg-slate-900/60 p-6 sm:p-8 backdrop-blur-xl shadow-glass"
          >
            {/* Honeypot field (hidden from real users) */}
            <div className="hidden" aria-hidden="true">
              <label htmlFor="website">Website</label>
              <input
                type="text"
                id="website"
                name="website"
                value={honeypotWebsite}
                onChange={(e) => setHoneypotWebsite(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            {/* Section 1: Basic Game Metadata */}
            <div className="space-y-5">
              <div className="flex items-center gap-2 border-b border-white/[0.08] pb-2 text-white font-bold text-base">
                <Gamepad2 className="w-4 h-4 text-cyan-400" />
                <span>1. Định danh & Tác giả</span>
              </div>

              {/* Title */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-semibold text-slate-200">
                    Tên trò chơi <span className="text-rose-400">*</span>
                  </label>
                  <span className="text-[11px] text-slate-500 font-mono">{title.length}/100</span>
                </div>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: Pixel Runner"
                  maxLength={100}
                  className={`w-full rounded-xl border bg-slate-950/80 px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 ${
                    fieldErrors.title
                      ? 'border-rose-500 focus:ring-rose-500'
                      : 'border-white/[0.08] focus:border-cyan-400 focus:ring-cyan-400'
                  }`}
                />
                {fieldErrors.title && <p className="mt-1 text-xs text-rose-400">{fieldErrors.title}</p>}
              </div>

              {/* Author & Contact Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-semibold text-slate-200">
                      Tên tác giả / Nhóm <span className="text-rose-400">*</span>
                    </label>
                    <span className="text-[11px] text-slate-500 font-mono">{authorName.length}/100</span>
                  </div>
                  <input
                    type="text"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="Ví dụ: Nhóm Pixel Studios"
                    maxLength={100}
                    className={`w-full rounded-xl border bg-slate-950/80 px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 ${
                      fieldErrors.author_name
                        ? 'border-rose-500 focus:ring-rose-500'
                        : 'border-white/[0.08] focus:border-cyan-400 focus:ring-cyan-400'
                    }`}
                  />
                  {fieldErrors.author_name && <p className="mt-1 text-xs text-rose-400">{fieldErrors.author_name}</p>}
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-semibold text-slate-200">
                      Email liên hệ <span className="text-rose-400">*</span>
                    </label>
                    <span className="text-[10px] text-cyan-400 font-mono">BẢO MẬT NỘI BỘ</span>
                  </div>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="developer@example.com"
                    maxLength={254}
                    className={`w-full rounded-xl border bg-slate-950/80 px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 ${
                      fieldErrors.contact_email
                        ? 'border-rose-500 focus:ring-rose-500'
                        : 'border-white/[0.08] focus:border-cyan-400 focus:ring-cyan-400'
                    }`}
                  />
                  {fieldErrors.contact_email && <p className="mt-1 text-xs text-rose-400">{fieldErrors.contact_email}</p>}
                </div>
              </div>

              {/* Short Description */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-semibold text-slate-200">
                    Mô tả ngắn (thẻ card) <span className="text-rose-400">*</span>
                  </label>
                  <span className="text-[11px] text-slate-500 font-mono">{shortDescription.length}/160</span>
                </div>
                <input
                  type="text"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="Tóm tắt điểm đặc sắc của game (20–160 ký tự)..."
                  maxLength={160}
                  className={`w-full rounded-xl border bg-slate-950/80 px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 ${
                    fieldErrors.short_description
                      ? 'border-rose-500 focus:ring-rose-500'
                      : 'border-white/[0.08] focus:border-cyan-400 focus:ring-cyan-400'
                  }`}
                />
                {fieldErrors.short_description && <p className="mt-1 text-xs text-rose-400">{fieldErrors.short_description}</p>}
              </div>

              {/* Description (Plain Text) */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-semibold text-slate-200">
                    Mô tả chi tiết gameplay (Plain text) <span className="text-rose-400">*</span>
                  </label>
                  <span className="text-[11px] text-slate-500 font-mono">{description.length}/5000</span>
                </div>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Giới thiệu chi tiết luật chơi, cơ chế, cốt truyện (tối thiểu 50 ký tự, không dùng mã HTML)..."
                  maxLength={5000}
                  className={`w-full rounded-xl border bg-slate-950/80 px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 ${
                    fieldErrors.description
                      ? 'border-rose-500 focus:ring-rose-500'
                      : 'border-white/[0.08] focus:border-cyan-400 focus:ring-cyan-400'
                  }`}
                />
                {fieldErrors.description && <p className="mt-1 text-xs text-rose-400">{fieldErrors.description}</p>}
              </div>
            </div>

            {/* Section 2: Taxonomy & Gameplay */}
            <div className="space-y-5">
              <div className="flex items-center gap-2 border-b border-white/[0.08] pb-2 text-white font-bold text-base">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>2. Thể loại & Điều khiển</span>
              </div>

              {/* Tags */}
              <div>
                <label className="text-xs font-semibold text-slate-200 block mb-2 font-mono">
                  CHỌN THỂ LOẠI (TỪ 1 ĐẾN 5 TAGS) <span className="text-rose-400">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {tags.map((t) => {
                    const checked = tagSlugs.includes(t.slug);
                    return (
                      <button
                        type="button"
                        key={t.slug}
                        onClick={() => handleTagToggle(t.slug)}
                        className={`rounded-xl px-3 py-1.5 text-xs font-mono font-medium border transition-all ${
                          checked
                            ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300 shadow-glow-cyan'
                            : 'border-white/[0.08] bg-slate-950/60 text-slate-400 hover:border-white/20'
                        }`}
                      >
                        #{t.label}
                      </button>
                    );
                  })}
                </div>
                {fieldErrors.tag_slugs && <p className="mt-1 text-xs text-rose-400">{fieldErrors.tag_slugs}</p>}
              </div>

              {/* Devices */}
              <div>
                <label className="text-xs font-semibold text-slate-200 block mb-2 font-mono">
                  THIẾT BỊ ĐÃ ĐƯỢC QA KIỂM THỬ <span className="text-rose-400">*</span>
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={supportedDevices.includes('desktop')}
                      onChange={() => handleDeviceToggle('desktop')}
                      className="rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-cyan-500"
                    />
                    <span>Máy tính (Desktop)</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={supportedDevices.includes('mobile')}
                      onChange={() => handleDeviceToggle('mobile')}
                      className="rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-cyan-500"
                    />
                    <span>Điện thoại (Mobile Touch)</span>
                  </label>
                </div>
                {fieldErrors.supported_devices && <p className="mt-1 text-xs text-rose-400">{fieldErrors.supported_devices}</p>}
              </div>

              {/* Controls */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-semibold text-slate-200">
                    Hướng dẫn điều khiển <span className="text-rose-400">*</span>
                  </label>
                  <span className="text-[11px] text-slate-500 font-mono">{controls.length}/1000</span>
                </div>
                <textarea
                  rows={2}
                  value={controls}
                  onChange={(e) => setControls(e.target.value)}
                  placeholder="Ví dụ: Phím mũi tên di chuyển, Space nhảy; hoặc chạm kéo màn hình..."
                  maxLength={1000}
                  className={`w-full rounded-xl border bg-slate-950/80 px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 ${
                    fieldErrors.controls
                      ? 'border-rose-500 focus:ring-rose-500'
                      : 'border-white/[0.08] focus:border-cyan-400 focus:ring-cyan-400'
                  }`}
                />
                {fieldErrors.controls && <p className="mt-1 text-xs text-rose-400">{fieldErrors.controls}</p>}
              </div>

              {/* Credits */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-semibold text-slate-200">
                    Tác quyền & Đóng góp (Credits) <span className="text-rose-400">*</span>
                  </label>
                  <span className="text-[11px] text-slate-500 font-mono">{credits.length}/2000</span>
                </div>
                <textarea
                  rows={2}
                  value={credits}
                  onChange={(e) => setCredits(e.target.value)}
                  placeholder="Liệt kê danh sách thành viên thực hiện dự án, nguồn nhạc/asset hợp pháp..."
                  maxLength={2000}
                  className={`w-full rounded-xl border bg-slate-950/80 px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 ${
                    fieldErrors.credits
                      ? 'border-rose-500 focus:ring-rose-500'
                      : 'border-white/[0.08] focus:border-cyan-400 focus:ring-cyan-400'
                  }`}
                />
                {fieldErrors.credits && <p className="mt-1 text-xs text-rose-400">{fieldErrors.credits}</p>}
              </div>
            </div>

            {/* Section 3: Build & Handoff */}
            <div className="space-y-5">
              <div className="flex items-center gap-2 border-b border-white/[0.08] pb-2 text-white font-bold text-base">
                <UploadCloud className="w-4 h-4 text-cyan-400" />
                <span>3. Bàn giao bản build kỹ thuật</span>
              </div>

              <div className="rounded-2xl border border-cyan-500/20 bg-cyan-950/30 p-4 text-xs text-slate-300 space-y-1">
                <div className="font-bold text-cyan-300 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5" />
                  Quy định bàn giao MVP:
                </div>
                <p>
                  Nhập link Google Drive / OneDrive / GitHub Release chứa zip game WebGL hoặc web folder. Đội ngũ kiểm thử Tùng sẽ tải về và đưa vào Sandbox riêng biệt.
                </p>
              </div>

              {/* Handoff URL */}
              <div>
                <label className="text-xs font-semibold text-slate-200 block mb-1.5">
                  Link bàn giao bản build (HTTPS) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="url"
                  value={handoffUrl}
                  onChange={(e) => setHandoffUrl(e.target.value)}
                  placeholder="https://drive.google.com/file/d/.../view hoặc link release"
                  maxLength={2048}
                  className={`w-full rounded-xl border bg-slate-950/80 px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 ${
                    fieldErrors.handoff_url
                      ? 'border-rose-500 focus:ring-rose-500'
                      : 'border-white/[0.08] focus:border-cyan-400 focus:ring-cyan-400'
                  }`}
                />
                {fieldErrors.handoff_url && <p className="mt-1 text-xs text-rose-400">{fieldErrors.handoff_url}</p>}
              </div>

              {/* Thumbnail URL */}
              <div>
                <label className="text-xs font-semibold text-slate-200 block mb-1.5">
                  Link ảnh bìa / thumbnail (Tùy chọn, HTTPS)
                </label>
                <input
                  type="url"
                  value={thumbnailHandoffUrl}
                  onChange={(e) => setThumbnailHandoffUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/... hoặc link ảnh HTTPS"
                  maxLength={2048}
                  className={`w-full rounded-xl border bg-slate-950/80 px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 ${
                    fieldErrors.thumbnail_handoff_url
                      ? 'border-rose-500 focus:ring-rose-500'
                      : 'border-white/[0.08] focus:border-cyan-400 focus:ring-cyan-400'
                  }`}
                />
                {fieldErrors.thumbnail_handoff_url && <p className="mt-1 text-xs text-rose-400">{fieldErrors.thumbnail_handoff_url}</p>}
              </div>
            </div>

            {/* Section 4: Consent & CAPTCHA */}
            <div className="space-y-4 pt-2 border-t border-white/[0.08]">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentAccepted}
                  onChange={(e) => setConsentAccepted(e.target.checked)}
                  className="mt-1 rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-cyan-500"
                />
                <span className="text-xs text-slate-300 leading-relaxed font-light">
                  Tôi cam đoan trò chơi này là sản phẩm tự phát triển hoặc có bản quyền hợp pháp, không chứa mã độc, nội dung kích động bạo lực thực tế hoặc vi phạm pháp luật. Tôi đồng ý với{' '}
                  <span className="text-cyan-300 underline font-semibold">Điều khoản phát hành Game Library (phiên bản {rules?.consent_version || '2026.1'})</span>.
                </span>
              </label>
              {fieldErrors.consent && <p className="text-xs text-rose-400">{fieldErrors.consent}</p>}

              {/* Biometric / Cyber CAPTCHA Widget */}
              <div className="rounded-2xl border border-white/[0.08] bg-slate-950/80 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="captcha-check"
                    checked={captchaVerified}
                    onChange={(e) => setCaptchaVerified(e.target.checked)}
                    className="h-5 w-5 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500 cursor-pointer"
                  />
                  <label htmlFor="captcha-check" className="text-xs text-slate-200 font-mono cursor-pointer">
                    XÁC THỰC BẢO MẬT: TÔI KHÔNG PHẢI ROBOT
                  </label>
                </div>
                <ShieldCheck className="w-5 h-5 text-cyan-400 shadow-glow-cyan" />
              </div>
              {fieldErrors.captcha_token && <p className="text-xs text-rose-400">{fieldErrors.captcha_token}</p>}
            </div>

            {/* Submit Action */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 via-emerald-400 to-teal-400 py-4 text-sm font-extrabold uppercase tracking-wider text-slate-950 shadow-glow-cyan hover:scale-[1.01] transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    ĐANG XÁC THỰC & TIẾP NHẬN HỒ SƠ...
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4" />
                    GỬI HỒ SƠ TIẾP NHẬN NGAY
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Real-time Live Holographic Card Preview! */}
        <div className="lg:col-span-4 sticky top-24 space-y-4">
          <div className="rounded-3xl border border-white/[0.08] bg-slate-900/60 p-5 backdrop-blur-xl shadow-glass">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 mb-4">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> XEM TRƯỚC THẺ GAME (LIVE PREVIEW)
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">REALTIME</span>
            </div>

            {/* Simulated Live Game Card */}
            <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-slate-950/80 p-0 shadow-lg">
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-950">
                {thumbnailHandoffUrl ? (
                  <img
                    src={thumbnailHandoffUrl}
                    alt="Preview"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as any).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center bg-slate-900/80 p-4 text-center">
                    <Gamepad2 className="h-8 w-8 text-cyan-400 mb-1" />
                    <span className="text-[10px] font-mono text-slate-500">Chưa nhập link ảnh bìa</span>
                  </div>
                )}
              </div>

              <div className="p-4 space-y-2">
                <div className="flex flex-wrap gap-1">
                  {tagSlugs.length > 0 ? (
                    tagSlugs.map((slug) => (
                      <span
                        key={slug}
                        className="rounded bg-cyan-950/60 px-1.5 py-0.5 text-[10px] font-mono text-cyan-300 border border-cyan-500/20"
                      >
                        #{tags.find((t) => t.slug === slug)?.label || slug}
                      </span>
                    ))
                  ) : (
                    <span className="text-[10px] text-slate-500 font-mono">#chưa_chọn_thể_loại</span>
                  )}
                </div>

                <h4 className="text-sm font-bold text-white line-clamp-1">
                  {title || 'Tên trò chơi của bạn'}
                </h4>

                <p className="text-xs text-slate-400 line-clamp-2">
                  {shortDescription || 'Mô tả ngắn sẽ xuất hiện tại đây khi bạn nhập vào biểu mẫu.'}
                </p>

                <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-500">
                  <span>{authorName || 'Tác giả dự án'}</span>
                  <span className="font-mono text-emerald-400">Đang soạn thảo</span>
                </div>
              </div>
            </div>

            <p className="mt-3 text-[11px] text-slate-400 font-light leading-relaxed">
              Thẻ game hiển thị trực quan cách dự án của bạn sẽ xuất hiện trên trang chủ Kho game sau khi được phê duyệt.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
