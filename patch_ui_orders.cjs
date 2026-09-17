const fs = require('fs');
let code = fs.readFileSync('src/pages/member/MemberOrdersPage.jsx', 'utf8');

if (!code.includes("const [selectedOrder, setSelectedOrder]")) {
  // Add imports
  code = code.replace(
    "import { ShoppingBag, RefreshCw, Loader } from 'lucide-react';",
    "import { ShoppingBag, RefreshCw, Loader, X, FileText, Clock, Utensils, CreditCard, ChevronRight } from 'lucide-react';\nimport { useState, useEffect } from 'react';\nimport api from '../../lib/api';\nimport { QRCodeSVG } from 'qrcode.react';\nimport { generateDynamicQris } from '../../lib/qris';"
  );
  
  // Add states
  code = code.replace(
    "export default function MemberOrdersPage() {",
    "export default function MemberOrdersPage() {\n  const [selectedOrder, setSelectedOrder] = useState(null);\n  const [orderDetails, setOrderDetails] = useState(null);\n  const [detailsLoading, setDetailsLoading] = useState(false);\n  const [qrisString, setQrisString] = useState('');\n"
  );
  
  // Add useEffect to fetch settings
  code = code.replace(
    "const loading = memberLoading || (useFallback && fallbackLoading);",
    "const loading = memberLoading || (useFallback && fallbackLoading);\n\n  useEffect(() => {\n    api.get('/settings').then(res => {\n      const d = res.data;\n      const list = Array.isArray(d.settings) ? d.settings : (Array.isArray(d) ? d : []);\n      setQrisString(list.find(s => s.setting_key === 'qris_string')?.setting_value || '');\n    }).catch(() => {});\n  }, []);\n\n  useEffect(() => {\n    if (selectedOrder) {\n      setDetailsLoading(true);\n      api.get(`/members/orders/${selectedOrder.id}`).then(res => {\n        setOrderDetails(res.data.order);\n      }).catch(() => {}).finally(() => setDetailsLoading(false));\n    }\n  }, [selectedOrder]);"
  );
  
  // Add onClick to card
  code = code.replace(
    "className=\"list-card\"",
    "className=\"list-card\"\n                onClick={() => setSelectedOrder(order)}\n                style={{ cursor: 'pointer' }}"
  );
  
  // Add the Modal at the end of MemberLayout
  const modalHTML = `
      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="auth-modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="auth-modal-content" onClick={e => e.stopPropagation()} style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
            <div style={{ padding: '1.25rem', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--cafe-brown)' }}>Detail Pesanan</h3>
              <button onClick={() => setSelectedOrder(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} color="#666" /></button>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }}>
              {detailsLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                  <Loader className="spin" color="var(--cafe-brown)" />
                </div>
              ) : orderDetails ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ background: '#fcfaf8', padding: '1rem', borderRadius: '12px', border: '1px solid #f0e6d2' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 600 }}>{orderDetails.order_number || \`#\${orderDetails.id}\`}</span>
                      <span className={\`status-badge \${ORDER_STATUS[orderDetails.order_status]?.cls}\`}>{ORDER_STATUS[orderDetails.order_status]?.label}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', fontSize: '0.8rem', color: '#666', marginBottom: '4px' }}>
                      <Clock size={12} /> {formatDateTime(orderDetails.created_at)}
                    </div>
                    {orderDetails.table_number && (
                      <div style={{ display: 'flex', gap: '8px', fontSize: '0.8rem', color: '#666' }}>
                        <Utensils size={12} /> Meja {orderDetails.table_number}
                      </div>
                    )}
                  </div>

                  {orderDetails.payment_status === 'unpaid' && orderDetails.payment_method === 'qris' && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'white', padding: '1rem', borderRadius: '12px', border: '2px solid #6F4E37' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#6F4E37', marginBottom: '0.5rem' }}>Scan untuk Bayar {formatRp(orderDetails.total)}</span>
                      {qrisString ? (
                        <QRCodeSVG value={generateDynamicQris(qrisString, orderDetails.total)} size={160} level="M" />
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: '#b91c1c' }}>QRIS belum diset.</span>
                      )}
                    </div>
                  )}
                  
                  <div>
                    <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: '#333' }}>Daftar Item</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {orderDetails.items?.map((item, i) => (
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
                  
                  <div style={{ borderTop: '1px dashed #ccc', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Subtotal</span><span>{formatRp(orderDetails.subtotal)}</span>
                    </div>
                    {orderDetails.discount > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a' }}>
                        <span>Diskon</span><span>-{formatRp(orderDetails.discount)}</span>
                      </div>
                    )}
                    {orderDetails.tax > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Pajak</span><span>{formatRp(orderDetails.tax)}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1rem', marginTop: '0.5rem' }}>
                      <span>Total</span><span style={{ color: 'var(--cafe-brown)' }}>{formatRp(orderDetails.total)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', color: '#999' }}>Gagal memuat detail</div>
              )}
            </div>
          </div>
        </div>
      )}
    </MemberLayout>`;
    
  code = code.replace('</MemberLayout>', modalHTML);
  fs.writeFileSync('src/pages/member/MemberOrdersPage.jsx', code);
  console.log('patched frontend');
}
