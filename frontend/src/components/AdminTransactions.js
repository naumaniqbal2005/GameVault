import React, { useState, useEffect, useCallback } from 'react';

const API = 'http://localhost:5000/api';

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/transactions`);
      const data = await res.json();
      setTransactions(Array.isArray(data) ? data : data.transactions || []);
      setError('');
    } catch (error) {
      console.error('Error loading transactions:', error);
      setTransactions([]);
      setError('Failed to fetch transactions');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString();
  };

  const formatAmount = (amount) => {
    if (amount === null || amount === undefined) return '—';
    return `$${parseFloat(amount).toFixed(2)}`;
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = !search || 
      transaction.UserName?.toLowerCase().includes(search.toLowerCase()) ||
      transaction.AdminName?.toLowerCase().includes(search.toLowerCase()) ||
      transaction.TransactionID?.toString().includes(search);
    
    return matchesSearch;
  }).sort((a, b) => a.TransactionID - b.TransactionID);

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <div>
            <div className="page-title">TRANSACTION HISTORY</div>
            <div className="page-sub">View all transactions</div>
          </div>
        </div>
        <div className="loading"><div className="spinner" /> Loading transactions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="page-header">
          <div>
            <div className="page-title">TRANSACTION HISTORY</div>
            <div className="page-sub">View all transactions</div>
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
          <div className="page-title">TRANSACTION HISTORY</div>
          <div className="page-sub">{filteredTransactions.length} of {transactions.length} transactions</div>
        </div>
        <button className="btn btn-cyan" onClick={loadTransactions}>
          🔄 Refresh
        </button>
      </div>

      <div className="search-bar">
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input 
            className="search-input" 
            placeholder="Search transactions by user, admin, or ID..." 
            value={search}
            onChange={e => setSearch(e.target.value)} 
          />
        </div>
        {search && <button className="btn btn-ghost btn-sm" onClick={() => setSearch('')}>Clear</button>}
      </div>
      
      {filteredTransactions.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">💰</div>
          <p>{search ? 'No transactions match your search' : 'No transactions found'}</p>
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
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', fontSize: '14px', letterSpacing: '1px' }}>TRANSACTION ID</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', fontSize: '14px', letterSpacing: '1px' }}>USER</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', fontSize: '14px', letterSpacing: '1px' }}>ADMIN</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', fontSize: '14px', letterSpacing: '1px' }}>TYPE</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', fontSize: '14px', letterSpacing: '1px' }}>RENTAL/PURCHASE ID</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', fontSize: '14px', letterSpacing: '1px' }}>AMOUNT</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', fontSize: '14px', letterSpacing: '1px' }}>DISCOUNT</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', fontSize: '14px', letterSpacing: '1px' }}>DATE</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((transaction, index) => (
                <tr key={transaction.TransactionID} style={{ 
                  borderBottom: '1px solid var(--border2)',
                  background: index % 2 === 0 ? 'var(--card2)' : 'var(--card)',
                  transition: 'all 0.3s',
                  fontFamily: 'Rajdhani, sans-serif'
                }}>
                  <td style={{ padding: '16px', fontSize: '15px', fontWeight: '600', color: 'var(--cyan)' }}>#{transaction.TransactionID}</td>
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
                        {transaction.UserName?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <span style={{ fontWeight: '600' }}>{transaction.UserName}</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px', fontSize: '15px', color: 'var(--text)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ 
                        width: '32px', 
                        height: '32px', 
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--orange), var(--purple))',
                        color: 'var(--bg)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px',
                        fontWeight: '700',
                        fontFamily: 'Orbitron, monospace',
                        boxShadow: 'var(--orange-glow)'
                      }}>
                        {transaction.AdminName?.[0]?.toUpperCase() || 'A'}
                      </div>
                      <span style={{ fontWeight: '600' }}>{transaction.AdminName}</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px', fontSize: '15px', color: 'var(--text)' }}>
                    <div style={{ 
                      padding: '6px 14px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      background: transaction.TransactionType === 'Rental' ? 'rgba(0,240,255,0.12)' : 'rgba(255,107,0,0.12)',
                      color: transaction.TransactionType === 'Rental' ? 'var(--cyan)' : 'var(--orange)',
                      border: transaction.TransactionType === 'Rental' ? '1px solid var(--cyan)' : '1px solid var(--orange)',
                      display: 'inline-block',
                      textAlign: 'center',
                      minWidth: '60px'
                    }}>
                      {transaction.TransactionType || '—'}
                    </div>
                  </td>
                  <td style={{ padding: '16px', fontSize: '15px', color: 'var(--text2)' }}>
                    {transaction.RentalID ? `Rental #${transaction.RentalID}` : transaction.PurchaseID ? `Purchase #${transaction.PurchaseID}` : '—'}
                  </td>
                  <td style={{ padding: '16px', fontSize: '15px', color: 'var(--green)', fontWeight: '600', fontFamily: 'Orbitron, monospace' }}>
                    {formatAmount(transaction.Amount)}
                  </td>
                  <td style={{ padding: '16px', fontSize: '15px', color: 'var(--text2)' }}>
                    {formatAmount(transaction.DiscountApplied)}
                  </td>
                  <td style={{ padding: '16px', fontSize: '15px', color: 'var(--text2)' }}>
                    {formatDate(transaction.TransactionDate)}
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
