import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Coffee, Mail, Lock, Eye, EyeOff, Loader } from 'lucide-react';
import api from '../../lib/api';
import '../member/member.css';

export default function KasirLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('cafe_member_token', data.token);
      localStorage.setItem('cafe_member_user', JSON.stringify(data.user));
      if (data.user.role === 'admin' || data.user.role === 'kasir') {
        navigate('/kasir/dashboard');
      } else {
        navigate('/member/profile');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Login gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="member-login-page">
      <div className="member-login-hero">
        <Coffee size={48} color="#D4A574" style={{ marginBottom: 12 }} />
        <h1>Café Azzura</h1>
        <p>Kasir — kelola pesanan dan pembayaran</p>
      </div>

      <div className="member-login-body">
        <form onSubmit={handleSubmit}>
          {error && <div className="member-error">{error}</div>}

          <div className="member-form-group">
            <label>Email</label>
            <div className="form-input-icon">
              <Mail size={16} />
              <input
                className="member-input"
                type="text"
                placeholder="email@contoh.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="username"
                required
              />
            </div>
          </div>

          <div className="member-form-group">
            <label>Password</label>
            <div className="form-input-icon" style={{ position: 'relative' }}>
              <Lock size={16} />
              <input
                className="member-input"
                type={showPw ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                style={{ paddingRight: 40 }}
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                style={{
                  position: 'absolute', right: 12, top: '50%',
                  transform: 'translateY(-50%)', background: 'none',
                  border: 'none', cursor: 'pointer', color: '#C4A882', padding: 0,
                }}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-cafe" disabled={loading}>
            {loading ? <><Loader size={16} className="spin" /> Memproses...</> : 'Masuk sebagai Kasir'}
          </button>
        </form>
      </div>
    </div>
  );
}
