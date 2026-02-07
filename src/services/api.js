// ==================== CONFIGURATION ====================
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const DEAD_ANIME_API = `${API_URL}/api/deadanime`;

console.log('🔗 Backend API URL:', API_URL);
console.log('🔗 Proxy URL:', DEAD_ANIME_API);

// ==================== UTILITIES ====================

// Enhanced fetch wrapper with retry logic
const apiFetch = async (url, options = {}, retries = 2) => {
  for (let i = 0; i <= retries; i++) {
    try {
      console.log(`🔍 Fetching (attempt ${i + 1}/${retries + 1}):`, url);
      
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        cache: 'no-store'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('✅ Success:', data);
      
      return data;
    } catch (error) {
      console.error(`❌ Attempt ${i + 1} failed:`, error.message);
      
      if (i === retries) {
        throw error;
      }
      
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
};

// Extract anime list from various response structures
const extractAnimeList = (data) => {
  console.log('🔍 Extracting anime list from response');
  
  if (!data) {
    console.warn('⚠️ No data provided');
    return [];
  }
  
  // Direct array
  if (Array.isArray(data)) {
    console.log('✅ Direct array, length:', data.length);
    return data;
  }
  
  // Nested structures - check in order of likelihood
  const possiblePaths = [
    () => data.status === 'success' && data.data,
    () => data.data,
    () => data.results,
    () => data.anime,
    () => data.posts,
    () => data.items
  ];
  
  for (const getPath of possiblePaths) {
    try {
      const result = getPath();
      if (Array.isArray(result)) {
        console.log('✅ Found array at path, length:', result.length);
        return result;
      }
      
      // Handle nested objects
      if (result && typeof result === 'object') {
        const nestedArrays = [
          result.results,
          result.anime,
          result.items,
          result.posts
        ];
        
        for (const arr of nestedArrays) {
          if (Array.isArray(arr)) {
            console.log('✅ Found nested array, length:', arr.length);
            return arr;
          }
        }
        
        // Try object values (for numeric keys)
        const values = Object.values(result);
        if (values.length > 0 && values.every(v => v && typeof v === 'object' && v.id)) {
          console.log('✅ Converting object to array, length:', values.length);
          return values;
        }
      }
    } catch (e) {
      continue;
    }
  }
  
  console.warn('⚠️ Could not extract anime list');
  return [];
};

// Transform Dead Anime API response to app format
const transformAnimeData = (anime) => {
  if (!anime || typeof anime !== 'object') {
    return null;
  }
  
  try {
    // Extract image URLs
    let posterUrl = '';
    let backdropUrl = '';
    
    if (typeof anime.image === 'string') {
      posterUrl = backdropUrl = anime.image;
    } else if (anime.image && typeof anime.image === 'object') {
      posterUrl = anime.image.poster || anime.image.large || anime.image.medium || '';
      backdropUrl = anime.image.backdrop || anime.image.large || anime.image.medium || '';
    }
    
    // Handle TMDB-style paths
    if (posterUrl && posterUrl.startsWith('/')) {
      posterUrl = `https://image.tmdb.org/t/p/w500${posterUrl}`;
    }
    if (backdropUrl && backdropUrl.startsWith('/')) {
      backdropUrl = `https://image.tmdb.org/t/p/original${backdropUrl}`;
    }
    
    // Extract year from release date
    let year = 'N/A';
    if (anime.year) {
      year = anime.year.toString();
    } else if (anime.release && anime.release !== '0000-00-00') {
      try {
        year = new Date(anime.release).getFullYear().toString();
      } catch (e) {
        year = 'N/A';
      }
    }
    
    return {
      id: anime.id,
      slug: anime.slug || anime.name?.toLowerCase().replace(/\s+/g, '-'),
      name: anime.name || anime.title || 'Unknown',
      type: anime.type || 'series',
      image: {
        poster: posterUrl,
        backdrop: backdropUrl
      },
      rating: anime.rating || 'N/A',
      year: year,
      release: anime.release || year,
      episodes: parseInt(anime.episodes) || 0,
      overview: anime.overview || anime.description || '',
      duration: anime.duration || null,
      complete: anime.complete || (anime.status === 'completed' ? '2024-01-01' : '0000-00-00'),
      views: parseInt(anime.views) || 0,
      subOrDub: anime.subOrDub || 'Sub/Dub',
      age: anime.age || null,
      poster_img: posterUrl,
      genres: anime.genres || []
    };
  } catch (error) {
    console.error('❌ Transform error:', error);
    return null;
  }
};

// ==================== API FUNCTIONS ====================

// Search Anime
export const searchAnime = async (term, page = 1, limit = 12) => {
  try {
    if (!term || term.trim() === '') {
      return { posts: [], total_pages: 0 };
    }
    
    const data = await apiFetch(
      `${DEAD_ANIME_API}/list?search=${encodeURIComponent(term.trim())}&limit=${limit}&page=${page}`
    );
    
    const animeList = extractAnimeList(data);
    const posts = animeList.map(transformAnimeData).filter(Boolean);
    
    console.log(`✅ Search complete: ${posts.length} results for "${term}"`);
    return { posts, total_pages: Math.ceil(posts.length / limit) || 1 };
  } catch (error) {
    console.error('❌ Search error:', error);
    return { posts: [], total_pages: 0 };
  }
};

// Get Anime Info
export const getAnimeInfo = async (slug) => {
  try {
    if (!slug) {
      throw new Error('Slug is required');
    }
    
    const data = await apiFetch(`${DEAD_ANIME_API}/anime?slug=${slug}`);
    const animeData = data.data || data;
    const transformed = transformAnimeData(animeData);
    
    if (!transformed) {
      throw new Error('Failed to transform anime data');
    }
    
    console.log('✅ Anime info retrieved:', transformed.name);
    return transformed;
  } catch (error) {
    console.error('❌ Get anime info error:', error);
    return null;
  }
};

// Get Season Info
export const getSeasonInfo = async (animeId) => {
  try {
    // Default to single season (most anime have one season per entry)
    return {
      seasons: [{
        id: animeId,
        num: 1,
        name: 'Season 1'
      }]
    };
  } catch (error) {
    console.error('❌ Get season info error:', error);
    return { seasons: [] };
  }
};

// Get Episodes
export const getEpisodes = async (seasonId) => {
  try {
    const data = await apiFetch(
      `${DEAD_ANIME_API}/pack?season_id=${seasonId}&start_ep=1&end_ep=100`
    );
    
    const episodeList = extractAnimeList(data);
    
    const episodes = episodeList.map((ep, index) => ({
      id: ep.id || index + 1,
      number: ep.episode || ep.number || index + 1,
      name: ep.name || ep.title || `Episode ${index + 1}`,
      note: ep.note || null,
      image: ep.image || null
    }));
    
    console.log(`✅ Retrieved ${episodes.length} episodes`);
    return episodes;
  } catch (error) {
    console.error('❌ Get episodes error:', error);
    return [];
  }
};

// Get Episode Links
export const getEpisodeLinks = async (episodeId, slug, season = 1, episode = 1) => {
  try {
    if (!slug) {
      console.warn('⚠️ No slug provided for episode links');
      return { servers: [], hasValidLinks: false, total: 0 };
    }
    
    const data = await apiFetch(
      `${DEAD_ANIME_API}/episode?slug=${slug}&season=${season}&episode=${episode}`
    );
    
    const episodeData = data.data || data;
    const servers = [];
    
    // Extract sources
    if (episodeData.sources && Array.isArray(episodeData.sources)) {
      episodeData.sources.forEach((source, index) => {
        const url = source.url || source.file;
        if (url) {
          servers.push({
            name: source.name || `Server ${index + 1}`,
            watch: url,
            url: url,
            quality: source.quality || 'auto'
          });
        }
      });
    } else if (episodeData.url) {
      servers.push({
        name: 'Default',
        watch: episodeData.url,
        url: episodeData.url,
        quality: 'auto'
      });
    }
    
    const hasValidLinks = servers.length > 0;
    console.log(`✅ Retrieved ${servers.length} streaming sources`);
    
    return {
      servers,
      hasValidLinks,
      total: servers.length
    };
  } catch (error) {
    console.error('❌ Get episode links error:', error);
    return { 
      servers: [], 
      hasValidLinks: false, 
      total: 0, 
      error: error.message 
    };
  }
};

// Get Popular Anime
export const getPopularAnime = async (duration = 'month', page = 1, limit = 12) => {
  try {
    const data = await apiFetch(
      `${DEAD_ANIME_API}/list?limit=${limit * 2}&page=${page}`
    );
    
    const animeList = extractAnimeList(data);
    let posts = animeList.map(transformAnimeData).filter(Boolean);
    
    // Sort by rating
    posts.sort((a, b) => {
      const ratingA = parseFloat(a.rating) || 0;
      const ratingB = parseFloat(b.rating) || 0;
      return ratingB - ratingA;
    });
    
    posts = posts.slice(0, limit);
    
    console.log(`✅ Retrieved ${posts.length} popular anime`);
    return { posts, total_pages: 1 };
  } catch (error) {
    console.error('❌ Get popular anime error:', error);
    return { posts: [], total_pages: 0 };
  }
};

// Get Series
export const getSeries = async (page = 1, limit = 12) => {
  try {
    const data = await apiFetch(
      `${DEAD_ANIME_API}/list?limit=${limit * 2}&page=${page}`
    );
    
    const animeList = extractAnimeList(data);
    const posts = animeList
      .filter(anime => anime.type !== 'movie')
      .map(transformAnimeData)
      .filter(Boolean)
      .slice(0, limit);
    
    console.log(`✅ Retrieved ${posts.length} series`);
    return { posts, total_pages: 1 };
  } catch (error) {
    console.error('❌ Get series error:', error);
    return { posts: [], total_pages: 0 };
  }
};

// Get Movies
export const getMovies = async (page = 1, limit = 12) => {
  try {
    const data = await apiFetch(
      `${DEAD_ANIME_API}/list?limit=100&page=${page}`
    );
    
    const animeList = extractAnimeList(data);
    const posts = animeList
      .filter(anime => anime.type === 'movie')
      .map(transformAnimeData)
      .filter(Boolean)
      .slice(0, limit);
    
    console.log(`✅ Retrieved ${posts.length} movies`);
    return { posts, total_pages: 1 };
  } catch (error) {
    console.error('❌ Get movies error:', error);
    return { posts: [], total_pages: 0 };
  }
};

// Get Movie Links
export const getMovieLinks = async (slug) => {
  try {
    if (!slug) {
      throw new Error('Slug is required');
    }
    
    const data = await apiFetch(`${DEAD_ANIME_API}/movie?slug=${slug}`);
    const movieData = data.data || data;
    const servers = [];
    
    // Extract sources
    if (movieData.sources && Array.isArray(movieData.sources)) {
      movieData.sources.forEach((source, index) => {
        const url = source.url || source.file;
        if (url) {
          servers.push({
            name: source.name || `Server ${index + 1}`,
            watch: url,
            url: url,
            quality: source.quality || 'auto'
          });
        }
      });
    } else {
      const videoUrl = movieData.video_url || movieData.url || movieData.stream || movieData.file;
      if (videoUrl) {
        servers.push({
          name: 'Default',
          watch: videoUrl,
          url: videoUrl,
          quality: 'auto'
        });
      }
    }
    
    const hasValidLinks = servers.length > 0;
    console.log(`✅ Retrieved ${servers.length} movie sources`);
    
    return {
      servers,
      hasValidLinks,
      total: servers.length
    };
  } catch (error) {
    console.error('❌ Get movie links error:', error);
    return { 
      servers: [], 
      hasValidLinks: false, 
      total: 0, 
      error: error.message 
    };
  }
};

// Get Random Anime
export const getRandomAnime = async (page = 1, limit = 12) => {
  try {
    const data = await apiFetch(`${DEAD_ANIME_API}/list?limit=${limit * 2}`);
    const animeList = extractAnimeList(data);
    
    const posts = animeList
      .map(transformAnimeData)
      .filter(Boolean)
      .sort(() => Math.random() - 0.5)
      .slice(0, limit);
    
    console.log(`✅ Retrieved ${posts.length} random anime`);
    return { posts, total_pages: 1 };
  } catch (error) {
    console.error('❌ Get random anime error:', error);
    return { posts: [], total_pages: 0 };
  }
};

// Get Ongoing Anime
export const getOngoingAnime = async (page = 1, limit = 12) => {
  try {
    const data = await apiFetch(
      `${DEAD_ANIME_API}/list?limit=${limit * 2}&page=${page}`
    );
    
    const animeList = extractAnimeList(data);
    const posts = animeList
      .filter(anime => !anime.complete && anime.status !== 'completed')
      .map(transformAnimeData)
      .filter(Boolean)
      .slice(0, limit);
    
    console.log(`✅ Retrieved ${posts.length} ongoing anime`);
    return { posts, total_pages: 1 };
  } catch (error) {
    console.error('❌ Get ongoing anime error:', error);
    return { posts: [], total_pages: 0 };
  }
};

// Get Completed Anime
export const getCompletedAnime = async (page = 1, limit = 12) => {
  try {
    const data = await apiFetch(
      `${DEAD_ANIME_API}/list?limit=${limit * 2}&page=${page}`
    );
    
    const animeList = extractAnimeList(data);
    const posts = animeList
      .filter(anime => anime.complete || anime.status === 'completed')
      .map(transformAnimeData)
      .filter(Boolean)
      .slice(0, limit);
    
    console.log(`✅ Retrieved ${posts.length} completed anime`);
    return { posts, total_pages: 1 };
  } catch (error) {
    console.error('❌ Get completed anime error:', error);
    return { posts: [], total_pages: 0 };
  }
};

// Get Anime by Genre
export const getAnimeByGenre = async (genre, page = 1, limit = 12) => {
  try {
    const data = await apiFetch(`${DEAD_ANIME_API}/list?limit=100`);
    const animeList = extractAnimeList(data);
    
    const posts = animeList
      .filter(anime => {
        const genres = anime.genres || [];
        return genres.some(g => 
          g.toLowerCase() === genre.toLowerCase() ||
          g.toLowerCase().includes(genre.toLowerCase())
        );
      })
      .map(transformAnimeData)
      .filter(Boolean)
      .slice(0, limit);
    
    console.log(`✅ Retrieved ${posts.length} ${genre} anime`);
    return { posts, total_pages: 1 };
  } catch (error) {
    console.error('❌ Get anime by genre error:', error);
    return { posts: [], total_pages: 0 };
  }
};

// Get Available Genres
export const getGenres = async () => {
  return [
    'ACTION', 'ADVENTURE', 'COMEDY', 'DRAMA', 'ECCHI', 'FAMILY', 
    'FANTASY', 'HISTORICAL', 'MYTHOLOGY', 'MYSTERY', 'SUPERNATURAL', 
    'ROMANCE', 'HORROR', 'KIDS', 'POLITICS', 'SCHOOL', 'SAMURAI', 
    'SCI-FI', 'SPORTS', 'THRILLER', 'SLICE OF LIFE'
  ];
};

// Get Similar Anime
export const getSimilarAnime = async (animeId, limit = 6) => {
  try {
    const data = await apiFetch(`${DEAD_ANIME_API}/list?limit=${limit * 2}`);
    const animeList = extractAnimeList(data);
    
    const similar = animeList
      .filter(anime => anime.id !== animeId)
      .map(transformAnimeData)
      .filter(Boolean)
      .slice(0, limit);
    
    console.log(`✅ Retrieved ${similar.length} similar anime`);
    return similar;
  } catch (error) {
    console.error('❌ Get similar anime error:', error);
    return [];
  }
};

// Get Recently Added
export const getRecentlyAdded = async (page = 1, limit = 12) => {
  try {
    const data = await apiFetch(
      `${DEAD_ANIME_API}/list?limit=${limit}&page=${page}`
    );
    
    const animeList = extractAnimeList(data);
    const posts = animeList.map(transformAnimeData).filter(Boolean);
    
    console.log(`✅ Retrieved ${posts.length} recently added anime`);
    return { posts, total_pages: 1 };
  } catch (error) {
    console.error('❌ Get recently added error:', error);
    return { posts: [], total_pages: 0 };
  }
};

// ==================== UTILITY FUNCTIONS ====================

// Check API Health
export const checkApiHealth = async () => {
  try {
    await apiFetch(`${DEAD_ANIME_API}/list?limit=1`, {}, 0);
    return { status: 'healthy', message: 'API is operational' };
  } catch (error) {
    return { 
      status: 'error', 
      message: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

// Get API Statistics
export const getApiStats = async () => {
  try {
    const data = await apiFetch(`${DEAD_ANIME_API}/list?limit=100`);
    const animeList = extractAnimeList(data);
    
    return {
      total_anime: animeList.length,
      total_movies: animeList.filter(a => a.type === 'movie').length,
      total_series: animeList.filter(a => a.type !== 'movie').length,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ Get API stats error:', error);
    return null;
  }
};

// ==================== EXPORTS ====================
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