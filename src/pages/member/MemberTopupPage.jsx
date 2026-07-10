import { useState, useEffect } from 'react';
// Motion disabled for better UX
import { Wallet, RefreshCw, Loader, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useFetch } from '../../hooks/useApi';
import api from '../../lib/api';
import MemberLayout from './MemberLayout';
import './member.css';

const PRESETS = [20000, 50000, 100000, 200000];

function formatRp(v) {
  return 'Rp ' + Number(v || 0).toLocaleString('id');
}

function formatDateTime(d) {
  if (!d) return '-';
  return new Date(d).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' });
}

const STATUS_META = {
  pending:  { label: 'Menunggu', cls: 'status-pending' },
  approved: { label: 'Disetujui', cls: 'status-approved' },
  rejected: { label: 'Ditolak', cls: 'status-rejected' },
};

export default function MemberTopupPage() {
  const { user } = useAuth();

  // Fetch settings + payment methods from API
  const { data: settingsData } = useFetch('/settings');
  const { data: payMethodsData } = useFetch('/payments/methods');

  const settings = (settingsData?.settings || []).reduce((acc, s) => {
    acc[s.setting_key] = s.setting_value;
    return acc;
  }, {});

  // Parse allowed topup codes from settings
  let allowedCodes = [];
  try {
    const raw = settings.topup_payment_methods;
    if (raw) {
      // Handle both JSON array and plain string
      const parsed = JSON.parse(raw.replace(/'/g, '"'));
      allowedCodes = Array.isArray(parsed) ? parsed : [parsed];
    }
  } catch { allowedCodes = ['transfer', 'qris', 'cash']; }

  // Filter payment methods by allowed codes — use real method objects with name+icon
  const allMethods = payMethodsData?.methods || [];
  const paymentMethods = allMethods.length > 0
    ? (allowedCodes.length > 0
        ? allMethods.filter(m => allowedCodes.includes(m.code))
        : allMethods.filter(m => m.code !== 'balance')) // exclude balance from topup
    : allowedCodes.map(code => ({ code, name: code, icon: null, type: 'transfer' }));

  const { data: historyData, loading: histLoading, refetch: refetchHistory } = useFetch('/members/topup-requests');
  const history = historyData?.requests || historyData?.topup_requests || [];

  const [selectedPreset, setSelectedPreset] = useState(null);
  const [customAmount, setCustomAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [reference, setReference] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Auto-select first payment method when methods load
  useEffect(() => {
    if (paymentMethods.length > 0 && !paymentMethod) {
      setPaymentMethod(paymentMethods[0].code || paymentMethods[0]);
    }
  }, [paymentMethods.length]);

  const amount = selectedPreset === 'custom'
    ? parseInt(customAmount.replace(/\D/g, '')) || 0
    : selectedPreset || 0;

  const handleAmountChip = (val) => {
    setSelectedPreset(val);
    if (val !== 'custom') setCustomAmount('');
  };

  const handleCustomInput = (e) => {
    const raw = e.target.value.replace(/\D/g, '');
    setCustomAmount(raw);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || amount < 10000) {
      setError('Jumlah minimum top-up Rp 10.000');
      return;
    }
    if (!paymentMethod) {
      setError('Pilih metode pembayaran');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await api.post('/members/topup-request', {
        amount,
        payment_method: paymentMethod,
        reference: reference || undefined,
        note: note || undefined,
      });
      setSuccess(true);
      setSelectedPreset(null);
      setCustomAmount('');
      setReference('');
      setNote('');
      refetchHistory();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      // Handle both {error: 'msg'} and {errors: [{msg}]} response formats
      const errData = err.response?.data;
      const errMsg = errData?.error
        || (errData?.errors?.[0]?.msg)
        || err.message
        || 'Gagal mengajukan top-up';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MemberLayout>
      <div>
        {/* Balance Card */}
        <div className="member-balance-card">
          <div className="balance-label">Saldo Saat Ini</div>
          <div className="balance-amount">{formatRp(user?.balance ?? 0)}</div>
        </div>

        {/* Top-up Form */}
        <div className="member-card">
          <div className="section-title" style={{ marginBottom: 16 }}>
            <span><Wallet size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />Ajukan Top Up</span>
          </div>

          {success && (
            <div style={{ textAlign: 'center', padding: '16px 0', color: '#27AE60' }}>
              <CheckCircle size={36} />
              <p style={{ margin: '8px 0 0', fontSize: 14, fontWeight: 600 }}>
                Pengajuan top-up berhasil dikirim!
              </p>
              <p style={{ fontSize: 12, color: '#9B8B7A', margin: '4px 0 0' }}>
                Menunggu konfirmasi dari admin
              </p>
            </div>
          )}

          {!success && (
            <form onSubmit={handleSubmit}>
              {error && <div className="member-error">{error}</div>}

              {/* Amount Chips */}
              <div className="member-form-group">
                <label>Jumlah Top Up</label>
                <div className="amount-chips">
                  {PRESETS.map(val => (
                    <button
                      key={val}
                      type="button"
                      className={`amount-chip ${selectedPreset === val ? 'selected' : ''}`}
                      onClick={() => handleAmountChip(val)}
                    >
                      {formatRp(val)}
                    </button>
                  ))}
                  <button
                    type="button"
                    className={`amount-chip ${selectedPreset === 'custom' ? 'selected' : ''}`}
                    onClick={() => handleAmountChip('custom')}
                  >
                    Lainnya
                  </button>
                </div>
                {selectedPreset === 'custom' && (
                  <input
                    className="member-input"
                    type="text"
                    inputMode="numeric"
                    placeholder="Contoh: 75000"
                    value={customAmount ? Number(customAmount).toLocaleString('id') : ''}
                    onChange={handleCustomInput}
                    autoFocus
                  />
                )}
                {amount > 0 && (
                  <div style={{ fontSize: 13, color: '#6F4E37', marginTop: 6, fontWeight: 600 }}>
                    Jumlah: {formatRp(amount)}
                  </div>
                )}
              </div>

              {/* Payment Method — card picker with icon */}
              <div className="member-form-group">
                <label>Metode Pembayaran</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: 8 }}>
                  {paymentMethods.map((m) => {
                    const code = typeof m === 'object' ? m.code : m;
                    const name = typeof m === 'object' ? m.name : m;
                    const icon = typeof m === 'object' ? m.icon : null;
                    const isSelected = paymentMethod === code;

                    // Default emoji icons by type/code
                    const defaultIcon = code === 'cash' ? '💵'
                      : code === 'qris' ? '📱'
                      : code === 'transfer' ? '🏦'
                      : code === 'card' ? '💳'
                      : '💳';

                    return (
                      <button
                        key={code}
                        type="button"
                        onClick={() => setPaymentMethod(code)}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                          padding: '12px 8px',
                          borderRadius: 12,
                          border: '1.5px solid',
                          borderColor: isSelected ? '#6F4E37' : '#E8D5C4',
                          background: isSelected ? '#FFF5EE' : '#fff',
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                          boxShadow: isSelected ? '0 0 0 2px rgba(111,78,55,0.15)' : 'none',
                        }}
                      >
                        {/* Icon: gambar jika URL, emoji jika teks pendek, default emoji */}
                        {icon ? (
                          <img src={icon} alt={name} style={{ width: 32, height: 32, objectFit: 'contain' }} />
                        ) : (
                          <span style={{ fontSize: 24, lineHeight: 1 }}>
                            {icon && icon.length <= 4 ? icon : defaultIcon}
                          </span>
                        )}
                        <span style={{
                          fontSize: 10,
                          fontWeight: 600,
                          color: isSelected ? '#6F4E37' : '#2C1810',
                          textAlign: 'center',
                          lineHeight: 1.2,
                        }}>
                          {name}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {!paymentMethod && (
                  <p style={{ fontSize: 11, color: '#E74C3C', marginTop: 4 }}>Pilih metode pembayaran</p>
                )}
              </div>

              {/* Reference Number */}
              <div className="member-form-group">
                <label>Nomor Referensi / Bukti Transfer</label>
                <input
                  className="member-input"
                  type="text"
                  placeholder="No. rekening, bukti transfer, dll"
                  value={reference}
                  onChange={e => setReference(e.target.value)}
                />
              </div>

              {/* Note */}
              <div className="member-form-group">
                <label>Catatan <span style={{ color: '#C4A882', fontWeight: 400 }}>(opsional)</span></label>
                <textarea
                  className="member-textarea"
                  placeholder="Catatan tambahan..."
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  rows={2}
                />
              </div>

              <button type="submit" className="btn-cafe" disabled={loading}>
                {loading
                  ? <><Loader size={16} className="spin" /> Mengirim...</>
                  : 'Kirim Permintaan Top Up'
                }
              </button>
            </form>
          )}
        </div>

        {/* History */}
        <div className="member-section">
          <div className="list-header-row">
            <div className="section-title" style={{ margin: 0 }}>Riwayat Top Up</div>
            <button className="icon-btn" onClick={refetchHistory} title="Refresh">
              <RefreshCw size={15} />
            </button>
          </div>

          {histLoading ? (
            <div className="member-loading">
              <Loader size={24} className="spin" color="#6F4E37" />
            </div>
          ) : history.length === 0 ? (
            <div className="member-empty">
              <Wallet size={36} />
              <p>Belum ada riwayat top-up</p>
            </div>
          ) : (
            history.map(item => {
              const st = STATUS_META[item.status] || STATUS_META.pending;
              return (
                <div key={item.id} className="topup-history-item">
                  <div className="topup-history-row">
                    <div>
                      <div className="topup-info-title">{formatRp(item.amount)}</div>
                      <div className="topup-info-sub">
                        {item.payment_method} · {formatDateTime(item.created_at)}
                      </div>
                    </div>
                    <span className={`status-badge ${st.cls}`}>{st.label}</span>
                  </div>
                  {item.reference_number && (
                    <div className="topup-note">Ref: {item.reference_number}</div>
                  )}
                  {item.note && (
                    <div className="topup-note">"{item.note}"</div>
                  )}
                  {item.admin_note && (
                    <div className="topup-note" style={{ color: '#E74C3C' }}>
                      Admin: {item.admin_note}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </MemberLayout>
  );
}
