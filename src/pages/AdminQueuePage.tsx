import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ListFilter,
  ArrowRight,
  RefreshCw,
  FolderKanban,
  CheckCircle,
  Terminal,
} from 'lucide-react';
import { api } from '../services/api';
import { AdminSubmissionDetail } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { ErrorAlert } from '../components/ErrorAlert';

export const AdminQueuePage: React.FC = () => {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<AdminSubmissionDetail[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);
  const [token, setToken] = useState<string>('');

  useEffect(() => {
    const storedToken = sessionStorage.getItem('gamelib_staff_token');
    if (!storedToken) {
      navigate('/admin/login');
      return;
    }
    setToken(storedToken);
    loadQueue(storedToken, selectedStatus);
  }, [navigate, selectedStatus]);

  const loadQueue = async (authToken: string, status: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.getAdminSubmissions(authToken, {
        status: status === 'all' ? undefined : status,
      });
      setSubmissions(res.data);
    } catch (err: any) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    if (token) loadQueue(token, selectedStatus);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-3 py-1 text-xs font-mono font-medium text-cyan-300 shadow-glow-cyan mb-2">
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span>COMMAND_CENTER · HÀNG CHỜ KIỂM ĐỊNH HỒ SƠ</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">Quản Trị Hồ Sơ Dự Án</h1>
        </div>

        <div className="flex items-center gap-2 font-mono">
          <Link
            to="/admin/games/admin-game-001"
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-slate-900/80 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40 transition-all shadow-sm"
          >
            <FolderKanban className="w-4 h-4 text-cyan-400" />
            <span>VẬN HÀNH CATALOG</span>
          </Link>
          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-slate-900/80 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-all shadow-sm"
          >
            <RefreshCw className="w-4 h-4 text-slate-400" />
            <span>LÀM MỚI</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 flex flex-wrap items-center gap-2 border-b border-white/[0.08] pb-4">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono mr-2">
          <ListFilter className="w-3.5 h-3.5 text-cyan-400" />
          <span>TIẾN TRÌNH:</span>
        </div>

        {[
          { key: 'all', label: 'Tất cả' },
          { key: 'pending_technical', label: 'Chờ QA kỹ thuật' },
          { key: 'pending_content', label: 'Chờ duyệt nội dung' },
          { key: 'approved', label: 'Đã phê duyệt' },
          { key: 'rejected', label: 'Bị từ chối' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSelectedStatus(tab.key)}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-mono font-medium border transition-all ${
              selectedStatus === tab.key
                ? 'border-cyan-400/80 bg-cyan-500/20 text-cyan-300 shadow-glow-cyan font-bold'
                : 'border-white/[0.08] bg-slate-950/60 text-slate-400 hover:text-white hover:border-white/20'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-8">
          <ErrorAlert error={error} onRetry={handleRefresh} />
        </div>
      )}

      {/* Queue Table */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse h-16 rounded-2xl bg-slate-900/60 border border-white/[0.08]" />
          ))}
        </div>
      ) : submissions.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-slate-900/50 backdrop-blur-xl shadow-glass">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300 font-sans">
              <thead className="border-b border-white/[0.08] bg-slate-950/80 text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                <tr>
                  <th className="px-5 py-4">Mã hồ sơ / Token</th>
                  <th className="px-5 py-4">Tên trò chơi</th>
                  <th className="px-5 py-4">Tác giả / Email</th>
                  <th className="px-5 py-4">Thời gian gửi</th>
                  <th className="px-5 py-4">Trạng thái</th>
                  <th className="px-5 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {submissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-800/40 transition-colors group">
                    <td className="px-5 py-4 font-mono font-medium text-slate-400">
                      <div className="text-white group-hover:text-cyan-300 transition-colors">{sub.id}</div>
                      <div className="text-[10px] text-cyan-400/80">{sub.tracking_token}</div>
                    </td>
                    <td className="px-5 py-4 font-semibold text-white">
                      <div>{sub.title}</div>
                      <div className="text-[11px] text-slate-400 line-clamp-1 font-normal font-light">
                        {sub.short_description}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-white font-medium">{sub.author_name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{sub.contact_email}</div>
                    </td>
                    <td className="px-5 py-4 text-slate-400 font-mono text-[11px]">
                      {new Date(sub.created_at).toLocaleDateString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={sub.display_status} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        to={`/admin/submissions/${sub.id}`}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 border border-cyan-500/30 px-3.5 py-1.5 text-xs font-mono font-bold text-cyan-300 hover:border-cyan-400 transition-all shadow-sm"
                      >
                        <span>CHI TIẾT DUYỆT</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-white/[0.08] bg-slate-900/30 p-12 text-center backdrop-blur-xl">
          <CheckCircle className="mx-auto h-12 w-12 text-slate-500" />
          <h3 className="mt-4 text-base font-bold text-white">Hàng chờ trống</h3>
          <p className="mt-1 text-xs text-slate-400 font-light">
            Không có hồ sơ nào phù hợp với bộ lọc hiện tại.
          </p>
        </div>
      )}
    </div>
  );
};
