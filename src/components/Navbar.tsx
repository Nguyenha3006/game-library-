import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { UploadCloud, Search, ShieldCheck, LogOut, Cpu, Server } from 'lucide-react';
import { isMockMode, setClientMode } from '../services/api';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mockActive] = useState(isMockMode());
  const [staffMe, setStaffMe] = useState<{ actor: { display_name: string }; roles: string[] } | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem('gamelib_staff_me');
    if (raw) {
      try {
        setStaffMe(JSON.parse(raw));
      } catch {
        setStaffMe(null);
      }
    } else {
      setStaffMe(null);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    sessionStorage.removeItem('gamelib_staff_token');
    sessionStorage.removeItem('gamelib_staff_me');
    setStaffMe(null);
    navigate('/');
  };

  const toggleMode = () => {
    setClientMode(mockActive ? 'real' : 'mock');
  };

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const navClass = (active: boolean) =>
    `text-sm transition ${active ? 'font-semibold text-[#b33a32]' : 'text-[#555] hover:text-[#161616]'}`;

  return (
    <header className="sticky top-0 z-50 border-b border-[#ddd6ca] bg-[#fffdf8]/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-4 sm:px-6">
        <Link to="/" className="flex items-baseline gap-3">
          <span className="jp-serif text-xl font-semibold text-[#161616]">Game Library</span>
          <span className="hidden text-xs font-medium tracking-[0.2em] text-[#777] sm:inline">ゲーム図鑑</span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          <Link to="/" className={navClass(isActive('/') && !isActive('/admin'))}>
            Kho game
          </Link>
          <Link to="/submit" className={navClass(isActive('/submit'))}>
            Nộp game
          </Link>
          <Link to="/submission-status" className={navClass(isActive('/submission-status'))}>
            Tra cứu
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleMode}
            title={mockActive ? 'Đang bật dữ liệu mẫu. Bấm để chuyển sang Backend /api/v1' : 'Đang kết nối Backend thật. Bấm để chuyển sang Mock'}
            className="hidden items-center gap-1.5 rounded-full border border-[#ddd6ca] bg-white px-3 py-1.5 text-xs font-medium text-[#555] transition hover:border-[#b33a32] hover:text-[#b33a32] sm:flex"
          >
            {mockActive ? <Cpu className="h-3.5 w-3.5" /> : <Server className="h-3.5 w-3.5" />}
            <span>{mockActive ? 'Mock' : 'Live'}</span>
          </button>

          {staffMe ? (
            <div className="flex items-center gap-2">
              <Link to="/admin/submissions" className="jp-button-secondary text-xs">
                {staffMe.actor.display_name}
              </Link>
              <button
                onClick={handleLogout}
                title="Đăng xuất"
                className="rounded-full p-2 text-[#777] transition hover:bg-white hover:text-[#b33a32]"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Link to="/admin/login" className="jp-button-secondary text-xs">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Admin</span>
            </Link>
          )}
        </div>
      </div>

      <div className="flex justify-around border-t border-[#ebe6df] bg-[#fffdf8] px-3 py-2 text-xs md:hidden">
        <Link to="/" className={isActive('/') && !isActive('/admin') ? 'font-semibold text-[#b33a32]' : 'text-[#555]'}>
          Kho game
        </Link>
        <Link to="/submit" className={isActive('/submit') ? 'font-semibold text-[#b33a32]' : 'text-[#555]'}>
          <UploadCloud className="mr-1 inline h-3.5 w-3.5" />
          Nộp game
        </Link>
        <Link to="/submission-status" className={isActive('/submission-status') ? 'font-semibold text-[#b33a32]' : 'text-[#555]'}>
          <Search className="mr-1 inline h-3.5 w-3.5" />
          Tra cứu
        </Link>
      </div>
    </header>
  );
};
