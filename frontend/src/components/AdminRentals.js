import React, { useState, useEffect, useCallback } from 'react';

const API = 'http://localhost:5000/api';

export default function AdminRentals() {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const loadRentals = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/rentals`);
      const data = await res.json();
      setRentals(Array.isArray(data) ? data : data.rentals || []);
      setError('');
    } catch (error) {
      console.error('Error loading rentals:', error);
      setRentals([]);
      setError('Failed to fetch rentals');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadRentals();
  }, [loadRentals]);

  const handleReturnRental = async (rentalId) => {
    if (!window.confirm('Return this rental?')) return;
    
    try {
      const res = await fetch(`${API}/rentals/return/${rentalId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (res.ok) {
        loadRentals();
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to return');
      }
    } catch (error) {
      setError('Error returning rental');
    }
  };

  const handleDeleteRental = async (rentalId) => {
    if (!window.confirm('Delete this rental?')) return;
    
    try {
      const res = await fetch(`${API}/rentals/${rentalId}`, {
        method: 'DELETE'
      });
      
      if (res.ok) {
        loadRentals();
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to delete');
      }
    } catch (error) {
      setError('Error deleting rental');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString();
  };

  const filteredRentals = rentals.filter(rental => {
    const matchesSearch = !search || 
      rental.UserName?.toLowerCase().includes(search.toLowerCase()) ||
      rental.GameTitle?.toLowerCase().includes(search.toLowerCase()) ||
      rental.CopyID?.toString().includes(search);
    
    return matchesSearch;
  }).sort((a, b) => a.RentalID - b.RentalID);

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <div>
            <div className="page-title">RENTAL MANAGEMENT</div>
            <div className="page-sub">Manage rental transactions</div>
          </div>
        </div>
        <div className="loading"><div className="spinner" /> Loading rentals...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="page-header">
          <div>
            <div className="page-title">RENTAL MANAGEMENT</div>
            <div className="page-sub">Manage rental transactions</div>
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
          <div className="page-title">RENTAL MANAGEMENT</div>
          <div className="page-sub">{filteredRentals.length} of {rentals.length} rentals</div>
        </div>
        <button className="btn btn-cyan" onClick={loadRentals}>
          🔄 Refresh
        </button>
      </div>

      <div className="search-bar">
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input 
            className="search-input" 
            placeholder="Search rentals by user, game, or copy ID..." 
            value={search}
            onChange={e => setSearch(e.target.value)} 
          />
        </div>
        {search && <button className="btn btn-ghost btn-sm" onClick={() => setSearch('')}>Clear</button>}
      </div>
      
      {filteredRentals.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">📋</div>
          <p>{search ? 'No rentals match your search' : 'No rentals found'}</p>
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
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', fontSize: '14px', letterSpacing: '1px' }}>RENTAL ID</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', fontSize: '14px', letterSpacing: '1px' }}>USER</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', fontSize: '14px', letterSpacing: '1px' }}>GAME</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', fontSize: '14px', letterSpacing: '1px' }}>COPY ID</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', fontSize: '14px', letterSpacing: '1px' }}>ISSUED</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', fontSize: '14px', letterSpacing: '1px' }}>DUE</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', fontSize: '14px', letterSpacing: '1px' }}>RETURNED</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', fontSize: '14px', letterSpacing: '1px' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredRentals.map((rental, index) => (
                <tr key={rental.RentalID} style={{ 
                  borderBottom: '1px solid var(--border2)',
                  background: index % 2 === 0 ? 'var(--card2)' : 'var(--card)',
                  transition: 'all 0.3s',
                  fontFamily: 'Rajdhani, sans-serif'
                }}>
                  <td style={{ padding: '16px', fontSize: '15px', fontWeight: '600', color: 'var(--cyan)' }}>#{rental.RentalID}</td>
                  <td style={{ padding: '16px', fontSize: '15px', color: 'var(--text)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ 
                        width: '32px', 
                        height: '32px', 
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--cyan), var(--purple))',
                        color: 'var(--bg)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px',
                        fontWeight: '700',
                        fontFamily: 'Orbitron, monospace',
                        boxShadow: 'var(--cyan-glow)'
                      }}>
                        {rental.UserName?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <div style={{ fontWeight: '600' }}>{rental.UserName}</div>
                        {rental.UserEmail && (
                          <div style={{ fontSize: '12px', color: 'var(--text2)' }}>{rental.UserEmail}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px', fontSize: '15px', color: 'var(--text)' }}>
                    <div>
                      <div style={{ fontWeight: '600' }}>{rental.GameTitle}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text2)' }}>
                        {rental.Platform} • {rental.Genre}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px', fontSize: '15px', color: 'var(--cyan)', fontFamily: 'Orbitron, monospace' }}>
                    {rental.CopyID}
                  </td>
                  <td style={{ padding: '16px', fontSize: '15px', color: 'var(--text2)' }}>
                    {formatDate(rental.DateIssued)}
                  </td>
                  <td style={{ 
                    padding: '16px', 
                    fontSize: '15px', 
                    color: new Date(rental.DateDue) < new Date() && rental.DateReturned === null ? '#DC3545' : 'var(--text2)' 
                  }}>
                    {formatDate(rental.DateDue)}
                  </td>
                  <td style={{ padding: '16px', fontSize: '15px', color: 'var(--text2)' }}>
                    {rental.DateReturned ? formatDate(rental.DateReturned) : '—'}
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {rental.DateReturned === null && (
                        <button 
                          onClick={() => handleReturnRental(rental.RentalID)}
                          className="btn btn-sm"
                          style={{
                            background: 'var(--green)',
                            color: 'var(--bg)',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}
                        >
                          Return
                        </button>
                      )}
                      <button 
                        onClick={() => handleDeleteRental(rental.RentalID)}
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
                    </div>
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
