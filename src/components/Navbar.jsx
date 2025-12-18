import React, { useState, useEffect, useRef } from 'react';
import { Search, Home, Clock, CheckCircle, Film, Sparkles, Grid, Play, Menu, X, Loader2 } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { searchAnime } from '../services/api';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  const searchInputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const debounceTimerRef = useRef(null);

  // Get poster image URL - matches backend API response
  const getPosterUrl = (anime) => {
    if (!anime || !anime.image) {
      return null;
    }

    const posterPath = anime.image.poster;
    
    if (!posterPath || posterPath === '' || posterPath === 'null') {
      return null;
    }
    
    // If it's a full URL, use it directly
    if (posterPath.startsWith('http://') || posterPath.startsWith('https://')) {
      return posterPath;
    }
    
    // If it starts with /, it's a TMDB path
    if (posterPath.startsWith('/')) {
      return `https://image.tmdb.org/t/p/w500${posterPath}`;
    }
    
    return null;
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle clicks outside suggestions to close
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

  // Debounced suggestions fetch
  useEffect(() => {
    if (searchQuery.length >= 2) {
      setSuggestionsLoading(true);
      
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(async () => {
        try {
          const data = await searchAnime(searchQuery, 1, 5);
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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      setMenuOpen(false);
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleSuggestionClick = (anime) => {
    setShowSuggestions(false);
    setSearchQuery('');
    setMenuOpen(false);
    navigate(`/anime/${anime.slug}`);
  };

  const navItems = [
    { id: 'home', name: 'Home', icon: Home, path: '/' },
    { id: 'ongoing', name: 'Ongoing', icon: Clock, path: '/ongoing' },
    { id: 'completed', name: 'Completed', icon: CheckCircle, path: '/completed' },
    { id: 'movies', name: 'Movies', icon: Film, path: '/movies' },
    { id: 'marvel', name: 'Marvel', icon: Sparkles, path: '/marvel' },
    { id: 'genre', name: 'Genre', icon: Grid, path: '/genre' }
  ];

  const renderSuggestionImage = (anime, size = { width: 50, height: 75 }) => {
    const imageUrl = getPosterUrl(anime);
    
    if (imageUrl) {
      return (
        <img
          src={imageUrl}
          alt={anime.name}
          style={{
            width: `${size.width}px`,
            height: `${size.height}px`,
            objectFit: 'cover',
            borderRadius: size.width === 40 ? '4px' : '6px',
            marginRight: size.width === 40 ? '12px' : '15px',
            background: '#1a1a1a'
          }}
          loading="lazy"
        />
      );
    }
    
    // Fallback: show colored placeholder div
    return (
      <div style={{
        width: `${size.width}px`,
        height: `${size.height}px`,
        background: 'linear-gradient(135deg, #333 0%, #1a1a1a 100%)',
        borderRadius: size.width === 40 ? '4px' : '6px',
        marginRight: size.width === 40 ? '12px' : '15px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#666',
        fontSize: '10px',
        textAlign: 'center',
        padding: '4px'
      }}>
        <Film size={16} />
      </div>
    );
  };

  return (
    <>
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: scrolled ? 'rgba(10, 10, 10, 0.98)' : 'rgba(10, 10, 10, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        transition: 'all 0.3s ease',
        boxShadow: scrolled ? '0 10px 30px rgba(0,0,0,0.5)' : 'none'
      }}>
        <div className="container-fluid px-4">
          <nav className="navbar navbar-expand-lg navbar-dark py-3">
            {/* Logo/Brand */}
            <Link to="/" className="navbar-brand d-flex align-items-center" style={{ fontSize: '1.5rem', fontWeight: '700', textDecoration: 'none', color: '#fff' }}>
              <Play size={28} className="me-2" style={{ fill: '#e50914', color: '#e50914' }} />
              <span className="d-none d-lg-inline">ToonVerse</span>
              <span className="d-none d-lg-inline" style={{ color: '#e50914' }}>Haven</span>
            </Link>

            {/* Mobile Search Bar */}
            <div className="d-lg-none flex-grow-1 mx-3" style={{ position: 'relative' }}>
              <form onSubmit={handleSearchSubmit}>
                <div className="position-relative">
                  <input
                    ref={searchInputRef}
                    type="text"
                    className="form-control"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
                    style={{
                      background: 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '20px',
                      padding: '8px 40px 8px 16px',
                      color: '#fff',
                      width: '100%',
                      fontSize: '0.9rem'
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      border: 'none',
                      color: '#999',
                      cursor: 'pointer',
                      padding: '4px'
                    }}
                  >
                    <Search size={16} />
                  </button>
                </div>
              </form>

              {/* Mobile Suggestions Dropdown */}
              {showSuggestions && (
                <div
                  ref={suggestionsRef}
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    marginTop: '8px',
                    background: 'rgba(20, 20, 20, 0.98)',
                    borderRadius: '8px',
                    border: '1px solid rgba(229, 9, 20, 0.3)',
                    maxHeight: '300px',
                    overflowY: 'auto',
                    zIndex: 1001,
                    boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
                  }}
                >
                  {suggestionsLoading ? (
                    <div style={{ padding: '20px', textAlign: 'center' }}>
                      <Loader2 size={24} color="#e50914" style={{ animation: 'spin 1s linear infinite' }} />
                    </div>
                  ) : suggestions.length > 0 ? (
                    suggestions.map((anime) => (
                      <div
                        key={anime.id}
                        onClick={() => handleSuggestionClick(anime)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '10px',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          borderBottom: '1px solid rgba(255,255,255,0.05)'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(229, 9, 20, 0.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        {renderSuggestionImage(anime, { width: 40, height: 60 })}
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                          <div style={{
                            fontWeight: '600',
                            fontSize: '0.9rem',
                            marginBottom: '2px',
                            color: '#fff',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            {anime.name}
                          </div>
                          <div style={{
                            fontSize: '0.75rem',
                            color: '#999'
                          }}>
                            {anime.type} {anime.year && `• ${anime.year}`}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#666', fontSize: '0.85rem' }}>
                      No results found
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button 
              className="navbar-toggler border-0 d-lg-none" 
              onClick={() => setMenuOpen(!menuOpen)}
              style={{ boxShadow: 'none' }}
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Desktop Navigation & Search */}
            <div className={`collapse navbar-collapse ${menuOpen ? 'show' : ''}`}>
              <ul className="navbar-nav ms-4 me-auto">
                {navItems.map(item => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <li key={item.id} className="nav-item">
                      <Link 
                        to={item.path}
                        className="nav-link px-3"
                        style={{ 
                          color: isActive ? '#e50914' : '#fff',
                          fontWeight: isActive ? '600' : '400',
                          position: 'relative',
                          textDecoration: 'none'
                        }}
                        onClick={() => setMenuOpen(false)}
                      >
                        <Icon size={16} className="me-2 d-inline" />
                        {item.name}
                        {isActive && (
                          <div className="nav-active-indicator" style={{
                            position: 'absolute',
                            bottom: '-8px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: window.innerWidth < 768 ? '20px' : '40px',
                            height: '3px',
                            background: '#e50914',
                            borderRadius: '3px'
                          }} />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>

              {/* Desktop Search Bar */}
              <div className="d-none d-lg-flex align-items-center" style={{ position: 'relative' }}>
                <form onSubmit={handleSearchSubmit} style={{ position: 'relative', marginRight: '1rem' }}>
                  <input
                    ref={searchInputRef}
                    type="text"
                    className="form-control"
                    placeholder="Search anime..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
                    style={{
                      background: 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '20px',
                      padding: '8px 40px 8px 16px',
                      color: '#fff',
                      width: '250px'
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      border: 'none',
                      color: '#999',
                      cursor: 'pointer',
                      padding: '4px'
                    }}
                  >
                    <Search size={18} />
                  </button>
                </form>

                {/* Desktop Suggestions Dropdown */}
                {showSuggestions && (
                  <div
                    ref={suggestionsRef}
                    style={{
                      position: 'absolute',
                      top: '100%',
                      right: '1rem',
                      marginTop: '8px',
                      width: '350px',
                      background: 'rgba(20, 20, 20, 0.98)',
                      borderRadius: '8px',
                      border: '1px solid rgba(229, 9, 20, 0.3)',
                      maxHeight: '400px',
                      overflowY: 'auto',
                      zIndex: 1001,
                      boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
                    }}
                  >
                    {suggestionsLoading ? (
                      <div style={{ padding: '30px', textAlign: 'center' }}>
                        <Loader2 size={32} color="#e50914" style={{ animation: 'spin 1s linear infinite' }} />
                      </div>
                    ) : suggestions.length > 0 ? (
                      suggestions.map((anime) => (
                        <div
                          key={anime.id}
                          onClick={() => handleSuggestionClick(anime)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '12px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            borderBottom: '1px solid rgba(255,255,255,0.05)'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(229, 9, 20, 0.1)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          {renderSuggestionImage(anime, { width: 50, height: 75 })}
                          <div style={{ flex: 1 }}>
                            <div style={{
                              fontWeight: '600',
                              fontSize: '1rem',
                              marginBottom: '4px',
                              color: '#fff'
                            }}>
                              {anime.name}
                            </div>
                            <div style={{
                              fontSize: '0.85rem',
                              color: '#999'
                            }}>
                              {anime.type} {anime.year && `• ${anime.year}`} {anime.rating && `• ⭐ ${anime.rating}`}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div style={{ padding: '30px', textAlign: 'center', color: '#666' }}>
                        No results found
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </nav>
        </div>
      </header>

      <style>{`
        @import url('https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css');
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .nav-link:hover { 
          color: #e50914 !important; 
        }
        
        input::placeholder { 
          color: #666; 
        }
        
        input:focus { 
          outline: none; 
          border-color: #e50914; 
          box-shadow: 0 0 0 0.2rem rgba(229, 9, 20, 0.25);
        }

        /* Mobile Menu Styling */
        @media (max-width: 991.98px) {
          .navbar-collapse {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: rgba(10, 10, 10, 0.98);
            backdrop-filter: blur(10px);
            border-bottom: 1px solid rgba(255,255,255,0.1);
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            max-height: 70vh;
            overflow-y: auto;
          }

          .navbar-nav {
            padding: 1rem 0;
          }

          .nav-item {
            padding: 0.5rem 1rem;
          }

          .nav-link {
            padding: 0.75rem 1rem !important;
            border-radius: 8px;
            transition: all 0.3s ease;
          }

          .nav-link:hover {
            background: rgba(229, 9, 20, 0.1);
          }

          .nav-active-indicator {
            width: 20px !important;
          }
        }

        /* Tablet (768px - 991px) */
        @media (min-width: 768px) and (max-width: 991.98px) {
          .navbar-brand {
            font-size: 1.4rem !important;
          }
          
          .navbar {
            padding-top: 0.75rem !important;
            padding-bottom: 0.75rem !important;
          }
        }

        /* Small tablets and large phones (576px - 767px) */
        @media (min-width: 576px) and (max-width: 767.98px) {
          .navbar-brand {
            font-size: 1.3rem !important;
          }
          
          .navbar-brand svg {
            width: 26px !important;
            height: 26px !important;
          }
          
          .navbar {
            padding-top: 0.75rem !important;
            padding-bottom: 0.75rem !important;
          }
          
          .mx-3 {
            margin-left: 1rem !important;
            margin-right: 1rem !important;
          }
        }

        /* Ensure proper spacing on mobile */
        @media (max-width: 575.98px) {
          .container-fluid {
            padding-left: 1rem !important;
            padding-right: 1rem !important;
          }
          
          .navbar-brand {
            font-size: 1.2rem !important;
          }
          
          .navbar-brand svg {
            width: 24px !important;
            height: 24px !important;
          }
          
          .mx-3 {
            margin-left: 0.75rem !important;
            margin-right: 0.75rem !important;
          }
          
          input {
            font-size: 0.85rem !important;
            padding: 7px 36px 7px 14px !important;
          }
        }

        /* Extra small devices (360px - 399px) */
        @media (min-width: 360px) and (max-width: 399.98px) {
          .container-fluid {
            padding-left: 0.75rem !important;
            padding-right: 0.75rem !important;
          }
          
          .navbar {
            padding-top: 0.65rem !important;
            padding-bottom: 0.65rem !important;
          }
          
          .navbar-brand {
            font-size: 1.15rem !important;
          }
          
          .navbar-brand svg {
            width: 22px !important;
            height: 22px !important;
          }
          
          .mx-3 {
            margin-left: 0.5rem !important;
            margin-right: 0.5rem !important;
          }
          
          input {
            font-size: 0.8rem !important;
            padding: 6px 32px 6px 12px !important;
          }
          
          .navbar-toggler svg {
            width: 22px !important;
            height: 22px !important;
          }
        }

        /* Very small devices (< 360px) */
        @media (max-width: 359.98px) {
          .container-fluid {
            padding-left: 0.5rem !important;
            padding-right: 0.5rem !important;
          }
          
          .navbar {
            padding-top: 0.6rem !important;
            padding-bottom: 0.6rem !important;
          }
          
          .navbar-brand {
            font-size: 1.1rem !important;
          }
          
          .navbar-brand svg {
            width: 20px !important;
            height: 20px !important;
          }
          
          .mx-3 {
            margin-left: 0.4rem !important;
            margin-right: 0.4rem !important;
          }
          
          input {
            font-size: 0.75rem !important;
            padding: 5px 30px 5px 10px !important;
          }
          
          .navbar-toggler {
            padding: 0.25rem 0.4rem !important;
          }
          
          .navbar-toggler svg {
            width: 20px !important;
            height: 20px !important;
          }
        }

        /* Large desktop (1400px+) */
        @media (min-width: 1400px) {
          .container-fluid {
            max-width: 1400px;
            margin: 0 auto;
          }
        }

        /* Custom scrollbar for suggestion dropdowns */
        [style*="overflowY: 'auto'"],
        .navbar-collapse {
          -webkit-overflow-scrolling: touch;
          scrollbar-width: thin;
          scrollbar-color: #e50914 rgba(255,255,255,0.1);
        }

        [style*="overflowY: 'auto'"]::-webkit-scrollbar,
        .navbar-collapse::-webkit-scrollbar {
          width: 6px;
        }

        [style*="overflowY: 'auto'"]::-webkit-scrollbar-track,
        .navbar-collapse::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.05);
          border-radius: 10px;
        }

        [style*="overflowY: 'auto'"]::-webkit-scrollbar-thumb,
        .navbar-collapse::-webkit-scrollbar-thumb {
          background: #e50914;
          border-radius: 10px;
        }

        [style*="overflowY: 'auto'"]::-webkit-scrollbar-thumb:hover,
        .navbar-collapse::-webkit-scrollbar-thumb:hover {
          background: #ff0a1a;
        }
      `}</style>
    </>
  );
};

export default Navbar;