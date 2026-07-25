import React from 'react';
import { TrendingUp, Users, Package, ShoppingCart, Star, AlertCircle, BarChart3 } from 'lucide-react';

export default function AdminDashboard() {
  const formatCurrency = (amount) => {
    return `$${Math.round(parseFloat(amount)).toLocaleString()}`;
  };

  const formatNumber = (number) => {
    return Math.round(parseInt(number)).toLocaleString();
  };

  // Placeholder data
  const stats = {
    totalUsers: 15420,
    totalGames: 875,
    activeRentals: 342,
    totalRevenue: 125000,
    totalRentals: 2340,
    totalPurchases: 890,
    availableDigital: 450,
    availablePhysical: 425,
    overdueRentals: 12
  };

  return (
    <div className="catalog-container" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
      <div className="admin-dashboard-layout">
        {/* Left Sidebar - Revenue and Stats */}
        <div className="admin-left-sidebar">
          {/* Revenue Hero Card */}
          <div className="admin-revenue-hero">
            <div className="revenue-header">
              <div className="revenue-content">
                <div className="revenue-label">Total Revenue Generated</div>
                <div className="revenue-amount">{formatCurrency(stats.totalRevenue)}</div>
                <div className="revenue-trend">
                  <TrendingUp size={20} />
                  <span>+12.5% from last month</span>
                </div>
              </div>
              <div className="revenue-icon">
                <ShoppingCart size={48} />
              </div>
            </div>

            {/* Popular Genres */}
            <div className="admin-genre-card">
              <div className="admin-card-header">
                <div className="admin-card-title">Top Popular Genres</div>
                <Star size={16} className="text-yellow-500" />
              </div>
              <div className="admin-genre-content">
                <div className="genres-list">
                  <div className="genre-item">
                    <div className="genre-badge genre-action">Action</div>
                    <div className="genre-stats">
                      <div className="genre-stat">
                        <span className="genre-stat-value">45%</span>
                        <span className="genre-stat-label">rentals</span>
                      </div>
                      <div className="genre-stat">
                        <span className="genre-stat-value">2,340</span>
                        <span className="genre-stat-label">games</span>
                      </div>
                    </div>
                    <div className="genre-progress">
                      <div className="genre-progress-bar" style={{ width: '45%' }}></div>
                    </div>
                  </div>
                  <div className="genre-item">
                    <div className="genre-badge genre-rpg">RPG</div>
                    <div className="genre-stats">
                      <div className="genre-stat">
                        <span className="genre-stat-value">28%</span>
                        <span className="genre-stat-label">rentals</span>
                      </div>
                      <div className="genre-stat">
                        <span className="genre-stat-value">1,456</span>
                        <span className="genre-stat-label">games</span>
                      </div>
                    </div>
                    <div className="genre-progress">
                      <div className="genre-progress-bar" style={{ width: '28%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Grid inside Revenue Card */}
            <div className="admin-stats-grid">
              <div className="admin-stat-card">
                <div className="admin-stat-icon icon-purple">
                  <Users size={20} />
                </div>
                <div className="admin-stat-content">
                  <div className="admin-stat-value">{formatNumber(stats.totalUsers)}</div>
                  <div className="admin-stat-label">User Traffic</div>
                </div>
              </div>

              <div className="admin-stat-card">
                <div className="admin-stat-icon icon-green">
                  <Package size={20} />
                </div>
                <div className="admin-stat-content">
                  <div className="admin-stat-value">{formatNumber(stats.availablePhysical)}</div>
                  <div className="admin-stat-label">Physical Orders Dispatched</div>
                </div>
              </div>

              <div className="admin-stat-card">
                <div className="admin-stat-icon icon-orange">
                  <ShoppingCart size={20} />
                </div>
                <div className="admin-stat-content">
                  <div className="admin-stat-value">{formatNumber(stats.activeRentals)}</div>
                  <div className="admin-stat-label">Active Rentals</div>
                </div>
              </div>

              <div className="admin-stat-card">
                <div className="admin-stat-icon icon-cyan">
                  <BarChart3 size={20} />
                </div>
                <div className="admin-stat-content">
                  <div className="admin-stat-value">{formatNumber(stats.totalRentals)}</div>
                  <div className="admin-stat-label">Total Rentals</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Content - Reviews, Complaints */}
        <div className="admin-right-content">
          {/* Reviews */}
          <div className="admin-reviews-card">
            <div className="admin-card-header">
              <div className="admin-card-title">Recent Reviews</div>
              <div className="admin-card-badge">Latest</div>
            </div>
            <div className="admin-reviews-list">
              <div className="admin-review-item">
                <div className="review-avatar">JD</div>
                <div className="review-content">
                  <div className="review-header">
                    <span className="review-author">John Doe</span>
                    <div className="review-rating">
                      <Star size={12} fill="#fbbf24" color="#fbbf24" />
                      <Star size={12} fill="#fbbf24" color="#fbbf24" />
                      <Star size={12} fill="#fbbf24" color="#fbbf24" />
                      <Star size={12} fill="#fbbf24" color="#fbbf24" />
                      <Star size={12} fill="#fbbf24" color="#fbbf24" />
                    </div>
                  </div>
                  <div className="review-text">Amazing service! Got my game delivered within 24 hours.</div>
                </div>
              </div>
              <div className="admin-review-item">
                <div className="review-avatar">SM</div>
                <div className="review-content">
                  <div className="review-header">
                    <span className="review-author">Sarah Miller</span>
                    <div className="review-rating">
                      <Star size={12} fill="#fbbf24" color="#fbbf24" />
                      <Star size={12} fill="#fbbf24" color="#fbbf24" />
                      <Star size={12} fill="#fbbf24" color="#fbbf24" />
                      <Star size={12} fill="#fbbf24" color="#fbbf24" />
                      <Star size={12} color="#d1d5db" />
                    </div>
                  </div>
                  <div className="review-text">Great selection of games, will definitely rent again!</div>
                </div>
              </div>
            </div>
          </div>

          {/* Complaints */}
          <div className="admin-complaints-card">
            <div className="admin-card-header">
              <div className="admin-card-title">Complaints</div>
              <AlertCircle size={18} className="text-red-500" />
            </div>
            <div className="admin-complaints-list">
              <div className="admin-complaint-item">
                <div className="complaint-badge complaint-high">High</div>
                <div className="complaint-content">
                  <div className="complaint-title">Late delivery - Order #1234</div>
                  <div className="complaint-time">2 hours ago</div>
                </div>
              </div>
              <div className="admin-complaint-item">
                <div className="complaint-badge complaint-medium">Medium</div>
                <div className="complaint-content">
                  <div className="complaint-title">Damaged disc reported</div>
                  <div className="complaint-time">5 hours ago</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
