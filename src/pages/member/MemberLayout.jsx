import { Link, useLocation } from 'react-router-dom';
import { Coffee, Bell, Home, User, ShoppingBag, Calendar, Wallet } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './member.css';

const NAV_TABS = [
  { to: '/',                label: 'Beranda',  Icon: Home },
  { to: '/member/profile',  label: 'Akun',     Icon: User },
  { to: '/member/orders',   label: 'Pesanan',  Icon: ShoppingBag },
  { to: '/member/bookings', label: 'Booking',  Icon: Calendar },
  { to: '/member/topup',    label: 'Top-up',   Icon: Wallet },
];

export default function MemberLayout({ children }) {
  const { user } = useAuth();
  const location = useLocation();

  return (
    <div className="member-page">
      {/* Header */}
      <header className="member-header">
        <div className="member-header-logo">
          <Coffee size={20} />
          Café Azzura
        </div>
        <div className="member-header-right">
          {user && (
            <span className="member-header-name">{user.name}</span>
          )}
          <button className="member-notif-btn" aria-label="Notifikasi">
            <Bell size={18} />
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="member-content">
        {children}
      </main>

      {/* Bottom navigation */}
      <nav className="member-bottom-nav">
        {NAV_TABS.map(({ to, label, Icon }) => {
          const isActive = to === '/'
            ? false
            : location.pathname === to || location.pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={`member-nav-tab ${isActive ? 'active' : ''}`}
            >
              <Icon size={20} />
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
