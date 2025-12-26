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
  AlertCircle,
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

// ==================== LOADING SCREEN ====================
const LoadingScreen = () => {
  return (
  <div style={{ background: "#0a0a0a", minHeight: "100vh", color: "#fff" }}>
    <Navbar />
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "calc(100vh - 80px)",
      marginTop: "80px",
    }}>
      <div style={{ textAlign: "center", position: "relative" }}>
        <div style={{
          width: "120px",
          height: "120px",
          margin: "0 auto",
          position: "relative"
        }}>
          <div style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            border: "4px solid transparent",
            borderTopColor: "#e50914",
            borderRightColor: "#e50914",
            borderRadius: "50%",
            animation: "rotate 1.5s linear infinite"
          }} />
          <div style={{
            position: "absolute",
            width: "90px",
            height: "90px",
            top: "15px",
            left: "15px",
            border: "4px solid transparent",
            borderBottomColor: "#ff6b6b",
            borderLeftColor: "#ff6b6b",
            borderRadius: "50%",
            animation: "rotateReverse 1s linear infinite"
          }} />
          <div style={{
            position: "absolute",
            width: "60px",
            height: "60px",
            top: "30px",
            left: "30px",
            border: "3px solid transparent",
            borderTopColor: "#ff9999",
            borderRadius: "50%",
            animation: "rotate 0.8s linear infinite"
          }} />
          
          <div style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            animation: "pulse 1.5s ease-in-out infinite"
          }}>
            <Play size={32} fill="#e50914" color="#e50914" />
          </div>
        </div>
        
        <p style={{ 
          marginTop: "30px", 
          color: "#999",
          fontSize: "1.1rem",
          fontWeight: "500",
          letterSpacing: "2px"
        }}>
          LOADING<span style={{ animation: "dots 1.5s steps(4, end) infinite" }}>...</span>
        </p>
        
        <div style={{
          display: "flex",
          gap: "8px",
          justifyContent: "center",
          marginTop: "20px"
        }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              style={{
                width: "4px",
                height: "30px",
                background: "linear-gradient(to top, #e50914, #ff6b6b)",
                borderRadius: "2px",
                animation: `wave 1.2s ease-in-out infinite`,
                animationDelay: `${i * 0.1}s`
              }}
            />
          ))}
        </div>
      </div>
      
      <style>{`
        @keyframes rotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes rotateReverse {
          0% { transform: rotate(360deg); }
          100% { transform: rotate(0deg); }
        }
        
        @keyframes pulse {
          0%, 100% { 
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
          50% { 
            transform: translate(-50%, -50%) scale(1.2);
            opacity: 0.8;
          }
        }
        
        @keyframes dots {
          0%, 20% { content: '.'; }
          40% { content: '..'; }
          60%, 100% { content: '...'; }
        }
        
        @keyframes wave {
          0%, 100% { 
            transform: scaleY(0.5);
            opacity: 0.5;
          }
          50% { 
            transform: scaleY(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  </div>
  );
};

// ==================== VIDEO PLAYER ====================
const VideoPlayer = ({ streamingUrl, videoError, isMovie, setVideoError }) => {
  const iframeRef = useRef(null);
  const [loadTimeout, setLoadTimeout] = useState(false);

  useEffect(() => {
    if (streamingUrl) {
      const timer = setTimeout(() => {
        setLoadTimeout(true);
      }, 15000);

      return () => clearTimeout(timer);
    }
  }, [streamingUrl]);

  return (
  <div style={{
    background: "#000",
    borderRadius: "8px",
    overflow: "hidden",
    position: "relative",
    marginBottom: "20px",
  }}>
    <div 
      style={{
        position: "relative",
        paddingBottom: "56.25%",
        height: 0,
      }}
    >
      {streamingUrl ? (
        <>
          <iframe
            ref={iframeRef}
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
            allow="autoplay *; fullscreen *; picture-in-picture *; accelerometer *; gyroscope *; encrypted-media *; clipboard-write"
            allowFullScreen={true}
            webkitallowfullscreen="true"
            mozallowfullscreen="true"
            scrolling="no"
            frameBorder="0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation"
          />
          {loadTimeout && !videoError && (
            <div style={{
              position: "absolute",
              bottom: "10px",
              left: "50%",
              transform: "translateX(-50%)",
              background: "rgba(0,0,0,0.8)",
              color: "#fbbf24",
              padding: "8px 16px",
              borderRadius: "4px",
              fontSize: "0.85rem",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              zIndex: 10
            }}>
              <AlertCircle size={16} />
              Video is loading slowly. Please wait...
            </div>
          )}
        </>
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
          {videoError ? (
            <div style={{ textAlign: "center", color: "#999", padding: "20px" }}>
              <AlertCircle size={60} style={{ marginBottom: "15px", opacity: 0.5, color: "#ef4444" }} />
              <p style={{ fontSize: "1.1rem", marginBottom: "8px", color: "#fff" }}>Video Source Unavailable</p>
              <p style={{ fontSize: "0.85rem", color: "#999", marginBottom: "15px", maxWidth: "300px" }}>
                The streaming server is experiencing issues. This is not a problem with the player.
              </p>
              <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                <button
                  onClick={() => window.location.reload()}
                  style={{
                    background: "#e50914",
                    color: "#fff",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                    fontWeight: "500"
                  }}
                >
                  Retry Loading
                </button>
              </div>
              <p style={{ fontSize: "0.75rem", color: "#666", marginTop: "15px" }}>
                Error: Backend streaming source not responding
              </p>
            </div>
          ) : (
            <div style={{ textAlign: "center", color: "#999" }}>
              <div style={{
                width: "60px",
                height: "60px",
                margin: "0 auto 15px",
                position: "relative"
              }}>
                <div style={{
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                  border: "3px solid transparent",
                  borderTopColor: "#e50914",
                  borderRightColor: "#e50914",
                  borderRadius: "50%",
                  animation: "rotate 1s linear infinite"
                }} />
                <div style={{
                  position: "absolute",
                  width: "45px",
                  height: "45px",
                  top: "7.5px",
                  left: "7.5px",
                  border: "3px solid transparent",
                  borderBottomColor: "#ff6b6b",
                  borderLeftColor: "#ff6b6b",
                  borderRadius: "50%",
                  animation: "rotateReverse 0.8s linear infinite"
                }} />
                <div style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  animation: "pulse 1.5s ease-in-out infinite"
                }}>
                  <Play size={20} fill="#e50914" color="#e50914" />
                </div>
              </div>
              <p>Loading video source...</p>
              
              <style>{`
                @keyframes rotate {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
                
                @keyframes rotateReverse {
                  0% { transform: rotate(360deg); }
                  100% { transform: rotate(0deg); }
                }
                
                @keyframes pulse {
                  0%, 100% { 
                    transform: translate(-50%, -50%) scale(1);
                    opacity: 1;
                  }
                  50% { 
                    transform: translate(-50%, -50%) scale(1.2);
                    opacity: 0.7;
                  }
                }
              `}</style>
            </div>
          )}
        </div>
      )}
    </div>
  </div>
  );
};

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
  const [relatedAnime, setRelatedAnime] = useState([]);
  const [otherAnime, setOtherAnime] = useState([]);
  const [displayedRelatedCount, setDisplayedRelatedCount] = useState(12);
  const [displayedOtherCount, setDisplayedOtherCount] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [contentIsMovie, setContentIsMovie] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const [episodesCache, setEpisodesCache] = useState({});
  const [streamingUrlCache, setStreamingUrlCache] = useState({});

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
              const cleanUrl = url.startsWith('http') ? url : `https://${url}`;
              console.log('Movie streaming URL:', cleanUrl);
              setStreamingUrl(cleanUrl);
            } else {
              console.error('No valid movie URL found');
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
            let seasonToUse;
            let episodeData;

            if (episodeId) {
              let foundSeason = null;
              for (const season of allSeasons) {
                const eps = await getEpisodes(season.id);
                const foundEpisode = eps.find((ep) => ep.id === parseInt(episodeId));
                if (foundEpisode) {
                  foundSeason = season;
                  episodeData = eps;
                  break;
                }
              }
              seasonToUse = foundSeason || allSeasons[0];
            } else {
              seasonToUse = allSeasons[0];
            }

            setSelectedSeason(seasonToUse);

            if (!episodeData) {
              if (episodesCache[seasonToUse.id]) {
                episodeData = episodesCache[seasonToUse.id];
              } else {
                episodeData = await getEpisodes(seasonToUse.id);
                episodeData = episodeData || [];
                setEpisodesCache(prev => ({
                  ...prev,
                  [seasonToUse.id]: episodeData
                }));
              }
            }

            setEpisodes(episodeData);

            const episode = episodeId
              ? episodeData.find((ep) => ep.id === parseInt(episodeId))
              : episodeData[0];

            if (episode) {
              setCurrentEpisode(episode);

              if (streamingUrlCache[episode.id]) {
                setStreamingUrl(streamingUrlCache[episode.id]);
              } else {
                const links = await getEpisodeLinks(episode.id);
                const url = extractValidServer(links);
                if (url) {
                  const cleanUrl = url.startsWith('http') ? url : `https://${url}`;
                  console.log('Episode streaming URL:', cleanUrl);
                  setStreamingUrl(cleanUrl);
                  setStreamingUrlCache(prev => ({
                    ...prev,
                    [episode.id]: cleanUrl
                  }));
                } else {
                  console.error('No valid episode URL found');
                  setVideoError(true);
                }
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
      if (episodesCache[season.id]) {
        setEpisodes(episodesCache[season.id]);
        if (episodesCache[season.id].length > 0) {
          handleEpisodeSelect(episodesCache[season.id][0]);
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
          handleEpisodeSelect(episodesArray[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching episodes:", error);
    }

    setLoading(false);
  };

  const handleEpisodeSelect = async (episode) => {
    setCurrentEpisode(episode);
    setLoading(true);
    setVideoError(false);

    try {
      if (streamingUrlCache[episode.id]) {
        setStreamingUrl(streamingUrlCache[episode.id]);
      } else {
        const links = await getEpisodeLinks(episode.id);
        const url = extractValidServer(links);
        if (url) {
          const cleanUrl = url.startsWith('http') ? url : `https://${url}`;
          console.log('Selected episode URL:', cleanUrl);
          setStreamingUrl(cleanUrl);
          setStreamingUrlCache(prev => ({
            ...prev,
            [episode.id]: cleanUrl
          }));
        } else {
          console.error('No valid URL for episode:', episode.id);
          setVideoError(true);
        }
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

      <div style={{ marginTop: isMobile ? "0" : "70px", paddingBottom: isMobile ? "0" : "40px" }}>
        {/* MOBILE VIEW */}
        {isMobile ? (
          <div style={{ width: "100%", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            <div style={{ 
              width: "100%", 
              background: "#000", 
              marginTop: "60px",
              position: "relative"
            }}>
              <VideoPlayer
                streamingUrl={streamingUrl}
                videoError={videoError}
                isMovie={contentIsMovie}
                setVideoError={setVideoError}
              />
            </div>
            
            <div style={{
              background: "#141414",
              padding: "15px",
              borderBottom: "1px solid rgba(255,255,255,0.1)"
            }}>
              <div style={{
                display: "flex",
                justifyContent: "space-around",
                alignItems: "center",
                gap: "10px"
              }}>
                <button
                  onClick={() => window.location.reload()}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#fff",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "5px",
                    cursor: "pointer",
                    fontSize: "0.75rem"
                  }}
                >
                  <div style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    border: "2px solid rgba(255,255,255,0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
                    </svg>
                  </div>
                  <span>Refresh</span>
                </button>

                <button
                  onClick={handleDownloadClick}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#22c55e",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "5px",
                    cursor: "pointer",
                    fontSize: "0.75rem",
                    position: "relative"
                  }}
                >
                  <div style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    border: "2px solid #22c55e",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative"
                  }}>
                    <Download size={20} />
                    <div style={{
                      position: "absolute",
                      top: "-5px",
                      right: "-5px",
                      background: "#22c55e",
                      color: "#000",
                      fontSize: "0.65rem",
                      fontWeight: "700",
                      padding: "2px 5px",
                      borderRadius: "10px"
                    }}>
                      APP
                    </div>
                  </div>
                  <span>Download</span>
                </button>

                <button
                  onClick={handlePreviousEpisode}
                  disabled={contentIsMovie || episodes.findIndex((ep) => ep.id === currentEpisode?.id) === 0}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#fff",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "5px",
                    cursor: "pointer",
                    fontSize: "0.75rem",
                    opacity: (contentIsMovie || episodes.findIndex((ep) => ep.id === currentEpisode?.id) === 0) ? 0.3 : 1
                  }}
                >
                  <div style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    border: "2px solid rgba(255,255,255,0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    <ChevronLeft size={20} />
                  </div>
                  <span>Pre</span>
                </button>

                <button
                  onClick={handleNextEpisode}
                  disabled={contentIsMovie || episodes.findIndex((ep) => ep.id === currentEpisode?.id) === episodes.length - 1}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#fff",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "5px",
                    cursor: "pointer",
                    fontSize: "0.75rem",
                    opacity: (contentIsMovie || episodes.findIndex((ep) => ep.id === currentEpisode?.id) === episodes.length - 1) ? 0.3 : 1
                  }}
                >
                  <div style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    border: "2px solid rgba(255,255,255,0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    <ChevronRight size={20} />
                  </div>
                  <span>Next</span>
                </button>
              </div>
            </div>

            <div style={{ flex: 1, overflowY: "auto", background: "#0a0a0a" }}>
              <div style={{ padding: "20px" }}>
                <div style={{ marginBottom: "15px" }}>
                  <h1 style={{ 
                    fontSize: "1.3rem", 
                    fontWeight: "600", 
                    marginBottom: "8px",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px"
                  }}>
                    {animeData?.name}
                    <ChevronRight size={20} style={{ color: "#666" }} />
                  </h1>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    fontSize: "0.85rem",
                    color: "#999",
                    flexWrap: "wrap"
                  }}>
                    <span style={{
                      background: "rgba(255,255,255,0.1)",
                      padding: "2px 8px",
                      borderRadius: "3px",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px"
                    }}>
                      <Play size={12} fill="#fff" />
                      {animeData?.rating || "N/A"}
                    </span>
                  </div>
                </div>

                <div style={{
                  background: "rgba(255,255,255,0.05)",
                  borderRadius: "8px",
                  padding: "15px",
                  marginBottom: "20px"
                }}>
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "15px"
                  }}>
                    <div>
                      <h3 style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "5px", color: "#fff" }}>
                        Resources
                      </h3>
                      <p style={{ fontSize: "0.75rem", color: "#999", margin: 0 }}>
                        Source: vegamovies.pet
                      </p>
                    </div>
                    {!contentIsMovie && seasons.length > 1 && (
                      <select
                        value={selectedSeason?.id || ''}
                        onChange={(e) => {
                          const season = seasons.find(s => s.id === parseInt(e.target.value));
                          if (season) handleSeasonChange(season);
                        }}
                        style={{
                          background: "rgba(255,255,255,0.1)",
                          color: "#fff",
                          border: "1px solid rgba(255,255,255,0.2)",
                          padding: "8px 12px",
                          borderRadius: "6px",
                          fontSize: "0.85rem",
                          cursor: "pointer"
                        }}
                      >
                        {seasons.map((season) => (
                          <option key={season.id} value={season.id}>
                            Season {String(season.num).padStart(2, '0')}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {!contentIsMovie && (
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(4, 1fr)",
                      gap: "10px"
                    }}>
                      {episodes.slice(0, 8).map((episode) => (
                        <button
                          key={episode.id}
                          onClick={() => handleEpisodeSelect(episode)}
                          style={{
                            background: episode.id === currentEpisode?.id ? "#22c55e" : "rgba(255,255,255,0.15)",
                            color: episode.id === currentEpisode?.id ? "#000" : "#fff",
                            border: "none",
                            padding: "15px 10px",
                            borderRadius: "8px",
                            fontSize: "0.9rem",
                            fontWeight: "600",
                            cursor: "pointer",
                            transition: "all 0.2s"
                          }}
                        >
                          {String(episode.number).padStart(2, '0')}
                        </button>
                      ))}
                    </div>
                  )}

                  {contentIsMovie && (
                    <div style={{
                      textAlign: "center",
                      padding: "20px",
                      color: "#999"
                    }}>
                      <Film size={40} style={{ marginBottom: "10px", opacity: 0.5 }} />
                      <p style={{ fontSize: "0.9rem", margin: 0 }}>Full Movie Available</p>
                    </div>
                  )}
                </div>

                <div style={{
                  background: "rgba(255,255,255,0.05)",
                  borderRadius: "8px",
                  padding: "15px",
                  marginBottom: "20px"
                }}>
                  <h3 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "10px", color: "#fff" }}>
                    Overview
                  </h3>
                  <p style={{ color: "#ccc", lineHeight: "1.6", fontSize: "0.85rem", margin: 0 }}>
                    {animeData?.overview || "No description available."}
                  </p>
                </div>

                <div>
                  <h3 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "15px", color: "#e50914" }}>
                    More To Watch
                  </h3>
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "10px"
                  }}>
                    {relatedAnime.slice(0, 6).map((anime) => (
                      <div
                        key={anime.id}
                        onClick={() => navigate(`/anime/${anime.slug}`)}
                        style={{ cursor: "pointer" }}
                      >
                        <AnimeCard anime={anime} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ maxWidth: "1600px", margin: "0 auto", padding: "0 20px" }}>
            <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
              <div style={{ flex: "1 1 800px", minWidth: 0 }}>
                <VideoPlayer
                  streamingUrl={streamingUrl}
                  videoError={videoError}
                  isMovie={contentIsMovie}
                  setVideoError={setVideoError}
                />

                <div style={{ marginBottom: "15px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <h1 style={{ fontSize: "1.4rem", fontWeight: "600", margin: 0, color: "#fff" }}>
                      {animeData?.name}
                    </h1>
                    <button
                      onClick={handleDownloadClick}
                      style={{
                        background: "rgba(34, 197, 94, 0.15)",
                        color: "#22c55e",
                        border: "1px solid rgba(34, 197, 94, 0.4)",
                        padding: "6px 16px",
                        borderRadius: "4px",
                        fontSize: "0.85rem",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontWeight: "500"
                      }}
                    >
                      <Download size={16} />
                      Download
                    </button>
                  </div>
                  <p style={{ fontSize: "0.85rem", color: "#999", margin: 0 }}>
                    Source: vegamovies.pet
                  </p>
                </div>

                <div style={{
                  background: "rgba(255,255,255,0.05)",
                  borderRadius: "6px",
                  padding: "20px",
                  marginBottom: "20px"
                }}>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "12px", color: "#fff" }}>
                    Overview
                  </h3>
                  <p style={{ color: "#ccc", lineHeight: "1.7", fontSize: "0.9rem", margin: 0 }}>
                    {animeData?.overview || "No description available."}
                  </p>
                </div>
              </div>

              <div style={{ flex: "0 0 320px", minWidth: "280px" }}>
                <div style={{
                  background: "rgba(255,255,255,0.05)",
                  borderRadius: "6px",
                  padding: "15px",
                  position: "sticky",
                  top: "90px"
                }}>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "15px", color: "#fff" }}>
                    Resources
                  </h3>

                  {!contentIsMovie && seasons.length > 1 && (
                    <div style={{ marginBottom: "15px" }}>
                      <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(60px, 1fr))",
                        gap: "8px"
                      }}>
                        {seasons.map((season) => (
                          <button
                            key={season.id}
                            onClick={() => handleSeasonChange(season)}
                            style={{
                              background: selectedSeason?.id === season.id ? "rgba(229, 9, 20, 0.2)" : "rgba(255,255,255,0.1)",
                              color: selectedSeason?.id === season.id ? "#e50914" : "#999",
                              border: selectedSeason?.id === season.id ? "1px solid #e50914" : "1px solid rgba(255,255,255,0.2)",
                              padding: "8px",
                              borderRadius: "4px",
                              fontSize: "0.85rem",
                              fontWeight: "500",
                              cursor: "pointer",
                              transition: "all 0.2s"
                            }}
                          >
                            S{String(season.num).padStart(2, '0')}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {!contentIsMovie && (
                    <div>
                      <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(4, 1fr)",
                        gap: "8px",
                        maxHeight: "600px",
                        overflowY: "auto",
                        padding: "5px"
                      }}>
                        {episodes.map((episode) => (
                          <button
                            key={episode.id}
                            onClick={() => handleEpisodeSelect(episode)}
                            style={{
                              background: episode.id === currentEpisode?.id ? "#22c55e" : "rgba(255,255,255,0.1)",
                              color: episode.id === currentEpisode?.id ? "#000" : "#999",
                              border: "1px solid rgba(255,255,255,0.2)",
                              padding: "10px 8px",
                              borderRadius: "4px",
                              fontSize: "0.85rem",
                              fontWeight: episode.id === currentEpisode?.id ? "600" : "500",
                              cursor: "pointer",
                              transition: "all 0.2s",
                              position: "relative"
                            }}
                            title={`Episode ${episode.number}: ${episode.name}`}
                          >
                            {episode.id === currentEpisode?.id && (
                              <div style={{
                                position: "absolute",
                                top: "3px",
                                left: "50%",
                                transform: "translateX(-50%)",
                                width: "4px",
                                height: "4px",
                                background: "#000",
                                borderRadius: "50%"
                              }} />
                            )}
                            {String(episode.number).padStart(2, '0')}
                          </button>
                        ))}
                      </div>

                      <div style={{
                        display: "flex",
                        gap: "10px",
                        marginTop: "15px"
                      }}>
                        <button
                          onClick={handlePreviousEpisode}
                          disabled={episodes.findIndex((ep) => ep.id === currentEpisode?.id) === 0}
                          style={{
                            flex: 1,
                            background: "rgba(255,255,255,0.1)",
                            color: "#fff",
                            border: "1px solid rgba(255,255,255,0.2)",
                            padding: "8px",
                            borderRadius: "4px",
                            fontSize: "0.85rem",
                            cursor: "pointer",
                            opacity: episodes.findIndex((ep) => ep.id === currentEpisode?.id) === 0 ? 0.4 : 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "5px"
                          }}
                        >
                          <ChevronLeft size={16} />
                        </button>
                        <button
                          onClick={handleNextEpisode}
                          disabled={episodes.findIndex((ep) => ep.id === currentEpisode?.id) === episodes.length - 1}
                          style={{
                            flex: 1,
                            background: "rgba(255,255,255,0.1)",
                            color: "#fff",
                            border: "1px solid rgba(255,255,255,0.2)",
                            padding: "8px",
                            borderRadius: "4px",
                            fontSize: "0.85rem",
                            cursor: "pointer",
                            opacity: episodes.findIndex((ep) => ep.id === currentEpisode?.id) === episodes.length - 1 ? 0.4 : 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "5px"
                          }}
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>
                  )}

                  {contentIsMovie && (
                    <div style={{
                      background: "rgba(229, 9, 20, 0.15)",
                      border: "1px solid rgba(229, 9, 20, 0.3)",
                      borderRadius: "4px",
                      padding: "30px 20px",
                      textAlign: "center"
                    }}>
                      <Film size={40} style={{ color: "#e50914", marginBottom: "10px" }} />
                      <p style={{ fontSize: "0.9rem", color: "#999", margin: 0 }}>
                        Full Movie Available
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div style={{ marginTop: "40px" }}>
              <div style={{
                background: "rgba(255,255,255,0.05)",
                borderRadius: "6px",
                padding: "20px"
              }}>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "20px"
                }}>
                  <h3 style={{ fontSize: "1.2rem", fontWeight: "600", margin: 0, color: "#e50914" }}>
                    More {contentIsMovie ? 'Movies' : 'Anime'} To Watch
                  </h3>
                  <span style={{
                    fontSize: "0.8rem",
                    color: "#666",
                    background: "rgba(255,255,255,0.05)",
                    padding: "5px 12px",
                    borderRadius: "15px"
                  }}>
                    {totalDisplayed} / {totalAvailable}
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
                  <div style={{ textAlign: "center", marginTop: "25px" }}>
                    <button
                      onClick={handleShowMoreAnime}
                      disabled={loadingMore}
                      style={{
                        background: loadingMore ? "rgba(229, 9, 20, 0.5)" : "#e50914",
                        color: "#fff",
                        border: "none",
                        padding: "10px 35px",
                        borderRadius: "4px",
                        fontSize: "0.9rem",
                        fontWeight: "500",
                        cursor: loadingMore ? "not-allowed" : "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px"
                      }}
                    >
                      {loadingMore ? (
                        <>
                          <span className="spinner-border spinner-border-sm" role="status"></span>
                          Loading...
                        </>
                      ) : (
                        <>
                          Show More
                          <ChevronDown size={16} />
                        </>
                      )}
                    </button>
                    <p style={{ color: "#666", fontSize: "0.8rem", marginTop: "10px" }}>
                      {totalAvailable - totalDisplayed} more available
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default WatchPage;