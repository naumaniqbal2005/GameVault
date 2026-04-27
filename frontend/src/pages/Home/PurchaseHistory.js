import React, { useState, useEffect, useCallback } from 'react';

const API = 'http://localhost:5000/api';

export default function PurchaseHistory({ user }) {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [error, setError]         = useState('');

  const uid = Number(user.UserID);

  const loadPurchases = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/purchases/user/${uid}`);
      const d = await res.json();
      setPurchases(Array.isArray(d) ? d : d.purchases || []);
      setError('');
    } catch (err) {
      console.error('Error loading purchases:', err);
      setPurchases([]);
      setError('Failed to fetch purchases');
    }
    setLoading(false);
  }, [uid]);

  useEffect(() => {
    loadPurchases();
  }, [loadPurchases]);

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString();
  };

  const formatAmount = (amount) => {
    if (amount === null || amount === undefined) return '—';
    return `$${parseFloat(amount).toFixed(2)}`;
  };

  const filteredPurchases = purchases.filter(purchase => {
    const matchesSearch = !search || 
      purchase.GameTitle?.toLowerCase().includes(search.toLowerCase()) ||
      purchase.CopyCondition?.toLowerCase().includes(search.toLowerCase()) ||
      purchase.PurchaseID?.toString().includes(search);
    
    return matchesSearch;
  }).sort((a, b) => b.PurchaseID - a.PurchaseID);

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <div>
            <div className="page-title">PURCHASE HISTORY</div>
            <div className="page-sub">View your game purchases</div>
          </div>
        </div>
        <div className="loading"><div className="spinner" /> Loading purchases...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="page-header">
          <div>
            <div className="page-title">PURCHASE HISTORY</div>
            <div className="page-sub">View your game purchases</div>
          </div>
        </div>
        <div className="alert alert-error">{error}</div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">PURCHASE HISTORY</div>
          <div className="page-sub">{filteredPurchases.length} games purchased</div>
        </div>
        <button className="btn btn-orange" onClick={loadPurchases}>
          🔄 Refresh
        </button>
      </div>

      <div className="search-bar">
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input 
            className="search-input" 
            placeholder="Search by game title, condition, or purchase ID..." 
            value={search}
            onChange={e => setSearch(e.target.value)} 
          />
        </div>
        {search && <button className="btn btn-ghost btn-sm" onClick={() => setSearch('')}>Clear</button>}
      </div>
      
      {filteredPurchases.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">🛒</div>
          <p>{search ? 'No purchases match your search' : 'No purchases yet'}</p>
        </div>
      ) : (
        <div style={{ 
          background: 'var(--card)', 
          borderRadius: 'var(--radius)', 
          overflow: 'hidden',
          border: '1px solid var(--border)',
          boxShadow: 'var(--orange-glow)'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ 
                background: 'linear-gradient(135deg, var(--orange), #FF8C42)', 
                color: 'var(--text)',
                fontFamily: 'Orbitron, monospace'
              }}>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', fontSize: '14px', letterSpacing: '1px' }}>PURCHASE ID</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', fontSize: '14px', letterSpacing: '1px' }}>GAME</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', fontSize: '14px', letterSpacing: '1px' }}>COPY</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', fontSize: '14px', letterSpacing: '1px' }}>CONDITION</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', fontSize: '14px', letterSpacing: '1px' }}>PURCHASE DATE</th>
              </tr>
            </thead>
            <tbody>
              {filteredPurchases.map((purchase, index) => (
                <tr key={purchase.PurchaseID} style={{ 
                  borderBottom: '1px solid var(--border2)',
                  background: index % 2 === 0 ? 'var(--card2)' : 'var(--card)',
                  transition: 'all 0.3s',
                  fontFamily: 'Rajdhani, sans-serif'
                }}>
                  <td style={{ padding: '16px', fontSize: '15px', fontWeight: '600', color: 'var(--orange)' }}>
                    #{purchase.PurchaseID}
                  </td>
                  <td style={{ padding: '16px', fontSize: '15px', color: 'var(--text)', fontWeight: '600' }}>
                    {purchase.GameTitle}
                  </td>
                  <td style={{ padding: '16px', fontSize: '15px', color: 'var(--text2)', fontFamily: 'Orbitron, monospace' }}>
                    Copy #{purchase.CopyID}
                  </td>
                  <td style={{ padding: '16px', fontSize: '15px', color: 'var(--text)' }}>
                    <span style={{ 
                      padding: '6px 14px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '700',
                      fontFamily: 'Orbitron, monospace',
                      letterSpacing: '1px',
                      background: purchase.CopyCondition === 'New' ? 'var(--green-dim)' :
                                  purchase.CopyCondition === 'Good' ? 'rgba(0,240,255,0.12)' :
                                  purchase.CopyCondition === 'Fair' ? 'rgba(255,107,0,0.12)' : 'rgba(220,53,69,0.12)',
                      color: purchase.CopyCondition === 'New' ? 'var(--green)' :
                             purchase.CopyCondition === 'Good' ? 'var(--cyan)' :
                             purchase.CopyCondition === 'Fair' ? 'var(--orange)' : '#DC3545',
                      border: purchase.CopyCondition === 'New' ? '1px solid var(--green)' :
                              purchase.CopyCondition === 'Good' ? '1px solid var(--cyan)' :
                              purchase.CopyCondition === 'Fair' ? '1px solid var(--orange)' : '1px solid #DC3545'
                    }}>
                      {purchase.CopyCondition}
                    </span>
                  </td>
                  <td style={{ padding: '16px', fontSize: '15px', color: 'var(--text2)' }}>
                    {formatDate(purchase.PurchaseDate)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
