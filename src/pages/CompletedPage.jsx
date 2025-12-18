import React, { useState, useEffect } from 'react';
import { CheckCircle, Play, Star } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AnimeCard from '../components/AnimeCard';
import { getSeries, getPopularAnime } from '../services/api';

const CompletedPage = () => {
  const navigate = useNavigate();
  const [completedAnime, setCompletedAnime] = useState([]);
  const [allCompleted, setAllCompleted] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('rating');
  const itemsPerPage = 18;

  // SEO Configuration
  const siteName = 'ToonVerse Haven';

  const handleAnimeClick = (anime) => {
    navigate(`/anime/${anime.slug}`);
  };

  useEffect(() => {
    const fetchAllCompleted = async () => {
      setLoading(true);
      setInitialLoading(true);
      
      try {
        let allContent = [];
        const pagesToFetch = 10;
        const limitPerPage = 50;
        
        console.log(`✅ Starting completed anime fetch across ${pagesToFetch} pages...`);
        
        const fetchPromises = [];
        
        for (let page = 1; page <= pagesToFetch; page++) {
          fetchPromises.push(
            getSeries(page, limitPerPage).catch(err => {
              console.error(`Error fetching series page ${page}:`, err);
              return { posts: [] };
            })
          );
          
          fetchPromises.push(
            getPopularAnime('month', page, limitPerPage).catch(err => {
              console.error(`Error fetching popular page ${page}:`, err);
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
        
        console.log(`📦 Total items fetched: ${allContent.length}`);
        
        const completedFiltered = allContent.filter(anime => {
          return anime.complete !== null && anime.complete !== '0000-00-00';
        });
        
        console.log(`✅ Completed anime found: ${completedFiltered.length}`);
        
        const uniqueCompleted = Array.from(
          new Map(completedFiltered.map(item => [item.id, item])).values()
        );
        
        console.log(`✨ Unique completed anime: ${uniqueCompleted.length}`);
        
        if (uniqueCompleted.length === 0) {
          console.warn('⚠️ No completed anime found! Check your API data.');
        }
        
        setAllCompleted(uniqueCompleted);
      } catch (error) {
        console.error('❌ Error fetching completed anime:', error);
        setAllCompleted([]);
      } finally {
        setLoading(false);
        setInitialLoading(false);
      }
    };

    fetchAllCompleted();
  }, []);

  useEffect(() => {
    if (initialLoading) return;
    if (allCompleted.length === 0) {
      setCompletedAnime([]);
      setTotalPages(1);
      return;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    let sortedPosts = [...allCompleted];
    
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
          const dateA = new Date(a.complete || 0);
          const dateB = new Date(b.complete || 0);
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
    
    setCompletedAnime(paginatedItems);
    setTotalPages(calculatedTotalPages);
    
    console.log(`📄 Pagination: Page ${currentPage}/${calculatedTotalPages}, Showing ${paginatedItems.length} items`);
  }, [currentPage, sortBy, allCompleted, initialLoading]);

  // SEO: Generate structured data
  const generateStructuredData = () => {
    const baseUrl = window.location.origin;
    const topAnime = completedAnime.slice(0, 10);
    
    return {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "Completed Anime Series - Finished Shows Ready to Binge",
      "url": `${baseUrl}/completed`,
      "description": "Watch completed anime series from start to finish. Browse finished shows with all episodes available for binge-watching in HD quality.",
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
            "name": "Completed Anime",
            "item": `${baseUrl}/completed`
          }
        ]
      },
      "mainEntity": {
        "@type": "ItemList",
        "name": "Completed Anime Series",
        "numberOfItems": allCompleted.length,
        "itemListElement": topAnime.map((anime, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "item": {
            "@type": "TVSeries",
            "name": anime.name,
            "url": `${baseUrl}/anime/${anime.slug}`,
            "image": anime.image?.poster ? `https://image.tmdb.org/t/p/w500${anime.image.poster}` : "",
            "description": anime.overview || "Complete anime series ready to watch",
            "aggregateRating": anime.rating ? {
              "@type": "AggregateRating",
              "ratingValue": anime.rating,
              "bestRating": "10",
              "worstRating": "0"
            } : undefined,
            "datePublished": anime.release,
            "numberOfEpisodes": anime.episodes,
            "endDate": anime.complete,
            "contentRating": "PG-13"
          }
        }))
      }
    };
  };

  // SEO: Dynamic meta tags
  const generateMetaTags = () => {
    const baseUrl = window.location.origin;
    const topAnime = completedAnime.slice(0, 5);
    const animeNames = topAnime.map(a => a.name).join(', ');
    const featuredAnime = completedAnime[0] || {};
    
    const pageTitle = currentPage > 1 
      ? `Completed Anime Series - Page ${currentPage} | ${siteName}`
      : `Completed Anime Series - Finished Shows Ready to Binge | ${siteName}`;
    
    const description = currentPage > 1
      ? `Browse completed anime - Page ${currentPage}. Watch finished series including ${animeNames}. All episodes available for binge-watching.`
      : `Watch ${allCompleted.length}+ completed anime series with all episodes available. Binge-watch ${animeNames} and more finished shows in HD quality.`;
    
    const keywords = `completed anime, finished anime, anime to binge watch, ${animeNames}, complete anime series, ended anime, finished shows, binge worthy anime, full anime series`;
    
    const ogImage = featuredAnime.image?.backdrop 
      ? `https://image.tmdb.org/t/p/original${featuredAnime.image.backdrop}`
      : `${baseUrl}/og-completed.jpg`;
    
    return { pageTitle, description, keywords, baseUrl, ogImage };
  };

  const { pageTitle, description, keywords, baseUrl, ogImage } = generateMetaTags();

  if (loading) {
    return (
      <div style={{ background: '#0a0a0a', minHeight: '100vh', color: '#fff' }}>
        <Helmet>
          <title>Loading Completed Anime... | {siteName}</title>
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
            <div style={{
              position: 'relative',
              marginBottom: '30px',
              display: 'inline-block'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                border: '4px solid rgba(76, 175, 80, 0.2)',
                borderTop: '4px solid #4CAF50',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              <CheckCircle 
                size={32} 
                color="#4CAF50" 
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
              fontSize: '1.8rem', 
              fontWeight: '600',
              marginBottom: '10px',
              background: 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Loading Completed Series...
            </h2>
            <p style={{ color: '#999', fontSize: '1rem' }}>
              Gathering all finished anime
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
                    width: '12px',
                    height: '12px',
                    background: '#4CAF50',
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
        <title>{pageTitle}</title>
        <meta name="title" content={pageTitle} />
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${baseUrl}/completed${currentPage > 1 ? `?page=${currentPage}` : ''}`} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:site_name" content={siteName} />
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={`${baseUrl}/completed${currentPage > 1 ? `?page=${currentPage}` : ''}`} />
        <meta property="twitter:title" content={pageTitle} />
        <meta property="twitter:description" content={description} />
        <meta property="twitter:image" content={ogImage} />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <link rel="canonical" href={`${baseUrl}/completed${currentPage > 1 ? `?page=${currentPage}` : ''}`} />
        {currentPage > 1 && <link rel="prev" href={`${baseUrl}/completed${currentPage > 2 ? `?page=${currentPage - 1}` : ''}`} />}
        {currentPage < totalPages && <link rel="next" href={`${baseUrl}/completed?page=${currentPage + 1}`} />}
        <script type="application/ld+json">
          {JSON.stringify(generateStructuredData())}
        </script>
      </Helmet>

      <Navbar />
      <main>

        {/* Hero Banner */}
        {completedAnime[0] && (
          <section 
            aria-labelledby="featured-completed"
            style={{ 
              position: 'relative',
              height: '500px',
              background: `linear-gradient(to right, rgba(10,10,10,0.95) 40%, rgba(10,10,10,0.3)), url(https://image.tmdb.org/t/p/original${completedAnime[0].image?.backdrop})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <article itemScope itemType="https://schema.org/TVSeries" className="container h-100">
              <div className="row h-100 align-items-center">
                <div className="col-lg-7">
                  <div className="badge mb-3 px-3 py-2" style={{ 
                    background: 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)',
                    border: 'none'
                  }}>
                    <CheckCircle size={14} className="me-1" />
                    Completed Series
                  </div>
                  <h1 
                    id="featured-completed"
                    className="display-3 fw-bold mb-3"
                    itemProp="name"
                  >
                    {completedAnime[0].name}
                  </h1>
                  <div className="d-flex align-items-center gap-3 mb-3 flex-wrap">
                    <span className="badge px-3 py-2" style={{ 
                      background: 'rgba(76, 175, 80, 0.2)',
                      border: '1px solid #4CAF50',
                      color: '#fff'
                    }}>
                      <Star size={14} fill="#ffc107" color="#ffc107" className="me-1" />
                      <span itemProp="aggregateRating" itemScope itemType="https://schema.org/AggregateRating">
                        <meta itemProp="ratingValue" content={completedAnime[0].rating} />
                        <meta itemProp="bestRating" content="10" />
                        {completedAnime[0].rating}
                      </span>
                    </span>
                    <time itemProp="datePublished" dateTime={completedAnime[0].release} style={{ color: '#999' }}>
                      {completedAnime[0].year || (completedAnime[0].release ? new Date(completedAnime[0].release).getFullYear() : 'N/A')}
                    </time>
                    <span style={{ color: '#999' }}>{completedAnime[0].type?.toUpperCase()}</span>
                    <span itemProp="numberOfEpisodes" style={{ color: '#999' }}>
                      {completedAnime[0].episodes} Episodes
                    </span>
                    {completedAnime[0].complete && completedAnime[0].complete !== '0000-00-00' && (
                      <time itemProp="endDate" dateTime={completedAnime[0].complete} style={{ color: '#4CAF50' }}>
                        ✓ Completed {new Date(completedAnime[0].complete).getFullYear()}
                      </time>
                    )}
                  </div>
                  <p className="lead mb-4" itemProp="description" style={{ color: '#ccc', maxWidth: '600px' }}>
                    {completedAnime[0].overview || 'Watch this complete series now!'}
                  </p>
                  <div style={{ marginTop: '2rem' }}>
                    <button 
                      className="btn btn-lg px-4"
                      aria-label={`View details for ${completedAnime[0].name}`}
                      style={{
                        background: 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)',
                        border: 'none',
                        color: '#fff',
                        fontWeight: '600',
                        boxShadow: '0 4px 15px rgba(76, 175, 80, 0.4)'
                      }}
                      onClick={() => handleAnimeClick(completedAnime[0])}
                    >
                      <Play size={18} className="me-2" />
                      View Details
                    </button>
                  </div>
                  <meta itemProp="url" content={`${baseUrl}/anime/${completedAnime[0].slug}`} />
                  <meta itemProp="image" content={completedAnime[0].image?.poster ? `https://image.tmdb.org/t/p/w500${completedAnime[0].image.poster}` : ""} />
                </div>
              </div>
            </article>
          </section>
        )}

        {/* Main Content */}
        <section className="container py-5" style={{ marginTop: '3rem' }} aria-labelledby="anime-list-heading">
          <header className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
            <h2 id="anime-list-heading" className="fw-bold mb-0">
              <CheckCircle size={28} className="me-2" style={{ color: '#4CAF50' }} />
              Completed Series ({allCompleted.length} titles)
            </h2>
            <label htmlFor="sort-select" className="visually-hidden">Sort anime by</label>
            <select 
              id="sort-select"
              className="form-select" 
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="Sort completed anime by"
              style={{ 
                background: 'rgba(255,255,255,0.1)', 
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#fff',
                width: 'auto',
                minWidth: '200px'
              }}
            >
              <option value="rating">Highest Rated</option>
              <option value="popular">Most Popular</option>
              <option value="new">Recently Completed</option>
              <option value="name">A-Z</option>
            </select>
          </header>

          {completedAnime.length > 0 ? (
            <>
              <div style={{ 
                marginBottom: '20px', 
                padding: '12px 20px', 
                background: 'rgba(76, 175, 80, 0.1)',
                borderRadius: '8px',
                border: '1px solid rgba(76, 175, 80, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <CheckCircle size={18} color="#4CAF50" aria-hidden="true" />
                <span style={{ color: '#4CAF50', fontWeight: '500' }}>
                  All series on this page are fully completed and ready to binge!
                </span>
              </div>
              <div className="row g-4" role="list" itemScope itemType="https://schema.org/ItemList">
                <meta itemProp="numberOfItems" content={completedAnime.length} />
                {completedAnime.map((anime, index) => (
                  <div 
                    key={anime.id} 
                    className="col-lg-2 col-md-3 col-sm-4 col-6"
                    onClick={() => handleAnimeClick(anime)}
                    role="listitem"
                    itemProp="itemListElement"
                    itemScope
                    itemType="https://schema.org/ListItem"
                    style={{ cursor: 'pointer' }}
                  >
                    <meta itemProp="position" content={((currentPage - 1) * itemsPerPage) + index + 1} />
                    <AnimeCard anime={anime} />
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-5" role="status">
              <CheckCircle size={64} style={{ color: '#666' }} aria-hidden="true" />
              <h3 className="mt-3" style={{ color: '#999' }}>No completed anime found</h3>
              <p style={{ color: '#666' }}>
                We couldn't find any completed anime in our database.
                <br />
                Try checking back later or browse other categories.
              </p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && completedAnime.length > 0 && (
            <nav aria-label="Pagination Navigation" className="d-flex justify-content-center align-items-center mt-5">
              <ul className="pagination gap-2 flex-wrap" style={{ listStyle: 'none', padding: 0, display: 'flex' }}>
                <li>
                  <button
                    className="btn"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(1)}
                    aria-label="Go to first page"
                    style={{
                      background: currentPage === 1 ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)',
                      color: currentPage === 1 ? '#666' : '#fff',
                      border: 'none',
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                      padding: '8px 16px'
                    }}
                  >
                    «« First
                  </button>
                </li>

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
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                      padding: '8px 16px'
                    }}
                  >
                    « Previous
                  </button>
                </li>
                
                {(() => {
                  const pageNumbers = [];
                  const maxPagesToShow = 5;
                  let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
                  let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
                  
                  if (endPage - startPage < maxPagesToShow - 1) {
                    startPage = Math.max(1, endPage - maxPagesToShow + 1);
                  }
                  
                  for (let i = startPage; i <= endPage; i++) {
                    pageNumbers.push(i);
                  }
                  
                  return pageNumbers.map(pageNum => (
                    <li key={pageNum}>
                      <button
                        className="btn"
                        onClick={() => setCurrentPage(pageNum)}
                        aria-label={`Go to page ${pageNum}`}
                        aria-current={currentPage === pageNum ? 'page' : undefined}
                        style={{
                          background: currentPage === pageNum 
                            ? 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)'
                            : 'rgba(255,255,255,0.1)',
                          color: '#fff',
                          border: currentPage === pageNum ? '2px solid #66BB6A' : 'none',
                          minWidth: '40px',
                          padding: '8px 12px',
                          fontWeight: currentPage === pageNum ? '700' : '400'
                        }}
                      >
                        {pageNum}
                      </button>
                    </li>
                  ));
                })()}
                
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
                      cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                      padding: '8px 16px'
                    }}
                  >
                    Next »
                  </button>
                </li>

                <li>
                  <button
                    className="btn"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(totalPages)}
                    aria-label="Go to last page"
                    style={{
                      background: currentPage === totalPages ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)',
                      color: currentPage === totalPages ? '#666' : '#fff',
                      border: 'none',
                      cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                      padding: '8px 16px'
                    }}
                  >
                    Last »»
                  </button>
                </li>
              </ul>
            </nav>
          )}
          
          {completedAnime.length > 0 && (
            <div style={{ 
              marginTop: '20px', 
              textAlign: 'center', 
              color: '#666', 
              fontSize: '0.9rem',
              padding: '10px',
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '8px'
            }}>
              Showing {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, allCompleted.length)} of {allCompleted.length} completed series
              {totalPages > 1 && ` • Page ${currentPage} of ${totalPages}`}
            </div>
          )}

          {/* SEO Content Section */}
          <aside className="mt-5 p-4" style={{ 
            background: 'rgba(255,255,255,0.02)', 
            borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.05)'
          }}>
            <h3 className="h5 mb-3" style={{ color: '#4CAF50' }}>Why Watch Completed Anime?</h3>
            <p style={{ color: '#999', lineHeight: '1.8' }}>
              Discover {allCompleted.length}+ completed anime series perfect for binge-watching. 
              All episodes are available from start to finish with no waiting for new releases. 
              Our collection includes finished classics, recently ended series, and beloved shows 
              with complete storylines. Watch with English subtitles and dubs available.
            </p>
            <div className="row mt-4">
              <div className="col-md-4 mb-3">
                <h4 className="h6" style={{ color: '#4CAF50' }}>Complete Stories</h4>
                <p style={{ color: '#666', fontSize: '0.9rem' }}>
                  Every series has concluded with all episodes available
                </p>
              </div>
              <div className="col-md-4 mb-3">
                <h4 className="h6" style={{ color: '#4CAF50' }}>Perfect for Binging</h4>
                <p style={{ color: '#666', fontSize: '0.9rem' }}>
                  Watch entire series from beginning to end at your own pace
                </p>
              </div>
              <div className="col-md-4 mb-3">
                <h4 className="h6" style={{ color: '#4CAF50' }}>High Quality Streaming</h4>
                <p style={{ color: '#666', fontSize: '0.9rem' }}>
                  All completed series available in HD with multiple language options
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

export default CompletedPage;