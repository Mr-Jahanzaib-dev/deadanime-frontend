import React, { useState, useEffect } from 'react';
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
  const [isMobile, setIsMobile] = useState(false);
  const itemsPerPage = 18;

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
    if (!anime || !anime.name) return false;
    const searchText = `${anime.name} ${anime.overview || ''}`.toLowerCase();
    return marvelKeywords.some(keyword => searchText.includes(keyword));
  };

  // Handle anime card click - navigate to detail page using slug
  const handleAnimeClick = (slug) => {
    console.log('Navigating to anime:', slug);
    navigate(`/anime/${slug}`);
  };

  // Check mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Initial fetch of all Marvel content
  useEffect(() => {
    const fetchAllMarvelContent = async () => {
      setLoading(true);
      setInitialLoading(true);
      
      try {
        let allContent = [];
        const pagesToFetch = 5; // Reduced from 10 to 5 for faster loading
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
          if (data && data.posts && Array.isArray(data.posts)) {
            allContent = [...allContent, ...data.posts];
          }
        });
        
        console.log(`📦 Total items fetched: ${allContent.length}`);
        
        // Filter Marvel content
        const marvelFiltered = allContent.filter(isMarvelContent);
        console.log(`⚡ Marvel items found: ${marvelFiltered.length}`);
        
        // Remove duplicates
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

  // Simple SEO - Update page title
  useEffect(() => {
    document.title = `Marvel & Superhero Anime - Page ${currentPage} | ToonVerse Haven`;
    
    return () => {
      document.title = 'ToonVerse Haven';
    };
  }, [currentPage]);

  if (loading) {
    return (
      <>
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
                <Sparkles 
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
                Loading Marvel Content...
              </h2>
              <p style={{ color: '#999', fontSize: isMobile ? '0.9rem' : '1rem' }}>
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
      <div style={{ background: '#0a0a0a', minHeight: '100vh', color: '#fff' }}>
        <Navbar />

        {marvelAnime.length > 0 && marvelAnime[0] && (
          <div style={{ 
            position: 'relative',
            height: isMobile ? '350px' : '500px',
            background: marvelAnime[0].image?.backdrop 
              ? `linear-gradient(to right, rgba(10,10,10,0.95) 40%, rgba(10,10,10,0.3)), url(https://image.tmdb.org/t/p/original${marvelAnime[0].image.backdrop})`
              : 'linear-gradient(135deg, #e50914 0%, #ff1744 100%)',
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
                    <Sparkles size={isMobile ? 12 : 14} className="me-1" />
                    Featured Marvel
                  </div>
                  <h1 className={isMobile ? "h2 fw-bold mb-3" : "display-3 fw-bold mb-3"} style={{
                    fontSize: isMobile ? '1.5rem' : 'clamp(2rem, 5vw, 3rem)'
                  }}>
                    {marvelAnime[0].name}
                  </h1>
                  <div className="d-flex align-items-center gap-3 mb-3 flex-wrap">
                    {marvelAnime[0].rating && (
                      <span className="badge px-3 py-2" style={{ 
                        background: 'rgba(229, 9, 20, 0.2)',
                        border: '1px solid #e50914',
                        color: '#fff'
                      }}>
                        <Star size={14} fill="#ffc107" color="#ffc107" className="me-1" />
                        {marvelAnime[0].rating}
                      </span>
                    )}
                    <span style={{ color: '#999' }}>
                      {marvelAnime[0].year || (marvelAnime[0].release ? new Date(marvelAnime[0].release).getFullYear() : 'N/A')}
                    </span>
                    {marvelAnime[0].type && (
                      <span style={{ color: '#999' }}>{marvelAnime[0].type.toUpperCase()}</span>
                    )}
                    {marvelAnime[0].episodes && (
                      <span style={{ color: '#999' }}>{marvelAnime[0].episodes} Episodes</span>
                    )}
                  </div>
                  <p className={isMobile ? "mb-4" : "lead mb-4"} style={{ 
                    color: '#ccc', 
                    maxWidth: '600px',
                    fontSize: isMobile ? '0.9rem' : '1.1rem',
                    lineHeight: '1.5'
                  }}>
                    {marvelAnime[0].overview || 'Experience epic superhero adventures in this thrilling series.'}
                  </p>
                  <div style={{ marginTop: '2rem' }}>
                    <button 
                      className={isMobile ? "btn px-3 py-2" : "btn btn-lg px-4"}
                      style={{
                        background: 'linear-gradient(135deg, #e50914 0%, #ff1744 100%)',
                        border: 'none',
                        color: '#fff',
                        fontWeight: '600',
                        boxShadow: '0 4px 15px rgba(229, 9, 20, 0.4)',
                        fontSize: isMobile ? '0.9rem' : '1rem'
                      }}
                      onClick={() => handleAnimeClick(marvelAnime[0].slug)}
                    >
                      <Play size={isMobile ? 16 : 18} className="me-2" />
                      View Details
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
              <Sparkles size={isMobile ? 24 : 28} className="me-2" style={{ color: '#e50914' }} />
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

          {marvelAnime.length > 0 ? (
            <div className="row g-3 g-md-4">
              {marvelAnime.map(anime => (
                <div 
                  key={anime.id} 
                  className="col-xl-2 col-lg-3 col-md-4 col-sm-6 col-6"
                  onClick={() => handleAnimeClick(anime.slug)}
                  style={{ cursor: 'pointer' }}
                >
                  <AnimeCard anime={anime} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-5">
              <Sparkles size={isMobile ? 48 : 64} style={{ color: '#666' }} />
              <h3 className="mt-3" style={{ color: '#999', fontSize: isMobile ? '1.25rem' : '1.5rem' }}>No Marvel content found</h3>
              <p style={{ color: '#666', fontSize: isMobile ? '0.85rem' : '1rem' }}>
                We couldn't find any Marvel or superhero anime in our database.
                <br />
                Try checking back later or browse other categories.
              </p>
            </div>
          )}

          {totalPages > 1 && marvelAnime.length > 0 && (
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
          
          {marvelAnime.length > 0 && (
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
              Showing {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, allMarvelContent.length)} of {allMarvelContent.length} Marvel titles
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

          .h-100 {
            min-height: 300px;
          }

          .form-select {
            width: 100% !important;
            margin-top: 10px;
          }

          .d-flex.justify-content-between {
            flex-direction: column;
            align-items: flex-start !important;
            gap: 15px !important;
          }
        }

        @media (min-width: 768px) and (max-width: 991.98px) {
          .container {
            padding-left: 20px !important;
            padding-right: 20px !important;
          }
        }

        @media (min-width: 1200px) {
          .container {
            max-width: 1400px;
          }
        }

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

export default MarvelPage;