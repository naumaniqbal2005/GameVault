import { useState, useEffect } from 'react';
import Waves from './component/Waves';
import GameList from './components/GameList';
import RentGame from './components/RentGame';
import ReviewGame from './components/ReviewGame';
import Test from './components/test';
import AdminDashboard from './components/AdminDashboard';
import AdminUsers from './components/AdminUsers';
import AdminGames from './components/AdminGames';
import AdminRentals from './components/AdminRentals';
import AdminTransactions from './components/AdminTransactions';

import './App.css';

const API = 'http://localhost:5000/api';

export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState('games');
  const [tab, setTab] = useState('login');
  const [form, setForm] = useState({ fullName: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(null);

  // Check for saved user session on app load
  useEffect(() => {
    const savedUser = localStorage.getItem('gamevault_user');
    const savedToken = localStorage.getItem('gamevault_token');

    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        if (savedToken) {
          setToken(savedToken);
          verifyAdminToken(savedToken);
        }
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        localStorage.removeItem('gamevault_user');
        localStorage.removeItem('gamevault_token');
      }
    }
  }, []);

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    setPage('games');
    setTab('login');
    localStorage.removeItem('gamevault_user');
    localStorage.removeItem('gamevault_token');
  };

  const verifyAdminToken = async (authToken) => {
    try {
      const res = await fetch(`${API}/admin/verify`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setPage('admin');
      }
    } catch (error) {
      console.error('Token verification failed:', error);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);

    // Try admin login first (only on login tab)
    if (tab === 'login') {
      try {
        const res = await fetch(`${API}/admin/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: form.email, password: form.password }),
        });
        const data = await res.json();

        if (res.ok) {
          const adminUser = data.user;
          setUser(adminUser);
          setToken(data.token);
          localStorage.setItem('gamevault_user', JSON.stringify(adminUser));
          localStorage.setItem('gamevault_token', data.token);
          setPage('admin');
          setLoading(false);
          return;
        }
      } catch (err) {
        // Not an admin, fall through to regular login
      }
    }

    // Regular user login or register
    const url = tab === 'login' ? `${API}/users/login` : `${API}/users/register`;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || 'Something went wrong');

      if (tab === 'login') {
        const userData = data.user || data;
        setUser(userData);
        localStorage.setItem('gamevault_user', JSON.stringify(userData));
        if (data.token) {
          setToken(data.token);
          localStorage.setItem('gamevault_token', data.token);
        }
        setPage('games');
      } else {
        setTab('login');
        setError('✓ Account created — please login');
      }
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  const userNavItems = [
    { id: 'games', label: 'Catalog' },
    { id: 'rent', label: 'Rent' },
    { id: 'purchase', label: 'Purchase' },
    { id: 'review', label: 'Reviews' },
    { id: 'test', label: 'Test' },
    { id: 'digital-waitlist', label: 'Digital Waitlist' },
    { id: 'physical-waitlist', label: 'Physical Waitlist' },
    { id: 'purchase-history', label: 'Purchase History' },
    { id: 'upcoming-catalogue', label: 'Upcoming' },
  ];

  const adminNavItems = [
    { id: 'admin', label: 'Dashboard' },
    { id: 'admin-users', label: 'Users' },
    { id: 'admin-games', label: 'Games' },
    { id: 'admin-rentals', label: 'Rentals' },
    { id: 'admin-transactions', label: 'Transactions' },
    { id: 'admin-membership', label: 'Membership' },
    { id: 'admin-wishlist', label: 'Waitlist' },
  ];

  if (!user) {
    return (
      <div className="auth-page">
        <div className="auth-glow" />
        <div className="auth-box">
          <div className="brand-name" style={{textAlign: 'center', marginBottom: '0.4rem'}}>GameVault</div>
          <div className="auth-sub">Your ultimate gaming platform</div>
          <div className="auth-tabs">
            <button className={`auth-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => { setTab('login'); setError(''); }}>Login</button>
            <button className={`auth-tab ${tab === 'register' ? 'active' : ''}`} onClick={() => { setTab('register'); setError(''); }}>Register</button>
          </div>
          {error && <div className={`alert ${error.startsWith('✓') ? 'alert-success' : 'alert-error'}`}>{error}</div>}
          <form onSubmit={handleAuth}>
            {tab === 'register' && (
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" placeholder="John Doe" value={form.fullName}
                  onChange={e => setForm({ ...form, fullName: e.target.value })} required />
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-input" type="email" placeholder="you@example.com" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Password</label>
              <input className="form-input" type="password" placeholder="••••••••" value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })} required />
            </div>
            <button type="submit" className="btn btn-cyan btn-full" disabled={loading}>
              {loading ? 'Please wait...' : tab === 'login' ? 'LOGIN' : 'CREATE ACCOUNT'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <>
      <nav className="navbar">
        <div className="brand" onClick={() => setPage('games')}>
          <span className="brand-name">GameVault</span>
        </div>
        <div className="nav-links">
          {(user?.isAdmin ? adminNavItems : userNavItems).map(n => (
            <button key={n.id} className={`nav-btn ${page === n.id ? 'active' : ''}`} onClick={() => setPage(n.id)}>
              {n.label}
            </button>
          ))}
        </div>
        <div className="nav-user">
          <div className="user-chip">
            <div className="user-avatar">{user.fullName?.[0]?.toUpperCase() || 'U'}</div>
            {user.fullName}
          </div>
          <button className="btn-logout" onClick={handleLogout}>Logout</button>
        </div>
      </nav>
      <div className="main">
        {page === 'games' && <GameList user={user} />}
        {page === 'rent' && <RentGame user={user} />}
        {page === 'review' && <ReviewGame user={user} />}
        {page === 'test' && <Test />}
        {user?.isAdmin && page === 'admin' && <AdminDashboard />}
        {user?.isAdmin && page === 'admin-users' && <AdminUsers />}
        {user?.isAdmin && page === 'admin-games' && <AdminGames />}
        {user?.isAdmin && page === 'admin-rentals' && <AdminRentals />}
        {user?.isAdmin && page === 'admin-transactions' && <AdminTransactions />}
      </div>
    </>
  );
}

