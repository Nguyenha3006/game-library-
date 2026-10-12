import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, ArrowRight, UserCheck, RefreshCw, Terminal } from 'lucide-react';
import { api } from '../services/api';
import { ErrorAlert } from '../components/ErrorAlert';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const handleLogin = async (e?: React.FormEvent, directEmail?: string) => {
    if (e) e.preventDefault();
    const loginEmail = directEmail || email;
    if (!loginEmail) {
      setError(new Error('Vui lòng nhập email nhân sự.'));
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await api.adminLogin(loginEmail, password);
      navigate('/admin/submissions');
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (roleEmail: string) => {
    setEmail(roleEmail);
    setPassword('demo-password');
    handleLogin(undefined, roleEmail);
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-16 sm:px-6">
      <div className="rounded-3xl border border-white/[0.08] bg-slate-900/70 p-8 sm:p-10 backdrop-blur-xl shadow-glass relative overflow-hidden">
        {/* Glow orb */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-52 h-52 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />

        <div className="text-center mb-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border border-cyan-500/30 text-cyan-400 mb-4 shadow-glow-cyan">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-3 py-0.5 text-[10px] font-mono text-cyan-300 font-bold mb-2">
            <Terminal className="w-3 h-3" /> STAFF_AUTHENTICATION_GATE
          </div>
          <h1 className="text-2xl font-extrabold text-white">Cổng Quản Trị Nhân Sự</h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-400 font-light">
            Xác thực tài khoản nhân sự kiểm định kỹ thuật QA, kiểm duyệt nội dung và kỹ sư tích hợp build.
          </p>
        </div>

        {error && (
          <div className="mb-6">
            <ErrorAlert error={error} />
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5 font-mono">
              EMAIL_IDENTIFIER
            </label>
            <div className="relative group">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="staff@gamelib.internal"
                className="w-full rounded-xl border border-white/[0.08] bg-slate-950/90 px-10 py-2.5 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-all font-sans"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5 font-mono">
              ACCESS_KEY / PASSWORD
            </label>
            <div className="relative group">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-white/[0.08] bg-slate-950/90 px-10 py-2.5 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-all font-sans"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 via-emerald-400 to-teal-400 py-3.5 text-xs font-mono font-bold uppercase tracking-wider text-slate-950 hover:scale-[1.01] transition-all shadow-glow-cyan disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>ĐANG XÁC THỰC QUYỀN...</span>
              </>
            ) : (
              <>
                <span>ĐĂNG NHẬP HỆ THỐNG</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick test accounts */}
        <div className="mt-8 pt-6 border-t border-white/[0.08]">
          <p className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-cyan-400" /> TÀI KHOẢN MẪU THEO VAI TRÒ:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
            <button
              type="button"
              onClick={() => handleQuickLogin('cuong@gamelib.internal')}
              className="text-left p-3 rounded-xl border border-white/[0.08] bg-slate-950/80 hover:border-cyan-400 hover:bg-slate-900 transition-all group"
            >
              <div className="font-bold text-white group-hover:text-cyan-300">Cường (QA Kỹ thuật)</div>
              <div className="text-[10px] text-slate-500 truncate">cuong@gamelib.internal</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('ha@gamelib.internal')}
              className="text-left p-3 rounded-xl border border-white/[0.08] bg-slate-950/80 hover:border-cyan-400 hover:bg-slate-900 transition-all group"
            >
              <div className="font-bold text-white group-hover:text-cyan-300">Hà (Duyệt nội dung)</div>
              <div className="text-[10px] text-slate-500 truncate">ha@gamelib.internal</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('tung@gamelib.internal')}
              className="text-left p-3 rounded-xl border border-white/[0.08] bg-slate-950/80 hover:border-cyan-400 hover:bg-slate-900 transition-all group"
            >
              <div className="font-bold text-white group-hover:text-cyan-300">Tùng (Vận hành build)</div>
              <div className="text-[10px] text-slate-500 truncate">tung@gamelib.internal</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('minh@gamelib.internal')}
              className="text-left p-3 rounded-xl border border-white/[0.08] bg-slate-950/80 hover:border-cyan-400 hover:bg-slate-900 transition-all group"
            >
              <div className="font-bold text-white group-hover:text-cyan-300">Minh (Toàn quyền Admin)</div>
              <div className="text-[10px] text-slate-500 truncate">minh@gamelib.internal</div>
            </button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link to="/" className="text-xs font-mono text-slate-500 hover:text-cyan-300 transition-colors">
            ← QUAY LẠI TRANG CHỦ KHO GAME
          </Link>
        </div>
      </div>
    </div>
  );
};
