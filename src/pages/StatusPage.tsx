import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Clock,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Shield,
  RefreshCw,
  Sparkles,
  Terminal,
  Activity,
  CheckCircle,
} from 'lucide-react';
import { api } from '../services/api';
import { SubmissionStatusData, NextAction } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { ErrorAlert } from '../components/ErrorAlert';

export const StatusPage: React.FC = () => {
  const [tokenInput, setTokenInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [result, setResult] = useState<SubmissionStatusData | null>(null);

  const handleSearch = async (e?: React.FormEvent, directToken?: string) => {
    if (e) e.preventDefault();
    const tokenToUse = (directToken || tokenInput).trim();
    if (!tokenToUse) {
      setError(new Error('Vui lòng nhập mã tra cứu (tracking token).'));
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await api.checkSubmissionStatus(tokenToUse);
      setResult(res.data);
    } catch (err: any) {
      setResult(null);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSample = (sampleToken: string) => {
    setTokenInput(sampleToken);
    handleSearch(undefined, sampleToken);
  };

  const renderNextAction = (action: NextAction) => {
    switch (action) {
      case 'open_game':
        if (result?.game) {
          return (
            <Link
              to={`/games/${result.game.slug}`}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 px-6 py-3 text-xs font-extrabold uppercase tracking-wider text-slate-950 hover:scale-105 transition-all shadow-glow-cyan"
            >
              <span>VÀO CHƠI TRÒ CHƠI: {result.game.title}</span>
              <ExternalLink className="w-4 h-4" />
            </Link>
          );
        }
        return null;

      case 'submit_new':
        return (
          <Link
            to="/submit"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-5 py-2.5 text-xs font-semibold text-cyan-300 hover:bg-slate-700 transition-colors"
          >
            <span>Nộp lại hồ sơ / bản sửa lỗi</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        );

      case 'contact_team':
        return (
          <div className="inline-flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/30 px-4 py-2 text-xs text-rose-300 font-mono">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>LIÊN HỆ QUẢN TRỊ VIÊN: support@gamelib.internal</span>
          </div>
        );

      case 'handoff_build':
        return (
          <div className="inline-flex items-center gap-2 rounded-xl bg-amber-500/10 border border-amber-500/30 px-4 py-2 text-xs text-amber-300 font-mono">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>ĐANG CHỜ TIẾP NHẬN BẢN BUILD NỘI BỘ</span>
          </div>
        );

      case 'wait':
      default:
        return (
          <div className="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-2 text-xs text-slate-300 font-mono">
            <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>HỒ SƠ ĐANG XỬ LÝ THEO TIẾN TRÌNH TIÊU CHUẨN</span>
          </div>
        );
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* High-Tech Radar Mission Header */}
      <div className="mb-8 mx-auto max-w-2xl text-center">
        <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-[#d9cbb8] bg-[#fff7e8] px-3.5 py-1 text-xs font-bold uppercase tracking-[0.12em] text-[#8b1d27]">
          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
          <span>Mission control · Tra cứu tiến độ</span>
        </div>
        <h1 className="text-3xl font-black text-[#1d2433] sm:text-4xl">Tra cứu hồ sơ dự án</h1>
        <p className="mt-3 text-sm leading-7 text-[#5f5145]">
          Nhập mã tracking token bí mật để theo dõi trạng thái kiểm thử kỹ thuật, thẩm định nội dung và tiến trình phát hành trên kho game.
        </p>
      </div>

      {/* Cyber Search Terminal Box */}
      <div className="mb-8 rounded-3xl border border-white/[0.08] bg-slate-900/60 p-6 sm:p-8 backdrop-blur-xl shadow-glass">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-cyan-400 transition-colors" />
            <input
              type="text"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="Nhập mã tracking token (Ví dụ: TRK-STAR-2026-X89)..."
              className="w-full rounded-2xl border border-white/[0.08] bg-slate-950/90 px-10 py-3.5 font-mono text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-emerald-400 px-7 py-3.5 text-xs font-extrabold uppercase tracking-wider text-slate-950 hover:scale-105 transition-all shadow-glow-cyan disabled:opacity-50 shrink-0"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>ĐANG TRA CỨU...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>TRA CỨU NGAY</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Tokens */}
        <div className="mt-5 pt-4 border-t border-white/[0.06] flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 font-mono flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> MÃ MẪU KIỂM THỬ:
          </span>
          {[
            { token: 'TRK-STAR-2026-X89', label: 'Chờ QA' },
            { token: 'TRK-SHADOW-8821-K1', label: 'Chờ Nội dung' },
            { token: 'TRK-DRAGON-9942-Z7', label: 'Đã duyệt' },
            { token: 'TRK-BROKEN-1102-M4', label: 'Bị từ chối' },
          ].map((item) => (
            <button
              key={item.token}
              type="button"
              onClick={() => handleSelectSample(item.token)}
              className="rounded-lg border border-white/[0.08] bg-slate-950 px-2.5 py-1 text-[11px] font-mono text-slate-300 hover:border-cyan-400 hover:text-cyan-300 transition-colors"
            >
              {item.token} ({item.label})
            </button>
          ))}
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="mb-8">
          <ErrorAlert error={error} onRetry={() => handleSearch()} />
        </div>
      )}

      {/* Result Presentation */}
      {result && (
        <div className="space-y-6 rounded-3xl border border-white/[0.08] bg-slate-900/60 p-6 sm:p-8 backdrop-blur-xl shadow-glass">
          {/* Status Header Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
            <div>
              <span className="text-xs font-mono text-cyan-400 block mb-1">
                SUBMISSION_ID: {result.submission_id}
              </span>
              <h2 className="text-2xl font-extrabold text-white">Trạng thái hồ sơ</h2>
            </div>
            <StatusBadge status={result.display_status} className="text-sm px-4 py-1.5" />
          </div>

          {/* Public Reason (If rejected) */}
          {result.public_reason && (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-950/20 p-5 text-rose-200">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-rose-400 mb-1 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> PHẢN HỒI TỪ HỘI ĐỒNG KIỂM DUYỆT:
              </h3>
              <p className="text-sm leading-relaxed font-light">{result.public_reason}</p>
            </div>
          )}

          {/* Next Action Suggestion */}
          <div className="rounded-2xl border border-white/[0.06] bg-slate-950/70 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                THAO TÁC KẾ TIẾP (NEXT_ACTION)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Chỉ dẫn theo quy trình phát hành
              </p>
            </div>
            {renderNextAction(result.next_action)}
          </div>

          {/* Public Timeline presented as High-Tech Audit Log */}
          <div>
            <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-white mb-5 flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              LỊCH SỬ TIẾN TRÌNH XÉT DUYỆT (AUDIT_TRAIL)
            </h3>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/[0.08]">
              {result.public_timeline.map((event, idx) => (
                <div key={idx} className="relative">
                  <div className="absolute -left-6 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-slate-950 border-2 border-cyan-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-glow-cyan" />
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>{event.event}</span>
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    </h4>
                    <span className="text-[11px] font-mono text-slate-500">
                      {new Date(event.timestamp).toLocaleString('vi-VN')}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-400 leading-relaxed font-light">{event.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Privacy Note */}
          <div className="border-t border-white/[0.06] pt-4 flex items-center gap-2 text-xs text-slate-500 font-mono">
            <Shield className="w-4 h-4 text-slate-600 shrink-0" />
            <span>
              PRIVACY_PROTECTION: Dữ liệu liên hệ tác giả và ghi chú nội bộ của kiểm duyệt viên được bảo vệ tuyệt đối.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
