import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor - Add loading state or auth tokens if needed
api.interceptors.request.use(
  (config) => {
    // You can add auth tokens here if needed
    // const token = localStorage.getItem('token');
    // if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      console.error('API Error:', error.response.status, error.response.data);
    } else if (error.request) {
      // Request made but no response
      console.error('Network Error:', error.message);
    } else {
      // Error setting up request
      console.error('Request Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// ==================== SEARCH ====================
export const searchAnime = async (term, page = 1, limit = 12) => {
  try {
    const response = await api.get('/search', {
      params: { term, page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Search error:', error);
    return { posts: [], total_pages: 0 };
  }
};

// ==================== ANIME INFO ====================
export const getAnimeInfo = async (slug) => {
  try {
    const response = await api.get(`/anime/${slug}`);
    return response.data;
  } catch (error) {
    console.error('Get anime info error:', error);
    return null;
  }
};

// ==================== SEASONS ====================
export const getSeasonInfo = async (animeId) => {
  try {
    const response = await api.get(`/anime/${animeId}/seasons`);
    return response.data;
  } catch (error) {
    console.error('Get season info error:', error);
    return { seasons: [] };
  }
};

// ==================== EPISODES ====================
export const getEpisodes = async (seasonId) => {
  try {
    const response = await api.get(`/episodes/${seasonId}`);
    return response.data;
  } catch (error) {
    console.error('Get episodes error:', error);
    return [];
  }
};

export const getEpisodeLinks = async (episodeId) => {
  try {
    const response = await api.get(`/episode/${episodeId}/links`);
    return response.data;
  } catch (error) {
    console.error('Get episode links error:', error);
    return { links: [] };
  }
};

// ==================== POPULAR & TRENDING ====================
export const getPopularAnime = async (duration = 'month', page = 1, limit = 12) => {
  try {
    const response = await api.get('/popular', {
      params: { duration, page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Get popular anime error:', error);
    return { posts: [], total_pages: 0 };
  }
};

// ==================== SERIES (TV SHOWS) ====================
export const getSeries = async (page = 1, limit = 12) => {
  try {
    const response = await api.get('/series', {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Get series error:', error);
    return { posts: [], total_pages: 0 };
  }
};

// ==================== MOVIES ====================
export const getMovies = async (page = 1, limit = 12) => {
  try {
    const response = await api.get('/movies', {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Get movies error:', error);
    return { posts: [], total_pages: 0 };
  }
};

export const getMovieLinks = async (slug) => {
  try {
    const response = await api.get(`/movie/${slug}/links`);
    return response.data;
  } catch (error) {
    console.error('Get movie links error:', error);
    return { links: [] };
  }
};

// ==================== RANDOM ====================
export const getRandomAnime = async (page = 1, limit = 12) => {
  try {
    const response = await api.get('/random', {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Get random anime error:', error);
    return { posts: [], total_pages: 0 };
  }
};

// ==================== FILTERS ====================
// Get Ongoing Anime (can be used for filtering)
export const getOngoingAnime = async (page = 1, limit = 12) => {
  try {
    const response = await api.get('/series', {
      params: { page, limit, status: 'ongoing' }
    });
    return response.data;
  } catch (error) {
    console.error('Get ongoing anime error:', error);
    return { posts: [], total_pages: 0 };
  }
};

// Get Completed Anime
export const getCompletedAnime = async (page = 1, limit = 12) => {
  try {
    const response = await api.get('/series', {
      params: { page, limit, status: 'completed' }
    });
    return response.data;
  } catch (error) {
    console.error('Get completed anime error:', error);
    return { posts: [], total_pages: 0 };
  }
};

// Get Anime by Genre
export const getAnimeByGenre = async (genre, page = 1, limit = 12) => {
  try {
    const response = await api.get('/genre', {
      params: { genre, page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Get anime by genre error:', error);
    return { posts: [], total_pages: 0 };
  }
};

// Get All Genres
export const getGenres = async () => {
  try {
    const response = await api.get('/genres');
    return response.data;
  } catch (error) {
    console.error('Get genres error:', error);
    return [];
  }
};

// ==================== RECOMMENDATIONS ====================
// Get Similar Anime
export const getSimilarAnime = async (animeId, limit = 6) => {
  try {
    const response = await api.get(`/anime/${animeId}/similar`, {
      params: { limit }
    });
    return response.data;
  } catch (error) {
    console.error('Get similar anime error:', error);
    return [];
  }
};

// ==================== RECENTLY ADDED ====================
export const getRecentlyAdded = async (page = 1, limit = 12) => {
  try {
    const response = await api.get('/recent', {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Get recently added error:', error);
    return { posts: [], total_pages: 0 };
  }
};

// ==================== UTILITY FUNCTIONS ====================
// Check API Health
export const checkApiHealth = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    console.error('API health check failed:', error);
    return { status: 'error' };
  }
};

// Get API Statistics
export const getApiStats = async () => {
  try {
    const response = await api.get('/stats');
    return response.data;
  } catch (error) {
    console.error('Get API stats error:', error);
    return null;
  }
};

// ==================== EXPORTS ====================
export default {
  // Search
  searchAnime,
  
  // Anime Info
  getAnimeInfo,
  getSeasonInfo,
  
  // Episodes
  getEpisodes,
  getEpisodeLinks,
  
  // Popular & Trending
  getPopularAnime,
  
  // Series & Movies
  getSeries,
  getMovies,
  getMovieLinks,
  
  // Random
  getRandomAnime,
  
  // Filters
  getOngoingAnime,
  getCompletedAnime,
  getAnimeByGenre,
  getGenres,
  
  // Recommendations
  getSimilarAnime,
  
  // Recent
  getRecentlyAdded,
  
  // Utility
  checkApiHealth,
  getApiStats,
};