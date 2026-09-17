const fs = require('fs');
const path = require('path');

// 1. Create MemberOrderDetailPage.jsx
const detailCode = `
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Loader, Clock, Utensils, X } from 'lucide-react';
import api from '../../lib/api';
import MemberLayout from './MemberLayout';
import { QRCodeSVG } from 'qrcode.react';
import { generateDynamicQris } from '../../lib/qris';
import './member.css';

function formatRp(v) {
  return 'Rp ' + Number(v || 0).toLocaleString('id');
}

function formatDateTime(d) {
  if (!d) return '-';
  return new Date(d).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' });
}

const ORDER_STATUS = {
  pending:   { label: 'Pending',    cls: 'status-pending' },
  preparing: { label: 'Diproses',   cls: 'status-preparing' },
  ready:     { label: 'Siap',       cls: 'status-ready' },
  completed: { label: 'Selesai',    cls: 'status-completed' },
  cancelled: { label: 'Dibatalkan', cls: 'status-cancelled' },
};

export default function MemberOrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qrisString, setQrisString] = useState('');

  useEffect(() => {
    api.get('/settings').then(res => {
      const d = res.data;
      const list = Array.isArray(d.settings) ? d.settings : (Array.isArray(d) ? d : []);
      setQrisString(list.find(s => s.setting_key === 'qris_string')?.setting_value || '');
    }).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    api.get(\`/members/orders/\${id}\`).then(res => {
      setOrder(res.data.order);
    }).catch(err => {
      console.error(err);
    }).finally(() => setLoading(false));
  }, [id]);

  return (
    <MemberLayout>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', padding: '0 0.25rem' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', backgroundColor: 'rgba(111, 78, 55, 0.1)' }}>
          <ChevronLeft size={20} color="var(--cafe-brown)" />
        </button>
        <h2 className="section-title" style={{ margin: 0 }}>Detail Pesanan</h2>
      </div>

      <div style={{ padding: '0.5rem' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
            <Loader className="spin" color="var(--cafe-brown)" size={28} />
          </div>
        ) : order ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: '#fff', borderRadius: '16px', padding: '1.25rem', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <div style={{ background: '#fcfaf8', padding: '1rem', borderRadius: '12px', border: '1px solid #f0e6d2' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: 600 }}>{order.order_number || \`#\${order.id}\`}</span>
                <span className={\`status-badge \${ORDER_STATUS[order.order_status]?.cls}\`}>{ORDER_STATUS[order.order_status]?.label}</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', fontSize: '0.8rem', color: '#666', marginBottom: '4px' }}>
                <Clock size={12} /> {formatDateTime(order.created_at)}
              </div>
              {order.table_number && (
                <div style={{ display: 'flex', gap: '8px', fontSize: '0.8rem', color: '#666' }}>
                  <Utensils size={12} /> Meja {order.table_number}
                </div>
              )}
            </div>

            {order.payment_status === 'unpaid' && order.payment_method === 'qris' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'white', padding: '1.25rem', borderRadius: '12px', border: '2px dashed #6F4E37' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#6F4E37', marginBottom: '1rem' }}>Scan untuk Bayar {formatRp(order.total)}</span>
                {qrisString ? (
                  <QRCodeSVG value={generateDynamicQris(qrisString, order.total)} size={180} level="M" />
                ) : (
                  <span style={{ fontSize: '0.75rem', color: '#b91c1c' }}>QRIS belum diset.</span>
                )}
                <span style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.75rem', textAlign: 'center' }}>Gunakan aplikasi e-Wallet atau Mobile Banking Anda.</span>
              </div>
            )}
            
            <div style={{ marginTop: '0.5rem' }}>
              <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', color: '#333' }}>Daftar Item</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {order.items?.map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <span style={{ fontWeight: 600, color: 'var(--cafe-brown)' }}>{item.quantity}x</span>
                      <span>{item.product_name || 'Item'}</span>
                    </div>
                    <span style={{ fontWeight: 500 }}>{formatRp(item.subtotal)}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div style={{ borderTop: '1px dashed #ccc', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Subtotal</span><span>{formatRp(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a' }}>
                  <span>Diskon</span><span>-{formatRp(order.discount)}</span>
                </div>
              )}
              {order.tax > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Pajak</span><span>{formatRp(order.tax)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1rem', marginTop: '0.5rem' }}>
                <span>Total</span><span style={{ color: 'var(--cafe-brown)' }}>{formatRp(order.total)}</span>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: '#999', padding: '2rem' }}>Pesanan tidak ditemukan.</div>
        )}
      </div>
    </MemberLayout>
  );
}
`;
fs.writeFileSync('src/pages/member/MemberOrderDetailPage.jsx', detailCode);

// 2. Clean up MemberOrdersPage.jsx
let ordersCode = fs.readFileSync('src/pages/member/MemberOrdersPage.jsx', 'utf8');

// replace onClick
ordersCode = ordersCode.replace(
  "onClick={() => setSelectedOrder(order)}",
  "onClick={() => navigate('/member/orders/' + order.id)}"
);
// remove the modal block
const modalStart = ordersCode.indexOf('{/* Order Details Modal */}');
if (modalStart > -1) {
  ordersCode = ordersCode.substring(0, modalStart) + '</MemberLayout>\n  );\n}';
}

// remove unused imports/state
ordersCode = ordersCode.replace(
  "import { useState, useEffect } from 'react';",
  "import { useNavigate } from 'react-router-dom';"
);
ordersCode = ordersCode.replace(
  "const [selectedOrder, setSelectedOrder] = useState(null);\n  const [orderDetails, setOrderDetails] = useState(null);\n  const [detailsLoading, setDetailsLoading] = useState(false);\n  const [qrisString, setQrisString] = useState('');",
  "const navigate = useNavigate();"
);
// remove the useEffects
const effect1Start = ordersCode.indexOf('useEffect(() => {');
const effect2End = ordersCode.indexOf('}, [selectedOrder]);') + 20;
if (effect1Start > -1 && effect2End > -1) {
  ordersCode = ordersCode.substring(0, effect1Start) + ordersCode.substring(effect2End);
}
fs.writeFileSync('src/pages/member/MemberOrdersPage.jsx', ordersCode);

// 3. Add to App.jsx
let appCode = fs.readFileSync('src/App.jsx', 'utf8');
if (!appCode.includes("MemberOrderDetailPage")) {
  appCode = appCode.replace(
    "import MemberOrdersPage from './pages/member/MemberOrdersPage';",
    "import MemberOrdersPage from './pages/member/MemberOrdersPage';\nimport MemberOrderDetailPage from './pages/member/MemberOrderDetailPage';"
  );
  appCode = appCode.replace(
    "<Route\n              path=\"/member/orders\"\n              element={<RequireMember><MemberOrdersPage /></RequireMember>}\n            />",
    "<Route\n              path=\"/member/orders\"\n              element={<RequireMember><MemberOrdersPage /></RequireMember>}\n            />\n            <Route\n              path=\"/member/orders/:id\"\n              element={<RequireMember><MemberOrderDetailPage /></RequireMember>}\n            />"
  );
  fs.writeFileSync('src/App.jsx', appCode);
}
console.log('patched');
