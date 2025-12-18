import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Sparkles, Play, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AnimeCard from '../components/AnimeCard';
import { getSeries, getPopularAnime } from '../services/api';

const MarvelPage = () => {
  const navigate = useNavigate();
  const [marvelAnime, setMarvelAnime] = useState([]);
  const [allMarvelContent, setAllMarvelContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('rating');
  const itemsPerPage = 18;

  // SEO Configuration
  const siteUrl = 'https://dead-anime.vercel.app/'; // 🔴 REPLACE WITH YOUR DOMAIN
  const siteName = 'ToonVerse Haven'; // 🔴 REPLACE WITH YOUR SITE NAME

  // Dynamic SEO functions
  const getPageTitle = () => {
    let title = `Watch Marvel & Superhero Anime Online Free - HD Quality`;
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
    return `Browse ${sortText[sortBy]} Marvel and superhero anime online. Stream ${allMarvelContent.length}+ anime series featuring Spider-Man, Avengers, X-Men and more. Watch subbed and dubbed superhero anime free.`;
  };

  const getKeywords = () => {
    return 'marvel anime, superhero anime, spider-man anime, avengers anime, x-men anime, watch marvel online, marvel series, iron man anime, captain america anime, thor anime, hulk anime, wolverine anime, deadpool anime, superhero series online';
  };

  // Structured data for rich snippets
  const generateStructuredData = () => {
    if (marvelAnime.length === 0) return {};

    const itemList = marvelAnime.slice(0, 12).map((anime, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "TVSeries",
        "@id": `${siteUrl}/anime/${anime.slug}`,
        "name": anime.name,
        "image": anime.image,
        "url": `${siteUrl}/anime/${anime.slug}`,
        "genre": ["Animation", "Action", "Superhero"],
        ...(anime.rating && {
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": anime.rating,
            "bestRating": "10",
            "worstRating": "0",
            "ratingCount": anime.views || 100
          }
        }),
        ...(anime.release && { "datePublished": anime.release }),
        ...(anime.overview && { "description": anime.overview.substring(0, 200) }),
        ...(anime.episodes && { "numberOfEpisodes": anime.episodes })
      }
    }));

    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": "Marvel & Superhero Anime Collection",
      "description": `A curated collection of ${allMarvelContent.length} Marvel and superhero anime series available to watch online in HD quality`,
      "numberOfItems": allMarvelContent.length,
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
        "name": "Marvel & Superhero Anime",
        "item": `${siteUrl}/marvel`
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

  // Marvel/Superhero keywords for filtering
  const marvelKeywords = [
    'marvel', 'spider', 'iron man', 'avengers', 'x-men', 'superhero', 
    'captain america', 'thor', 'hulk', 'wolverine', 'deadpool', 
    'venom', 'black widow', 'doctor strange', 'guardians', 'ant-man',
    'fantastic four', 'daredevil', 'punisher', 'blade', 'ghost rider',
    'scarlet witch', 'loki', 'thanos', 'black panther', 'hawkeye',
    'nick fury', 'shield', 'hydra', 'infinity', 'mutant', 'stark',
    'peter parker', 'tony stark', 'steve rogers', 'bruce banner',
    'natasha romanoff', 'clint barton', 'vision', 'quicksilver'
  ];

  // Filter function to check if anime is Marvel-related
  const isMarvelContent = (anime) => {
    const searchText = `${anime.name} ${anime.overview}`.toLowerCase();
    return marvelKeywords.some(keyword => searchText.includes(keyword));
  };

  // FIXED: Handle anime card click - navigate to detail page using slug
  const handleAnimeClick = (slug) => {
    console.log('Navigating to anime:', slug);
    navigate(`/anime/${slug}`);
  };

  // Initial fetch of all Marvel content
  useEffect(() => {
    const fetchAllMarvelContent = async () => {
      setLoading(true);
      setInitialLoading(true);
      
      try {
        let allContent = [];
        const pagesToFetch = 10;
        const limitPerPage = 50;
        
        console.log(`🔍 Starting Marvel content search across ${pagesToFetch} pages...`);
        
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
        
        const marvelFiltered = allContent.filter(isMarvelContent);
        console.log(`⚡ Marvel items found: ${marvelFiltered.length}`);
        
        const uniqueMarvel = Array.from(
          new Map(marvelFiltered.map(item => [item.id, item])).values()
        );
        
        console.log(`✨ Unique Marvel items: ${uniqueMarvel.length}`);
        
        if (uniqueMarvel.length === 0) {
          console.warn('⚠️ No Marvel content found! Check your API data or keywords.');
        }
        
        setAllMarvelContent(uniqueMarvel);
      } catch (error) {
        console.error('❌ Error fetching Marvel content:', error);
        setAllMarvelContent([]);
      } finally {
        setLoading(false);
        setInitialLoading(false);
      }
    };

    fetchAllMarvelContent();
  }, []);

  // Handle sorting and pagination
  useEffect(() => {
    if (initialLoading) return;
    if (allMarvelContent.length === 0) {
      setMarvelAnime([]);
      setTotalPages(1);
      return;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    let sortedPosts = [...allMarvelContent];
    
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
    
    setMarvelAnime(paginatedItems);
    setTotalPages(calculatedTotalPages);
    
    console.log(`📄 Pagination: Page ${currentPage}/${calculatedTotalPages}, Showing ${paginatedItems.length} items`);
  }, [currentPage, sortBy, allMarvelContent, initialLoading]);

  if (loading) {
    return (
      <>
        <Helmet>
          <title>Loading Marvel Content... | {siteName}</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <div style={{ background: '#0a0a0a', minHeight: '100vh', color: '#fff' }}>
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
                  border: '4px solid rgba(229, 9, 20, 0.2)',
                  borderTop: '4px solid #e50914',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                <Sparkles 
                  size={32} 
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
                fontSize: '1.8rem', 
                fontWeight: '600',
                marginBottom: '10px',
                background: 'linear-gradient(135deg, #e50914 0%, #ff1744 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Loading Marvel Content...
              </h2>
              <p style={{ color: '#999', fontSize: '1rem' }}>
                Assembling your superhero collection
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
      <Helmet>
        {/* Primary Meta Tags */}
        <html lang="en" />
        <title>{getPageTitle()}</title>
        <meta name="title" content={getPageTitle()} />
        <meta name="description" content={getPageDescription()} />
        <meta name="keywords" content={getKeywords()} />
        <link rel="canonical" href={`${siteUrl}/marvel${currentPage > 1 ? `?page=${currentPage}` : ''}`} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${siteUrl}/marvel${currentPage > 1 ? `?page=${currentPage}` : ''}`} />
        <meta property="og:title" content={getPageTitle()} />
        <meta property="og:description" content={getPageDescription()} />
        <meta property="og:image" content={marvelAnime[0]?.image || `${siteUrl}/og-image.jpg`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={`${siteName} - Watch Marvel & Superhero Anime Online`} />
        <meta property="og:site_name" content={siteName} />
        <meta property="og:locale" content="en_US" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={`${siteUrl}/marvel${currentPage > 1 ? `?page=${currentPage}` : ''}`} />
        <meta name="twitter:title" content={getPageTitle()} />
        <meta name="twitter:description" content={getPageDescription()} />
        <meta name="twitter:image" content={marvelAnime[0]?.image || `${siteUrl}/og-image.jpg`} />
        <meta name="twitter:image:alt" content={`${siteName} - Watch Marvel & Superhero Anime Online`} />

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
          <link rel="prev" href={`${siteUrl}/marvel?page=${currentPage - 1}`} />
        )}
        {currentPage < totalPages && (
          <link rel="next" href={`${siteUrl}/marvel?page=${currentPage + 1}`} />
        )}
        <link rel="first" href={`${siteUrl}/marvel`} />
        {totalPages > 1 && (
          <link rel="last" href={`${siteUrl}/marvel?page=${totalPages}`} />
        )}

        {/* Structured Data */}
        {marvelAnime.length > 0 && (
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
      </Helmet>

      <div style={{ background: '#0a0a0a', minHeight: '100vh', color: '#fff' }}>
        <Navbar />

        {marvelAnime[0] && (
          <div style={{ 
            marginTop: '80px',
            position: 'relative',
            height: '500px',
            background: `linear-gradient(to right, rgba(10,10,10,0.95) 40%, rgba(10,10,10,0.3)), url(https://image.tmdb.org/t/p/original${marvelAnime[0].image?.backdrop})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}>
            <div className="container h-100">
              <div className="row h-100 align-items-center">
                <div className="col-lg-7">
                  <div className="badge mb-3 px-3 py-2" style={{ 
                    background: 'linear-gradient(135deg, #e50914 0%, #ff1744 100%)',
                    border: 'none'
                  }}>
                    <Sparkles size={14} className="me-1" />
                    Featured Marvel
                  </div>
                  <h1 className="display-3 fw-bold mb-3">
                    {marvelAnime[0].name}
                  </h1>
                  <div className="d-flex align-items-center gap-3 mb-3 flex-wrap">
                    <span className="badge px-3 py-2" style={{ 
                      background: 'rgba(229, 9, 20, 0.2)',
                      border: '1px solid #e50914',
                      color: '#fff'
                    }}>
                      <Star size={14} fill="#ffc107" color="#ffc107" className="me-1" />
                      {marvelAnime[0].rating}
                    </span>
                    <span style={{ color: '#999' }}>
                      {marvelAnime[0].year || (marvelAnime[0].release ? new Date(marvelAnime[0].release).getFullYear() : 'N/A')}
                    </span>
                    <span style={{ color: '#999' }}>{marvelAnime[0].type?.toUpperCase()}</span>
                    <span style={{ color: '#999' }}>{marvelAnime[0].episodes} Episodes</span>
                  </div>
                  <p className="lead mb-4" style={{ color: '#ccc', maxWidth: '600px' }}>
                    {marvelAnime[0].overview || 'Experience epic superhero adventures in this thrilling series.'}
                  </p>
                  <div style={{ marginTop: '2rem' }}>
                    <button 
                      className="btn btn-lg px-4"
                      style={{
                        background: 'linear-gradient(135deg, #e50914 0%, #ff1744 100%)',
                        border: 'none',
                        color: '#fff',
                        fontWeight: '600',
                        boxShadow: '0 4px 15px rgba(229, 9, 20, 0.4)'
                      }}
                      onClick={() => handleAnimeClick(marvelAnime[0].slug)}
                    >
                      <Play size={18} className="me-2" />
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="container py-5" style={{ marginTop: '3rem' }}>
          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
            <h2 className="fw-bold mb-0">
              <Sparkles size={28} className="me-2" style={{ color: '#e50914' }} />
              Marvel & Superhero Collection ({allMarvelContent.length} titles)
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
                width: 'auto',
                minWidth: '200px'
              }}
            >
              <option value="rating">Highest Rated</option>
              <option value="popular">Most Popular</option>
              <option value="new">Latest Release</option>
              <option value="name">A-Z</option>
            </select>
          </div>

          {marvelAnime.length > 0 ? (
            <div className="row g-4">
              {marvelAnime.map(anime => (
                <div 
                  key={anime.id} 
                  className="col-lg-2 col-md-3 col-sm-4 col-6"
                  onClick={() => handleAnimeClick(anime.slug)}
                  style={{ cursor: 'pointer' }}
                >
                  <AnimeCard anime={anime} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-5">
              <Sparkles size={64} style={{ color: '#666' }} />
              <h3 className="mt-3" style={{ color: '#999' }}>No Marvel content found</h3>
              <p style={{ color: '#666' }}>
                We couldn't find any Marvel or superhero anime in our database.
                <br />
                Try checking back later or browse other categories.
              </p>
            </div>
          )}

          {totalPages > 1 && marvelAnime.length > 0 && (
            <div className="d-flex justify-content-center align-items-center mt-5 gap-2 flex-wrap">
              <button
                className="btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(1)}
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

              <button
                className="btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
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
                      minWidth: '40px',
                      padding: '8px 12px',
                      fontWeight: currentPage === pageNum ? '700' : '400'
                    }}
                  >
                    {pageNum}
                  </button>
                ));
              })()}
              
              <button
                className="btn"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
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

              <button
                className="btn"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(totalPages)}
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
            </div>
          )}
          
          {marvelAnime.length > 0 && (
            <div style={{ 
              marginTop: '20px', 
              textAlign: 'center', 
              color: '#666', 
              fontSize: '0.9rem',
              padding: '10px',
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '8px'
            }}>
              Showing {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, allMarvelContent.length)} of {allMarvelContent.length} Marvel titles
              {totalPages > 1 && ` • Page ${currentPage} of ${totalPages}`}
            </div>
          )}
        </div>

        <Footer />
      </div>
    </>
  );
};

export default MarvelPage;