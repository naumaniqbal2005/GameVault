import { useState, useEffect } from 'react';
import Waves from './component/Waves';
import GameList from './components/GameList';
import RentGame from './components/RentGame';
import PurchaseGame from './components/PurchaseGame';
import ReviewGame from './components/ReviewGame';
import AdminDashboard from './components/AdminDashboard';
import AdminUsers from './components/AdminUsers';
import AdminGames from './components/AdminGames';
import AdminRentals from './components/AdminRentals';
import AdminTransactions from './components/AdminTransactions';
import AdminMembership from './components/AdminMembership';
import DigitalWaitlist from './pages/Home/DigitalWaitlist';
import PhysicalWaitlist from './pages/Home/PhysicalWaitlist';
import PurchaseHistory from './pages/Home/PurchaseHistory';
import UpcomingCatalogue from './pages/Home/UpcomingCatalogue';
import AdminWaitlist from './components/AdminWaitlist';

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
    { id: 'games', label: 'Catalog', icon: '◈' },
    { id: 'rent', label: 'Rent', icon: '⟳' },
    { id: 'purchase', label: 'Purchase', icon: '◉' },
    { id: 'review', label: 'Reviews', icon: '★' },
    { id: 'digital-waitlist', label: 'Digital Waitlist', icon: '💿' },
    { id: 'physical-waitlist', label: 'Physical Waitlist', icon: '📀' },
    { id: 'purchase-history', label: 'Purchase History', icon: '📜' },
    { id: 'upcoming-catalogue', label: 'Upcoming', icon: '🔮' },
  ];

  const adminNavItems = [
    { id: 'admin', label: 'Dashboard', icon: '⚙️' },
    { id: 'admin-users', label: 'Users', icon: '👥' },
    { id: 'admin-games', label: 'Games', icon: '🎮' },
    { id: 'admin-rentals', label: 'Rentals', icon: '📋' },
    { id: 'admin-transactions', label: 'Transactions', icon: '💰' },
    { id: 'admin-membership', label: 'Membership', icon: '👑' },
    { id: 'admin-wishlist', label: 'Waitlist', icon: '❤️' },
  ];

  if (!user) {
    return (
      <>
        <nav className="navbar">
          <div className="brand">
            <div className="brand-logo">🎮</div>
            <span className="brand-name">GAMEVAULT</span>
          </div>
          <div />
          <button className="btn-signin">SIGN IN</button>
        </nav>
        <div className="auth-page">
          <div className="auth-glow" />
          <div className="auth-box">
            <div className="auth-title">GAMEVAULT</div>
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
      </>
    );
  }

  return (
    <>
      <Waves
        lineColor="#4c6b93"
        backgroundColor="transparent"
        waveSpeedX={0.02}
        waveSpeedY={0.01}
        waveAmpX={40}
        waveAmpY={20}
        friction={0.9}
        tension={0.01}
        maxCursorMove={120}
        xGap={12}
        yGap={36}
      />
      <nav className="navbar">
        <div className="brand" onClick={() => setPage('games')}>
          <div className="brand-logo">🎮</div>
          <span className="brand-name">GAMEVAULT</span>
        </div>
        <div className="nav-links">
          {(user?.isAdmin ? adminNavItems : userNavItems).map(n => (
            <button key={n.id} className={`nav-btn ${page === n.id ? 'active' : ''}`} onClick={() => setPage(n.id)}>
              {n.icon} {n.label}
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
        {page === 'purchase' && <PurchaseGame user={user} />}
        {page === 'review' && <ReviewGame user={user} />}
        {page === 'digital-waitlist' && <DigitalWaitlist user={user} />}
        {page === 'physical-waitlist' && <PhysicalWaitlist user={user} />}
        {page === 'purchase-history' && <PurchaseHistory user={user} />}
        {page === 'upcoming-catalogue' && <UpcomingCatalogue user={user} />}
        {user?.isAdmin && page === 'admin' && <AdminDashboard />}
        {user?.isAdmin && page === 'admin-users' && <AdminUsers />}
        {user?.isAdmin && page === 'admin-games' && <AdminGames />}
        {user?.isAdmin && page === 'admin-rentals' && <AdminRentals />}
        {user?.isAdmin && page === 'admin-transactions' && <AdminTransactions />}
        {user?.isAdmin && page === 'admin-membership' && <AdminMembership />}
        {user?.isAdmin && page === 'admin-wishlist' && <AdminWaitlist />}
      </div>
    </>
  );
}

