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

// ==================== LOADING COMPONENT ====================
const LoadingScreen = () => (
  <div style={{ background: "#0a0a0a", minHeight: "100vh", color: "#fff" }}>
    <Navbar />
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "calc(100vh - 80px)",
      marginTop: "80px",
      padding: "20px"
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{
          width: "60px",
          height: "60px",
          border: "4px solid rgba(34, 197, 94, 0.2)",
          borderTop: "4px solid #22c55e",
          borderRadius: "50%",
          animation: "spinLoader 1s linear infinite",
          margin: "0 auto 20px"
        }} />
        <h2 style={{
          fontSize: "1.3rem",
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

// ==================== INLINE LOADING OVERLAY ====================
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
      zIndex: 9999
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ display: "inline-block" }}>
          <Loader2 
            size={48} 
            color="#22c55e" 
            style={{
              animation: "spinRotate 1s linear infinite",
              marginBottom: "15px",
              display: "block"
            }}
          />
        </div>
        <h3 style={{
          fontSize: "1.2rem",
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

// ==================== NAVIGATION BUTTON COMPONENT ====================
const NavigationButton = ({ onClick, disabled, icon: Icon, text, variant = 'default', loading = false }) => {
  const [isHovered, setIsHovered] = useState(false);

  const getStyles = () => {
    const baseStyle = {
      flex: 1,
      border: "none",
      color: "#fff",
      padding: "15px",
      borderRadius: "10px",
      fontSize: "1rem",
      fontWeight: "600",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      cursor: disabled || loading ? "not-allowed" : "pointer",
      opacity: disabled || loading ? 0.5 : 1,
      transition: "all 0.2s",
      position: "relative"
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
            <Loader2 size={20} />
          </span>
          {text}
        </>
      ) : (
        <>
          {Icon && text !== 'Next' && <Icon size={20} />}
          {text}
          {Icon && text === 'Next' && <Icon size={20} />}
        </>
      )}
    </button>
  );
};

// ==================== TITLE SECTION COMPONENT ====================
const TitleSection = ({ animeData, currentEpisode, contentIsMovie }) => (
  <div style={{
    background: "rgba(255,255,255,0.05)",
    padding: "20px",
    borderRadius: "12px",
    marginBottom: "20px"
  }}>
    <h2 style={{ fontSize: "1.5rem", marginBottom: "8px" }}>
      {contentIsMovie && <Film size={24} className="me-2" style={{ display: "inline", marginBottom: "4px" }} />}
      {animeData?.name}
    </h2>
    {contentIsMovie ? (
      <p style={{ color: "#22c55e", fontSize: "1.1rem", margin: 0 }}>
        <span className="badge bg-info me-2">Movie</span>
        Download available below
      </p>
    ) : (
      <p style={{ color: "#22c55e", fontSize: "1.1rem", margin: 0 }}>
        Episode {currentEpisode?.number}: {currentEpisode?.name}
      </p>
    )}
  </div>
);

// ==================== SEASON SELECTOR COMPONENT ====================
const SeasonSelector = ({ seasons, selectedSeason, onSeasonChange, disabled }) => {
  if (seasons.length <= 1) return null;

  return (
    <div style={{
      background: "rgba(255,255,255,0.05)",
      borderRadius: "12px",
      padding: "20px",
      marginBottom: "20px",
      opacity: disabled ? 0.6 : 1,
      pointerEvents: disabled ? "none" : "auto"
    }}>
      <h4 style={{ fontSize: "1.1rem", marginBottom: "15px", color: "#22c55e" }}>
        Select Season
      </h4>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
        gap: "10px"
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
              padding: "12px",
              borderRadius: "8px",
              fontSize: "1rem",
              fontWeight: selectedSeason?.id === season.id ? "600" : "400",
              cursor: disabled ? "not-allowed" : "pointer"
            }}
          >
            Season {season.num}
          </button>
        ))}
      </div>
    </div>
  );
};

// ==================== EPISODE GRID COMPONENT ====================
const EpisodeGrid = ({ episodes, currentEpisode, onEpisodeSelect, disabled }) => (
  <div style={{
    background: "rgba(255,255,255,0.05)",
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "20px",
    opacity: disabled ? 0.6 : 1,
    pointerEvents: disabled ? "none" : "auto"
  }}>
    <h4 style={{ fontSize: "1.1rem", marginBottom: "15px", color: "#22c55e" }}>
      All Episodes ({episodes.length})
    </h4>
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
      gap: "10px",
      maxHeight: "500px",
      overflowY: "auto"
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
        padding: "15px 10px",
        borderRadius: "8px",
        cursor: disabled ? "not-allowed" : "pointer",
        textAlign: "center",
        transition: "all 0.2s"
      }}
    >
      <div style={{ fontWeight: "600", fontSize: "1rem", marginBottom: "4px" }}>
        EP {episode.number}
      </div>
      <div style={{
        fontSize: "0.75rem",
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

// ==================== DOWNLOAD LINKS SECTION ====================
const DownloadLinksSection = ({ downloadLinks, downloadError, contentIsMovie, loading }) => (
  <div style={{
    background: "linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(22, 163, 74, 0.05) 100%)",
    border: "1px solid rgba(34, 197, 94, 0.3)",
    borderRadius: "12px",
    padding: "25px 20px",
    marginBottom: "20px",
    position: "relative"
  }}>
    <div style={{ textAlign: "center", marginBottom: "25px" }}>
      <Download size={48} color="#22c55e" style={{ marginBottom: "10px" }} />
      <h3 style={{ color: "#22c55e", fontSize: "1.3rem", marginBottom: "5px" }}>
        Download Links {contentIsMovie && "(Movie)"}
      </h3>
      <p style={{ color: "#999", fontSize: "0.9rem", margin: 0 }}>
        Tap to download
      </p>
    </div>

    {loading ? (
      <div style={{ textAlign: "center", padding: "40px 20px" }}>
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
              display: "block"
            }} 
          />
        </div>
        <p style={{ color: "#999", margin: 0 }}>Loading download links...</p>
      </div>
    ) : downloadError ? (
      <div style={{
        background: "rgba(239, 68, 68, 0.1)",
        border: "1px solid rgba(239, 68, 68, 0.3)",
        borderRadius: "8px",
        padding: "20px",
        textAlign: "center"
      }}>
        <p style={{ color: "#ef4444", margin: 0 }}>
          ⚠️ No download links available for this {contentIsMovie ? 'movie' : 'episode'}
        </p>
      </div>
    ) : downloadLinks.length > 0 ? (
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {downloadLinks.map((link, index) => (
          <DownloadLinkCard key={index} link={link} />
        ))}
      </div>
    ) : (
      <div style={{ textAlign: "center", padding: "20px", color: "#999" }}>
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
        borderRadius: "10px",
        padding: "18px",
        textDecoration: "none",
        color: "#fff",
        transition: "all 0.2s"
      }}
    >
      <div>
        <div style={{
          color: "#22c55e",
          fontWeight: "600",
          fontSize: "1.1rem",
          marginBottom: "4px"
        }}>
          {link.quality}
        </div>
        <div style={{ color: "#999", fontSize: "0.85rem" }}>
          {link.size}
        </div>
      </div>
      <ExternalLink size={24} color="#22c55e" />
    </a>
  );
};

// ==================== DESCRIPTION SECTION ====================
const DescriptionSection = ({ overview }) => (
  <div style={{
    background: "rgba(255,255,255,0.05)",
    borderRadius: "12px",
    padding: "20px",
    marginTop: "20px"
  }}>
    <h4 style={{ fontSize: "1.1rem", marginBottom: "12px" }}>About</h4>
    <p style={{ color: "#ccc", lineHeight: "1.6", margin: 0 }}>
      {overview || "No description available."}
    </p>
  </div>
);

// ==================== MAIN DOWNLOAD PAGE ====================
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

            // Check cache first for episodes
            let episodeData;
            if (episodesCache[firstSeason.id]) {
              episodeData = episodesCache[firstSeason.id];
            } else {
              episodeData = await getEpisodes(firstSeason.id);
              // Cache the episodes
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
              // Check cache first for download links
              let downloadableLinks;
              if (downloadLinksCache[episode.id]) {
                downloadableLinks = downloadLinksCache[episode.id];
              } else {
                const links = await getEpisodeLinks(episode.id);
                downloadableLinks = extractDownloadLinks(links);
                // Cache the download links
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
      // Check if episodes are already cached for this season
      if (episodesCache[season.id]) {
        setEpisodes(episodesCache[season.id]);
        if (episodesCache[season.id].length > 0) {
          await handleEpisodeSelect(episodesCache[season.id][0]);
        }
      } else {
        // Fetch episodes if not cached
        const episodeData = await getEpisodes(season.id);
        const episodesArray = episodeData || [];
        setEpisodes(episodesArray);
        
        // Cache the episodes
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
      // Check if download links are already cached for this episode
      if (downloadLinksCache[episode.id]) {
        setDownloadLinks(downloadLinksCache[episode.id]);
      } else {
        // Fetch download links if not cached
        const links = await getEpisodeLinks(episode.id);
        const downloadableLinks = extractDownloadLinks(links);
        
        if (downloadableLinks.length > 0) {
          setDownloadLinks(downloadableLinks);
          // Cache the download links
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
          marginTop: "80px",
          padding: "20px",
          textAlign: "center"
        }}>
          <div>
            <h2 style={{ color: "#ef4444", marginBottom: "10px" }}>Error Loading Anime</h2>
            <p style={{ color: "#999", marginBottom: "20px" }}>
              Could not load anime information. Please try again.
            </p>
            <button
              onClick={() => navigate(-1)}
              style={{
                background: "#e50914",
                border: "none",
                color: "#fff",
                padding: "12px 24px",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "1rem"
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

      <div style={{ marginTop: "80px", paddingBottom: "40px" }}>
        <div className="container-fluid px-3 px-md-4 px-lg-5" style={{ maxWidth: "1200px" }}>
          
          <button
            onClick={() => navigate(`/anime/${slug}`)}
            style={{
              background: "rgba(255,255,255,0.1)",
              border: "none",
              color: "#fff",
              padding: "12px 20px",
              borderRadius: "8px",
              marginTop: "20px",
              marginBottom: "20px",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
              fontSize: "1rem",
              fontWeight: "500",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.1)";
            }}
          >
            <ArrowLeft size={20} />
            Back to Anime
          </button>

          <TitleSection 
            animeData={animeData} 
            currentEpisode={currentEpisode}
            contentIsMovie={contentIsMovie}
          />

          {!contentIsMovie && (
            <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
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
            <div style={{ marginBottom: "20px" }}>
              <button
                onClick={handleWatchClick}
                style={{
                  width: "100%",
                  background: "#e50914",
                  border: "none",
                  color: "#fff",
                  padding: "15px",
                  borderRadius: "10px",
                  fontSize: "1rem",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  cursor: "pointer"
                }}
              >
                <Play size={20} />
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