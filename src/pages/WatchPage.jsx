import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Play,
  ChevronLeft,
  ChevronRight,
  Download,
  Share2,
  List,
  X,
  ChevronDown,
  Film,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AnimeCard from "../components/AnimeCard";
import {
  getAnimeInfo,
  getSeasonInfo,
  getEpisodes,
  getEpisodeLinks,
  getMovieLinks,
  getPopularAnime,
} from "../services/api";

// ==================== UTILITY FUNCTIONS ====================
const isMovie = (type) => type?.toLowerCase() === 'movie';

const extractValidServer = (links) => {
  let servers = [];
  
  if (links && links.servers && Array.isArray(links.servers)) {
    servers = links.servers;
  } else if (links && links.links && Array.isArray(links.links)) {
    servers = links.links;
  } else if (Array.isArray(links)) {
    servers = links;
  }
  
  if (servers.length > 0) {
    const validServer = servers.find((s) => {
      return (s.watch && s.watch.trim() !== "") ||
             (s.url && s.url.trim() !== "") ||
             (s.embed && s.embed.trim() !== "") ||
             (s.link && s.link.trim() !== "");
    });
    
    if (validServer) {
      return (validServer.watch || validServer.url || validServer.embed || validServer.link).trim();
    }
  }
  
  return null;
};

// ==================== LOADING COMPONENTS ====================
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

const LoadingScreen = () => (
  <div style={{ background: "#0a0a0a", minHeight: "100vh", color: "#fff" }}>
    <Navbar />
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "calc(100vh - 80px)",
      marginTop: "80px",
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{
          position: "relative",
          marginBottom: "30px",
          display: "inline-block",
        }}>
          <div style={{
            width: "80px",
            height: "80px",
            border: "4px solid rgba(229, 9, 20, 0.2)",
            borderTop: "4px solid #e50914",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }} />
          <Play
            size={32}
            fill="#e50914"
            color="#e50914"
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              animation: "pulse 2s ease-in-out infinite",
            }}
          />
        </div>
        <h2 style={{
          fontSize: "1.8rem",
          fontWeight: "600",
          marginBottom: "10px",
          background: "linear-gradient(135deg, #e50914 0%, #ff1744 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}>
          Loading Player...
        </h2>
        <p style={{ color: "#999", fontSize: "1rem" }}>
          Preparing your streaming experience
        </p>
        <div style={{
          display: "flex",
          gap: "8px",
          justifyContent: "center",
          marginTop: "20px",
        }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: "12px",
                height: "12px",
                background: "#e50914",
                borderRadius: "50%",
                animation: `bounce 1.4s ease-in-out ${i * 0.16}s infinite both`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
    <AnimationStyles />
  </div>
);

// ==================== VIDEO PLAYER COMPONENT ====================
const VideoPlayer = ({ streamingUrl, videoError, isMovie, setVideoError }) => (
  <div style={{
    background: "#000",
    borderRadius: "12px",
    overflow: "hidden",
    marginBottom: "20px",
    position: "relative",
  }}>
    <div style={{
      position: "relative",
      paddingBottom: "56.25%",
      height: 0,
    }}>
      {streamingUrl ? (
        <iframe
          src={streamingUrl}
          title={isMovie ? "Movie Player" : "Anime Episode Player"}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            border: "none",
          }}
          allowFullScreen
          allow="autoplay; fullscreen; picture-in-picture"
          onError={() => {
            console.error("Iframe failed to load");
            setVideoError(true);
          }}
        />
      ) : (
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#000",
          flexDirection: "column"
        }}>
          <div style={{ textAlign: "center", color: "#999" }}>
            {videoError ? (
              <>
                <Play size={64} style={{ marginBottom: "20px", opacity: 0.5 }} />
                <p style={{ fontSize: "1.2rem", marginBottom: "10px" }}>Video not available</p>
                <p style={{ fontSize: "0.9rem", color: "#666" }}>
                  The streaming source could not be loaded
                </p>
                <button
                  className="btn btn-danger mt-3"
                  onClick={() => window.location.reload()}
                >
                  Retry
                </button>
              </>
            ) : (
              <>
                <div className="spinner-border text-danger" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p style={{ marginTop: "20px" }}>Loading video...</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  </div>
);

// ==================== CONTROL BUTTON COMPONENT ====================
const ControlButton = ({ onClick, disabled, icon: Icon, text, variant = 'default', className = '' }) => {
  const variants = {
    default: {
      background: "rgba(255,255,255,0.1)",
      color: "#fff",
    },
    primary: {
      background: "#e50914",
      color: "#fff",
    },
    download: {
      background: "rgba(34, 197, 94, 0.2)",
      color: "#22c55e",
      border: "1px solid #22c55e",
    }
  };

  const style = variants[variant] || variants.default;

  return (
    <button
      className={`btn px-4 ${className}`}
      onClick={onClick}
      disabled={disabled}
      style={{
        ...style,
        border: style.border || "none",
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      {Icon && <Icon size={18} className="me-2" />}
      {text}
      {Icon && text && Icon === ChevronRight && <Icon size={18} className="ms-2" />}
    </button>
  );
};

// ==================== EPISODE BUTTON COMPONENT ====================
const EpisodeButton = ({ episode, isActive, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      className="btn w-100 text-start"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: isActive ? "#e50914" : (isHovered ? "rgba(229, 9, 20, 0.2)" : "rgba(255,255,255,0.1)"),
        color: "#fff",
        border: isActive ? "2px solid #ff1744" : "1px solid rgba(255,255,255,0.2)",
        padding: "12px",
        transition: "all 0.3s",
      }}
    >
      <div className="fw-bold">EP {episode.number}</div>
      <small style={{
        color: isActive ? "#fff" : "#999",
        fontSize: "0.75rem",
        display: "block",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}>
        {episode.name}
      </small>
    </button>
  );
};

// ==================== SIDEBAR EPISODE LIST ====================
const SidebarEpisodeList = ({ episodes, currentEpisode, onEpisodeSelect }) => (
  <div className="p-3" style={{
    background: "rgba(255,255,255,0.05)",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.1)",
    maxHeight: "600px",
    overflowY: "auto",
  }}>
    <h6 className="fw-bold mb-3" style={{ color: "#e50914" }}>
      Episodes ({episodes.length})
    </h6>
    <div className="d-flex flex-column gap-2">
      {episodes.map((episode) => (
        <button
          key={episode.id}
          className="btn text-start"
          onClick={() => onEpisodeSelect(episode)}
          style={{
            background: episode.id === currentEpisode?.id ? "#e50914" : "rgba(255,255,255,0.05)",
            color: "#fff",
            border: episode.id === currentEpisode?.id ? "2px solid #ff1744" : "1px solid rgba(255,255,255,0.1)",
            padding: "12px",
            transition: "all 0.3s",
          }}
          onMouseEnter={(e) => {
            if (episode.id !== currentEpisode?.id) {
              e.currentTarget.style.background = "rgba(229, 9, 20, 0.2)";
            }
          }}
          onMouseLeave={(e) => {
            if (episode.id !== currentEpisode?.id) {
              e.currentTarget.style.background = "rgba(255,255,255,0.05)";
            }
          }}
        >
          <div className="d-flex align-items-center">
            {episode.id === currentEpisode?.id && (
              <Play size={16} fill="#fff" className="me-2" />
            )}
            <div style={{ flex: 1 }}>
              <div className="fw-bold">Episode {episode.number}</div>
              <small style={{
                color: episode.id === currentEpisode?.id ? "#fff" : "#999",
                fontSize: "0.75rem",
              }}>
                {episode.name}
              </small>
              {episode.note && (
                <div>
                  <small style={{ color: "#ffc107" }}>{episode.note}</small>
                </div>
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  </div>
);

// ==================== MAIN WATCH PAGE ====================
const WatchPage = () => {
  const { slug, episodeId } = useParams();
  const navigate = useNavigate();

  const [animeData, setAnimeData] = useState(null);
  const [seasons, setSeasons] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [currentEpisode, setCurrentEpisode] = useState(null);
  const [streamingUrl, setStreamingUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [showEpisodeList, setShowEpisodeList] = useState(false);
  const [relatedAnime, setRelatedAnime] = useState([]);
  const [otherAnime, setOtherAnime] = useState([]);
  const [displayedRelatedCount, setDisplayedRelatedCount] = useState(12);
  const [displayedOtherCount, setDisplayedOtherCount] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [contentIsMovie, setContentIsMovie] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setVideoError(false);
      setStreamingUrl("");
      window.scrollTo({ top: 0, behavior: "smooth" });

      try {
        const anime = await getAnimeInfo(slug);
        setAnimeData(anime);

        const related = await getPopularAnime("month", 1, 24);
        const other = await getPopularAnime("week", 1, 30);
        setRelatedAnime(related.posts || []);
        setOtherAnime(other.posts || []);

        const movieType = isMovie(anime.type);
        setContentIsMovie(movieType);

        if (movieType) {
          try {
            const movieLinks = await getMovieLinks(slug);
            const url = extractValidServer(movieLinks);
            
            if (url) {
              setStreamingUrl(url);
            } else {
              setVideoError(true);
            }
          } catch (error) {
            console.error("Error fetching movie links:", error);
            setVideoError(true);
          }
        } else {
          const seasonData = await getSeasonInfo(anime.id);
          const allSeasons = seasonData.seasons || [];
          setSeasons(allSeasons);

          if (allSeasons.length > 0) {
            const firstSeason = allSeasons[0];
            setSelectedSeason(firstSeason);

            const episodeData = await getEpisodes(firstSeason.id);
            setEpisodes(episodeData || []);

            const episode = episodeId
              ? episodeData.find((ep) => ep.id === parseInt(episodeId))
              : episodeData[0];

            setCurrentEpisode(episode);

            if (episode) {
              const links = await getEpisodeLinks(episode.id);
              const url = extractValidServer(links);
              
              if (url) {
                setStreamingUrl(url);
              } else {
                setVideoError(true);
              }
            }
          }
        }
      } catch (error) {
        console.error("Error fetching watch data:", error);
        setVideoError(true);
      }

      setLoading(false);
    };

    fetchData();
  }, [slug, episodeId]);

  const handleSeasonChange = async (season) => {
    setSelectedSeason(season);
    setLoading(true);

    try {
      const episodeData = await getEpisodes(season.id);
      setEpisodes(episodeData || []);

      if (episodeData && episodeData.length > 0) {
        handleEpisodeSelect(episodeData[0]);
      }
    } catch (error) {
      console.error("Error fetching episodes:", error);
    }

    setLoading(false);
  };

  const handleEpisodeSelect = async (episode) => {
    setCurrentEpisode(episode);
    setShowEpisodeList(false);
    setLoading(true);
    setVideoError(false);

    try {
      const links = await getEpisodeLinks(episode.id);
      const url = extractValidServer(links);
      
      if (url) {
        setStreamingUrl(url);
      } else {
        setVideoError(true);
      }

      navigate(`/watch/${slug}/${episode.id}`, { replace: true });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("Error fetching streaming URL:", error);
      setVideoError(true);
    }

    setLoading(false);
  };

  const handleNextEpisode = () => {
    if (contentIsMovie) return;
    const currentIndex = episodes.findIndex((ep) => ep.id === currentEpisode.id);
    if (currentIndex < episodes.length - 1) {
      handleEpisodeSelect(episodes[currentIndex + 1]);
    }
  };

  const handlePreviousEpisode = () => {
    if (contentIsMovie) return;
    const currentIndex = episodes.findIndex((ep) => ep.id === currentEpisode.id);
    if (currentIndex > 0) {
      handleEpisodeSelect(episodes[currentIndex - 1]);
    }
  };

  const handleDownloadClick = () => {
    if (contentIsMovie) {
      navigate(`/download/${slug}`);
    } else {
      navigate(`/download/${slug}/${currentEpisode?.id || ''}`);
    }
  };

  const handleShowMoreAnime = () => {
    setLoadingMore(true);
    setTimeout(() => {
      if (displayedRelatedCount < relatedAnime.length) {
        setDisplayedRelatedCount((prev) => Math.min(prev + 12, relatedAnime.length));
      } else if (displayedOtherCount < otherAnime.length) {
        setDisplayedOtherCount((prev) => Math.min(prev + 12, otherAnime.length));
      }
      setLoadingMore(false);
    }, 500);
  };

  const totalDisplayed = displayedRelatedCount + displayedOtherCount;
  const totalAvailable = relatedAnime.length + otherAnime.length;
  const hasMoreToShow = totalDisplayed < totalAvailable;

  if (loading && !currentEpisode && !contentIsMovie) {
    return <LoadingScreen />;
  }

  return (
    <div style={{ background: "#0a0a0a", minHeight: "100vh", color: "#fff" }}>
      <Navbar />

      <div style={{ marginTop: "80px", paddingBottom: "60px" }}>
        <div className="container-fluid" style={{ padding: "0 90px", maxWidth: contentIsMovie ? "1400px" : "100%" }}>
          <div className="row">
            {/* Main Video Player */}
            <div className={contentIsMovie ? "col-12" : "col-lg-9"} style={{ paddingTop: "20px" }}>
              <VideoPlayer
                streamingUrl={streamingUrl}
                videoError={videoError}
                isMovie={contentIsMovie}
                setVideoError={setVideoError}
              />

              {/* Content Info & Controls */}
              <div className="p-4" style={{
                background: "rgba(255,255,255,0.05)",
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.1)",
                marginBottom: "20px",
              }}>
                <div className="d-flex align-items-start justify-content-between mb-3">
                  <div>
                    <h3 className="fw-bold mb-2">
                      {contentIsMovie && <Film size={24} className="me-2" style={{ display: "inline", marginBottom: "4px" }} />}
                      {animeData?.name}
                    </h3>
                    <h5 style={{ color: "#ccc" }}>
                      {contentIsMovie ? (
                        <span className="badge bg-info">Movie</span>
                      ) : (
                        <>
                          {selectedSeason && `Season ${selectedSeason.num} - `}
                          Episode {currentEpisode?.number}: {currentEpisode?.name}
                        </>
                      )}
                    </h5>
                  </div>
                </div>

                {/* Navigation Controls */}
                <div className="d-flex gap-3 mt-4 flex-wrap">
                  {!contentIsMovie && (
                    <>
                      <ControlButton
                        onClick={handlePreviousEpisode}
                        disabled={episodes.findIndex((ep) => ep.id === currentEpisode?.id) === 0}
                        icon={ChevronLeft}
                        text="Previous"
                      />

                      <ControlButton
                        onClick={() => setShowEpisodeList(!showEpisodeList)}
                        icon={List}
                        text="Episodes"
                        variant="primary"
                      />

                      <ControlButton
                        onClick={handleNextEpisode}
                        disabled={episodes.findIndex((ep) => ep.id === currentEpisode?.id) === episodes.length - 1}
                        icon={ChevronRight}
                        text="Next"
                      />
                    </>
                  )}

                  <ControlButton
                    onClick={handleDownloadClick}
                    icon={Download}
                    text="Download"
                    variant="download"
                    className="ms-auto"
                  />

                  <ControlButton
                    onClick={() => {}}
                    icon={Share2}
                    text="Share"
                  />
                </div>

                {/* Episode List Dropdown - Only for Series */}
                {!contentIsMovie && showEpisodeList && (
                  <div className="mt-4 p-3" style={{
                    background: "rgba(0,0,0,0.5)",
                    borderRadius: "10px",
                    maxHeight: "400px",
                    overflowY: "auto",
                  }}>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h6 className="fw-bold mb-0">Select Episode</h6>
                      <button
                        className="btn btn-sm"
                        onClick={() => setShowEpisodeList(false)}
                        style={{ background: "transparent", border: "none", color: "#fff" }}
                      >
                        <X size={20} />
                      </button>
                    </div>
                    <div className="row g-2">
                      {episodes.map((episode) => (
                        <div key={episode.id} className="col-md-4 col-sm-6">
                          <EpisodeButton
                            episode={episode}
                            isActive={episode.id === currentEpisode?.id}
                            onClick={() => handleEpisodeSelect(episode)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="p-4 mb-4" style={{
                background: "rgba(255,255,255,0.05)",
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.1)",
              }}>
                <h5 className="fw-bold mb-3">About this {contentIsMovie ? 'movie' : 'anime'}</h5>
                <p style={{ color: "#ccc", lineHeight: "1.8" }}>
                  {animeData?.overview || "No description available."}
                </p>
              </div>
            </div>

            {/* Sidebar - Only for Series */}
            {!contentIsMovie && (
              <div className="col-lg-3" style={{ paddingTop: "20px" }}>
                {seasons.length > 1 && (
                  <div className="mb-3 p-3" style={{
                    background: "rgba(255,255,255,0.05)",
                    borderRadius: "12px",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}>
                    <h6 className="fw-bold mb-3" style={{ color: "#e50914" }}>Seasons</h6>
                    <div className="d-flex flex-column gap-2">
                      {seasons.map((season) => (
                        <button
                          key={season.id}
                          className="btn text-start"
                          onClick={() => handleSeasonChange(season)}
                          style={{
                            background: selectedSeason?.id === season.id ? "#e50914" : "rgba(255,255,255,0.1)",
                            color: "#fff",
                            border: "none",
                            fontWeight: selectedSeason?.id === season.id ? "600" : "400",
                          }}
                        >
                          Season {season.num}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <SidebarEpisodeList
                  episodes={episodes}
                  currentEpisode={currentEpisode}
                  onEpisodeSelect={handleEpisodeSelect}
                />
              </div>
            )}
          </div>

          {/* Related/Recommended Content Section */}
          <div className="row mt-5">
            <div className="col-12">
              <div className="p-4" style={{
                background: "rgba(255,255,255,0.05)",
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.1)",
              }}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div>
                    <h4 className="fw-bold mb-1" style={{ color: "#e50914" }}>
                      More {contentIsMovie ? 'Movies' : 'Anime'} To Watch
                    </h4>
                    <p style={{ color: "#999", fontSize: "0.9rem", margin: 0 }}>
                      {displayedOtherCount > 0
                        ? "Discover more amazing shows"
                        : `Similar ${contentIsMovie ? 'movies' : 'anime'} you might enjoy`}
                    </p>
                  </div>
                  <span style={{
                    color: "#666",
                    fontSize: "0.9rem",
                    background: "rgba(255,255,255,0.05)",
                    padding: "8px 16px",
                    borderRadius: "20px",
                  }}>
                    Showing {totalDisplayed} of {totalAvailable}
                  </span>
                </div>

                <div className="row g-3">
                  {relatedAnime.slice(0, displayedRelatedCount).map((anime) => (
                    <div
                      key={anime.id}
                      className="col-xl-2 col-lg-3 col-md-4 col-sm-6"
                      onClick={() => navigate(`/anime/${anime.slug}`)}
                      style={{ cursor: "pointer" }}
                    >
                      <AnimeCard anime={anime} />
                    </div>
                  ))}

                  {displayedRelatedCount >= relatedAnime.length &&
                    otherAnime.slice(0, displayedOtherCount).map((anime) => (
                      <div
                        key={anime.id}
                        className="col-xl-2 col-lg-3 col-md-4 col-sm-6"
                        onClick={() => navigate(`/anime/${anime.slug}`)}
                        style={{ cursor: "pointer" }}
                      >
                        <AnimeCard anime={anime} />
                      </div>
                    ))}
                </div>

                {hasMoreToShow && (
                  <div className="text-center mt-4">
                    <button
                      className="btn px-5 py-3"
                      onClick={handleShowMoreAnime}
                      disabled={loadingMore}
                      style={{
                        background: loadingMore
                          ? "rgba(229, 9, 20, 0.5)"
                          : "linear-gradient(135deg, #e50914 0%, #ff1744 100%)",
                        color: "#fff",
                        border: "none",
                        borderRadius: "30px",
                        fontSize: "1rem",
                        fontWeight: "600",
                        transition: "all 0.3s",
                        boxShadow: "0 4px 15px rgba(229, 9, 20, 0.3)",
                        cursor: loadingMore ? "not-allowed" : "pointer",
                      }}
                    >
                      {loadingMore ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Loading...
                        </>
                      ) : (
                        <>
                          Show More {contentIsMovie ? 'Movies' : 'Anime'}
                          <ChevronDown size={20} className="ms-2" />
                        </>
                      )}
                    </button>
                    <p style={{ color: "#666", fontSize: "0.85rem", marginTop: "15px" }}>
                      {totalAvailable - totalDisplayed} more available
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default WatchPage;