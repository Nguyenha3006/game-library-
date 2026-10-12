import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Monitor, Smartphone, RefreshCw, FilterX } from 'lucide-react';
import { api } from '../services/api';
import { GameCard as GameCardType, Tag, DeviceType } from '../types';
import { GameCard } from '../components/GameCard';
import { ErrorAlert } from '../components/ErrorAlert';

export const CatalogPage: React.FC = () => {
  const [games, setGames] = useState<GameCardType[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(false);

  const [searchInput, setSearchInput] = useState<string>('');
  const [debouncedQuery, setDebouncedQuery] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [deviceFilter, setDeviceFilter] = useState<'all' | DeviceType>('all');
  const [sortOption, setSortOption] = useState<'newest' | 'title_asc'>('newest');

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);

  const activeRequestSeq = useRef<number>(0);

  useEffect(() => {
    let mounted = true;
    api
      .getTags()
      .then((res) => {
        if (mounted) setTags(res.data);
      })
      .catch((err) => {
        console.warn('Lỗi tải tags:', err);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchInput.trim().slice(0, 100));
    }, 300);
    return () => clearTimeout(handler);
  }, [searchInput]);

  const fetchGames = useCallback(
    async (cursor: string | null = null, isAppend = false) => {
      const seq = ++activeRequestSeq.current;
      if (isAppend) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
        setError(null);
      }

      try {
        const tagsParam = selectedTags.length > 0 ? selectedTags.join(',') : undefined;
        const deviceParam = deviceFilter === 'all' ? undefined : deviceFilter;

        const res = await api.getGames({
          query: debouncedQuery || undefined,
          tags: tagsParam,
          device: deviceParam,
          sort: sortOption,
          cursor: cursor || undefined,
          limit: 12,
        });

        if (seq !== activeRequestSeq.current) return;

        setGames((prev) => (isAppend ? [...prev, ...res.data] : res.data));
        setNextCursor(res.page.next_cursor);
        setHasMore(res.page.has_more);
      } catch (err) {
        if (seq === activeRequestSeq.current) setError(err);
      } finally {
        if (seq === activeRequestSeq.current) {
          setIsLoading(false);
          setIsLoadingMore(false);
        }
      }
    },
    [debouncedQuery, selectedTags, deviceFilter, sortOption]
  );

  useEffect(() => {
    fetchGames(null, false);
  }, [fetchGames]);

  const handleTagToggle = (slug: string) => {
    setSelectedTags((prev) => {
      if (prev.includes(slug)) return prev.filter((s) => s !== slug);
      if (prev.length >= 5) return prev;
      return [...prev, slug];
    });
  };

  const handleClearFilters = () => {
    setSearchInput('');
    setDebouncedQuery('');
    setSelectedTags([]);
    setDeviceFilter('all');
    setSortOption('newest');
  };

  const handleLoadMore = () => {
    if (nextCursor && hasMore && !isLoadingMore) fetchGames(nextCursor, true);
  };

  const hasActiveFilters =
    debouncedQuery || selectedTags.length > 0 || deviceFilter !== 'all' || sortOption !== 'newest';

  const deviceButtonClass = (active: boolean) =>
    `inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${
      active ? 'bg-[#161616] text-white' : 'border border-[#ddd6ca] bg-white text-[#555] hover:text-[#161616]'
    }`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <section className="mb-10 border-b border-[#ddd6ca] pb-9">
        <p className="text-xs font-medium tracking-[0.28em] text-[#b33a32]">ゲーム図鑑</p>
        <div className="mt-5 grid gap-6 md:grid-cols-[1fr_320px] md:items-end">
          <div>
            <h1 className="jp-serif text-4xl font-semibold leading-tight text-[#161616] sm:text-5xl">
              Kho game web tối giản
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-[#555]">
              Chọn, đọc và chơi game HTML5/WebGL trong một giao diện sạch: ít màu, đúng chữ, rõ thông tin.
            </p>
          </div>
          <div className="border-l border-[#b33a32] pl-4 text-sm leading-7 text-[#555]">
            <p className="font-medium text-[#161616]">Game Library / Web archive</p>
            <p>Danh mục game sinh viên và indie creator.</p>
          </div>
        </div>
      </section>

      <section className="jp-surface mb-8 rounded-xl p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#777]" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Tìm game..."
              maxLength={100}
              className="w-full rounded-full border border-[#ddd6ca] bg-white px-10 py-2.5 text-sm text-[#161616] outline-none transition placeholder:text-[#999] focus:border-[#b33a32]"
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-[#777] hover:text-[#b33a32]"
              >
                x
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <button onClick={() => setDeviceFilter('all')} className={deviceButtonClass(deviceFilter === 'all')}>
              Tất cả
            </button>
            <button onClick={() => setDeviceFilter('desktop')} className={deviceButtonClass(deviceFilter === 'desktop')}>
              <Monitor className="h-3.5 w-3.5" />
              Desktop
            </button>
            <button onClick={() => setDeviceFilter('mobile')} className={deviceButtonClass(deviceFilter === 'mobile')}>
              <Smartphone className="h-3.5 w-3.5" />
              Mobile
            </button>
          </div>

          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as any)}
            className="rounded-full border border-[#ddd6ca] bg-white px-4 py-2.5 text-sm text-[#161616] outline-none transition focus:border-[#b33a32]"
          >
            <option value="newest">Mới nhất</option>
            <option value="title_asc">Tên A-Z</option>
          </select>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[#ebe6df] pt-4">
          {tags.map((tag) => {
            const isSelected = selectedTags.includes(tag.slug);
            return (
              <button
                key={tag.slug}
                onClick={() => handleTagToggle(tag.slug)}
                className={isSelected ? 'jp-chip jp-chip-active' : 'jp-chip hover:border-[#b33a32]'}
              >
                {tag.label}
              </button>
            );
          })}

          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="ml-auto inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium text-[#b33a32] transition hover:bg-white"
            >
              <FilterX className="h-3.5 w-3.5" />
              Xóa lọc
            </button>
          )}
        </div>
      </section>

      {error && (
        <div className="mb-8">
          <ErrorAlert error={error} onRetry={() => fetchGames(null, false)} />
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse rounded-xl border border-[#ddd6ca] bg-[#fffdf8] p-4">
              <div className="aspect-[16/10] rounded-xl bg-[#ebe6df]" />
              <div className="mt-4 h-4 w-3/4 rounded bg-[#ebe6df]" />
              <div className="mt-3 h-3 w-full rounded bg-[#f1ede6]" />
            </div>
          ))}
        </div>
      ) : games.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {games.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>

          <div className="mt-10 flex justify-center">
            {hasMore ? (
              <button onClick={handleLoadMore} disabled={isLoadingMore} className="jp-button-primary">
                {isLoadingMore ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Đang tải
                  </>
                ) : (
                  'Tải thêm'
                )}
              </button>
            ) : (
              <div className="text-xs font-medium text-[#777]">Đã hiển thị hết danh mục</div>
            )}
          </div>
        </>
      ) : (
        <div className="jp-surface rounded-xl p-12 text-center">
          <h3 className="text-lg font-semibold text-[#161616]">Không tìm thấy trò chơi phù hợp</h3>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-7 text-[#555]">
            {hasActiveFilters ? 'Thử đổi từ khóa hoặc bỏ bớt thể loại.' : 'Hiện chưa có trò chơi nào được phát hành.'}
          </p>
          {hasActiveFilters && (
            <button onClick={handleClearFilters} className="jp-button-primary mt-6">
              Đặt lại bộ lọc
            </button>
          )}
        </div>
      )}
    </div>
  );
};
