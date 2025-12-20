import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Download,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Play,
  ArrowLeft,
  Film,
  Loader2,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  getAnimeInfo,
  getSeasonInfo,
  getEpisodes,
  getEpisodeLinks,
  getMovieLinks,
} from "../services/api";

// ==================== UTILITY FUNCTIONS ====================
const isMovie = (type) => type?.toLowerCase() === 'movie';

const extractDownloadLinks = (links) => {
  let servers = [];
  
  if (links && links.servers && Array.isArray(links.servers)) {
    servers = links.servers;
  } else if (links && links.links && Array.isArray(links.links)) {
    servers = links.links;
  } else if (Array.isArray(links)) {
    servers = links;
  }
  
  const downloadableLinks = servers
    .filter((server) => server.download && server.download.trim() !== "")
    .map((server) => ({
      quality: server.name || "Standard Quality",
      url: server.download.trim(),
      size: server.size || "Unknown",
    }));
  
  return downloadableLinks;
};

// ==================== LOADING COMPONENT - RESPONSIVE ====================
const LoadingScreen = () => (
  <div style={{ background: "#0a0a0a", minHeight: "100vh", color: "#fff" }}>
    <Navbar />
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "calc(100vh - 80px)",
      marginTop: "clamp(60px, 15vw, 80px)",
      padding: "clamp(15px, 4vw, 20px)"
    }}>
      <div style={{ textAlign: "center", maxWidth: "400px", width: "100%" }}>
        <div style={{
          width: "clamp(50px, 12vw, 60px)",
          height: "clamp(50px, 12vw, 60px)",
          border: "4px solid rgba(34, 197, 94, 0.2)",
          borderTop: "4px solid #22c55e",
          borderRadius: "50%",
          animation: "spinLoader 1s linear infinite",
          margin: "0 auto clamp(15px, 4vw, 20px)"
        }} />
        <h2 style={{
          fontSize: "clamp(1.1rem, 3.5vw, 1.3rem)",
          fontWeight: "600",
          color: "#22c55e"
        }}>
          Loading Download Links...
        </h2>
      </div>
    </div>
    <style>{`
      @keyframes spinLoader {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

// ==================== INLINE LOADING OVERLAY - RESPONSIVE ====================
const LoadingOverlay = ({ message = "Loading..." }) => (
  <>
    <style>{`
      @keyframes spinRotate {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `}</style>
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(10, 10, 10, 0.95)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999,
      padding: "20px"
    }}>
      <div style={{ textAlign: "center", maxWidth: "90%" }}>
        <div style={{ display: "inline-block" }}>
          <Loader2 
            size={48} 
            color="#22c55e" 
            style={{
              animation: "spinRotate 1s linear infinite",
              marginBottom: "15px",
              display: "block",
              width: "clamp(40px, 10vw, 48px)",
              height: "clamp(40px, 10vw, 48px)"
            }}
          />
        </div>
        <h3 style={{
          fontSize: "clamp(1rem, 3vw, 1.2rem)",
          fontWeight: "600",
          color: "#22c55e",
          margin: 0
        }}>
          {message}
        </h3>
      </div>
    </div>
  </>
);

// ==================== NAVIGATION BUTTON COMPONENT - RESPONSIVE ====================
const NavigationButton = ({ onClick, disabled, icon: Icon, text, variant = 'default', loading = false }) => {
  const [isHovered, setIsHovered] = useState(false);

  const getStyles = () => {
    const baseStyle = {
      flex: 1,
      border: "none",
      color: "#fff",
      padding: "clamp(10px, 2.5vw, 15px)",
      borderRadius: "clamp(8px, 2vw, 10px)",
      fontSize: "clamp(0.85rem, 2.2vw, 1rem)",
      fontWeight: "600",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "clamp(4px, 1.5vw, 8px)",
      cursor: disabled || loading ? "not-allowed" : "pointer",
      opacity: disabled || loading ? 0.5 : 1,
      transition: "all 0.2s",
      position: "relative",
      minHeight: "44px" // Touch-friendly minimum
    };

    if (variant === 'primary') {
      return {
        ...baseStyle,
        background: "#e50914",
      };
    }

    return {
      ...baseStyle,
      background: isHovered && !disabled && !loading ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.1)",
    };
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      style={getStyles()}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <style>{`
        @keyframes buttonSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      {loading ? (
        <>
          <span style={{ display: "inline-block", animation: "buttonSpin 1s linear infinite" }}>
            <Loader2 size={20} style={{ width: "clamp(16px, 4vw, 20px)", height: "clamp(16px, 4vw, 20px)" }} />
          </span>
          <span className="d-none d-sm-inline">{text}</span>
        </>
      ) : (
        <>
          {Icon && text !== 'Next' && <Icon size={20} style={{ width: "clamp(16px, 4vw, 20px)", height: "clamp(16px, 4vw, 20px)" }} />}
          <span className="d-none d-sm-inline">{text}</span>
          <span className="d-inline d-sm-none">{text === 'Previous' ? '‹' : text === 'Next' ? '›' : text}</span>
          {Icon && text === 'Next' && <Icon size={20} style={{ width: "clamp(16px, 4vw, 20px)", height: "clamp(16px, 4vw, 20px)" }} />}
        </>
      )}
    </button>
  );
};

// ==================== TITLE SECTION COMPONENT - RESPONSIVE ====================
const TitleSection = ({ animeData, currentEpisode, contentIsMovie }) => (
  <div style={{
    background: "rgba(255,255,255,0.05)",
    padding: "clamp(15px, 4vw, 20px)",
    borderRadius: "clamp(10px, 2.5vw, 12px)",
    marginBottom: "clamp(15px, 4vw, 20px)"
  }}>
    <h2 style={{ 
      fontSize: "clamp(1.2rem, 4vw, 1.5rem)", 
      marginBottom: "8px",
      lineHeight: "1.3",
      wordBreak: "break-word"
    }}>
      {contentIsMovie && (
        <Film 
          size={24} 
          className="me-2" 
          style={{ 
            display: "inline", 
            marginBottom: "4px",
            width: "clamp(20px, 5vw, 24px)",
            height: "clamp(20px, 5vw, 24px)"
          }} 
        />
      )}
      {animeData?.name}
    </h2>
    {contentIsMovie ? (
      <p style={{ 
        color: "#22c55e", 
        fontSize: "clamp(0.95rem, 2.8vw, 1.1rem)", 
        margin: 0,
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: "8px"
      }}>
        <span className="badge bg-info" style={{ fontSize: "clamp(0.75rem, 2vw, 0.85rem)" }}>Movie</span>
        <span>Download available below</span>
      </p>
    ) : (
      <p style={{ 
        color: "#22c55e", 
        fontSize: "clamp(0.95rem, 2.8vw, 1.1rem)", 
        margin: 0,
        wordBreak: "break-word"
      }}>
        Episode {currentEpisode?.number}: {currentEpisode?.name}
      </p>
    )}
  </div>
);

// ==================== SEASON SELECTOR COMPONENT - RESPONSIVE ====================
const SeasonSelector = ({ seasons, selectedSeason, onSeasonChange, disabled }) => {
  if (seasons.length <= 1) return null;

  return (
    <div style={{
      background: "rgba(255,255,255,0.05)",
      borderRadius: "clamp(10px, 2.5vw, 12px)",
      padding: "clamp(15px, 4vw, 20px)",
      marginBottom: "clamp(15px, 4vw, 20px)",
      opacity: disabled ? 0.6 : 1,
      pointerEvents: disabled ? "none" : "auto"
    }}>
      <h4 style={{ 
        fontSize: "clamp(1rem, 3vw, 1.1rem)", 
        marginBottom: "clamp(12px, 3vw, 15px)", 
        color: "#22c55e" 
      }}>
        Select Season
      </h4>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(clamp(100px, 25vw, 120px), 1fr))",
        gap: "clamp(8px, 2vw, 10px)"
      }}>
        {seasons.map((season) => (
          <button
            key={season.id}
            onClick={() => onSeasonChange(season)}
            disabled={disabled}
            style={{
              background: selectedSeason?.id === season.id ? "#22c55e" : "rgba(255,255,255,0.1)",
              border: "none",
              color: "#fff",
              padding: "clamp(10px, 2.5vw, 12px)",
              borderRadius: "clamp(6px, 1.5vw, 8px)",
              fontSize: "clamp(0.9rem, 2.5vw, 1rem)",
              fontWeight: selectedSeason?.id === season.id ? "600" : "400",
              cursor: disabled ? "not-allowed" : "pointer",
              minHeight: "44px",
              transition: "all 0.2s"
            }}
          >
            Season {season.num}
          </button>
        ))}
      </div>
    </div>
  );
};

// ==================== EPISODE GRID COMPONENT - RESPONSIVE ====================
const EpisodeGrid = ({ episodes, currentEpisode, onEpisodeSelect, disabled }) => (
  <div style={{
    background: "rgba(255,255,255,0.05)",
    borderRadius: "clamp(10px, 2.5vw, 12px)",
    padding: "clamp(15px, 4vw, 20px)",
    marginBottom: "clamp(15px, 4vw, 20px)",
    opacity: disabled ? 0.6 : 1,
    pointerEvents: disabled ? "none" : "auto"
  }}>
    <h4 style={{ 
      fontSize: "clamp(1rem, 3vw, 1.1rem)", 
      marginBottom: "clamp(12px, 3vw, 15px)", 
      color: "#22c55e" 
    }}>
      All Episodes ({episodes.length})
    </h4>
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(clamp(110px, 28vw, 140px), 1fr))",
      gap: "clamp(8px, 2vw, 10px)",
      maxHeight: "clamp(400px, 60vh, 500px)",
      overflowY: "auto",
      overflowX: "hidden"
    }}>
      {episodes.map((episode) => (
        <EpisodeButton
          key={episode.id}
          episode={episode}
          isActive={episode.id === currentEpisode?.id}
          onClick={() => onEpisodeSelect(episode)}
          disabled={disabled}
        />
      ))}
    </div>
  </div>
);

const EpisodeButton = ({ episode, isActive, onClick, disabled }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: isActive ? "#22c55e" : (isHovered ? "rgba(34, 197, 94, 0.2)" : "rgba(255,255,255,0.1)"),
        border: isActive ? "2px solid #16a34a" : "1px solid rgba(255,255,255,0.2)",
        color: "#fff",
        padding: "clamp(12px, 3vw, 15px) clamp(8px, 2vw, 10px)",
        borderRadius: "clamp(6px, 1.5vw, 8px)",
        cursor: disabled ? "not-allowed" : "pointer",
        textAlign: "center",
        transition: "all 0.2s",
        minHeight: "clamp(70px, 18vw, 90px)"
      }}
    >
      <div style={{ 
        fontWeight: "600", 
        fontSize: "clamp(0.9rem, 2.5vw, 1rem)", 
        marginBottom: "4px" 
      }}>
        EP {episode.number}
      </div>
      <div style={{
        fontSize: "clamp(0.7rem, 2vw, 0.75rem)",
        color: isActive ? "#fff" : "#999",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap"
      }}>
        {episode.name}
      </div>
    </button>
  );
};
// ==================== DOWNLOAD LINKS SECTION - RESPONSIVE ====================
const DownloadLinksSection = ({ downloadLinks, downloadError, contentIsMovie, loading }) => (
  <div style={{
    background: "linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(22, 163, 74, 0.05) 100%)",
    border: "1px solid rgba(34, 197, 94, 0.3)",
    borderRadius: "clamp(10px, 2.5vw, 12px)",
    padding: "clamp(20px, 5vw, 25px) clamp(15px, 4vw, 20px)",
    marginBottom: "clamp(15px, 4vw, 20px)",
    position: "relative"
  }}>
    <div style={{ textAlign: "center", marginBottom: "clamp(20px, 5vw, 25px)" }}>
      <Download 
        size={48} 
        color="#22c55e" 
        style={{ 
          marginBottom: "10px",
          width: "clamp(40px, 10vw, 48px)",
          height: "clamp(40px, 10vw, 48px)"
        }} 
      />
      <h3 style={{ 
        color: "#22c55e", 
        fontSize: "clamp(1.1rem, 3.5vw, 1.3rem)", 
        marginBottom: "5px",
        wordBreak: "break-word"
      }}>
        Download Links {contentIsMovie && "(Movie)"}
      </h3>
      <p style={{ 
        color: "#999", 
        fontSize: "clamp(0.8rem, 2.3vw, 0.9rem)", 
        margin: 0 
      }}>
        Tap to download
      </p>
    </div>

    {loading ? (
      <div style={{ textAlign: "center", padding: "clamp(30px, 8vw, 40px) clamp(15px, 4vw, 20px)" }}>
        <style>{`
          @keyframes downloadSpin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
        <div style={{ display: "inline-block", animation: "downloadSpin 1s linear infinite" }}>
          <Loader2 
            size={40} 
            color="#22c55e" 
            style={{ 
              marginBottom: "10px",
              display: "block",
              width: "clamp(35px, 8vw, 40px)",
              height: "clamp(35px, 8vw, 40px)"
            }} 
          />
        </div>
        <p style={{ color: "#999", margin: 0, fontSize: "clamp(0.85rem, 2.5vw, 0.95rem)" }}>
          Loading download links...
        </p>
      </div>
    ) : downloadError ? (
      <div style={{
        background: "rgba(239, 68, 68, 0.1)",
        border: "1px solid rgba(239, 68, 68, 0.3)",
        borderRadius: "clamp(6px, 1.5vw, 8px)",
        padding: "clamp(15px, 4vw, 20px)",
        textAlign: "center"
      }}>
        <p style={{ 
          color: "#ef4444", 
          margin: 0,
          fontSize: "clamp(0.85rem, 2.5vw, 0.95rem)"
        }}>
          ⚠️ No download links available for this {contentIsMovie ? 'movie' : 'episode'}
        </p>
      </div>
    ) : downloadLinks.length > 0 ? (
      <div style={{ display: "flex", flexDirection: "column", gap: "clamp(10px, 2.5vw, 12px)" }}>
        {downloadLinks.map((link, index) => (
          <DownloadLinkCard key={index} link={link} />
        ))}
      </div>
    ) : (
      <div style={{ 
        textAlign: "center", 
        padding: "clamp(15px, 4vw, 20px)", 
        color: "#999",
        fontSize: "clamp(0.85rem, 2.5vw, 0.95rem)"
      }}>
        No download links available
      </div>
    )}
  </div>
);

const DownloadLinkCard = ({ link }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: isHovered ? "rgba(34, 197, 94, 0.15)" : "rgba(255,255,255,0.05)",
        border: `1px solid ${isHovered ? "#22c55e" : "rgba(34, 197, 94, 0.3)"}`,
        borderRadius: "clamp(8px, 2vw, 10px)",
        padding: "clamp(14px, 3.5vw, 18px)",
        textDecoration: "none",
        color: "#fff",
        transition: "all 0.2s",
        gap: "clamp(10px, 3vw, 15px)",
        minHeight: "clamp(60px, 15vw, 80px)"
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          color: "#22c55e",
          fontWeight: "600",
          fontSize: "clamp(0.95rem, 3vw, 1.1rem)",
          marginBottom: "4px",
          wordBreak: "break-word"
        }}>
          {link.quality}
        </div>
        <div style={{ 
          color: "#999", 
          fontSize: "clamp(0.75rem, 2.2vw, 0.85rem)" 
        }}>
          {link.size}
        </div>
      </div>
      <ExternalLink 
        size={24} 
        color="#22c55e" 
        style={{ 
          flexShrink: 0,
          width: "clamp(20px, 5vw, 24px)",
          height: "clamp(20px, 5vw, 24px)"
        }} 
      />
    </a>
  );
};

// ==================== DESCRIPTION SECTION - RESPONSIVE ====================
const DescriptionSection = ({ overview }) => (
  <div style={{
    background: "rgba(255,255,255,0.05)",
    borderRadius: "clamp(10px, 2.5vw, 12px)",
    padding: "clamp(15px, 4vw, 20px)",
    marginTop: "clamp(15px, 4vw, 20px)"
  }}>
    <h4 style={{ 
      fontSize: "clamp(1rem, 3vw, 1.1rem)", 
      marginBottom: "clamp(10px, 2.5vw, 12px)" 
    }}>
      About
    </h4>
    <p style={{ 
      color: "#ccc", 
      lineHeight: "1.6", 
      margin: 0,
      fontSize: "clamp(0.9rem, 2.5vw, 1rem)",
      wordBreak: "break-word"
    }}>
      {overview || "No description available."}
    </p>
  </div>
);

// ==================== MAIN DOWNLOAD PAGE - RESPONSIVE ====================
const DownloadPage = () => {
  const { slug, episodeId } = useParams();
  const navigate = useNavigate();

  const [animeData, setAnimeData] = useState(null);
  const [seasons, setSeasons] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [currentEpisode, setCurrentEpisode] = useState(null);
  const [downloadLinks, setDownloadLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [episodeLoading, setEpisodeLoading] = useState(false);
  const [downloadError, setDownloadError] = useState(false);
  const [contentIsMovie, setContentIsMovie] = useState(false);

  // Cache for episodes by season ID
  const [episodesCache, setEpisodesCache] = useState({});
  // Cache for download links by episode ID
  const [downloadLinksCache, setDownloadLinksCache] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setDownloadError(false);
      window.scrollTo({ top: 0, behavior: "smooth" });

      try {
        console.log('Fetching anime info for slug:', slug);
        const anime = await getAnimeInfo(slug);
        
        if (!anime) {
          console.error('No anime data received for slug:', slug);
          setDownloadError(true);
          setLoading(false);
          return;
        }

        console.log('Anime data received:', anime);
        setAnimeData(anime);

        const movieType = isMovie(anime.type);
        console.log('Is movie:', movieType, '| Type:', anime.type);
        setContentIsMovie(movieType);

        if (movieType) {
          console.log('Loading movie download links for:', anime.name);
          
          try {
            const movieLinks = await getMovieLinks(slug);
            console.log('Movie links response:', movieLinks);
            
            const links = extractDownloadLinks(movieLinks);
            console.log('Extracted download links:', links);
            
            if (links.length > 0) {
              setDownloadLinks(links);
            } else {
              console.error('No download links found for movie');
              setDownloadError(true);
            }
          } catch (error) {
            console.error('Error fetching movie download links:', error);
            setDownloadError(true);
          }
        } else {
          console.log('Loading series episodes for:', anime.name);
          const seasonData = await getSeasonInfo(anime.id);
          const allSeasons = seasonData.seasons || [];
          setSeasons(allSeasons);

          if (allSeasons.length > 0) {
            const firstSeason = allSeasons[0];
            setSelectedSeason(firstSeason);

            let episodeData;
            if (episodesCache[firstSeason.id]) {
              episodeData = episodesCache[firstSeason.id];
            } else {
              episodeData = await getEpisodes(firstSeason.id);
              setEpisodesCache(prev => ({
                ...prev,
                [firstSeason.id]: episodeData || []
              }));
            }
            
            setEpisodes(episodeData || []);

            const episode = episodeId
              ? episodeData.find((ep) => ep.id === parseInt(episodeId))
              : episodeData[0];

            setCurrentEpisode(episode);

            if (episode) {
              let downloadableLinks;
              if (downloadLinksCache[episode.id]) {
                downloadableLinks = downloadLinksCache[episode.id];
              } else {
                const links = await getEpisodeLinks(episode.id);
                downloadableLinks = extractDownloadLinks(links);
                setDownloadLinksCache(prev => ({
                  ...prev,
                  [episode.id]: downloadableLinks
                }));
              }
              
              if (downloadableLinks.length > 0) {
                setDownloadLinks(downloadableLinks);
              } else {
                setDownloadError(true);
              }
            }
          } else {
            console.warn('No seasons found for series');
            setDownloadError(true);
          }
        }
      } catch (error) {
        console.error("Error fetching download data:", error);
        setDownloadError(true);
      }

      setLoading(false);
    };

    fetchData();
  }, [slug, episodeId]);

  const handleSeasonChange = async (season) => {
    setSelectedSeason(season);
    setEpisodeLoading(true);

    try {
      if (episodesCache[season.id]) {
        setEpisodes(episodesCache[season.id]);
        if (episodesCache[season.id].length > 0) {
          await handleEpisodeSelect(episodesCache[season.id][0]);
        }
      } else {
        const episodeData = await getEpisodes(season.id);
        const episodesArray = episodeData || [];
        setEpisodes(episodesArray);
        
        setEpisodesCache(prev => ({
          ...prev,
          [season.id]: episodesArray
        }));

        if (episodesArray.length > 0) {
          await handleEpisodeSelect(episodesArray[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching episodes:", error);
    }

    setEpisodeLoading(false);
  };

  const handleEpisodeSelect = async (episode) => {
    setCurrentEpisode(episode);
    setEpisodeLoading(true);
    setDownloadError(false);
    setDownloadLinks([]);

    try {
      if (downloadLinksCache[episode.id]) {
        setDownloadLinks(downloadLinksCache[episode.id]);
      } else {
        const links = await getEpisodeLinks(episode.id);
        const downloadableLinks = extractDownloadLinks(links);
        
        if (downloadableLinks.length > 0) {
          setDownloadLinks(downloadableLinks);
          setDownloadLinksCache(prev => ({
            ...prev,
            [episode.id]: downloadableLinks
          }));
        } else {
          setDownloadError(true);
        }
      }

      navigate(`/download/${slug}/${episode.id}`, { replace: true });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("Error fetching download links:", error);
      setDownloadError(true);
    }

    setEpisodeLoading(false);
  };

  const handleNextEpisode = () => {
    if (contentIsMovie || episodeLoading) return;
    const currentIndex = episodes.findIndex((ep) => ep.id === currentEpisode.id);
    if (currentIndex < episodes.length - 1) {
      handleEpisodeSelect(episodes[currentIndex + 1]);
    }
  };

  const handlePreviousEpisode = () => {
    if (contentIsMovie || episodeLoading) return;
    const currentIndex = episodes.findIndex((ep) => ep.id === currentEpisode.id);
    if (currentIndex > 0) {
      handleEpisodeSelect(episodes[currentIndex - 1]);
    }
  };

  const handleWatchClick = () => {
    if (contentIsMovie) {
      navigate(`/watch/${slug}`);
    } else {
      navigate(`/watch/${slug}/${currentEpisode?.id}`);
    }
  };

  if (loading && !animeData) {
    return <LoadingScreen />;
  }

  if (!loading && !animeData) {
    return (
      <div style={{ background: "#0a0a0a", minHeight: "100vh", color: "#fff" }}>
        <Navbar />
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "calc(100vh - 80px)",
          marginTop: "clamp(60px, 15vw, 80px)",
          padding: "clamp(15px, 4vw, 20px)",
          textAlign: "center"
        }}>
          <div style={{ maxWidth: "500px", width: "100%" }}>
            <h2 style={{ 
              color: "#ef4444", 
              marginBottom: "10px",
              fontSize: "clamp(1.3rem, 4vw, 1.6rem)"
            }}>
              Error Loading Anime
            </h2>
            <p style={{ 
              color: "#999", 
              marginBottom: "20px",
              fontSize: "clamp(0.9rem, 2.5vw, 1rem)"
            }}>
              Could not load anime information. Please try again.
            </p>
            <button
              onClick={() => navigate(-1)}
              style={{
                background: "#e50914",
                border: "none",
                color: "#fff",
                padding: "clamp(10px, 2.5vw, 12px) clamp(20px, 5vw, 24px)",
                borderRadius: "clamp(6px, 1.5vw, 8px)",
                cursor: "pointer",
                fontSize: "clamp(0.9rem, 2.5vw, 1rem)",
                fontWeight: "500",
                minHeight: "44px"
              }}
            >
              Go Back
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ background: "#0a0a0a", minHeight: "100vh", color: "#fff" }}>
      <Navbar />

      {episodeLoading && <LoadingOverlay message="Loading Episode..." />}

      <div style={{ 
        marginTop: "clamp(60px, 15vw, 80px)", 
        paddingBottom: "clamp(30px, 8vw, 40px)" 
      }}>
        <div 
          className="container-fluid" 
          style={{ 
            maxWidth: "1200px",
            padding: "0 clamp(15px, 4vw, 20px)"
          }}
        >
          
          <button
            onClick={() => navigate(`/anime/${slug}`)}
            style={{
              background: "rgba(255,255,255,0.1)",
              border: "none",
              color: "#fff",
              padding: "clamp(10px, 2.5vw, 12px) clamp(16px, 4vw, 20px)",
              borderRadius: "clamp(6px, 1.5vw, 8px)",
              marginTop: "clamp(15px, 4vw, 20px)",
              marginBottom: "clamp(15px, 4vw, 20px)",
              display: "inline-flex",
              alignItems: "center",
              gap: "clamp(6px, 1.5vw, 8px)",
              cursor: "pointer",
              fontSize: "clamp(0.9rem, 2.5vw, 1rem)",
              fontWeight: "500",
              transition: "all 0.2s",
              minHeight: "44px"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.1)";
            }}
          >
            <ArrowLeft size={20} style={{ width: "clamp(16px, 4vw, 20px)", height: "clamp(16px, 4vw, 20px)" }} />
            <span className="d-none d-sm-inline">Back to Anime</span>
            <span className="d-inline d-sm-none">Back</span>
          </button>

          <TitleSection 
            animeData={animeData} 
            currentEpisode={currentEpisode}
            contentIsMovie={contentIsMovie}
          />

          {!contentIsMovie && (
            <div style={{ 
              display: "flex", 
              gap: "clamp(8px, 2vw, 10px)", 
              marginBottom: "clamp(15px, 4vw, 20px)",
              flexWrap: "wrap"
            }}>
              <NavigationButton
                onClick={handlePreviousEpisode}
                disabled={episodes.findIndex((ep) => ep.id === currentEpisode?.id) === 0}
                loading={episodeLoading}
                icon={ChevronLeft}
                text="Previous"
              />

              <NavigationButton
                onClick={handleWatchClick}
                disabled={episodeLoading}
                icon={Play}
                text="Watch"
                variant="primary"
              />

              <NavigationButton
                onClick={handleNextEpisode}
                disabled={episodes.findIndex((ep) => ep.id === currentEpisode?.id) === episodes.length - 1}
                loading={episodeLoading}
                icon={ChevronRight}
                text="Next"
              />
            </div>
          )}

          {contentIsMovie && (
            <div style={{ marginBottom: "clamp(15px, 4vw, 20px)" }}>
              <button
                onClick={handleWatchClick}
                style={{
                  width: "100%",
                  background: "#e50914",
                  border: "none",
                  color: "#fff",
                  padding: "clamp(12px, 3vw, 15px)",
                  borderRadius: "clamp(8px, 2vw, 10px)",
                  fontSize: "clamp(0.95rem, 2.8vw, 1rem)",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "clamp(6px, 1.5vw, 8px)",
                  cursor: "pointer",
                  minHeight: "50px",
                  transition: "all 0.2s"
                }}
              >
                <Play size={20} style={{ width: "clamp(16px, 4vw, 20px)", height: "clamp(16px, 4vw, 20px)" }} />
                Watch Movie
              </button>
            </div>
          )}

          {!contentIsMovie && (
            <SeasonSelector 
              seasons={seasons}
              selectedSeason={selectedSeason}
              onSeasonChange={handleSeasonChange}
              disabled={episodeLoading}
            />
          )}

          {!contentIsMovie && episodes.length > 0 && (
            <EpisodeGrid
              episodes={episodes}
              currentEpisode={currentEpisode}
              onEpisodeSelect={handleEpisodeSelect}
              disabled={episodeLoading}
            />
          )}

          <DownloadLinksSection
            downloadLinks={downloadLinks}
            downloadError={downloadError}
            contentIsMovie={contentIsMovie}
            loading={episodeLoading}
          />

          <DescriptionSection overview={animeData?.overview} />

        </div>
      </div>

      <Footer />
    </div>
  );
};

export default DownloadPage;