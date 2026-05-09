import React, { useState, useEffect, useCallback } from 'react';

const API = 'http://localhost:5000/api';

export default function AdminWaitlist() {
  const [waitlist, setWaitlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const loadWaitlist = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/rentals/waitlist`);
      const data = await res.json();
      setWaitlist(Array.isArray(data) ? data : data.waitlist || []);
      setError('');
    } catch (error) {
      console.error('Error loading waitlist:', error);
      setWaitlist([]);
      setError('Failed to fetch waitlist');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadWaitlist();
  }, [loadWaitlist]);

  const handleDelete = async (waitlistId) => {
    if (!window.confirm('Remove this waitlist entry?')) return;
    try {
      const res = await fetch(`${API}/rentals/waitlist/${waitlistId}`, { method: 'DELETE' });
      if (res.ok) {
        setWaitlist(waitlist.filter(item => item.WaitlistID !== waitlistId));
      } else {
        const errorData = await res.json();
        alert(errorData.message || 'Failed to delete');
      }
    } catch (error) {
      console.error('Delete waitlist error:', error);
      alert('Failed to delete waitlist entry');
    }
  };

  const filteredWaitlist = waitlist.filter(item => {
    const matchesSearch = !search ||
      item.FullName?.toLowerCase().includes(search.toLowerCase()) ||
      item.GameTitle?.toLowerCase().includes(search.toLowerCase()) ||
      item.WaitlistType?.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  }).sort((a, b) => {
    if (a.WaitlistType !== b.WaitlistType) return a.WaitlistType.localeCompare(b.WaitlistType);
    return a.WaitlistID - b.WaitlistID;
  });

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <div>
            <div className="page-title">WAITLIST</div>
            <div className="page-sub">Manage waitlist entries</div>
          </div>
        </div>
        <div className="loading"><div className="spinner" /> Loading waitlist...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="page-header">
          <div>
            <div className="page-title">WAITLIST</div>
            <div className="page-sub">Manage waitlist entries</div>
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
          <div className="page-title">WAITLIST</div>
          <div className="page-sub">{filteredWaitlist.length} of {waitlist.length} entries</div>
        </div>
        <button className="btn btn-cyan" onClick={loadWaitlist}>
          Refresh
        </button>
      </div>

      <div className="search-bar">
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input
            className="search-input"
            placeholder="Search by User Name, Game Name or Type..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        {search && <button className="btn btn-ghost btn-sm" onClick={() => setSearch('')}>Clear</button>}
      </div>

      {filteredWaitlist.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">📋</div>
          <p>{search ? 'No entries match your search' : 'No waitlist entries found'}</p>
        </div>
      ) : (
        <div style={{
          background: 'var(--card)',
          borderRadius: 'var(--radius)',
          overflow: 'hidden',
          border: '1px solid var(--border)',
          boxShadow: 'var(--cyan-glow)'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{
                background: 'linear-gradient(135deg, var(--cyan), var(--purple))',
                color: 'var(--text)',
                fontFamily: 'Orbitron, monospace'
              }}>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', fontSize: '14px', letterSpacing: '1px' }}>WAITLIST ID</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', fontSize: '14px', letterSpacing: '1px' }}>TYPE</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', fontSize: '14px', letterSpacing: '1px' }}>USER NAME</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', fontSize: '14px', letterSpacing: '1px' }}>GAME NAME</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', fontSize: '14px', letterSpacing: '1px' }}>REQUEST TIME</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', fontSize: '14px', letterSpacing: '1px' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredWaitlist.map((item, index) => (
                <tr key={`${item.WaitlistType}-${item.WaitlistID}-${index}`} style={{
                  borderBottom: '1px solid var(--border2)',
                  background: index % 2 === 0 ? 'var(--card2)' : 'var(--card)',
                  transition: 'all 0.3s',
                  fontFamily: 'Rajdhani, sans-serif'
                }}>
                  <td style={{ padding: '16px', fontSize: '15px', fontWeight: '600', color: 'var(--cyan)' }}>#{item.WaitlistType === 'Digital' ? 'D' : 'P'}-{item.WaitlistID}</td>
                  <td style={{ padding: '16px', fontSize: '15px', color: 'var(--text)' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 10px',
                      borderRadius: '999px',
                      fontWeight: '600',
                      fontSize: '12px',
                      letterSpacing: '0.5px',
                      background: item.WaitlistType === 'Digital' ? 'rgba(6,182,212,0.2)' : 'rgba(168,85,247,0.2)',
                      color: item.WaitlistType === 'Digital' ? '#22d3ee' : '#c084fc',
                      border: `1px solid ${item.WaitlistType === 'Digital' ? 'rgba(6,182,212,0.4)' : 'rgba(168,85,247,0.4)'}`
                    }}>
                      {item.WaitlistType === 'Digital' ? 'DIGITAL' : 'PHYSICAL'}
                    </span>
                  </td>
                  <td style={{ padding: '16px', fontSize: '15px', color: 'var(--text)' }}>{item.FullName}</td>
                  <td style={{ padding: '16px', fontSize: '15px', color: 'var(--text)' }}>{item.GameTitle}</td>
                  <td style={{ padding: '16px', fontSize: '15px', color: 'var(--text2)' }}>{new Date(item.RequestTime).toLocaleString()}</td>
                  <td style={{ padding: '16px' }}>
                    <button
                      onClick={() => handleDelete(item.WaitlistID)}
                      className="btn btn-sm"
                      style={{
                        background: 'rgba(220, 53, 69, 0.8)',
                        color: 'white',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}
                    >
                      Delete
                    </button>
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