import { useState, useEffect } from 'react';
import {
  Calendar, Clock, Users, RefreshCw, Loader,
  CheckCircle, XCircle, Clock3, Plus, MapPin, ArrowLeft, Phone, Mail, User,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useFetch } from '../../hooks/useApi';
import api from '../../lib/api';
import MemberLayout from './MemberLayout';
import './member.css';

const BOOKING_STATUS = {
  pending:   { label: 'Menunggu',      cls: 'status-pending',   Icon: Clock3 },
  confirmed: { label: 'Dikonfirmasi',  cls: 'status-confirmed', Icon: CheckCircle },
  cancelled: { label: 'Dibatalkan',    cls: 'status-cancelled', Icon: XCircle },
  completed: { label: 'Selesai',       cls: 'status-completed', Icon: CheckCircle },
};

function formatDate(d) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('id-ID', { dateStyle: 'medium' });
}

export default function MemberBookingsPage() {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [detailBooking, setDetailBooking] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const { data, loading, refetch } = useFetch(
    `/bookings?email=${encodeURIComponent(user?.email || '')}`
  );
  const bookings = data?.bookings || [];

  const openDetail = async (bookingId) => {
    setDetailLoading(true);
    try {
      const { data } = await api.get(`/bookings/${bookingId}?email=${encodeURIComponent(user?.email || '')}`);
      setDetailBooking(data.booking);
    } catch {
      setDetailBooking(null);
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <MemberLayout>
      <div>
        {detailBooking ? (
          <BookingDetail
            booking={detailBooking}
            loading={detailLoading}
            onBack={() => setDetailBooking(null)}
          />
        ) : (
          <>
            <div className="list-header-row">
              <div className="section-title" style={{ margin: 0 }}>Booking Saya</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  className="icon-btn"
                  onClick={refetch}
                  title="Refresh"
                  disabled={loading}
                >
                  <RefreshCw size={15} className={loading ? 'spin' : ''} />
                </button>
                <button
                  className="btn-cafe-sm"
                  onClick={() => setShowForm(v => !v)}
                >
                  <Plus size={13} />
                  {showForm ? 'Tutup' : 'Baru'}
                </button>
              </div>
            </div>

            {showForm && (
              <BookingForm
                onDone={() => { setShowForm(false); refetch(); }}
                onCancel={() => setShowForm(false)}
              />
            )}

            {loading ? (
              <div className="member-loading">
                <Loader size={28} className="spin" color="#6F4E37" />
              </div>
            ) : bookings.length === 0 ? (
              <div className="member-empty">
                <Calendar size={40} />
                <p>Belum ada booking</p>
                <button
                  className="btn-cafe-sm"
                  style={{ marginTop: 12 }}
                  onClick={() => setShowForm(true)}
                >
                  Buat Booking Pertama
                </button>
              </div>
            ) : (
              bookings.map((b, idx) => {
                const st = BOOKING_STATUS[b.status] || BOOKING_STATUS.pending;
                const StatusIcon = st.Icon;
                return (
                  <div
                    key={b.id}
                    className="list-card"
                    onClick={() => openDetail(b.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="list-card-top">
                      <div>
                        <div className="list-card-title">
                          {b.booking_number || `#${b.id}`}
                        </div>
                        <div className="list-card-sub" style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginTop: 4 }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                            <Calendar size={11} /> {formatDate(b.booking_date)}
                          </span>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                            <Clock size={11} /> {b.booking_time?.slice(0, 5)}
                          </span>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                            <Users size={11} /> {b.guests} orang
                          </span>
                          {b.branch_name && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                              <MapPin size={11} /> {b.branch_name}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className={`status-badge ${st.cls}`}>
                        <StatusIcon size={10} />
                        {st.label}
                      </span>
                    </div>

                    {b.special_request && (
                      <div style={{ fontSize: 12, color: '#9B8B7A', marginTop: 8, fontStyle: 'italic' }}>
                        "{b.special_request}"
                      </div>
                    )}

                    {b.dp_amount > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 12 }}>
                        <span style={{ color: '#6F4E37' }}>DP: Rp {Number(b.dp_amount).toLocaleString('id')}</span>
                        <span className={b.dp_paid ? 'pay-paid' : 'pay-unpaid'} style={{ padding: '1px 8px', borderRadius: 8 }}>
                          {b.dp_paid ? 'Lunas' : 'Belum Bayar'}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </>
        )}
      </div>
    </MemberLayout>
  );
}

function BookingDetail({ booking, loading, onBack }) {
  const st = BOOKING_STATUS[booking?.status] || BOOKING_STATUS.pending;
  const StatusIcon = st.Icon;

  if (loading) {
    return (
      <div className="member-loading">
        <Loader size={28} className="spin" color="#6F4E37" />
      </div>
    );
  }

  return (
    <div>
      <div className="list-header-row">
        <button className="icon-btn" onClick={onBack}>
          <ArrowLeft size={18} />
        </button>
        <div className="section-title" style={{ margin: 0, fontSize: 16 }}>
          Detail Booking
        </div>
      </div>

      <div className="member-card" style={{ marginTop: 12 }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#2C1810', marginBottom: 4 }}>
            {booking.booking_number || `#${booking.id}`}
          </div>
          <span className={`status-badge ${st.cls}`}>
            <StatusIcon size={12} />
            {st.label}
          </span>
        </div>

        <div className="detail-row">
          <Calendar size={16} color="#D4A574" />
          <div>
            <div className="detail-label">Tanggal</div>
            <div className="detail-value">{formatDate(booking.booking_date)}</div>
          </div>
        </div>

        <div className="detail-row">
          <Clock size={16} color="#D4A574" />
          <div>
            <div className="detail-label">Waktu</div>
            <div className="detail-value">{booking.booking_time?.slice(0, 5)}</div>
          </div>
        </div>

        <div className="detail-row">
          <Users size={16} color="#D4A574" />
          <div>
            <div className="detail-label">Jumlah Tamu</div>
            <div className="detail-value">{booking.guests} orang</div>
          </div>
        </div>

        {booking.branch_name && (
          <div className="detail-row">
            <MapPin size={16} color="#D4A574" />
            <div>
              <div className="detail-label">Cabang</div>
              <div className="detail-value">{booking.branch_name}</div>
            </div>
          </div>
        )}

        {booking.table_number && (
          <div className="detail-row">
            <MapPin size={16} color="#D4A574" />
            <div>
              <div className="detail-label">Meja</div>
              <div className="detail-value">{booking.table_number}</div>
            </div>
          </div>
        )}

        <div className="detail-row">
          <User size={16} color="#D4A574" />
          <div>
            <div className="detail-label">Nama</div>
            <div className="detail-value">{booking.name}</div>
          </div>
        </div>

        <div className="detail-row">
          <Mail size={16} color="#D4A574" />
          <div>
            <div className="detail-label">Email</div>
            <div className="detail-value">{booking.email}</div>
          </div>
        </div>

        {booking.phone && (
          <div className="detail-row">
            <Phone size={16} color="#D4A574" />
            <div>
              <div className="detail-label">Telepon</div>
              <div className="detail-value">{booking.phone}</div>
            </div>
          </div>
        )}

        {booking.special_request && (
          <div className="detail-row">
            <MapPin size={16} color="#D4A574" />
            <div>
              <div className="detail-label">Permintaan Khusus</div>
              <div className="detail-value" style={{ fontStyle: 'italic' }}>"{booking.special_request}"</div>
            </div>
          </div>
        )}

        {booking.dp_amount > 0 && (
          <div className="detail-row">
            <MapPin size={16} color="#D4A574" />
            <div>
              <div className="detail-label">DP</div>
              <div className="detail-value">
                Rp {Number(booking.dp_amount).toLocaleString('id')}
                <span className={booking.dp_paid ? 'pay-paid' : 'pay-unpaid'} style={{ marginLeft: 8, padding: '1px 8px', borderRadius: 8, fontSize: 11 }}>
                  {booking.dp_paid ? 'Lunas' : 'Belum Bayar'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function BookingForm({ onDone, onCancel }) {
  const { user } = useAuth();
  const [branches, setBranches] = useState([]);
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    booking_date: '',
    booking_time: '12:00',
    guests: '2',
    special_request: '',
    table_id: '',
    branch_id: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  const [tables, setTables] = useState([]);
  const [loadingTables, setLoadingTables] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('selected_branch');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setForm(f => ({ ...f, branch_id: parsed.id }));
      } catch {}
    }
    api.get('/branches/public')
      .then(r => setBranches(r.data.branches || []))
      .catch(() => {});
  }, []);

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);

  // Load tables with booking overlap check for selected date+time
  const loadTables = async (date, time) => {
    if (!date) { setTables([]); return; }
    setLoadingTables(true);
    try {
      const t = time || form.booking_time || '12:00';
      const branchQ = form.branch_id ? `&branch_id=${form.branch_id}` : '';
      const res = await api.get(`/tables?date=${date}&time=${t}${branchQ}`);
      const allTables = (res.data?.tables || []).filter(t => t.is_active);
      setTables(allTables);
    } catch { setTables([]); }
    finally { setLoadingTables(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        booking_date: form.booking_date,
        booking_time: form.booking_time + ':00',
        guests: parseInt(form.guests),
        branch_id: form.branch_id || null,
        special_request: form.special_request || null,
      };
      if (form.table_id) payload.table_number = tables.find(t => String(t.id) === form.table_id)?.table_number;
      const { data } = await api.post('/bookings', payload);
      setSuccess(data.booking);
      setTimeout(onDone, 2000);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="member-card" style={{ overflow: 'hidden' }}>
      {success ? (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <CheckCircle size={40} color="#27AE60" />
          <p style={{ margin: '10px 0 4px', fontWeight: 600, color: '#2C1810' }}>Booking Berhasil!</p>
          <p style={{ fontSize: 13, color: '#9B8B7A', margin: 0 }}>
            No. {success.booking_number || `#${success.id}`}
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {error && <div className="member-error">{error}</div>}

          {/* Date + Time row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div className="member-form-group">
              <label><Calendar size={13} style={{ marginRight: 4, verticalAlign: 'middle' }} />Tanggal</label>
              <input
                className="member-input"
                type="date"
                value={form.booking_date}
                min={minDate.toISOString().slice(0, 10)}
                onChange={(e) => { set('booking_date')(e); loadTables(e.target.value, form.booking_time); }}
                required
              />
            </div>
            <div className="member-form-group">
              <label><Clock size={13} style={{ marginRight: 4, verticalAlign: 'middle' }} />Waktu</label>
              <input
                className="member-input"
                type="time"
                value={form.booking_time}
                onChange={(e) => { set('booking_time')(e); if (form.booking_date) loadTables(form.booking_date, e.target.value); }}
                required
              />
            </div>
          </div>

          {/* Branch */}
          <div className="member-form-group">
            <label><MapPin size={13} style={{ marginRight: 4, verticalAlign: 'middle' }} />Pilih Cabang</label>
            <select className="member-select" value={form.branch_id} onChange={(e) => {
              setForm(f => ({ ...f, branch_id: e.target.value }));
            }} required>
              <option value="">— Pilih Cabang —</option>
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.name}{b.city ? ` (${b.city})` : ''}</option>
              ))}
            </select>
          </div>

          {/* Guests */}
          <div className="member-form-group">
            <label><Users size={13} style={{ marginRight: 4, verticalAlign: 'middle' }} />Jumlah Tamu</label>
            <select className="member-select" value={form.guests} onChange={set('guests')}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 15, 20].map(n => (
                <option key={n} value={n}>{n} orang</option>
              ))}
            </select>
          </div>

          {/* Pilih Meja — muncul setelah tanggal dipilih */}
          {form.booking_date && (
            <div className="member-form-group">
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>Pilih Meja <span style={{ color: '#C4A882', fontWeight: 400 }}>(opsional)</span></span>
                {loadingTables && <Loader size={12} className="spin" color="#D4A574" />}
                {!loadingTables && tables.length > 0 && (
                  <button type="button" style={{ background:'none',border:'none',cursor:'pointer',color:'#D4A574',fontSize:11,padding:0 }}
                    onClick={() => loadTables(form.booking_date)}>
                    <RefreshCw size={11} style={{ marginRight: 3, verticalAlign: 'middle' }} />Cek ulang
                  </button>
                )}
              </label>
              {tables.length === 0 && !loadingTables ? (
                <p style={{ fontSize: 12, color: '#9B8B7A', margin: '4px 0' }}>Pilih tanggal untuk lihat meja tersedia</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, table_id: '' }))}
                    style={{
                      padding: '8px 4px', borderRadius: 10, border: '1.5px solid',
                      borderColor: !form.table_id ? '#6F4E37' : '#F5E6D3',
                      background: !form.table_id ? '#FFF5EE' : '#fff',
                      fontSize: 11, fontWeight: 600, cursor: 'pointer',
                      color: !form.table_id ? '#6F4E37' : '#9B8B7A',
                    }}
                  >
                    Bebas
                  </button>
                  {tables.slice(0, 8).map(t => {
                    const isUnavailable = t.status === 'occupied' || t.status === 'reserved'
                      || t.status === 'maintenance' || t.manual_close || t.is_booked;
                    const isSelected = form.table_id === String(t.id);

                    const statusLabel = t.manual_close ? 'Tutup' :
                      t.status === 'maintenance' ? 'Perawatan' :
                      t.is_booked ? 'Dipesan' :
                      t.status === 'occupied' ? 'Terisi' :
                      t.status === 'reserved' ? 'Reserved' :
                      `${t.capacity} org`;

                    const bgColor = isSelected ? '#6F4E37' :
                      t.manual_close || t.status === 'maintenance' ? '#FEF2F2' :
                      t.is_booked ? '#FFFBEB' :
                      isUnavailable ? '#F9F5F0' : '#fff';

                    const borderColor = isSelected ? '#6F4E37' :
                      t.manual_close || t.status === 'maintenance' ? '#FECACA' :
                      t.is_booked ? '#FCD34D' :
                      isUnavailable ? '#F5E6D3' : '#E8D5C4';

                    return (
                      <button
                        key={t.id}
                        type="button"
                        disabled={isUnavailable}
                        onClick={() => !isUnavailable && setForm(f => ({ ...f, table_id: String(t.id) }))}
                        style={{
                          padding: '8px 4px', borderRadius: 10, border: '1.5px solid',
                          borderColor, background: bgColor,
                          fontSize: 11, fontWeight: 600,
                          cursor: isUnavailable ? 'not-allowed' : 'pointer',
                          color: isSelected ? '#fff' : isUnavailable ? '#C4A882' : '#2C1810',
                          opacity: isUnavailable ? 0.65 : 1,
                        }}
                      >
                        <div>{t.table_number}</div>
                        <div style={{ fontSize: 9, opacity: 0.75, marginTop: 1 }}>{statusLabel}</div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Special Request */}
          <div className="member-form-group">
            <label>Permintaan Khusus <span style={{ color: '#C4A882', fontWeight: 400 }}>(opsional)</span></label>
            <textarea
              className="member-textarea"
              placeholder="Kursi dekat jendela, acara ulang tahun, dll..."
              value={form.special_request}
              onChange={set('special_request')}
              rows={2}
            />
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              className="btn-cafe-outline"
              onClick={onCancel}
              style={{ flex: 1 }}
            >
              Batal
            </button>
            <button
              type="submit"
              className="btn-cafe"
              disabled={loading}
              style={{ flex: 2 }}
            >
              {loading ? <><Loader size={15} className="spin" /> Menyimpan...</> : 'Konfirmasi Booking'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
