import React, { useState, useEffect, useCallback } from 'react';

const API = 'http://localhost:5000/api';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/users`);
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : data.users || []);
      setError('');
    } catch (error) {
      console.error('Error loading users:', error);
      setUsers([]);
      setError('Failed to fetch users');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const res = await fetch(`${API}/users/${userId}`, {
        method: 'DELETE'
      });
      
      if (res.ok) {
        setUsers(users.filter(user => user.UserID !== userId));
      } else {
        const errorData = await res.json();
        alert(errorData.message || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Delete user error:', error);
      alert('Failed to delete user');
    }
  };

  const handleSuspendUser = async (userId) => {
    if (!window.confirm('Are you sure you want to suspend this user?')) {
      return;
    }

    try {
      const res = await fetch(`${API}/users/${userId}/suspend`, {
        method: 'PUT'
      });
      
      if (res.ok) {
        const data = await res.json();
        setUsers(users.map(user => 
          user.UserID === userId ? data.user : user
        ));
      } else {
        const errorData = await res.json();
        alert(errorData.message || 'Failed to suspend user');
      }
    } catch (error) {
      console.error('Suspend user error:', error);
      alert('Failed to suspend user');
    }
  };

  const handleUnsuspendUser = async (userId) => {
    if (!window.confirm('Are you sure you want to unsuspend this user?')) {
      return;
    }

    try {
      const res = await fetch(`${API}/users/${userId}/unsuspend`, {
        method: 'PUT'
      });
      
      if (res.ok) {
        const data = await res.json();
        setUsers(users.map(user => 
          user.UserID === userId ? data.user : user
        ));
      } else {
        const errorData = await res.json();
        alert(errorData.message || 'Failed to unsuspend user');
      }
    } catch (error) {
      console.error('Unsuspend user error:', error);
      alert('Failed to unsuspend user');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = !search || 
      user.FullName?.toLowerCase().includes(search.toLowerCase()) ||
      user.Email?.toLowerCase().includes(search.toLowerCase());
    
    return matchesSearch;
  }).sort((a, b) => a.UserID - b.UserID);

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <div>
            <div className="page-title">USER MANAGEMENT</div>
            <div className="page-sub">Manage user accounts</div>
          </div>
        </div>
        <div className="loading"><div className="spinner" /> Loading users...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="page-header">
          <div>
            <div className="page-title">USER MANAGEMENT</div>
            <div className="page-sub">Manage user accounts</div>
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
          <div className="page-title">USER MANAGEMENT</div>
          <div className="page-sub">{filteredUsers.length} of {users.length} users</div>
        </div>
        <button className="btn btn-cyan" onClick={loadUsers}>
          🔄 Refresh
        </button>
      </div>

      <div className="search-bar">
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input 
            className="search-input" 
            placeholder="Search users by name or email..." 
            value={search}
            onChange={e => setSearch(e.target.value)} 
          />
        </div>
        {search && <button className="btn btn-ghost btn-sm" onClick={() => setSearch('')}>Clear</button>}
      </div>
      
      {filteredUsers.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">👥</div>
          <p>{search ? 'No users match your search' : 'No users found'}</p>
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
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', fontSize: '14px', letterSpacing: '1px' }}>USER ID</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', fontSize: '14px', letterSpacing: '1px' }}>USER</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', fontSize: '14px', letterSpacing: '1px' }}>PHONE</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', fontSize: '14px', letterSpacing: '1px' }}>ADDRESS</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', fontSize: '14px', letterSpacing: '1px' }}>STATUS</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', fontSize: '14px', letterSpacing: '1px' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, index) => (
                <tr key={user.UserID} style={{ 
                  borderBottom: '1px solid var(--border2)',
                  background: index % 2 === 0 ? 'var(--card2)' : 'var(--card)',
                  transition: 'all 0.3s',
                  fontFamily: 'Rajdhani, sans-serif'
                }}>
                  <td style={{ padding: '16px', fontSize: '15px', fontWeight: '600', color: 'var(--cyan)' }}>#{user.UserID}</td>
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
                        {user.FullName?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <div style={{ fontWeight: '600' }}>{user.FullName}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text2)' }}>{user.Email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px', fontSize: '15px', color: 'var(--text2)' }}>
                    {user.Phone || '—'}
                  </td>
                  <td style={{ padding: '16px', fontSize: '15px', color: 'var(--text2)' }}>
                    {user.Address || '—'}
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ 
                      padding: '6px 14px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '700',
                      fontFamily: 'Orbitron, monospace',
                      letterSpacing: '1px',
                      background: user.AccountStatus === 'Active' ? 'var(--green-dim)' : 'var(--orange-dim)',
                      color: user.AccountStatus === 'Active' ? 'var(--green)' : 'var(--orange)',
                      border: user.AccountStatus === 'Active' ? '1px solid var(--green)' : '1px solid var(--orange)',
                      boxShadow: user.AccountStatus === 'Active' ? '0 0 10px rgba(0,255,136,0.3)' : '0 0 10px rgba(255,107,0,0.3)'
                    }}>
                      {user.AccountStatus}
                    </span>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {user.AccountStatus === 'Active' ? (
                        <button 
                          onClick={() => handleSuspendUser(user.UserID)}
                          className="btn btn-sm"
                          style={{
                            background: 'var(--orange)',
                            color: 'var(--bg)',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}
                        >
                          Suspend
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleUnsuspendUser(user.UserID)}
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
                          Unsuspend
                        </button>
                      )}
                      <button 
                        onClick={() => handleDeleteUser(user.UserID)}
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
