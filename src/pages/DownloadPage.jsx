import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Grid, Loader2, Play, Star, Calendar, Film } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getAnimeByGenre } from '../services/api';

const GenrePage = () => {
  const { genre } = useParams();
  const navigate = useNavigate();
  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const genres = [
    'ACTION', 'ADVENTURE', 'COMEDY', 'DRAMA', 'ECCHI', 'FAMILY', 
    'FANTASY', 'HISTORICAL', 'MYTHOLOGY', 'MYSTERY', 'SUPERNATURAL', 
    'ROMANCE', 'HORROR', 'KIDS', 'POLITICS', 'SCHOOL', 'SAMURAI', 'SCI-FI'
  ];

  useEffect(() => {
    if (genre) {
      fetchAnimeByGenre(currentPage);
    } else {
      setLoading(false);
    }
  }, [genre, currentPage]);

  const fetchAnimeByGenre = async (page) => {
    setLoading(true);
    try {
      console.log(`Fetching ${genre} anime - Page ${page}`);
      const data = await getAnimeByGenre(genre, page, 20);
      
      console.log('Received data:', data);
      
      if (data && data.posts) {
        setAnimeList(data.posts);
        setTotalPages(data.total_pages || 1);
      } else {
        setAnimeList([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Error fetching anime by genre:', error);
      setAnimeList([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleAnimeClick = (anime) => {
    // Check if it's a movie or series
    if (anime.type?.toLowerCase() === 'movie') {
      navigate(`/watch/${anime.slug}`);
    } else {
      navigate(`/anime/${anime.slug}`);
    }
  };

  const handleGenreChange = (newGenre) => {
    setCurrentPage(1);
    navigate(`/genre/${newGenre.toLowerCase()}`);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const showPages = window.innerWidth < 768 ? 3 : 5; // Show fewer pages on mobile
    let startPage = Math.max(1, currentPage - Math.floor(showPages / 2));
    let endPage = Math.min(totalPages, startPage + showPages - 1);

    if (endPage - startPage + 1 < showPages) {
      startPage = Math.max(1, endPage - showPages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="d-flex justify-content-center align-items-center gap-2 mt-4 mt-md-5 flex-wrap px-2">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          style={{
            padding: '8px 16px',
            background: currentPage === 1 ? 'rgba(255,255,255,0.1)' : 'rgba(229, 9, 20, 0.8)',
            border: 'none',
            borderRadius: '8px',
            color: '#fff',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            fontWeight: '600',
            transition: 'all 0.3s',
            fontSize: '0.9rem'
          }}
        >
          Prev
        </button>

        {startPage > 1 && (
          <>
            <button
              onClick={() => handlePageChange(1)}
              style={{
                padding: '8px 12px',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: '600',
                minWidth: '40px',
                fontSize: '0.9rem'
              }}
            >
              1
            </button>
            {startPage > 2 && <span style={{ color: '#666', fontSize: '0.9rem' }}>...</span>}
          </>
        )}

        {pages.map((page) => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            style={{
              padding: '8px 12px',
              background: page === currentPage ? '#e50914' : 'rgba(255,255,255,0.1)',
              border: page === currentPage ? 'none' : '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              color: '#fff',
              cursor: 'pointer',
              fontWeight: '600',
              minWidth: '40px',
              transition: 'all 0.3s',
              fontSize: '0.9rem'
            }}
          >
            {page}
          </button>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span style={{ color: '#666', fontSize: '0.9rem' }}>...</span>}
            <button
              onClick={() => handlePageChange(totalPages)}
              style={{
                padding: '8px 12px',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: '600',
                minWidth: '40px',
                fontSize: '0.9rem'
              }}
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          style={{
            padding: '8px 16px',
            background: currentPage === totalPages ? 'rgba(255,255,255,0.1)' : 'rgba(229, 9, 20, 0.8)',
            border: 'none',
            borderRadius: '8px',
            color: '#fff',
            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            fontWeight: '600',
            transition: 'all 0.3s',
            fontSize: '0.9rem'
          }}
        >
          Next
        </button>
      </div>
    );
  };

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', color: '#fff' }}>
      <Navbar />
      
      <div className="container" style={{ marginTop: '100px', paddingBottom: '60px', paddingLeft: '15px', paddingRight: '15px' }}>
        {/* Header */}
        <div className="mb-4 mb-md-5 text-center text-md-start">
          <h1 style={{
            fontSize: 'clamp(1.5rem, 5vw, 2.5rem)',
            fontWeight: 'bold',
            marginBottom: '10px'
          }}>
            <Grid 
              size={window.innerWidth < 768 ? 32 : 45} 
              className="me-2" 
              style={{ 
                color: '#e50914', 
                display: 'inline', 
                marginBottom: '4px',
                verticalAlign: 'middle'
              }} 
            />
            {genre ? genre.toUpperCase() : 'Browse by Genre'}
          </h1>
          <p className="lead" style={{ 
            color: '#999', 
            fontSize: 'clamp(0.9rem, 2vw, 1.1rem)',
            margin: 0
          }}>
            {genre 
              ? `Discover amazing ${genre.toLowerCase()} anime series and movies` 
              : 'Select a genre to explore'}
          </p>
        </div>

        {/* Genre Filter Buttons */}
        <div className="mb-4 mb-md-5">
          <div className="d-flex flex-wrap gap-2 justify-content-center justify-content-md-start">
            {genres.map((g) => (
              <button
                key={g}
                onClick={() => handleGenreChange(g)}
                style={{
                  padding: 'clamp(8px, 2vw, 10px) clamp(12px, 3vw, 20px)',
                  background: genre?.toUpperCase() === g ? '#e50914' : 'rgba(255,255,255,0.1)',
                  border: genre?.toUpperCase() === g ? 'none' : '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '25px',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: genre?.toUpperCase() === g ? '600' : '500',
                  fontSize: 'clamp(0.75rem, 2vw, 0.9rem)',
                  transition: 'all 0.3s',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => {
                  if (genre?.toUpperCase() !== g) {
                    e.currentTarget.style.background = 'rgba(229, 9, 20, 0.3)';
                    e.currentTarget.style.borderColor = 'rgba(229, 9, 20, 0.5)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (genre?.toUpperCase() !== g) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                  }
                }}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '300px',
            flexDirection: 'column',
            gap: '20px',
            padding: '20px'
          }}>
            <Loader2 size={window.innerWidth < 768 ? 40 : 48} color="#e50914" style={{ animation: 'spin 1s linear infinite' }} />
            <p style={{ 
              color: '#999', 
              fontSize: 'clamp(0.9rem, 2vw, 1.1rem)',
              textAlign: 'center',
              margin: 0
            }}>
              Loading {genre} anime...
            </p>
          </div>
        )}

        {/* Anime Grid */}
        {!loading && animeList.length > 0 && (
          <>
            <div className="row g-3 g-md-4">
              {animeList.map((anime) => (
                <div key={anime.id} className="col-6 col-sm-4 col-md-3 col-lg-2">
                  <div
                    onClick={() => handleAnimeClick(anime)}
                    style={{
                      cursor: 'pointer',
                      borderRadius: 'clamp(8px, 2vw, 12px)',
                      overflow: 'hidden',
                      background: 'rgba(255,255,255,0.05)',
                      transition: 'all 0.3s ease',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-8px)';
                      e.currentTarget.style.boxShadow = '0 10px 30px rgba(229, 9, 20, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{ position: 'relative', paddingBottom: '140%', overflow: 'hidden', background: '#222' }}>
                      {/* Using TMDB image path like HomePage */}
                      <img
                        src={`https://image.tmdb.org/t/p/w500${anime.image?.poster}`}
                        alt={anime.name}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="450"%3E%3Crect fill="%23222" width="300" height="450"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="18" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3ENo Image%3C/text%3E%3C/svg%3E';
                        }}
                      />
                      {/* Rating Badge */}
                      {anime.rating && parseFloat(anime.rating) > 0 && (
                        <div style={{
                          position: 'absolute',
                          top: 'clamp(6px, 1.5vw, 8px)',
                          right: 'clamp(6px, 1.5vw, 8px)',
                          background: 'rgba(229, 9, 20, 0.9)',
                          padding: 'clamp(3px, 1vw, 4px) clamp(6px, 1.5vw, 8px)',
                          borderRadius: 'clamp(4px, 1vw, 6px)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: 'clamp(0.65rem, 1.5vw, 0.75rem)',
                          fontWeight: '600'
                        }}>
                          <Star size={window.innerWidth < 768 ? 10 : 12} fill="#fff" />
                          {anime.rating}
                        </div>
                      )}
                      {/* Type Badge */}
                      {anime.type && (
                        <div style={{
                          position: 'absolute',
                          top: 'clamp(6px, 1.5vw, 8px)',
                          left: 'clamp(6px, 1.5vw, 8px)',
                          background: anime.type.toLowerCase() === 'movie' ? 'rgba(34, 197, 94, 0.9)' : 'rgba(59, 130, 246, 0.9)',
                          padding: 'clamp(3px, 1vw, 4px) clamp(6px, 1.5vw, 8px)',
                          borderRadius: 'clamp(4px, 1vw, 6px)',
                          fontSize: 'clamp(0.6rem, 1.5vw, 0.7rem)',
                          fontWeight: '600',
                          textTransform: 'uppercase',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          {anime.type.toLowerCase() === 'movie' && <Film size={window.innerWidth < 768 ? 10 : 12} />}
                          {anime.type}
                        </div>
                      )}
                      {/* Play Overlay */}
                      <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
                        padding: 'clamp(20px, 5vw, 30px) clamp(8px, 2vw, 10px) clamp(8px, 2vw, 10px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: 0,
                        transition: 'opacity 0.3s'
                      }}
                      className="play-overlay"
                      >
                        <div style={{
                          width: 'clamp(40px, 10vw, 50px)',
                          height: 'clamp(40px, 10vw, 50px)',
                          borderRadius: '50%',
                          background: 'rgba(229, 9, 20, 0.9)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Play size={window.innerWidth < 768 ? 20 : 24} fill="#fff" />
                        </div>
                      </div>
                    </div>
                    <div style={{ padding: 'clamp(8px, 2vw, 12px)' }}>
                      <h6 style={{
                        fontWeight: '600',
                        fontSize: 'clamp(0.75rem, 2vw, 0.9rem)',
                        marginBottom: 'clamp(4px, 1vw, 6px)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        lineHeight: '1.3',
                        minHeight: '2.6em'
                      }}>
                        {anime.name}
                      </h6>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'clamp(4px, 1vw, 8px)',
                        fontSize: 'clamp(0.65rem, 1.5vw, 0.75rem)',
                        color: '#999',
                        flexWrap: 'wrap'
                      }}>
                        {anime.year && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Calendar size={window.innerWidth < 768 ? 10 : 12} />
                            {anime.year}
                          </span>
                        )}
                        {anime.episodes && (
                          <span>• {anime.episodes} eps</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {renderPagination()}
          </>
        )}

        {/* No Results */}
        {!loading && animeList.length === 0 && genre && (
          <div style={{
            textAlign: 'center',
            padding: 'clamp(40px, 10vw, 60px) clamp(15px, 3vw, 20px)',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: 'clamp(8px, 2vw, 12px)',
            border: '1px dashed rgba(255,255,255,0.2)'
          }}>
            <Film size={window.innerWidth < 768 ? 48 : 64} style={{ color: '#666', marginBottom: '20px' }} />
            <h3 style={{ 
              color: '#999', 
              marginBottom: '10px',
              fontSize: 'clamp(1rem, 3vw, 1.5rem)'
            }}>
              No anime found
            </h3>
            <p style={{ 
              color: '#666',
              fontSize: 'clamp(0.85rem, 2vw, 1rem)',
              margin: 0
            }}>
              No {genre.toLowerCase()} anime available at the moment. Try selecting a different genre.
            </p>
          </div>
        )}

        {/* No Genre Selected */}
        {!genre && !loading && (
          <div style={{
            textAlign: 'center',
            padding: 'clamp(40px, 10vw, 60px) clamp(15px, 3vw, 20px)',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: 'clamp(8px, 2vw, 12px)',
            border: '1px dashed rgba(255,255,255,0.2)'
          }}>
            <Grid size={window.innerWidth < 768 ? 48 : 64} style={{ color: '#e50914', marginBottom: '20px' }} />
            <h3 style={{ 
              color: '#fff', 
              marginBottom: '10px',
              fontSize: 'clamp(1rem, 3vw, 1.5rem)'
            }}>
              Select a Genre
            </h3>
            <p style={{ 
              color: '#999',
              fontSize: 'clamp(0.85rem, 2vw, 1rem)',
              margin: 0
            }}>
              Choose a genre from the options above to start exploring
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

        .play-overlay {
          opacity: 0;
        }

        /* Desktop hover effects */
        @media (min-width: 768px) {
          .col-6:hover .play-overlay,
          .col-sm-4:hover .play-overlay,
          .col-md-3:hover .play-overlay,
          .col-lg-2:hover .play-overlay {
            opacity: 1;
          }
        }

        /* Mobile optimizations */
        @media (max-width: 767.98px) {
          .container {
            max-width: 100%;
            padding-left: 10px !important;
            padding-right: 10px !important;
          }
          
          .row {
            margin-left: -6px;
            margin-right: -6px;
          }
          
          .row > * {
            padding-left: 6px;
            padding-right: 6px;
          }
        }

        /* Tablet adjustments */
        @media (min-width: 768px) and (max-width: 991.98px) {
          .container {
            padding-left: 20px !important;
            padding-right: 20px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default GenrePage;