import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Monitor, Smartphone, Calendar, User, BookMarked } from 'lucide-react';
import { GameCard as GameCardType } from '../types';

interface GameCardProps {
  game: GameCardType;
}

export const GameCard: React.FC<GameCardProps> = ({ game }) => {
  const [imgError, setImgError] = useState(false);

  const formattedDate = new Date(game.published_at).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <Link
      to={`/games/${game.slug}`}
      className="group jp-card jp-card-hover relative flex h-full flex-col overflow-hidden rounded-xl"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#ece6dc]">
        {game.thumbnail && !imgError ? (
          <img
            src={game.thumbnail.url}
            alt={game.thumbnail.alt || game.title}
            onError={() => setImgError(true)}
            className="h-full w-full object-cover transition duration-500 ease-out group-hover:scale-[1.03]"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-[#ece6dc] p-5 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#d1c8bc] bg-[#fffdf8] text-[#555]">
              <BookMarked className="h-6 w-6" />
            </div>
            <span className="mt-3 text-[11px] font-medium tracking-[0.14em] text-[#777]">
              Chưa có bìa
            </span>
          </div>
        )}

        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full border border-[#ddd6ca] bg-[#fffdf8]/90 px-2.5 py-1 text-[#555] backdrop-blur">
          {game.supported_devices.includes('desktop') && (
            <span title="Tối ưu Desktop" className="flex items-center gap-1">
              <Monitor className="h-3.5 w-3.5" />
            </span>
          )}
          {game.supported_devices.includes('mobile') && (
            <span title="Hỗ trợ Mobile Touch" className="flex items-center gap-1">
              <Smartphone className="h-3.5 w-3.5" />
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-3 flex flex-wrap gap-1.5">
          {game.tags.slice(0, 3).map((tag) => (
            <span key={tag.slug} className="text-[11px] font-medium text-[#777]">
              {tag.label}
            </span>
          ))}
        </div>

        <h3 className="jp-serif line-clamp-1 text-lg font-semibold text-[#161616] transition group-hover:text-[#b33a32]">
          {game.title}
        </h3>

        <p className="mt-2 line-clamp-2 flex-1 text-sm leading-6 text-[#555]">
          {game.short_description}
        </p>

        <div className="mt-4 flex items-center justify-between border-t border-[#ebe6df] pt-3 text-xs text-[#777]">
          <div className="flex min-w-0 items-center gap-1.5 pr-2">
            <User className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{game.author.display_name}</span>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            <span>{formattedDate}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};
