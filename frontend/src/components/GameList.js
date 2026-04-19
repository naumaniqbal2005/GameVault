import React, { useState, useEffect } from 'react';

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

export default function GameList({ user }) {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [imgErrors, setImgErrors] = useState({});

  useEffect(() => { fetchGames(); }, [search]);

  const fetchGames = async () => {
    setLoading(true);
    try {
      const q = search ? `?search=${encodeURIComponent(search)}` : '';
      const res = await fetch(`${API}/games${q}`);
      const data = await res.json();
      setGames(Array.isArray(data) ? data : data.games || []);
    } catch { setGames([]); }
    setLoading(false);
  };

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