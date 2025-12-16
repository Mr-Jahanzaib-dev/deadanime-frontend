import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Clock, Calendar, Play, Download, ChevronDown, ChevronUp, Tv, Film } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getAnimeInfo, getSeasonInfo, getEpisodes } from '../services/api';

// ==================== UTILITY FUNCTIONS ====================
const getImageUrl = (path, size = 'w500') => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  if (path.startsWith('/')) return `https://image.tmdb.org/t/p/${size}${path}`;
  return `https://dbase.deaddrive.icu/${path}`;
};

const getFallbackImage = () => 
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="450"%3E%3Crect fill="%23222" width="300" height="450"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="18" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3ENo Image%3C/text%3E%3C/svg%3E';

const isMovie = (type) => type?.toLowerCase() === 'movie';

const getYear = (animeData) => 
  animeData.year || (animeData.release ? new Date(animeData.release).getFullYear() : 'N/A');

// ==================== ANIMATION STYLES ====================
const AnimationStyles = () => (
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
      0%, 80%, 100% { transform: scale(0); opacity: 0.5; }
      40% { transform: scale(1); opacity: 1; }
    }
  `}</style>
);

// ==================== LOADING COMPONENT ====================
const LoadingSpinner = ({ size = 80 }) => (
  <div style={{
    position: 'relative',
    marginBottom: '30px',
    display: 'inline-block'
  }}>
    <div style={{
      width: `${size}px`,
      height: `${size}px`,
      border: '4px solid rgba(229, 9, 20, 0.2)',
      borderTop: '4px solid #e50914',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }} />
    <Play 
      size={size * 0.4} 
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
);

const LoadingDots = () => (
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
);

const LoadingScreen = () => (
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
        <LoadingSpinner />
        <h2 style={{ 
          fontSize: '1.8rem', 
          fontWeight: '600',
          marginBottom: '10px',
          background: 'linear-gradient(135deg, #e50914 0%, #ff1744 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Loading Anime Details...
        </h2>
        <p style={{ color: '#999', fontSize: '1rem' }}>
          Fetching information about this anime
        </p>
        <LoadingDots />
      </div>
    </div>
    <AnimationStyles />
  </div>
);

// ==================== BUTTON COMPONENTS ====================
const GradientButton = ({ onClick, icon: Icon, text, gradient, className = '', disabled = false }) => (
  <button 
    className={`btn ${className}`}
    onClick={onClick}
    disabled={disabled}
    style={{
      background: gradient,
      border: 'none',
      color: '#fff',
      fontWeight: '600',
      boxShadow: `0 4px 15px ${gradient.includes('e50914') ? 'rgba(229, 9, 20, 0.4)' : 'rgba(34, 197, 94, 0.4)'}`,
      opacity: disabled ? 0.5 : 1,
      cursor: disabled ? 'not-allowed' : 'pointer'
    }}
  >
    {Icon && <Icon size={18} className="me-2" />}
    {text}
  </button>
);

// ==================== INFO DISPLAY COMPONENTS ====================
const InfoItem = ({ label, value, children }) => (
  <div className="mb-2">
    <small style={{ color: '#999' }}>{label}</small>
    {children || <div className="text-white">{value}</div>}
  </div>
);

const InfoBadge = ({ icon: Icon, text, color = '#e50914' }) => (
  <div className="d-flex align-items-center">
    <Icon size={18} className="me-2" style={{ color }} />
    <span>{text}</span>
  </div>
);

const Badge = ({ children, variant = 'secondary' }) => {
  const variants = {
    secondary: 'bg-secondary',
    success: 'bg-success',
    warning: 'bg-warning text-dark',
    info: 'bg-info'
  };

  return (
    <span className={`badge ${variants[variant]} px-3 py-2`}>
      {children}
    </span>
  );
};

// ==================== QUICK INFO BOX COMPONENT ====================
const QuickInfoBox = ({ animeData }) => {
  const contentIsMovie = isMovie(animeData.type);
  
  return (
    <div className="mt-4 p-3" style={{
      background: 'rgba(255,255,255,0.05)',
      borderRadius: '10px',
      border: '1px solid rgba(255,255,255,0.1)'
    }}>
      <h6 className="fw-bold mb-3" style={{ color: '#e50914' }}>Quick Info</h6>
      
      <InfoItem label="Status:">
        <Badge variant={animeData.complete ? 'secondary' : 'success'}>
          {animeData.complete ? 'Completed' : 'Ongoing'}
        </Badge>
      </InfoItem>

      {!contentIsMovie && <InfoItem label="Episodes:" value={animeData.episodes || 'N/A'} />}
      
      <InfoItem label="Rating:">
        <div>
          <Star size={14} fill="#ffc107" color="#ffc107" className="me-1" />
          <span className="text-white">{animeData.rating || 'N/A'}</span>
        </div>
      </InfoItem>

      <InfoItem label="Type:" value={animeData.type?.toUpperCase()} />
      <InfoItem label="Year:" value={getYear(animeData)} />
      
      {contentIsMovie && animeData.duration && (
        <InfoItem label="Duration:" value={`${animeData.duration} min`} />
      )}
    </div>
  );
};

// ==================== ANIME POSTER COMPONENT ====================
const AnimePoster = ({ animeData, onWatchClick, onDownloadClick }) => (
  <div className="col-lg-3 col-md-4 mb-4">
    <div style={{
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
      border: '3px solid rgba(229, 9, 20, 0.3)'
    }}>
      <img 
        src={getImageUrl(animeData.image?.poster)} 
        alt={animeData.name} 
        style={{ width: '100%', display: 'block' }}
        onError={(e) => { e.target.src = getFallbackImage(); }}
      />
    </div>

    <GradientButton
      onClick={onWatchClick}
      icon={Play}
      text="Watch Now"
      gradient="linear-gradient(135deg, #e50914 0%, #ff1744 100%)"
      className="w-100 mt-3 py-3"
    />

    <GradientButton
      onClick={onDownloadClick}
      icon={Download}
      text="Download"
      gradient="linear-gradient(135deg, #22c55e 0%, #16a34a 100%)"
      className="w-100 mt-2 py-3"
    />

    <QuickInfoBox animeData={animeData} />
  </div>
);

// ==================== ANIME HEADER COMPONENT ====================
const AnimeHeader = ({ animeData }) => {
  const contentIsMovie = isMovie(animeData.type);
  
  return (
    <div>
      <h1 className="display-5 fw-bold mb-3">
        {contentIsMovie && <Film size={32} className="me-2" style={{ display: 'inline', marginBottom: '6px', color: '#e50914' }} />}
        {animeData.name}
      </h1>
      <p className="lead mb-4" style={{ color: '#ccc' }}>
        {animeData.subOrDub} | {animeData.type?.toUpperCase()}
        {contentIsMovie && <span className="badge bg-info ms-2">Movie</span>}
      </p>

      <div className="d-flex flex-wrap gap-3 mb-4">
        <InfoBadge icon={Calendar} text={getYear(animeData)} />
        {!contentIsMovie && <InfoBadge icon={Tv} text={`${animeData.episodes || 'N/A'} Episodes`} />}
        <InfoBadge icon={Clock} text={animeData.complete ? 'Completed' : 'Ongoing'} />
        <div className="d-flex align-items-center">
          <Star size={18} fill="#ffc107" color="#ffc107" className="me-2" />
          <span className="fw-bold">{animeData.rating}</span>
        </div>
      </div>
    </div>
  );
};

// ==================== EPISODE CARD COMPONENT ====================
const EpisodeCard = ({ episode, onWatch, onDownload }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="col-md-6">
      <div 
        className="p-3" 
        style={{
          background: isHovered ? 'rgba(229, 9, 20, 0.1)' : 'rgba(255,255,255,0.05)',
          borderRadius: '8px',
          border: `1px solid ${isHovered ? '#e50914' : 'rgba(255,255,255,0.1)'}`,
          transition: 'all 0.3s',
          cursor: 'pointer'
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="d-flex justify-content-between align-items-center">
          <div style={{ flex: 1 }}>
            <div className="fw-bold">Episode {episode.number}</div>
            <small style={{ color: '#999' }}>{episode.name}</small>
            {episode.note && (
              <div><small style={{ color: '#ffc107' }}>{episode.note}</small></div>
            )}
          </div>
          <div className="d-flex gap-2">
            <button 
              className="btn btn-sm" 
              onClick={(e) => {
                e.stopPropagation();
                onWatch();
              }}
              style={{
                background: '#e50914',
                color: '#fff',
                border: 'none',
                padding: '6px 12px'
              }}
            >
              <Play size={14} className="me-1" />
              Watch
            </button>
            <button 
              className="btn btn-sm" 
              onClick={(e) => {
                e.stopPropagation();
                onDownload();
              }}
              style={{
                background: '#22c55e',
                color: '#fff',
                border: 'none',
                padding: '6px 12px'
              }}
            >
              <Download size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== EPISODE LIST COMPONENT ====================
const EpisodeList = ({ episodes, animeSlug, onNavigate, isMovieContent }) => {
  const [showAll, setShowAll] = useState(false);
  const displayedEpisodes = showAll ? episodes : episodes.slice(0, 6);

  if (isMovieContent) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <Film size={48} style={{ color: '#e50914', marginBottom: '15px' }} />
        <h5 className="fw-bold mb-2">This is a Movie</h5>
        <p style={{ color: '#999' }}>Movies don't have episodes. Use the watch or download buttons above.</p>
      </div>
    );
  }

  if (episodes.length === 0) {
    return <p style={{ color: '#999' }}>No episodes available</p>;
  }

  return (
    <div>
      <h5 className="fw-bold mb-3">Episode List ({episodes.length})</h5>
      <div className="row g-3">
        {displayedEpisodes.map((episode) => (
          <EpisodeCard 
            key={episode.id} 
            episode={episode}
            onWatch={() => onNavigate(`/watch/${animeSlug}/${episode.id}`)}
            onDownload={() => onNavigate(`/download/${animeSlug}/${episode.id}`)}
          />
        ))}
      </div>
      
      {episodes.length > 6 && (
        <button
          className="btn w-100 mt-3"
          onClick={() => setShowAll(!showAll)}
          style={{
            background: 'rgba(255,255,255,0.1)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.2)'
          }}
        >
          {showAll ? (
            <><ChevronUp size={18} className="me-2" /> Show Less</>
          ) : (
            <><ChevronDown size={18} className="me-2" /> Show All Episodes ({episodes.length})</>
          )}
        </button>
      )}
    </div>
  );
};

// ==================== TAB CONTENT COMPONENTS ====================
const InfoTab = ({ animeData }) => (
  <div>
    <h5 className="fw-bold mb-3">Series Information</h5>
    <ul style={{ color: '#ccc', lineHeight: '2' }}>
      <li><strong>Full Name:</strong> {animeData.name}</li>
      <li><strong>Rating:</strong> {animeData.rating}</li>
      <li><strong>Type:</strong> {animeData.type?.toUpperCase()}</li>
      <li><strong>Episodes:</strong> {animeData.episodes || 'N/A'}</li>
      <li><strong>Year:</strong> {getYear(animeData)}</li>
      <li><strong>Release Date:</strong> {animeData.release}</li>
      {animeData.complete && <li><strong>Completed:</strong> {animeData.complete}</li>}
      <li><strong>Views:</strong> {animeData.views?.toLocaleString()}</li>
      <li><strong>Sub/Dub:</strong> {animeData.subOrDub}</li>
    </ul>
  </div>
);

const StorylineTab = ({ overview }) => (
  <div>
    <h5 className="fw-bold mb-3">Storyline</h5>
    <p style={{ color: '#ccc', lineHeight: '1.8' }}>
      {overview || 'No description available.'}
    </p>
  </div>
);

// ==================== TAB NAVIGATION ====================
const TabButton = ({ active, onClick, label }) => (
  <button
    className="btn"
    onClick={onClick}
    style={{
      background: active ? '#e50914' : 'rgba(255,255,255,0.1)',
      color: '#fff',
      border: 'none',
      fontWeight: active ? '600' : '400',
      textTransform: 'capitalize'
    }}
  >
    {label}
  </button>
);

const TabNavigation = ({ activeTab, setActiveTab, tabs }) => (
  <div className="d-flex gap-2 mb-3 flex-wrap">
    {tabs.map(tab => (
      <TabButton
        key={tab.id}
        active={activeTab === tab.id}
        onClick={() => setActiveTab(tab.id)}
        label={tab.label}
      />
    ))}
  </div>
);

// ==================== CONTENT SECTION ====================
const ContentSection = ({ title, children, customStyles = {} }) => (
  <div className="mb-4" style={customStyles}>
    {title && <h6 className="fw-bold mb-2" style={{ color: '#e50914' }}>{title}</h6>}
    {children}
  </div>
);

// ==================== MAIN COMPONENT ====================
const AnimeDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [animeData, setAnimeData] = useState(null);
  const [seasons, setSeasons] = useState([]);
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  useEffect(() => {
    const fetchAnimeData = async () => {
      setLoading(true);
      
      try {
        const anime = await getAnimeInfo(id);
        
        if (anime) {
          setAnimeData(anime);
          
          const seasonData = await getSeasonInfo(anime.id);
          setSeasons(seasonData.seasons || []);
          
          if (seasonData.seasons && seasonData.seasons.length > 0) {
            const episodeData = await getEpisodes(seasonData.seasons[0].id);
            setEpisodes(episodeData || []);
          }
        }
      } catch (error) {
        console.error('Error fetching anime data:', error);
      }
      
      setLoading(false);
    };

    fetchAnimeData();
  }, [id]);

  const handleNavigation = (path, type = 'watch') => {
    try {
      const slug = animeData?.slug || id;
      const contentIsMovie = isMovie(animeData?.type);
      
      if (contentIsMovie) {
        navigate(`/${type}/${slug}`);
      } else if (episodes.length > 0) {
        navigate(`/${type}/${slug}/${episodes[0].id}`);
      } else {
        alert(`No episodes available to ${type}`);
      }
    } catch (error) {
      console.error(`Error in handle${type}:`, error);
      alert('An error occurred. Please try again.');
    }
  };

  const handleWatchClick = () => handleNavigation('watch', 'watch');
  const handleDownloadClick = () => handleNavigation('download', 'download');

  if (loading) return <LoadingScreen />;

  if (!animeData) {
    return (
      <div style={{ background: '#0a0a0a', minHeight: '100vh', color: '#fff' }}>
        <Navbar />
        <div className="container text-center" style={{ marginTop: '200px' }}>
          <h2>Anime not found</h2>
          <p style={{ color: '#999' }}>The anime you're looking for doesn't exist or has been removed.</p>
        </div>
        <Footer />
      </div>
    );
  }

  const tabs = [
    { id: 'info', label: 'Series Info' },
    { id: 'storyline', label: 'Storyline' },
    { id: 'episodes', label: isMovie(animeData?.type) ? 'Content Info' : 'Episodes' }
  ];

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', color: '#fff' }}>
      <Navbar />

      {/* Cover Banner */}
      <div style={{
        marginTop: '80px',
        height: '400px',
        background: `linear-gradient(to bottom, rgba(10,10,10,0.3), rgba(10,10,10,1)), url(${getImageUrl(animeData.image?.backdrop, 'original')})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }} />

      <div className="container" style={{ marginTop: '-200px', position: 'relative', zIndex: 10 }}>
        <div className="row">
          <AnimePoster 
            animeData={animeData} 
            onWatchClick={handleWatchClick}
            onDownloadClick={handleDownloadClick}
          />

          <div className="col-lg-9 col-md-8">
            <div className="p-4" style={{
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <AnimeHeader animeData={animeData} />

              {/* Action Buttons */}
              <div className="d-flex flex-wrap gap-3 mb-4">
                <GradientButton
                  onClick={handleWatchClick}
                  icon={Play}
                  text="Watch Online"
                  gradient="linear-gradient(135deg, #e50914 0%, #ff1744 100%)"
                  className="btn-lg px-4"
                />
                <GradientButton
                  onClick={handleDownloadClick}
                  icon={Download}
                  text="Download All"
                  gradient="linear-gradient(135deg, #22c55e 0%, #16a34a 100%)"
                  className="btn-lg px-4"
                />
              </div>

              {animeData.duration && (
                <ContentSection title="Duration:">
                  <span className="badge px-3 py-2" style={{ background: 'rgba(229, 9, 20, 0.2)', color: '#fff' }}>
                    {animeData.duration} min/ep
                  </span>
                </ContentSection>
              )}

              {animeData.age?.short_name && (
                <ContentSection title="Age Rating:">
                  <Badge variant="warning">{animeData.age.short_name}</Badge>
                  {animeData.age.description && (
                    <small className="ms-2" style={{ color: '#999' }}>
                      {animeData.age.description}
                    </small>
                  )}
                </ContentSection>
              )}

              {!isMovie(animeData?.type) && seasons.length > 0 && (
                <ContentSection title={`Seasons (${seasons.length}):`}>
                  <div className="d-flex flex-wrap gap-2">
                    {seasons.map((season, idx) => (
                      <Badge key={idx} variant="secondary">Season {season.num}</Badge>
                    ))}
                  </div>
                </ContentSection>
              )}

              {/* Tabs */}
              <div className="mb-4">
                <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} tabs={tabs} />

                <div className="p-4" style={{
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '10px',
                  minHeight: '200px'
                }}>
                  {activeTab === 'info' && <InfoTab animeData={animeData} />}
                  {activeTab === 'storyline' && <StorylineTab overview={animeData.overview} />}
                  {activeTab === 'episodes' && (
                    <EpisodeList 
                      episodes={episodes} 
                      animeSlug={animeData.slug || id} 
                      onNavigate={navigate}
                      isMovieContent={isMovie(animeData?.type)}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AnimeDetailPage;