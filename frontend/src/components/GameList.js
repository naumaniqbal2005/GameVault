import React, { useState, useEffect, useCallback } from 'react';
import { Search } from 'lucide-react';

const API = 'http://localhost:5000/api';
const BANNERS = ['banner-1','banner-2','banner-3','banner-4','banner-5'];
const EMOJIS  = ['⚔️','🐉','🏆','🔫','🚀','🌌','👾','🎯','🛡️','🌊'];

export default function GameList({ user, setSelectedGame }) {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedPlatform, setSelectedPlatform] = useState('All');

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

  // Extract unique genres and platforms dynamically from loaded games
  const genres = ['All', ...new Set(games.map(g => g.Genre).filter(Boolean))];
  const platforms = ['All', ...new Set(games.map(g => g.Platform).filter(Boolean))];

  // Filter games based on selected genre and platform
  const filteredGames = games.filter(g => {
    const matchesGenre = selectedGenre === 'All' || g.Genre === selectedGenre;
    const matchesPlatform = selectedPlatform === 'All' || g.Platform === selectedPlatform;
    return matchesGenre && matchesPlatform;
  });

  return (
    <div>
      <div className="catalog-container">
        <div className="catalog-banner">
          <div className="catalog-banner-overlay">
            <h1 className="catalog-banner-title">Game Catalog</h1>
            <p className="catalog-banner-sub">Find yourself a perfect pick</p>
          </div>
        </div>

        <div className="search-bar">
          <div className="search-wrap">
            <Search className="search-icon" size={18} />
            <input className="search-input" placeholder="Search games by title..." value={search}
              onChange={e => setSearch(e.target.value)} />
          </div>
          {search && <button className="btn btn-ghost btn-sm" onClick={() => setSearch('')}>Clear</button>}
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '1.75rem', alignItems: 'center' }}>
          {/* Genre Filters */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: '800',
              fontFamily: "'Inter Tight', sans-serif",
              color: '#333',
              textTransform: 'uppercase',
              padding: '0.4rem 0.85rem',
              borderRadius: '8px',
              background: 'white',
              border: '2px solid black',
              boxShadow: '3px 3px 0px 0px black'
            }}>Genre:</span>
            {genres.map(genre => {
              const isSelected = selectedGenre === genre;
              return (
                <button
                  key={genre}
                  onClick={() => setSelectedGenre(genre)}
                  className={`filter-btn ${isSelected ? 'selected' : ''}`}
                >
                  {genre}
                </button>
              );
            })}
          </div>

          {/* Platform Filters */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: '800',
              fontFamily: "'Inter Tight', sans-serif",
              color: '#333',
              textTransform: 'uppercase',
              padding: '0.4rem 0.85rem',
              borderRadius: '8px',
              background: 'white',
              border: '2px solid black',
              boxShadow: '3px 3px 0px 0px black'
            }}>Platform:</span>
            {platforms.map(platform => {
              const isSelected = selectedPlatform === platform;
              return (
                <button
                  key={platform}
                  onClick={() => setSelectedPlatform(platform)}
                  className={`filter-btn ${isSelected ? 'selected' : ''}`}
                >
                  {platform}
                </button>
              );
            })}
          </div>
        </div>

        {loading ? (
          <div className="loading"><div className="spinner" /> Loading catalog...</div>
        ) : filteredGames.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">🕹️</div>
            <p>{games.length === 0 ? 'No games found' : 'No games match the selected filters'}</p>
          </div>
        ) : (
          <div className="game-grid">
            {filteredGames.map((game, idx) => (
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
                    <button className="btn btn-cyan btn-sm" onClick={() => setSelectedGame(game)}>Rent</button>
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