import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Gamepad2,
  ArrowLeft,
  Calendar,
  User,
  Monitor,
  Maximize2,
  Minimize2,
  RefreshCw,
  AlertTriangle,
  Keyboard,
  Touchpad,
  Globe,
  Award,
  Play,
  RotateCcw,
  ShieldCheck,
  Cpu,
  Layers,
} from 'lucide-react';
import { api } from '../services/api';
import { GameDetail } from '../types';
import { ErrorAlert } from '../components/ErrorAlert';

export const GameDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [game, setGame] = useState<GameDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);

  // Play session states
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [iframeLoading, setIframeLoading] = useState<boolean>(true);
  const [iframeTimeout, setIframeTimeout] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const playerContainerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const timeoutTimerRef = useRef<any>(null);

  useEffect(() => {
    if (!slug) return;
    setIsLoading(true);
    setError(null);
    setIsPlaying(false);

    api
      .getGameDetail(slug)
      .then((res) => {
        setGame(res.data);
      })
      .catch((err) => {
        setError(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [slug]);

  const handleStartPlay = () => {
    setIsPlaying(true);
    setIframeLoading(true);
    setIframeTimeout(false);

    if (timeoutTimerRef.current) clearTimeout(timeoutTimerRef.current);
    timeoutTimerRef.current = setTimeout(() => {
      setIframeTimeout(true);
      setIframeLoading(false);
    }, 12000);
  };

  const handleIframeLoaded = () => {
    if (timeoutTimerRef.current) clearTimeout(timeoutTimerRef.current);
    setIframeLoading(false);
    setIframeTimeout(false);
  };

  const handleRetryIframe = () => {
    setIframeLoading(true);
    setIframeTimeout(false);
    if (iframeRef.current && game?.play) {
      iframeRef.current.src = game.play.url;
    }
    if (timeoutTimerRef.current) clearTimeout(timeoutTimerRef.current);
    timeoutTimerRef.current = setTimeout(() => {
      setIframeTimeout(true);
      setIframeLoading(false);
    }, 12000);
  };

  const handleToggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen?.().then(() => setIsFullscreen(true)).catch(console.warn);
    } else {
      document.exitFullscreen?.().then(() => setIsFullscreen(false)).catch(console.warn);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <div className="animate-pulse space-y-6">
          <div className="h-6 w-32 rounded bg-slate-800" />
          <div className="aspect-[16/9] w-full rounded-3xl bg-slate-800/80" />
          <div className="h-8 w-2/3 rounded bg-slate-800" />
          <div className="h-20 w-full rounded bg-slate-800/60" />
        </div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <ErrorAlert error={error || new Error('Không tìm thấy thông tin trò chơi.')} className="text-left mb-6" />
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-5 py-2.5 text-xs font-semibold text-cyan-400 hover:bg-slate-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại kho game
        </Link>
      </div>
    );
  }

  const formattedDate = new Date(game.published_at).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Top back navigation & quick breadcrumbs */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-mono font-medium text-slate-400 hover:text-cyan-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>QUAY LẠI KHO GAME</span>
        </Link>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>ISOLATED_SANDBOX_CERTIFIED</span>
        </div>
      </div>

      {/* Futuristic Main Game Stage / Theater */}
      <div
        ref={playerContainerRef}
        className="relative overflow-hidden rounded-3xl border border-white/[0.1] bg-slate-950 shadow-2xl mb-8 group"
      >
        {isPlaying && game.play ? (
          <div
            className="relative w-full bg-black flex flex-col items-center justify-center"
            style={{
              aspectRatio: game.play.aspect_ratio || 16 / 9,
              minHeight: '440px',
            }}
          >
            {/* Top Arcade HUD Action Bar */}
            <div className="absolute top-3 right-3 z-30 flex items-center gap-2 rounded-xl bg-slate-950/90 px-3 py-1.5 backdrop-blur-md border border-white/10 text-xs font-mono">
              <span className="text-cyan-400 font-bold">RELEASE: {game.play.release_version}</span>
              <span className="text-slate-600">|</span>
              <span className="text-emerald-400">FPS: ~60</span>
              <span className="text-slate-600">|</span>
              {game.play.fullscreen_supported && (
                <button
                  onClick={handleToggleFullscreen}
                  className="p-1 text-slate-300 hover:text-cyan-300 transition-colors"
                  title="Toàn màn hình"
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
              )}
              <button
                onClick={handleRetryIframe}
                className="p-1 text-slate-300 hover:text-cyan-300 transition-colors"
                title="Khởi động lại engine"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Iframe Loading Indicator */}
            {iframeLoading && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/95 text-white">
                <RefreshCw className="w-8 h-8 animate-spin text-cyan-400" />
                <p className="mt-3 text-sm font-mono font-bold tracking-wider text-cyan-300">
                  INITIALIZING_WEBGL_SANDBOX...
                </p>
                <span className="mt-1 text-xs text-slate-400">Đang khởi tạo tài nguyên WebAssembly/Canvas</span>
              </div>
            )}

            {/* Iframe Timeout state */}
            {iframeTimeout && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/95 p-6 text-center">
                <AlertTriangle className="w-10 h-10 text-amber-400" />
                <h4 className="mt-3 text-base font-bold text-white">Quá thời gian khởi tạo Sandbox</h4>
                <p className="mt-1 text-xs text-slate-400 max-w-md">
                  Máy chủ thử nghiệm phản hồi chậm hoặc trình duyệt gặp sự cố kết nối tới sandbox.
                </p>
                <button
                  onClick={handleRetryIframe}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-400 shadow-glow-cyan"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Tải lại sandbox
                </button>
              </div>
            )}

            {/* Sandbox Iframe */}
            <iframe
              ref={iframeRef}
              src={game.play.url}
              title={game.title}
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              allow="fullscreen"
              onLoad={handleIframeLoaded}
              className="h-full w-full border-0"
              style={{ minHeight: '440px' }}
            />
          </div>
        ) : (
          /* Cinematic Launch Banner */
          <div className="relative aspect-[16/8] min-h-[380px] w-full overflow-hidden bg-gradient-to-t from-slate-950 via-slate-900/60 to-slate-900">
            {game.thumbnail ? (
              <img
                src={game.thumbnail.url}
                alt={game.thumbnail.alt || game.title}
                className="h-full w-full object-cover opacity-30 blur-[2px] scale-105"
              />
            ) : (
              <div className="h-full w-full bg-slate-950 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:20px_20px] opacity-25" />
            )}

            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent">
              <div className="rounded-2xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border border-cyan-500/40 p-4 text-cyan-300 mb-4 shadow-glow-cyan">
                <Gamepad2 className="w-8 h-8" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">{game.title}</h2>
              <p className="mt-2 text-xs sm:text-sm text-slate-300 max-w-xl font-light">{game.short_description}</p>

              {game.play ? (
                <button
                  onClick={handleStartPlay}
                  className="mt-6 inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-cyan-400 via-emerald-400 to-teal-400 px-9 py-4 text-sm sm:text-base font-extrabold text-slate-950 shadow-glow-cyan hover:scale-105 transition-all"
                >
                  <Play className="w-5 h-5 fill-current" />
                  CHƠI TRỰC TIẾP TRÊN TRÌNH DUYỆT
                </button>
              ) : (
                <div className="mt-6 rounded-xl border border-amber-500/30 bg-amber-950/30 px-5 py-2.5 text-xs text-amber-300 font-mono">
                  Bản phát hành đang được bảo trì hoặc chưa sẵn sàng để chơi trực tiếp.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Content Warnings Alert */}
      {game.content_warnings && game.content_warnings.length > 0 && (
        <div className="mb-8 rounded-2xl border border-amber-500/30 bg-amber-950/20 p-4 text-xs text-amber-200 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <span className="font-bold text-amber-300">CẢNH BÁO NỘI DUNG: </span>
            {game.content_warnings.join(' · ')}
          </div>
        </div>
      )}

      {/* Grid: Details & Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main 2 Cols */}
        <div className="lg:col-span-2 space-y-6">
          {/* About Game */}
          <div className="rounded-3xl border border-white/[0.08] bg-slate-900/60 p-6 sm:p-7 backdrop-blur-xl">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              Giới thiệu trò chơi
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line font-light">
              {game.description}
            </p>
          </div>

          {/* Controls HUD */}
          <div className="rounded-3xl border border-white/[0.08] bg-slate-900/60 p-6 sm:p-7 backdrop-blur-xl">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Keyboard className="w-4 h-4 text-cyan-400" />
              Bản đồ phím điều khiển (Controls HUD)
            </h3>
            <div className="space-y-3 text-xs sm:text-sm font-mono">
              {game.controls.keyboard && (
                <div className="rounded-2xl border border-white/[0.06] bg-slate-950/70 p-4 space-y-1">
                  <div className="font-bold text-cyan-300 flex items-center gap-1.5 text-xs">
                    <Monitor className="w-3.5 h-3.5 text-cyan-400" /> BÀN PHÍM & CHUỘT:
                  </div>
                  <div className="text-slate-300 font-sans text-xs sm:text-sm">{game.controls.keyboard}</div>
                </div>
              )}
              {game.controls.touch ? (
                <div className="rounded-2xl border border-white/[0.06] bg-slate-950/70 p-4 space-y-1">
                  <div className="font-bold text-emerald-400 flex items-center gap-1.5 text-xs">
                    <Touchpad className="w-3.5 h-3.5 text-emerald-400" /> CẢM ỨNG MÀN HÌNH:
                  </div>
                  <div className="text-slate-300 font-sans text-xs sm:text-sm">{game.controls.touch}</div>
                </div>
              ) : (
                <div className="text-xs text-slate-500 italic font-sans">
                  Chưa hỗ trợ thao tác cảm ứng di động.
                </div>
              )}
            </div>
          </div>

          {/* Screenshots Gallery */}
          {game.screenshots && game.screenshots.length > 0 && (
            <div className="rounded-3xl border border-white/[0.08] bg-slate-900/60 p-6 sm:p-7 backdrop-blur-xl">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                Hình ảnh trong game
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {game.screenshots.map((s, idx) => (
                  <div
                    key={idx}
                    className="overflow-hidden rounded-2xl border border-white/[0.08] bg-slate-950 aspect-[16/9] group"
                  >
                    <img
                      src={s.url}
                      alt={s.alt || `Screenshot ${idx + 1}`}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-white/[0.08] bg-slate-900/60 p-6 backdrop-blur-xl space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 border-b border-white/[0.08] pb-3">
              THÔNG SỐ DỰ ÁN
            </h3>

            {/* Author */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-cyan-400" /> Tác giả:
              </span>
              <span className="font-bold text-white">{game.author.display_name}</span>
            </div>

            {/* Publish date */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" /> Phát hành:
              </span>
              <span className="text-slate-300 font-mono">{formattedDate}</span>
            </div>

            {/* Devices */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Monitor className="w-3.5 h-3.5 text-cyan-400" /> Thiết bị:
              </span>
              <div className="flex items-center gap-1.5">
                {game.supported_devices.includes('desktop') && (
                  <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-cyan-300 font-mono border border-cyan-500/20">
                    Desktop
                  </span>
                )}
                {game.supported_devices.includes('mobile') && (
                  <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-emerald-400 font-mono border border-emerald-500/20">
                    Mobile
                  </span>
                )}
              </div>
            </div>

            {/* Languages */}
            {game.languages && game.languages.length > 0 && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-cyan-400" /> Ngôn ngữ:
                </span>
                <span className="text-slate-300">{game.languages.join(', ')}</span>
              </div>
            )}

            {/* Tags */}
            <div className="pt-2 border-t border-white/[0.06]">
              <span className="text-xs text-slate-400 block mb-2 font-mono">THỂ LOẠI:</span>
              <div className="flex flex-wrap gap-1.5">
                {game.tags.map((tag) => (
                  <span
                    key={tag.slug}
                    className="rounded-lg bg-cyan-950/40 px-2.5 py-1 text-xs font-mono text-cyan-300 border border-cyan-500/30"
                  >
                    #{tag.label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Credits Box */}
          {game.credits && game.credits.length > 0 && (
            <div className="rounded-3xl border border-white/[0.08] bg-slate-900/60 p-6 backdrop-blur-xl">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 mb-3 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-400" /> TÁC QUYỀN & ĐỘI NGŨ
              </h3>
              <ul className="space-y-2.5 text-xs">
                {game.credits.map((c, i) => (
                  <li key={i} className="flex justify-between border-b border-white/[0.06] pb-2">
                    <span className="text-white font-medium">{c.name}</span>
                    <span className="text-slate-400 font-mono">{c.role}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
