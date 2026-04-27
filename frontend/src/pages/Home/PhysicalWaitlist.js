import React, { useState, useEffect, useCallback } from 'react';

const API = 'http://localhost:5000/api';

export default function PhysicalWaitlist({ user }) {
  const [games, setGames]       = useState([]);
  const [gameId, setGameId]     = useState('');
  const [waitlist, setWaitlist] = useState([]);
  const [msg, setMsg]           = useState({ type: '', text: '' });
  const [loading, setLoading]   = useState(false);

  const uid = Number(user.UserID);

  const loadWaitlist = useCallback(async () => {
    try {
      const res = await fetch(`${API}/purchases/waitlist/user/${uid}`);
      const d = await res.json();
      setWaitlist(Array.isArray(d) ? d : d.waitlist || []);
    } catch { setWaitlist([]); }
  }, [uid]);

  useEffect(() => {
    fetch(`${API}/games`).then(r => r.json()).then(d => setGames(d.games || [])).catch(() => {});
    loadWaitlist();
  }, [loadWaitlist]);

  const handleJoinWaitlist = async (e) => {
    e.preventDefault();
    if (!gameId) return setMsg({ type: 'error', text: 'Please select a game.' });
    setLoading(true); setMsg({ type: '', text: '' });
    try {
      const res = await fetch(`${API}/purchases/waitlist/join`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: uid, gameId: Number(gameId) })
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message || d.error || 'Failed');
      setMsg({ type: 'success', text: '✓ Added to physical waitlist!' });
      setGameId('');
      loadWaitlist();
    } catch (err) { setMsg({ type: 'error', text: err.message }); }
    setLoading(false);
  };

  const handleRemoveFromWaitlist = async (waitlistId) => {
    if (!window.confirm('Remove from waitlist?')) return;
    try {
      const res = await fetch(`${API}/purchases/waitlist/${waitlistId}`, { method: 'DELETE' });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message || 'Failed');
      setMsg({ type: 'success', text: '✓ Removed from waitlist.' });
      loadWaitlist();
    } catch (err) { setMsg({ type: 'error', text: err.message }); }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">PHYSICAL WAITLIST</div>
          <div className="page-sub">Get notified when physical copies become available</div>
        </div>
      </div>

      {msg.text && <div className={`alert ${msg.type === 'success' ? 'alert-success' : 'alert-error'}`}>{msg.text}</div>}

      <div className="form-panel orange">
        <form onSubmit={handleJoinWaitlist}>
          <div className="form-group">
            <label className="form-label">Select Game to Waitlist</label>
            <select className="form-select" value={gameId} onChange={e => setGameId(e.target.value)} required>
              <option value="">— Choose a game —</option>
              {games.map(g => <option key={g.GameID} value={g.GameID}>{g.GameTitle}</option>)}
            </select>
          </div>
          <button type="submit" className="btn btn-orange btn-full" disabled={loading}>
            {loading ? 'Adding...' : '📋 JOIN WAITLIST'}
          </button>
        </form>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">
            <span className="panel-title-dot" style={{ background: 'var(--orange)' }} />
            My Waitlist Entries
          </div>
          <span style={{ color: 'var(--text3)', fontSize: '0.8rem' }}>{waitlist.length} games</span>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr><th>Game</th><th>Position</th><th>Requested</th><th>Action</th></tr>
            </thead>
            <tbody>
              {waitlist.length === 0 ? (
                <tr><td colSpan={4}><div className="empty"><div className="empty-icon">📭</div><p>Not on any physical waitlists</p></div></td></tr>
              ) : waitlist.map((w, i) => (
                <tr key={w.WaitlistID || i}>
                  <td className="td-title">{w.GameTitle}</td>
                  <td>#{i + 1}</td>
                  <td>{formatDate(w.RequestTime)}</td>
                  <td>
                    <button 
                      className="btn btn-danger btn-xs" 
                      onClick={() => handleRemoveFromWaitlist(w.WaitlistID)}
                    >
                      Remove
                    </button>
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
