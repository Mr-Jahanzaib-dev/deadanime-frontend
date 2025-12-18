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

  // SEO Configuration
  const siteName = 'ToonVerse Haven';

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
        <Helmet>
          <title>Loading Ongoing Anime... | {siteName}</title>
          <meta name="robots" content="noindex" />
        </Helmet>
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
            <div style={{
              position: 'relative',
              marginBottom: '30px',
              display: 'inline-block'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                border: '4px solid rgba(201, 41, 41, 0.2)',
                borderTop: '4px solid #cb1a38ff',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              <Clock 
                size={32} 
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
              fontSize: '1.8rem', 
              fontWeight: '600',
              marginBottom: '10px',
              background: 'linear-gradient(135deg, #c52020ff 0%, #c92020ff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Loading Ongoing Series...
            </h2>
            <p style={{ color: '#999', fontSize: '1rem' }}>
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
                    width: '12px',
                    height: '12px',
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
      {/* SEO: Comprehensive Meta Tags */}
      <Helmet>
        {/* Primary Meta Tags */}
        <title>{pageTitle}</title>
        <meta name="title" content={pageTitle} />
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${baseUrl}/ongoing${currentPage > 1 ? `?page=${currentPage}` : ''}`} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:site_name" content={siteName} />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={`${baseUrl}/ongoing${currentPage > 1 ? `?page=${currentPage}` : ''}`} />
        <meta property="twitter:title" content={pageTitle} />
        <meta property="twitter:description" content={description} />
        <meta property="twitter:image" content={ogImage} />
        
        {/* Additional SEO Tags */}
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <link rel="canonical" href={`${baseUrl}/ongoing${currentPage > 1 ? `?page=${currentPage}` : ''}`} />
        
        {/* Pagination Tags */}
        {currentPage > 1 && <link rel="prev" href={`${baseUrl}/ongoing${currentPage > 2 ? `?page=${currentPage - 1}` : ''}`} />}
        {currentPage < totalPages && <link rel="next" href={`${baseUrl}/ongoing?page=${currentPage + 1}`} />}
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(generateStructuredData())}
        </script>
      </Helmet>

      <Navbar />

      <main>
        {/* Breadcrumb Navigation for SEO */}
        <nav aria-label="breadcrumb" className="container" style={{ paddingTop: '100px', paddingBottom: '10px' }}>
          <ol className="breadcrumb" style={{ background: 'transparent', padding: 0, margin: 0 }}>
            <li className="breadcrumb-item">
              <a href="/" style={{ color: '#999', textDecoration: 'none' }}>Home</a>
            </li>
            <li className="breadcrumb-item active" style={{ color: '#fff' }} aria-current="page">
              Ongoing Anime
            </li>
          </ol>
        </nav>

        {/* Hero Banner with Top Rated Anime */}
        {ongoingAnime[0] && (
          <section 
            aria-labelledby="featured-ongoing"
            style={{ 
              position: 'relative',
              height: '500px',
              background: `linear-gradient(to right, rgba(10,10,10,0.95) 40%, rgba(10,10,10,0.3)), url(https://image.tmdb.org/t/p/original${ongoingAnime[0].image?.backdrop})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <article 
              itemScope 
              itemType="https://schema.org/TVSeries"
              className="container h-100"
            >
              <div className="row h-100 align-items-center">
                <div className="col-lg-7">
                  <div className="badge mb-3 px-3 py-2" style={{ background: '#28a745' }}>
                    <Clock size={14} className="me-1" />
                    Top Rated Ongoing
                  </div>
                  <h1 
                    id="featured-ongoing"
                    className="display-3 fw-bold mb-3"
                    itemProp="name"
                  >
                    {ongoingAnime[0].name}
                  </h1>
                  <div className="d-flex align-items-center gap-3 mb-3 flex-wrap">
                    <span className="badge px-3 py-2" style={{ background: '#28a745' }}>
                      <Star size={14} fill="#ffc107" color="#ffc107" className="me-1" />
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
                      {ongoingAnime[0].episodes} Episodes
                    </span>
                  </div>
                  <p 
                    className="lead mb-4" 
                    itemProp="description"
                    style={{ color: '#ccc', maxWidth: '600px' }}
                  >
                    {ongoingAnime[0].overview}
                  </p>
                  <meta itemProp="url" content={`${baseUrl}/anime/${ongoingAnime[0].slug}`} />
                  <meta itemProp="image" content={ongoingAnime[0].image?.poster ? `https://image.tmdb.org/t/p/w500${ongoingAnime[0].image.poster}` : ""} />
                </div>
              </div>
            </article>
          </section>
        )}
        {/* Main Content Section - Continuation from Part 1 */}
        <section className="container py-5" aria-labelledby="anime-list-heading">
          <header className="d-flex justify-content-between align-items-center mb-4">
            <h2 id="anime-list-heading" className="fw-bold">
              <Clock size={28} className="me-2" style={{ color: '#28a745' }} />
              All Ongoing Anime ({ongoingAnime.length} Series)
            </h2>
            <label htmlFor="sort-select" className="visually-hidden">Sort anime by</label>
            <select 
              id="sort-select"
              className="form-select" 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort anime by"
              style={{ 
                background: 'rgba(255,255,255,0.1)', 
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#fff',
                width: 'auto'
              }}
            >
              <option value="new">Latest Episodes</option>
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
            </select>
          </header>

          {ongoingAnime.length > 0 ? (
            <div className="row g-4" role="list" itemScope itemType="https://schema.org/ItemList">
              <meta itemProp="numberOfItems" content={ongoingAnime.length} />
              {ongoingAnime.map((anime, index) => (
                <div 
                  key={anime.id} 
                  className="col-lg-2 col-md-3 col-sm-4 col-6"
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
            <div className="text-center py-5" role="status">
              <Clock size={64} style={{ color: '#666' }} aria-hidden="true" />
              <h3 className="mt-3" style={{ color: '#999' }}>No ongoing anime found</h3>
              <p style={{ color: '#666' }}>Check back later for new episodes!</p>
            </div>
          )}

          {/* Pagination with SEO-friendly structure */}
          {totalPages > 1 && (
            <nav 
              aria-label="Pagination Navigation"
              className="d-flex justify-content-center mt-5"
            >
              <ul className="pagination gap-2" style={{ listStyle: 'none', padding: 0, display: 'flex' }}>
                <li>
                  <button
                    className="btn"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                    aria-label="Go to previous page"
                    style={{
                      background: currentPage === 1 ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)',
                      color: currentPage === 1 ? '#666' : '#fff',
                      border: 'none',
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                    }}
                  >
                    « Previous
                  </button>
                </li>
                
                {/* Page Numbers */}
                {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                  const pageNum = currentPage > 3 ? currentPage - 2 + idx : idx + 1;
                  if (pageNum > totalPages) return null;
                  
                  return (
                    <li key={pageNum}>
                      <button
                        className="btn"
                        onClick={() => setCurrentPage(pageNum)}
                        aria-label={`Go to page ${pageNum}`}
                        aria-current={currentPage === pageNum ? 'page' : undefined}
                        style={{
                          background: currentPage === pageNum ? '#e50914' : 'rgba(255,255,255,0.1)',
                          color: '#fff',
                          border: 'none',
                          minWidth: '40px'
                        }}
                      >
                        {pageNum}
                      </button>
                    </li>
                  );
                })}
                
                <li>
                  <button
                    className="btn"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                    aria-label="Go to next page"
                    style={{
                      background: currentPage === totalPages ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)',
                      color: currentPage === totalPages ? '#666' : '#fff',
                      border: 'none',
                      cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                    }}
                  >
                    Next »
                  </button>
                </li>
              </ul>
            </nav>
          )}

          {/* Additional SEO Content Section */}
          <aside className="mt-5 p-4" style={{ 
            background: 'rgba(255,255,255,0.02)', 
            borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.05)'
          }}>
            <h3 className="h5 mb-3" style={{ color: '#28a745' }}>About Ongoing Anime Series</h3>
            <p style={{ color: '#999', lineHeight: '1.8' }}>
              Discover the latest ongoing anime series currently airing in Japan and around the world. 
              Our collection features popular shows with new episodes released weekly, including action-packed 
              shonen series, romantic comedies, thrilling mysteries, and epic fantasy adventures. Watch anime 
              with English subtitles and dubbed versions available for your convenience.
            </p>
            <div className="row mt-4">
              <div className="col-md-4 mb-3">
                <h4 className="h6" style={{ color: '#28a745' }}>Weekly Updates</h4>
                <p style={{ color: '#666', fontSize: '0.9rem' }}>
                  New episodes added as soon as they air in Japan
                </p>
              </div>
              <div className="col-md-4 mb-3">
                <h4 className="h6" style={{ color: '#28a745' }}>HD Quality</h4>
                <p style={{ color: '#666', fontSize: '0.9rem' }}>
                  Stream all anime in high definition quality
                </p>
              </div>
              <div className="col-md-4 mb-3">
                <h4 className="h6" style={{ color: '#28a745' }}>Multiple Languages</h4>
                <p style={{ color: '#666', fontSize: '0.9rem' }}>
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