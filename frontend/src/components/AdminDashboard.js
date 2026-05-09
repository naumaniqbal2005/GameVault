import React, { useState, useEffect, useCallback } from 'react';

const API = 'http://localhost:5000/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalGames: 0,
    activeRentals: 0,
    totalRevenue: 0,
    totalRentals: 0,
    totalPurchases: 0,
    availableDigital: 0,
    availablePhysical: 0,
    overdueRentals: 0,
    recentTransactions: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadStats = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('gamevault_token');
      const res = await fetch(`${API}/dashboard/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load dashboard stats');
      }
      setStats(data);
      setError('');
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      setError(error.message || 'Failed to load dashboard stats');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const formatCurrency = (amount) => {
    return `$${Math.round(parseFloat(amount)).toLocaleString()}`;
  };

  const formatNumber = (number) => {
    return Math.round(parseInt(number)).toLocaleString();
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <div>
            <div className="page-title">ADMIN DASHBOARD</div>
            <div className="page-sub">System management</div>
          </div>
        </div>
        <div className="loading"><div className="spinner" /> Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="page-header">
          <div>
            <div className="page-title">ADMIN DASHBOARD</div>
            <div className="page-sub">System management</div>
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
          <div className="page-title">ADMIN DASHBOARD</div>
          <div className="page-sub">System overview and metrics</div>
        </div>
        <button className="btn btn-cyan" onClick={loadStats}>
          🔄 Refresh
        </button>
      </div>

      <div className="dashboard-grid">
        <div className="stat-card" style={{ 
          background: 'linear-gradient(135deg, rgba(0,240,255,0.1), rgba(157,78,221,0.1))',
          border: '1px solid var(--cyan)'
        }}>
          <div className="stat-icon" style={{ 
            background: 'linear-gradient(135deg, var(--cyan), var(--purple))',
            boxShadow: 'var(--cyan-glow)'
          }}>👥</div>
          <div className="stat-info">
            <div className="stat-val" style={{ color: 'var(--cyan)' }}>{formatNumber(stats.totalUsers)}</div>
            <div className="stat-label">Total Users</div>
          </div>
        </div>

        <div className="stat-card" style={{ 
          background: 'linear-gradient(135deg, rgba(0,255,136,0.1), rgba(0,240,255,0.1))',
          border: '1px solid var(--green)'
        }}>
          <div className="stat-icon" style={{ 
            background: 'linear-gradient(135deg, var(--green), var(--cyan))',
            boxShadow: '0 0 20px rgba(0,255,136,0.4)'
          }}>🎮</div>
          <div className="stat-info">
            <div className="stat-val" style={{ color: 'var(--green)' }}>{formatNumber(stats.totalGames)}</div>
            <div className="stat-label">Games</div>
          </div>
        </div>

        <div className="stat-card" style={{ 
          background: 'linear-gradient(135deg, rgba(255,107,0,0.1), rgba(0,255,136,0.1))',
          border: '1px solid var(--orange)'
        }}>
          <div className="stat-icon" style={{ 
            background: 'linear-gradient(135deg, var(--orange), var(--green))',
            boxShadow: 'var(--orange-glow)'
          }}>📋</div>
          <div className="stat-info">
            <div className="stat-val" style={{ color: 'var(--orange)' }}>{formatNumber(stats.activeRentals)}</div>
            <div className="stat-label">Active Rentals</div>
          </div>
        </div>

        <div className="stat-card" style={{ 
          background: 'linear-gradient(135deg, rgba(220,53,69,0.1), rgba(255,107,0,0.1))',
          border: '1px solid #DC3545'
        }}>
          <div className="stat-icon" style={{ 
            background: 'linear-gradient(135deg, #DC3545, var(--orange))',
            boxShadow: '0 0 20px rgba(220,53,69,0.4)'
          }}>💰</div>
          <div className="stat-info">
            <div className="stat-val" style={{ color: '#DC3545' }}>{formatCurrency(stats.totalRevenue)}</div>
            <div className="stat-label">Total Revenue</div>
          </div>
        </div>

        <div className="stat-card" style={{ 
          background: 'linear-gradient(135deg, rgba(157,78,221,0.1), rgba(0,240,255,0.1))',
          border: '1px solid var(--purple)'
        }}>
          <div className="stat-icon" style={{ 
            background: 'linear-gradient(135deg, var(--purple), var(--cyan))',
            boxShadow: '0 0 20px rgba(157,78,221,0.4)'
          }}>📦</div>
          <div className="stat-info">
            <div className="stat-val" style={{ color: 'var(--purple)' }}>{formatNumber(stats.totalRentals)}</div>
            <div className="stat-label">Total Rentals</div>
          </div>
        </div>

        <div className="stat-card" style={{ 
          background: 'linear-gradient(135deg, rgba(0,240,255,0.1), rgba(255,107,0,0.1))',
          border: '1px solid var(--cyan)'
        }}>
          <div className="stat-icon" style={{ 
            background: 'linear-gradient(135deg, var(--cyan), var(--orange))',
            boxShadow: 'var(--cyan-glow)'
          }}>🛒</div>
          <div className="stat-info">
            <div className="stat-val" style={{ color: 'var(--cyan)' }}>{formatNumber(stats.totalPurchases)}</div>
            <div className="stat-label">Total Purchases</div>
          </div>
        </div>

        <div className="stat-card" style={{ 
          background: 'linear-gradient(135deg, rgba(0,255,136,0.1), rgba(157,78,221,0.1))',
          border: '1px solid var(--green)'
        }}>
          <div className="stat-icon" style={{ 
            background: 'linear-gradient(135deg, var(--green), var(--purple))',
            boxShadow: '0 0 20px rgba(0,255,136,0.4)'
          }}>💿</div>
          <div className="stat-info">
            <div className="stat-val" style={{ color: 'var(--green)' }}>{formatNumber(stats.availableDigital)}</div>
            <div className="stat-label">Digital Copies</div>
          </div>
        </div>

        <div className="stat-card" style={{ 
          background: 'linear-gradient(135deg, rgba(255,107,0,0.1), rgba(220,53,69,0.1))',
          border: '1px solid var(--orange)'
        }}>
          <div className="stat-icon" style={{ 
            background: 'linear-gradient(135deg, var(--orange), #DC3545)',
            boxShadow: 'var(--orange-glow)'
          }}>📀</div>
          <div className="stat-info">
            <div className="stat-val" style={{ color: 'var(--orange)' }}>{formatNumber(stats.availablePhysical)}</div>
            <div className="stat-label">Physical Copies</div>
          </div>
        </div>
      </div>

      <div className="dashboard-sections">
        <div className="dashboard-section">
          <div className="section-header">
            <div className="section-title"> Overdue Rentals</div>
            <div className="section-count" style={{ color: '#DC3545' }}>{formatNumber(stats.overdueRentals)}</div>
          </div>
          <div className="section-content" style={{ 
            background: 'rgba(220,53,69,0.1)',
            border: '1px solid rgba(220,53,69,0.3)',
            borderRadius: 'var(--radius)',
            padding: '20px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#DC3545', marginBottom: '10px' }}>
              {formatNumber(stats.overdueRentals)}
            </div>
            <div style={{ color: 'var(--text2)' }}>Rentals past due date</div>
          </div>
        </div>
      </div>
    </div>
  );
}
