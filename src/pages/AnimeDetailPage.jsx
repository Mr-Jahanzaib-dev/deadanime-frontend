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
const LoadingSpinner = ({ size = 80 }) => {
  const isMobile = window.innerWidth < 768;
  const responsiveSize = isMobile ? Math.min(size * 0.75, 60) : size;
  
  return (
    <div style={{
      position: 'relative',
      marginBottom: isMobile ? '20px' : '30px',
      display: 'inline-block'
    }}>
      <div style={{
        width: `${responsiveSize}px`,
        height: `${responsiveSize}px`,
        border: `${isMobile ? '3px' : '4px'} solid rgba(229, 9, 20, 0.2)`,
        borderTop: `${isMobile ? '3px' : '4px'} solid #e50914`,
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }} />
      <Play 
        size={responsiveSize * 0.4} 
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
};

const LoadingDots = () => {
  const isMobile = window.innerWidth < 768;
  return (
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
  );
};

const LoadingScreen = () => {
  const isMobile = window.innerWidth < 768;
  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', color: '#fff' }}>
      <Navbar />
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: 'calc(100vh - 80px)',
        marginTop: isMobile ? '60px' : '80px',
        padding: '20px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <LoadingSpinner />
          <h2 style={{ 
            fontSize: isMobile ? '1.3rem' : '1.8rem',
            fontWeight: '600',
            marginBottom: '10px',
            background: 'linear-gradient(135deg, #e50914 0%, #ff1744 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Loading Anime Details...
          </h2>
          <p style={{ color: '#999', fontSize: isMobile ? '0.9rem' : '1rem' }}>
            Fetching information about this anime
          </p>
          <LoadingDots />
        </div>
      </div>
      <AnimationStyles />
    </div>
  );
};

// ==================== BUTTON COMPONENTS ====================
const GradientButton = ({ onClick, icon: Icon, text, gradient, className = '', disabled = false, isMobile = false }) => (
  <button 
    className={className}
    onClick={onClick}
    disabled={disabled}
    style={{
      background: gradient,
      border: 'none',
      color: '#fff',
      fontWeight: '600',
      boxShadow: `0 4px 15px ${gradient.includes('e50914') ? 'rgba(229, 9, 20, 0.4)' : 'rgba(34, 197, 94, 0.4)'}`,
      opacity: disabled ? 0.5 : 1,
      cursor: disabled ? 'not-allowed' : 'pointer',
      padding: isMobile ? '10px 20px' : '12px 24px',
      borderRadius: '8px',
      fontSize: isMobile ? '0.9rem' : '1rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s',
      width: '100%'
    }}
    onMouseEnter={(e) => !disabled && (e.currentTarget.style.transform = 'translateY(-2px)')}
    onMouseLeave={(e) => !disabled && (e.currentTarget.style.transform = 'translateY(0)')}
  >
    {Icon && <Icon size={isMobile ? 16 : 18} style={{ marginRight: '8px' }} />}
    {text}
  </button>
);

// ==================== INFO DISPLAY COMPONENTS ====================
const InfoItem = ({ label, value, children, isMobile = false }) => (
  <div style={{ marginBottom: isMobile ? '10px' : '12px' }}>
    <small style={{ color: '#999', fontSize: isMobile ? '0.8rem' : '0.85rem' }}>{label}</small>
    {children || <div style={{ color: '#fff', fontSize: isMobile ? '0.9rem' : '1rem' }}>{value}</div>}
  </div>
);

const InfoBadge = ({ icon: Icon, text, color = '#e50914', isMobile = false }) => (
  <div style={{ 
    display: 'flex', 
    alignItems: 'center',
    fontSize: isMobile ? '0.85rem' : '0.95rem'
  }}>
    <Icon size={isMobile ? 16 : 18} style={{ marginRight: '8px', color }} />
    <span>{text}</span>
  </div>
);

const Badge = ({ children, variant = 'secondary', isMobile = false }) => {
  const variants = {
    secondary: '#6c757d',
    success: '#22c55e',
    warning: '#ffc107',
    info: '#0dcaf0'
  };

  return (
    <span style={{
      background: variants[variant],
      color: variant === 'warning' ? '#000' : '#fff',
      padding: isMobile ? '4px 12px' : '6px 16px',
      borderRadius: '20px',
      fontSize: isMobile ? '0.75rem' : '0.85rem',
      fontWeight: '500',
      display: 'inline-block'
    }}>
      {children}
    </span>
  );
};

// ==================== QUICK INFO BOX COMPONENT ====================
const QuickInfoBox = ({ animeData, isMobile = false }) => {
  const contentIsMovie = isMovie(animeData.type);
  
  return (
    <div style={{
      marginTop: isMobile ? '15px' : '20px',
      padding: isMobile ? '12px' : '15px',
      background: 'rgba(255,255,255,0.05)',
      borderRadius: '10px',
      border: '1px solid rgba(255,255,255,0.1)'
    }}>
      <h6 style={{ 
        fontWeight: '700', 
        marginBottom: isMobile ? '12px' : '15px',
        color: '#e50914',
        fontSize: isMobile ? '0.95rem' : '1rem'
      }}>Quick Info</h6>
      
      <InfoItem label="Status:" isMobile={isMobile}>
        <Badge variant={animeData.complete ? 'secondary' : 'success'} isMobile={isMobile}>
          {animeData.complete ? 'Completed' : 'Ongoing'}
        </Badge>
      </InfoItem>

      {!contentIsMovie && <InfoItem label="Episodes:" value={animeData.episodes || 'N/A'} isMobile={isMobile} />}
      
      <InfoItem label="Rating:" isMobile={isMobile}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Star size={isMobile ? 12 : 14} fill="#ffc107" color="#ffc107" style={{ marginRight: '6px' }} />
          <span style={{ color: '#fff', fontSize: isMobile ? '0.9rem' : '1rem' }}>{animeData.rating || 'N/A'}</span>
        </div>
      </InfoItem>

      <InfoItem label="Type:" value={animeData.type?.toUpperCase()} isMobile={isMobile} />
      <InfoItem label="Year:" value={getYear(animeData)} isMobile={isMobile} />
      
      {contentIsMovie && animeData.duration && (
        <InfoItem label="Duration:" value={`${animeData.duration} min`} isMobile={isMobile} />
      )}
    </div>
  );
};

// ==================== ANIME POSTER COMPONENT ====================
const AnimePoster = ({ animeData, onWatchClick, onDownloadClick, isMobile = false }) => (
  <div style={{ 
    marginBottom: isMobile ? '30px' : '0',
    maxWidth: isMobile ? '300px' : '100%',
    margin: isMobile ? '0 auto 30px' : '0'
  }}>
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

    <div style={{ marginTop: isMobile ? '15px' : '20px' }}>
      <GradientButton
        onClick={onWatchClick}
        icon={Play}
        text="Watch Now"
        gradient="linear-gradient(135deg, #e50914 0%, #ff1744 100%)"
        isMobile={isMobile}
      />
    </div>

    <div style={{ marginTop: '10px' }}>
      <GradientButton
        onClick={onDownloadClick}
        icon={Download}
        text="Download"
        gradient="linear-gradient(135deg, #22c55e 0%, #16a34a 100%)"
        isMobile={isMobile}
      />
    </div>

    <QuickInfoBox animeData={animeData} isMobile={isMobile} />
  </div>
);

// ==================== ANIME HEADER COMPONENT ====================
const AnimeHeader = ({ animeData, isMobile = false }) => {
  const contentIsMovie = isMovie(animeData.type);
  
  return (
    <div>
      <h1 style={{
        fontSize: isMobile ? '1.5rem' : 'clamp(1.8rem, 4vw, 2.5rem)',
        fontWeight: '700',
        marginBottom: isMobile ? '12px' : '15px',
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        {contentIsMovie && <Film size={isMobile ? 24 : 32} style={{ color: '#e50914' }} />}
        {animeData.name}
      </h1>
      <p style={{ 
        color: '#ccc',
        fontSize: isMobile ? '0.9rem' : '1.1rem',
        marginBottom: isMobile ? '15px' : '20px'
      }}>
        {animeData.subOrDub} | {animeData.type?.toUpperCase()}
        {contentIsMovie && (
          <span style={{
            background: '#0dcaf0',
            color: '#000',
            padding: '4px 12px',
            borderRadius: '15px',
            fontSize: '0.75rem',
            marginLeft: '10px',
            fontWeight: '500'
          }}>Movie</span>
        )}
      </p>

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: isMobile ? '12px' : '15px',
        marginBottom: isMobile ? '15px' : '20px'
      }}>
        <InfoBadge icon={Calendar} text={getYear(animeData)} isMobile={isMobile} />
        {!contentIsMovie && <InfoBadge icon={Tv} text={`${animeData.episodes || 'N/A'} Eps`} isMobile={isMobile} />}
        <InfoBadge icon={Clock} text={animeData.complete ? 'Completed' : 'Ongoing'} isMobile={isMobile} />
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Star size={isMobile ? 16 : 18} fill="#ffc107" color="#ffc107" style={{ marginRight: '8px' }} />
          <span style={{ fontWeight: '700', fontSize: isMobile ? '0.9rem' : '1rem' }}>{animeData.rating}</span>
        </div>
      </div>
    </div>
  );
};

// ==================== EPISODE CARD COMPONENT ====================
const EpisodeCard = ({ episode, slug, season, onWatch, onDownload, isMobile = false }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div style={{ width: '100%', marginBottom: isMobile ? '10px' : '0' }}>
      <div 
        style={{
          padding: isMobile ? '12px' : '15px',
          background: isHovered ? 'rgba(229, 9, 20, 0.1)' : 'rgba(255,255,255,0.05)',
          borderRadius: '8px',
          border: `1px solid ${isHovered ? '#e50914' : 'rgba(255,255,255,0.1)'}`,
          transition: 'all 0.3s',
          cursor: 'pointer'
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: isMobile ? '10px' : '15px',
          flexWrap: isMobile ? 'wrap' : 'nowrap'
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ 
              fontWeight: '700',
              fontSize: isMobile ? '0.95rem' : '1rem',
              marginBottom: '4px'
            }}>
              Episode {episode.number}
            </div>
            <small style={{ 
              color: '#999',
              fontSize: isMobile ? '0.8rem' : '0.85rem',
              display: 'block',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {episode.name}
            </small>
            {episode.note && (
              <div>
                <small style={{ 
                  color: '#ffc107',
                  fontSize: isMobile ? '0.75rem' : '0.8rem'
                }}>
                  {episode.note}
                </small>
              </div>
            )}
          </div>
          <div style={{ 
            display: 'flex', 
            gap: isMobile ? '6px' : '8px',
            flexShrink: 0
          }}>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                // Pass slug, season, and episode number to watch
                onWatch(slug, season, episode.number);
              }}
              style={{
                background: '#e50914',
                color: '#fff',
                border: 'none',
                padding: isMobile ? '6px 12px' : '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: isMobile ? '0.8rem' : '0.85rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <Play size={isMobile ? 12 : 14} />
              {!isMobile && 'Watch'}
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onDownload(slug, season, episode.number);
              }}
              style={{
                background: '#22c55e',
                color: '#fff',
                border: 'none',
                padding: isMobile ? '6px 12px' : '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: isMobile ? '0.8rem' : '0.85rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <Download size={isMobile ? 12 : 14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== EPISODE LIST COMPONENT ====================
const EpisodeList = ({ episodes, slug, season, onNavigate, isMovieContent, isMobile = false }) => {
  const [showAll, setShowAll] = useState(false);
  const displayedEpisodes = showAll ? episodes : episodes.slice(0, 6);

  if (isMovieContent) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: isMobile ? '30px 15px' : '40px 20px'
      }}>
        <Film size={isMobile ? 40 : 48} style={{ color: '#e50914', marginBottom: '15px' }} />
        <h5 style={{ 
          fontWeight: '700', 
          marginBottom: '10px',
          fontSize: isMobile ? '1.1rem' : '1.3rem'
        }}>
          This is a Movie
        </h5>
        <p style={{ 
          color: '#999',
          fontSize: isMobile ? '0.85rem' : '0.95rem',
          lineHeight: '1.6'
        }}>
          Movies don't have episodes. Use the watch or download buttons above.
        </p>
      </div>
    );
  }

  if (episodes.length === 0) {
    return (
      <p style={{ 
        color: '#999',
        textAlign: 'center',
        padding: '20px',
        fontSize: isMobile ? '0.9rem' : '1rem'
      }}>
        No episodes available
      </p>
    );
  }

  return (
    <div>
      <h5 style={{ 
        fontWeight: '700', 
        marginBottom: isMobile ? '15px' : '20px',
        fontSize: isMobile ? '1rem' : '1.2rem'
      }}>
        Episode List ({episodes.length})
      </h5>
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: isMobile ? '10px' : '15px'
      }}>
        {displayedEpisodes.map((episode) => (
          <EpisodeCard 
            key={episode.id || episode.number} 
            episode={episode}
            slug={slug}
            season={season}
            onWatch={(slug, season, episodeNum) => onNavigate(`/watch/${slug}/${season}/${episodeNum}`)}
            onDownload={(slug, season, episodeNum) => onNavigate(`/download/${slug}/${season}/${episodeNum}`)}
            isMobile={isMobile}
          />
        ))}
      </div>
      
      {episodes.length > 6 && (
        <button
          onClick={() => setShowAll(!showAll)}
          style={{
            width: '100%',
            marginTop: isMobile ? '15px' : '20px',
            background: 'rgba(255,255,255,0.1)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.2)',
            padding: isMobile ? '10px 20px' : '12px 24px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: isMobile ? '0.9rem' : '1rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
          }}
        >
          {showAll ? (
            <>
              <ChevronUp size={isMobile ? 16 : 18} />
              Show Less
            </>
          ) : (
            <>
              <ChevronDown size={isMobile ? 16 : 18} />
              Show All Episodes ({episodes.length})
            </>
          )}
        </button>
      )}
    </div>
  );
};

// ==================== TAB CONTENT COMPONENTS ====================
const InfoTab = ({ animeData, isMobile = false }) => (
  <div>
    <h5 style={{ 
      fontWeight: '700', 
      marginBottom: isMobile ? '15px' : '20px',
      fontSize: isMobile ? '1rem' : '1.2rem'
    }}>
      Series Information
    </h5>
    <ul style={{ 
      color: '#ccc', 
      lineHeight: isMobile ? '1.8' : '2',
      fontSize: isMobile ? '0.85rem' : '0.95rem',
      paddingLeft: isMobile ? '20px' : '25px'
    }}>
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

const StorylineTab = ({ overview, isMobile = false }) => (
  <div>
    <h5 style={{ 
      fontWeight: '700', 
      marginBottom: isMobile ? '15px' : '20px',
      fontSize: isMobile ? '1rem' : '1.2rem'
    }}>
      Storyline
    </h5>
    <p style={{ 
      color: '#ccc', 
      lineHeight: '1.8',
      fontSize: isMobile ? '0.9rem' : '1rem'
    }}>
      {overview || 'No description available.'}
    </p>
  </div>
);

// ==================== TAB NAVIGATION ====================
const TabButton = ({ active, onClick, label, isMobile = false }) => (
  <button
    onClick={onClick}
    style={{
      background: active ? '#e50914' : 'rgba(255,255,255,0.1)',
      color: '#fff',
      border: 'none',
      fontWeight: active ? '600' : '400',
      textTransform: 'capitalize',
      padding: isMobile ? '8px 16px' : '10px 20px',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: isMobile ? '0.85rem' : '0.95rem',
      transition: 'all 0.2s',
      flex: isMobile ? '1' : 'auto'
    }}
    onMouseEnter={(e) => {
      if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
    }}
    onMouseLeave={(e) => {
      if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
    }}
  >
    {label}
  </button>
);

const TabNavigation = ({ activeTab, setActiveTab, tabs, isMobile = false }) => (
  <div style={{
    display: 'flex',
    gap: isMobile ? '8px' : '10px',
    marginBottom: isMobile ? '15px' : '20px',
    flexWrap: 'wrap'
  }}>
    {tabs.map(tab => (
      <TabButton
        key={tab.id}
        active={activeTab === tab.id}
        onClick={() => setActiveTab(tab.id)}
        label={tab.label}
        isMobile={isMobile}
      />
    ))}
  </div>
);

// ==================== CONTENT SECTION ====================
const ContentSection = ({ title, children, isMobile = false, customStyles = {} }) => (
  <div style={{ 
    marginBottom: isMobile ? '15px' : '20px',
    ...customStyles 
  }}>
    {title && (
      <h6 style={{ 
        fontWeight: '700', 
        marginBottom: isMobile ? '8px' : '10px',
        color: '#e50914',
        fontSize: isMobile ? '0.9rem' : '1rem'
      }}>
        {title}
      </h6>
    )}
    {children}
  </div>
);

// ==================== MAIN COMPONENT ====================
const AnimeDetailPage = () => {
  const { id } = useParams(); // This is the SLUG from the URL
  const navigate = useNavigate();
  const [animeData, setAnimeData] = useState(null);
  const [seasons, setSeasons] = useState([]);
  const [episodes, setEpisodes] = useState([]);
  const [currentSeason, setCurrentSeason] = useState(1);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  useEffect(() => {
    const fetchAnimeData = async () => {
      setLoading(true);
      
      try {
        console.log('Fetching anime info for slug:', id);
        
        // Get anime info using slug (id from URL is actually the slug)
        const anime = await getAnimeInfo(id);
        
        if (anime) {
          console.log('Anime data received:', anime);
          setAnimeData(anime);
          
          // Get season info
          const seasonData = await getSeasonInfo(id);
          console.log('Season data:', seasonData);
          setSeasons(seasonData.seasons || []);
          
          // Get episodes for season 1 by default
          if (seasonData.seasons && seasonData.seasons.length > 0) {
            const episodeData = await getEpisodes(id, 1);
            console.log('Episode data:', episodeData);
            setEpisodes(episodeData || []);
            setCurrentSeason(1);
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
        // For movies: /watch/movie-slug or /download/movie-slug
        navigate(`/${type}/${slug}`);
      } else if (episodes.length > 0) {
        // For series: /watch/slug/season/episode
        navigate(`/${type}/${slug}/${currentSeason}/${episodes[0].number}`);
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
        <div style={{ 
          textAlign: 'center',
          marginTop: isMobile ? '150px' : '200px',
          padding: '20px'
        }}>
          <h2 style={{ fontSize: isMobile ? '1.3rem' : '1.8rem' }}>Anime not found</h2>
          <p style={{ 
            color: '#999',
            fontSize: isMobile ? '0.9rem' : '1rem',
            marginTop: '10px'
          }}>
            The anime you're looking for doesn't exist or has been removed.
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  const tabs = [
    { id: 'info', label: isMobile ? 'Info' : 'Series Info' },
    { id: 'storyline', label: 'Storyline' },
    { id: 'episodes', label: isMovie(animeData?.type) ? (isMobile ? 'Content' : 'Content Info') : 'Episodes' }
  ];

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', color: '#fff' }}>
      <Navbar />

      {/* Cover Banner */}
      <div style={{
        marginTop: isMobile ? '60px' : '80px',
        height: isMobile ? '250px' : '400px',
        background: `linear-gradient(to bottom, rgba(10,10,10,0.3), rgba(10,10,10,1)), url(${getImageUrl(animeData.image?.backdrop, 'original')})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }} />

      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        marginTop: isMobile ? '-100px' : '-200px',
        position: 'relative',
        zIndex: 10,
        padding: isMobile ? '0 15px' : '0 40px'
      }}>
        <div style={{
          display: isMobile ? 'block' : 'flex',
          gap: isMobile ? '0' : '30px'
        }}>
          {/* Poster Column */}
          <div style={{
            width: isMobile ? '100%' : '25%',
            minWidth: isMobile ? 'auto' : '250px',
            flexShrink: 0
          }}>
            <AnimePoster 
              animeData={animeData} 
              onWatchClick={handleWatchClick}
              onDownloadClick={handleDownloadClick}
              isMobile={isMobile}
            />
          </div>

          {/* Content Column */}
          <div style={{ 
            width: isMobile ? '100%' : '75%',
            flex: 1
          }}>
            <div style={{
              padding: isMobile ? '20px 15px' : '30px',
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <AnimeHeader animeData={animeData} isMobile={isMobile} />

              {/* Action Buttons - Desktop Only (Already in poster on mobile) */}
              {!isMobile && (
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '15px',
                  marginBottom: '25px'
                }}>
                  <div style={{ flex: '0 0 auto' }}>
                    <GradientButton
                      onClick={handleWatchClick}
                      icon={Play}
                      text="Watch Online"
                      gradient="linear-gradient(135deg, #e50914 0%, #ff1744 100%)"
                    />
                  </div>
                  <div style={{ flex: '0 0 auto' }}>
                    <GradientButton
                      onClick={handleDownloadClick}
                      icon={Download}
                      text="Download All"
                      gradient="linear-gradient(135deg, #22c55e 0%, #16a34a 100%)"
                    />
                  </div>
                </div>
              )}

              {animeData.duration && (
                <ContentSection title="Duration:" isMobile={isMobile}>
                  <span style={{
                    background: 'rgba(229, 9, 20, 0.2)',
                    color: '#fff',
                    padding: isMobile ? '4px 12px' : '6px 16px',
                    borderRadius: '15px',
                    fontSize: isMobile ? '0.8rem' : '0.9rem',
                    display: 'inline-block'
                  }}>
                    {animeData.duration} min/ep
                  </span>
                </ContentSection>
              )}

              {animeData.age?.short_name && (
                <ContentSection title="Age Rating:" isMobile={isMobile}>
                  <Badge variant="warning" isMobile={isMobile}>{animeData.age.short_name}</Badge>
                  {animeData.age.description && (
                    <small style={{ 
                      marginLeft: '10px',
                      color: '#999',
                      fontSize: isMobile ? '0.75rem' : '0.85rem'
                    }}>
                      {animeData.age.description}
                    </small>
                  )}
                </ContentSection>
              )}

              {!isMovie(animeData?.type) && seasons.length > 0 && (
                <ContentSection title={`Seasons (${seasons.length}):`} isMobile={isMobile}>
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: isMobile ? '6px' : '8px'
                  }}>
                    {seasons.map((season, idx) => (
                      <Badge key={idx} variant="secondary" isMobile={isMobile}>
                        Season {season.num}
                      </Badge>
                    ))}
                  </div>
                </ContentSection>
              )}

              {/* Tabs */}
              <div style={{ marginBottom: isMobile ? '20px' : '30px' }}>
                <TabNavigation 
                  activeTab={activeTab} 
                  setActiveTab={setActiveTab} 
                  tabs={tabs}
                  isMobile={isMobile}
                />

                <div style={{
                  padding: isMobile ? '15px' : '20px',
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '10px',
                  minHeight: isMobile ? '150px' : '200px'
                }}>
                  {activeTab === 'info' && <InfoTab animeData={animeData} isMobile={isMobile} />}
                  {activeTab === 'storyline' && <StorylineTab overview={animeData.overview} isMobile={isMobile} />}
                  {activeTab === 'episodes' && (
                    <EpisodeList 
                      episodes={episodes} 
                      slug={animeData.slug || id}
                      season={currentSeason}
                      onNavigate={navigate}
                      isMovieContent={isMovie(animeData?.type)}
                      isMobile={isMobile}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
      <AnimationStyles />
    </div>
  );
};

export default AnimeDetailPage;