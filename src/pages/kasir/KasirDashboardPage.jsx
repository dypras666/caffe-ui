import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Coffee, ClipboardList, PlusCircle, LogOut, RefreshCw, Loader,
  Search, X, Minus, Plus, Check, CreditCard, ArrowLeft, User,
  WifiOff, Wifi, Clock, ChevronRight, Receipt, Tag, UserCheck,
  DollarSign, TrendingUp, PackageOpen,
} from 'lucide-react';
import api from '../../lib/api';
import { getQueue, enqueue, dequeue, saveCache, loadCache } from '../../lib/offline';
import '../member/member.css';
import './kasir.css';

const STATUS_MAP = {
  pending:    { label: 'Menunggu',  cls: 'status-pending'   },
  preparing:  { label: 'Diproses', cls: 'status-preparing' },
  ready:      { label: 'Siap',     cls: 'status-ready'     },
  completed:  { label: 'Selesai',  cls: 'status-completed' },
  cancelled:  { label: 'Batal',    cls: 'status-cancelled' },
};

const PAY_STATUS_MAP = {
  pending: { label: 'Belum Bayar', cls: 'pay-unpaid'  },
  paid:    { label: 'Lunas',       cls: 'pay-paid'    },
  partial: { label: 'DP',          cls: 'pay-unpaid'  },
};

// ─── Variant / Addon config logic (shared) ──────────────────────
function calcConfigPrice(product, groups, selectedVariants) {
  if (!product) return 0;
  let base = Number(product.price || 0);
  groups.forEach(g => {
    const optId = selectedVariants[g.id];
    if (optId) {
      const opt = g.options?.find(o => o.id === optId);
      if (opt) base += Number(opt.price_modifier || 0);
    }
  });
  return base;
}

function calcAddonTotal(addonGroups, selectedAddons) {
  let total = 0;
  Object.entries(selectedAddons).forEach(([addonId, qty]) => {
    if (!qty) return;
    for (const ag of addonGroups) {
      const addon = ag.addons?.find(a => a.id === Number(addonId));
      if (addon) total += Number(addon.price) * qty;
    }
  });
  return total;
}

// ─── ProductConfigModal ──────────────────────────────────────────
function ProductConfigModal({ product, onClose, onConfirm }) {
  const [loading, setLoading]               = useState(true);
  const [groups, setGroups]                 = useState([]);
  const [addonGroups, setAddonGroups]       = useState([]);
  const [selectedVariants, setSelectedVariants] = useState({});
  const [selectedAddons, setSelectedAddons] = useState({});

  useEffect(() => {
    let active = true;
    if (!product.has_variants && !product.has_addons) {
      if (active) setLoading(false);
      return;
    }
    setLoading(true);
    api.get(`/products/${product.id}`).then(({ data }) => {
      if (!active) return;
      const p = data.product || data;
      const vg = p.variant_groups || [];
      const ag = p.addon_groups || [];
      setGroups(vg);
      setAddonGroups(ag);
      const defaults = {};
      vg.forEach(g => {
        const def = g.options?.find(o => o.is_default) || g.options?.[0];
        if (def) defaults[g.id] = def.id;
      });
      setSelectedVariants(defaults);
      setSelectedAddons({});
    }).catch(() => {
      alert('Gagal memuat detail produk');
      onClose();
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [product.id, product.has_variants, product.has_addons]);

  const unitPrice    = calcConfigPrice(product, groups, selectedVariants);
  const addonsTotal  = calcAddonTotal(addonGroups, selectedAddons);

  const handleConfirm = () => {
    const addons = [];
    Object.entries(selectedAddons).forEach(([addonId, qty]) => {
      if (!qty) return;
      for (const ag of addonGroups) {
        const addon = ag.addons?.find(a => a.id === Number(addonId));
        if (addon) addons.push({ addon_id: Number(addonId), qty });
      }
    });
    const variants = Object.entries(selectedVariants)
      .filter(([, optId]) => optId)
      .map(([groupId, optId]) => ({ group_id: Number(groupId), option_id: optId }));
    onConfirm({ unitPrice, variants, addons });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{product.name}</h3>
          <button className="icon-btn" onClick={onClose}><X size={20} /></button>
        </div>

        {loading ? (
          <div className="member-loading"><Loader size={24} className="spin" /></div>
        ) : (
          <div>
            <div className="config-price">
              Rp {(unitPrice + addonsTotal).toLocaleString('id-ID')}
            </div>

            {groups.map(group => (
              <div key={group.id} className="config-group">
                <label className="config-group-label">
                  {group.name}{group.is_required ? ' *' : ''}
                </label>
                <div className="chip-row">
                  {(group.options || []).map(opt => (
                    <button
                      key={opt.id}
                      className={`chip ${selectedVariants[group.id] === opt.id ? 'selected' : ''}`}
                      onClick={() => setSelectedVariants(prev => ({ ...prev, [group.id]: opt.id }))}
                    >
                      {opt.name}
                      {Number(opt.price_modifier) !== 0 && (
                        <span style={{ color: Number(opt.price_modifier) > 0 ? '#27AE60' : '#E74C3C', marginLeft: 4 }}>
                          {Number(opt.price_modifier) > 0 ? '+' : ''}{Number(opt.price_modifier).toLocaleString('id-ID')}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {addonGroups.map(group => (
              <div key={group.id} className="config-group">
                <label className="config-group-label">{group.name}</label>
                {(group.addons || []).map(addon => {
                  const qty = selectedAddons[addon.id] || 0;
                  return (
                    <div key={addon.id} className="addon-row">
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>{addon.name}</div>
                        <div style={{ fontSize: 11, color: '#9B8B7A' }}>
                          +Rp {Number(addon.price).toLocaleString('id-ID')}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {qty > 0 && (
                          <>
                            <button className="icon-btn" onClick={() => setSelectedAddons(p => {
                              const n = (p[addon.id] || 0) - 1;
                              return { ...p, [addon.id]: n > 0 ? n : 0 };
                            })}>
                              <Minus size={14} />
                            </button>
                            <span style={{ fontWeight: 700 }}>{qty}</span>
                          </>
                        )}
                        <button className="icon-btn" onClick={() => setSelectedAddons(p => ({
                          ...p, [addon.id]: (p[addon.id] || 0) + 1,
                        }))}>
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}

            <button className="btn-cafe" onClick={handleConfirm} style={{ marginTop: 8 }}>
              <Check size={16} /> Tambahkan ke Pesanan
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Root ────────────────────────────────────────────────────────
export default function KasirDashboardPage() {
  const navigate = useNavigate();
  const [user] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cafe_member_user')); } catch { return null; }
  });
  const [tab, setTab]                     = useState('orders');
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [online, setOnline]               = useState(navigator.onLine);
  const [syncStatus, setSyncStatus]       = useState('idle'); // idle | syncing | done
  const [queueCount, setQueueCount]       = useState(() => getQueue().length);

  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'kasir')) {
      navigate('/kasir/login');
    }
  }, [user, navigate]);

  // Online/offline listeners
  useEffect(() => {
    const handleOnline  = () => { setOnline(true); };
    const handleOffline = () => setOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto-sync queue when online
  useEffect(() => {
    if (!online) return;
    const q = getQueue();
    if (q.length === 0) return;
    setSyncStatus('syncing');
    (async () => {
      for (const entry of q) {
        const { _offlineId, _queuedAt, ...payload } = entry;
        try {
          await api.post('/orders', payload);
          dequeue(_offlineId);
          setQueueCount(getQueue().length);
        } catch (err) {
          // Keep in queue if still failing
          console.warn('Sync failed for', _offlineId, err?.response?.data?.error);
        }
      }
      setSyncStatus('done');
      setTimeout(() => setSyncStatus('idle'), 3000);
    })();
  }, [online]);

  const handleLogout = () => {
    localStorage.removeItem('cafe_member_token');
    localStorage.removeItem('cafe_member_user');
    navigate('/kasir/login');
  };

  if (!user || (user.role !== 'admin' && user.role !== 'kasir')) return null;

  const tabs = [
    { key: 'orders',    icon: <ClipboardList size={22} />, label: 'Pesanan'  },
    { key: 'new-order', icon: <PlusCircle size={22} />,    label: 'Baru'     },
    { key: 'shift',     icon: <Clock size={22} />,          label: 'Shift'    },
  ];

  return (
    <div className="member-page">
      {/* Header */}
      <div className="member-header">
        <div className="member-header-logo">
          <Coffee size={20} />
          <span>Kasir — {user.name}</span>
        </div>
        <div className="member-header-right">
          {!online ? (
            <div className="offline-badge"><WifiOff size={12} /> Offline{queueCount > 0 ? ` (${queueCount})` : ''}</div>
          ) : syncStatus === 'syncing' ? (
            <div className="sync-badge"><Loader size={12} className="spin" /> Syncing…</div>
          ) : syncStatus === 'done' ? (
            <div className="sync-badge ok"><Wifi size={12} /> Tersinkron</div>
          ) : null}
          <span className="member-header-name">
            {user.branch_id ? `Cab. #${user.branch_id}` : ''}
          </span>
          <button onClick={handleLogout} className="member-notif-btn" title="Logout">
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="member-content">
        {editingOrderId ? (
          <EditOrderTab
            user={user}
            orderId={editingOrderId}
            onBack={() => setEditingOrderId(null)}
            onSaved={() => setEditingOrderId(null)}
          />
        ) : tab === 'orders' ? (
          <OrderListTab user={user} onEditOrder={setEditingOrderId} />
        ) : tab === 'new-order' ? (
          <NewOrderTab
            user={user}
            online={online}
            onBack={() => setTab('orders')}
            onCreated={() => {
              setQueueCount(getQueue().length);
              setTab('orders');
            }}
          />
        ) : tab === 'shift' ? (
          <ShiftTab user={user} />
        ) : null}
      </div>

      {/* Bottom nav */}
      {!editingOrderId && (
        <div className="member-bottom-nav">
          {tabs.map(t => (
            <button
              key={t.key}
              className={`member-nav-tab ${tab === t.key ? 'active' : ''}`}
              onClick={() => setTab(t.key)}
            >
              {t.icon}
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── OrderListTab ────────────────────────────────────────────────
function OrderListTab({ user, onEditOrder }) {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying]   = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [filter, setFilter]   = useState('unpaid');
  const [search, setSearch]   = useState('');
  const [payMethods, setPayMethods] = useState(() => loadCache('pay_methods') || []);
  const [payModal, setPayModal] = useState(null); // orderId
  const [selectedMethod, setSelectedMethod] = useState('cash');

  const fetchPayMethods = useCallback(async () => {
    try {
      const { data } = await api.get('/payments/methods');
      const active = (data.methods || []).filter(m => m.is_active);
      setPayMethods(active);
      saveCache('pay_methods', active);
    } catch {}
  }, []);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: 100 };
      if (filter === 'unpaid')    params.payment_status = 'pending';
      else if (filter === 'paid') params.payment_status = 'paid';
      else if (filter === 'completed') {
        params.order_status = 'completed';
        params.payment_status = 'paid';
      }
      if (user.branch_id) params.branch_id = user.branch_id;
      const { data } = await api.get('/orders', { params });
      const rows = data.orders || [];
      setOrders(rows);
      saveCache('orders_' + filter, rows);
    } catch {
      const cached = loadCache('orders_' + filter);
      if (cached) setOrders(cached);
    } finally {
      setLoading(false);
    }
  }, [filter, user.branch_id]);

  useEffect(() => { fetchPayMethods(); fetchOrders(); }, [fetchPayMethods, fetchOrders]);

  const handleOpenPayModal = (orderId) => {
    setSelectedMethod('cash');
    setPayModal(orderId);
  };

  const handlePay = async () => {
    if (!payModal) return;
    setPaying(payModal);
    try {
      await api.put(`/orders/${payModal}/payment`, {
        payment_status: 'paid',
        payment_method: selectedMethod,
      });
      setPayModal(null);
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.error || 'Gagal bayar');
    } finally {
      setPaying(null);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdatingStatus(orderId);
    try {
      await api.put(`/orders/${orderId}/status`, { order_status: newStatus });
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.error || 'Gagal update status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const filtered = orders.filter(o => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      o.order_number?.toLowerCase().includes(q) ||
      o.customer_name?.toLowerCase().includes(q) ||
      o.table_number?.toLowerCase().includes(q)
    );
  });

  const queuedOrders = getQueue();

  return (
    <div>
      <div className="list-header-row">
        <h2 className="section-title" style={{ margin: 0 }}>
          <ClipboardList size={18} /> Daftar Pesanan
        </h2>
        <button onClick={fetchOrders} className="icon-btn" title="Refresh">
          <RefreshCw size={18} className={loading ? 'spin' : ''} />
        </button>
      </div>

      <div className="member-login-tabs" style={{ marginBottom: 12 }}>
        {[
          { key: 'unpaid',    label: 'Belum Bayar' },
          { key: 'paid',      label: 'Lunas'       },
          { key: 'completed', label: 'Selesai'     },
        ].map(f => (
          <button
            key={f.key}
            className={`member-login-tab ${filter === f.key ? 'active' : ''}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="form-input-icon" style={{ marginBottom: 12 }}>
        <Search size={16} />
        <input
          className="member-input"
          style={{ paddingLeft: 38 }}
          placeholder="Cari no. order / nama / meja..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Offline queued orders */}
      {queuedOrders.length > 0 && (
        <div className="offline-queue-banner">
          <WifiOff size={14} />
          <span>{queuedOrders.length} pesanan offline menunggu sinkronisasi</span>
        </div>
      )}

      {loading ? (
        <div className="member-loading"><Loader size={24} className="spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="member-empty"><ClipboardList size={40} /><p>Tidak ada pesanan</p></div>
      ) : (
        filtered.map(order => (
          <OrderCard
            key={order.id}
            order={order}
            paying={paying}
            updatingStatus={updatingStatus}
            onOpenPayModal={handleOpenPayModal}
            onEdit={onEditOrder}
            onStatusUpdate={handleStatusUpdate}
          />
        ))
      )}

      {/* Payment method modal */}
      {payModal && (
        <div className="modal-overlay" onClick={() => setPayModal(null)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>
                <CreditCard size={16} /> Pilih Metode Bayar
              </h3>
              <button className="icon-btn" onClick={() => setPayModal(null)}><X size={20} /></button>
            </div>
            <div className="pay-method-grid">
              {payMethods.length === 0 && (
                <button
                  className={`pay-method-btn ${selectedMethod === 'cash' ? 'selected' : ''}`}
                  onClick={() => setSelectedMethod('cash')}
                >
                  <DollarSign size={18} /> Tunai
                </button>
              )}
              {payMethods.map(m => (
                <button
                  key={m.code}
                  className={`pay-method-btn ${selectedMethod === m.code ? 'selected' : ''}`}
                  onClick={() => setSelectedMethod(m.code)}
                >
                  {m.name}
                </button>
              ))}
            </div>
            <button
              className="btn-cafe"
              style={{ marginTop: 16 }}
              onClick={handlePay}
              disabled={!!paying}
            >
              {paying ? <Loader size={16} className="spin" /> : <Check size={16} />}
              Konfirmasi Bayar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function OrderCard({ order, paying, updatingStatus, onOpenPayModal, onEdit, onStatusUpdate }) {
  const payInfo    = PAY_STATUS_MAP[order.payment_status] || { label: 'Belum Bayar', cls: 'pay-unpaid' };
  const statusInfo = STATUS_MAP[order.order_status] || { label: order.order_status, cls: '' };
  const canEdit    = order.order_status === 'pending';

  const NEXT_STATUS = { pending: 'preparing', preparing: 'ready', ready: 'completed' };
  const NEXT_LABEL  = { pending: 'Proses', preparing: 'Siap', ready: 'Selesai' };
  const nextStatus  = NEXT_STATUS[order.order_status];

  return (
    <div className="list-card">
      <div className="list-card-top">
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="list-card-title">{order.order_number || `#${order.id}`}</div>
          <div className="list-card-sub">
            {order.customer_name && <span>{order.customer_name} · </span>}
            {order.table_number  && <span>Meja {order.table_number} · </span>}
            {order.order_type}
          </div>
          <div style={{ marginTop: 6, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <span className={`status-badge ${statusInfo.cls}`}>{statusInfo.label}</span>
            <span className={`status-badge ${payInfo.cls}`}>{payInfo.label}</span>
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div className="list-card-amount">
            Rp {Number(order.total || 0).toLocaleString('id-ID')}
          </div>
          <div style={{ marginTop: 8, display: 'flex', gap: 6, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            {canEdit && (
              <button
                className="btn-cafe-sm"
                style={{ background: 'linear-gradient(135deg, #6F4E37, #2C1810)' }}
                onClick={() => onEdit(order.id)}
              >
                <ClipboardList size={13} /> Edit
              </button>
            )}
            {nextStatus && order.payment_status !== 'paid' && (
              <button
                className="btn-cafe-sm"
                style={{ background: 'linear-gradient(135deg, #2980B9, #1A5276)' }}
                onClick={() => onStatusUpdate(order.id, nextStatus)}
                disabled={updatingStatus === order.id}
              >
                {updatingStatus === order.id
                  ? <Loader size={13} className="spin" />
                  : <ChevronRight size={13} />
                }
                {NEXT_LABEL[order.order_status]}
              </button>
            )}
            {order.payment_status === 'pending' && (
              <button
                className="btn-cafe-sm"
                style={{ background: 'linear-gradient(135deg, #27AE60, #1E8449)' }}
                onClick={() => onOpenPayModal(order.id)}
                disabled={paying === order.id}
              >
                {paying === order.id ? <Loader size={13} className="spin" /> : <CreditCard size={13} />}
                Bayar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── NewOrderTab ─────────────────────────────────────────────────
function NewOrderTab({ user, online, onBack, onCreated }) {
  const [step, setStep]         = useState('form');
  const [tables, setTables]     = useState(() => loadCache('tables') || []);
  const [products, setProducts] = useState(() => loadCache('products') || []);
  const [categories, setCategories] = useState(() => loadCache('categories') || []);
  const [payMethods, setPayMethods] = useState(() => loadCache('pay_methods') || []);
  const [loading, setLoading]   = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [selectedTable, setSelectedTable]   = useState(null);
  const [customerName, setCustomerName]     = useState('');
  const [customerPhone, setCustomerPhone]   = useState('');
  const [orderType, setOrderType]           = useState('dine-in');
  const [selectedPayMethod, setSelectedPayMethod] = useState('cash');
  const [voucherCode, setVoucherCode]       = useState('');
  const [notes, setNotes]                   = useState('');
  const [items, setItems]                   = useState([]);
  const [searchProd, setSearchProd]         = useState('');
  const [activeCategory, setActiveCategory] = useState(null);

  // Member search
  const [memberSearch, setMemberSearch]     = useState('');
  const [memberResult, setMemberResult]     = useState(null);
  const [memberLoading, setMemberLoading]   = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  const [configProduct, setConfigProduct]   = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const params = { status: 'active', limit: 300 };
        if (user.branch_id) params.branch_id = user.branch_id;
        const [prodRes, catRes, tableRes, payRes] = await Promise.allSettled([
          api.get('/products', { params }),
          api.get('/categories', { params: { limit: 50 } }),
          api.get('/tables', { params: user.branch_id ? { branch_id: user.branch_id } : {} }),
          api.get('/payments/methods'),
        ]);
        if (prodRes.status === 'fulfilled') {
          const p = prodRes.value.data.products || [];
          setProducts(p); saveCache('products', p);
        }
        if (catRes.status === 'fulfilled') {
          const c = catRes.value.data.categories || [];
          setCategories(c); saveCache('categories', c);
        }
        if (tableRes.status === 'fulfilled') {
          const t = tableRes.value.data.tables || [];
          setTables(t); saveCache('tables', t);
        }
        if (payRes.status === 'fulfilled') {
          const m = (payRes.value.data.methods || []).filter(x => x.is_active);
          setPayMethods(m); saveCache('pay_methods', m);
        }
      } catch {}
      finally { setLoading(false); }
    };
    loadData();
  }, [user.branch_id]);

  const searchMember = async () => {
    if (!memberSearch.trim()) return;
    setMemberLoading(true);
    setMemberResult(null);
    try {
      const { data } = await api.get('/users/search-member', {
        params: { q: memberSearch },
      });
      setMemberResult(data.users?.[0] || null);
    } catch {
      setMemberResult(null);
    } finally {
      setMemberLoading(false);
    }
  };

  const addItem = (product, config) => {
    const { unitPrice, variants = [], addons = [] } = config;
    setItems(prev => {
      const existing = prev.find(i =>
        i.product_id === product.id &&
        JSON.stringify(i.variants) === JSON.stringify(variants) &&
        JSON.stringify(i.addons) === JSON.stringify(addons)
      );
      if (existing) {
        return prev.map(i => i === existing ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, {
        product_id: product.id,
        name: product.name,
        price: unitPrice,
        quantity: 1,
        variants,
        addons,
      }];
    });
  };

  const handleProductClick = (product) => {
    if (!product.has_variants && !product.has_addons) {
      addItem(product, { unitPrice: Number(product.price) });
    } else {
      setConfigProduct(product);
    }
  };

  const updateQty = (idx, delta) => {
    setItems(prev =>
      prev
        .map((i, j) => j === idx ? { ...i, quantity: i.quantity + delta } : i)
        .filter(i => i.quantity > 0)
    );
  };

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const filteredProducts = products.filter(p => {
    const matchSearch = !searchProd || p.name.toLowerCase().includes(searchProd.toLowerCase());
    const matchCat    = !activeCategory || p.category_id === activeCategory;
    return matchSearch && matchCat;
  });

  const handleCreateOrder = async () => {
    if (items.length === 0) { alert('Pilih minimal 1 produk'); return; }
    setSubmitting(true);
    const payload = {
      order_type:      orderType,
      payment_method:  selectedPayMethod || 'cash',
      table_id:        selectedTable?.id || null,
      table_number:    selectedTable?.table_number || null,
      customer_name:   customerName || null,
      customer_phone:  customerPhone || null,
      notes:           notes || null,
      voucher_code:    voucherCode || null,
      member_id:       selectedMember?.id || null,
      branch_id:       user.branch_id || null,
      items: items.map(i => ({
        product_id: i.product_id,
        quantity:   i.quantity,
        ...(i.variants?.length ? { variants: i.variants } : {}),
        ...(i.addons?.length   ? { addons: i.addons }     : {}),
      })),
    };

    if (!online) {
      enqueue(payload);
      alert('Pesanan disimpan offline. Akan tersinkron saat online.');
      setSubmitting(false);
      onCreated();
      return;
    }

    try {
      await api.post('/orders', payload);
      onCreated();
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Gagal membuat pesanan';
      if (!online || err.code === 'ERR_NETWORK') {
        enqueue(payload);
        alert('Jaringan terputus. Pesanan disimpan offline.');
        onCreated();
      } else {
        alert(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const availableTables = tables.filter(t => t.status === 'available' || t.status === 'occupied');

  if (step === 'form') {
    return (
      <div>
        <div className="list-header-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={onBack} className="icon-btn"><ArrowLeft size={18} /></button>
            <h2 className="section-title" style={{ margin: 0 }}>
              <PlusCircle size={18} /> Pesanan Baru
            </h2>
          </div>
          {!online && <div className="offline-badge"><WifiOff size={12} /> Offline</div>}
        </div>

        {/* Member lookup */}
        <div className="member-card" style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#6F4E37', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <UserCheck size={14} /> Cari Member (opsional)
          </div>
          {selectedMember ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{selectedMember.name}</div>
                <div style={{ fontSize: 12, color: '#9B8B7A' }}>
                  {selectedMember.member_number} · Rp {Number(selectedMember.balance || 0).toLocaleString('id-ID')}
                </div>
              </div>
              <button className="icon-btn" onClick={() => setSelectedMember(null)}><X size={16} /></button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <div className="form-input-icon" style={{ flex: 1 }}>
                <Search size={14} />
                <input
                  className="member-input"
                  style={{ paddingLeft: 34, padding: '10px 10px 10px 34px' }}
                  placeholder="No. HP / nama / member..."
                  value={memberSearch}
                  onChange={e => setMemberSearch(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && searchMember()}
                />
              </div>
              <button className="btn-cafe-sm" onClick={searchMember} disabled={memberLoading}>
                {memberLoading ? <Loader size={13} className="spin" /> : <Search size={13} />}
              </button>
            </div>
          )}
          {!selectedMember && memberResult && (
            <div className="member-search-result" onClick={() => {
              setSelectedMember(memberResult);
              setCustomerName(memberResult.name);
              setCustomerPhone(memberResult.phone || '');
              setMemberResult(null);
              setMemberSearch('');
            }}>
              <User size={14} />
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{memberResult.name}</div>
                <div style={{ fontSize: 11, color: '#9B8B7A' }}>{memberResult.member_number} · {memberResult.phone}</div>
              </div>
              <ChevronRight size={14} style={{ marginLeft: 'auto' }} />
            </div>
          )}
          {!selectedMember && memberSearch && !memberLoading && memberResult === null && (
            <div style={{ fontSize: 12, color: '#9B8B7A', marginTop: 6 }}>
              Member tidak ditemukan.{' '}
              <button
                style={{ background: 'none', border: 'none', color: '#6F4E37', fontWeight: 600, cursor: 'pointer', padding: 0, fontSize: 12 }}
                onClick={async () => {
                  if (!customerName.trim()) { alert('Isi nama pelanggan dulu'); return; }
                  try {
                    const { data } = await api.post('/users/register-quick', {
                      name: customerName,
                      phone: memberSearch.match(/^08/) ? memberSearch : customerPhone,
                    });
                    setSelectedMember(data.user);
                  } catch (err) { alert(err.response?.data?.error || 'Gagal daftar member'); }
                }}
              >
                Daftar Member Baru
              </button>
            </div>
          )}
        </div>

        {/* Customer info */}
        <div className="member-form-group">
          <label>Nama Pelanggan (opsional)</label>
          <div className="form-input-icon">
            <User size={16} />
            <input
              className="member-input"
              style={{ paddingLeft: 38 }}
              placeholder="Nama pelanggan"
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
            />
          </div>
        </div>

        <div className="member-form-group">
          <label>No. HP (opsional)</label>
          <input
            className="member-input"
            placeholder="08xxxxxxxxxx"
            value={customerPhone}
            onChange={e => setCustomerPhone(e.target.value)}
          />
        </div>

        {/* Order type */}
        <div className="member-form-group">
          <label>Tipe Pesanan</label>
          <div className="member-login-tabs" style={{ marginBottom: 0 }}>
            {['dine-in', 'takeaway'].map(t => (
              <button
                key={t}
                className={`member-login-tab ${orderType === t ? 'active' : ''}`}
                onClick={() => setOrderType(t)}
              >
                {t === 'dine-in' ? 'Makan di Tempat' : 'Bungkus'}
              </button>
            ))}
          </div>
        </div>

        {/* Table selector (dine-in) */}
        {orderType === 'dine-in' && (
          <div className="member-form-group">
            <label>Pilih Meja</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {availableTables.map(table => (
                <button
                  key={table.id}
                  onClick={() => setSelectedTable(prev => prev?.id === table.id ? null : table)}
                  className={`table-chip ${selectedTable?.id === table.id ? 'selected' : ''}`}
                >
                  {table.name || table.table_number}
                  {table.status === 'occupied' && <div style={{ fontSize: 10, fontWeight: 400 }}>Terisi</div>}
                </button>
              ))}
              {availableTables.length === 0 && (
                <div style={{ gridColumn: '1/-1', fontSize: 13, color: '#9B8B7A', padding: '8px 0' }}>
                  Tidak ada meja tersedia
                </div>
              )}
            </div>
          </div>
        )}

        {/* Payment method */}
        <div className="member-form-group">
          <label>Metode Pembayaran</label>
          {payMethods.length > 0 ? (
            <div className="chip-row">
              {payMethods.map(m => (
                <button
                  key={m.code}
                  className={`chip ${selectedPayMethod === m.code ? 'selected' : ''}`}
                  onClick={() => setSelectedPayMethod(m.code)}
                >
                  {m.name}
                </button>
              ))}
            </div>
          ) : (
            <div className="chip-row">
              {['cash', 'qris', 'transfer'].map(m => (
                <button
                  key={m}
                  className={`chip ${selectedPayMethod === m ? 'selected' : ''}`}
                  onClick={() => setSelectedPayMethod(m)}
                >
                  {m.toUpperCase()}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Voucher */}
        <div className="member-form-group">
          <label><Tag size={12} /> Kode Voucher (opsional)</label>
          <input
            className="member-input"
            placeholder="KODE-VOUCHER"
            value={voucherCode}
            onChange={e => setVoucherCode(e.target.value.toUpperCase())}
          />
        </div>

        {/* Notes */}
        <div className="member-form-group">
          <label>Catatan Pesanan</label>
          <textarea
            className="member-textarea"
            placeholder="Catatan untuk dapur…"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={2}
          />
        </div>

        <button className="btn-cafe" onClick={() => setStep('products')}>
          Lanjut Pilih Menu <ChevronRight size={16} />
        </button>
      </div>
    );
  }

  // Products step
  return (
    <div>
      <div className="list-header-row">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={() => setStep('form')} className="icon-btn"><ArrowLeft size={18} /></button>
          <h2 className="section-title" style={{ margin: 0 }}>Pilih Menu</h2>
        </div>
        {!online && <div className="offline-badge"><WifiOff size={12} /> Offline</div>}
      </div>

      {/* Category filter */}
      {categories.length > 0 && (
        <div className="cat-scroll">
          <button
            className={`cat-chip ${!activeCategory ? 'selected' : ''}`}
            onClick={() => setActiveCategory(null)}
          >
            Semua
          </button>
          {categories.map(c => (
            <button
              key={c.id}
              className={`cat-chip ${activeCategory === c.id ? 'selected' : ''}`}
              onClick={() => setActiveCategory(c.id === activeCategory ? null : c.id)}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      <div className="form-input-icon" style={{ marginBottom: 12 }}>
        <Search size={16} />
        <input
          className="member-input"
          style={{ paddingLeft: 38 }}
          placeholder="Cari menu..."
          value={searchProd}
          onChange={e => setSearchProd(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="member-loading"><Loader size={24} className="spin" /></div>
      ) : (
        <div className="product-grid">
          {filteredProducts.map(prod => {
            const inCart = items.find(i => i.product_id === prod.id);
            return (
              <button
                key={prod.id}
                onClick={() => handleProductClick(prod)}
                className={`product-card ${inCart ? 'in-cart' : ''}`}
              >
                <div className="product-name">{prod.name}</div>
                <div className="product-price">Rp {Number(prod.price).toLocaleString('id-ID')}</div>
                {(prod.has_variants || prod.has_addons) && (
                  <div className="product-variant-hint">+ varian</div>
                )}
                {inCart && (
                  <div className="product-qty-badge">{inCart.quantity}×</div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Cart summary */}
      {items.length > 0 && (
        <div className="member-card" style={{ marginTop: 16 }}>
          <div className="list-header-row" style={{ marginBottom: 8 }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>
              Keranjang ({items.reduce((s, i) => s + i.quantity, 0)} item)
            </h3>
          </div>
          {items.map((item, idx) => (
            <div key={`${item.product_id}-${idx}`} className="cart-row">
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 1 }}>{item.name}</div>
                <div style={{ fontSize: 11, color: '#9B8B7A' }}>
                  Rp {item.price.toLocaleString('id-ID')} × {item.quantity}
                  {' = '}
                  Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                <button className="icon-btn" onClick={() => updateQty(idx, -1)}><Minus size={14} /></button>
                <span style={{ fontWeight: 700, fontSize: 14, minWidth: 22, textAlign: 'center' }}>
                  {item.quantity}
                </span>
                <button className="icon-btn" onClick={() => updateQty(idx, 1)}><Plus size={14} /></button>
              </div>
            </div>
          ))}
          <div className="cart-total">
            <span>Total</span>
            <span>Rp {subtotal.toLocaleString('id-ID')}</span>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button
          className="btn-cafe-outline"
          style={{ flex: 1, justifyContent: 'center' }}
          onClick={() => setStep('form')}
        >
          Kembali
        </button>
        <button
          className="btn-cafe"
          style={{ flex: 2 }}
          onClick={handleCreateOrder}
          disabled={submitting || items.length === 0}
        >
          {submitting
            ? <><Loader size={16} className="spin" /> Membuat…</>
            : !online
            ? <><WifiOff size={16} /> Simpan Offline</>
            : <><Receipt size={16} /> Buat Pesanan</>
          }
        </button>
      </div>

      {/* Product config modal */}
      {configProduct && (
        <ProductConfigModal
          product={configProduct}
          onClose={() => setConfigProduct(null)}
          onConfirm={(config) => {
            addItem(configProduct, config);
            setConfigProduct(null);
          }}
        />
      )}
    </div>
  );
}

// ─── EditOrderTab ────────────────────────────────────────────────
function EditOrderTab({ user, orderId, onBack, onSaved }) {
  const [order, setOrder]       = useState(null);
  const [items, setItems]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [products, setProducts] = useState(() => loadCache('products') || []);
  const [searchProd, setSearchProd] = useState('');
  const [configProduct, setConfigProduct] = useState(null);

  const fetchOrder = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/orders/${orderId}`);
      setOrder(data.order || null);
      setItems((data.order?.items || []).map(i => {
        let variants = [], addons = [];
        try { if (i.variants_selected) variants = JSON.parse(i.variants_selected).map(v => ({ group_id: v.group_id, option_id: v.option_id })); } catch {}
        try { if (i.addons_selected) addons = JSON.parse(i.addons_selected).map(a => ({ addon_id: a.addon_id, qty: a.qty })); } catch {}
        return {
          product_id: i.product_id,
          name:       i.product_name,
          price:      Number(i.unit_price || 0),
          quantity:   i.quantity,
          order_item_id: i.id,
          variants,
          addons,
        };
      }));
    } catch {
      alert('Gagal memuat pesanan');
      onBack();
    } finally {
      setLoading(false);
    }
  }, [orderId, onBack]);

  useEffect(() => { fetchOrder(); }, [fetchOrder]);

  useEffect(() => {
    if (products.length > 0) return;
    const params = { status: 'active', limit: 300 };
    if (user.branch_id) params.branch_id = user.branch_id;
    api.get('/products', { params }).then(({ data }) => {
      const p = data.products || [];
      setProducts(p);
      saveCache('products', p);
    }).catch(() => {});
  }, [user.branch_id]);

  const updateQty = (idx, delta) => {
    setItems(prev =>
      prev.map((i, j) => j === idx ? { ...i, quantity: i.quantity + delta } : i).filter(i => i.quantity > 0)
    );
  };

  const removeItem = (idx) => setItems(prev => prev.filter((_, i) => i !== idx));

  const addItemFromConfig = (product, config) => {
    const { unitPrice, variants = [], addons = [] } = config;
    setItems(prev => [...prev, {
      product_id: product.id,
      name: product.name,
      price: unitPrice,
      quantity: 1,
      variants,
      addons,
    }]);
    setConfigProduct(null);
    setShowAddProduct(false);
  };

  const handleSave = async () => {
    if (items.length === 0) { alert('Pesanan harus memiliki minimal 1 item'); return; }
    setSaving(true);
    try {
      await api.put(`/orders/${orderId}/items`, {
        items: items.map(i => ({
          product_id: i.product_id,
          quantity:   i.quantity,
          ...(i.variants?.length ? { variants: i.variants } : {}),
          ...(i.addons?.length   ? { addons: i.addons }     : {}),
        })),
      });
      onSaved();
    } catch (err) {
      alert(err.response?.data?.error || err.message || 'Gagal menyimpan');
    } finally {
      setSaving(false);
    }
  };

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const filteredProducts = products.filter(p =>
    !searchProd || p.name.toLowerCase().includes(searchProd.toLowerCase())
  );

  if (loading) return <div className="member-loading"><Loader size={24} className="spin" /></div>;

  return (
    <div>
      <div className="list-header-row">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={onBack} className="icon-btn"><ArrowLeft size={18} /></button>
          <h2 className="section-title" style={{ margin: 0 }}>Edit Pesanan</h2>
        </div>
      </div>

      {order && (
        <div className="member-card" style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <span style={{ fontSize: 14, fontWeight: 700 }}>{order.order_number}</span>
            <span className="status-badge status-pending">Pending</span>
          </div>
          <div style={{ fontSize: 12, color: '#9B8B7A' }}>
            {order.customer_name && <span>{order.customer_name} · </span>}
            {order.table_number  && <span>Meja {order.table_number} · </span>}
            {order.order_type}
          </div>
        </div>
      )}

      <div className="member-card" style={{ marginBottom: 12 }}>
        <div className="list-header-row" style={{ marginBottom: 8 }}>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Item ({items.length})</h3>
        </div>
        {items.map((item, idx) => (
          <div key={`${item.product_id}-${idx}`} className="cart-row">
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 13 }}>{item.name}</div>
              <div style={{ fontSize: 11, color: '#9B8B7A' }}>
                Rp {item.price.toLocaleString('id-ID')} × {item.quantity}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
              <button className="icon-btn" onClick={() => updateQty(idx, -1)}><Minus size={14} /></button>
              <span style={{ fontWeight: 700, fontSize: 14, minWidth: 22, textAlign: 'center' }}>{item.quantity}</span>
              <button className="icon-btn" onClick={() => updateQty(idx, 1)}><Plus size={14} /></button>
              <button className="icon-btn" onClick={() => removeItem(idx)} style={{ color: '#E74C3C', marginLeft: 2 }}>
                <X size={14} />
              </button>
            </div>
          </div>
        ))}
        <div className="cart-total">
          <span>Total</span>
          <span>Rp {subtotal.toLocaleString('id-ID')}</span>
        </div>
      </div>

      <button
        className="btn-cafe-outline"
        style={{ width: '100%', justifyContent: 'center', marginBottom: 12 }}
        onClick={() => setShowAddProduct(v => !v)}
      >
        <PlusCircle size={16} /> Tambah Item
      </button>

      {showAddProduct && (
        <div className="member-card" style={{ marginBottom: 12 }}>
          <div className="form-input-icon" style={{ marginBottom: 10 }}>
            <Search size={16} />
            <input
              className="member-input"
              style={{ paddingLeft: 38 }}
              placeholder="Cari menu..."
              value={searchProd}
              onChange={e => setSearchProd(e.target.value)}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, maxHeight: 260, overflowY: 'auto' }}>
            {(searchProd ? filteredProducts : products.slice(0, 40)).map(prod => (
              <button
                key={prod.id}
                onClick={() => {
                  if (!prod.has_variants && !prod.has_addons) {
                    addItemFromConfig(prod, { unitPrice: Number(prod.price) });
                  } else {
                    setConfigProduct(prod);
                  }
                }}
                className="product-card"
              >
                <div className="product-name">{prod.name}</div>
                <div className="product-price">Rp {Number(prod.price).toLocaleString('id-ID')}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn-cafe-outline" style={{ flex: 1, justifyContent: 'center' }} onClick={onBack}>Batal</button>
        <button className="btn-cafe" style={{ flex: 2 }} onClick={handleSave} disabled={saving || items.length === 0}>
          {saving ? <><Loader size={16} className="spin" /> Menyimpan…</> : 'Simpan'}
        </button>
      </div>

      {configProduct && (
        <ProductConfigModal
          product={configProduct}
          onClose={() => setConfigProduct(null)}
          onConfirm={(config) => addItemFromConfig(configProduct, config)}
        />
      )}
    </div>
  );
}

// ─── ShiftTab ────────────────────────────────────────────────────
function ShiftTab({ user }) {
  const [currentShift, setCurrentShift] = useState(null);
  const [loading, setLoading]           = useState(true);
  const [action, setAction]             = useState(null); // 'open' | 'close'
  const [openCash, setOpenCash]         = useState('');
  const [closeCash, setCloseCash]       = useState('');
  const [handoverCash, setHandoverCash] = useState('');
  const [shiftNotes, setShiftNotes]     = useState('');
  const [submitting, setSubmitting]     = useState(false);
  const [summary, setSummary]           = useState(null);

  const fetchCurrentShift = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/shifts/current');
      setCurrentShift(data.shift || null);
    } catch {
      setCurrentShift(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCurrentShift(); }, [fetchCurrentShift]);

  const handleOpenShift = async () => {
    if (!openCash) { alert('Masukkan modal awal'); return; }
    setSubmitting(true);
    try {
      await api.post('/shifts/open', {
        opening_cash: parseFloat(openCash),
        notes: shiftNotes || null,
      });
      setAction(null);
      setOpenCash('');
      setShiftNotes('');
      fetchCurrentShift();
    } catch (err) {
      alert(err.response?.data?.error || 'Gagal buka shift');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseShift = async () => {
    if (!closeCash) { alert('Masukkan kas akhir'); return; }
    setSubmitting(true);
    try {
      const { data } = await api.put(`/shifts/${currentShift.id}/close`, {
        closing_cash: parseFloat(closeCash),
        handover_cash: handoverCash ? parseFloat(handoverCash) : undefined,
        notes: shiftNotes || null,
      });
      setSummary(data.summary);
      setCurrentShift(null);
      setAction(null);
      setCloseCash('');
      setHandoverCash('');
      setShiftNotes('');
    } catch (err) {
      alert(err.response?.data?.error || 'Gagal tutup shift');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="member-loading"><Loader size={24} className="spin" /></div>;

  return (
    <div>
      <div className="list-header-row">
        <h2 className="section-title" style={{ margin: 0 }}>
          <Clock size={18} /> Manajemen Shift
        </h2>
        <button onClick={fetchCurrentShift} className="icon-btn"><RefreshCw size={18} /></button>
      </div>

      {/* Summary after close */}
      {summary && !currentShift && (
        <div className="member-card" style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#27AE60', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Check size={16} /> Shift Ditutup
          </div>
          <div className="shift-summary-grid">
            <ShiftStat label="Total Pesanan"  value={summary.total_orders} />
            <ShiftStat label="Total Omzet"    value={`Rp ${Number(summary.total_revenue).toLocaleString('id-ID')}`} />
            <ShiftStat label="Kas Tunai"      value={`Rp ${Number(summary.cash_revenue).toLocaleString('id-ID')}`} />
            <ShiftStat
              label="Selisih Kas"
              value={`Rp ${Number(summary.cash_difference).toLocaleString('id-ID')}`}
              cls={summary.cash_difference < 0 ? 'negative' : summary.cash_difference > 0 ? 'positive' : ''}
            />
          </div>
          {summary.top_items?.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#6F4E37', marginBottom: 6 }}>
                <TrendingUp size={12} /> Menu Terlaris
              </div>
              {summary.top_items.map((ti, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '3px 0' }}>
                  <span>{ti.product_name}</span>
                  <span style={{ color: '#6F4E37', fontWeight: 600 }}>{ti.qty}×</span>
                </div>
              ))}
            </div>
          )}
          <button className="btn-cafe-outline" style={{ width: '100%', justifyContent: 'center', marginTop: 12 }}
            onClick={() => setSummary(null)}>
            Tutup
          </button>
        </div>
      )}

      {/* Active shift info */}
      {currentShift ? (
        <div className="member-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontWeight: 700, fontSize: 15 }}>{currentShift.shift_number}</span>
            <span className="status-badge status-ready">Aktif</span>
          </div>

          <div className="shift-summary-grid">
            <ShiftStat label="Pesanan"    value={currentShift.live_total_orders ?? 0} />
            <ShiftStat label="Omzet"      value={`Rp ${Number(currentShift.live_total_revenue ?? 0).toLocaleString('id-ID')}`} />
            <ShiftStat label="Tunai"      value={`Rp ${Number(currentShift.live_cash_revenue ?? 0).toLocaleString('id-ID')}`} />
            <ShiftStat label="Exp. Kas"   value={`Rp ${Number(currentShift.live_expected_cash ?? 0).toLocaleString('id-ID')}`} />
          </div>

          <div style={{ fontSize: 12, color: '#9B8B7A', marginBottom: 16 }}>
            Dibuka: {new Date(currentShift.opened_at).toLocaleString('id-ID')} ·
            Modal: Rp {Number(currentShift.opening_cash).toLocaleString('id-ID')}
          </div>

          {action === 'close' ? (
            <div>
              <div className="member-form-group">
                <label>Kas Akhir (hitung uang di laci)</label>
                <input
                  className="member-input"
                  type="number"
                  placeholder="0"
                  value={closeCash}
                  onChange={e => setCloseCash(e.target.value)}
                />
              </div>
              <div className="member-form-group">
                <label>Serah Terima Kas (opsional)</label>
                <input
                  className="member-input"
                  type="number"
                  placeholder="0"
                  value={handoverCash}
                  onChange={e => setHandoverCash(e.target.value)}
                />
              </div>
              <div className="member-form-group">
                <label>Catatan</label>
                <textarea
                  className="member-textarea"
                  rows={2}
                  placeholder="Catatan penutupan..."
                  value={shiftNotes}
                  onChange={e => setShiftNotes(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn-cafe-outline" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setAction(null)}>Batal</button>
                <button className="btn-cafe" style={{ flex: 2, background: 'linear-gradient(135deg, #C0392B, #922B21)' }}
                  onClick={handleCloseShift} disabled={submitting}>
                  {submitting ? <Loader size={16} className="spin" /> : null}
                  Tutup Shift
                </button>
              </div>
            </div>
          ) : (
            <button
              className="btn-cafe"
              style={{ background: 'linear-gradient(135deg, #C0392B, #922B21)' }}
              onClick={() => setAction('close')}
            >
              Tutup Shift
            </button>
          )}
        </div>
      ) : !summary && (
        <div className="member-card">
          <div style={{ textAlign: 'center', padding: '16px 0', marginBottom: 12 }}>
            <PackageOpen size={40} color="#D4A574" style={{ marginBottom: 8 }} />
            <div style={{ fontWeight: 600, color: '#6F4E37' }}>Belum ada shift aktif</div>
            <div style={{ fontSize: 12, color: '#9B8B7A', marginTop: 4 }}>Buka shift untuk mulai menerima pesanan</div>
          </div>

          {action === 'open' ? (
            <div>
              <div className="member-form-group">
                <label>Modal Awal (kas di laci)</label>
                <input
                  className="member-input"
                  type="number"
                  placeholder="0"
                  value={openCash}
                  onChange={e => setOpenCash(e.target.value)}
                />
              </div>
              <div className="member-form-group">
                <label>Catatan (opsional)</label>
                <textarea
                  className="member-textarea"
                  rows={2}
                  placeholder="Catatan pembukaan..."
                  value={shiftNotes}
                  onChange={e => setShiftNotes(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn-cafe-outline" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setAction(null)}>Batal</button>
                <button className="btn-cafe" style={{ flex: 2 }} onClick={handleOpenShift} disabled={submitting}>
                  {submitting ? <Loader size={16} className="spin" /> : null}
                  Buka Shift
                </button>
              </div>
            </div>
          ) : (
            <button className="btn-cafe" onClick={() => setAction('open')}>
              <Clock size={16} /> Buka Shift Baru
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function ShiftStat({ label, value, cls }) {
  return (
    <div className="stat-item">
      <div className={`stat-value ${cls || ''}`} style={{ fontSize: 13 }}>{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}
