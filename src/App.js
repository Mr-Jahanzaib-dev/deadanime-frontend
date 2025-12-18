import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import your page components
import HomePage from './pages/HomePage';
import AnimeDetailPage from './pages/AnimeDetailPage';
import WatchPage from './pages/WatchPage';
import DownloadPage from './pages/DownloadPage';
import MoviesPage from './pages/MoviesPage';
import MarvelPage from './pages/MarvelPage';
import CompletedPage from './pages/CompletedPage';
//import SeriesPage from './pages/SeriesPage';
import SearchPage from './pages/SearchPage';
import OngoingPage from './pages/OngoingPage';
import GenrePage from './pages/GenrePage'; 
// ... import other pages

function App() {
  return (
    <Router>
      <Routes>
        {/* Home Page */}
        <Route path="/" element={<HomePage />} />
        
        {/* Anime Detail Page */}
        <Route path="/anime/:id" element={<AnimeDetailPage />} />
        <Route path="/completed" element={<CompletedPage />} />
        {/* Watch Routes - IMPORTANT: Movie route (without episodeId) must come BEFORE series route */}
        <Route path="/watch/:slug" element={<WatchPage />} />
        <Route path="/watch/:slug/:episodeId" element={<WatchPage />} />
        
        {/* Download Routes - IMPORTANT: Movie route (without episodeId) must come BEFORE series route */}
        <Route path="/download/:slug" element={<DownloadPage />} />
        <Route path="/download/:slug/:episodeId" element={<DownloadPage />} />
        
        {/* Category Pages */}
        <Route path="/movies" element={<MoviesPage />} />
        {/*<Route path="/series" element={<SeriesPage />} />*/}
        <Route path="/marvel" element={<MarvelPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/ongoing" element={<OngoingPage />} />
        <Route path="/genre/:genre?" element={<GenrePage />} />

        
        {/* 404 Not Found - Optional but recommended */}
        <Route path="*" element={
          <div style={{ 
            background: '#0a0a0a', 
            minHeight: '100vh', 
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            textAlign: 'center',
            padding: '20px'
          }}>
            <h1 style={{ fontSize: '4rem', marginBottom: '20px' }}>404</h1>
            <h2>Page Not Found</h2>
            <p style={{ color: '#999', marginTop: '10px' }}>
              The page you're looking for doesn't exist.
            </p>
            <a 
              href="/" 
              style={{ 
                marginTop: '20px',
                padding: '12px 24px',
                background: '#e50914',
                color: '#fff',
                textDecoration: 'none',
                borderRadius: '8px'
              }}
            >
              Go Home
            </a>
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;