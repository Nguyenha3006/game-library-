import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CatalogPage } from './pages/CatalogPage';
import { GameDetailPage } from './pages/GameDetailPage';
import { SubmitPage } from './pages/SubmitPage';
import { StatusPage } from './pages/StatusPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminQueuePage } from './pages/AdminQueuePage';
import { AdminDetailPage } from './pages/AdminDetailPage';
import { AdminGamePage } from './pages/AdminGamePage';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="jp-paper-bg relative flex min-h-screen flex-col text-[#161616]">
        <div className="relative z-10 flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Screens */}
              <Route path="/" element={<CatalogPage />} />
              <Route path="/games/:slug" element={<GameDetailPage />} />
              <Route path="/submit" element={<SubmitPage />} />
              <Route path="/submission-status" element={<StatusPage />} />

              {/* Admin & Operations Screens */}
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route path="/admin/submissions" element={<AdminQueuePage />} />
              <Route path="/admin/submissions/:id" element={<AdminDetailPage />} />
              <Route path="/admin/games/:id" element={<AdminGamePage />} />

              {/* 404 Fallback */}
              <Route
                path="*"
                element={
                  <div className="mx-auto max-w-md px-4 py-20 text-center">
                    <h2 className="text-5xl font-black text-[#1d2433]">404</h2>
                    <p className="mt-2 text-sm text-[#6f6255]">Trang bạn tìm kiếm không tồn tại.</p>
                  </div>
                }
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
