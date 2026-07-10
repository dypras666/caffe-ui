import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Coffee, Mail, Lock, User, Phone, ArrowLeft, Eye, EyeOff, Loader } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './member.css';

export default function MemberLoginPage() {
  const [tab, setTab] = useState('login'); // 'login' | 'register'
  const navigate = useNavigate();
  const { login, register } = useAuth();

  return (
    <div className="member-login-page">
      {/* Hero */}
      <div className="member-login-hero">
        <Coffee size={48} color="#D4A574" style={{ marginBottom: 12 }} />
        <h1>Café Azzura</h1>
        <p>Member Portal — nikmati lebih banyak keuntungan</p>
      </div>

      {/* Body */}
      <div className="member-login-body">
        {/* Tabs */}
        <div className="member-login-tabs">
          <button
            className={`member-login-tab ${tab === 'login' ? 'active' : ''}`}
            onClick={() => setTab('login')}
          >
            Masuk
          </button>
          <button
            className={`member-login-tab ${tab === 'register' ? 'active' : ''}`}
            onClick={() => setTab('register')}
          >
            Daftar
          </button>
        </div>

        {/* Forms */}
        {tab === 'login' ? (
          <LoginForm
            onSuccess={(role) => {
              if (role === 'admin' || role === 'kasir') navigate('/kasir/dashboard');
              else navigate('/member/profile');
            }}
            login={login}
          />
        ) : (
          <RegisterForm onSuccess={() => navigate('/member/profile')} register={register} />
        )}

        <Link to="/" className="member-back-link">
          <ArrowLeft size={14} />
          Kembali ke beranda
        </Link>
      </div>
    </div>
  );
}

function LoginForm({ onSuccess, login }) {
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
      const data = await login(email, password);
      onSuccess(data.role);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Login gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="member-error">{error}</div>}

      <div className="member-form-group">
        <label>Email / No. HP</label>
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

      <button
        type="submit"
        className="btn-cafe"
        disabled={loading}
        style={{ marginTop: 8 }}
      >
        {loading ? <><Loader size={16} className="spin" /> Memproses...</> : 'Masuk'}
      </button>
    </form>
  );
}

function RegisterForm({ onSuccess, register }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.phone);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Registrasi gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="member-error">{error}</div>}

      <div className="member-form-group">
        <label>Nama Lengkap</label>
        <div className="form-input-icon">
          <User size={16} />
          <input
            className="member-input"
            type="text"
            placeholder="Nama kamu"
            value={form.name}
            onChange={set('name')}
            required
          />
        </div>
      </div>

      <div className="member-form-group">
        <label>Email</label>
        <div className="form-input-icon">
          <Mail size={16} />
          <input
            className="member-input"
            type="email"
            placeholder="email@contoh.com"
            value={form.email}
            onChange={set('email')}
            autoComplete="email"
            required
          />
        </div>
      </div>

      <div className="member-form-group">
        <label>No. HP</label>
        <div className="form-input-icon">
          <Phone size={16} />
          <input
            className="member-input"
            type="tel"
            placeholder="08xxxxxxxxxx"
            value={form.phone}
            onChange={set('phone')}
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
            placeholder="Min. 6 karakter"
            value={form.password}
            onChange={set('password')}
            autoComplete="new-password"
            minLength={6}
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

      <button
        type="submit"
        className="btn-cafe"
        disabled={loading}
        style={{ marginTop: 8 }}
      >
        {loading ? <><Loader size={16} className="spin" /> Mendaftar...</> : 'Daftar Sekarang'}
      </button>
    </form>
  );
}
