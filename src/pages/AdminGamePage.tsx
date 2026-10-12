import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  PlayCircle,
  PauseCircle,
  Radio,
  RefreshCw,
  FolderKanban,
  ExternalLink,
} from 'lucide-react';
import { api } from '../services/api';
import { AdminGameDetail } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { ErrorAlert } from '../components/ErrorAlert';

export const AdminGamePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [game, setGame] = useState<AdminGameDetail | null>(null);
  const [token, setToken] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  useEffect(() => {
    const storedToken = sessionStorage.getItem('gamelib_staff_token');
    if (!storedToken) {
      navigate('/admin/login');
      return;
    }
    setToken(storedToken);
    loadGame(storedToken, id || 'admin-game-001');
  }, [id, navigate]);

  const loadGame = async (authToken: string, gameId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.getAdminGame(authToken, gameId);
      setGame(res.data);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!game || !token) return;
    setActionLoading(true);
    setError(null);
    try {
      const res = await api.publishGame(token, game.id, game.version);
      setGame(res.data);
    } catch (err: any) {
      setError(err);
      if (err.problem?.code === 'VERSION_CONFLICT') {
        loadGame(token, game.id);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleSuspend = async () => {
    if (!game || !token) return;
    const reason = prompt('Nhập lý do tạm ngừng phát hành game:') || 'Tạm ngừng để bảo trì máy chủ.';
    setActionLoading(true);
    setError(null);
    try {
      const res = await api.suspendGame(token, game.id, reason, game.version);
      setGame(res.data);
    } catch (err: any) {
      setError(err);
      if (err.problem?.code === 'VERSION_CONFLICT') {
        loadGame(token, game.id);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleActivateRelease = async (releaseId: string) => {
    if (!game || !token) return;
    setActionLoading(true);
    setError(null);
    try {
      const res = await api.activateRelease(token, game.id, releaseId);
      setGame(res.data);
    } catch (err: any) {
      setError(err);
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

  if (!game) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <ErrorAlert error={error || new Error('Không tìm thấy thông tin trò chơi quản trị.')} />
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
          onClick={() => loadGame(token, game.id)}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-300"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          LÀM MỚI DỮ LIỆU
        </button>
      </div>

      {error && (
        <div className="mb-8">
          <ErrorAlert error={error} onRetry={() => loadGame(token, game.id)} />
        </div>
      )}

      {/* Main Game Header */}
      <div className="rounded-3xl border border-white/[0.08] bg-slate-900/60 p-6 sm:p-8 backdrop-blur-xl mb-8 shadow-glass">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
          <div>
            <div className="flex items-center gap-2 mb-2 font-mono">
              <span className="text-xs text-slate-500">{game.id}</span>
              <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-cyan-300 border border-cyan-500/20 font-bold">
                VERSION_{game.version}
              </span>
              <span className="text-xs text-slate-400 font-mono">/{game.slug}</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white">{game.title}</h1>
          </div>

          <div className="flex items-center gap-3">
            <StatusBadge status={game.publication_status} className="text-sm px-4 py-1.5" />
            {game.publication_status === 'published' && (
              <Link
                to={`/games/${game.slug}`}
                className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 px-3.5 py-1.5 text-xs font-mono font-bold text-cyan-300 hover:bg-cyan-500/20 transition-all shadow-glow-cyan"
              >
                <span>XEM TRÊN CATALOG</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>

        {/* Action Controls Bar */}
        <div className="mt-6 flex flex-wrap items-center gap-3 font-mono">
          {game.allowed_actions.includes('publish') && (
            <button
              onClick={handlePublish}
              disabled={actionLoading}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 px-6 py-3 text-xs font-extrabold uppercase tracking-wider text-slate-950 hover:scale-105 transition-all shadow-glow-cyan disabled:opacity-50"
            >
              <PlayCircle className="w-4 h-4" />
              <span>PHÁT HÀNH TRÒ CHƠI LÊN KHO</span>
            </button>
          )}

          {game.allowed_actions.includes('suspend') && (
            <button
              onClick={handleSuspend}
              disabled={actionLoading}
              className="inline-flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-950/30 px-6 py-3 text-xs font-extrabold uppercase tracking-wider text-rose-300 hover:bg-rose-900/40 transition-colors disabled:opacity-50"
            >
              <PauseCircle className="w-4 h-4" />
              <span>TẠM NGỪNG PHÁT HÀNH</span>
            </button>
          )}
        </div>
      </div>

      {/* Releases Management Pipeline */}
      <div className="rounded-3xl border border-white/[0.08] bg-slate-900/60 p-6 sm:p-8 backdrop-blur-xl shadow-glass">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4 mb-6">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-cyan-400" />
              Pipeline Quản Lý Phiên Bản Phát Hành (Releases)
            </h2>
            <p className="text-xs text-slate-400 mt-1 font-light">
              Theo dõi và quản lý các bản build WebGL/HTML5 đã được đội ngũ tích hợp Tùng đưa lên CDN.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300 font-sans">
            <thead className="border-b border-white/[0.08] bg-slate-950/80 text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold">
              <tr>
                <th className="px-5 py-4">Mã Release</th>
                <th className="px-5 py-4">Phiên bản</th>
                <th className="px-5 py-4">Người tải lên</th>
                <th className="px-5 py-4">Thời gian</th>
                <th className="px-5 py-4">Trạng thái</th>
                <th className="px-5 py-4 text-right">Kích hoạt / Rollback</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {game.releases.map((rel) => {
                const isActive = rel.status === 'active';
                return (
                  <tr key={rel.id} className="hover:bg-slate-800/20 group">
                    <td className="px-5 py-4 font-mono text-slate-400">{rel.id}</td>
                    <td className="px-5 py-4 font-bold text-white font-mono text-sm">{rel.version}</td>
                    <td className="px-5 py-4 font-mono text-slate-400">{rel.uploaded_by}</td>
                    <td className="px-5 py-4 text-slate-400 font-mono text-[11px]">
                      {new Date(rel.created_at).toLocaleString('vi-VN')}
                    </td>
                    <td className="px-5 py-4 font-mono">
                      {isActive ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-glow-cyan">
                          <Radio className="w-3 h-3 animate-pulse text-cyan-400" /> ACTIVE (ĐANG CHẠY)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] bg-slate-800 text-slate-400 border border-slate-700">
                          READY
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right font-mono">
                      {isActive ? (
                        <span className="text-xs text-cyan-400 font-bold">BẢN HIỆN TẠI</span>
                      ) : (
                        <button
                          onClick={() => handleActivateRelease(rel.id)}
                          disabled={actionLoading}
                          className="rounded-xl border border-white/[0.08] bg-slate-800 px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:border-cyan-400 transition-all"
                        >
                          CHUYỂN SANG BẢN NÀY
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
