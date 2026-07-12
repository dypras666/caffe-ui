import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Star, ShoppingBag, Calendar, Key, LogOut,
  ChevronRight, Loader, Eye, EyeOff, Check, Wallet,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useFetch } from '../../hooks/useApi';
import api from '../../lib/api';
import MemberLayout from './MemberLayout';
import './member.css';

function formatRp(v) {
  return 'Rp ' + Number(v || 0).toLocaleString('id');
}

function formatDate(d) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
}

function avatarInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(' ').filter(Boolean);
  if (!parts.length || !parts[0]) return '?';
  if (parts.length === 1) return (parts[0]?.[0] || '?').toUpperCase();
  return ((parts[0]?.[0] || '') + (parts[parts.length - 1]?.[0] || '')).toUpperCase() || '?';
}

export default function MemberProfilePage() {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [showPwForm, setShowPwForm] = useState(false);

  const { data: profileData, loading, error, refetch } = useFetch('/members/profile');
  const profile = profileData?.member || profileData?.profile || user;

  useEffect(() => {
    refreshUser().catch(() => {});
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <MemberLayout>
      <div>
        {loading && (
          <div className="member-loading">
            <Loader size={28} className="spin" color="#6F4E37" />
          </div>
        )}

        {/* Member Card */}
        <div className="member-card-dark" style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <div className="member-avatar" style={{ flexShrink: 0 }}>
              {avatarInitials(profile?.name)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 17, fontWeight: 700, color: '#fff', marginBottom: 2 }}>
                {profile?.name || user?.name}
              </div>
              {profile?.member_number && (
                <div className="member-number">{profile.member_number}</div>
              )}
              {(profile?.is_priority || user?.is_priority) && (
                <span className="priority-badge">
                  <Star size={10} fill="currentColor" />
                  Priority Member
                </span>
              )}
            </div>
          </div>

          {/* QR Code */}
          {(profile?.member_number || user?.member_number) && (
            <div className="member-qr-wrap">
              <span className="member-qr-label">Scan untuk identifikasi</span>
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(profile?.member_number || user?.member_number)}`}
                alt="QR Code Member"
                loading="lazy"
              />
              <span className="member-qr-label">{profile?.member_number || user?.member_number}</span>
            </div>
          )}
        </div>

        {/* Balance Card */}
        <div className="member-balance-card">
          <div className="balance-card-row">
            <div>
              <div className="balance-label">Saldo</div>
              <div className="balance-amount">
                {formatRp(profile?.balance ?? user?.balance ?? 0)}
              </div>
            </div>
            <button
              className="btn-topup-inline"
              onClick={() => navigate('/member/topup')}
            >
              <Wallet size={13} style={{ marginRight: 4 }} />
              Top Up
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="member-stats-row">
          <div className="stat-item">
            <div className="stat-value">{profile?.total_orders ?? user?.total_orders ?? 0}</div>
            <div className="stat-label">Pesanan</div>
          </div>
          <div className="stat-item">
            <div className="stat-value" style={{ fontSize: 13 }}>
              {formatRp(profile?.total_spent ?? user?.total_spent ?? 0)}
            </div>
            <div className="stat-label">Total Belanja</div>
          </div>
          <div className="stat-item">
            <div className="stat-value" style={{ fontSize: 12 }}>
              {formatDate(profile?.member_since ?? profile?.created_at ?? user?.created_at)?.split(' ').slice(-1)[0]}
            </div>
            <div className="stat-label">Member Sejak</div>
          </div>
        </div>

        {/* Priority Progress */}
        {!(profile?.is_priority || user?.is_priority) && (profile?.min_orders || profile?.min_spent) && (
          <PriorityProgress profile={profile} />
        )}

        {/* Menu List */}
        <div className="member-menu-list">
          <Link to="/member/orders" className="member-menu-item">
            <div className="menu-item-left">
              <div className="menu-item-icon"><ShoppingBag size={16} /></div>
              Riwayat Pesanan
            </div>
            <ChevronRight size={16} color="#C4A882" />
          </Link>
          <Link to="/member/bookings" className="member-menu-item">
            <div className="menu-item-left">
              <div className="menu-item-icon"><Calendar size={16} /></div>
              Riwayat Booking
            </div>
            <ChevronRight size={16} color="#C4A882" />
          </Link>
          <button
            className="member-menu-item"
            style={{ width: '100%', textAlign: 'left' }}
            onClick={() => setShowPwForm(v => !v)}
          >
            <div className="menu-item-left">
              <div className="menu-item-icon"><Key size={16} /></div>
              Ganti Password
            </div>
            <ChevronRight size={16} color="#C4A882" />
          </button>
          <button
            className="member-menu-item danger"
            style={{ width: '100%', textAlign: 'left' }}
            onClick={handleLogout}
          >
            <div className="menu-item-left">
              <div className="menu-item-icon"><LogOut size={16} /></div>
              Keluar
            </div>
            <ChevronRight size={16} color="#E74C3C" />
          </button>
        </div>

        {/* Password Change Form */}
        {showPwForm && (
          <ChangePasswordForm onClose={() => setShowPwForm(false)} />
        )}
      </div>
    </MemberLayout>
  );
}

function PriorityProgress({ profile }) {
  const orders = profile?.total_orders || 0;
  const spent = profile?.total_spent || 0;
  const minOrders = profile?.min_orders || 10;
  const minSpent = profile?.min_spent || 500000;

  const orderPct = Math.min((orders / minOrders) * 100, 100);
  const spentPct = Math.min((spent / minSpent) * 100, 100);

  function formatRp(v) {
    return 'Rp ' + Number(v || 0).toLocaleString('id');
  }

  return (
    <div className="priority-progress">
      <div className="priority-progress-title">
        <Star size={14} color="#D4A574" />
        Menuju Priority Member
      </div>
      <div className="progress-item">
        <div className="progress-label-row">
          <span>Jumlah Pesanan</span>
          <span>{orders} / {minOrders}</span>
        </div>
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${orderPct}%`, transition: 'width 0.3s ease-out' }}
          />
        </div>
      </div>
      <div className="progress-item">
        <div className="progress-label-row">
          <span>Total Belanja</span>
          <span>{formatRp(spent)} / {formatRp(minSpent)}</span>
        </div>
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${spentPct}%`, transition: 'width 0.3s ease-out' }}
          />
        </div>
      </div>
    </div>
  );
}

function ChangePasswordForm({ onClose }) {
  const [form, setForm] = useState({ current: '', newPw: '', confirm: '' });
  const [show, setShow] = useState({ current: false, newPw: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));
  const toggleShow = (field) => setShow(s => ({ ...s, [field]: !s[field] }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPw !== form.confirm) {
      setError('Password baru tidak cocok');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await api.post('/members/change-password', {
        current_password: form.current,
        new_password: form.newPw,
      });
      setSuccess(true);
      setTimeout(onClose, 1500);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="password-change-card">
      <div className="section-title" style={{ marginBottom: 16 }}>
        Ganti Password
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9B8B7A', fontSize: 20, lineHeight: 1 }}>×</button>
      </div>

      {success ? (
        <div style={{ textAlign: 'center', padding: '12px 0', color: '#27AE60' }}>
          <Check size={32} />
          <p style={{ margin: '8px 0 0', fontSize: 14 }}>Password berhasil diubah</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {error && <div className="member-error">{error}</div>}
          {[
            { id: 'current', label: 'Password Saat Ini', placeholder: 'Password lama' },
            { id: 'newPw', label: 'Password Baru', placeholder: 'Min. 6 karakter' },
            { id: 'confirm', label: 'Konfirmasi Password Baru', placeholder: 'Ulangi password baru' },
          ].map(({ id, label, placeholder }) => (
            <div className="member-form-group" key={id}>
              <label>{label}</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="member-input"
                  type={show[id] ? 'text' : 'password'}
                  placeholder={placeholder}
                  value={form[id]}
                  onChange={set(id)}
                  required
                  minLength={id !== 'current' ? 6 : 1}
                  style={{ paddingRight: 40 }}
                />
                <button
                  type="button"
                  onClick={() => toggleShow(id)}
                  style={{
                    position: 'absolute', right: 12, top: '50%',
                    transform: 'translateY(-50%)', background: 'none',
                    border: 'none', cursor: 'pointer', color: '#C4A882', padding: 0,
                  }}
                >
                  {show[id] ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
          ))}
          <button type="submit" className="btn-cafe" disabled={loading}>
            {loading ? <><Loader size={15} className="spin" /> Menyimpan...</> : 'Simpan Password'}
          </button>
        </form>
      )}
    </div>
  );
}
