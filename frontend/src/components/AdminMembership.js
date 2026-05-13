import React, { useState, useEffect, useCallback } from 'react';

const API = 'http://localhost:5000/api';

export default function AdminMembership() {
  const [memberships, setMemberships] = useState([]);
  const [tiers, setTiers] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    userId: '',
    tierId: '',
    startDate: '',
    endDate: ''
  });

  const loadMemberships = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/memberships`);
      const data = await res.json();
      setMemberships(Array.isArray(data) ? data : []);
      setError('');
    } catch (error) {
      console.error('Error loading memberships:', error);
      setMemberships([]);
      setError('Failed to fetch memberships');
    }
    setLoading(false);
  }, []);

  const loadTiers = useCallback(async () => {
    try {
      const res = await fetch(`${API}/memberships/tiers`);
      const data = await res.json();
      setTiers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading tiers:', error);
      setTiers([]);
    }
  }, []);

  const loadUsers = useCallback(async () => {
    try {
      const res = await fetch(`${API}/users`);
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : data.users || []);
    } catch (error) {
      console.error('Error loading users:', error);
      setUsers([]);
    }
  }, []);
  //empty depencendy array meaning only created once on component mount, and never created again

  useEffect(() => {
    loadMemberships();
    loadTiers();
    loadUsers();
  }, [loadMemberships, loadTiers, loadUsers]);
  //checks the if the functions have changed which would be the case if they had something in their dependencies, 
  //in this case they don't, otherwise it noticing the change it calls on the latest created versions or calls the function again to have the updated values



  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.userId || !form.tierId || !form.startDate || !form.endDate) {
      alert('Please fill all fields');
      return;
    }

    try {
      const res = await fetch(`${API}/memberships/user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: parseInt(form.userId),
          tierId: parseInt(form.tierId),
          startDate: form.startDate,
          endDate: form.endDate
        })
      });

      if (res.ok) {
        setShowForm(false);
        setForm({ userId: '', tierId: '', startDate: '', endDate: '' });
        loadMemberships();
      } else {
        const errorData = await res.json();
        alert(errorData.message || 'Failed to create membership');
      }
    } catch (error) {
      console.error('Create membership error:', error);
      alert('Failed to create membership');
    }
  };

  const handleStatusUpdate = async (membershipId, newStatus) => {
    try {
      const res = await fetch(`${API}/memberships/${membershipId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        loadMemberships();
      } else {
        const errorData = await res.json();
        alert(errorData.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Update status error:', error);
      alert('Failed to update status');
    }
  };

  const handleDeleteMembership = async (membershipId) => {
    if (!window.confirm('Are you sure you want to permanently delete this cancelled membership? This action cannot be undone.')) {
      return;
    }

    try {
      const res = await fetch(`${API}/memberships/${membershipId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        loadMemberships();
      } else {
        const errorData = await res.json();
        alert(errorData.message || 'Failed to delete membership');
      }
    } catch (error) {
      console.error('Delete membership error:', error);
      alert('Failed to delete membership');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString();
  };

  const getTierName = (tierId) => {
    const tier = tiers.find(t => t.TierID === tierId);
    return tier ? tier.TierName : 'Unknown';
  };

  const getUserName = (userId) => {
    const user = users.find(u => u.UserID === userId);
    return user ? user.FullName : 'Unknown User';
  };

  const filteredMemberships = memberships.filter(membership => {
    const matchesSearch = !search ||
      getUserName(membership.UserID)?.toLowerCase().includes(search.toLowerCase()) ||
      getTierName(membership.TierID)?.toLowerCase().includes(search.toLowerCase()) ||
      membership.Status?.toLowerCase().includes(search.toLowerCase());

    return matchesSearch;
  }).sort((a, b) => b.MembershipID - a.MembershipID);

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <div>
            <div className="page-title">MEMBERSHIP MANAGEMENT</div>
            <div className="page-sub">Manage user memberships</div>
          </div>
        </div>
        <div className="loading"><div className="spinner" /> Loading memberships...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="page-header">
          <div>
            <div className="page-title">MEMBERSHIP MANAGEMENT</div>
            <div className="page-sub">Manage user memberships</div>
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
          <div className="page-title">MEMBERSHIP MANAGEMENT</div>
          <div className="page-sub">{filteredMemberships.length} of {memberships.length} memberships</div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-cyan" onClick={() => setShowForm(true)}>
            ➕ Add Membership
          </button>
          <button className="btn btn-cyan" onClick={loadMemberships}>
            🔄 Refresh
          </button>
        </div>
      </div>

      <div className="search-bar">
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input
            className="search-input"
            placeholder="Search memberships by user, tier, or status..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        {search && <button className="btn btn-ghost btn-sm" onClick={() => setSearch('')}>Clear</button>}
      </div>

      {showForm && (
        <div style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: '24px',
          marginBottom: '20px'
        }}>
          <h3 style={{ marginBottom: '20px', color: 'var(--text)' }}>Add New Membership</h3>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">User</label>
              <select
                className="form-input"
                value={form.userId}
                onChange={e => setForm({ ...form, userId: e.target.value })}
                required
              >
                <option value="">Select User</option>
                {users.map(user => (
                  <option key={user.UserID} value={user.UserID}>
                    {user.FullName} ({user.Email})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Membership Tier</label>
              <select
                className="form-input"
                value={form.tierId}
                onChange={e => setForm({ ...form, tierId: e.target.value })}
                required
              >
                <option value="">Select Tier</option>
                {tiers.map(tier => (
                  <option key={tier.TierID} value={tier.TierID}>
                    {tier.TierName} ({tier.DiscountPercent}% discount)
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input
                className="form-input"
                type="date"
                value={form.startDate}
                onChange={e => setForm({ ...form, startDate: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">End Date</label>
              <input
                className="form-input"
                type="date"
                value={form.endDate}
                onChange={e => setForm({ ...form, endDate: e.target.value })}
                required
              />
            </div>

            <div style={{ gridColumn: 'span 2', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-cyan">
                Create Membership
              </button>
            </div>
          </form>
        </div>
      )}

      {filteredMemberships.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">👑</div>
          <p>{search ? 'No memberships match your search' : 'No memberships found'}</p>
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
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', fontSize: '14px', letterSpacing: '1px' }}>MEMBERSHIP ID</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', fontSize: '14px', letterSpacing: '1px' }}>USER</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', fontSize: '14px', letterSpacing: '1px' }}>TIER</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', fontSize: '14px', letterSpacing: '1px' }}>START DATE</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', fontSize: '14px', letterSpacing: '1px' }}>END DATE</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', fontSize: '14px', letterSpacing: '1px' }}>STATUS</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', fontSize: '14px', letterSpacing: '1px' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredMemberships.map((membership, index) => (
                <tr key={membership.MembershipID} style={{
                  borderBottom: '1px solid var(--border2)',
                  background: index % 2 === 0 ? 'var(--card2)' : 'var(--card)',
                  transition: 'all 0.3s',
                  fontFamily: 'Rajdhani, sans-serif'
                }}>
                  <td style={{ padding: '16px', fontSize: '15px', fontWeight: '600', color: 'var(--cyan)' }}>#{membership.MembershipID}</td>
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
                        {getUserName(membership.UserID)?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <span style={{ fontWeight: '600' }}>{getUserName(membership.UserID)}</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px', fontSize: '15px', color: 'var(--text)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        padding: '6px 14px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '700',
                        fontFamily: 'Orbitron, monospace',
                        letterSpacing: '1px',
                        background: 'rgba(255,107,0,0.12)',
                        color: 'var(--orange)',
                        border: '1px solid var(--orange)',
                        boxShadow: '0 0 10px rgba(255,107,0,0.3)'
                      }}>
                        👑 {getTierName(membership.TierID)}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '16px', fontSize: '15px', color: 'var(--text2)' }}>
                    {formatDate(membership.StartDate)}
                  </td>
                  <td style={{ padding: '16px', fontSize: '15px', color: 'var(--text2)' }}>
                    {formatDate(membership.EndDate)}
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span style={{
                      padding: '6px 14px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '700',
                      fontFamily: 'Orbitron, monospace',
                      letterSpacing: '1px',
                      background: membership.Status === 'Active' ? 'var(--green-dim)' :
                        membership.Status === 'Expired' ? 'var(--orange-dim)' : 'rgba(220,53,69,0.12)',
                      color: membership.Status === 'Active' ? 'var(--green)' :
                        membership.Status === 'Expired' ? 'var(--orange)' : '#DC3545',
                      border: membership.Status === 'Active' ? '1px solid var(--green)' :
                        membership.Status === 'Expired' ? '1px solid var(--orange)' : '1px solid #DC3545',
                      boxShadow: membership.Status === 'Active' ? '0 0 10px rgba(0,255,136,0.3)' :
                        membership.Status === 'Expired' ? '0 0 10px rgba(255,107,0,0.3)' : '0 0 10px rgba(220,53,69,0.3)'
                    }}>
                      {membership.Status}
                    </span>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {membership.Status === 'Active' && (
                        <button
                          onClick={() => handleStatusUpdate(membership.MembershipID, 'Expired')}
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
                          Expire
                        </button>
                      )}
                      {membership.Status !== 'Cancelled' && (
                        <button
                          onClick={() => handleStatusUpdate(membership.MembershipID, 'Cancelled')}
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
                          Cancel
                        </button>
                      )}
                      {membership.Status === 'Cancelled' && (
                        <button
                          onClick={() => handleDeleteMembership(membership.MembershipID)}
                          className="btn btn-sm"
                          style={{
                            background: 'rgba(108, 117, 125, 0.8)',
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
                      )}
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
