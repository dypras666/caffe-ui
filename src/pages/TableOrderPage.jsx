import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Coffee, ShoppingCart, Plus, Minus, X, CheckCircle, Loader,
  CreditCard, Banknote, ChevronDown, ChevronRight, Clock, Receipt,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthModal from '../components/member/AuthModal';
import api from '../lib/api';
import { mediaUrl } from '../lib/utils';
import './TableOrderPage.css';

const CAFE_NAME = 'Café Azzura';
const fmt = (n) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function TableOrderPage() {
  const params = new URLSearchParams(window.location.search);
  const qrToken = params.get('qr');
  const tableParam = params.get('table') || '';
  const { user } = useAuth();

  // phases: loading | invalid | auth | browsing | success
  const [phase, setPhase] = useState('loading');
  const [qrData, setQrData] = useState(null);
  const [tableNumber, setTableNumber] = useState(tableParam);
  const [apiError, setApiError] = useState('');

  // Catalog data
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [paymentSetting, setPaymentSetting] = useState('both'); // 'kasir'|'direct'|'both'

  // Cart state
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);

  // Checkout state
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentMode, setPaymentMode] = useState(''); // 'kasir' | 'direct'
  const [selectedPayment, setSelectedPayment] = useState('');
  const [orderNote, setOrderNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Variant dialog state
  const [variantProduct, setVariantProduct] = useState(null);
  const [variantData, setVariantData] = useState(null);
  const [variantLoading, setVariantLoading] = useState(false);
  const [variantSelections, setVariantSelections] = useState({});
  const [addonSelections, setAddonSelections] = useState({});
  const [variantQty, setVariantQty] = useState(1);
  const [variantNote, setVariantNote] = useState('');

  // Success
  const [orderResult, setOrderResult] = useState(null);

  // ── Phase 1: Validate QR on mount ──────────────────────────────────────────
  useEffect(() => {
    const validate = async () => {
      if (!qrToken) {
        setApiError('Token QR tidak ditemukan. Silakan scan ulang QR code.');
        setPhase('invalid');
        return;
      }
      try {
        let lat, lng;
        try {
          const pos = await new Promise((res, rej) =>
            navigator.geolocation.getCurrentPosition(res, rej, { timeout: 5000 })
          );
          lat = pos.coords.latitude;
          lng = pos.coords.longitude;
        } catch { /* geolocation optional */ }

        const { data } = await api.post('/branches/qr/validate', { token: qrToken, lat, lng });
        setQrData(data);
        if (data.table?.table_number) setTableNumber(data.table.table_number);
        setPhase(user ? 'browsing' : 'auth');
      } catch (err) {
        setApiError(err.response?.data?.error || 'QR code tidak valid atau sudah kadaluarsa.');
        setPhase('invalid');
      }
    };
    validate();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Phase 2: Load catalog when browsing ────────────────────────────────────
  useEffect(() => {
    if (phase !== 'browsing') return;
    const load = async () => {
      try {
        const [pRes, cRes, pmRes, sRes] = await Promise.allSettled([
          api.get('/products?limit=200&status=active'),
          api.get('/categories'),
          api.get('/payments/methods'),
          api.get('/settings'),
        ]);

        if (pRes.status === 'fulfilled') {
          const d = pRes.value.data;
          setProducts(d.products || d.data || d || []);
        }
        if (cRes.status === 'fulfilled') {
          const d = cRes.value.data;
          setCategories(d.categories || d.data || d || []);
        }
        if (pmRes.status === 'fulfilled') {
          const d = pmRes.value.data;
          setPaymentMethods(d.methods || d.data || d || []);
        }
        if (sRes.status === 'fulfilled') {
          const d = sRes.value.data;
          const list = Array.isArray(d.settings) ? d.settings : (Array.isArray(d) ? d : []);
          const val = list.find(s => s.key === 'table_order_payment')?.value
            || d.table_order_payment
            || 'both';
          setPaymentSetting(val);
        }
      } catch (err) {
        console.error('Load catalog error:', err);
      }
    };
    load();
  }, [phase]);

  // Watch for login completing in auth phase
  useEffect(() => {
    if (phase === 'auth' && user) setPhase('browsing');
  }, [user, phase]);

  // ── Cart helpers ────────────────────────────────────────────────────────────
  const cartTotal = useMemo(() => cart.reduce((s, i) => s + i.price * i.qty, 0), [cart]);
  const cartCount = useMemo(() => cart.reduce((s, i) => s + i.qty, 0), [cart]);

  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(i => i.cartKey === item.cartKey);
      if (existing) return prev.map(i => i.cartKey === item.cartKey ? { ...i, qty: i.qty + item.qty } : i);
      return [...prev, item];
    });
  };

  const updateQty = (cartKey, delta) => {
    setCart(prev => prev.map(i => i.cartKey === cartKey ? { ...i, qty: Math.max(0, i.qty + delta) } : i).filter(i => i.qty > 0));
  };

  // ── Product tap: open variant picker or add directly ───────────────────────
  const handleProductTap = async (product) => {
    const needsPicker = product.has_variants
      || (product.variant_groups?.length > 0)
      || (product.addon_groups?.length > 0);

    if (needsPicker) {
      setVariantProduct(product);
      setVariantQty(1);
      setVariantNote('');
      setVariantSelections({});
      setAddonSelections({});
      setVariantLoading(true);
      setVariantData(null);
      try {
        const { data } = await api.get(`/variants/${product.id}`);
        setVariantData(data);
      } catch {
        setVariantData({ variant_groups: [], addon_groups: [] });
      } finally {
        setVariantLoading(false);
      }
    } else {
      addToCart({ cartKey: String(product.id), productId: product.id, name: product.name, price: product.price, qty: 1, variants: [], addons: [], note: '' });
    }
  };

  const computedVariantPrice = useMemo(() => {
    if (!variantProduct) return 0;
    let total = variantProduct.price;
    Object.values(variantSelections).forEach(v => { if (v?.price_add) total += Number(v.price_add); });
    Object.values(addonSelections).forEach(arr => (arr || []).forEach(a => { if (a?.price) total += Number(a.price); }));
    return total;
  }, [variantProduct, variantSelections, addonSelections]);

  const confirmVariant = () => {
    const vKeys = Object.entries(variantSelections).map(([g, v]) => `${g}:${v?.id}`).join('|');
    const aKeys = Object.entries(addonSelections).flatMap(([g, arr]) => (arr || []).map(a => `${g}:${a.id}`)).join('|');
    addToCart({
      cartKey: `${variantProduct.id}~${vKeys}~${aKeys}~${variantNote}`,
      productId: variantProduct.id,
      name: variantProduct.name,
      price: computedVariantPrice,
      qty: variantQty,
      variants: Object.values(variantSelections).filter(Boolean),
      addons: Object.values(addonSelections).flat().filter(Boolean),
      note: variantNote,
    });
    setVariantProduct(null);
  };

  // ── Submit order ────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setSubmitError('');
    setSubmitting(true);
    try {
      const { data } = await api.post('/orders', {
        customer_name: user?.name || '',
        customer_email: user?.email || '',
        customer_phone: user?.phone || '',
        order_type: 'dine-in',
        table_number: tableNumber,
        table_id: qrData?.table?.id,
        branch_id: qrData?.branch_id,
        payment_method: paymentMode === 'kasir' ? 'cash' : selectedPayment,
        payment_status: 'pending',
        notes: orderNote,
        items: cart.map(i => ({
          product_id: i.productId,
          quantity: i.qty,
          notes: i.note || '',
          variants: i.variants,
          addons: i.addons,
        })),
      });
      setOrderResult(data);
      setPhase('success');
    } catch (err) {
      setSubmitError(err.response?.data?.error || 'Gagal membuat pesanan. Coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Filtered products ───────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (activeCategory === 'all') return products;
    return products.filter(p => p.category_id === activeCategory || p.category?.id === activeCategory);
  }, [products, activeCategory]);

  // ═══════════════════════════════ RENDER ════════════════════════════════════

  if (phase === 'loading') {
    return (
      <div className="to-fullscreen to-loading">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}>
          <Coffee size={44} />
        </motion.div>
        <p>Memvalidasi meja...</p>
      </div>
    );
  }

  if (phase === 'invalid') {
    return (
      <div className="to-fullscreen to-invalid">
        <div className="to-invalid-emoji">☕</div>
        <h2>QR Tidak Valid</h2>
        <p>{apiError || 'QR code tidak valid atau sudah kadaluarsa.'}</p>
        <p className="to-invalid-hint">Silakan minta staf untuk QR code baru.</p>
      </div>
    );
  }

  if (phase === 'auth') {
    return (
      <div className="to-auth-bg">
        <div className="to-auth-intro">
          <Coffee size={48} />
          <h2>{CAFE_NAME}</h2>
          {tableNumber && <p className="to-auth-table">Meja <strong>{tableNumber}</strong></p>}
          <p className="to-auth-hint">Login untuk mulai memesan</p>
        </div>
        <AuthModal
          onClose={(reason) => { if (reason === 'loggedin') setPhase('browsing'); }}
        />
      </div>
    );
  }

  if (phase === 'success') {
    const orderNum = orderResult?.order?.order_number || orderResult?.order_number || orderResult?.id || '—';
    return (
      <div className="to-fullscreen to-success">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15 }}>
          <CheckCircle size={72} className="to-success-icon" />
        </motion.div>
        <h2>Pesanan Diterima!</h2>
        <p className="to-order-num">#{orderNum}</p>
        <p className="to-success-msg">Pesanan Anda sedang diproses oleh barista kami.</p>
        <div className="to-success-eta">
          <Clock size={16} />
          <span>Estimasi siap 10–15 menit</span>
        </div>
        {paymentMode === 'kasir' && (
          <div className="to-success-pay-note">
            <Receipt size={16} />
            <span>Silakan bayar ke kasir</span>
          </div>
        )}
        <motion.button
          className="to-btn-primary"
          style={{ marginTop: '2rem', maxWidth: '280px' }}
          onClick={() => { setCart([]); setShowCart(false); setShowCheckout(false); setPhase('browsing'); }}
          whileTap={{ scale: 0.97 }}
        >
          Pesan Lagi
        </motion.button>
      </div>
    );
  }

  // ── Browsing phase ──────────────────────────────────────────────────────────
  return (
    <div className="to-page">

      {/* ── Header ── */}
      <header className="to-header">
        <div className="to-header-brand">
          <Coffee size={22} />
          <span>{CAFE_NAME}</span>
        </div>
        <div className="to-header-table">
          <span className="to-table-label">Meja</span>
          <span className="to-table-num">{tableNumber || '—'}</span>
        </div>
      </header>

      {/* ── Category Tabs ── */}
      <div className="to-tabs-wrap">
        <div className="to-tabs">
          <button className={`to-tab ${activeCategory === 'all' ? 'active' : ''}`} onClick={() => setActiveCategory('all')}>
            Semua
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`to-tab ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* ── Product Grid ── */}
      <main className="to-grid">
        {filtered.length === 0 && (
          <div className="to-empty">
            <Coffee size={32} />
            <p>Tidak ada produk tersedia</p>
          </div>
        )}
        {filtered.map(product => (
          <motion.div
            key={product.id}
            className={`to-card ${product.stock === 0 ? 'to-card-sold' : ''}`}
            whileTap={{ scale: product.stock === 0 ? 1 : 0.96 }}
            onClick={() => product.stock !== 0 && handleProductTap(product)}
          >
            {product.image || product.image_url
              ? <img className="to-card-img" src={mediaUrl(product.image || product.image_url)} alt={product.name} loading="lazy" />
              : <div className="to-card-img-placeholder"><Coffee size={28} /></div>
            }
            <div className="to-card-body">
              <p className="to-card-name">{product.name}</p>
              {product.description && <p className="to-card-desc">{product.description}</p>}
              <div className="to-card-footer">
                <span className="to-card-price">{fmt(product.price)}</span>
                {product.stock === 0
                  ? <span className="to-card-sold-badge">Habis</span>
                  : <span className="to-card-add"><Plus size={14} /></span>
                }
              </div>
            </div>
          </motion.div>
        ))}
      </main>

      <div style={{ height: '90px' }} />

      {/* ── Floating Cart Button ── */}
      <AnimatePresence>
        {cartCount > 0 && (
          <motion.button
            className="to-fab"
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            onClick={() => setShowCart(true)}
            whileTap={{ scale: 0.96 }}
          >
            <ShoppingCart size={18} />
            <span>{cartCount} item</span>
            <span className="to-fab-sep">·</span>
            <span className="to-fab-total">{fmt(cartTotal)}</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Variant Picker Dialog ── */}
      <AnimatePresence>
        {variantProduct && (
          <motion.div className="to-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div
              className="to-dialog"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className="to-handle" />
              <div className="to-dialog-head">
                <div>
                  <h3 className="to-dialog-title">{variantProduct.name}</h3>
                  <p className="to-dialog-sub">{fmt(computedVariantPrice)} × {variantQty} = {fmt(computedVariantPrice * variantQty)}</p>
                </div>
                <button className="to-icon-btn" onClick={() => setVariantProduct(null)}><X size={20} /></button>
              </div>

              <div className="to-dialog-body">
                {variantLoading ? (
                  <div className="to-center"><Loader size={28} className="spin" /></div>
                ) : <>
                  {(variantData?.variant_groups || []).map(group => (
                    <div key={group.id} className="to-opt-group">
                      <p className="to-opt-group-title">
                        {group.name}
                        {group.required && <span className="to-required">Wajib</span>}
                      </p>
                      <div className="to-options">
                        {(group.options || []).map(opt => (
                          <label key={opt.id} className={`to-option ${variantSelections[group.id]?.id === opt.id ? 'selected' : ''}`}>
                            <input type="radio" name={`vg-${group.id}`}
                              checked={variantSelections[group.id]?.id === opt.id}
                              onChange={() => setVariantSelections(p => ({ ...p, [group.id]: opt }))}
                            />
                            <span className="to-option-name">{opt.name}</span>
                            {Number(opt.price_add) > 0 && <span className="to-option-price">+{fmt(opt.price_add)}</span>}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}

                  {(variantData?.addon_groups || []).map(group => (
                    <div key={group.id} className="to-opt-group">
                      <p className="to-opt-group-title">{group.name} <span className="to-optional">Opsional</span></p>
                      <div className="to-options">
                        {(group.addons || []).map(addon => {
                          const checked = (addonSelections[group.id] || []).some(a => a.id === addon.id);
                          return (
                            <label key={addon.id} className={`to-option ${checked ? 'selected' : ''}`}>
                              <input type="checkbox" checked={checked}
                                onChange={() => setAddonSelections(p => {
                                  const cur = p[group.id] || [];
                                  return { ...p, [group.id]: checked ? cur.filter(a => a.id !== addon.id) : [...cur, addon] };
                                })}
                              />
                              <span className="to-option-name">{addon.name}</span>
                              {Number(addon.price) > 0 && <span className="to-option-price">+{fmt(addon.price)}</span>}
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  <div className="to-opt-group">
                    <p className="to-opt-group-title">Catatan <span className="to-optional">Opsional</span></p>
                    <textarea className="to-note-input" rows={2} placeholder="Contoh: less sugar, extra hot..."
                      value={variantNote} onChange={e => setVariantNote(e.target.value)} />
                  </div>
                </>}
              </div>

              <div className="to-dialog-foot">
                <div className="to-qty-ctrl">
                  <button className="to-qty-btn" onClick={() => setVariantQty(q => Math.max(1, q - 1))}><Minus size={15} /></button>
                  <span className="to-qty-val">{variantQty}</span>
                  <button className="to-qty-btn" onClick={() => setVariantQty(q => q + 1)}><Plus size={15} /></button>
                </div>
                <motion.button className="to-btn-primary to-btn-flex" onClick={confirmVariant}
                  disabled={variantLoading} whileTap={{ scale: 0.97 }}>
                  Tambah — {fmt(computedVariantPrice * variantQty)}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Cart Bottom Sheet ── */}
      <AnimatePresence>
        {showCart && (
          <motion.div className="to-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={e => e.target === e.currentTarget && setShowCart(false)}>
            <motion.div className="to-sheet"
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
              <div className="to-handle" />
              <div className="to-sheet-head">
                <h3>{showCheckout ? 'Konfirmasi Pesanan' : 'Keranjang'}</h3>
                <button className="to-icon-btn" onClick={() => { setShowCart(false); setShowCheckout(false); }}><X size={20} /></button>
              </div>

              {!showCheckout ? (
                /* ─ Cart items ─ */
                <>
                  <div className="to-cart-list">
                    {cart.map(item => (
                      <div key={item.cartKey} className="to-cart-item">
                        <div className="to-cart-info">
                          <p className="to-cart-name">{item.name}</p>
                          {item.variants?.length > 0 && <p className="to-cart-meta">{item.variants.map(v => v.name).join(', ')}</p>}
                          {item.addons?.length > 0 && <p className="to-cart-meta">+ {item.addons.map(a => a.name).join(', ')}</p>}
                          {item.note && <p className="to-cart-note">📝 {item.note}</p>}
                          <p className="to-cart-price">{fmt(item.price)}</p>
                        </div>
                        <div className="to-qty-ctrl sm">
                          <button className="to-qty-btn sm" onClick={() => updateQty(item.cartKey, -1)}><Minus size={12} /></button>
                          <span className="to-qty-val">{item.qty}</span>
                          <button className="to-qty-btn sm" onClick={() => updateQty(item.cartKey, 1)}><Plus size={12} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="to-cart-foot">
                    <div className="to-cart-total">
                      <span>Total</span>
                      <strong>{fmt(cartTotal)}</strong>
                    </div>
                    <motion.button className="to-btn-primary"
                      onClick={() => {
                        if (paymentSetting === 'kasir') setPaymentMode('kasir');
                        else if (paymentSetting === 'direct') setPaymentMode('direct');
                        else setPaymentMode('');
                        setSubmitError('');
                        setShowCheckout(true);
                      }}
                      whileTap={{ scale: 0.97 }}>
                      Lanjut ke Pembayaran <ChevronRight size={16} />
                    </motion.button>
                  </div>
                </>
              ) : (
                /* ─ Checkout ─ */
                <CheckoutPanel
                  paymentSetting={paymentSetting}
                  paymentMethods={paymentMethods}
                  paymentMode={paymentMode} setPaymentMode={setPaymentMode}
                  selectedPayment={selectedPayment} setSelectedPayment={setSelectedPayment}
                  orderNote={orderNote} setOrderNote={setOrderNote}
                  cart={cart} cartTotal={cartTotal}
                  submitting={submitting} submitError={submitError}
                  onBack={() => setShowCheckout(false)}
                  onSubmit={handleSubmit}
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Checkout Sub-Panel ────────────────────────────────────────────────────────
function CheckoutPanel({
  paymentSetting, paymentMethods,
  paymentMode, setPaymentMode,
  selectedPayment, setSelectedPayment,
  orderNote, setOrderNote,
  cart, cartTotal,
  submitting, submitError,
  onBack, onSubmit,
}) {
  const canSubmit = !!paymentMode && (paymentMode === 'kasir' || (paymentMode === 'direct' && !!selectedPayment));

  return (
    <div className="to-checkout">
      <button className="to-back-btn" onClick={onBack}>
        <ChevronDown size={18} /> Kembali ke keranjang
      </button>

      <div className="to-checkout-body">
        {/* Summary */}
        <div className="to-section">
          <p className="to-section-title">Ringkasan Pesanan</p>
          {cart.map(item => (
            <div key={item.cartKey} className="to-summary-row">
              <span>{item.qty}× {item.name}</span>
              <span>{fmt(item.price * item.qty)}</span>
            </div>
          ))}
          <div className="to-summary-row to-summary-total">
            <strong>Total</strong>
            <strong>{fmt(cartTotal)}</strong>
          </div>
        </div>

        {/* Payment mode */}
        <div className="to-section">
          <p className="to-section-title">Cara Pembayaran</p>
          <div className="to-pay-modes">
            {(paymentSetting === 'kasir' || paymentSetting === 'both') && (
              <label className={`to-pay-mode ${paymentMode === 'kasir' ? 'selected' : ''}`}>
                <input type="radio" name="pm" value="kasir" checked={paymentMode === 'kasir'}
                  onChange={() => { setPaymentMode('kasir'); setSelectedPayment(''); }} />
                <Banknote size={22} />
                <div>
                  <strong>Bayar ke Kasir</strong>
                  <p>Bayar saat pesanan siap</p>
                </div>
              </label>
            )}
            {(paymentSetting === 'direct' || paymentSetting === 'both') && (
              <label className={`to-pay-mode ${paymentMode === 'direct' ? 'selected' : ''}`}>
                <input type="radio" name="pm" value="direct" checked={paymentMode === 'direct'}
                  onChange={() => setPaymentMode('direct')} />
                <CreditCard size={22} />
                <div>
                  <strong>Bayar di Sini</strong>
                  <p>Pilih metode pembayaran</p>
                </div>
              </label>
            )}
          </div>
        </div>

        {/* Payment method */}
        {paymentMode === 'direct' && paymentMethods.length > 0 && (
          <div className="to-section">
            <p className="to-section-title">Metode Pembayaran</p>
            <div className="to-pay-methods">
              {paymentMethods.map(pm => (
                <label key={pm.id || pm.code} className={`to-pay-method ${selectedPayment === (pm.id || pm.code) ? 'selected' : ''}`}>
                  <input type="radio" name="pmm" value={pm.id || pm.code}
                    checked={selectedPayment === (pm.id || pm.code)}
                    onChange={() => setSelectedPayment(pm.id || pm.code)} />
                  <span>{pm.name}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Note */}
        <div className="to-section">
          <p className="to-section-title">Catatan Pesanan <span className="to-optional">Opsional</span></p>
          <textarea className="to-note-input" rows={2}
            placeholder="Catatan untuk dapur/barista..."
            value={orderNote} onChange={e => setOrderNote(e.target.value)} />
        </div>

        {submitError && <div className="to-error-msg">{submitError}</div>}
      </div>

      <div className="to-checkout-foot">
        <motion.button className="to-btn-primary" onClick={onSubmit}
          disabled={submitting || !canSubmit} whileTap={{ scale: 0.97 }}>
          {submitting
            ? <><Loader size={16} className="spin" /> Memproses...</>
            : `Pesan Sekarang — ${fmt(cartTotal)}`}
        </motion.button>
      </div>
    </div>
  );
}
