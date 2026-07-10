import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coffee, X, Eye, EyeOff, Loader, User, Mail, Phone, Lock, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './AuthModal.css';

export default function AuthModal({ onClose, defaultTab = 'login' }) {
  const [tab, setTab] = useState(defaultTab);
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { login, register } = useAuth();

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [regForm, setRegForm] = useState({ name: '', email: '', password: '', phone: '' });

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(loginForm.email, loginForm.password);
      onClose('loggedin');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Login gagal');
    } finally { setLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (regForm.password.length < 6) { setError('Password minimal 6 karakter'); return; }
    setError(''); setLoading(true);
    try {
      await register(regForm.name, regForm.email, regForm.password, regForm.phone);
      onClose('loggedin');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Registrasi gagal');
    } finally { setLoading(false); }
  };

  return (
    <AnimatePresence>
      <div className="auth-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <motion.div
          className="auth-modal"
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 30 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          {/* Decorative coffee rings */}
          <div className="auth-deco">
            <div className="auth-ring r1" />
            <div className="auth-ring r2" />
            <div className="auth-ring r3" />
          </div>

          {/* Close */}
          <button className="auth-close" onClick={onClose}><X size={20} /></button>

          {/* Header */}
          <div className="auth-header">
            <motion.div className="auth-logo" whileHover={{ rotate: 10, scale: 1.1 }}>
              <Coffee size={36} />
            </motion.div>
            <h2>Café Azzura</h2>
            <p>{tab === 'login' ? 'Selamat datang kembali' : 'Bergabung sebagai member'}</p>
          </div>

          {/* Tabs */}
          <div className="auth-tabs">
            {['login', 'register'].map(t => (
              <button
                key={t}
                className={`auth-tab ${tab === t ? 'active' : ''}`}
                onClick={() => { setTab(t); setError(''); }}
              >
                {t === 'login' ? 'Masuk' : 'Daftar'}
              </button>
            ))}
          </div>

          {error && (
            <motion.div className="auth-error" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
              {error}
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {tab === 'login' ? (
              <motion.form
                key="login"
                className="auth-form"
                onSubmit={handleLogin}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="auth-field">
                  <Mail size={16} className="auth-field-icon" />
                  <input
                    type="text"
                    placeholder="Email atau No. HP"
                    value={loginForm.email}
                    onChange={e => setLoginForm(f => ({ ...f, email: e.target.value }))}
                    required
                  />
                </div>
                <div className="auth-field">
                  <Lock size={16} className="auth-field-icon" />
                  <input
                    type={showPw ? 'text' : 'password'}
                    placeholder="Password"
                    value={loginForm.password}
                    onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))}
                    required
                  />
                  <button type="button" className="auth-eye" onClick={() => setShowPw(v => !v)}>
                    {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                <motion.button
                  type="submit"
                  className="auth-submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? <Loader size={16} className="spin" /> : 'Masuk'}
                </motion.button>
                <p className="auth-switch">
                  Belum punya akun?{' '}
                  <button type="button" onClick={() => setTab('register')}>Daftar sekarang</button>
                </p>
              </motion.form>
            ) : (
              <motion.form
                key="register"
                className="auth-form"
                onSubmit={handleRegister}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="auth-field">
                  <User size={16} className="auth-field-icon" />
                  <input
                    type="text"
                    placeholder="Nama lengkap"
                    value={regForm.name}
                    onChange={e => setRegForm(f => ({ ...f, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="auth-field">
                  <Mail size={16} className="auth-field-icon" />
                  <input
                    type="email"
                    placeholder="Email atau No. HP"
                    value={regForm.email}
                    onChange={e => setRegForm(f => ({ ...f, email: e.target.value }))}
                    required
                  />
                </div>
                <div className="auth-field">
                  <Phone size={16} className="auth-field-icon" />
                  <input
                    type="tel"
                    placeholder="No. telepon (opsional)"
                    value={regForm.phone}
                    onChange={e => setRegForm(f => ({ ...f, phone: e.target.value }))}
                  />
                </div>
                <div className="auth-field">
                  <Lock size={16} className="auth-field-icon" />
                  <input
                    type={showPw ? 'text' : 'password'}
                    placeholder="Password (min. 6 karakter)"
                    value={regForm.password}
                    onChange={e => setRegForm(f => ({ ...f, password: e.target.value }))}
                    required
                    minLength={6}
                  />
                  <button type="button" className="auth-eye" onClick={() => setShowPw(v => !v)}>
                    {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                <div className="auth-benefits">
                  {['Booking prioritas', 'Riwayat pesanan', 'Penawaran eksklusif'].map(b => (
                    <span key={b}><CheckCircle size={12} /> {b}</span>
                  ))}
                </div>
                <motion.button
                  type="submit"
                  className="auth-submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? <Loader size={16} className="spin" /> : 'Daftar Gratis'}
                </motion.button>
                <p className="auth-switch">
                  Sudah punya akun?{' '}
                  <button type="button" onClick={() => setTab('login')}>Masuk</button>
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
