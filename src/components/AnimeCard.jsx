import { Star } from 'lucide-react';
import { Link } from 'react-router-dom';

// Fallback image as data URL (defined outside component to avoid recreating)
const FALLBACK_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="450"%3E%3Crect fill="%23222" width="300" height="450"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="18" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3ENo Image%3C/text%3E%3C/svg%3E';

const AnimeCard = ({ anime }) => {
  if (!anime) {
    console.error('AnimeCard: No anime data received!');
    return null;
  }
  
  // Build poster URL - handles multiple possible image formats from Dead Anime API
  const getPosterUrl = () => {
    // Try different possible image field names from the API
    const posterImg = anime.image?.poster || 
                     anime.poster_img || 
                     anime.image || 
                     anime.poster;
    
    if (!posterImg) {
      return FALLBACK_IMAGE;
    }
    
    // If it's already a full URL, use it
    if (typeof posterImg === 'string' && posterImg.startsWith('http')) {
      return posterImg;
    }
    
    // If it starts with /, it might be a TMDB path
    if (typeof posterImg === 'string' && posterImg.startsWith('/')) {
      return `https://image.tmdb.org/t/p/w500${posterImg}`;
    }
    
    // Otherwise, assume it's a path on the Dead Anime CDN
    // Remove leading slash if present
    const cleanPath = typeof posterImg === 'string' ? posterImg.replace(/^\/+/, '') : posterImg;
    return `https://dbase.deaddrive.icu/${cleanPath}`;
  };
  
  // Extract year from release date if year is empty
  const getYear = () => {
    // Try year field first
    if (anime.year && anime.year !== '' && anime.year !== 'N/A') {
      return anime.year;
    }
    
    // Try release_date field (Dead Anime API)
    if (anime.release_date) {
      const year = new Date(anime.release_date).getFullYear();
      return isNaN(year) ? 'N/A' : year;
    }
    
    // Try release field (your transformed data)
    if (anime.release) {
      const year = new Date(anime.release).getFullYear();
      return isNaN(year) ? 'N/A' : year;
    }
    
    return 'N/A';
  };
  
  // Check if anime is completed
  // Dead Anime API uses 'status' field or 'completed' boolean
  const isCompleted = () => {
    if (anime.status === 'completed') return true;
    if (anime.completed === true) return true;
    if (anime.complete && anime.complete !== '0000-00-00') return true;
    return false;
  };
  
  // Get episode count
  const getEpisodeCount = () => {
    return anime.episodes || anime.total_episodes || 0;
  };
  
  // Get anime type (movie, series, etc.)
  const getType = () => {
    return anime.type?.toUpperCase() || 'SERIES';
  };
  
  // Determine if this is a movie
  const isMovie = () => {
    return anime.type?.toLowerCase() === 'movie';
  };
  
  // Handle image error with ref to prevent infinite loop
  const handleImageError = (e) => {
    // Only set fallback once to prevent loop
    if (e.target.dataset.errorHandled !== 'true') {
      e.target.dataset.errorHandled = 'true';
      e.target.src = FALLBACK_IMAGE;
    }
  };
  
  // Build the link URL based on type
  const getLinkUrl = () => {
    const slug = anime.slug || anime.id;
    
    if (isMovie()) {
      // Movies go directly to watch page
      return `/watch/${slug}`;
    } else {
      // Series go to detail page
      return `/anime/${slug}`;
    }
  };
  
  return (
    <Link 
      to={getLinkUrl()}
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      <div 
        className="anime-card"
        style={{ 
          background: 'rgba(255,255,255,0.03)',
          borderRadius: '12px',
          overflow: 'hidden',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          height: '100%',
          border: '1px solid rgba(255,255,255,0.05)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-8px)';
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(229, 9, 20, 0.3)';
          e.currentTarget.style.borderColor = 'rgba(229, 9, 20, 0.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
        }}
      >
        {/* Poster Image Container */}
        <div style={{ position: 'relative', paddingTop: '145%', background: '#222' }}>
          <img 
            src={getPosterUrl()}
            alt={anime.name || anime.title || 'Anime'}
            style={{ 
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
            onError={handleImageError}
            loading="lazy"
          />
          
          {/* Status Badge - show if airing/ongoing */}
          {!isCompleted() && (
            <div style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              background: '#28a745',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: '600',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              zIndex: 1,
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                background: '#fff',
                borderRadius: '50%',
                animation: 'pulse 2s infinite'
              }} />
              AIRING
            </div>
          )}
          
          {/* Movie Badge */}
          {isMovie() && (
            <div style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              background: '#0dcaf0',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: '600',
              color: '#000',
              zIndex: 1,
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
            }}>
              MOVIE
            </div>
          )}
          
          {/* Rating Badge */}
          {anime.rating && parseFloat(anime.rating) > 0 && (
            <div style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              background: 'rgba(0,0,0,0.8)',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: '600',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              zIndex: 1,
              backdropFilter: 'blur(10px)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
            }}>
              <Star size={12} fill="#ffc107" color="#ffc107" />
              {parseFloat(anime.rating).toFixed(1)}
            </div>
          )}
          
          {/* Episode Info - only show for series */}
          {!isMovie() && getEpisodeCount() > 0 && (
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.95), transparent)',
              padding: '30px 12px 12px',
              color: '#fff',
              zIndex: 1
            }}>
              <div style={{ fontSize: '0.8rem', fontWeight: '600' }}>
                {getEpisodeCount()} {getEpisodeCount() === 1 ? 'Episode' : 'Episodes'}
              </div>
            </div>
          )}
        </div>
        
        {/* Card Content */}
        <div className="p-3">
          {/* Title */}
          <h6 className="fw-bold mb-2" style={{ 
            fontSize: '0.95rem', 
            color: '#fff',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            minHeight: '2.85rem',
            lineHeight: '1.4'
          }}>
            {anime.name || anime.title || 'Unknown Anime'}
          </h6>
          
          {/* Type and Year */}
          <p style={{ 
            color: '#999', 
            fontSize: '0.8rem', 
            marginBottom: '8px',
            fontWeight: '500'
          }}>
            {getType()} • {getYear()}
          </p>
          
          {/* Age Rating */}
          {anime.age?.short_name && (
            <div className="mb-2">
              <span className="badge" style={{ 
                fontSize: '0.7rem',
                background: '#ffc107',
                color: '#000',
                fontWeight: '600'
              }}>
                {anime.age.short_name}
              </span>
            </div>
          )}
          
          {/* Duration - only for series */}
          {!isMovie() && anime.duration && anime.duration > 0 && (
            <p style={{ 
              color: '#aaa', 
              fontSize: '0.75rem', 
              marginBottom: '0',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              {anime.duration} min/ep
            </p>
          )}
          
          {/* Views count if available */}
          {anime.views && anime.views > 0 && (
            <p style={{ 
              color: '#777', 
              fontSize: '0.7rem', 
              marginTop: '4px',
              marginBottom: '0'
            }}>
              👁️ {anime.views.toLocaleString()} views
            </p>
          )}
        </div>
        
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}</style>
      </div>
    </Link>
  );
};

export default AnimeCard;