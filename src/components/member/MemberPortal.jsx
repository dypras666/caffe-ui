import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, User, ClipboardList, ShoppingBag, LogOut, Coffee,
  Calendar, Clock, Users, Star, Wallet, Phone, Mail,
  CheckCircle, XCircle, Clock3, ChevronRight, RefreshCw,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useFetch } from '../../hooks/useApi';
import api from '../../lib/api';
import './MemberPortal.css';

const BOOKING_STATUS = {
  pending:   { label: 'Menunggu', icon: Clock3,      color: '#E8A631' },
  confirmed: { label: 'Dikonfirmasi', icon: CheckCircle, color: '#27AE60' },
  cancelled: { label: 'Dibatalkan', icon: XCircle,    color: '#E74C3C' },
  completed: { label: 'Selesai',  icon: CheckCircle,  color: '#7F8C8D' },
};

const ORDER_STATUS = {
  pending:   { label: 'Pending',   color: '#E8A631' },
  preparing: { label: 'Diproses',  color: '#2980B9' },
  ready:     { label: 'Siap',      color: '#27AE60' },
  completed: { label: 'Selesai',   color: '#7F8C8D' },
  cancelled: { label: 'Dibatalkan', color: '#E74C3C' },
};

function formatRp(v) { return 'Rp ' + Number(v || 0).toLocaleString('id'); }
function formatDate(d) { return new Date(d).toLocaleDateString('id-ID', { dateStyle: 'medium' }); }
function formatDateTime(d) { return new Date(d).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }); }

export default function MemberPortal({ onClose }) {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('booking');

  const handleLogout = () => { logout(); onClose(); };

  return (
    <AnimatePresence>
      <div className="portal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <motion.div
          className="portal-sheet"
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', stiffness: 280, damping: 30 }}
        >
          {/* Header */}
          <div className="portal-header">
            <div className="portal-user">
              <div className="portal-avatar">
                <Coffee size={22} />
              </div>
              <div>
                <p className="portal-name">{user?.name}</p>
                <p className="portal-email">{user?.email}</p>
              </div>
            </div>
            <div className="portal-header-actions">
              {user?.balance !== undefined && (
                <div className="portal-balance">
                  <Wallet size={14} />
                  <span>{formatRp(user.balance)}</span>
                </div>
              )}
              <button className="portal-close" onClick={onClose}><X size={20} /></button>
            </div>
          </div>

          {/* Tabs */}
          <div className="portal-tabs">
            {[
              { key: 'booking', label: 'Booking', icon: ClipboardList },
              { key: 'orders', label: 'Pesanan', icon: ShoppingBag },
              { key: 'profile', label: 'Profil', icon: User },
            ].map(tab => (
              <button
                key={tab.key}
                className={`portal-tab ${activeTab === tab.key ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.key)}
              >
                <tab.icon size={15} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="portal-content">
            <AnimatePresence mode="wait">
              {activeTab === 'booking' && <BookingTab key="booking" />}
              {activeTab === 'orders' && <OrdersTab key="orders" />}
              {activeTab === 'profile' && <ProfileTab key="profile" onLogout={handleLogout} />}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// ─── Booking Tab ──────────────────────────────────────────────
function BookingTab() {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const { data, loading, refetch } = useFetch(`/bookings?email=${encodeURIComponent(user?.email || '')}`);
  const bookings = data?.bookings || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="tab-body"
    >
      <div className="tab-topbar">
        <h3>Booking Saya</h3>
        <button className="btn-cafe-sm" onClick={() => setShowForm(v => !v)}>
          {showForm ? 'Tutup' : '+ Booking Baru'}
        </button>
      </div>

      <AnimatePresence>
        {showForm && <BookingForm onDone={() => { setShowForm(false); refetch(); }} />}
      </AnimatePresence>

      {loading ? (
        <div className="tab-loading"><Coffee className="spin-slow" size={28} /></div>
      ) : bookings.length === 0 ? (
        <div className="tab-empty">
          <Calendar size={40} />
          <p>Belum ada booking</p>
          <button className="btn-cafe-sm" onClick={() => setShowForm(true)}>Buat Booking</button>
        </div>
      ) : (
        <div className="booking-list">
          {bookings.map(b => {
            const st = BOOKING_STATUS[b.status] || BOOKING_STATUS.pending;
            const StatusIcon = st.icon;
            return (
              <div key={b.id} className="booking-card">
                <div className="booking-card-top">
                  <div>
                    <p className="booking-number">{b.booking_number || `#${b.id}`}</p>
                    <div className="booking-date-row">
                      <Calendar size={13} />
                      <span>{formatDate(b.booking_date)}</span>
                      <Clock size={13} />
                      <span>{b.booking_time?.slice(0, 5)}</span>
                      <Users size={13} />
                      <span>{b.guests} orang</span>
                    </div>
                  </div>
                  <span className="booking-status" style={{ color: st.color, background: st.color + '18' }}>
                    <StatusIcon size={12} /> {st.label}
                  </span>
                </div>
                {b.special_request && (
                  <p className="booking-note">"{b.special_request}"</p>
                )}
                {b.dp_amount > 0 && (
                  <div className="booking-dp">
                    <span>DP: {formatRp(b.dp_amount)}</span>
                    <span className={b.dp_paid ? 'dp-paid' : 'dp-unpaid'}>
                      {b.dp_paid ? 'Lunas' : 'Belum Bayar'}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

function BookingForm({ onDone }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    booking_date: '',
    booking_time: '12:00',
    guests: '2',
    special_request: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await api.post('/bookings', {
        ...form,
        guests: parseInt(form.guests),
        booking_time: form.booking_time + ':00',
      });
      onDone();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally { setLoading(false); }
  };

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);

  return (
    <motion.form
      className="booking-form-inline"
      onSubmit={handleSubmit}
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
    >
      {error && <div className="form-error-inline">{error}</div>}
      <div className="form-row-inline">
        <div className="form-field-inline">
          <label>Tanggal</label>
          <input type="date" value={form.booking_date} min={minDate.toISOString().slice(0, 10)}
            onChange={e => setForm(f => ({ ...f, booking_date: e.target.value }))} required />
        </div>
        <div className="form-field-inline">
          <label>Waktu</label>
          <input type="time" value={form.booking_time}
            onChange={e => setForm(f => ({ ...f, booking_time: e.target.value }))} required />
        </div>
        <div className="form-field-inline">
          <label>Tamu</label>
          <select value={form.guests} onChange={e => setForm(f => ({ ...f, guests: e.target.value }))}>
            {[1,2,3,4,5,6,7,8,10,12,15,20].map(n => (
              <option key={n} value={n}>{n} orang</option>
            ))}
          </select>
        </div>
      </div>
      <textarea
        placeholder="Permintaan khusus (opsional)"
        value={form.special_request}
        onChange={e => setForm(f => ({ ...f, special_request: e.target.value }))}
        rows={2}
      />
      <button type="submit" className="btn-cafe-submit" disabled={loading}>
        {loading ? 'Menyimpan...' : 'Konfirmasi Booking'}
      </button>
    </motion.form>
  );
}

// ─── Orders Tab ───────────────────────────────────────────────
function OrdersTab() {
  const { user } = useAuth();
  // Members can only see their own orders if they're logged in as member
  const { data, loading, refetch } = useFetch('/orders?limit=20&page=1');
  const orders = data?.orders || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="tab-body"
    >
      <div className="tab-topbar">
        <h3>Riwayat Pesanan</h3>
        <button className="icon-btn" onClick={refetch} title="Refresh">
          <RefreshCw size={15} />
        </button>
      </div>

      {loading ? (
        <div className="tab-loading"><Coffee className="spin-slow" size={28} /></div>
      ) : orders.length === 0 ? (
        <div className="tab-empty">
          <ShoppingBag size={40} />
          <p>Belum ada pesanan</p>
        </div>
      ) : (
        <div className="order-list">
          {orders.map(order => {
            const st = ORDER_STATUS[order.order_status] || ORDER_STATUS.pending;
            return (
              <div key={order.id} className="order-card">
                <div className="order-card-top">
                  <div>
                    <p className="order-number">{order.order_number}</p>
                    <p className="order-date">{formatDateTime(order.created_at)}</p>
                  </div>
                  <div className="order-right">
                    <p className="order-total">{formatRp(order.total)}</p>
                    <span className="order-status" style={{ color: st.color, background: st.color + '18' }}>
                      {st.label}
                    </span>
                  </div>
                </div>
                <div className="order-meta">
                  <span className="order-type">{order.order_type}</span>
                  {order.table_number && <span>Meja {order.table_number}</span>}
                  <span className={`pay-status ${order.payment_status === 'paid' ? 'paid' : 'unpaid'}`}>
                    {order.payment_status === 'paid' ? 'Lunas' : 'Belum Bayar'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

// ─── Profile Tab ──────────────────────────────────────────────
function ProfileTab({ onLogout }) {
  const { user } = useAuth();
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="tab-body"
    >
      <div className="profile-card">
        <div className="profile-avatar-lg">
          <Coffee size={32} />
        </div>
        <h3>{user?.name}</h3>
        {user?.is_priority && (
          <span className="priority-badge"><Star size={11} fill="currentColor" /> Priority Member</span>
        )}

        <div className="profile-info">
          <div className="profile-row"><Mail size={14} /><span>{user?.email}</span></div>
          {user?.phone && <div className="profile-row"><Phone size={14} /><span>{user.phone}</span></div>}
          {user?.balance !== undefined && (
            <div className="profile-row balance-row">
              <Wallet size={14} />
              <span>Saldo</span>
              <strong>{formatRp(user.balance)}</strong>
            </div>
          )}
        </div>

        <div className="profile-role">
          <span>Role: <strong>{user?.role}</strong></span>
        </div>
      </div>

      <button className="btn-logout" onClick={onLogout}>
        <LogOut size={15} />
        Keluar
      </button>
    </motion.div>
  );
}
