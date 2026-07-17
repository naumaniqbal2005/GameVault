import React, { useState, useEffect, useCallback } from 'react';

const API = 'http://localhost:5000/api';
const BANNERS = ['banner-1','banner-2','banner-3','banner-4','banner-5'];
const EMOJIS  = ['⚔️','🐉','🏆','🔫','🚀','🌌','👾','🎯','🛡️','🌊'];

export default function GameList({ user }) {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [imgErrors, setImgErrors] = useState({});

  const fetchGames = useCallback(async () => {
    setLoading(true);
    try {
      const q = search ? `?search=${encodeURIComponent(search)}` : '';
      const res = await fetch(`${API}/games${q}`);
      const data = await res.json();
      setGames(Array.isArray(data) ? data : data.games || []);
    } catch { setGames([]); }
    setLoading(false);
  }, [search]);

  useEffect(() => { fetchGames(); }, [search, fetchGames]);

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">GAME CATALOG</div>
          <div className="page-sub">{games.length} titles available</div>
        </div>
      </div>

      <div className="search-bar">
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input className="search-input" placeholder="Search games by title..." value={search}
            onChange={e => setSearch(e.target.value)} />
        </div>
        {search && <button className="btn btn-ghost btn-sm" onClick={() => setSearch('')}>Clear</button>}
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" /> Loading catalog...</div>
      ) : games.length === 0 ? (
        <div className="empty"><div className="empty-icon">🕹️</div><p>No games found</p></div>
      ) : (
        <div className="game-grid">
          {games.map((g, i) => {
            const cover = COVERS[g.GameTitle];
            const hasImg = cover && !imgErrors[g.GameID];
            return (
              <div className="game-card" key={g.GameID || i}>
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
      )}
    </div>
  );
}