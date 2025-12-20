import React, { useState, useEffect } from 'react';
import { Clock, Play, Star } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AnimeCard from '../components/AnimeCard';
import { getSeries } from '../services/api';

const OngoingPage = () => {
  const [ongoingAnime, setOngoingAnime] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('new');
  const [isMobile, setIsMobile] = useState(false);

  // SEO Configuration
  const siteName = 'ToonVerse Haven';

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const fetchOngoingAnime = async () => {
      setLoading(true);
      
      // Scroll to top when page changes
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      try {
        const data = await getSeries(currentPage, 18); // Fetch 18 anime per page
        
        // Get all posts
        const allPosts = data.posts || [];
        
        // Sort by rating (highest first)
        const sortedPosts = allPosts.sort((a, b) => {
          const ratingA = parseFloat(a.rating) || 0;
          const ratingB = parseFloat(b.rating) || 0;
          return ratingB - ratingA;
        });
        
        setOngoingAnime(sortedPosts);
        setTotalPages(data.total_pages || 1);
      } catch (error) {
        console.error('Error fetching ongoing anime:', error);
        setOngoingAnime([]);
      }
      setLoading(false);
    };

    fetchOngoingAnime();
  }, [currentPage, sortBy]);

  // SEO: Generate structured data
  const generateStructuredData = () => {
    const baseUrl = window.location.origin;
    const topAnime = ongoingAnime.slice(0, 10);
    
    return {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "Ongoing Anime Series - Watch Latest Episodes",
      "url": `${baseUrl}/ongoing`,
      "description": "Watch ongoing anime series with latest episodes. Stream currently airing anime shows in HD quality with English subtitles and dubs.",
      "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": baseUrl
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Ongoing Anime",
            "item": `${baseUrl}/ongoing`
          }
        ]
      },
      "mainEntity": {
        "@type": "ItemList",
        "name": "Ongoing Anime Series",
        "numberOfItems": ongoingAnime.length,
        "itemListElement": topAnime.map((anime, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "item": {
            "@type": "TVSeries",
            "name": anime.name,
            "url": `${baseUrl}/anime/${anime.slug}`,
            "image": anime.image?.poster ? `https://image.tmdb.org/t/p/w500${anime.image.poster}` : "",
            "description": anime.overview,
            "aggregateRating": anime.rating ? {
              "@type": "AggregateRating",
              "ratingValue": anime.rating,
              "bestRating": "10",
              "worstRating": "0"
            } : undefined,
            "datePublished": anime.release,
            "numberOfEpisodes": anime.episodes,
            "contentRating": "PG-13"
          }
        }))
      }
    };
  };

  // SEO: Dynamic meta tags
  const generateMetaTags = () => {
    const baseUrl = window.location.origin;
    const topAnime = ongoingAnime.slice(0, 5);
    const animeNames = topAnime.map(a => a.name).join(', ');
    const featuredAnime = ongoingAnime[0] || {};
    
    const pageTitle = currentPage > 1 
      ? `Ongoing Anime Series - Page ${currentPage} | ${siteName}`
      : `Ongoing Anime Series - Watch Latest Episodes | ${siteName}`;
    
    const description = currentPage > 1
      ? `Browse ongoing anime series - Page ${currentPage}. Watch latest episodes including ${animeNames}. Stream currently airing anime in HD quality.`
      : `Watch ongoing anime series with latest episodes. Stream ${animeNames} and more currently airing shows in HD quality with English subs & dubs.`;
    
    const keywords = `ongoing anime, airing anime, latest anime episodes, ${animeNames}, currently airing, new anime episodes, anime series 2024, anime streaming, watch anime online`;
    
    const ogImage = featuredAnime.image?.backdrop 
      ? `https://image.tmdb.org/t/p/original${featuredAnime.image.backdrop}`
      : `${baseUrl}/og-ongoing.jpg`;
    
    return { pageTitle, description, keywords, baseUrl, ogImage };
  };

  const { pageTitle, description, keywords, baseUrl, ogImage } = generateMetaTags();

  if (loading) {
    return (
      <div style={{ background: '#0a0a0a', minHeight: '100vh', color: '#fff' }}>
        <Navbar />
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: 'calc(100vh - 80px)',
          marginTop: isMobile ? '60px' : '80px',
          padding: isMobile ? '20px' : '0'
        }}>
          <div style={{ textAlign: 'center' }}>
            {/* Animated Logo/Icon */}
            <div style={{
              position: 'relative',
              marginBottom: '30px',
              display: 'inline-block'
            }}>
              <div style={{
                width: isMobile ? '60px' : '80px',
                height: isMobile ? '60px' : '80px',
                border: '4px solid rgba(201, 41, 41, 0.2)',
                borderTop: '4px solid #cb1a38ff',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              <Clock 
                size={isMobile ? 24 : 32}
                color="#f41212ff" 
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  animation: 'pulse 2s ease-in-out infinite'
                }}
              />
            </div>

            {/* Loading Text */}
            <h2 style={{ 
              fontSize: isMobile ? '1.3rem' : '1.8rem',
              fontWeight: '600',
              marginBottom: '10px',
              background: 'linear-gradient(135deg, #c52020ff 0%, #c92020ff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Loading Ongoing Series...
            </h2>
            <p style={{ color: '#999', fontSize: isMobile ? '0.85rem' : '1rem' }}>
              Fetching the latest airing anime
            </p>

            {/* Loading Dots */}
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
                    background: '#28a745',
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
    );
  }

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', color: '#fff' }}>
      <Navbar />

      <main>
        {/* Hero Banner with Top Rated Anime */}
        {ongoingAnime[0] && (
          <section 
            aria-labelledby="featured-ongoing"
            style={{ 
              position: 'relative',
              height: isMobile ? '400px' : '500px',
              marginTop: isMobile ? '60px' : '70px',
              background: isMobile 
                ? `linear-gradient(to bottom, rgba(10,10,10,0.7) 0%, rgba(10,10,10,0.95) 80%), url(https://image.tmdb.org/t/p/original${ongoingAnime[0].image?.backdrop})`
                : `linear-gradient(to right, rgba(10,10,10,0.95) 40%, rgba(10,10,10,0.3)), url(https://image.tmdb.org/t/p/original${ongoingAnime[0].image?.backdrop})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <article 
              itemScope 
              itemType="https://schema.org/TVSeries"
              style={{
                maxWidth: '1400px',
                margin: '0 auto',
                padding: isMobile ? '20px' : '0 40px',
                height: '100%',
                display: 'flex',
                alignItems: isMobile ? 'flex-end' : 'center'
              }}
            >
              <div style={{ width: '100%', maxWidth: isMobile ? '100%' : '700px' }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  background: '#28a745',
                  padding: isMobile ? '6px 12px' : '8px 16px',
                  borderRadius: '4px',
                  marginBottom: isMobile ? '12px' : '15px',
                  fontSize: isMobile ? '0.75rem' : '0.85rem',
                  fontWeight: '500'
                }}>
                  <Clock size={isMobile ? 12 : 14} />
                  Top Rated Ongoing
                </div>
                <h1 
                  id="featured-ongoing"
                  style={{
                    fontSize: isMobile ? '1.8rem' : '3rem',
                    fontWeight: '700',
                    marginBottom: isMobile ? '12px' : '15px',
                    lineHeight: '1.2'
                  }}
                  itemProp="name"
                >
                  {ongoingAnime[0].name}
                </h1>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: isMobile ? '10px' : '15px',
                  marginBottom: isMobile ? '12px' : '15px',
                  flexWrap: 'wrap',
                  fontSize: isMobile ? '0.8rem' : '0.9rem'
                }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    background: '#28a745',
                    padding: isMobile ? '4px 10px' : '6px 12px',
                    borderRadius: '4px'
                  }}>
                    <Star size={isMobile ? 12 : 14} fill="#ffc107" color="#ffc107" />
                    <span itemProp="aggregateRating" itemScope itemType="https://schema.org/AggregateRating">
                      <meta itemProp="ratingValue" content={ongoingAnime[0].rating} />
                      <meta itemProp="bestRating" content="10" />
                      {ongoingAnime[0].rating}
                    </span>
                  </span>
                  <time 
                    itemProp="datePublished" 
                    dateTime={ongoingAnime[0].release}
                    style={{ color: '#999' }}
                  >
                    {ongoingAnime[0].year || (ongoingAnime[0].release ? new Date(ongoingAnime[0].release).getFullYear() : 'N/A')}
                  </time>
                  <span style={{ color: '#999' }}>{ongoingAnime[0].type?.toUpperCase()}</span>
                  <span itemProp="numberOfEpisodes" style={{ color: '#999' }}>
                    {ongoingAnime[0].episodes} Eps
                  </span>
                </div>
                {!isMobile && (
                  <p 
                    itemProp="description"
                    style={{ 
                      color: '#ccc', 
                      maxWidth: '600px',
                      fontSize: '1rem',
                      lineHeight: '1.6',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {ongoingAnime[0].overview}
                  </p>
                )}
                <meta itemProp="url" content={`${baseUrl}/anime/${ongoingAnime[0].slug}`} />
                <meta itemProp="image" content={ongoingAnime[0].image?.poster ? `https://image.tmdb.org/t/p/w500${ongoingAnime[0].image.poster}` : ""} />
              </div>
            </article>
          </section>
        )}
        {/* Main Content Section */}
        <section style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: isMobile ? '30px 15px' : '50px 40px'
        }} aria-labelledby="anime-list-heading">
          <header style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: isMobile ? '20px' : '30px',
            flexWrap: 'wrap',
            gap: '15px'
          }}>
            <h2 id="anime-list-heading" style={{
              fontSize: isMobile ? '1.3rem' : '1.8rem',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              margin: 0
            }}>
              <Clock size={isMobile ? 24 : 28} style={{ color: '#28a745' }} />
              {isMobile ? 'Ongoing' : `All Ongoing Anime (${ongoingAnime.length})`}
            </h2>
            <label htmlFor="sort-select" className="visually-hidden">Sort anime by</label>
            <select 
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort anime by"
              style={{ 
                background: 'rgba(255,255,255,0.1)', 
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#fff',
                padding: isMobile ? '8px 12px' : '10px 15px',
                borderRadius: '6px',
                fontSize: isMobile ? '0.85rem' : '0.9rem',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option value="new" style={{ background: '#1a1a1a' }}>Latest Episodes</option>
              <option value="popular" style={{ background: '#1a1a1a' }}>Most Popular</option>
              <option value="rating" style={{ background: '#1a1a1a' }}>Highest Rated</option>
            </select>
          </header>

          {ongoingAnime.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile 
                ? 'repeat(3, 1fr)' 
                : 'repeat(auto-fill, minmax(160px, 1fr))',
              gap: isMobile ? '12px' : '20px'
            }} role="list" itemScope itemType="https://schema.org/ItemList">
              <meta itemProp="numberOfItems" content={ongoingAnime.length} />
              {ongoingAnime.map((anime, index) => (
                <div 
                  key={anime.id}
                  role="listitem"
                  itemProp="itemListElement"
                  itemScope
                  itemType="https://schema.org/ListItem"
                >
                  <meta itemProp="position" content={index + 1} />
                  <AnimeCard anime={anime} />
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: isMobile ? '40px 20px' : '60px 20px'
            }} role="status">
              <Clock size={isMobile ? 48 : 64} style={{ color: '#666' }} aria-hidden="true" />
              <h3 style={{
                marginTop: '20px',
                color: '#999',
                fontSize: isMobile ? '1.1rem' : '1.3rem'
              }}>No ongoing anime found</h3>
              <p style={{
                color: '#666',
                fontSize: isMobile ? '0.85rem' : '0.95rem'
              }}>Check back later for new episodes!</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <nav 
              aria-label="Pagination Navigation"
              style={{
                display: 'flex',
                justifyContent: 'center',
                marginTop: isMobile ? '30px' : '50px'
              }}
            >
              <ul style={{
                listStyle: 'none',
                padding: 0,
                display: 'flex',
                gap: isMobile ? '6px' : '10px',
                flexWrap: 'wrap',
                justifyContent: 'center'
              }}>
                <li>
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                    aria-label="Go to previous page"
                    style={{
                      background: currentPage === 1 ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)',
                      color: currentPage === 1 ? '#666' : '#fff',
                      border: 'none',
                      padding: isMobile ? '8px 12px' : '10px 16px',
                      borderRadius: '6px',
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                      fontSize: isMobile ? '0.8rem' : '0.9rem',
                      fontWeight: '500',
                      transition: 'all 0.2s'
                    }}
                  >
                    {isMobile ? '«' : '« Previous'}
                  </button>
                </li>
                
                {/* Page Numbers */}
                {[...Array(Math.min(isMobile ? 3 : 5, totalPages))].map((_, idx) => {
                  const pageNum = currentPage > (isMobile ? 2 : 3) ? currentPage - (isMobile ? 1 : 2) + idx : idx + 1;
                  if (pageNum > totalPages) return null;
                  
                  return (
                    <li key={pageNum}>
                      <button
                        onClick={() => setCurrentPage(pageNum)}
                        aria-label={`Go to page ${pageNum}`}
                        aria-current={currentPage === pageNum ? 'page' : undefined}
                        style={{
                          background: currentPage === pageNum ? '#e50914' : 'rgba(255,255,255,0.1)',
                          color: '#fff',
                          border: 'none',
                          padding: isMobile ? '8px 12px' : '10px 16px',
                          borderRadius: '6px',
                          minWidth: isMobile ? '36px' : '44px',
                          cursor: 'pointer',
                          fontSize: isMobile ? '0.8rem' : '0.9rem',
                          fontWeight: currentPage === pageNum ? '600' : '500',
                          transition: 'all 0.2s'
                        }}
                      >
                        {pageNum}
                      </button>
                    </li>
                  );
                })}
                
                <li>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                    aria-label="Go to next page"
                    style={{
                      background: currentPage === totalPages ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)',
                      color: currentPage === totalPages ? '#666' : '#fff',
                      border: 'none',
                      padding: isMobile ? '8px 12px' : '10px 16px',
                      borderRadius: '6px',
                      cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                      fontSize: isMobile ? '0.8rem' : '0.9rem',
                      fontWeight: '500',
                      transition: 'all 0.2s'
                    }}
                  >
                    {isMobile ? '»' : 'Next »'}
                  </button>
                </li>
              </ul>
            </nav>
          )}

          {/* Additional SEO Content Section */}
          <aside style={{
            marginTop: isMobile ? '30px' : '50px',
            padding: isMobile ? '20px' : '30px',
            background: 'rgba(255,255,255,0.02)',
            borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.05)'
          }}>
            <h3 style={{
              fontSize: isMobile ? '1.1rem' : '1.3rem',
              fontWeight: '600',
              marginBottom: isMobile ? '12px' : '20px',
              color: '#28a745'
            }}>About Ongoing Anime Series</h3>
            <p style={{
              color: '#999',
              lineHeight: '1.8',
              fontSize: isMobile ? '0.85rem' : '0.95rem',
              marginBottom: isMobile ? '20px' : '30px'
            }}>
              Discover the latest ongoing anime series currently airing in Japan and around the world. 
              Our collection features popular shows with new episodes released weekly, including action-packed 
              shonen series, romantic comedies, thrilling mysteries, and epic fantasy adventures. Watch anime 
              with English subtitles and dubbed versions available for your convenience.
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
              gap: isMobile ? '20px' : '30px'
            }}>
              <div>
                <h4 style={{
                  fontSize: isMobile ? '0.95rem' : '1rem',
                  fontWeight: '600',
                  color: '#28a745',
                  marginBottom: '8px'
                }}>Weekly Updates</h4>
                <p style={{
                  color: '#666',
                  fontSize: isMobile ? '0.8rem' : '0.9rem',
                  lineHeight: '1.6',
                  margin: 0
                }}>
                  New episodes added as soon as they air in Japan
                </p>
              </div>
              <div>
                <h4 style={{
                  fontSize: isMobile ? '0.95rem' : '1rem',
                  fontWeight: '600',
                  color: '#28a745',
                  marginBottom: '8px'
                }}>HD Quality</h4>
                <p style={{
                  color: '#666',
                  fontSize: isMobile ? '0.8rem' : '0.9rem',
                  lineHeight: '1.6',
                  margin: 0
                }}>
                  Stream all anime in high definition quality
                </p>
              </div>
              <div>
                <h4 style={{
                  fontSize: isMobile ? '0.95rem' : '1rem',
                  fontWeight: '600',
                  color: '#28a745',
                  marginBottom: '8px'
                }}>Multiple Languages</h4>
                <p style={{
                  color: '#666',
                  fontSize: isMobile ? '0.8rem' : '0.9rem',
                  lineHeight: '1.6',
                  margin: 0
                }}>
                  English subs and dubs available for most series
                </p>
              </div>
            </div>
          </aside>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default OngoingPage;