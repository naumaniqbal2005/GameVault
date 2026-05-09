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

export default function AdminGames() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [imgErrors, setImgErrors] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({
    gameTitle: '',
    platform: '',
    genre: '',
    digitalRentalPrice: '',
    physicalPrice: '',
    physicalCopies: '',
    physicalCondition: 'Good',
    digitalCopies: '',
    digitalAvailability: 'Available'
  });
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [submitting, setSubmitting] = useState(false);

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

  const fetchGameByTitle = async (title) => {
    try {
      const res = await fetch(`${API}/games?search=${encodeURIComponent(title)}`);
      const data = await res.json();
      const games = Array.isArray(data) ? data : data.games || [];
      const game = games.find(g => g.GameTitle === title);
      return game ? game.GameID : null;
    } catch (error) {
      console.error('Error fetching game by title:', error);
      return null;
    }
  };

  const handleAddGame = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });
    setSubmitting(true);

    try {
      // First, create the game
      const gameRequestData = {
        gameTitle: form.gameTitle,
        platform: form.platform,
        genre: form.genre,
        digitalRentalPrice: form.digitalRentalPrice ? parseFloat(form.digitalRentalPrice) : undefined,
        physicalPrice: form.physicalPrice ? parseFloat(form.physicalPrice) : undefined
      };
      
      console.log('Creating game with data:', gameRequestData);
      
      const gameRes = await fetch(`${API}/games`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gameRequestData),
      });
      
      console.log('Game creation response status:', gameRes.status);
      const gameData = await gameRes.json();
      console.log('Game creation response data:', gameData);
      if (!gameRes.ok) {
        // If there are validation errors, show them
        if (gameData.errors && gameData.errors.length > 0) {
          throw new Error(gameData.errors.map(err => err.msg).join(', '));
        }
        throw new Error(gameData.message || 'Failed to add game');
      }
      
      // Fetch the newly created game by title to get its ID
      console.log('Fetching game ID for title:', form.gameTitle);
      const newGameId = await fetchGameByTitle(form.gameTitle);
      console.log('Retrieved game ID:', newGameId, 'Type:', typeof newGameId);
      
      if (!newGameId) {
        throw new Error('Failed to retrieve game ID after creation');
      }
      
      // Create physical copies if specified
      let physicalCopiesCreated = 0;
      if (form.physicalCopies && parseInt(form.physicalCopies) > 0) {
        const copyCount = parseInt(form.physicalCopies);
        console.log('Creating', copyCount, 'physical copies for game ID:', newGameId);
        for (let i = 0; i < copyCount; i++) {
          try {
            const copyRes = await fetch(`${API}/physical-copies`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                gameId: newGameId,
                copyCondition: form.physicalCondition,
                availability: 'Available'
              }),
            });
            if (copyRes.ok) {
              physicalCopiesCreated++;
              console.log('Physical copy', i + 1, 'created successfully');
            } else {
              const errorData = await copyRes.json();
              console.error('Failed to create physical copy', i + 1, ':', errorData);
              if (errorData.errors && errorData.errors.length > 0) {
                console.error('Validation errors:', errorData.errors.map(err => err.msg).join(', '));
              }
            }
          } catch (err) {
            console.error('Failed to create physical copy', i + 1, ':', err);
          }
        }
      }
      
      // Create digital copies if specified
      let digitalCopiesCreated = 0;
      if (form.digitalCopies && parseInt(form.digitalCopies) > 0) {
        const copyCount = parseInt(form.digitalCopies);
        console.log('Creating', copyCount, 'digital copies for game ID:', newGameId);
        for (let i = 0; i < copyCount; i++) {
          try {
            const requestData = {
                gameId: newGameId,
                availability: form.digitalAvailability
              };
              console.log('Sending digital copy request:', requestData);
              const copyRes = await fetch(`${API}/digital-copies`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestData),
              });
            if (copyRes.ok) {
              digitalCopiesCreated++;
              console.log('Digital copy', i + 1, 'created successfully');
            } else {
              const errorData = await copyRes.json();
              console.error('Failed to create digital copy', i + 1, ':', errorData);
              if (errorData.errors && errorData.errors.length > 0) {
                console.error('Validation errors:', errorData.errors.map(err => err.msg).join(', '));
              }
            }
          } catch (err) {
            console.error('Failed to create digital copy', i + 1, ':', err);
          }
        }
      }
      
      setMsg({ type: 'success', text: `✓ Game added successfully with ${physicalCopiesCreated} physical and ${digitalCopiesCreated} digital copies!` });
      setForm({ 
        gameTitle: '', 
        platform: '', 
        genre: '', 
        digitalRentalPrice: '', 
        physicalPrice: '',
        physicalCopies: '',
        physicalCondition: 'Good',
        digitalCopies: '',
        digitalAvailability: 'Available'
      });
      setShowAddForm(false);
      fetchGames(); // Refresh the games list
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">GAME MANAGEMENT</div>
          <div className="page-sub">{games.length} games in inventory</div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-cyan" onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? '← Back to List' : '+ Add Game'}
          </button>
          {!showAddForm && (
            <button className="btn btn-ghost" onClick={fetchGames}>
              🔄 Refresh
            </button>
          )}
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

      {showAddForm ? (
        <div className="auth-box" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div className="auth-title">ADD NEW GAME</div>
          <div className="auth-sub">Enter game details to add to inventory</div>
          {msg.text && <div className={`alert ${msg.type === 'success' ? 'alert-success' : 'alert-error'}`}>{msg.text}</div>}
          
          <form onSubmit={handleAddGame}>
            <div className="form-group">
              <label className="form-label">Game Title *</label>
              <input 
                className="form-input" 
                placeholder="Enter game title" 
                value={form.gameTitle}
                onChange={e => setForm({ ...form, gameTitle: e.target.value })}
                required 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Platform *</label>
              <input 
                className="form-input" 
                placeholder="e.g., PC, PlayStation, Xbox, Nintendo Switch" 
                value={form.platform}
                onChange={e => setForm({ ...form, platform: e.target.value })}
                required 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Genre</label>
              <input 
                className="form-input" 
                placeholder="e.g., Action, RPG, Strategy, Sports" 
                value={form.genre}
                onChange={e => setForm({ ...form, genre: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Digital Rental Price (per day)</label>
              <input 
                className="form-input" 
                type="number" 
                step="0.01" 
                min="0"
                placeholder="0.00" 
                value={form.digitalRentalPrice}
                onChange={e => setForm({ ...form, digitalRentalPrice: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Physical Purchase Price</label>
              <input 
                className="form-input" 
                type="number" 
                step="0.01" 
                min="0"
                placeholder="0.00" 
                value={form.physicalPrice}
                onChange={e => setForm({ ...form, physicalPrice: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Number of Physical Copies</label>
              <input 
                className="form-input" 
                type="number" 
                min="0"
                placeholder="0" 
                value={form.physicalCopies}
                onChange={e => setForm({ ...form, physicalCopies: e.target.value })}
              />
            </div>

            {form.physicalCopies && parseInt(form.physicalCopies) > 0 && (
              <div className="form-group">
                <label className="form-label">Physical Copy Condition</label>
                <select 
                  className="form-input" 
                  value={form.physicalCondition}
                  onChange={e => setForm({ ...form, physicalCondition: e.target.value })}
                >
                  <option value="New">New</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Poor">Poor</option>
                </select>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Number of Digital Copies</label>
              <input 
                className="form-input" 
                type="number" 
                min="0"
                placeholder="0" 
                value={form.digitalCopies}
                onChange={e => setForm({ ...form, digitalCopies: e.target.value })}
              />
            </div>

            {form.digitalCopies && parseInt(form.digitalCopies) > 0 && (
              <div className="form-group">
                <label className="form-label">Digital Copy Availability</label>
                <select 
                  className="form-input" 
                  value={form.digitalAvailability}
                  onChange={e => setForm({ ...form, digitalAvailability: e.target.value })}
                >
                  <option value="Available">Available</option>
                  <option value="Rented">Rented</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
              <button 
                type="submit" 
                className="btn btn-cyan" 
                disabled={submitting}
                style={{ flex: 1 }}
              >
                {submitting ? 'Adding Game...' : 'Add Game'}
              </button>
              <button 
                type="button" 
                className="btn btn-ghost" 
                onClick={() => setShowAddForm(false)}
                disabled={submitting}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : loading ? (
        <div className="loading"><div className="spinner" /> Loading games...</div>
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
