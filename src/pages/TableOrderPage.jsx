import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Coffee, ShoppingCart, Plus, Minus, X, CheckCircle, Loader,
  CreditCard, Banknote, ChevronDown, ChevronRight, Clock, Receipt, User, FileText, Menu as MenuIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import AuthModal from '../components/member/AuthModal';
import { QRCodeSVG } from 'qrcode.react';
import { generateDynamicQris } from '../lib/qris';
import api from '../lib/api';
import { mediaUrl } from '../lib/utils';
import './TableOrderPage.css';

const CAFE_NAME = 'Café Azzura';
const fmt = (n) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function TableOrderPage() {
  const params = new URLSearchParams(window.location.search);
  let qrToken = params.get('qr');
  let tableParam = params.get('table') || '';
  
  if (qrToken) {
    sessionStorage.setItem('active_qr', qrToken);
    sessionStorage.setItem('active_table', tableParam);
  } else {
    qrToken = sessionStorage.getItem('active_qr');
    tableParam = sessionStorage.getItem('active_table') || '';
  }

  const { user } = useAuth();
  const navigate = useNavigate();
  const [cafeName, setCafeName] = useState('Café Azzura');

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
  const [paymentSetting, setPaymentSetting] = useState('both');
  const [qrisString, setQrisString] = useState(''); // 'kasir'|'direct'|'both'

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
          const val = list.find(s => s.setting_key === 'table_order_payment')?.setting_value
            || d.table_order_payment
            || 'both';
          setPaymentSetting(val);
          setQrisString(list.find(s => s.setting_key === 'qris_string')?.setting_value || '');
          const nameVal = list.find(s => s.setting_key === 'site_name' || s.setting_key === 'cafe_name')?.setting_value || 'Café Azzura';
          setCafeName(nameVal);
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

  const getDiscountedPrice = (product) => {
    if (!product) return 0;
    let p = parseFloat(product.price) || 0;
    let meta = null;
    try { meta = typeof product.meta_data === 'string' ? JSON.parse(product.meta_data) : product.meta_data; } catch(e){}
    if (meta?.promo_voucher) {
      const v = meta.promo_voucher;
      const dv = parseFloat(v.discount_value) || 0;
      if (v.discount_type === 'percent') p = Math.max(0, p - (p * dv / 100));
      else p = Math.max(0, p - dv);
    }
    return p;
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
        
        // Auto-select defaults
        const initialVars = {};
        (data.variant_groups || []).forEach(g => {
          const defs = (g.options || []).filter(o => o.is_default);
          if (defs.length > 0) initialVars[g.id] = defs;
        });
        setVariantSelections(initialVars);
      } catch {
        setVariantData({ variant_groups: [], addon_groups: [] });
      } finally {
        setVariantLoading(false);
      }
    } else {
      addToCart({ cartKey: String(product.id), productId: product.id, name: product.name, price: getDiscountedPrice(product), qty: 1, variants: [], addons: [], note: '' });
    }
  };

  const computedVariantPrice = useMemo(() => {
    if (!variantProduct) return 0;
    let total = getDiscountedPrice(variantProduct);
    Object.values(variantSelections).forEach(arr => {
      (arr || []).forEach(v => {
        if (v?.price_modifier) total += Number(v.price_modifier);
      });
    });
    Object.values(addonSelections).forEach(arr => (arr || []).forEach(a => { if (a?.price) total += Number(a.price) * (a.qty || 1); }));
    return total;
  }, [variantProduct, variantSelections, addonSelections]);

  const confirmVariant = () => {
    // Validate required variant groups
    let missing = null;
    (variantData?.variant_groups || []).forEach(g => {
      if (g.is_required) {
        if (!variantSelections[g.id] || variantSelections[g.id].length === 0) {
          if (!missing) missing = g.name;
        }
      }
    });
    if (missing) {
      alert(`Harap pilih opsi untuk ${missing}`);
      return;
    }

    const vKeys = Object.entries(variantSelections).flatMap(([g, arr]) => (arr || []).map(v => `${g}:${v.id}`)).join('|');
    const aKeys = Object.entries(addonSelections).flatMap(([g, arr]) => (arr || []).map(a => `${g}:${a.id}x${a.qty || 1}`)).join('|');
    addToCart({
      cartKey: `${variantProduct.id}~${vKeys}~${aKeys}~${variantNote}`,
      productId: variantProduct.id,
      name: variantProduct.name,
      price: computedVariantPrice,
      qty: variantQty,
      variants: Object.entries(variantSelections).flatMap(([g, arr]) => (arr || []).map(v => ({ ...v, group_id: Number(g) }))),
      addons: Object.entries(addonSelections).flatMap(([g, arr]) => (arr || []).map(a => ({ ...a, group_id: Number(g) }))),
      note: variantNote,
    });
    setVariantProduct(null);
  };

  // ── Submit order ────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setSubmitError('');
    setSubmitting(true);
    try {
      let uniqueCode = 0;
      if (paymentMode === 'direct' && selectedPayment === 'qris') {
        try {
          const { data: uData } = await api.get('/orders/qris/unique-code');
          uniqueCode = uData.kode_unik || 0;
        } catch(e) {
          uniqueCode = Math.floor(Math.random() * 900) + 100;
        }
      }

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
        voucher_code: cart.reduce((found, item) => {
          if (found) return found;
          const product = products.find(p => p.id === item.productId);
          if (product) {
            let meta = null;
            try { meta = typeof product.meta_data === 'string' ? JSON.parse(product.meta_data) : product.meta_data; } catch(e){}
            if (meta?.promo_voucher?.code) return meta.promo_voucher.code;
          }
          return found;
        }, null),
        items: cart.map(i => ({
          product_id: i.productId,
          quantity: i.qty,
          notes: i.note || '',
          variants: (i.variants || []).map(v => ({ group_id: v.group_id, option_id: v.id })),
          addons: (i.addons || []).map(a => ({ addon_id: a.id, qty: a.qty || 1 })),
        })),
      });
      data.uniqueCode = uniqueCode;
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
    const activeCatObj = categories.find(c => c.id === activeCategory);
    const isPromoTab = activeCatObj && activeCatObj.slug === 'promo';
    
    return products.filter(p => {
      if (p.category_id === activeCategory || p.category?.id === activeCategory) return true;
      if (isPromoTab) {
        let meta = null;
        if (p.meta_data) {
          try { meta = typeof p.meta_data === 'string' ? JSON.parse(p.meta_data) : p.meta_data; } catch(e){}
        }
        if (meta?.promo_end_time) return true;
      }
      return false;
    });
  }, [products, activeCategory, categories]);

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
          <h2>{cafeName}</h2>
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
    const orderObj = orderResult?.order || orderResult || {};
    const orderNum = orderObj.order_number || orderObj.id || '—';
    const isPending = orderObj.payment_status === 'pending';

    return (
      <div className="to-fullscreen to-success">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15 }}>
          {isPending ? <Clock size={72} className="to-success-icon text-amber-500" /> : <CheckCircle size={72} className="to-success-icon" />}
        </motion.div>
        <h2>{isPending ? 'Menunggu Pembayaran' : 'Pesanan Diterima!'}</h2>
        <p className="to-order-num">#{orderNum}</p>
        <p className="to-success-msg">
          {isPending 
            ? 'Silakan selesaikan pembayaran agar pesanan dapat diproses.' 
            : 'Pesanan Anda sedang diproses oleh barista kami.'}
        </p>
        
        {!isPending && (
          <div className="to-success-eta">
            <Clock size={16} />
            <span>Estimasi siap 10–15 menit</span>
          </div>
        )}
        
        {paymentMode === 'kasir' && (
          <div className="to-success-pay-note">
            <Receipt size={16} />
            <span>Silakan bayar ke kasir</span>
          </div>
        )}
        
        {paymentMode === 'direct' && selectedPayment === 'qris' && qrisString && (
          <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'white', padding: '1rem', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#6F4E37', marginBottom: '0.5rem' }}>Scan untuk Bayar Rp {((orderResult?.order?.total || orderResult?.total || 0) + (orderResult?.uniqueCode || 0)).toLocaleString('id')}</span>
            <QRCodeSVG value={generateDynamicQris(qrisString, (orderResult?.order?.total || orderResult?.total || 0) + (orderResult?.uniqueCode || 0))} size={180} level="M" />
            <span style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.5rem', textAlign: 'center' }}>Gunakan aplikasi e-Wallet atau Mobile Banking Anda.</span>
          </div>
        )}
        {paymentMode === 'direct' && selectedPayment === 'qris' && !qrisString && (
          <div className="to-success-pay-note" style={{ background: '#fef2f2', color: '#b91c1c' }}>
            <span>Mohon maaf, QRIS belum dikonfigurasi. Silakan bayar ke kasir.</span>
          </div>
        )}
        <motion.button
          className="to-btn-primary"
          style={{ marginTop: '2rem', maxWidth: '280px', flex: '0 0 auto', padding: '14px 32px' }}
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

      {/* ── Bottom Navigation ── */}
      <div className="to-bottom-nav">
        <div className="to-bottom-item active">
          <MenuIcon size={20} />
          <span>Menu</span>
        </div>
        <div className="to-bottom-item" onClick={() => navigate('/member/orders')}>
          <FileText size={20} />
          <span>Transaksi</span>
        </div>
        <div className="to-bottom-item" onClick={() => navigate('/member/profile')}>
          <User size={20} />
          <span>Profile</span>
        </div>
      </div>

      {/* ── Header ── */}
      <header className="to-header">
        <div className="to-header-brand">
          <Coffee size={22} />
          <span>{cafeName}</span>
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
        {filtered.map(product => {
          let meta = null;
          if (product.meta_data) {
            try { meta = typeof product.meta_data === 'string' ? JSON.parse(product.meta_data) : product.meta_data; } catch(e) {}
          }
          const isPromo = !!meta?.promo_end_time;

          return (
          <motion.div
            key={product.id}
            className={`to-card ${product.stock === 0 ? 'to-card-sold' : ''} ${isPromo ? 'to-card-promo' : ''}`}
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
              
              {isPromo && (
                <div className="to-promo-info">
                  <div className="to-promo-time">
                    <Clock size={12} />
                    <span>Berakhir: {new Date(meta.promo_end_time).toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  {meta.promo_rules && (
                    <div className="to-promo-rules">
                      * {meta.promo_rules}
                    </div>
                  )}
                </div>
              )}

              <div className="to-card-footer">
                <span className="to-card-price">
                  {getDiscountedPrice(product) < parseFloat(product.price) ? (
                    <>
                      <span style={{ textDecoration: 'line-through', color: '#999', fontSize: '0.8em', marginRight: '4px' }}>{fmt(product.price)}</span>
                      {fmt(getDiscountedPrice(product))}
                    </>
                  ) : fmt(product.price)}
                </span>
                {product.stock === 0
                  ? <span className="to-card-sold-badge">Habis</span>
                  : <span className="to-card-add"><Plus size={14} /></span>
                }
              </div>
            </div>
          </motion.div>
        )})}
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
                        {group.is_required ? <span className="to-required">Wajib</span> : <span className="to-optional">Opsional</span>}
                      </p>
                      <div className="to-options">
                        {(group.options || []).map(opt => {
                          const curArr = variantSelections[group.id] || [];
                          const checked = curArr.some(v => v.id === opt.id);
                          const isMulti = group.max_select > 1 || group.max_select === null || group.max_select === 0;
                          return (
                            <label key={opt.id} className={`to-option ${checked ? 'selected' : ''}`}>
                              <input type={isMulti ? "checkbox" : "radio"} name={isMulti ? undefined : `vg-${group.id}`}
                                checked={checked}
                                readOnly
                                onClick={(e) => {
                                  // For radio buttons, prevent default to handle the toggle ourselves
                                  if (!isMulti && !group.is_required && checked) {
                                    e.preventDefault();
                                  }
                                  setVariantSelections(p => {
                                    const cur = p[group.id] || [];
                                    if (isMulti) {
                                      if (checked) return { ...p, [group.id]: cur.filter(v => v.id !== opt.id) };
                                      if (group.max_select && cur.length >= group.max_select) return p;
                                      return { ...p, [group.id]: [...cur, opt] };
                                    } else {
                                      if (!group.is_required && checked) return { ...p, [group.id]: [] };
                                      return { ...p, [group.id]: [opt] };
                                    }
                                  });
                                }}
                              />
                              <span className="to-option-name">{opt.name}</span>
                              {Number(opt.price_modifier) > 0 && <span className="to-option-price">+{fmt(opt.price_modifier)}</span>}
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  {(variantData?.addon_groups || []).map(group => (
                    <div key={group.id} className="to-opt-group">
                      <p className="to-opt-group-title">
                        {group.name}
                        {group.is_required ? <span className="to-required">Wajib</span> : <span className="to-optional">Opsional</span>}
                      </p>
                      <div className="to-options">
                        {(group.addons || []).map(addon => {
                          const currentAddons = addonSelections[group.id] || [];
                          const addonData = currentAddons.find(a => a.id === addon.id);
                          const qty = addonData ? addonData.qty : 0;
                          return (
                            <div key={addon.id} className="to-addon-row" style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', border: '1px solid rgba(111,78,55,0.2)', borderRadius: '12px', background: qty > 0 ? 'var(--cafe-brown, #6F4E37)' : '#fff', color: qty > 0 ? '#fff' : 'inherit' }}>
                              <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span className="to-option-name" style={{ fontWeight: '500' }}>{addon.name}</span>
                                {Number(addon.price) > 0 && <span className="to-option-price" style={{ fontSize: '11px', color: qty > 0 ? '#ffedd5' : '#16a34a', fontWeight: '600' }}>+ {fmt(addon.price)}</span>}
                              </div>
                              {qty === 0 ? (
                                <button type="button" onClick={() => setAddonSelections(p => {
                                  const cur = p[group.id] || [];
                                  return { ...p, [group.id]: [...cur, { ...addon, qty: 1 }] };
                                })} style={{ padding: '4px 10px', fontSize: '12px', borderRadius: '20px', background: 'rgba(111,78,55,0.1)', color: 'var(--cafe-brown)', border: 'none', fontWeight: 'bold' }}>Tambah</button>
                              ) : (
                                <div className="to-qty-ctrl sm" style={{ background: '#fff', borderRadius: '20px', display: 'flex', alignItems: 'center', padding: '2px', gap: '4px' }}>
                                  <button type="button" className="to-qty-btn sm" style={{ color: 'var(--cafe-brown)' }} onClick={() => setAddonSelections(p => {
                                    const cur = p[group.id] || [];
                                    if (qty === 1) return { ...p, [group.id]: cur.filter(a => a.id !== addon.id) };
                                    return { ...p, [group.id]: cur.map(a => a.id === addon.id ? { ...a, qty: qty - 1 } : a) };
                                  })}><Minus size={12} /></button>
                                  <span className="to-qty-val" style={{ color: 'var(--cafe-brown)', minWidth: '16px', textAlign: 'center' }}>{qty}</span>
                                  <button type="button" className="to-qty-btn sm" style={{ color: 'var(--cafe-brown)' }} onClick={() => setAddonSelections(p => {
                                    const cur = p[group.id] || [];
                                    const maxQty = addon.max_qty || 99;
                                    if (qty >= maxQty) return p;
                                    return { ...p, [group.id]: cur.map(a => a.id === addon.id ? { ...a, qty: qty + 1 } : a) };
                                  })}><Plus size={12} /></button>
                                </div>
                              )}
                            </div>
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
                <label key={pm.code || pm.id} className={`to-pay-method ${selectedPayment === (pm.code || pm.id) ? 'selected' : ''}`}>
                  <input type="radio" name="pmm" value={pm.code || pm.id}
                    checked={selectedPayment === (pm.code || pm.id)}
                    onChange={() => setSelectedPayment(pm.code || pm.id)} />
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
