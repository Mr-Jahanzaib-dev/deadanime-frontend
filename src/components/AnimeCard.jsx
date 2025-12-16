import { Star } from 'lucide-react';
import { Link } from 'react-router-dom';

// Fallback image as data URL (defined outside component to avoid recreating)
const FALLBACK_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="450"%3E%3Crect fill="%23222" width="300" height="450"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="18" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3ENo Image%3C/text%3E%3C/svg%3E';

const AnimeCard = ({ anime }) => {
  // Debug - log the actual data being received
  // console.log('=== AnimeCard Debug ===');
  // console.log('Full anime object:', anime);
  // console.log('anime.name:', anime?.name);
  // console.log('anime.image:', anime?.image);
  // console.log('anime.image.poster:', anime?.image?.poster);
  // console.log('======================');
  
  if (!anime) {
    console.error('AnimeCard: No anime data received!');
    return null;
  }
  
  // Build poster URL - server returns image.poster
  const getPosterUrl = () => {
    const posterImg = anime.image?.poster || anime.poster_img;
    
    if (!posterImg) {
      return FALLBACK_IMAGE;
    }
    
    // Check if it's a TMDB path (starts with /)
    if (typeof posterImg === 'string' && posterImg.startsWith('/')) {
      return `https://image.tmdb.org/t/p/w500${posterImg}`;
    }
    // Check if it's already a full URL
    if (typeof posterImg === 'string' && posterImg.startsWith('http')) {
      return posterImg;
    }
    // Otherwise assume it's a custom uploaded image
    return `https://dbase.deaddrive.icu/${posterImg}`;
  };
  
  // Extract year from release date if year is empty
  const getYear = () => {
    if (anime.year && anime.year !== '') {
      return anime.year;
    }
    if (anime.release) {
      return new Date(anime.release).getFullYear();
    }
    return 'N/A';
  };
  
  // Check if anime is completed - server returns complete field
  const isCompleted = anime.complete && anime.complete !== '0000-00-00';
  
  // Handle image error with ref to prevent infinite loop
  const handleImageError = (e) => {
    // Only set fallback once to prevent loop
    if (e.target.dataset.errorHandled !== 'true') {
      e.target.dataset.errorHandled = 'true';
      e.target.src = FALLBACK_IMAGE;
    }
  };
  
  return (
    <Link 
      to={anime.type === "movie" ? `/watch/${anime.slug || anime.id}` : `/anime/${anime.slug || anime.id}`}
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
          height: '100%'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-8px)';
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(229, 9, 20, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <div style={{ position: 'relative', paddingTop: '145%', background: '#222' }}>
          <img 
            src={getPosterUrl()}
            alt={anime.name || 'Anime'}
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
          
          {/* Status Badge - show if NOT completed */}
          {!isCompleted && (
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
              zIndex: 1
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
              zIndex: 1
            }}>
              <Star size={12} fill="#ffc107" color="#ffc107" />
              {anime.rating}
            </div>
          )}
          
          {/* Episode Info */}
          {anime.episodes && (
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
                {anime.episodes} {anime.episodes === 1 ? 'Episode' : 'Episodes'}
              </div>
            </div>
          )}
        </div>
        
        <div className="p-3">
          <h6 className="fw-bold mb-2" style={{ 
            fontSize: '0.95rem', 
            color: '#fff',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            minHeight: '2.85rem'
          }}>
            {anime.name || 'Unknown Anime'}
          </h6>
          <p style={{ color: '#999', fontSize: '0.8rem', marginBottom: '8px' }}>
            {anime.type?.toUpperCase() || 'N/A'} • {getYear()}
          </p>
          {anime.age?.short_name && (
            <div className="mb-2">
              <span className="badge bg-secondary" style={{ fontSize: '0.7rem' }}>
                {anime.age.short_name}
              </span>
            </div>
          )}
          {anime.duration && anime.duration > 0 && (
            <p style={{ color: '#aaa', fontSize: '0.75rem', marginBottom: '0' }}>
              {anime.duration} min/ep
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