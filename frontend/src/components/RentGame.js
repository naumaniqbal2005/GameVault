import React, { useState, useEffect, useCallback } from 'react';

const API = 'http://localhost:5000/api';

export default function RentGame({ user }) {
  const [games, setGames]     = useState([]);
  const [gameId, setGameId]   = useState('');
  const [copies, setCopies]   = useState([]);
  const [copyId, setCopyId]   = useState('');
  const [days, setDays]       = useState(7);
  const [rentals, setRentals] = useState([]);
  const [msg, setMsg]         = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const loadRentals = useCallback(async () => {
    try {
      const res = await fetch(`${API}/rentals/user/${user.userID || user.UserID || user.id}`);
      const d = await res.json();
      setRentals(Array.isArray(d) ? d : d.rentals || []);
    } catch { setRentals([]); }
  }, [user.userID, user.UserID, user.id]);

  useEffect(() => {
    fetch(`${API}/games`).then(r => r.json()).then(d => setGames(d.games || [])).catch(() => {});
    loadRentals();
  }, [loadRentals]);

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
      loadRentals();
    } catch (err) { setMsg({ type: 'error', text: err.message }); }
    setLoading(false);
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

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">RENT A GAME</div>
          <div className="page-sub">Digital rental — time-limited access</div>
        </div>
      </div>

      {msg.text && <div className={`alert ${msg.type === 'success' ? 'alert-success' : 'alert-error'}`}>{msg.text}</div>}

      <div className="form-panel cyan">
        <form onSubmit={handleRent}>
          <div className="form-group">
            <label className="form-label">Select Game</label>
            <select className="form-select" value={gameId} onChange={e => { setGameId(e.target.value); setCopyId(''); }} required>
              <option value="">— Choose a game —</option>
              {games.map(g => <option key={g.GameID} value={g.GameID}>{g.GameTitle}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Digital Copy</label>
            <select className="form-select" value={copyId} onChange={e => setCopyId(e.target.value)} required>
              <option value="">— Select a copy —</option>
              {copies.map(c => (
                <option key={c.CopyID} value={c.CopyID}>
                  Copy #{c.CopyID} · {c.Availability === 'Available' ? '✓ Available' : '✗ Unavailable'}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Rental Duration (days)</label>
            <input className="form-input" type="number" min={1} max={30} value={days}
              onChange={e => setDays(Number(e.target.value))} />
          </div>
          <button type="submit" className="btn btn-cyan btn-full" disabled={loading}>
            {loading ? 'Processing...' : '⟳ RENT NOW'}
          </button>
        </form>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div className="panel-title"><span className="panel-title-dot" />My Rentals</div>
          <span style={{ color: 'var(--text3)', fontSize: '0.8rem' }}>{rentals.length} total</span>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr><th>Game</th><th>Issued</th><th>Due</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              {rentals.length === 0 ? (
                <tr><td colSpan={5}><div className="empty"><div className="empty-icon">📭</div><p>No rentals yet</p></div></td></tr>
              ) : rentals.map((r, i) => (
                <tr key={r.RentalID || r.rentalID || i}>
                  <td className="td-title">{r.GameTitle || r.gameTitle || `Rental #${r.RentalID}`}</td>
                  <td>{r.DateIssued || r.dateIssued ? new Date(r.DateIssued || r.dateIssued).toLocaleDateString() : '—'}</td>
                  <td>{r.DateDue || r.dateDue ? new Date(r.DateDue || r.dateDue).toLocaleDateString() : '—'}</td>
                  <td>
                    <span className={`status ${r.DateReturned || r.dateReturned ? 'status-returned' : 'status-active'}`}>
                      {r.DateReturned || r.dateReturned ? 'Returned' : 'Active'}
                    </span>
                  </td>
                  <td>
                    {!(r.DateReturned || r.dateReturned) && (
                      <button className="btn btn-ghost btn-xs" onClick={() => handleReturn(r.RentalID || r.rentalID)}>Return</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}