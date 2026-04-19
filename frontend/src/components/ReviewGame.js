import React, { useState, useEffect } from 'react';

const API = 'http://localhost:5000/api';

export default function ReviewGame({ user }) {
  const [games, setGames]       = useState([]);
  const [rentals, setRentals]   = useState([]);
  const [gameId, setGameId]     = useState('');
  const [rentalId, setRentalId] = useState('');
  const [rating, setRating]     = useState(5);
  const [hover, setHover]       = useState(0);
  const [text, setText]         = useState('');
  const [reviews, setReviews]   = useState([]);
  const [msg, setMsg]           = useState({ type: '', text: '' });
  const [loading, setLoading]   = useState(false);

  const uid = Number(user.UserID);

  useEffect(() => {
    fetch(`${API}/games`).then(r => r.json()).then(d => setGames(d.games || [])).catch(() => {});
    loadRentals();
    loadReviews();
  }, []);

  const loadRentals = async () => {
    try {
      const res = await fetch(`${API}/rentals/user/${uid}`);
      const d = await res.json();
      setRentals(Array.isArray(d) ? d : d.rentals || []);
    } catch { setRentals([]); }
  };

  const loadReviews = async () => {
    try {
      const res = await fetch(`${API}/reviews/user/${uid}`);
      const d = await res.json();
      setReviews(Array.isArray(d) ? d : d.reviews || []);
    } catch { setReviews([]); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rentalId) return setMsg({ type: 'error', text: 'Please select a rental.' });
    setLoading(true); setMsg({ type: '', text: '' });
    try {
      const res = await fetch(`${API}/reviews`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: uid,
          gameId: Number(gameId),
          rentalId: Number(rentalId),
          rating,
          reviewText: text
        })
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message || d.error || 'Failed');
      setMsg({ type: 'success', text: '✓ Review submitted!' });
      setGameId(''); setRentalId(''); setRating(5); setText('');
      loadReviews();
    } catch (err) { setMsg({ type: 'error', text: err.message }); }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API}/reviews/review/${id}`, { method: 'DELETE' });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message || 'Failed');
      setMsg({ type: 'success', text: '✓ Review deleted.' });
      loadReviews();
    } catch (err) { setMsg({ type: 'error', text: err.message }); }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">REVIEWS</div>
          <div className="page-sub">Rate and review games you've rented</div>
        </div>
      </div>

      {msg.text && <div className={`alert ${msg.type === 'success' ? 'alert-success' : 'alert-error'}`}>{msg.text}</div>}

      <div className="form-panel purple">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Select Game</label>
            <select className="form-select" value={gameId} onChange={e => setGameId(e.target.value)} required>
              <option value="">— Choose a game —</option>
              {games.map(g => <option key={g.GameID} value={g.GameID}>{g.GameTitle}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Select Rental</label>
            <select className="form-select" value={rentalId} onChange={e => setRentalId(e.target.value)} required>
              <option value="">— Choose a rental —</option>
              {rentals.length === 0
                ? <option disabled>No rentals found — rent a game first</option>
                : rentals.map((r, i) => (
                  <option key={r.RentalID || r.rentalID || i} value={r.RentalID || r.rentalID}>
                    Rental #{r.RentalID || r.rentalID} — {r.GameTitle || r.gameTitle || `Game #${r.GameID}`}
                  </option>
                ))
              }
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Rating</label>
            <div className="stars">
              {[1,2,3,4,5].map(n => (
                <span key={n}
                  className={`star ${n <= (hover || rating) ? 'on' : ''}`}
                  onClick={() => setRating(n)}
                  onMouseEnter={() => setHover(n)}
                  onMouseLeave={() => setHover(0)}>★</span>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Your Review</label>
            <textarea className="form-textarea" placeholder="Share your experience with this game..."
              value={text} onChange={e => setText(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-purple btn-full" disabled={loading}>
            {loading ? 'Submitting...' : '★ SUBMIT REVIEW'}
          </button>
        </form>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">
            <span className="panel-title-dot" style={{ background: 'var(--purple)' }} />
            My Reviews
          </div>
          <span style={{ color: 'var(--text3)', fontSize: '0.8rem' }}>{reviews.length} total</span>
        </div>
        <div style={{ padding: reviews.length ? '1rem' : 0 }}>
          {reviews.length === 0 ? (
            <div className="empty"><div className="empty-icon">✍️</div><p>No reviews yet</p></div>
          ) : reviews.map((r, i) => (
            <div className="review-card" key={r.ReviewID || r.reviewID || i}>
              <div className="review-head">
                <div>
                  <div className="review-game">{r.GameTitle || r.gameTitle || `Game #${r.GameID || r.gameId}`}</div>
                  <div style={{ color: '#fbbf24', marginTop: '0.3rem', fontSize: '1rem' }}>
                    {'★'.repeat(r.Rating || r.rating)}{'☆'.repeat(5 - (r.Rating || r.rating))}
                  </div>
                </div>
                <button className="btn btn-danger btn-xs" onClick={() => handleDelete(r.ReviewID || r.reviewID)}>Delete</button>
              </div>
              <div className="review-text">{r.ReviewText || r.reviewText}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}