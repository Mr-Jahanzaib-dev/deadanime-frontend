import React from 'react';
import { Play, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={{ background: '#000', borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '80px' }}>
      <div className="container py-5">
        <div className="row">
          <div className="col-md-4 mb-4">
            <h4 className="fw-bold mb-3" style={{ color: '#fff' }}>
              <Play size={24} className="me-2" style={{ fill: '#e50914', color: '#e50914' }} />
              DeadAnime<span style={{ color: '#e50914' }}>Haven</span>
            </h4>
            <p style={{ color: '#999' }}>
              Your ultimate destination for watching anime in multiple languages including Hindi, Tamil, Telugu, and more.
            </p>
            <div className="d-flex gap-3 mt-3">
              <button className="border-0 bg-transparent" style={{ color: '#999', cursor: 'pointer' }}>
                <Facebook size={24} />
              </button>
              <button className="border-0 bg-transparent" style={{ color: '#999', cursor: 'pointer' }}>
                <Twitter size={24} />
              </button>
              <button className="border-0 bg-transparent" style={{ color: '#999', cursor: 'pointer' }}>
                <Instagram size={24} />
              </button>
              <button className="border-0 bg-transparent" style={{ color: '#999', cursor: 'pointer' }}>
                <Youtube size={24} />
              </button>
            </div>
          </div>
          
          <div className="col-md-2 mb-4">
            <h6 className="fw-bold mb-3">Navigation</h6>
            <ul className="list-unstyled">
              <li className="mb-2"><a href="/" style={{ color: '#999', textDecoration: 'none' }}>Home</a></li>
              <li className="mb-2"><a href="/ongoing" style={{ color: '#999', textDecoration: 'none' }}>Ongoing</a></li>
              <li className="mb-2"><a href="/completed" style={{ color: '#999', textDecoration: 'none' }}>Completed</a></li>
              <li className="mb-2"><a href="/movies" style={{ color: '#999', textDecoration: 'none' }}>Movies</a></li>
            </ul>
          </div>
          
          <div className="col-md-2 mb-4">
            <h6 className="fw-bold mb-3">Languages</h6>
            <ul className="list-unstyled">
              <li className="mb-2"><span style={{ color: '#999' }}>Hindi Dubbed</span></li>
              <li className="mb-2"><span style={{ color: '#999' }}>Tamil Dubbed</span></li>
              <li className="mb-2"><span style={{ color: '#999' }}>Telugu Dubbed</span></li>
              <li className="mb-2"><span style={{ color: '#999' }}>Multi Audio</span></li>
            </ul>
          </div>
          
          <div className="col-md-4 mb-4">
            <h6 className="fw-bold mb-3">Stay Updated</h6>
            <p style={{ color: '#999', fontSize: '0.9rem' }}>Subscribe for new anime releases</p>
            <div className="input-group mb-3">
              <input 
                type="email" 
                className="form-control" 
                placeholder="Your email"
                style={{ 
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: '#fff'
                }}
              />
              <button className="btn px-4" style={{ background: '#e50914', color: '#fff', border: 'none' }}>
                Subscribe
              </button>
            </div>
          </div>
        </div>
        
        <hr style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '30px 0' }} />
        
        <div className="text-center" style={{ color: '#666' }}>
          <p className="mb-0">© 2025 DeadAnime. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;