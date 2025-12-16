import React, { useState, useEffect, useRef } from 'react';
import { Search, X, TrendingUp, Film, Tv, Loader2, Filter } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AnimeCard from '../components/AnimeCard';
import { searchAnime } from '../services/api';

const SearchPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [searchResults, setSearchResults] = useState([]);
  const [allResults, setAllResults] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterType, setFilterType] = useState('all');
  const [detectedFilters, setDetectedFilters] = useState({ genre: '', type: '' });
  
  const searchInputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const debounceTimerRef = useRef(null);

  // Genre keywords mapping
  const genreKeywords = {
    'action': ['action', 'fight', 'fighting', 'battle'],
    'adventure': ['adventure', 'journey'],
    'comedy': ['comedy', 'funny', 'humor'],
    'drama': ['drama', 'emotional'],
    'fantasy': ['fantasy', 'magic', 'magical'],
    'horror': ['horror', 'scary', 'terror'],
    'mystery': ['mystery', 'detective'],
    'romance': ['romance', 'love', 'romantic'],
    'sci-fi': ['sci-fi', 'scifi', 'science fiction'],
    'supernatural': ['supernatural', 'demon', 'spirit'],
    'thriller': ['thriller', 'suspense'],
    'sports': ['sports', 'sport'],
    'slice of life': ['slice of life', 'daily life', 'school'],
    'shounen': ['shounen', 'shonen'],
    'shoujo': ['shoujo', 'shojo'],
    'mecha': ['mecha', 'robot'],
    'isekai': ['isekai', 'another world']
  };

  // Type keywords
  const typeKeywords = {
    'movie': ['movie', 'movies', 'film', 'films'],
    'tv': ['tv', 'series', 'show']
  };

  // Trending searches
  const trendingSearches = [
    'Naruto', 'One Piece', 'Attack on Titan', 'Demon Slayer',
    'Horror Anime', 'Action Movies', 'Romance Anime', 'Comedy Series'
  ];

  // Get poster image URL
  const getPosterUrl = (anime) => {
    if (!anime || !anime.image) {
      return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="50" height="75"%3E%3Crect width="50" height="75" fill="%23333"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="10" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E';
    }

    const posterPath = anime.image.poster;
    
    if (!posterPath || posterPath === '' || posterPath === 'null') {
      return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="50" height="75"%3E%3Crect width="50" height="75" fill="%23333"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="10" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E';
    }

    if (posterPath.startsWith('http://') || posterPath.startsWith('https://')) {
      return posterPath;
    }

    if (posterPath.startsWith('/')) {
      return `https://image.tmdb.org/t/p/w500${posterPath}`;
    }

    return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="50" height="75"%3E%3Crect width="50" height="75" fill="%23333"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="10" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E';
  };

  // Detect genre and type from query
  const detectFiltersFromQuery = (query) => {
    const lowerQuery = query.toLowerCase();
    let detectedGenre = '';
    let detectedType = '';

    for (const [genre, keywords] of Object.entries(genreKeywords)) {
      if (keywords.some(keyword => lowerQuery.includes(keyword))) {
        detectedGenre = genre;
        break;
      }
    }

    for (const [type, keywords] of Object.entries(typeKeywords)) {
      if (keywords.some(keyword => lowerQuery.includes(keyword))) {
        detectedType = type;
        break;
      }
    }

    return { genre: detectedGenre, type: detectedType };
  };

  // Apply manual filter
  const applyManualFilter = (results, type) => {
    if (type === 'all') return results;
    return results.filter(anime => anime.type && anime.type.toLowerCase() === type);
  };

  // Handle clicks outside suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Initial search if query param exists
  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery, 1);
    }
  }, []);

  // Debounced suggestions fetch
  useEffect(() => {
    if (searchQuery.length >= 2) {
      setSuggestionsLoading(true);
      
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(async () => {
        try {
          const data = await searchAnime(searchQuery, 1, 6);
          if (data && data.posts) {
            setSuggestions(data.posts);
            setShowSuggestions(true);
          }
        } catch (error) {
          console.error('Error fetching suggestions:', error);
          setSuggestions([]);
        } finally {
          setSuggestionsLoading(false);
        }
      }, 300);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      setSuggestionsLoading(false);
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery]);

  const performSearch = async (query, page = 1) => {
    if (!query.trim()) return;

    setLoading(true);
    setHasSearched(true);
    setShowSuggestions(false);
    setCurrentPage(page);
    
    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      const data = await searchAnime(query, page, 50);
      
      if (data && data.posts) {
        const results = data.posts;
        const detected = detectFiltersFromQuery(query);
        
        setDetectedFilters(detected);
        setAllResults(results);
        
        const filtered = applyManualFilter(results, filterType);
        setSearchResults(filtered);
        setTotalPages(data.total_pages || 1);
      } else {
        setAllResults([]);
        setSearchResults([]);
        setTotalPages(1);
        setDetectedFilters({ genre: '', type: '' });
      }
    } catch (error) {
      console.error('Search error:', error);
      setAllResults([]);
      setSearchResults([]);
      setTotalPages(1);
      setDetectedFilters({ genre: '', type: '' });
    } finally {
      setLoading(false);
    }

    setSearchParams({ q: query });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      performSearch(searchQuery, 1);
    }
  };

  const handleSuggestionClick = (anime) => {
    setShowSuggestions(false);
    navigate(`/anime/${anime.slug}`);
  };

  const handleTrendingClick = (term) => {
    setSearchQuery(term);
    performSearch(term, 1);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setAllResults([]);
    setSuggestions([]);
    setHasSearched(false);
    setShowSuggestions(false);
    setFilterType('all');
    setDetectedFilters({ genre: '', type: '' });
    setSearchParams({});
    searchInputRef.current?.focus();
  };

  const handleFilterChange = (type) => {
    setFilterType(type);
    if (allResults.length > 0) {
      const filtered = applyManualFilter(allResults, type);
      setSearchResults(filtered);
    }
  };
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom, #000 0%, #1a0000 100%)' }}>
      <Navbar />
      
      {/* Search Hero Section */}
      <div style={{ 
        padding: '120px 5% 60px', 
        background: 'linear-gradient(135deg, rgba(229, 9, 20, 0.1) 0%, rgba(0, 0, 0, 0.8) 100%)',
        borderBottom: '1px solid rgba(229, 9, 20, 0.2)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ 
            fontSize: 'clamp(2rem, 8vw, 3rem)', 
            fontWeight: '700', 
            marginBottom: '15px',
            background: 'linear-gradient(135deg, #fff 0%, #e50914 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Search Anime
          </h1>
          <p style={{ 
            fontSize: 'clamp(0.9rem, 3vw, 1.2rem)', 
            color: '#999', 
            marginBottom: '40px', 
            padding: '0 10px' 
          }}>
            Search by title, genre, or type - try "horror anime" or "action movies"
          </p>

          {/* Search Bar */}
          <form 
            onSubmit={handleSearchSubmit}
            style={{ 
              position: 'relative', 
              maxWidth: '800px', 
              margin: '0 auto',
              zIndex: 10,
              padding: '0 15px'
            }}
          >
            <div 
              ref={searchInputRef}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 'clamp(8px, 2vw, 15px)',
                background: 'rgba(0,0,0,0.7)', 
                padding: 'clamp(12px, 3vw, 15px) clamp(15px, 4vw, 25px)',
                borderRadius: '50px',
                border: '2px solid rgba(229, 9, 20, 0.3)',
                transition: 'all 0.3s'
              }}
              onFocus={(e) => {
                e.currentTarget.style.border = '2px solid #e50914';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(229, 9, 20, 0.3)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.border = '2px solid rgba(229, 9, 20, 0.3)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <Search size={window.innerWidth < 768 ? 20 : 24} color="#e50914" />
              
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search anime..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#fff',
                  fontSize: 'clamp(0.95rem, 3vw, 1.1rem)',
                  padding: '8px 0'
                }}
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: 'none',
                    borderRadius: '50%',
                    width: 'clamp(30px, 8vw, 36px)',
                    height: 'clamp(30px, 8vw, 36px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    color: '#999'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                    e.currentTarget.style.color = '#fff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                    e.currentTarget.style.color = '#999';
                  }}
                >
                  <X size={window.innerWidth < 768 ? 16 : 18} />
                </button>
              )}

              <button
                type="submit"
                style={{
                  background: 'linear-gradient(135deg, #e50914 0%, #ff1744 100%)',
                  border: 'none',
                  color: '#fff',
                  padding: 'clamp(8px, 2vw, 12px) clamp(20px, 5vw, 30px)',
                  borderRadius: '25px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: 'clamp(0.85rem, 2.5vw, 1rem)',
                  transition: 'all 0.3s',
                  boxShadow: '0 4px 15px rgba(229, 9, 20, 0.4)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(229, 9, 20, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(229, 9, 20, 0.4)';
                }}
              >
                Search
              </button>
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && (
              <div
                ref={suggestionsRef}
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: '15px',
                  right: '15px',
                  marginTop: '10px',
                  background: 'rgba(20, 20, 20, 0.98)',
                  border: '1px solid rgba(229, 9, 20, 0.3)',
                  borderRadius: '12px',
                  maxHeight: '400px',
                  overflowY: 'auto',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                  backdropFilter: 'blur(10px)',
                  zIndex: 1000
                }}
              >
                {suggestionsLoading ? (
                  <div style={{ 
                    padding: '30px', 
                    textAlign: 'center', 
                    color: '#999' 
                  }}>
                    <Loader2 
                      size={window.innerWidth < 768 ? 20 : 24} 
                      style={{ animation: 'spin 1s linear infinite' }} 
                    />
                    <p style={{ 
                      marginTop: '10px', 
                      fontSize: 'clamp(0.85rem, 2.5vw, 0.9rem)' 
                    }}>
                      Searching...
                    </p>
                  </div>
                ) : suggestions.length > 0 ? (
                  suggestions.map((anime) => (
                    <div
                      key={anime.id}
                      onClick={() => handleSuggestionClick(anime)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: 'clamp(10px, 3vw, 12px) clamp(15px, 4vw, 20px)',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        borderBottom: '1px solid rgba(255,255,255,0.05)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(229, 9, 20, 0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <img
                        src={getPosterUrl(anime)}
                        alt={anime.name}
                        style={{
                          width: 'clamp(40px, 10vw, 50px)',
                          height: 'clamp(60px, 15vw, 75px)',
                          objectFit: 'cover',
                          borderRadius: '6px',
                          marginRight: 'clamp(12px, 3vw, 15px)'
                        }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="50" height="75"%3E%3Crect width="50" height="75" fill="%23333"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="10" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E';
                        }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ 
                          color: '#fff', 
                          fontWeight: '500', 
                          marginBottom: '5px',
                          fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {anime.name}
                        </div>
                        <div style={{ 
                          color: '#999', 
                          fontSize: 'clamp(0.75rem, 2vw, 0.85rem)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          flexWrap: 'wrap'
                        }}>
                          {anime.type?.toLowerCase() === 'movie' ? (
                            <>
                              <Film size={14} />
                              <span>Movie</span>
                            </>
                          ) : (
                            <>
                              <Tv size={14} />
                              <span>TV Series</span>
                            </>
                          )}
                          {anime.year && <><span>•</span><span>{anime.year}</span></>}
                          {anime.rating && <><span>•</span><span>⭐ {anime.rating}</span></>}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ 
                    padding: '30px', 
                    textAlign: 'center', 
                    color: '#666',
                    fontSize: 'clamp(0.85rem, 2.5vw, 0.9rem)'
                  }}>
                    No suggestions found
                  </div>
                )}
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Trending Searches */}
      {!hasSearched && (
        <div style={{ 
          maxWidth: '1200px', 
          margin: '40px auto', 
          padding: '0 5%' 
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px', 
            marginBottom: '20px' 
          }}>
            <TrendingUp size={window.innerWidth < 768 ? 20 : 24} color="#e50914" />
            <h2 style={{ 
              fontSize: 'clamp(1.2rem, 4vw, 1.5rem)', 
              fontWeight: '600', 
              color: '#fff' 
            }}>
              Trending Searches
            </h2>
          </div>
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 'clamp(8px, 2vw, 12px)' 
          }}>
            {trendingSearches.map((term, index) => (
              <button
                key={index}
                onClick={() => handleTrendingClick(term)}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff',
                  padding: 'clamp(6px, 2vw, 8px) clamp(15px, 4vw, 20px)',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontSize: 'clamp(0.8rem, 2.5vw, 0.9rem)',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(229, 9, 20, 0.2)';
                  e.currentTarget.style.borderColor = '#e50914';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                }}
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search Results */}
      <div style={{ 
        maxWidth: '1400px', 
        margin: '0 auto', 
        padding: '40px 5%' 
      }}>
        {loading ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '80px 20px', 
            color: '#999' 
          }}>
            <Loader2 
              size={window.innerWidth < 768 ? 40 : 48} 
              color="#e50914" 
              style={{ animation: 'spin 1s linear infinite' }} 
            />
            <h3 style={{ 
              marginTop: '20px', 
              fontSize: 'clamp(1.2rem, 4vw, 1.5rem)', 
              color: '#fff' 
            }}>
              Searching...
            </h3>
            <p style={{ 
              marginTop: '10px', 
              fontSize: 'clamp(0.9rem, 2.5vw, 1rem)' 
            }}>
              Finding the best anime for you
            </p>
          </div>
        ) : hasSearched ? (
          <>
            {(detectedFilters.genre || detectedFilters.type) && (
              <div style={{
                background: 'rgba(229, 9, 20, 0.1)',
                border: '1px solid rgba(229, 9, 20, 0.3)',
                borderRadius: '8px',
                padding: 'clamp(12px, 3vw, 15px) clamp(15px, 4vw, 20px)',
                marginBottom: '20px',
                color: '#fff',
                fontSize: 'clamp(0.85rem, 2.5vw, 0.95rem)'
              }}>
                <strong>Detected:</strong>{' '}
                {detectedFilters.genre && `${detectedFilters.genre.toUpperCase()} genre`}
                {detectedFilters.genre && detectedFilters.type && ' • '}
                {detectedFilters.type && `${detectedFilters.type.toUpperCase()} content`}
                {' '}(Showing all results - use filters below to narrow down)
              </div>
            )}

            <div style={{ 
              display: 'flex', 
              flexDirection: window.innerWidth < 768 ? 'column' : 'row',
              justifyContent: 'space-between', 
              alignItems: window.innerWidth < 768 ? 'stretch' : 'center',
              gap: '15px',
              marginBottom: '30px' 
            }}>
              <h2 style={{ 
                fontSize: 'clamp(1.3rem, 4vw, 1.8rem)', 
                fontWeight: '600', 
                color: '#fff' 
              }}>
                Search Results for "{searchQuery}" ({searchResults.length} results)
              </h2>
              
              <div style={{ 
                display: 'flex', 
                gap: 'clamp(8px, 2vw, 10px)',
                flexWrap: 'wrap'
              }}>
                {['all', 'tv', 'movie'].map((type) => (
                  <button
                    key={type}
                    onClick={() => handleFilterChange(type)}
                    style={{
                      background: filterType === type 
                        ? 'linear-gradient(135deg, #e50914 0%, #ff1744 100%)' 
                        : 'rgba(255,255,255,0.1)',
                      border: 'none',
                      color: '#fff',
                      padding: 'clamp(6px, 2vw, 8px) clamp(15px, 4vw, 20px)',
                      borderRadius: '20px',
                      cursor: 'pointer',
                      fontSize: 'clamp(0.8rem, 2.5vw, 0.9rem)',
                      fontWeight: filterType === type ? '600' : '400',
                      textTransform: 'capitalize',
                      transition: 'all 0.2s'
                    }}
                  >
                    {type === 'all' ? 'All' : type === 'tv' ? 'TV Series' : 'Movies'}
                  </button>
                ))}
              </div>
            </div>

            {searchResults.length > 0 ? (
              <>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(140px, 30vw, 180px), 1fr))',
                  gap: 'clamp(15px, 3vw, 25px)',
                  marginBottom: '40px'
                }}>
                  {searchResults.map((anime) => (
                    <div
                      key={anime.id}
                      onClick={() => navigate(`/anime/${anime.slug}`)}
                      style={{ cursor: 'pointer' }}
                    >
                      <AnimeCard anime={anime} />
                    </div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 'clamp(10px, 3vw, 20px)',
                    marginTop: '40px',
                    flexWrap: 'wrap'
                  }}>
                    <button
                      onClick={() => performSearch(searchQuery, currentPage - 1)}
                      disabled={currentPage === 1}
                      style={{
                        background: currentPage === 1 ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)',
                        border: 'none',
                        color: currentPage === 1 ? '#666' : '#fff',
                        padding: 'clamp(8px, 2vw, 10px) clamp(15px, 4vw, 20px)',
                        borderRadius: '8px',
                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                        fontSize: 'clamp(0.85rem, 2.5vw, 0.95rem)'
                      }}
                    >
                      Previous
                    </button>

                    <span style={{ 
                      color: '#fff', 
                      fontSize: 'clamp(0.85rem, 2.5vw, 1rem)', 
                      fontWeight: '500' 
                    }}>
                      Page {currentPage} of {totalPages}
                    </span>

                    <button
                      onClick={() => performSearch(searchQuery, currentPage + 1)}
                      disabled={currentPage === totalPages}
                      style={{
                        background: currentPage === totalPages ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)',
                        border: 'none',
                        color: currentPage === totalPages ? '#666' : '#fff',
                        padding: 'clamp(8px, 2vw, 10px) clamp(15px, 4vw, 20px)',
                        borderRadius: '8px',
                        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                        fontSize: 'clamp(0.85rem, 2.5vw, 0.95rem)'
                      }}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div style={{ 
                textAlign: 'center', 
                padding: 'clamp(60px, 15vw, 80px) 5%', 
                color: '#999' 
              }}>
                <h3 style={{ 
                  fontSize: 'clamp(1.2rem, 4vw, 1.5rem)', 
                  marginBottom: '10px', 
                  color: '#fff' 
                }}>
                  No results found
                </h3>
                <p style={{ 
                  fontSize: 'clamp(0.9rem, 2.5vw, 1rem)', 
                  marginBottom: '20px' 
                }}>
                  Try different keywords or check the spelling
                </p>
                {filterType !== 'all' && (
                  <button
                    onClick={() => handleFilterChange('all')}
                    style={{
                      background: 'rgba(229, 9, 20, 0.2)',
                      border: '1px solid #e50914',
                      color: '#fff',
                      padding: 'clamp(8px, 2vw, 10px) clamp(15px, 4vw, 20px)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      marginTop: '15px',
                      fontSize: 'clamp(0.85rem, 2.5vw, 0.95rem)'
                    }}
                  >
                    Clear Filter - Show All Results
                  </button>
                )}
              </div>
            )}
          </>
        ) : (
          <div style={{ 
            textAlign: 'center', 
            padding: 'clamp(80px, 20vw, 100px) 5%', 
            color: '#999' 
          }}>
            <Search size={window.innerWidth < 768 ? 48 : 64} color="#e50914" style={{ marginBottom: '20px' }} />
            <h3 style={{ 
              fontSize: 'clamp(1.3rem, 4vw, 1.8rem)', 
              marginBottom: '10px', 
              color: '#fff' 
            }}>
              Start Searching
            </h3>
            <p style={{ fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)' }}>
              Enter a title above to find your favorite anime
            </p>
          </div>
        )}
      </div>

      <Footer />

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default SearchPage;