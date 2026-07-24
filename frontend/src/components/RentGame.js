import React, { useState, useEffect, useCallback } from 'react';

const API = 'http://localhost:5000/api';
const BANNERS = ['banner-1', 'banner-2', 'banner-3', 'banner-4', 'banner-5'];
const EMOJIS = ['⚔️', '🐉', '🏆', '🔫', '🚀', '🌌', '👾', '🎯', '🛡️', '🌊'];

export default function RentGame({ user, selectedGame }) {
  const [games, setGames] = useState([]);
  const [gameId, setGameId] = useState(selectedGame?.GameID || '');
  const [copies, setCopies] = useState([]);
  const [copyId, setCopyId] = useState('');
  const [days, setDays] = useState(7);
  const [rentals, setRentals] = useState([]);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState(['', '', '', '']);

  const loadRentals = useCallback(async () => {
    try {
      const res = await fetch(`${API}/rentals/user/${user.userID || user.UserID || user.id}`);
      const d = await res.json();
      setRentals(Array.isArray(d) ? d : d.rentals || []);
    } catch { setRentals([]); }
  }, [user.userID, user.UserID, user.id]);

  useEffect(() => {
    fetch(`${API}/games`).then(r => r.json()).then(d => setGames(d.games || [])).catch(() => { });
    loadRentals();
    if (selectedGame?.GameID) {
      setGameId(selectedGame.GameID);
    }
  }, [loadRentals, selectedGame]);

  useEffect(() => {
    if (!gameId) return setCopies([]);
    fetch(`${API}/games/${gameId}/digital-copies`)
      .then(r => r.json())
      .then(d => setCopies(d.copies || d || []))
      .catch(() => setCopies([]));
  }, [gameId]);

  const handleRent = async (e) => {
    e.preventDefault();
    if (!copyId) return setMsg({ type: 'error', text: 'Please select a copy.' });
    if (verificationCode.some(c => c === '')) return setMsg({ type: 'error', text: 'Please enter verification code.' });
    setLoading(true); setMsg({ type: '', text: '' });
    try {
      const res = await fetch(`${API}/rentals/rent`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.userID || user.UserID || user.id, copyId, rentalDays: days })
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message || d.error || 'Failed');
      setMsg({ type: 'success', text: '✓ Game rented successfully!' });
      setGameId(''); setCopyId(''); setDays(7);
      setVerificationCode(['', '', '', '']);
      loadRentals();
    } catch (err) { setMsg({ type: 'error', text: err.message }); }
    setLoading(false);
  };

  const handleCodeChange = (index, value) => {
    if (value.length > 1) return;
    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);
    if (value && index < 3) {
      document.getElementById(`code-${index + 1}`).focus();
    }
  };

  const getSelectedGame = () => {
    if (!gameId) return null;
    return games.find(g => String(g.GameID) === String(gameId)) || selectedGame;
  };

  const handleReturn = async (rentalId) => {
    try {
      const res = await fetch(`${API}/rentals/return/${rentalId}`, { method: 'PUT' });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message || 'Failed');
      setMsg({ type: 'success', text: '✓ Game returned!' });
      loadRentals();
    } catch (err) { setMsg({ type: 'error', text: err.message }); }
  };

  const currentGame = getSelectedGame();

  return (
    <div className="catalog-container rent-page-container" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
      <style>{`
        .rent-page-container {
          padding-left: 3rem;
          padding-right: 3rem;
          transition: padding 0.2s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: calc(100vh - 100px);
          width: 100%;
          box-sizing: border-box;
        }
        .rent-page-container .form-select {
          background-color: white !important;
          background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'/%3e%3c/svg%3e") !important;
          background-repeat: no-repeat !important;
          background-position: right 1.25rem center !important;
          background-size: 1.1rem !important;
          padding-right: 3rem !important;
          appearance: none !important;
          -webkit-appearance: none !important;
          -moz-appearance: none !important;
        }
        .rent-page-container .form-select:focus {
          background-color: white !important;
          border-color: black !important;
        }
        .rentals-grid, .rental-list, .rental-list-container {
          justify-content: center !important;
        }
        @media (min-width: 1400px) {
          .rent-page-container {
            padding-left: 8vw;
            padding-right: 8vw;
          }
        }
        @media (max-width: 1200px) {
          .rent-page-container {
            padding-left: 12rem;
            padding-right: 12rem;
          }
        }
        @media (max-width: 768px) {
          .rent-page-container {
            padding-left: 1rem;
            padding-right: 1rem;
          }
          .rent-flex-wrap {
            flex-direction: column !important;
            align-items: stretch !important;
          }
        }
      `}</style>

      {msg.text && <div className={`alert ${msg.type === 'success' ? 'alert-success' : 'alert-error'}`}>{msg.text}</div>}

      <div className="rent-flex-wrap" style={{ display: 'flex', gap: '2rem', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
        {/* Left side - Game Card */}
        <div style={{ flex: '0 0 auto' }}>
          {currentGame ? (
            <div className="game-card" style={{ height: '500px', width: '340px' }}>
              {currentGame.Image ? (
                <div className="game-card-banner" style={{ height: '300px', backgroundImage: `url(${currentGame.Image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
              ) : (
                <div className={`game-card-banner ${BANNERS[games.indexOf(currentGame) % BANNERS.length]}`} style={{ height: '240px' }}>
                  {EMOJIS[games.indexOf(currentGame) % EMOJIS.length]}
                </div>
              )}
              <div className="game-card-body" style={{ padding: '1.25rem' }}>
                <div className="game-card-title" style={{ fontFamily: "'Inter Tight', sans-serif", fontWeight: '700', fontSize: '1.2rem' }}>{currentGame.GameTitle}</div>
                <div className="game-card-row">
                  <span className="tag tag-platform" style={{ fontFamily: "'Inter Tight', sans-serif" }}>{currentGame.Platform}</span>
                  <span className="tag tag-genre" style={{ fontFamily: "'Inter Tight', sans-serif" }}>{currentGame.Genre}</span>
                </div>
                <div className="game-card-row">
                  <div className="price-block">
                    <div className="price-label" style={{ fontFamily: "'Inter Tight', sans-serif" }}>Physical</div>
                    <div className="price-val" style={{ fontSize: '1.15rem' }}>${currentGame.PhysicalPrice}</div>
                  </div>
                  <div className="price-block">
                    <div className="price-label" style={{ fontFamily: "'Inter Tight', sans-serif" }}>Digital</div>
                    <div className="price-val" style={{ fontSize: '1.15rem' }}>${currentGame.DigitalRentalPrice}</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="game-card" style={{
              width: '320px',
              height: '420px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2rem',
              textAlign: 'center',
              border: '2px dashed #999',
              background: '#fcfcfc',
              color: '#666',
              borderRadius: '12px',
              boxShadow: 'none'
            }}>
              <span style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🎮</span>
              <div style={{ fontWeight: '700', fontSize: '1.2rem', marginBottom: '0.5rem', fontFamily: "'Inter Tight', sans-serif" }}>No Game Selected</div>
              <p style={{ fontSize: '0.85rem', color: '#888', margin: 0, fontFamily: "'Inter Tight', sans-serif" }}>Select a game from the menu on the right to view details and start renting.</p>
            </div>
          )}
        </div>

        {/* Right side - Details Form in a custom Card container */}
        <div style={{ flex: '1' }}>
          <div style={{
            background: 'white',
            border: '2px solid black',
            boxShadow: '5px 5px 0px 0px black',
            borderRadius: '12px',
            padding: '3rem'
          }}>
            <div style={{ marginBottom: '1.25rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: '900', color: 'black', letterSpacing: '-1px', fontFamily: "'Inter Tight', sans-serif" }}>Enter Details</div>
              <div style={{ fontSize: '0.9rem', color: '#555', fontWeight: '700', marginTop: '0rem', fontFamily: "'Inter Tight', sans-serif" }}>Last bit of confirmation</div>
            </div>

            <form onSubmit={handleRent} style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
              {/* Selected Game Input */}
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  top: '-10px',
                  left: '15px',
                  background: 'red',
                  color: 'white',
                  border: '2px solid black',
                  boxShadow: '2px 2px 0px 0px black',
                  borderRadius: '8px',
                  padding: '4px 10px',
                  width: 'fit-content',
                  fontWeight: '800',
                  fontSize: '0.65rem',
                  fontFamily: "'Inter Tight', sans-serif",
                  letterSpacing: '1px',
                  zIndex: 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  Selected Game
                </div>
                <select
                  className="form-select"
                  value={gameId}
                  onChange={e => { setGameId(e.target.value); setCopyId(''); }}
                  required
                  style={{
                    width: '100%',
                    background: 'white url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'black\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'/%3e%3c/svg%3e") no-repeat right 1.25rem center',
                    backgroundSize: '1.1rem',
                    border: '2px solid black',
                    boxShadow: '4px 4px 0px 0px black',
                    borderRadius: '12px',
                    color: gameId ? 'black' : '#888',
                    fontFamily: "'Inter Tight', sans-serif",
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    padding: '0.75rem 3rem 0.75rem 1.25rem',
                    outline: 'none',
                    cursor: 'pointer',
                    appearance: 'none',
                    WebkitAppearance: 'none',
                    MozAppearance: 'none',
                    marginTop: '12px'
                  }}
                >
                  <option value="" disabled hidden style={{ backgroundColor: 'white', color: '#888' }}>Game Name</option>
                  {games.map(g => (
                    <option key={g.GameID} value={g.GameID} style={{ backgroundColor: 'white', color: 'black' }}>
                      {g.GameTitle}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected Copy Input */}
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  top: '-10px',
                  left: '15px',
                  background: 'red',
                  color: 'white',
                  border: '2px solid black',
                  boxShadow: '2px 2px 0px 0px black',
                  borderRadius: '8px',
                  padding: '4px 10px',
                  width: 'fit-content',
                  fontWeight: '800',
                  fontSize: '0.65rem',
                  fontFamily: "'Inter Tight', sans-serif",
                  letterSpacing: '1px',
                  zIndex: 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  Selected Copy
                </div>
                <select
                  className="form-select"
                  value={copyId}
                  onChange={e => setCopyId(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    background: 'white url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'black\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'/%3e%3c/svg%3e") no-repeat right 1.25rem center',
                    backgroundSize: '1.1rem',
                    border: '2px solid black',
                    boxShadow: '4px 4px 0px 0px black',
                    borderRadius: '12px',
                    color: copyId ? 'black' : '#888',
                    fontFamily: "'Inter Tight', sans-serif",
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    padding: '0.75rem 3rem 0.75rem 1.25rem',
                    outline: 'none',
                    cursor: 'pointer',
                    appearance: 'none',
                    WebkitAppearance: 'none',
                    MozAppearance: 'none',
                    marginTop: '12px'
                  }}
                >
                  <option value="" disabled hidden style={{ backgroundColor: 'white', color: '#888' }}>Copy ID</option>
                  {copies.map(c => (
                    <option key={c.CopyID} value={c.CopyID} style={{ backgroundColor: 'white', color: 'black' }}>
                      Copy #{c.CopyID} · {c.Availability === 'Available' ? '✓ Available' : '✗ Unavailable'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Duration Input */}
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  top: '-10px',
                  left: '15px',
                  background: 'red',
                  color: 'white',
                  border: '2px solid black',
                  boxShadow: '2px 2px 0px 0px black',
                  borderRadius: '8px',
                  padding: '4px 10px',
                  width: 'fit-content',
                  fontWeight: '800',
                  fontSize: '0.65rem',
                  fontFamily: "'Inter Tight', sans-serif",
                  letterSpacing: '1px',
                  zIndex: 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  Duration (Days)
                </div>
                <input
                  className="form-input"
                  type="number"
                  min={1}
                  max={30}
                  value={days}
                  onChange={e => setDays(Number(e.target.value))}
                  style={{
                    width: '100%',
                    background: 'white',
                    border: '2px solid black',
                    boxShadow: '4px 4px 0px 0px black',
                    borderRadius: '12px',
                    color: 'black',
                    fontFamily: "'Inter Tight', sans-serif",
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    padding: '0.75rem 1.25rem',
                    outline: 'none',
                    marginTop: '12px'
                  }}
                />
              </div>

              {/* Verification Code */}
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  top: '-10px',
                  left: '15px',
                  background: 'red',
                  color: 'white',
                  border: '2px solid black',
                  boxShadow: '2px 2px 0px 0px black',
                  borderRadius: '8px',
                  padding: '4px 10px',
                  width: 'fit-content',
                  fontWeight: '800',
                  fontSize: '0.65rem',
                  fontFamily: "'Inter Tight', sans-serif",
                  letterSpacing: '1px',

                  zIndex: 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  Verification
                </div>
                <div style={{
                  background: 'white',
                  border: '2px solid black',
                  boxShadow: '4px 4px 0px 0px black',
                  borderRadius: '12px',
                  padding: '1.5rem 1.25rem 1.25rem 1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  marginTop: '12px'
                }}>
                  <div style={{ marginBottom: '4px', fontSize: '0.85rem', color: '#666', fontFamily: "'Inter Tight', sans-serif", fontWeight: '500', textAlign: 'center' }}>
                    A code has been sent to your email. Enter it below:
                  </div>
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    {verificationCode.map((digit, index) => (
                      <input
                        key={index}
                        id={`code-${index}`}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleCodeChange(index, e.target.value)}
                        style={{
                          width: '50px',
                          height: '50px',
                          border: '2px solid black',
                          borderRadius: '12px',
                          background: 'white',
                          color: 'black',
                          textAlign: 'center',
                          fontSize: '1.25rem',
                          fontWeight: 'bold',
                          fontFamily: "'Inter Tight', sans-serif",
                          outline: 'none',
                          boxShadow: '4px 4px 0px 0px black',
                          transition: 'all 0.1s'
                        }}
                        onFocus={(e) => e.target.style.borderColor = 'var(--cyan)'}
                        onBlur={(e) => e.target.style.borderColor = 'black'}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Rent Now Button */}
              <button
                type="submit"
                className="btn btn-cyan btn-full"
                disabled={loading}
                style={{
                  fontFamily: "'Inter Tight', sans-serif",
                  fontWeight: '700',
                  fontSize: '0.95rem',
                  letterSpacing: '1px',
                  padding: '0.85rem'
                }}
              >
                {loading ? 'Processing...' : '⟳ RENT NOW'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}