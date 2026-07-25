import { useState, useEffect } from 'react';
import { Gamepad2, ShoppingCart, Star, FlaskConical, Clock, History, Calendar, LayoutDashboard, Users, Package, Receipt, CreditCard, UserCheck, ListTodo, Bell, Phone, MessageCircle, ShoppingCart as Cart } from 'lucide-react';
import GameList from './components/GameList';
import RentGame from './components/RentGame';
import ReviewGame from './components/ReviewGame';
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
  const [selectedGame, setSelectedGame] = useState(null);

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
    { id: 'games', label: 'Catalog', icon: Gamepad2 },
    { id: 'rent', label: 'Rent', icon: ShoppingCart },
    { id: 'purchase', label: 'Purchase', icon: ShoppingCart },
    { id: 'review', label: 'Reviews', icon: Star },
    { id: 'digital-waitlist', label: 'Digital Waitlist', icon: Clock },
    { id: 'physical-waitlist', label: 'Physical Waitlist', icon: Clock },
    { id: 'purchase-history', label: 'Purchase History', icon: History },
    { id: 'upcoming-catalogue', label: 'Upcoming', icon: Calendar },
  ];

  const adminNavItems = [
    { id: 'admin', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'admin-users', label: 'Users', icon: Users },
    { id: 'admin-games', label: 'Games', icon: Package },
    { id: 'admin-rentals', label: 'Rentals', icon: Receipt },
    { id: 'admin-transactions', label: 'Transactions', icon: CreditCard },
    { id: 'admin-membership', label: 'Membership', icon: UserCheck },
    { id: 'admin-wishlist', label: 'Waitlist', icon: ListTodo },
  ];

  if (!user) {
    return (
      <div className="auth-page" style={{
        position: 'relative',
        minHeight: '100vh'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'url(/bg.png)',
          backgroundSize: '150%',
          backgroundPosition: 'center 30%',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
          opacity: 0.6,
          zIndex: -1
        }} />
        <div className="auth-glow" />
        <div className="auth-box">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.5rem' }}>
            <Gamepad2 size={48} style={{ color: 'black', marginBottom: '0.25rem' }} />
            <div className="brand-name" style={{ textAlign: 'center', marginBottom: '0.15rem' }}>GameVault</div>
            <div style={{ textAlign: 'center', fontSize: '0.75rem', color: '#666', fontWeight: '600', letterSpacing: '-0.5px', fontFamily: "'Inter Tight', sans-serif" }}>The place to find the best games</div>
          </div>
          <div className="auth-tabs">
            <button className={`auth-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => { setTab('login'); setError(''); }}>Login</button>
            <button className={`auth-tab ${tab === 'register' ? 'active' : ''}`} onClick={() => { setTab('register'); setError(''); }}>Register</button>
          </div>
          {error && <div className={`alert ${error.startsWith('✓') ? 'alert-success' : 'alert-error'}`}>{error}</div>}
          <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
            {tab === 'register' && (
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  top: '-10px',
                  left: '15px',
                  background: 'red',
                  color: 'white',
                  border: '2px solid black',
                  boxShadow: '2px 2px 0px 0px black',
                  borderRadius: '8px',
                  padding: '4px 10px',
                  width: 'fit-content',
                  fontWeight: '800',
                  fontSize: '0.65rem',
                  fontFamily: "'Inter Tight', sans-serif",
                  letterSpacing: '1px',
                  zIndex: 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  Full Name
                </div>
                <input className="form-input" placeholder="John Doe" value={form.fullName}
                  onChange={e => setForm({ ...form, fullName: e.target.value })} required 
                  style={{
                    width: '100%',
                    background: 'white',
                    border: '2px solid black',
                    boxShadow: '4px 4px 0px 0px black',
                    borderRadius: '12px',
                    color: 'black',
                    fontFamily: "'Inter Tight', sans-serif",
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    padding: '0.75rem 1.25rem',
                    outline: 'none',
                    marginTop: '12px'
                  }}
                />
              </div>
            )}
            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
              <div style={{
                position: 'absolute',
                top: '-10px',
                left: '15px',
                background: 'red',
                color: 'white',
                border: '2px solid black',
                boxShadow: '2px 2px 0px 0px black',
                borderRadius: '8px',
                padding: '4px 10px',
                width: 'fit-content',
                fontWeight: '800',
                fontSize: '0.65rem',
                fontFamily: "'Inter Tight', sans-serif",
                letterSpacing: '1px',
                zIndex: 1,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                Email Address
              </div>
              <input className="form-input" type="email" placeholder="you@example.com" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })} required 
                style={{
                  width: '100%',
                  background: 'white',
                  border: '2px solid black',
                  boxShadow: '4px 4px 0px 0px black',
                  borderRadius: '12px',
                  color: 'black',
                  fontFamily: "'Inter Tight', sans-serif",
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  padding: '0.75rem 1.25rem',
                  outline: 'none',
                  marginTop: '12px'
                }}
              />
            </div>
            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', position: 'relative', marginBottom: '1.5rem' }}>
              <div style={{
                position: 'absolute',
                top: '-10px',
                left: '15px',
                background: 'red',
                color: 'white',
                border: '2px solid black',
                boxShadow: '2px 2px 0px 0px black',
                borderRadius: '8px',
                padding: '4px 10px',
                width: 'fit-content',
                fontWeight: '800',
                fontSize: '0.65rem',
                fontFamily: "'Inter Tight', sans-serif",
                letterSpacing: '1px',
                zIndex: 1,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                Password
              </div>
              <input className="form-input" type="password" placeholder="••••••••" value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })} required 
                style={{
                  width: '100%',
                  background: 'white',
                  border: '2px solid black',
                  boxShadow: '4px 4px 0px 0px black',
                  borderRadius: '12px',
                  color: 'black',
                  fontFamily: "'Inter Tight', sans-serif",
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  padding: '0.75rem 1.25rem',
                  outline: 'none',
                  marginTop: '12px'
                }}
              />
            </div>
            <button type="submit" className="btn btn-cyan btn-full" disabled={loading}
              style={{
                fontFamily: "'Inter Tight', sans-serif",
                fontWeight: '700',
                fontSize: '0.95rem',
                letterSpacing: '1px',
                padding: '0.85rem'
              }}
            >
              {loading ? 'Please wait...' : tab === 'login' ? 'LOGIN' : 'CREATE ACCOUNT'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh'
    }}>
      {!user?.isAdmin && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'url(/bg.png)',
          backgroundSize: '150%',
          backgroundPosition: 'center 30%',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
          opacity: 0.6,
          zIndex: -1
        }} />
      )}
      <nav className="navbar">
        <div className="brand" onClick={() => setPage('games')}>
          <span className="brand-name">GameVault</span>
          <span className="brand-tagline">Your Gaming Hub</span>
        </div>
        <div className="nav-links">
          {(user?.isAdmin ? adminNavItems : userNavItems).map(n => (
            <button key={n.id} className={`nav-btn ${page === n.id ? 'active' : ''}`} onClick={() => setPage(n.id)}>
              {n.icon && <n.icon size={18} style={{ marginRight: '0.5rem' }} />}
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
        {page === 'games' && <GameList user={user} setSelectedGame={(game) => { setSelectedGame(game); setPage('rent'); }} />}
        {page === 'rent' && <RentGame user={user} selectedGame={selectedGame} />}
        {page === 'review' && <ReviewGame user={user} />}
        {user?.isAdmin && page === 'admin' && <AdminDashboard />}
        {user?.isAdmin && page === 'admin-users' && <AdminUsers />}
        {user?.isAdmin && page === 'admin-games' && <AdminGames />}
        {user?.isAdmin && page === 'admin-rentals' && <AdminRentals />}
        {user?.isAdmin && page === 'admin-transactions' && <AdminTransactions />}
      </div>
      <div className="fixed-icon-bar">
        <div className="icon-card icon-purple">
          <Bell size={20} strokeWidth={2.5} />
        </div>
        <div className="icon-card icon-purple">
          <Phone size={20} strokeWidth={2.5} />
        </div>
        <div className="icon-card icon-green">
          <MessageCircle size={20} strokeWidth={2.5} />
        </div>
        <div className="icon-card icon-orange">
          <Cart size={20} strokeWidth={2.5} />
        </div>
      </div>
    </div>
  );
}

