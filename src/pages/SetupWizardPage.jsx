import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Coffee, Store, UserPlus, Users, Settings, Check, ChevronRight,
  ChevronLeft, Mail, Lock, Eye, EyeOff, Loader, Phone, MapPin,
  Building, ToggleLeft, Globe, ChefHat, Gift, Clock, CreditCard,
} from 'lucide-react';
import api from '../lib/api';
import './member/member.css';

const STEPS = [
  { id: 'cafe', label: 'Cafe', icon: Coffee },
  { id: 'branches', label: 'Cabang', icon: Building },
  { id: 'admin', label: 'Admin', icon: UserPlus },
  { id: 'kasir', label: 'Kasir', icon: Users },
  { id: 'features', label: 'Fitur', icon: ToggleLeft },
  { id: 'done', label: 'Selesai', icon: Check },
];

const FEATURES = [
  { key: 'enable_booking', label: 'Booking Meja', desc: 'Izinkan reservasi meja online', icon: Clock },
  { key: 'enable_takeaway', label: 'Takeaway', desc: 'Izinkan pesanan bungkus', icon: ChefHat },
  { key: 'enable_delivery', label: 'Delivery', desc: 'Izinkan pesanan antar', icon: Globe },
  { key: 'multi_branch', label: 'Multi Cabang', desc: 'Aktifkan manajemen banyak cabang', icon: Building },
  { key: 'shift_enabled', label: 'Shift Kasir', desc: 'Manajemen shift buka/tutup kas', icon: Clock },
  { key: 'topup_enabled', label: 'Top-up Member', desc: 'Izinkan member isi saldo', icon: CreditCard },
  { key: 'member_registration', label: 'Registrasi Member', desc: 'Buka pendaftaran member umum', icon: Users },
  { key: 'points_enabled', label: 'Points Reward', desc: 'Sistem poin untuk member', icon: Gift },
  { key: 'hr_enabled', label: 'HR & Payroll', desc: 'Manajemen karyawan dan penggajian', icon: Users },
];

export default function SetupWizardPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState('');

  // Step 1: Cafe info
  const [cafe, setCafe] = useState({ name: '', tagline: '' });

  // Step 2: Branches
  const [branches, setBranches] = useState([{ name: '', code: '', address: '', phone: '', city: '' }]);

  // Step 3: Admin
  const [admin, setAdmin] = useState({ name: 'Admin', email: '', password: '' });
  const [showPw, setShowPw] = useState(false);

  // Step 4: Kasirs
  const [kasirs, setKasirs] = useState([{ name: '', email: '', password: '', branch_id: '' }]);

  // Step 5: Features
  const [features, setFeatures] = useState({
    enable_booking: true,
    enable_takeaway: true,
    enable_delivery: false,
    multi_branch: false,
    shift_enabled: true,
    topup_enabled: true,
    member_registration: true,
    points_enabled: false,
    hr_enabled: false,
  });

  useEffect(() => {
    const check = async () => {
      try {
        const { data } = await api.get('/setup/status');
        if (data.setup_completed) {
          navigate('/', { replace: true });
          return;
        }
      } catch (err) {
        // If 404, setup route not registered yet — just proceed
      }
      setChecking(false);
    };
    check();
  }, [navigate]);

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const payload = {
        cafe_name: cafe.name || 'Cafe Saya',
        tagline: cafe.tagline,
        admin: {
          name: admin.name || 'Admin',
          email: admin.email,
          password: admin.password,
        },
        branches: branches.filter(b => b.name.trim()),
        kasirs: kasirs.filter(k => k.email.trim()).map(k => ({
          name: k.name,
          email: k.email,
          password: k.password,
          branch_id: k.branch_id ? Number(k.branch_id) : undefined,
        })),
        features,
      };
      await api.post('/setup/initialize', payload);
      setStep(5);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Gagal menyimpan setup');
    } finally {
      setLoading(false);
    }
  };

  const updateBranch = (i, field, value) => {
    setBranches(prev => prev.map((b, idx) => idx === i ? { ...b, [field]: value } : b));
  };

  const addBranch = () => {
    setBranches(prev => [...prev, { name: '', code: '', address: '', phone: '', city: '' }]);
  };

  const removeBranch = (i) => {
    setBranches(prev => prev.filter((_, idx) => idx !== i));
  };

  const updateKasir = (i, field, value) => {
    setKasirs(prev => prev.map((k, idx) => idx === i ? { ...k, [field]: value } : k));
  };

  const addKasir = () => {
    setKasirs(prev => [...prev, { name: '', email: '', password: '', branch_id: '' }]);
  };

  const removeKasir = (i) => {
    setKasirs(prev => prev.filter((_, idx) => idx !== i));
  };

  const toggleFeature = (key) => {
    setFeatures(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const canNext = () => {
    switch (step) {
      case 0: return cafe.name.trim().length > 0;
      case 1: return branches.some(b => b.name.trim());
      case 2: return admin.email.includes('@') && admin.password.length >= 6;
      case 3: return true; // optional
      case 4: return true;
      default: return true;
    }
  };

  if (checking) {
    return (
      <div className="member-loading" style={{ minHeight: '100vh', background: '#FFF8E7' }}>
        <Loader size={32} className="spin" />
      </div>
    );
  }

  return (
    <div className="member-login-page" style={{ maxWidth: 600 }}>
      <div className="member-login-hero" style={{ padding: '32px 24px 24px' }}>
        <Coffee size={40} color="#D4A574" style={{ marginBottom: 8 }} />
        <h1 style={{ fontSize: 24, margin: '0 0 4px' }}>Setup Wizard</h1>
        <p style={{ fontSize: 13, opacity: 0.7, margin: 0 }}>
          {STEPS[step].label} — Langkah {step + 1} dari {STEPS.length - 1}
        </p>
      </div>

      {/* Progress bar */}
      <div style={{ display: 'flex', gap: 4, padding: '12px 16px', background: '#fff' }}>
        {STEPS.slice(0, -1).map((s, idx) => (
          <div key={s.id} style={{
            flex: 1, height: 4, borderRadius: 4,
            background: idx <= step ? '#6F4E37' : '#F5E6D3',
            transition: 'background 0.3s',
          }} />
        ))}
      </div>

      <div className="member-login-body">
        {error && <div className="member-error">{error}</div>}

        {/* Step 0: Cafe Info */}
        {step === 0 && (
          <div>
            <h2 className="section-title"><Coffee size={18} /> Nama Cafe</h2>
            <div className="member-form-group">
              <label>Nama Cafe *</label>
              <input
                className="member-input"
                placeholder="Contoh: Kopi Senja"
                value={cafe.name}
                onChange={e => setCafe(f => ({ ...f, name: e.target.value }))}
                autoFocus
              />
            </div>
            <div className="member-form-group">
              <label>Tagline (opsional)</label>
              <input
                className="member-input"
                placeholder="Contoh: Setiap Tegukan Bercerita"
                value={cafe.tagline}
                onChange={e => setCafe(f => ({ ...f, tagline: e.target.value }))}
              />
            </div>
          </div>
        )}

        {/* Step 1: Branches */}
        {step === 1 && (
          <div>
            <h2 className="section-title"><Building size={18} /> Cabang</h2>
            {branches.map((b, i) => (
              <div key={i} className="member-card" style={{ padding: 16, marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontWeight: 600, fontSize: 13, color: '#6F4E37' }}>Cabang #{i + 1}</span>
                  {branches.length > 1 && (
                    <button className="icon-btn" onClick={() => removeBranch(i)} style={{ color: '#E74C3C' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  )}
                </div>
                <div className="member-form-group" style={{ marginBottom: 8 }}>
                  <input className="member-input" placeholder="Nama cabang *" value={b.name}
                    onChange={e => updateBranch(i, 'name', e.target.value)} />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <div className="member-form-group" style={{ flex: 1, marginBottom: 8 }}>
                    <input className="member-input" placeholder="Kode (MAIN)" value={b.code}
                      onChange={e => updateBranch(i, 'code', e.target.value)} />
                  </div>
                  <div className="member-form-group" style={{ flex: 1, marginBottom: 8 }}>
                    <input className="member-input" placeholder="Kota" value={b.city}
                      onChange={e => updateBranch(i, 'city', e.target.value)} />
                  </div>
                </div>
                <div className="member-form-group" style={{ marginBottom: 0 }}>
                  <input className="member-input" placeholder="Alamat" value={b.address}
                    onChange={e => updateBranch(i, 'address', e.target.value)} />
                </div>
              </div>
            ))}
            <button className="btn-cafe-outline" style={{ width: '100%', justifyContent: 'center', marginBottom: 8 }}
              onClick={addBranch}>
              + Tambah Cabang
            </button>
          </div>
        )}

        {/* Step 2: Admin */}
        {step === 2 && (
          <div>
            <h2 className="section-title"><UserPlus size={18} /> Akun Admin</h2>
            <div className="member-form-group">
              <label>Nama</label>
              <input className="member-input" placeholder="Admin" value={admin.name}
                onChange={e => setAdmin(a => ({ ...a, name: e.target.value }))} />
            </div>
            <div className="member-form-group">
              <label>Email *</label>
              <input className="member-input" type="email" placeholder="admin@cafe.com"
                value={admin.email} onChange={e => setAdmin(a => ({ ...a, email: e.target.value }))} />
            </div>
            <div className="member-form-group">
              <label>Password * (min 6 karakter)</label>
              <div style={{ position: 'relative' }}>
                <input className="member-input" type={showPw ? 'text' : 'password'}
                  placeholder="••••••••" value={admin.password}
                  onChange={e => setAdmin(a => ({ ...a, password: e.target.value }))}
                  style={{ paddingRight: 40 }} minLength={6} />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: '#C4A882' }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Kasir */}
        {step === 3 && (
          <div>
            <h2 className="section-title"><Users size={18} /> Akun Kasir</h2>
            {kasirs.map((k, i) => (
              <div key={i} className="member-card" style={{ padding: 16, marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontWeight: 600, fontSize: 13, color: '#6F4E37' }}>Kasir #{i + 1}</span>
                  {kasirs.length > 1 && (
                    <button className="icon-btn" onClick={() => removeKasir(i)} style={{ color: '#E74C3C' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  )}
                </div>
                <div className="member-form-group" style={{ marginBottom: 8 }}>
                  <input className="member-input" placeholder="Nama kasir *" value={k.name}
                    onChange={e => updateKasir(i, 'name', e.target.value)} />
                </div>
                <div className="member-form-group" style={{ marginBottom: 8 }}>
                  <input className="member-input" type="email" placeholder="Email *" value={k.email}
                    onChange={e => updateKasir(i, 'email', e.target.value)} />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <div className="member-form-group" style={{ flex: 1, marginBottom: 8 }}>
                    <input className="member-input" type="password" placeholder="Password *" value={k.password}
                      onChange={e => updateKasir(i, 'password', e.target.value)} />
                  </div>
                  {branches.filter(b => b.name.trim()).length > 0 && (
                    <div className="member-form-group" style={{ flex: 1, marginBottom: 8 }}>
                      <select className="member-select" value={k.branch_id}
                        onChange={e => updateKasir(i, 'branch_id', e.target.value)}>
                        <option value="">Pilih cabang</option>
                        {branches.filter(b => b.name.trim()).map((b, idx) => (
                          <option key={idx} value={idx + 1}>{b.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <button className="btn-cafe-outline" style={{ width: '100%', justifyContent: 'center', marginBottom: 8 }}
              onClick={addKasir}>
              + Tambah Kasir
            </button>
          </div>
        )}

        {/* Step 4: Features */}
        {step === 4 && (
          <div>
            <h2 className="section-title"><ToggleLeft size={18} /> Atur Fitur</h2>
            <p style={{ fontSize: 13, color: '#9B8B7A', marginBottom: 16 }}>
              Aktifkan atau nonaktifkan fitur yang tersedia
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {FEATURES.map(f => (
                <div key={f.key} className="list-card" style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', cursor: 'pointer',
                  border: `1.5px solid ${features[f.key] ? '#6F4E37' : '#F5E6D3'}`,
                  background: features[f.key] ? '#FFF8E7' : '#fff',
                }} onClick={() => toggleFeature(f.key)}>
                  <f.icon size={20} color={features[f.key] ? '#6F4E37' : '#C4A882'} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{f.label}</div>
                    <div style={{ fontSize: 11, color: '#9B8B7A' }}>{f.desc}</div>
                  </div>
                  <div style={{
                    width: 42, height: 24, borderRadius: 12, position: 'relative',
                    background: features[f.key] ? '#6F4E37' : '#E0D5C8',
                    transition: 'background 0.2s',
                  }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: '50%', background: '#fff',
                      position: 'absolute', top: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                      left: features[f.key] ? 20 : 2, transition: 'left 0.2s',
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 5: Done */}
        {step === 5 && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'linear-gradient(135deg, #27AE60, #1E8449)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <Check size={36} color="#fff" />
            </div>
            <h2 style={{ margin: '0 0 8px', fontSize: 20 }}>Setup Selesai! 🎉</h2>
            <p style={{ color: '#9B8B7A', fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
              Cafe <strong>{cafe.name}</strong> berhasil dikonfigurasi.
              Silakan login menggunakan akun admin yang sudah dibuat.
            </p>
            <button className="btn-cafe" onClick={() => {
              localStorage.clear();
              navigate('/kasir/login');
            }}>
              Login sebagai Admin
            </button>
          </div>
        )}

        {/* Navigation */}
        {step < 5 && (
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            {step > 0 ? (
              <button className="btn-cafe-outline" style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => setStep(s => s - 1)}>
                <ChevronLeft size={16} /> Kembali
              </button>
            ) : <div style={{ flex: 1 }} />}
            <button className="btn-cafe" style={{ flex: 2 }}
              onClick={() => step === 4 ? handleSubmit() : setStep(s => s + 1)}
              disabled={(step === 4 ? loading : false) || !canNext()}>
              {step === 4 ? (
                loading ? <><Loader size={16} className="spin" /> Menyimpan...</> : 'Simpan & Selesai'
              ) : 'Lanjut'} {step < 4 && <ChevronRight size={16} />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
