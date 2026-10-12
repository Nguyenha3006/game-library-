import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-[#ddd6ca] bg-[#fffdf8] py-8 text-sm text-[#555]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-5 md:flex-row md:items-center">
          <div>
            <p className="jp-serif text-base font-semibold text-[#161616]">Game Library</p>
            <p className="mt-1 text-xs tracking-[0.16em] text-[#777]">ゲーム図鑑 / WEB ARCHIVE</p>
          </div>

          <div className="flex flex-wrap items-center gap-5 text-xs font-medium">
            <Link to="/" className="transition hover:text-[#161616]">
              Kho game
            </Link>
            <Link to="/submit" className="transition hover:text-[#161616]">
              Nộp game
            </Link>
            <Link to="/submission-status" className="transition hover:text-[#161616]">
              Tra cứu
            </Link>
            <Link to="/admin/login" className="flex items-center gap-1.5 transition hover:text-[#161616]">
              <ShieldAlert className="h-3.5 w-3.5" />
              Nhân sự
            </Link>
          </div>
        </div>

        <div className="mt-6 border-t border-[#ebe6df] pt-5 text-xs text-[#777]">
          <p>© 2026 Game Library Platform. Mọi quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  );
};
