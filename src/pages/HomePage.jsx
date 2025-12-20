import React, { useState, useEffect } from 'react';
import { Play, TrendingUp, Star, ChevronRight, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AnimeCard from '../components/AnimeCard';
import { getPopularAnime, getSeries } from '../services/api';

const HomePage = () => {
  const [popularAnime, setPopularAnime] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  // Number of top anime to show in banner rotation
  const BANNER_SLIDES = 5;

  // SEO Configuration
  const siteName = "ToonVerse Haven";

  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      console.log('🔍 Fetching popular anime...'); // Debug log
      
      try {
        const popular = await getPopularAnime('month', 1, 18); // Fetch 18 popular anime
        
        console.log('📦 API Response:', popular); // Debug log
        console.log('📊 Posts:', popular.posts); // Debug log
        
        // Sort by rating (highest first) to show top anime at the beginning
        const sortedPosts = (popular.posts || []).sort((a, b) => {
          const ratingA = parseFloat(a.rating) || 0;
          const ratingB = parseFloat(b.rating) || 0;
          return ratingB - ratingA;
        });
        
        setPopularAnime(sortedPosts);
      } catch (error) {
        console.error('Error fetching popular anime:', error);
        setPopularAnime([]);
      }
      
      setLoading(false);
    };

    fetchData();
  }, []);

  // Auto-slide effect
  useEffect(() => {
    if (popularAnime.length === 0) return;

    const interval = setInterval(() => {
      nextSlide();
    }, isMobile ? 4000 : 2000); // Slower on mobile for better UX

    return () => clearInterval(interval);
  }, [popularAnime, currentSlide, isMobile]);

  const nextSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev + 1) % Math.min(BANNER_SLIDES, popularAnime.length));
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const prevSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => 
      prev === 0 ? Math.min(BANNER_SLIDES, popularAnime.length) - 1 : prev - 1
    );
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const goToSlide = (index) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide(index);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  // SEO: Generate structured data for the page
  const generateStructuredData = () => {
    const baseUrl = window.location.origin;
    const topAnime = popularAnime.slice(0, BANNER_SLIDES);
    
    return {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": `${siteName} - Watch Anime Online Free`,
      "url": baseUrl,
      "description": "Watch the best anime online for free. Stream trending anime series, latest episodes, and top-rated shows in HD quality.",
      "potentialAction": {
        "@type": "SearchAction",
        "target": `${baseUrl}/search?q={search_term_string}`,
        "query-input": "required name=search_term_string"
      },
      "publisher": {
        "@type": "Organization",
        "name": siteName,
        "url": baseUrl
      },
      "mainEntity": {
        "@type": "ItemList",
        "name": "Trending Anime",
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
            "numberOfEpisodes": anime.episodes
          }
        }))
      }
    };
  };

  // SEO: Dynamic meta tags based on content
  const generateMetaTags = () => {
    const baseUrl = window.location.origin;
    const topAnime = popularAnime.slice(0, 5);
    const animeNames = topAnime.map(a => a.name).join(', ');
    
    const title = `Watch Anime Online Free - ${siteName} | Trending Anime Series & Episodes`;
    const description = `Stream the best anime online for free! Watch trending shows including ${animeNames || 'popular series'}. HD quality, latest episodes, subbed & dubbed anime.`;
    const keywords = `watch anime online, anime streaming, free anime, ${animeNames}, anime episodes, subbed anime, dubbed anime, latest anime, trending anime, anime series`;
    
    return { title, description, keywords, baseUrl };
  };

  const { title, description, keywords, baseUrl } = generateMetaTags();

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
            <div className="loading-spinner-container" style={{
              position: 'relative',
              marginBottom: isMobile ? '20px' : '30px',
              display: 'inline-block'
            }}>
              <div className="loading-spinner" style={{
                width: isMobile ? '60px' : '80px',
                height: isMobile ? '60px' : '80px',
                border: `${isMobile ? '3px' : '4px'} solid rgba(229, 9, 20, 0.2)`,
                borderTop: `${isMobile ? '3px' : '4px'} solid #e50914`,
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              <Play 
                className="loading-play-icon"
                size={isMobile ? 24 : 32}
                fill="#e50914" 
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

            {/* Loading Text */}
            <h2 className="loading-title" style={{ 
              fontSize: isMobile ? '1.3rem' : '1.8rem',
              fontWeight: '600',
              marginBottom: '10px',
              background: 'linear-gradient(135deg, #e50914 0%, #ff1744 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Loading Anime...
            </h2>
            <p style={{ color: '#999', fontSize: isMobile ? '0.85rem' : '1rem' }}>
              Preparing the best content for you
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
    );
  }

  const bannerAnime = popularAnime.slice(0, BANNER_SLIDES);
  const featuredAnime = bannerAnime[currentSlide] || {};

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', color: '#fff' }}>
      <Navbar />

      {/* SEO: Semantic HTML with proper heading hierarchy */}
      <main>
        {/* Hero Banner Slider */}
        {featuredAnime.name && (
          <section 
            aria-label="Featured Anime Carousel"
            className="hero-banner"
            style={{ 
              marginTop: isMobile ? '60px' : '80px',
              position: 'relative',
              height: isMobile ? '450px' : isTablet ? '500px' : '600px',
              overflow: 'hidden'
            }}
          >
            {/* Slides Container */}
            <div style={{
              position: 'relative',
              height: '100%',
              width: '100%'
            }}>
              {bannerAnime.map((anime, index) => (
                <article
                  key={anime.id}
                  aria-hidden={currentSlide !== index}
                  itemScope
                  itemType="https://schema.org/TVSeries"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    opacity: currentSlide === index ? 1 : 0,
                    transition: 'opacity 0.5s ease-in-out',
                    background: isMobile
                      ? `linear-gradient(to bottom, rgba(10,10,10,0.6) 0%, rgba(10,10,10,0.95) 70%), url(https://image.tmdb.org/t/p/original${anime.image?.backdrop})`
                      : `linear-gradient(to right, rgba(10,10,10,0.95) 30%, rgba(10,10,10,0.3)), url(https://image.tmdb.org/t/p/original${anime.image?.backdrop})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    pointerEvents: currentSlide === index ? 'auto' : 'none'
                  }}
                >
                  <div style={{
                    maxWidth: '1400px',
                    margin: '0 auto',
                    padding: isMobile ? '0 20px' : '0 40px',
                    height: '100%',
                    display: 'flex',
                    alignItems: isMobile ? 'flex-end' : 'center',
                    paddingBottom: isMobile ? '60px' : '0'
                  }}>
                    <div style={{ width: '100%', maxWidth: isMobile ? '100%' : '700px' }}>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        background: '#e50914',
                        padding: isMobile ? '6px 12px' : '8px 16px',
                        borderRadius: '4px',
                        marginBottom: isMobile ? '12px' : '15px',
                        fontSize: isMobile ? '0.75rem' : '0.85rem',
                        fontWeight: '500',
                        animation: currentSlide === index ? 'fadeInUp 0.6s ease-out' : 'none'
                      }}>
                        <TrendingUp size={isMobile ? 12 : 14} />
                        Top #{index + 1}
                      </div>
                      <h1 
                        itemProp="name"
                        style={{
                          fontSize: isMobile ? '1.8rem' : isTablet ? '2.5rem' : '3rem',
                          fontWeight: '700',
                          marginBottom: isMobile ? '12px' : '15px',
                          lineHeight: '1.2',
                          animation: currentSlide === index ? 'fadeInUp 0.6s ease-out 0.1s both' : 'none'
                        }}
                      >
                        {anime.name}
                      </h1>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: isMobile ? '10px' : '15px',
                        marginBottom: isMobile ? '12px' : '15px',
                        flexWrap: 'wrap',
                        fontSize: isMobile ? '0.75rem' : '0.9rem',
                        animation: currentSlide === index ? 'fadeInUp 0.6s ease-out 0.2s both' : 'none'
                      }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          background: '#e50914',
                          padding: isMobile ? '4px 10px' : '6px 12px',
                          borderRadius: '4px'
                        }}>
                          <Star size={isMobile ? 12 : 14} fill="#ffc107" color="#ffc107" />
                          <span itemProp="aggregateRating" itemScope itemType="https://schema.org/AggregateRating">
                            <meta itemProp="ratingValue" content={anime.rating} />
                            <meta itemProp="bestRating" content="10" />
                            {anime.rating}
                          </span>
                        </span>
                        <time itemProp="datePublished" dateTime={anime.release} style={{ color: '#999' }}>
                          {anime.year || (anime.release ? new Date(anime.release).getFullYear() : 'N/A')}
                        </time>
                        <span style={{ color: '#999' }}>{anime.type?.toUpperCase()}</span>
                        {!isMobile && (
                          <span itemProp="numberOfEpisodes" style={{ color: '#999' }}>
                            {anime.episodes} Episodes
                          </span>
                        )}
                      </div>
                      {!isMobile && (
                        <p 
                          itemProp="description"
                          style={{ 
                            color: '#ccc', 
                            maxWidth: '600px',
                            fontSize: isTablet ? '0.95rem' : '1rem',
                            lineHeight: '1.6',
                            marginBottom: '20px',
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            animation: currentSlide === index ? 'fadeInUp 0.6s ease-out 0.3s both' : 'none'
                          }}
                        >
                          {anime.overview}
                        </p>
                      )}
                      <div style={{
                        display: 'flex',
                        gap: isMobile ? '10px' : '15px',
                        flexWrap: 'wrap',
                        animation: currentSlide === index ? 'fadeInUp 0.6s ease-out 0.4s both' : 'none'
                      }}>
                        <button 
                          aria-label={`Watch ${anime.name} now`}
                          style={{ 
                            background: '#e50914', 
                            border: 'none',
                            color: '#fff',
                            fontWeight: '600',
                            padding: isMobile ? '10px 20px' : '12px 30px',
                            borderRadius: '6px',
                            fontSize: isMobile ? '0.85rem' : '0.95rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'transform 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                          <Play size={isMobile ? 16 : 20} fill="#fff" />
                          Watch Now
                        </button>
                        <Link 
                          to={`/anime/${anime.slug}`}
                          aria-label={`More information about ${anime.name}`}
                          style={{ 
                            background: 'rgba(255,255,255,0.1)',
                            border: '1px solid rgba(255,255,255,0.3)',
                            color: '#fff',
                            fontWeight: '500',
                            padding: isMobile ? '10px 20px' : '12px 30px',
                            borderRadius: '6px',
                            fontSize: isMobile ? '0.85rem' : '0.95rem',
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                            e.currentTarget.style.transform = 'scale(1.05)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                            e.currentTarget.style.transform = 'scale(1)';
                          }}
                        >
                          More Info
                        </Link>
                      </div>
                    </div>
                  </div>
                  <meta itemProp="url" content={`${baseUrl}/anime/${anime.slug}`} />
                  <meta itemProp="image" content={anime.image?.poster ? `https://image.tmdb.org/t/p/w500${anime.image.poster}` : ""} />
                </article>
              ))}
            </div>
            {/* Navigation Arrows */}
            {!isMobile && (
              <>
                <button
                  onClick={prevSlide}
                  disabled={isTransitioning}
                  aria-label="Previous anime"
                  style={{
                    position: 'absolute',
                    left: '20px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(0, 0, 0, 0.5)',
                    border: 'none',
                    color: '#fff',
                    width: isTablet ? '45px' : '50px',
                    height: isTablet ? '45px' : '50px',
                    borderRadius: '50%',
                    cursor: isTransitioning ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s',
                    opacity: 0.7,
                    zIndex: 10
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(229, 9, 20, 0.8)';
                    e.currentTarget.style.opacity = '1';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(0, 0, 0, 0.5)';
                    e.currentTarget.style.opacity = '0.7';
                  }}
                >
                  <ChevronLeft size={isTablet ? 20 : 24} />
                </button>

                <button
                  onClick={nextSlide}
                  disabled={isTransitioning}
                  aria-label="Next anime"
                  style={{
                    position: 'absolute',
                    right: '20px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(0, 0, 0, 0.5)',
                    border: 'none',
                    color: '#fff',
                    width: isTablet ? '45px' : '50px',
                    height: isTablet ? '45px' : '50px',
                    borderRadius: '50%',
                    cursor: isTransitioning ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s',
                    opacity: 0.7,
                    zIndex: 10
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(229, 9, 20, 0.8)';
                    e.currentTarget.style.opacity = '1';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(0, 0, 0, 0.5)';
                    e.currentTarget.style.opacity = '0.7';
                  }}
                >
                  <ChevronRight size={isTablet ? 20 : 24} />
                </button>
              </>
            )}

            {/* Slide Indicators */}
            <nav 
              aria-label="Carousel pagination"
              style={{
                position: 'absolute',
                bottom: isMobile ? '20px' : '30px',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: isMobile ? '6px' : '10px',
                zIndex: 10
              }}
            >
              {bannerAnime.map((anime, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  disabled={isTransitioning}
                  aria-label={`Go to slide ${index + 1}: ${anime.name}`}
                  aria-current={currentSlide === index ? 'true' : 'false'}
                  style={{
                    width: currentSlide === index ? (isMobile ? '30px' : '40px') : (isMobile ? '10px' : '12px'),
                    height: isMobile ? '10px' : '12px',
                    borderRadius: '6px',
                    background: currentSlide === index ? '#e50914' : 'rgba(255, 255, 255, 0.5)',
                    border: 'none',
                    cursor: isTransitioning ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s',
                    padding: 0
                  }}
                  onMouseEnter={(e) => {
                    if (currentSlide !== index) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.8)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentSlide !== index) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.5)';
                    }
                  }}
                />
              ))}
            </nav>
          </section>
        )}

        {/* Trending Section */}
        <section style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: isMobile ? '30px 15px' : isTablet ? '40px 30px' : '50px 40px'
        }} aria-labelledby="trending-heading">
          <header style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: isMobile ? '20px' : '30px'
          }}>
            <h2 id="trending-heading" style={{
              fontSize: isMobile ? '1.3rem' : isTablet ? '1.6rem' : '1.8rem',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              margin: 0
            }}>
              <TrendingUp size={isMobile ? 24 : 28} style={{ color: '#e50914' }} />
              Trending Now
            </h2>
          </header>

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile 
              ? 'repeat(3, 1fr)' 
              : isTablet
                ? 'repeat(4, 1fr)'
                : 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: isMobile ? '12px' : isTablet ? '16px' : '20px'
          }} role="list">
            {popularAnime.map(anime => (
              <div key={anime.id} role="listitem">
                <AnimeCard anime={anime} />
              </div>
            ))}
          </div>

          {/* Load More Button */}
          <div style={{ 
            textAlign: 'center', 
            marginTop: isMobile ? '30px' : isTablet ? '40px' : '50px' 
          }}>
            <Link 
              to="/ongoing" 
              aria-label="Load more anime series"
              style={{ 
                background: 'linear-gradient(135deg, #e50914 0%, #ff1744 100%)', 
                border: 'none',
                color: '#fff',
                fontWeight: '600',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: isMobile ? '12px 24px' : isTablet ? '14px 32px' : '16px 40px',
                borderRadius: '8px',
                fontSize: isMobile ? '0.9rem' : '1rem',
                boxShadow: '0 4px 15px rgba(229, 9, 20, 0.3)',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(229, 9, 20, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(229, 9, 20, 0.3)';
              }}
            >
              Load More Anime
              <ChevronRight size={isMobile ? 18 : 20} />
            </Link>
          </div>
        </section>
      </main>

      <Footer />

      {/* Animations */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

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

        /* Smooth transitions for all interactive elements */
        button, a {
          -webkit-tap-highlight-color: transparent;
        }

        /* Responsive hero banner height adjustments */
        .hero-banner {
          transition: height 0.3s ease;
        }

        /* Mobile touch improvements */
        @media (max-width: 767px) {
          button, a {
            min-height: 44px;
          }
        }

        /* Tablet adjustments */
        @media (min-width: 768px) and (max-width: 1023px) {
          .hero-banner {
            height: 500px !important;
          }
        }

        /* Desktop optimizations */
        @media (min-width: 1024px) {
          .hero-banner {
            height: 600px !important;
          }
        }

        /* Ultra-wide screen optimizations */
        @media (min-width: 1920px) {
          .hero-banner {
            height: 700px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default HomePage;