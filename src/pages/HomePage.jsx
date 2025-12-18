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

  // Number of top anime to show in banner rotation
  const BANNER_SLIDES = 5;

  // SEO Configuration
  const siteName = "ToonVerse Haven";

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
    }, 2000); // Change slide every 2 seconds

    return () => clearInterval(interval);
  }, [popularAnime, currentSlide]);

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
          <title>Loading... | {siteName}</title>
          <meta name="robots" content="noindex" />
        <Navbar />
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: 'calc(100vh - 80px)',
          marginTop: '80px'
        }}>
          <div style={{ textAlign: 'center' }}>
            {/* Animated Logo/Icon */}
            <div className="loading-spinner-container" style={{
              position: 'relative',
              marginBottom: '30px',
              display: 'inline-block'
            }}>
              <div className="loading-spinner" style={{
                width: '80px',
                height: '80px',
                border: '4px solid rgba(229, 9, 20, 0.2)',
                borderTop: '4px solid #e50914',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              <Play 
                className="loading-play-icon"
                size={32} 
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
              fontSize: '1.8rem', 
              fontWeight: '600',
              marginBottom: '10px',
              background: 'linear-gradient(135deg, #e50914 0%, #ff1744 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Loading Anime...
            </h2>
            <p style={{ color: '#999', fontSize: '1rem' }}>
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
                    width: '12px',
                    height: '12px',
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

          /* Responsive loading styles */
          @media (max-width: 767.98px) {
            .loading-spinner-container {
              margin-bottom: 20px !important;
            }

            .loading-spinner {
              width: 60px !important;
              height: 60px !important;
              border-width: 3px !important;
            }

            .loading-play-icon {
              width: 24px !important;
              height: 24px !important;
            }

            .loading-title {
              font-size: 1.4rem !important;
              margin-bottom: 8px !important;
            }
          }

          @media (max-width: 575.98px) {
            .loading-spinner {
              width: 50px !important;
              height: 50px !important;
              border-width: 2px !important;
            }

            .loading-play-icon {
              width: 20px !important;
              height: 20px !important;
            }

            .loading-title {
              font-size: 1.2rem !important;
            }
          }

          /* Responsive Banner Height */
          @media (max-width: 767.98px) {
            .hero-banner {
              height: 400px !important;
            }
          }

          @media (max-width: 575.98px) {
            .hero-banner {
              height: 350px !important;
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
      {/* SEO: Comprehensive Meta Tags */}
      
        {/* Primary Meta Tags */}
        <title>{title}</title>
        <meta name="title" content={title} />
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={baseUrl} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={featuredAnime.image?.backdrop ? `https://image.tmdb.org/t/p/original${featuredAnime.image.backdrop}` : `${baseUrl}/og-image.jpg`} />
        <meta property="og:site_name" content={siteName} />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={baseUrl} />
        <meta property="twitter:title" content={title} />
        <meta property="twitter:description" content={description} />
        <meta property="twitter:image" content={featuredAnime.image?.backdrop ? `https://image.tmdb.org/t/p/original${featuredAnime.image.backdrop}` : `${baseUrl}/twitter-image.jpg`} />
        
        {/* Additional SEO Tags */}
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="language" content="English" />
        <meta name="revisit-after" content="1 days" />
        <meta name="author" content={siteName} />
        <link rel="canonical" href={baseUrl} />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(generateStructuredData())}
        </script>
      <Navbar />

      {/* SEO: Semantic HTML with proper heading hierarchy */}
      <main>
        {/* Hero Banner Slider */}
        {featuredAnime.name && (
          <section 
            aria-label="Featured Anime Carousel"
            className="hero-banner"
            style={{ 
              marginTop: '80px',
              position: 'relative',
              height: '600px',
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
                    background: `linear-gradient(to right, rgba(10,10,10,0.95) 30%, rgba(10,10,10,0.3)), url(https://image.tmdb.org/t/p/original${anime.image?.backdrop})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    pointerEvents: currentSlide === index ? 'auto' : 'none'
                  }}
                >
                  <div className="container h-100">
                    <div className="row h-100 align-items-center">
                      <div className="col-lg-6">
                        <div className="badge mb-3 px-3 py-2" style={{ 
                          background: '#e50914',
                          animation: currentSlide === index ? 'fadeInUp 0.6s ease-out' : 'none'
                        }}>
                          <TrendingUp size={14} className="me-1" />
                          Top #{index + 1}
                        </div>
                        <h1 
                          className="display-3 fw-bold mb-3" 
                          itemProp="name"
                          style={{
                            animation: currentSlide === index ? 'fadeInUp 0.6s ease-out 0.1s both' : 'none'
                          }}
                        >
                          {anime.name}
                        </h1>
                        <div className="d-flex align-items-center gap-3 mb-3 flex-wrap" style={{
                          animation: currentSlide === index ? 'fadeInUp 0.6s ease-out 0.2s both' : 'none'
                        }}>
                          <span className="badge px-3 py-2" style={{ background: '#e50914' }}>
                            <Star size={14} fill="#ffc107" color="#ffc107" className="me-1" />
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
                          <span itemProp="numberOfEpisodes" style={{ color: '#999' }}>{anime.episodes} Episodes</span>
                        </div>
                        <p 
                          className="lead mb-4" 
                          itemProp="description"
                          style={{ 
                            color: '#ccc', 
                            maxWidth: '500px',
                            animation: currentSlide === index ? 'fadeInUp 0.6s ease-out 0.3s both' : 'none'
                          }}
                        >
                          {anime.overview}
                        </p>
                        <div className="d-flex gap-3 flex-wrap" style={{
                          animation: currentSlide === index ? 'fadeInUp 0.6s ease-out 0.4s both' : 'none'
                        }}>
                          <button 
                            className="btn btn-lg px-5" 
                            aria-label={`Watch ${anime.name} now`}
                            style={{ 
                              background: '#e50914', 
                              border: 'none',
                              color: '#fff',
                              fontWeight: '600'
                            }}
                          >
                            <Play size={20} className="me-2" fill="#fff" />
                            Watch Now
                          </button>
                          <Link 
                            to={`/anime/${anime.slug}`} 
                            className="btn btn-lg btn-outline-light px-4" 
                            aria-label={`More information about ${anime.name}`}
                            style={{ textDecoration: 'none' }}
                          >
                            More Info
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  <meta itemProp="url" content={`${baseUrl}/anime/${anime.slug}`} />
                  <meta itemProp="image" content={anime.image?.poster ? `https://image.tmdb.org/t/p/w500${anime.image.poster}` : ""} />
                </article>
              ))}
            </div>

            {/* Navigation Arrows */}
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
                width: '50px',
                height: '50px',
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
              <ChevronLeft size={24} />
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
                width: '50px',
                height: '50px',
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
              <ChevronRight size={24} />
            </button>

            {/* Slide Indicators */}
            <nav 
              aria-label="Carousel pagination"
              style={{
                position: 'absolute',
                bottom: '30px',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: '10px',
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
                    width: currentSlide === index ? '40px' : '12px',
                    height: '12px',
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
        <section className="container py-5" aria-labelledby="trending-heading">
          <header className="d-flex justify-content-between align-items-center mb-4">
            <h2 id="trending-heading" className="fw-bold">
              <TrendingUp size={28} className="me-2" style={{ color: '#e50914' }} />
              Trending Now
            </h2>
          </header>

          <div className="row g-4" role="list">
            {popularAnime.map(anime => (
              <div key={anime.id} className="col-lg-2 col-md-3 col-sm-4 col-6" role="listitem">
                <AnimeCard anime={anime} />
              </div>
            ))}
          </div>

          {/* Load More Button */}
          <div className="text-center mt-5">
            <Link 
              to="/ongoing" 
              className="btn btn-lg px-5 py-3"
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
              <ChevronRight size={20} />
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

        /* Responsive Banner Height */
        @media (max-width: 767.98px) {
          .hero-banner {
            height: 400px !important;
          }
        }

        @media (max-width: 575.98px) {
          .hero-banner {
            height: 350px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default HomePage;