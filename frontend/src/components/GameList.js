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
      <div className="catalog-container">
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
            {games.map((game, idx) => (
              <div key={game.GameID || idx} className="game-card">
                {game.Image ? (
                  <div className="game-card-banner" style={{ backgroundImage: `url(${game.Image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                ) : (
                  <div className={`game-card-banner ${BANNERS[idx % BANNERS.length]}`}>
                    {EMOJIS[idx % EMOJIS.length]}
                  </div>
                )}
                <div className="game-card-body">
                  <div className="game-card-title">{game.GameTitle}</div>
                  <div className="game-card-row">
                    <span className="tag tag-platform">{game.Platform}</span>
                    <span className="tag tag-genre">{game.Genre}</span>
                  </div>
                  <div className="game-card-row">
                    <div className="price-block">
                      <div className="price-label">Physical</div>
                      <div className="price-val">${game.PhysicalPrice}</div>
                    </div>
                    <div className="price-block">
                      <div className="price-label">Digital</div>
                      <div className="price-val">${game.DigitalRentalPrice}</div>
                    </div>
                  </div>
                  <div className="game-card-row game-card-actions">
                    <button className="btn btn-cyan btn-sm">Rent</button>
                    <button className="btn btn-orange btn-sm">Buy</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}