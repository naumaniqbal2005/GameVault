import React, { useState, useEffect } from 'react';

const API = 'http://localhost:5000/api';

export default function PurchaseGame({ user }) {
  const [games, setGames]         = useState([]);
  const [gameId, setGameId]       = useState('');
  const [copies, setCopies]       = useState([]);
  const [copyId, setCopyId]       = useState('');
  const [purchases, setPurchases] = useState([]);
  const [msg, setMsg]             = useState({ type: '', text: '' });
  const [loading, setLoading]     = useState(false);

  const uid = Number(user.UserID);

  useEffect(() => {
    fetch(`${API}/games`).then(r => r.json()).then(d => setGames(d.games || [])).catch(() => {});
    loadPurchases();
  }, []);

  useEffect(() => {
    if (!gameId) return setCopies([]);
    fetch(`${API}/games/${gameId}/physical-copies`)
      .then(r => r.json())
      .then(d => setCopies(d.copies || d || []))
      .catch(() => setCopies([]));
  }, [gameId]);

  const loadPurchases = async () => {
    try {
      const res = await fetch(`${API}/purchases/user/${uid}`);
      const d = await res.json();
      setPurchases(Array.isArray(d) ? d : d.purchases || []);
    } catch { setPurchases([]); }
  };

  const handlePurchase = async (e) => {
    e.preventDefault();
    if (!copyId) return setMsg({ type: 'error', text: 'Please select a copy.' });
    setLoading(true); setMsg({ type: '', text: '' });
    try {
      const res = await fetch(`${API}/purchases/purchase`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: uid, copyId: Number(copyId), adminId: 1 })
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message || d.error || 'Failed');
      setMsg({ type: 'success', text: '✓ Purchase successful!' });
      setGameId(''); setCopyId('');
      loadPurchases();
    } catch (err) { setMsg({ type: 'error', text: err.message }); }
    setLoading(false);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">PURCHASE A GAME</div>
          <div className="page-sub">Buy a physical copy — yours to keep</div>
        </div>
      </div>

      {msg.text && <div className={`alert ${msg.type === 'success' ? 'alert-success' : 'alert-error'}`}>{msg.text}</div>}

      <div className="form-panel orange">
        <form onSubmit={handlePurchase}>
          <div className="form-group">
            <label className="form-label">Select Game</label>
            <select className="form-select" value={gameId} onChange={e => { setGameId(e.target.value); setCopyId(''); }} required>
              <option value="">— Choose a game —</option>
              {games.map(g => <option key={g.GameID} value={g.GameID}>{g.GameTitle}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Physical Copy</label>
            <select className="form-select" value={copyId} onChange={e => setCopyId(e.target.value)} required>
              <option value="">— Select a copy —</option>
              {copies.map(c => (
                <option key={c.CopyID} value={c.CopyID}>
                  Copy #{c.CopyID} · {c.CopyCondition} · {c.Availability === 'Available' ? '✓ In Stock' : '✗ Sold Out'}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn btn-orange btn-full" disabled={loading}>
            {loading ? 'Processing...' : '◉ BUY NOW'}
          </button>
        </form>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">
            <span className="panel-title-dot" style={{ background: 'var(--orange)' }} />
            My Purchases
          </div>
          <span style={{ color: 'var(--text3)', fontSize: '0.8rem' }}>{purchases.length} total</span>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr><th>Game</th><th>Purchase Date</th><th>Amount</th></tr>
            </thead>
            <tbody>
              {purchases.length === 0 ? (
                <tr><td colSpan={3}><div className="empty"><div className="empty-icon">🛒</div><p>No purchases yet</p></div></td></tr>
              ) : purchases.map((p, i) => (
                <tr key={p.PurchaseID || p.purchaseID || i}>
                  <td className="td-title">{p.GameTitle || p.gameTitle || `Purchase #${p.PurchaseID}`}</td>
                  <td>{p.PurchaseDate || p.purchaseDate ? new Date(p.PurchaseDate || p.purchaseDate).toLocaleDateString() : '—'}</td>
                  <td className="td-green">{p.TotalAmount || p.totalAmount ? `$${Number(p.TotalAmount || p.totalAmount).toFixed(2)}` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}