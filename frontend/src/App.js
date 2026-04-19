import React, { useState } from 'react';
import GameList from './components/GameList';
import RentGame from './components/RentGame';
import PurchaseGame from './components/PurchaseGame';
import ReviewGame from './components/ReviewGame';
import './App.css';

const API = 'http://localhost:5000/api';

export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState('games');
  const [tab, setTab] = useState('login');
  const [form, setForm] = useState({ fullName: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
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
        setUser(data.user || data);
        setPage('games');
      } else {
        setTab('login');
        setError('✓ Account created — please login');
      }
    } catch (err) { setError(err.message); }
    setLoading(false);
  };

  const navItems = [
    { id: 'games', label: 'Catalog', icon: '◈' },
    { id: 'rent', label: 'Rent', icon: '⟳' },
    { id: 'purchase', label: 'Purchase', icon: '◉' },
    { id: 'review', label: 'Reviews', icon: '★' },
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
      <nav className="navbar">
        <div className="brand" onClick={() => setPage('games')}>
          <div className="brand-logo">🎮</div>
          <span className="brand-name">GAMEVAULT</span>
        </div>
        <div className="nav-links">
          {navItems.map(n => (
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
          <button className="btn-logout" onClick={() => { setUser(null); setPage('games'); }}>Logout</button>
        </div>
      </nav>
      <div className="main">
        {page === 'games' && <GameList user={user} />}
        {page === 'rent' && <RentGame user={user} />}
        {page === 'purchase' && <PurchaseGame user={user} />}
        {page === 'review' && <ReviewGame user={user} />}
      </div>
    </>
  );
}
