import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { MapPin, Coffee } from 'lucide-react';

export default function BranchSelectorPage() {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem('selected_branch');
    if (saved) { try { setSelected(JSON.parse(saved)); } catch {} }
    api.get('/branches/public')
      .then(r => setBranches(r.data.branches || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const choose = (branch) => {
    localStorage.setItem('selected_branch', JSON.stringify(branch));
    navigate('/');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F5E6D3', padding: '0' }}>
      {/* Header */}
      <div style={{ background: '#6F4E37', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <Coffee size={24} color="#F5E6D3" />
        <span style={{ color: '#F5E6D3', fontSize: 18, fontWeight: 700 }}>Café Azzura</span>
      </div>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '28px 20px' }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#3D2B1F', marginBottom: 6 }}>Pilih Cabang</h2>
        <p style={{ fontSize: 13, color: '#9B8B7A', marginBottom: 24 }}>Pilih cabang yang ingin Anda kunjungi</p>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#9B8B7A' }}>
            <Coffee size={32} style={{ opacity: 0.4, marginBottom: 12 }} />
            <p>Memuat cabang...</p>
          </div>
        ) : branches.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#9B8B7A' }}>
            <p>Tidak ada cabang tersedia.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {branches.map(b => {
              const isSelected = selected?.id === b.id;
              return (
                <button
                  key={b.id}
                  onClick={() => choose(b)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    background: isSelected ? '#6F4E37' : '#fff',
                    color: isSelected ? '#F5E6D3' : '#3D2B1F',
                    border: `2px solid ${isSelected ? '#6F4E37' : '#E8D5C0'}`,
                    borderRadius: 14, padding: '14px 16px', cursor: 'pointer',
                    textAlign: 'left', transition: 'all 0.15s', width: '100%',
                  }}
                >
                  <div style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: isSelected ? 'rgba(255,255,255,0.15)' : '#F5E6D3',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <Coffee size={20} color={isSelected ? '#F5E6D3' : '#6F4E37'} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{b.name}</div>
                    {b.city && (
                      <div style={{ fontSize: 12, opacity: 0.7, display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                        <MapPin size={11} /> {b.city}
                      </div>
                    )}
                    {b.address && (
                      <div style={{ fontSize: 11, opacity: 0.6, marginTop: 1 }}>{b.address}</div>
                    )}
                  </div>
                  {isSelected && (
                    <span style={{ fontSize: 11, fontWeight: 600, background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: 20 }}>
                      Aktif
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {selected && (
          <button
            onClick={() => navigate('/')}
            style={{
              marginTop: 20, width: '100%', padding: '13px', borderRadius: 12,
              background: '#3D2B1F', color: '#F5E6D3', fontSize: 14, fontWeight: 700,
              border: 'none', cursor: 'pointer',
            }}
          >
            Lanjut ke {selected.name}
          </button>
        )}
      </div>
    </div>
  );
}
