import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ShieldCheck,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Edit3,
  RefreshCw,
  AlertTriangle,
  FileCode,
  User,
  Mail,
  Gamepad2,
  Layers,
  Terminal,
} from 'lucide-react';
import { api } from '../services/api';
import { AdminSubmissionDetail, ReviewChecklist } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { ErrorAlert } from '../components/ErrorAlert';

export const AdminDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [sub, setSub] = useState<AdminSubmissionDetail | null>(null);
  const [token, setToken] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // Review states
  const [techChecklist, setTechChecklist] = useState<ReviewChecklist>({
    sandbox_compliant: true,
    no_eval_unsafe: true,
    clean_console: true,
    performance_60fps: true,
  });
  const [contentChecklist, setContentChecklist] = useState<ReviewChecklist>({
    no_explicit_content: true,
    proper_vietnamese: true,
    accurate_description: true,
  });
  const [publicReason, setPublicReason] = useState<string>('');
  const [internalNote, setInternalNote] = useState<string>('');

  // Metadata Edit state
  const [isEditingMeta, setIsEditingMeta] = useState<boolean>(false);
  const [editTitle, setEditTitle] = useState<string>('');
  const [editShortDesc, setEditShortDesc] = useState<string>('');

  useEffect(() => {
    const storedToken = sessionStorage.getItem('gamelib_staff_token');
    if (!storedToken) {
      navigate('/admin/login');
      return;
    }
    setToken(storedToken);
    if (id) loadDetail(storedToken, id);
  }, [id, navigate]);

  const loadDetail = async (authToken: string, subId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.getAdminSubmission(authToken, subId);
      setSub(res.data);
      setEditTitle(res.data.title);
      setEditShortDesc(res.data.short_description);
      if (res.data.technical_checklist) {
        setTechChecklist(res.data.technical_checklist);
      }
      if (res.data.content_checklist) {
        setContentChecklist(res.data.content_checklist);
      }
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTechReview = async (decision: 'pass' | 'reject') => {
    if (!sub || !token) return;
    setActionLoading(true);
    setError(null);
    try {
      const res = await api.technicalReview(token, sub.id, {
        decision,
        checklist: techChecklist,
        public_reason: decision === 'reject' ? publicReason : undefined,
        internal_note: internalNote,
        expected_version: sub.version,
      });
      setSub(res.data);
      setPublicReason('');
    } catch (err: any) {
      setError(err);
      if (err.problem?.code === 'VERSION_CONFLICT') {
        loadDetail(token, sub.id);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleContentReview = async (decision: 'pass' | 'reject') => {
    if (!sub || !token) return;
    setActionLoading(true);
    setError(null);
    try {
      const res = await api.contentReview(token, sub.id, {
        decision,
        checklist: contentChecklist,
        public_reason: decision === 'reject' ? publicReason : undefined,
        internal_note: internalNote,
        expected_version: sub.version,
      });
      setSub(res.data);
      setPublicReason('');
    } catch (err: any) {
      setError(err);
      if (err.problem?.code === 'VERSION_CONFLICT') {
        loadDetail(token, sub.id);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveMetadata = async () => {
    if (!sub || !token) return;
    setActionLoading(true);
    setError(null);
    try {
      const res = await api.updateAdminSubmissionMetadata(
        token,
        sub.id,
        {
          title: editTitle,
          short_description: editShortDesc,
        },
        sub.version
      );
      setSub(res.data);
      setIsEditingMeta(false);
    } catch (err: any) {
      setError(err);
      if (err.problem?.code === 'VERSION_CONFLICT') {
        loadDetail(token, sub.id);
      }
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-6 w-32 rounded bg-slate-800" />
          <div className="h-10 w-2/3 rounded bg-slate-800" />
          <div className="h-40 rounded-2xl bg-slate-800/80" />
        </div>
      </div>
    );
  }

  if (!sub) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <ErrorAlert error={error || new Error('Không tìm thấy thông tin hồ sơ.')} />
        <Link
          to="/admin/submissions"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-800 px-5 py-2.5 text-xs font-mono text-cyan-400"
        >
          <ArrowLeft className="w-4 h-4" /> QUAY LẠI HÀNG CHỜ
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back button */}
      <div className="mb-6 flex items-center justify-between font-mono">
        <Link
          to="/admin/submissions"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-cyan-300"
        >
          <ArrowLeft className="w-4 h-4" />
          QUAY LẠI HÀNG CHỜ DUYỆT
        </Link>

        <button
          onClick={() => loadDetail(token, sub.id)}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-300"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          LÀM MỚI DỮ LIỆU
        </button>
      </div>

      {error && (
        <div className="mb-8">
          <ErrorAlert error={error} onRetry={() => loadDetail(token, sub.id)} />
        </div>
      )}

      {/* Header Info Banner */}
      <div className="rounded-3xl border border-white/[0.08] bg-slate-900/60 p-6 sm:p-8 backdrop-blur-xl mb-8 shadow-glass">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
          <div>
            <div className="flex items-center gap-2 mb-2 font-mono">
              <span className="text-xs text-slate-500">{sub.id}</span>
              <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-cyan-300 border border-cyan-500/20 font-bold">
                VERSION_{sub.version}
              </span>
              <span className="text-[11px] text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                {sub.tracking_token}
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-white">{sub.title}</h1>
          </div>

          <StatusBadge status={sub.display_status} className="text-sm px-4 py-1.5" />
        </div>

        {/* Handoff Build Banner */}
        <div className="mt-5 rounded-2xl border border-cyan-500/30 bg-cyan-950/20 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-cyan-500/20 p-2.5 text-cyan-400 shrink-0 shadow-glow-cyan">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-300">
                LINK BÀN GIAO BỘ BUILD KIỂM THỬ NỘI BỘ:
              </div>
              <div className="text-xs text-slate-300 font-mono truncate max-w-xl">{sub.handoff_url}</div>
            </div>
          </div>

          <a
            href={sub.handoff_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 px-5 py-2.5 text-xs font-mono font-bold uppercase text-slate-950 hover:scale-105 transition-all shadow-glow-cyan shrink-0"
          >
            <span>MỞ LINK BUILD</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Details & Metadata */}
        <div className="lg:col-span-2 space-y-6">
          {/* Metadata Card */}
          <div className="rounded-3xl border border-white/[0.08] bg-slate-900/60 p-6 backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Gamepad2 className="w-4 h-4 text-cyan-400" />
                Metadata bài nộp
              </h2>

              {!isEditingMeta ? (
                <button
                  onClick={() => setIsEditingMeta(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-slate-800 px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Sửa metadata
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsEditingMeta(false)}
                    className="px-3 py-1 text-xs text-slate-400 hover:text-white"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleSaveMetadata}
                    disabled={actionLoading}
                    className="px-4 py-1.5 rounded-lg bg-cyan-500 text-xs font-bold text-slate-950 hover:bg-cyan-400"
                  >
                    Lưu
                  </button>
                </div>
              )}
            </div>

            {isEditingMeta ? (
              <div className="space-y-4 pt-2">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Tên trò chơi:</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full rounded-xl border border-white/[0.08] bg-slate-950 px-3 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Mô tả ngắn:</label>
                  <input
                    type="text"
                    value={editShortDesc}
                    onChange={(e) => setEditShortDesc(e.target.value)}
                    className="w-full rounded-xl border border-white/[0.08] bg-slate-950 px-3 py-2 text-sm text-white"
                  />
                </div>
              </div>
            ) : (
              <>
                <div>
                  <span className="text-xs font-semibold text-slate-400 block mb-1">Mô tả ngắn:</span>
                  <p className="text-sm text-slate-200">{sub.short_description}</p>
                </div>

                <div>
                  <span className="text-xs font-semibold text-slate-400 block mb-1">Mô tả chi tiết:</span>
                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line font-light">{sub.description}</p>
                </div>

                <div>
                  <span className="text-xs font-semibold text-slate-400 block mb-1">Hướng dẫn điều khiển:</span>
                  <p className="text-xs text-slate-300 leading-relaxed font-mono">{sub.controls}</p>
                </div>

                <div>
                  <span className="text-xs font-semibold text-slate-400 block mb-1">Credits tác quyền:</span>
                  <p className="text-xs text-slate-400">{sub.credits}</p>
                </div>
              </>
            )}
          </div>

          {/* Audit Logs */}
          {sub.internal_notes && sub.internal_notes.length > 0 && (
            <div className="rounded-3xl border border-white/[0.08] bg-slate-900/60 p-6 backdrop-blur-xl">
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                Ghi chú nội bộ & Nhật ký xét duyệt (Audit Logs)
              </h3>
              <ul className="space-y-2 text-xs font-mono">
                {sub.internal_notes.map((note, idx) => (
                  <li key={idx} className="rounded-xl bg-slate-950/80 p-3 text-slate-300 border border-white/[0.06]">
                    {note}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right Col: Cockpit Review Gates */}
        <div className="space-y-6">
          {/* Author Card */}
          <div className="rounded-3xl border border-white/[0.08] bg-slate-900/60 p-6 backdrop-blur-xl space-y-3 font-mono">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 border-b border-white/[0.08] pb-2">
              HỒ SƠ TÁC GIẢ
            </h3>
            <div className="flex items-center gap-2 text-xs text-white">
              <User className="w-4 h-4 text-cyan-400" />
              <span>{sub.author_name}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <Mail className="w-4 h-4 text-slate-500" />
              <span>{sub.contact_email}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Layers className="w-4 h-4 text-slate-500" />
              <span>Tags: {sub.tag_slugs.join(', ')}</span>
            </div>
          </div>

          {/* Gate 1: Technical Review Box */}
          {sub.review_status === 'pending_technical' && (
            <div className="rounded-3xl border border-cyan-500/30 bg-slate-900/80 p-6 backdrop-blur-xl space-y-4 shadow-glass">
              <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm font-mono">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
                <span>CỔNG 1: KIỂM THỬ KỸ THUẬT (QA)</span>
              </div>

              <div className="space-y-2.5 text-xs">
                {[
                  { key: 'sandbox_compliant', label: 'Bản build an toàn trong Web Sandbox' },
                  { key: 'no_eval_unsafe', label: 'Không có eval scripts hoặc injection' },
                  { key: 'clean_console', label: 'Console log sạch, không fatal error' },
                  { key: 'performance_60fps', label: 'Hiệu năng mượt mà ổn định ~60 FPS' },
                ].map((item) => (
                  <label key={item.key} className="flex items-center gap-2.5 text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!techChecklist[item.key]}
                      onChange={(e) =>
                        setTechChecklist((prev) => ({ ...prev, [item.key]: e.target.checked }))
                      }
                      className="rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-cyan-500"
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Lý do từ chối gửi cho tác giả (bắt buộc khi Reject):
                </label>
                <textarea
                  rows={2}
                  value={publicReason}
                  onChange={(e) => setPublicReason(e.target.value)}
                  placeholder="Ghi rõ lỗi kỹ thuật để tác giả khắc phục..."
                  className="w-full rounded-xl border border-white/[0.08] bg-slate-950 p-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Ghi chú nội bộ (Tùy chọn):
                </label>
                <input
                  type="text"
                  value={internalNote}
                  onChange={(e) => setInternalNote(e.target.value)}
                  placeholder="Ghi chú nội bộ cho đồng nghiệp..."
                  className="w-full rounded-xl border border-white/[0.08] bg-slate-950 p-2 text-xs text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleTechReview('reject')}
                  disabled={actionLoading}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-950/30 py-2.5 text-xs font-bold text-rose-300 hover:bg-rose-900/40 transition-colors"
                >
                  <XCircle className="w-4 h-4" /> Từ chối
                </button>
                <button
                  type="button"
                  onClick={() => handleTechReview('pass')}
                  disabled={actionLoading}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 py-2.5 text-xs font-bold text-slate-950 hover:scale-[1.02] transition-all shadow-glow-cyan"
                >
                  <CheckCircle2 className="w-4 h-4" /> Đạt kỹ thuật
                </button>
              </div>
            </div>
          )}

          {/* Gate 2: Content Review Box */}
          {sub.review_status === 'pending_content' && (
            <div className="rounded-3xl border border-purple-500/30 bg-slate-900/80 p-6 backdrop-blur-xl space-y-4 shadow-glass">
              <div className="flex items-center gap-2 text-purple-300 font-bold text-sm font-mono">
                <ShieldCheck className="w-5 h-5 text-purple-400" />
                <span>CỔNG 2: KIỂM DUYỆT NỘI DUNG</span>
              </div>

              <div className="space-y-2.5 text-xs">
                {[
                  { key: 'no_explicit_content', label: 'Không có nội dung bạo lực / 18+ phản cảm' },
                  { key: 'proper_vietnamese', label: 'Tiếng Việt chuẩn xác, văn phong lành mạnh' },
                  { key: 'accurate_description', label: 'Mô tả phù hợp với trải nghiệm gameplay' },
                ].map((item) => (
                  <label key={item.key} className="flex items-center gap-2.5 text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!contentChecklist[item.key]}
                      onChange={(e) =>
                        setContentChecklist((prev) => ({ ...prev, [item.key]: e.target.checked }))
                      }
                      className="rounded border-slate-700 bg-slate-950 text-purple-500 focus:ring-purple-500"
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Lý do từ chối gửi cho tác giả (bắt buộc khi Reject):
                </label>
                <textarea
                  rows={2}
                  value={publicReason}
                  onChange={(e) => setPublicReason(e.target.value)}
                  placeholder="Nêu rõ lý do nội dung không đạt tiêu chuẩn..."
                  className="w-full rounded-xl border border-white/[0.08] bg-slate-950 p-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Ghi chú nội bộ (Tùy chọn):
                </label>
                <input
                  type="text"
                  value={internalNote}
                  onChange={(e) => setInternalNote(e.target.value)}
                  placeholder="Ghi chú nội bộ cho đồng nghiệp..."
                  className="w-full rounded-xl border border-white/[0.08] bg-slate-950 p-2 text-xs text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleContentReview('reject')}
                  disabled={actionLoading}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-950/30 py-2.5 text-xs font-bold text-rose-300 hover:bg-rose-900/40 transition-colors"
                >
                  <XCircle className="w-4 h-4" /> Từ chối
                </button>
                <button
                  type="button"
                  onClick={() => handleContentReview('pass')}
                  disabled={actionLoading}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-purple-500 py-2.5 text-xs font-bold text-slate-950 hover:bg-purple-400 transition-colors shadow-glow-violet"
                >
                  <CheckCircle2 className="w-4 h-4" /> Phê duyệt game
                </button>
              </div>
            </div>
          )}

          {/* Approved status view */}
          {sub.review_status === 'approved' && (
            <div className="rounded-3xl border border-emerald-500/30 bg-emerald-950/20 p-6 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h4 className="text-base font-bold text-white">Hồ sơ đã được phê duyệt!</h4>
              <p className="text-xs text-slate-300 font-light">
                Hồ sơ đã vượt qua cả hai cổng kiểm thử. Đang chờ Release Operator tải build và phát hành.
              </p>
              <Link
                to="/admin/games/admin-game-001"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 px-5 py-2.5 text-xs font-bold text-slate-950 hover:scale-105 transition-all shadow-glow-cyan mt-2"
              >
                <span>Xem vận hành phát hành</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          {/* Rejected status view */}
          {sub.review_status === 'rejected' && (
            <div className="rounded-3xl border border-rose-500/30 bg-rose-950/20 p-6 space-y-2">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                <AlertTriangle className="w-5 h-5" />
                <span>Hồ sơ đã bị từ chối</span>
              </div>
              <p className="text-xs text-rose-200">Lý do gửi cho tác giả:</p>
              <p className="text-xs bg-rose-950/60 p-3 rounded-xl border border-rose-500/20 text-rose-300 font-light">
                {sub.public_reason || 'Chưa cung cấp lý do.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
