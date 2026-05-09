import React, { useState, useEffect, useCallback } from 'react';

const API = 'http://localhost:5000/api';
const BANNERS = ['banner-1','banner-2','banner-3','banner-4','banner-5'];
const EMOJIS  = ['⚔️','🐉','🏆','🔫','🚀','🌌','👾','🎯','🛡️','🌊'];

const COVERS = {
  'God of War':                  'https://images.wallpapersden.com/image/download/atreus-kratos-god-of-war-2018_a2ZrZm2UmZqaraWkpJRmbmdlrWZlbWU.jpg',
  'Elden Ring':                  'https://tse3.mm.bing.net/th/id/OIP.P0-K3kdmGjRLYCWhGNruUwHaEK?rs=1&pid=ImgDetMain&o=7&rm=3',
  'FIFA 24':                     'https://tse2.mm.bing.net/th/id/OIP.xr0SfoLYUDm-pAMG-gkADgHaEK?rs=1&pid=ImgDetMain&o=7&rm=3',
  'Spider-Man 2':                'https://i.gadgets360cdn.com/products/large/spider-man-2-poster-1543x2160-1686288382.jpg',
  'Cyberpunk 2077':              'https://cdn1.epicgames.com/offer/77f2b98e2cef40c8a7437518bf420e47/EGS_Cyberpunk2077_CDPROJEKTRED_S1_03_2560x1440-359e77d3cd0a40aebf3bbc130d14c5c7',
  'Hollow Knight':               'https://gaming-cdn.com/images/products/2198/orig-fallback-v1/hollow-knight-pc-mac-game-steam-cover.jpg?v=1705490619',
  'Resident Evil 4':             'https://cdn.wccftech.com/wp-content/uploads/2023/02/WCCFresidentevil4remake14.jpg',
  'The Witcher 3':               'https://tse4.mm.bing.net/th/id/OIP.G8AqB-jB4rGrjl8ToU0cywHaEK?rs=1&pid=ImgDetMain&o=7&rm=3',
  'Zelda Tears of the Kingdom':  'https://zeldacentral.com/wp-content/uploads/2025/03/Tears-of-the-Kingdom-wallpaper.jpg',
  'Halo Infinite':               'https://gamingbolt.com/wp-content/uploads/2020/07/halo-infinite.jpg',
};

export default function UpcomingCatalogue({ user }) {
  const [games, setGames]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [imgErrors, setImgErrors]   = useState({});
  const [selectedGame, setSelectedGame] = useState(null);
  const [msg, setMsg]               = useState({ type: '', text: '' });

  const uid = Number(user.UserID);

  const fetchGames = useCallback(async () => {
    setLoading(true);
    try {
      const q = search ? `?search=${encodeURIComponent(search)}` : '';
      const res = await fetch(`${API}/games${q}`);
      const data = await res.json();
      const allGames = Array.isArray(data) ? data : data.games || [];
      
      // Filter to show only games with limited availability
      const upcomingGames = allGames.filter(game => {
        const hasPhysical = game.PhysicalPrice && game.PhysicalPrice > 0;
        const hasDigital = game.DigitalRentalPrice && game.DigitalRentalPrice > 0;
        return hasPhysical || hasDigital;
      });
      
      setGames(upcomingGames);
    } catch { setGames([]); }
    setLoading(false);
  }, [search]);

  useEffect(() => { fetchGames(); }, [search, fetchGames]);

  const handleJoinWaitlist = async (type) => {
    if (!selectedGame) return;
    
    const endpoint = type === 'physical' 
      ? `${API}/purchases/waitlist/join`
      : `${API}/rentals/waitlist/join`;

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: uid,
          gameId: selectedGame.GameID
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || 'Failed');
      
      setMsg({ 
        type: 'success', 
        text: `✓ Added to ${type === 'physical' ? 'physical' : 'digital'} waitlist!` 
      });
      setSelectedGame(null);
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">UPCOMING RELEASES</div>
          <div className="page-sub">Games coming soon — join waitlists to be notified</div>
        </div>
      </div>

      <div className="search-bar">
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input className="search-input" placeholder="Search upcoming games..." value={search}
            onChange={e => setSearch(e.target.value)} />
        </div>
        {search && <button className="btn btn-ghost btn-sm" onClick={() => setSearch('')}>Clear</button>}
      </div>

      {msg.text && <div className={`alert ${msg.type === 'success' ? 'alert-success' : 'alert-error'}`}>{msg.text}</div>}

      {loading ? (
        <div className="loading"><div className="spinner" /> Loading upcoming games...</div>
      ) : games.length === 0 ? (
        <div className="empty"><div className="empty-icon">📅</div><p>No upcoming games found</p></div>
      ) : (
        <>
          <div className="game-grid">
            {games.map((g, i) => {
              const cover = COVERS[g.GameTitle];
              const hasImg = cover && !imgErrors[g.GameID];
              const isSelected = selectedGame?.GameID === g.GameID;
              
              return (
                <div 
                  className="game-card" 
                  key={g.GameID || i}
                  onClick={() => setSelectedGame(isSelected ? null : g)}
                  style={{
                    cursor: 'pointer',
                    border: isSelected ? '2px solid var(--cyan)' : '1px solid transparent',
                    boxShadow: isSelected ? 'var(--cyan-glow)' : 'none',
                    transition: 'all 0.3s'
                  }}
                >
                  <div
                    className={`game-card-banner ${!hasImg ? BANNERS[i % BANNERS.length] : ''}`}
                    style={hasImg ? {
                      backgroundImage: `url(${cover})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    } : {}}
                  >
                    {!hasImg && (
                      <span style={{ position: 'relative', zIndex: 1 }}>{EMOJIS[i % EMOJIS.length]}</span>
                    )}
                    {hasImg && (
                      <img
                        src={cover}
                        alt={g.GameTitle}
                        onError={() => setImgErrors(prev => ({ ...prev, [g.GameID]: true }))}
                        style={{ display: 'none' }}
                      />
                    )}
                    <div style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      background: 'rgba(0,0,0,0.7)',
                      padding: '8px 16px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '700',
                      color: 'var(--cyan)',
                      fontFamily: 'Orbitron, monospace'
                    }}>
                      🔔 COMING SOON
                    </div>
                  </div>
                  <div className="game-card-body">
                    <div className="game-card-title">{g.GameTitle}</div>
                    <div className="game-tags">
                      {g.Platform && <span className="tag tag-platform">{g.Platform}</span>}
                      {g.Genre && <span className="tag tag-genre">{g.Genre}</span>}
                    </div>
                    <div className="game-prices">
                      <div className="price-block">
                        <div className="price-label">Rent / day</div>
                        <div className="price-val">{g.DigitalRentalPrice ? `$${Number(g.DigitalRentalPrice).toFixed(2)}` : '—'}</div>
                      </div>
                      <div className="price-block">
                        <div className="price-label">Buy</div>
                        <div className="price-val">{g.PhysicalPrice ? `$${Number(g.PhysicalPrice).toFixed(2)}` : '—'}</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {selectedGame && (
            <div style={{
              position: 'fixed',
              bottom: '20px',
              right: '20px',
              background: 'var(--card)',
              border: '2px solid var(--cyan)',
              borderRadius: 'var(--radius)',
              padding: '20px',
              boxShadow: 'var(--cyan-glow)',
              maxWidth: '300px',
              zIndex: 1000,
              fontFamily: 'Rajdhani, sans-serif'
            }}>
              <div style={{ color: 'var(--text)', fontWeight: '600', marginBottom: '12px' }}>
                {selectedGame.GameTitle}
              </div>
              <p style={{ color: 'var(--text2)', fontSize: '13px', marginBottom: '16px' }}>
                Join a waitlist to get notified when this becomes available
              </p>
              <div style={{ display: 'flex', gap: '10px' }}>
                {selectedGame.PhysicalPrice && selectedGame.PhysicalPrice > 0 && (
                  <button 
                    className="btn btn-orange btn-sm"
                    onClick={() => handleJoinWaitlist('physical')}
                    style={{ flex: 1 }}
                  >
                    📦 Physical
                  </button>
                )}
                {selectedGame.DigitalRentalPrice && selectedGame.DigitalRentalPrice > 0 && (
                  <button 
                    className="btn btn-cyan btn-sm"
                    onClick={() => handleJoinWaitlist('digital')}
                    style={{ flex: 1 }}
                  >
                    💿 Digital
                  </button>
                )}
                <button 
                  className="btn btn-ghost btn-sm"
                  onClick={() => setSelectedGame(null)}
                >
                  ✕
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
