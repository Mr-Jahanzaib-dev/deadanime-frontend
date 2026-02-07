import React, { useState, useEffect } from 'react';
import { Film,Star, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AnimeCard from '../components/AnimeCard';
import { getMovies } from '../services/api';

const MoviesPage = () => {
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [allMovies, setAllMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('rating');
  const [isMobile, setIsMobile] = useState(false);
  const itemsPerPage = 18;

  // SEO Configuration
  const siteUrl = 'https://dead-anime.vercel.app/'; // 🔴 REPLACE WITH YOUR DOMAIN
  const siteName = 'ToonVerse Haven'; // 🔴 REPLACE WITH YOUR SITE NAME

  // Dynamic SEO functions
  const getPageTitle = () => {
    let title = `Watch Anime Movies Online Free - HD Quality`;
    if (currentPage > 1) title += ` - Page ${currentPage}`;
    if (sortBy === 'popular') title += ` - Most Popular`;
    if (sortBy === 'new') title += ` - Latest Releases`;
    if (sortBy === 'rating') title += ` - Top Rated`;
    return `${title} | ${siteName}`;
  };

  const getPageDescription = () => {
    const sortText = {
      'rating': 'highest rated',
      'popular': 'most popular',
      'new': 'latest',
      'name': 'all'
    };
    return `Browse ${sortText[sortBy]} anime movies online. Stream ${allMovies.length}+ anime films in HD quality. Watch subbed and dubbed anime movies free. Updated daily with new releases.`;
  };

  const getKeywords = () => {
    return 'anime movies, watch anime online, anime films, japanese animation, anime streaming, free anime movies, HD anime, subbed anime, dubbed anime, anime movies 2024, best anime movies, top rated anime movies, latest anime movies';
  };

  // Structured data for rich snippets
  const generateStructuredData = () => {
    if (movies.length === 0) return {};

    const itemList = movies.slice(0, 12).map((movie, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Movie",
        "@id": `${siteUrl}/anime/${movie.slug}`,
        "name": movie.name,
        "image": movie.image,
        "url": `${siteUrl}/anime/${movie.slug}`,
        "genre": "Animation",
        ...(movie.rating && {
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": movie.rating,
            "bestRating": "10",
            "worstRating": "0",
            "ratingCount": movie.views || 100
          }
        }),
        ...(movie.release && { "datePublished": movie.release }),
        ...(movie.overview && { "description": movie.overview.substring(0, 200) })
      }
    }));

    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": "Anime Movies Collection",
      "description": `A curated collection of ${allMovies.length} anime movies available to watch online in HD quality`,
      "numberOfItems": allMovies.length,
      "itemListElement": itemList
    };
  };

  const breadcrumbStructuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": siteUrl
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Anime Movies",
        "item": `${siteUrl}/movies`
      }
    ]
  };

  const websiteStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": siteName,
    "url": siteUrl,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${siteUrl}/search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };

  // Initial fetch of all movies
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const fetchAllMovies = async () => {
      setLoading(true);
      setInitialLoading(true);
      
      try {
        let allContent = [];
        const pagesToFetch = 10;
        const limitPerPage = 50;
        
        console.log(`🎬 Starting movies fetch across ${pagesToFetch} pages...`);
        
        const fetchPromises = [];
        
        for (let page = 1; page <= pagesToFetch; page++) {
          fetchPromises.push(
            getMovies(page, limitPerPage).catch(err => {
              console.error(`Error fetching movies page ${page}:`, err);
              return { posts: [] };
            })
          );
        }
        
        const results = await Promise.all(fetchPromises);
        
        results.forEach(data => {
          if (data && data.posts) {
            allContent = [...allContent, ...data.posts];
          }
        });
        
        console.log(`📦 Total movies fetched: ${allContent.length}`);
        
        const uniqueMovies = Array.from(
          new Map(allContent.map(item => [item.id, item])).values()
        );
        
        console.log(`✨ Unique movies: ${uniqueMovies.length}`);
        
        if (uniqueMovies.length === 0) {
          console.warn('⚠️ No movies found! Check your API.');
        }
        
        setAllMovies(uniqueMovies);
      } catch (error) {
        console.error('❌ Error fetching movies:', error);
        setAllMovies([]);
      } finally {
        setLoading(false);
        setInitialLoading(false);
      }
    };

    fetchAllMovies();
  }, []);

  // Handle sorting and pagination
  useEffect(() => {
    if (initialLoading) return;
    if (allMovies.length === 0) {
      setMovies([]);
      setTotalPages(1);
      return;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    let sortedPosts = [...allMovies];
    
    switch (sortBy) {
      case 'rating':
        sortedPosts.sort((a, b) => {
          const ratingA = parseFloat(a.rating) || 0;
          const ratingB = parseFloat(b.rating) || 0;
          return ratingB - ratingA;
        });
        break;
      case 'popular':
        sortedPosts.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      case 'new':
        sortedPosts.sort((a, b) => {
          const dateA = new Date(a.release || 0);
          const dateB = new Date(b.release || 0);
          return dateB - dateA;
        });
        break;
      case 'name':
        sortedPosts.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      default:
        break;
    }
    
    const totalItems = sortedPosts.length;
    const calculatedTotalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
    
    const validCurrentPage = Math.min(currentPage, calculatedTotalPages);
    if (validCurrentPage !== currentPage) {
      setCurrentPage(validCurrentPage);
      return;
    }
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedItems = sortedPosts.slice(startIndex, endIndex);
    
    setMovies(paginatedItems);
    setTotalPages(calculatedTotalPages);
    
    console.log(`📄 Pagination: Page ${currentPage}/${calculatedTotalPages}, Showing ${paginatedItems.length} items`);
  }, [currentPage, sortBy, allMovies, initialLoading]);

  // FIXED: Handler now accepts slug directly
  const handleMovieClick = (slug) => {
    console.log('Navigating to movie:', slug);
    navigate(`/anime/${slug}`);
  };

  if (loading) {
    return (
      <>
      
          <title>Loading Anime Movies... | {siteName}</title>
          <meta name="robots" content="noindex, nofollow" />
        
        <div style={{ background: '#0a0a0a', minHeight: '100vh', color: '#fff' }}>
          <Navbar />
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            minHeight: 'calc(100vh - 80px)',
            marginTop: '80px',
            padding: isMobile ? '20px' : '40px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                position: 'relative',
                marginBottom: '30px',
                display: 'inline-block'
              }}>
                <div style={{
                  width: isMobile ? '60px' : '80px',
                  height: isMobile ? '60px' : '80px',
                  border: '4px solid rgba(229, 9, 20, 0.2)',
                  borderTop: '4px solid #e50914',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                <Film 
                  size={isMobile ? 24 : 32} 
                  color="#e50914" 
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    animation: 'pulse 2s ease-in-out infinite'
                  }}
                />
              </div>

              <h2 style={{ 
                fontSize: isMobile ? '1.4rem' : '1.8rem', 
                fontWeight: '600',
                marginBottom: '10px',
                background: 'linear-gradient(135deg, #e50914 0%, #ff1744 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Loading Movies...
              </h2>
              <p style={{ color: '#999', fontSize: isMobile ? '0.9rem' : '1rem' }}>
                Preparing your movie collection
              </p>

              <div style={{ 
                display: 'flex', 
                gap: '8px', 
                justifyContent: 'center', 
                marginTop: '20px' 
              }}>
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    style={{
                      width: isMobile ? '10px' : '12px',
                      height: isMobile ? '10px' : '12px',
                      background: '#e50914',
                      borderRadius: '50%',
                      animation: `bounce 1.4s ease-in-out ${i * 0.16}s infinite both`
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }

            @keyframes pulse {
              0%, 100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
              50% { opacity: 0.7; transform: translate(-50%, -50%) scale(0.95); }
            }

            @keyframes bounce {
              0%, 80%, 100% { 
                transform: scale(0);
                opacity: 0.5;
              }
              40% { 
                transform: scale(1);
                opacity: 1;
              }
            }
          `}</style>
        </div>
      </>
    );
  }

  return (
    <>
      
        {/* Primary Meta Tags */}
        <html lang="en" />
        <title>{getPageTitle()}</title>
        <meta name="title" content={getPageTitle()} />
        <meta name="description" content={getPageDescription()} />
        <meta name="keywords" content={getKeywords()} />
        <link rel="canonical" href={`${siteUrl}/movies${currentPage > 1 ? `?page=${currentPage}` : ''}`} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${siteUrl}/movies${currentPage > 1 ? `?page=${currentPage}` : ''}`} />
        <meta property="og:title" content={getPageTitle()} />
        <meta property="og:description" content={getPageDescription()} />
        <meta property="og:image" content={movies[0]?.image || `${siteUrl}/og-image.jpg`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={`${siteName} - Watch Anime Movies Online`} />
        <meta property="og:site_name" content={siteName} />
        <meta property="og:locale" content="en_US" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={`${siteUrl}/movies${currentPage > 1 ? `?page=${currentPage}` : ''}`} />
        <meta name="twitter:title" content={getPageTitle()} />
        <meta name="twitter:description" content={getPageDescription()} />
        <meta name="twitter:image" content={movies[0]?.image || `${siteUrl}/og-image.jpg`} />
        <meta name="twitter:image:alt" content={`${siteName} - Watch Anime Movies Online`} />

        {/* Search Engine Directives */}
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="googlebot" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="bingbot" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        
        {/* Additional SEO */}
        <meta name="language" content="English" />
        <meta name="revisit-after" content="1 day" />
        <meta name="author" content={siteName} />
        <meta name="publisher" content={siteName} />
        <meta name="copyright" content={`© ${new Date().getFullYear()} ${siteName}. All rights reserved.`} />
        <meta name="category" content="Entertainment" />
        <meta name="coverage" content="Worldwide" />
        <meta name="distribution" content="Global" />
        <meta name="rating" content="General" />

        {/* Mobile Optimization */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
        <meta name="theme-color" content="#e50914" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content={siteName} />

        {/* Pagination SEO */}
        {currentPage > 1 && (
          <link rel="prev" href={`${siteUrl}/movies?page=${currentPage - 1}`} />
        )}
        {currentPage < totalPages && (
          <link rel="next" href={`${siteUrl}/movies?page=${currentPage + 1}`} />
        )}
        <link rel="first" href={`${siteUrl}/movies`} />
        {totalPages > 1 && (
          <link rel="last" href={`${siteUrl}/movies?page=${totalPages}`} />
        )}

        {/* Structured Data */}
        {movies.length > 0 && (
          <script type="application/ld+json">
            {JSON.stringify(generateStructuredData())}
          </script>
        )}
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbStructuredData)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(websiteStructuredData)}
        </script>

      <div style={{ background: '#0a0a0a', minHeight: '100vh', color: '#fff' }}>
        <Navbar />

        {movies[0] && (
          <div style={{ 
            position: 'relative',
            height: isMobile ? '350px' : '500px',
            background: `linear-gradient(to right, rgba(10,10,10,0.95) 40%, rgba(10,10,10,0.3)), url(https://image.tmdb.org/t/p/original${movies[0].image?.backdrop})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}>
            <div className="container h-100" style={{ paddingTop: isMobile ? '20px' : '40px', paddingBottom: isMobile ? '20px' : '40px' }}>
              <div className="row h-100 align-items-center">
                <div className={isMobile ? "col-12" : "col-lg-7"}>
                  <div className="badge mb-3 px-3 py-2" style={{ 
                    background: 'linear-gradient(135deg, #e50914 0%, #ff1744 100%)',
                    border: 'none',
                    fontSize: isMobile ? '0.75rem' : '0.9rem'
                  }}>
                    <Film size={isMobile ? 12 : 14} className="me-1" />
                    Featured Movie
                  </div>
                  <h1 className={isMobile ? "h2 fw-bold mb-3" : "display-3 fw-bold mb-3"} style={{
                    fontSize: isMobile ? '1.5rem' : 'clamp(2rem, 5vw, 3rem)'
                  }}>
                    {movies[0].name}
                  </h1>
                  <div className="d-flex align-items-center gap-3 mb-3 flex-wrap">
                    <span className="badge px-3 py-2" style={{ 
                      background: 'rgba(229, 9, 20, 0.2)',
                      border: '1px solid #e50914',
                      color: '#fff',
                      fontSize: isMobile ? '0.75rem' : '0.9rem'
                    }}>
                      <Star size={isMobile ? 12 : 14} fill="#ffc107" color="#ffc107" className="me-1" />
                      {movies[0].rating}
                    </span>
                    <span style={{ color: '#999', fontSize: isMobile ? '0.8rem' : '0.9rem' }}>
                      {movies[0].year || (movies[0].release ? new Date(movies[0].release).getFullYear() : 'N/A')}
                    </span>
                    <span style={{ color: '#999', fontSize: isMobile ? '0.8rem' : '0.9rem' }}>{movies[0].type?.toUpperCase()}</span>
                    {movies[0].duration && (
                      <span style={{ color: '#999', fontSize: isMobile ? '0.8rem' : '0.9rem' }}>{movies[0].duration}</span>
                    )}
                  </div>
                  <p className={isMobile ? "mb-4" : "lead mb-4"} style={{ 
                    color: '#ccc', 
                    maxWidth: '600px',
                    fontSize: isMobile ? '0.9rem' : '1.1rem',
                    lineHeight: '1.5'
                  }}>
                    {movies[0].overview ? 
                      (movies[0].overview.length > 200 ? 
                        movies[0].overview.substring(0, 200) + '...' : 
                        movies[0].overview) 
                      : 'Experience this epic movie adventure.'}
                  </p>
                  <div style={{ marginTop: '2rem' }} className="d-flex gap-3 flex-wrap">
                    <button 
                      className={isMobile ? "btn px-3 py-2" : "btn btn-lg px-4"}
                      style={{
                        background: 'linear-gradient(135deg, #e50914 0%, #ff1744 100%)',
                        border: 'none',
                        color: '#fff',
                        fontWeight: '600',
                        boxShadow: '0 4px 15px rgba(229, 9, 20, 0.4)',
                        transition: 'all 0.3s',
                        fontSize: isMobile ? '0.9rem' : '1rem'
                      }}
                      onClick={() => handleMovieClick(movies[0].slug)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(229, 9, 20, 0.6)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 15px rgba(229, 9, 20, 0.4)';
                      }}
                    >
                      <Info size={isMobile ? 16 : 18} className="me-2" />
                      More Info
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="container py-5" style={{ marginTop: isMobile ? '1rem' : '2rem' }}>
          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
            <h2 className={isMobile ? "fw-bold mb-0 h4" : "fw-bold mb-0"} style={{
              fontSize: isMobile ? '1.25rem' : 'clamp(1.5rem, 3vw, 2rem)'
            }}>
              <Film size={isMobile ? 24 : 28} className="me-2" style={{ color: '#e50914' }} />
              Anime Movies ({allMovies.length} titles)
            </h2>
            <select 
              className="form-select" 
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
              style={{ 
                background: 'rgba(255,255,255,0.1)', 
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#fff',
                width: isMobile ? '100%' : 'auto',
                minWidth: isMobile ? 'auto' : '200px',
                maxWidth: isMobile ? 'none' : '250px',
                fontSize: isMobile ? '0.9rem' : '1rem'
              }}
            >
              <option value="rating">Highest Rated</option>
              <option value="popular">Most Popular</option>
              <option value="new">Latest Release</option>
              <option value="name">A-Z</option>
            </select>
          </div>

          {movies.length > 0 ? (
            <div className="row g-3 g-md-4">
              {movies.map(anime => (
                <div 
                  key={anime.id} 
                  className="col-xl-2 col-lg-3 col-md-4 col-sm-6 col-6"
                  onClick={() => handleMovieClick(anime.slug)}
                  style={{ cursor: 'pointer' }}
                >
                  <AnimeCard anime={anime} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-5">
              <Film size={isMobile ? 48 : 64} style={{ color: '#666' }} />
              <h3 className="mt-3" style={{ color: '#999', fontSize: isMobile ? '1.25rem' : '1.5rem' }}>No movies found</h3>
              <p style={{ color: '#666', fontSize: isMobile ? '0.85rem' : '1rem' }}>
                We couldn't find any movies in our database.
                <br />
                Try checking back later or browse other categories.
              </p>
            </div>
          )}

          {totalPages > 1 && movies.length > 0 && (
            <div className="d-flex justify-content-center align-items-center mt-5 gap-1 gap-md-2 flex-wrap px-2">
              <button
                className="btn d-none d-md-inline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(1)}
                style={{
                  background: currentPage === 1 ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)',
                  color: currentPage === 1 ? '#666' : '#fff',
                  border: 'none',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  padding: '8px 12px',
                  fontSize: '0.85rem'
                }}
              >
                «« First
              </button>

              <button
                className={isMobile ? "btn" : "btn"}
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                style={{
                  background: currentPage === 1 ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)',
                  color: currentPage === 1 ? '#666' : '#fff',
                  border: 'none',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  padding: isMobile ? '6px 10px' : '8px 12px',
                  fontSize: isMobile ? '0.8rem' : '0.85rem'
                }}
              >
                {isMobile ? '‹' : '« Previous'}
              </button>
              
              {(() => {
                const pageNumbers = [];
                const maxPagesToShow = isMobile ? 3 : 5;
                let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
                let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
                
                if (endPage - startPage < maxPagesToShow - 1) {
                  startPage = Math.max(1, endPage - maxPagesToShow + 1);
                }
                
                for (let i = startPage; i <= endPage; i++) {
                  pageNumbers.push(i);
                }
                
                return pageNumbers.map(pageNum => (
                  <button
                    key={pageNum}
                    className="btn"
                    onClick={() => setCurrentPage(pageNum)}
                    style={{
                      background: currentPage === pageNum 
                        ? 'linear-gradient(135deg, #e50914 0%, #ff1744 100%)'
                        : 'rgba(255,255,255,0.1)',
                      color: '#fff',
                      border: currentPage === pageNum ? '2px solid #ff1744' : 'none',
                      minWidth: isMobile ? '32px' : '40px',
                      padding: isMobile ? '6px 8px' : '8px 12px',
                      fontWeight: currentPage === pageNum ? '700' : '400',
                      fontSize: isMobile ? '0.8rem' : '0.9rem'
                    }}
                  >
                    {pageNum}
                  </button>
                ));
              })()}
              
              <button
                className={isMobile ? "btn" : "btn"}
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                style={{
                  background: currentPage === totalPages ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)',
                  color: currentPage === totalPages ? '#666' : '#fff',
                  border: 'none',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  padding: isMobile ? '6px 10px' : '8px 12px',
                  fontSize: isMobile ? '0.8rem' : '0.85rem'
                }}
              >
                {isMobile ? '›' : 'Next »'}
              </button>

              <button
                className="btn d-none d-md-inline"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(totalPages)}
                style={{
                  background: currentPage === totalPages ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)',
                  color: currentPage === totalPages ? '#666' : '#fff',
                  border: 'none',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  padding: '8px 12px',
                  fontSize: '0.85rem'
                }}
              >
                Last »»
              </button>
            </div>
          )}
          
          {movies.length > 0 && (
            <div style={{ 
              marginTop: '20px', 
              textAlign: 'center', 
              color: '#666', 
              fontSize: isMobile ? '0.8rem' : '0.9rem',
              padding: isMobile ? '8px' : '10px',
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '8px',
              marginLeft: isMobile ? '10px' : '0',
              marginRight: isMobile ? '10px' : '0'
            }}>
              Showing {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, allMovies.length)} of {allMovies.length} movies
              {totalPages > 1 && ` • Page ${currentPage} of ${totalPages}`}
            </div>
          )}
        </div>

        <Footer />
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.7; transform: translate(-50%, -50%) scale(0.95); }
        }

        @keyframes bounce {
          0%, 80%, 100% { 
            transform: scale(0);
            opacity: 0.5;
          }
          40% { 
            transform: scale(1);
            opacity: 1;
          }
        }

        /* Mobile responsive adjustments */
        @media (max-width: 767.98px) {
          .container {
            padding-left: 15px !important;
            padding-right: 15px !important;
          }

          .row {
            margin-left: -8px;
            margin-right: -8px;
          }

          .row > * {
            padding-left: 8px;
            padding-right: 8px;
          }

          /* Hero section mobile adjustments */
          .h-100 {
            min-height: 300px;
          }

          /* Select dropdown full width on mobile */
          .form-select {
            width: 100% !important;
            margin-top: 10px;
          }

          /* Header layout adjustments */
          .d-flex.justify-content-between {
            flex-direction: column;
            align-items: flex-start !important;
            gap: 15px !important;
          }
        }

        /* Tablet adjustments */
        @media (min-width: 768px) and (max-width: 991.98px) {
          .container {
            padding-left: 20px !important;
            padding-right: 20px !important;
          }
        }

        /* Large screens */
        @media (min-width: 1200px) {
          .container {
            max-width: 1400px;
          }
        }

        /* Extra small screens */
        @media (max-width: 480px) {
          .container {
            padding-left: 10px !important;
            padding-right: 10px !important;
          }

          .row {
            margin-left: -4px;
            margin-right: -4px;
          }

          .row > * {
            padding-left: 4px;
            padding-right: 4px;
          }
        }
      `}</style>
    </>
  );
};

export default MoviesPage;