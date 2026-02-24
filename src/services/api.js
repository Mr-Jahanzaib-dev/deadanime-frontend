// ==================== CONFIGURATION ====================
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const DEAD_ANIME_API = `${API_URL}/api/deadanime`;

console.log('🔗 Backend API URL:', API_URL);
console.log('🔗 Proxy URL:', DEAD_ANIME_API);

// ==================== UTILITIES ====================

/**
 * Fetch wrapper with exponential-backoff retry.
 * Pass `cache: 'force-cache'` in options for cacheable reads.
 */
const apiFetch = async (url, options = {}, retries = 2) => {
  for (let i = 0; i <= retries; i++) {
    try {
      console.log(`🔍 Fetching (attempt ${i + 1}/${retries + 1}): ${url}`);

      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        // Default to no-store only when caller hasn't specified a cache policy
        cache: options.cache ?? 'no-store',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Success:', url);
      return data;
    } catch (error) {
      console.error(`❌ Attempt ${i + 1} failed: ${error.message}`);
      if (i === retries) throw error;
      await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, i)));
    }
  }
};

/**
 * Robustly extract an array of anime from any API response shape.
 * Checks the most common wrapper patterns in order.
 */
const extractAnimeList = (data) => {
  if (!data) {
    console.warn('⚠️ extractAnimeList: no data');
    return [];
  }

  // Already a plain array
  if (Array.isArray(data)) return data;

  // Walk common wrapper paths
  const candidates = [
    // { status: 'success', data: [...] }
    data.status === 'success' ? data.data : undefined,
    // { data: { results: [...] } }
    data.data?.results,
    // { data: [...] }
    data.data,
    // { results: [...] }
    data.results,
    // { anime: [...] }
    data.anime,
    // { posts: [...] }
    data.posts,
    // { items: [...] }
    data.items,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;

    // Handle numeric-keyed objects like { "0": {...}, "1": {...} }
    if (candidate && typeof candidate === 'object') {
      const values = Object.values(candidate);
      if (values.length > 0 && values.every((v) => v && typeof v === 'object' && v.id)) {
        return values;
      }
    }
  }

  console.warn('⚠️ extractAnimeList: could not find array in response', data);
  return [];
};

/**
 * Normalise a raw anime object from the Dead Anime API into the
 * consistent shape the app expects.
 */
const transformAnimeData = (anime) => {
  if (!anime || typeof anime !== 'object') return null;

  try {
    // ── Images ──────────────────────────────────────────────────────────────
    let posterUrl = '';
    let backdropUrl = '';

    if (typeof anime.image === 'string') {
      posterUrl = backdropUrl = anime.image;
    } else if (anime.image && typeof anime.image === 'object') {
      posterUrl   = anime.image.poster   || anime.image.large  || anime.image.medium || '';
      backdropUrl = anime.image.backdrop || anime.image.large  || anime.image.medium || '';
    }

    // Handle bare TMDB-style paths
    if (posterUrl   && posterUrl.startsWith('/'))   posterUrl   = `https://image.tmdb.org/t/p/w500${posterUrl}`;
    if (backdropUrl && backdropUrl.startsWith('/')) backdropUrl = `https://image.tmdb.org/t/p/original${backdropUrl}`;

    // ── Release year ─────────────────────────────────────────────────────────
    let year = 'N/A';
    if (anime.year) {
      year = String(anime.year);
    } else if (anime.release && anime.release !== '0000-00-00') {
      try { year = String(new Date(anime.release).getFullYear()); } catch (_) { /* keep N/A */ }
    }

    // ── Completion flag ──────────────────────────────────────────────────────
    // Treat as complete when either `complete` is a non-empty, non-zero date string,
    // OR `status` explicitly says 'completed' / 'complete'.
    const statusCompleted =
      ['completed', 'complete', 'finished'].includes(
        String(anime.status ?? '').toLowerCase()
      );
    const completeDate =
      anime.complete && anime.complete !== '0000-00-00' ? anime.complete : null;
    const isComplete = statusCompleted || Boolean(completeDate);

    return {
      id:          anime.id,
      slug:        anime.slug || String(anime.name || '').toLowerCase().replace(/\s+/g, '-'),
      name:        anime.name  || anime.title || 'Unknown',
      type:        (anime.type || 'series').toLowerCase(),
      image: {
        poster:   posterUrl,
        backdrop: backdropUrl,
      },
      poster_img:  posterUrl,
      rating:      anime.rating  ?? 'N/A',
      year,
      release:     anime.release || year,
      episodes:    parseInt(anime.episodes)  || 0,
      overview:    anime.overview || anime.description || '',
      duration:    anime.duration || null,
      complete:    isComplete ? (completeDate || 'completed') : null,
      isComplete,
      views:       parseInt(anime.views) || 0,
      subOrDub:    anime.subOrDub || 'Sub/Dub',
      age:         anime.age || null,
      genres:      Array.isArray(anime.genres) ? anime.genres : [],
    };
  } catch (error) {
    console.error('❌ transformAnimeData error:', error);
    return null;
  }
};

// ==================== API FUNCTIONS ====================

// ── Search Anime ─────────────────────────────────────────────────────────────
export const searchAnime = async (term, page = 1, limit = 12) => {
  try {
    if (!term || !term.trim()) return { posts: [], total_pages: 0 };

    const data = await apiFetch(
      `${DEAD_ANIME_API}/list?search=${encodeURIComponent(term.trim())}&limit=${limit}&page=${page}`
    );

    const posts = extractAnimeList(data).map(transformAnimeData).filter(Boolean);
    console.log(`✅ Search: ${posts.length} results for "${term}"`);
    return { posts, total_pages: Math.ceil(posts.length / limit) || 1 };
  } catch (error) {
    console.error('❌ searchAnime error:', error);
    return { posts: [], total_pages: 0 };
  }
};

// ── Anime info ───────────────────────────────────────────────────────────────
export const getAnimeInfo = async (slug) => {
  try {
    if (!slug) throw new Error('slug is required');

    const data = await apiFetch(`${DEAD_ANIME_API}/anime?slug=${encodeURIComponent(slug)}`);
    const raw  = data?.data ?? data;
    const transformed = transformAnimeData(raw);

    if (!transformed) throw new Error('Failed to transform anime data');
    console.log('✅ getAnimeInfo:', transformed.name);
    return transformed;
  } catch (error) {
    console.error('❌ getAnimeInfo error:', error);
    return null;
  }
};

// ── Season info (local — upstream doesn't expose a seasons endpoint) ─────────
export const getSeasonInfo = async (animeId) => {
  return {
    seasons: [{ id: animeId, num: 1, name: 'Season 1' }],
  };
};

// ── Episodes ─────────────────────────────────────────────────────────────────
export const getEpisodes = async (seasonId) => {
  try {
    const data = await apiFetch(
      `${DEAD_ANIME_API}/pack?season_id=${encodeURIComponent(seasonId)}&start_ep=1&end_ep=9999`
    );

    // The pack endpoint returns an episode list, not an anime list,
    // so we unwrap carefully before mapping.
    const raw = data?.data ?? data?.results ?? data ?? [];
    const episodeList = Array.isArray(raw) ? raw : Object.values(raw);

    const episodes = episodeList.map((ep, index) => ({
      id:     ep.id     ?? index + 1,
      number: parseInt(ep.episode ?? ep.number ?? ep.ep) || index + 1,
      name:   ep.name   || ep.title || `Episode ${index + 1}`,
      note:   ep.note   || null,
      image:  ep.image  || null,
    }));

    console.log(`✅ getEpisodes: ${episodes.length} episodes`);
    return episodes;
  } catch (error) {
    console.error('❌ getEpisodes error:', error);
    return [];
  }
};

// ── Episode streaming links ───────────────────────────────────────────────────
export const getEpisodeLinks = async (episodeId, slug, season = 1, episode = 1) => {
  try {
    if (!slug) {
      console.warn('⚠️ getEpisodeLinks: no slug provided');
      return { servers: [], hasValidLinks: false, total: 0 };
    }

    const data = await apiFetch(
      `${DEAD_ANIME_API}/episode?slug=${encodeURIComponent(slug)}&season=${season}&episode=${episode}`
    );

    const episodeData = data?.data ?? data;
    const servers = [];

    if (Array.isArray(episodeData.sources)) {
      episodeData.sources.forEach((source, i) => {
        const url = source.url || source.file;
        if (url) {
          servers.push({
            name:    source.name    || `Server ${i + 1}`,
            watch:   url,
            url,
            quality: source.quality || 'auto',
          });
        }
      });
    } else if (episodeData.url) {
      servers.push({ name: 'Default', watch: episodeData.url, url: episodeData.url, quality: 'auto' });
    }

    console.log(`✅ getEpisodeLinks: ${servers.length} sources`);
    return { servers, hasValidLinks: servers.length > 0, total: servers.length };
  } catch (error) {
    console.error('❌ getEpisodeLinks error:', error);
    return { servers: [], hasValidLinks: false, total: 0, error: error.message };
  }
};

// ── Popular anime (sorted by rating desc) ────────────────────────────────────
export const getPopularAnime = async (_duration = 'month', page = 1, limit = 12) => {
  try {
    const data = await apiFetch(
      `${DEAD_ANIME_API}/list?limit=${limit * 3}&page=${page}`,
      { cache: 'default' }
    );

    const posts = extractAnimeList(data)
      .map(transformAnimeData)
      .filter(Boolean)
      .sort((a, b) => (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0))
      .slice(0, limit);

    console.log(`✅ getPopularAnime: ${posts.length}`);
    return { posts, total_pages: 1 };
  } catch (error) {
    console.error('❌ getPopularAnime error:', error);
    return { posts: [], total_pages: 0 };
  }
};

// ── Series only ───────────────────────────────────────────────────────────────
export const getSeries = async (page = 1, limit = 12) => {
  try {
    const data = await apiFetch(
      `${DEAD_ANIME_API}/list?limit=${limit * 3}&page=${page}`,
      { cache: 'default' }
    );

    const posts = extractAnimeList(data)
      .map(transformAnimeData)
      .filter(Boolean)
      .filter((a) => a.type !== 'movie')
      .slice(0, limit);

    console.log(`✅ getSeries: ${posts.length}`);
    return { posts, total_pages: 1 };
  } catch (error) {
    console.error('❌ getSeries error:', error);
    return { posts: [], total_pages: 0 };
  }
};

// ── Movies only ───────────────────────────────────────────────────────────────
export const getMovies = async (page = 1, limit = 12) => {
  try {
    const data = await apiFetch(
      `${DEAD_ANIME_API}/list?limit=100&page=${page}`,
      { cache: 'default' }
    );

    const posts = extractAnimeList(data)
      .map(transformAnimeData)
      .filter(Boolean)
      .filter((a) => a.type === 'movie')
      .slice(0, limit);

    console.log(`✅ getMovies: ${posts.length}`);
    return { posts, total_pages: 1 };
  } catch (error) {
    console.error('❌ getMovies error:', error);
    return { posts: [], total_pages: 0 };
  }
};

// ── Movie streaming links ─────────────────────────────────────────────────────
export const getMovieLinks = async (slug) => {
  try {
    if (!slug) throw new Error('slug is required');

    const data = await apiFetch(`${DEAD_ANIME_API}/movie?slug=${encodeURIComponent(slug)}`);
    const movieData = data?.data ?? data;
    const servers = [];

    if (Array.isArray(movieData.sources)) {
      movieData.sources.forEach((source, i) => {
        const url = source.url || source.file;
        if (url) {
          servers.push({
            name:    source.name    || `Server ${i + 1}`,
            watch:   url,
            url,
            quality: source.quality || 'auto',
          });
        }
      });
    } else {
      const videoUrl = movieData.video_url || movieData.url || movieData.stream || movieData.file;
      if (videoUrl) {
        servers.push({ name: 'Default', watch: videoUrl, url: videoUrl, quality: 'auto' });
      }
    }

    console.log(`✅ getMovieLinks: ${servers.length} sources`);
    return { servers, hasValidLinks: servers.length > 0, total: servers.length };
  } catch (error) {
    console.error('❌ getMovieLinks error:', error);
    return { servers: [], hasValidLinks: false, total: 0, error: error.message };
  }
};

// ── Random anime ──────────────────────────────────────────────────────────────
export const getRandomAnime = async (page = 1, limit = 12) => {
  try {
    const data = await apiFetch(`${DEAD_ANIME_API}/list?limit=${limit * 3}&page=${page}`);

    const posts = extractAnimeList(data)
      .map(transformAnimeData)
      .filter(Boolean)
      .sort(() => Math.random() - 0.5)
      .slice(0, limit);

    console.log(`✅ getRandomAnime: ${posts.length}`);
    return { posts, total_pages: 1 };
  } catch (error) {
    console.error('❌ getRandomAnime error:', error);
    return { posts: [], total_pages: 0 };
  }
};

// ── Ongoing anime ─────────────────────────────────────────────────────────────
// "Ongoing" = isComplete is falsy
export const getOngoingAnime = async (page = 1, limit = 12) => {
  try {
    const data = await apiFetch(
      `${DEAD_ANIME_API}/list?limit=${limit * 3}&page=${page}`,
      { cache: 'default' }
    );

    const posts = extractAnimeList(data)
      .map(transformAnimeData)
      .filter(Boolean)
      .filter((a) => !a.isComplete)
      .slice(0, limit);

    console.log(`✅ getOngoingAnime: ${posts.length}`);
    return { posts, total_pages: 1 };
  } catch (error) {
    console.error('❌ getOngoingAnime error:', error);
    return { posts: [], total_pages: 0 };
  }
};

// ── Completed anime ───────────────────────────────────────────────────────────
export const getCompletedAnime = async (page = 1, limit = 12) => {
  try {
    const data = await apiFetch(
      `${DEAD_ANIME_API}/list?limit=${limit * 3}&page=${page}`,
      { cache: 'default' }
    );

    const posts = extractAnimeList(data)
      .map(transformAnimeData)
      .filter(Boolean)
      .filter((a) => a.isComplete)
      .slice(0, limit);

    console.log(`✅ getCompletedAnime: ${posts.length}`);
    return { posts, total_pages: 1 };
  } catch (error) {
    console.error('❌ getCompletedAnime error:', error);
    return { posts: [], total_pages: 0 };
  }
};

// ── Anime by genre ────────────────────────────────────────────────────────────
export const getAnimeByGenre = async (genre, page = 1, limit = 12) => {
  try {
    const data = await apiFetch(
      `${DEAD_ANIME_API}/list?limit=100&page=${page}`,
      { cache: 'default' }
    );

    const normalised = genre.toLowerCase();
    const posts = extractAnimeList(data)
      .map(transformAnimeData)
      .filter(Boolean)
      .filter((a) =>
        a.genres.some((g) => g.toLowerCase().includes(normalised))
      )
      .slice(0, limit);

    console.log(`✅ getAnimeByGenre(${genre}): ${posts.length}`);
    return { posts, total_pages: 1 };
  } catch (error) {
    console.error('❌ getAnimeByGenre error:', error);
    return { posts: [], total_pages: 0 };
  }
};

// ── Available genres (static list — extend as needed) ────────────────────────
export const getGenres = async () => [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Ecchi', 'Family',
  'Fantasy', 'Historical', 'Mythology', 'Mystery', 'Supernatural',
  'Romance', 'Horror', 'Kids', 'Politics', 'School', 'Samurai',
  'Sci-Fi', 'Sports', 'Thriller', 'Slice of Life',
];

// ── Similar anime (matched by type then genres) ───────────────────────────────
export const getSimilarAnime = async (animeId, limit = 6) => {
  try {
    // First get the reference anime so we know its type/genres
    const ref = await getAnimeInfo(animeId);

    const data = await apiFetch(`${DEAD_ANIME_API}/list?limit=100`, { cache: 'default' });

    let candidates = extractAnimeList(data)
      .map(transformAnimeData)
      .filter(Boolean)
      .filter((a) => String(a.id) !== String(animeId));

    if (ref) {
      const refGenres = new Set(ref.genres.map((g) => g.toLowerCase()));

      // Score by number of shared genres + same type bonus
      candidates = candidates
        .map((a) => {
          const sharedGenres = a.genres.filter((g) => refGenres.has(g.toLowerCase())).length;
          const sameType     = a.type === ref.type ? 2 : 0;
          return { ...a, _score: sharedGenres + sameType };
        })
        .sort((a, b) => b._score - a._score);
    }

    const similar = candidates.slice(0, limit);
    console.log(`✅ getSimilarAnime: ${similar.length}`);
    return similar;
  } catch (error) {
    console.error('❌ getSimilarAnime error:', error);
    return [];
  }
};

// ── Recently added ────────────────────────────────────────────────────────────
export const getRecentlyAdded = async (page = 1, limit = 12) => {
  try {
    const data = await apiFetch(
      `${DEAD_ANIME_API}/list?limit=${limit}&page=${page}`
    );

    const posts = extractAnimeList(data).map(transformAnimeData).filter(Boolean);
    console.log(`✅ getRecentlyAdded: ${posts.length}`);
    return { posts, total_pages: 1 };
  } catch (error) {
    console.error('❌ getRecentlyAdded error:', error);
    return { posts: [], total_pages: 0 };
  }
};

// ==================== UTILITY FUNCTIONS ====================

export const checkApiHealth = async () => {
  try {
    await apiFetch(`${DEAD_ANIME_API}/list?limit=1`, {}, 0);
    return { status: 'healthy', message: 'API is operational' };
  } catch (error) {
    return { status: 'error', message: error.message, timestamp: new Date().toISOString() };
  }
};

export const getApiStats = async () => {
  try {
    const data = await apiFetch(`${DEAD_ANIME_API}/list?limit=100`, { cache: 'default' });
    const list = extractAnimeList(data);
    return {
      total_anime:  list.length,
      total_movies: list.filter((a) => a.type === 'movie').length,
      total_series: list.filter((a) => a.type !== 'movie').length,
      timestamp:    new Date().toISOString(),
    };
  } catch (error) {
    console.error('❌ getApiStats error:', error);
    return null;
  }
};

// ==================== DEFAULT EXPORT ====================
const api = {
  searchAnime,
  getAnimeInfo,
  getSeasonInfo,
  getEpisodes,
  getEpisodeLinks,
  getPopularAnime,
  getSeries,
  getMovies,
  getMovieLinks,
  getRandomAnime,
  getOngoingAnime,
  getCompletedAnime,
  getAnimeByGenre,
  getGenres,
  getSimilarAnime,
  getRecentlyAdded,
  checkApiHealth,
  getApiStats,
};

export default api;