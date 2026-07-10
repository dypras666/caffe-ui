import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Coffee, ClipboardList, PlusCircle, LogOut, RefreshCw, Loader,
  Search, X, Minus, Plus, Check, CreditCard, ArrowLeft, User,
} from 'lucide-react';
import api from '../../lib/api';
import '../member/member.css';

const STATUS_MAP = {
  pending: { label: 'Menunggu', cls: 'status-pending' },
  completed: { label: 'Selesai', cls: 'status-completed' },
  preparing: { label: 'Disiapkan', cls: 'status-preparing' },
  ready: { label: 'Siap', cls: 'status-ready' },
  cancelled: { label: 'Batal', cls: 'status-cancelled' },
};

export default function KasirDashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cafe_member_user')); } catch { return null; }
  });
  const [tab, setTab] = useState('orders');
  const [editingOrderId, setEditingOrderId] = useState(null);

  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'kasir')) {
      navigate('/kasir/login');
    }
  }, [user, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('cafe_member_token');
    localStorage.removeItem('cafe_member_user');
    setUser(null);
    navigate('/kasir/login');
  };

  if (!user || (user.role !== 'admin' && user.role !== 'kasir')) return null;

  return (
    <div className="member-page">
      <div className="member-header">
        <div className="member-header-logo">
          <Coffee size={20} />
          <span>Kasir — {user.name}</span>
        </div>
        <div className="member-header-right">
          <span className="member-header-name">{user.branch_id ? `Cabang #${user.branch_id}` : ''}</span>
          <button onClick={handleLogout} className="member-notif-btn" title="Logout">
            <LogOut size={18} />
          </button>
        </div>
      </div>

      <div className="member-content" style={{ paddingBottom: 100 }}>
        {editingOrderId ? (
          <EditOrderTab
            user={user}
            orderId={editingOrderId}
            onBack={() => setEditingOrderId(null)}
            onSaved={() => { setEditingOrderId(null); }}
          />
        ) : tab === 'orders' ? (
          <OrderListTab user={user} onEditOrder={(id) => setEditingOrderId(id)} />
        ) : tab === 'new-order' ? (
          <NewOrderTab
            user={user}
            onBack={() => setTab('orders')}
            onCreated={() => setTab('orders')}
          />
        ) : null}
      </div>

      <div className="member-bottom-nav">
        <button className={`member-nav-tab ${tab === 'orders' && !editingOrderId ? 'active' : ''}`} onClick={() => { setTab('orders'); setEditingOrderId(null); }}>
          <ClipboardList size={22} />
          <span>Pesanan</span>
        </button>
        <button className={`member-nav-tab ${tab === 'new-order' || editingOrderId ? 'active' : ''}`} onClick={() => setTab('new-order')}>
          <PlusCircle size={22} />
          <span>Pesanan Baru</span>
        </button>
      </div>
    </div>
  );
}

function OrderListTab({ user, onEditOrder }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(null);
  const [filter, setFilter] = useState('unpaid');
  const [search, setSearch] = useState('');

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: 100 };
      if (filter === 'unpaid') params.payment_status = 'pending';
      else if (filter === 'paid') params.payment_status = 'paid';
      else if (filter === 'completed') { params.order_status = 'completed'; params.payment_status = 'paid'; }
      if (user.branch_id) params.branch_id = user.branch_id;
      const { data } = await api.get('/orders', { params });
      setOrders(data.orders || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filter, user.branch_id]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handlePay = async (orderId) => {
    setPaying(orderId);
    try {
      await api.put(`/orders/${orderId}/payment`, {
        payment_status: 'paid',
        payment_method: 'cash',
      });
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.error || 'Gagal bayar');
    } finally {
      setPaying(null);
    }
  };

  const filtered = orders.filter(o => {
    if (search) {
      const q = search.toLowerCase();
      return (
        o.order_number?.toLowerCase().includes(q) ||
        o.customer_name?.toLowerCase().includes(q) ||
        o.table_number?.toLowerCase().includes(q)
      );
    }
    return true;
  });

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
          { key: 'unpaid', label: 'Belum Bayar' },
          { key: 'paid', label: 'Lunas' },
          { key: 'completed', label: 'Selesai' },
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
          placeholder="Cari pesanan..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

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
            onPay={handlePay}
            onEdit={onEditOrder}
          />
        ))
      )}
    </div>
  );
}

const PAY_STATUS_MAP = {
  pending: { label: 'Belum Bayar', cls: 'pay-unpaid' },
  paid: { label: 'Lunas', cls: 'pay-paid' },
  partial: { label: 'DP', cls: 'pay-unpaid' },
};

function OrderCard({ order, paying, onPay, onEdit }) {
  const payInfo = PAY_STATUS_MAP[order.payment_status] || { label: 'Belum Bayar', cls: 'pay-unpaid' };
  const statusInfo = STATUS_MAP[order.order_status] || { label: order.order_status, cls: '' };
  const canEdit = order.order_status === 'pending';

  return (
    <div className="list-card">
      <div className="list-card-top">
        <div>
          <div className="list-card-title">
            {order.order_number || `#${order.id}`}
          </div>
          <div className="list-card-sub">
            {order.customer_name && <span>{order.customer_name} · </span>}
            {order.table_number && <span>Meja {order.table_number} · </span>}
            {order.order_type}
            {order.branch_name && <span> · {order.branch_name}</span>}
          </div>
          <div style={{ marginTop: 6, display: 'flex', gap: 6 }}>
            <span className={`status-badge ${statusInfo.cls}`}>{statusInfo.label}</span>
            <span className={`status-badge ${payInfo.cls}`}>{payInfo.label}</span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="list-card-amount">
            Rp {Number(order.total || 0).toLocaleString('id-ID')}
          </div>
          <div style={{ marginTop: 8, display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
            {canEdit && onEdit && (
              <button
                className="btn-cafe-sm"
                style={{ background: 'linear-gradient(135deg, #6F4E37, #2C1810)' }}
                onClick={() => onEdit(order.id)}
              >
                <ClipboardList size={14} /> Edit
              </button>
            )}
            {order.payment_status === 'pending' && (
              <button
                className="btn-cafe-sm"
                style={{ background: 'linear-gradient(135deg, #27AE60, #1E8449)' }}
                onClick={() => onPay(order.id)}
                disabled={paying === order.id}
              >
                {paying === order.id ? <Loader size={14} className="spin" /> : <CreditCard size={14} />}
                Bayar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function NewOrderTab({ user, onBack, onCreated }) {
  const [step, setStep] = useState('select-table');
  const [tables, setTables] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [orderType, setOrderType] = useState('dine-in');
  const [items, setItems] = useState([]);
  const [searchProd, setSearchProd] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Product config modal
  const [configProduct, setConfigProduct] = useState(null);
  const [configLoading, setConfigLoading] = useState(false);
  const [configGroups, setConfigGroups] = useState([]);
  const [configAddonGroups, setConfigAddonGroups] = useState([]);
  const [selectedVariants, setSelectedVariants] = useState({});
  const [selectedAddons, setSelectedAddons] = useState({});

  useEffect(() => {
    fetchTables();
    fetchProducts();
  }, []);

  const fetchTables = async () => {
    try {
      const params = {};
      if (user.branch_id) params.branch_id = user.branch_id;
      const { data } = await api.get('/tables', { params });
      setTables(data.tables || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = { status: 'active', limit: 200 };
      if (user.branch_id) params.branch_id = user.branch_id;
      const { data } = await api.get('/products', { params });
      setProducts(data.products || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openConfig = async (product) => {
    if (!product.has_variants && !product.has_addons) {
      addItemSimple(product);
      return;
    }
    setConfigLoading(true);
    setConfigProduct(product);
    try {
      const { data } = await api.get(`/products/${product.id}`);
      const p = data.product || data;
      setConfigGroups(p.variant_groups || []);
      setConfigAddonGroups(p.addon_groups || []);
      // Set default variants
      const defaults = {};
      (p.variant_groups || []).forEach(g => {
        const def = g.options?.find(o => o.is_default) || g.options?.[0];
        if (def) defaults[g.id] = def.id;
      });
      setSelectedVariants(defaults);
      setSelectedAddons({});
    } catch (err) {
      console.error(err);
      alert('Gagal memuat detail produk');
      setConfigProduct(null);
    } finally {
      setConfigLoading(false);
    }
  };

  const toggleAddon = (addonId) => {
    setSelectedAddons(prev => ({
      ...prev,
      [addonId]: prev[addonId] ? 0 : 1,
    }));
  };

  const updateAddonQty = (addonId, delta) => {
    setSelectedAddons(prev => {
      const cur = prev[addonId] || 0;
      const next = cur + delta;
      return { ...prev, [addonId]: next > 0 ? next : 0 };
    });
  };

  const calcConfigPrice = () => {
    if (!configProduct) return 0;
    let base = Number(configProduct.price);
    configGroups.forEach(g => {
      const optId = selectedVariants[g.id];
      if (optId) {
        const opt = g.options?.find(o => o.id === optId);
        if (opt) base += Number(opt.price_modifier || 0);
      }
    });
    return base;
  };

  const calcConfigAddonTotal = () => {
    let total = 0;
    Object.entries(selectedAddons).forEach(([addonId, qty]) => {
      if (!qty) return;
      for (const ag of configAddonGroups) {
        const addon = ag.addons?.find(a => a.id === Number(addonId));
        if (addon) total += Number(addon.price) * qty;
      }
    });
    return total;
  };

  const confirmConfig = () => {
    if (!configProduct) return;
    const unitPrice = calcConfigPrice();
    const addons = [];
    Object.entries(selectedAddons).forEach(([addonId, qty]) => {
      if (!qty) return;
      for (const ag of configAddonGroups) {
        const addon = ag.addons?.find(a => a.id === Number(addonId));
        if (addon) {
          addons.push({ addon_id: Number(addonId), qty });
        }
      }
    });
    const variants = Object.entries(selectedVariants)
      .filter(([_, optId]) => optId)
      .map(([groupId, optId]) => ({ group_id: Number(groupId), option_id: optId }));
    setItems(prev => {
      const existing = prev.find(i =>
        i.product_id === configProduct.id &&
        JSON.stringify(i.variants) === JSON.stringify(variants) &&
        JSON.stringify(i.addons) === JSON.stringify(addons)
      );
      if (existing) {
        return prev.map(i =>
          i === existing ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, {
        product_id: configProduct.id,
        name: configProduct.name,
        price: unitPrice,
        quantity: 1,
        variants,
        addons,
      }];
    });
    setConfigProduct(null);
  };

  const addItemSimple = (product) => {
    setItems(prev => {
      const existing = prev.find(i => i.product_id === product.id && !i.variants?.length && !i.addons?.length);
      if (existing) {
        return prev.map(i =>
          i === existing ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, {
        product_id: product.id,
        name: product.name,
        price: Number(product.price),
        quantity: 1,
      }];
    });
  };

  const updateQty = (idx, delta) => {
    setItems(prev => {
      const updated = prev.map((i, index) => {
        if (index !== idx) return i;
        const newQty = i.quantity + delta;
        return newQty > 0 ? { ...i, quantity: newQty } : null;
      }).filter(Boolean);
      return updated;
    });
  };

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const filteredProducts = products.filter(p =>
    !searchProd || p.name.toLowerCase().includes(searchProd.toLowerCase())
  );

  const handleCreateOrder = async () => {
    if (items.length === 0) {
      alert('Pilih minimal 1 produk');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        order_type: orderType,
        payment_method: 'cash',
        table_id: selectedTable?.id || null,
        table_number: selectedTable?.table_number || null,
        customer_name: customerName || null,
        customer_phone: customerPhone || null,
        items: items.map(i => ({
          product_id: i.product_id,
          quantity: i.quantity,
          ...(i.variants?.length ? { variants: i.variants } : {}),
          ...(i.addons?.length ? { addons: i.addons } : {}),
        })),
        branch_id: user.branch_id || null,
      };
      await api.post('/orders', payload);
      alert('Pesanan berhasil dibuat!');
      onCreated();
    } catch (err) {
      alert(err.response?.data?.error || err.message || 'Gagal membuat pesanan');
    } finally {
      setSubmitting(false);
    }
  };

  const availableTables = tables.filter(t => t.status === 'available' || t.status === 'occupied');

  const itemLabel = (item) => {
    let label = item.name;
    if (item.variants?.length) {
      const optNames = item.variants.map(v => {
        // Try to find option name from config data (won't be available after add, so just show placeholder)
        return `#${v.option_id}`;
      }).join(', ');
      label += ` (${optNames})`;
    }
    return label;
  };

  return (
    <div>
      <div className="list-header-row">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={onBack} className="icon-btn"><ArrowLeft size={18} /></button>
          <h2 className="section-title" style={{ margin: 0 }}>
            <PlusCircle size={18} /> Pesanan Baru
          </h2>
        </div>
      </div>

      {step === 'select-table' && (
        <div>
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

          {orderType === 'dine-in' && (
            <div className="member-form-group">
              <label>Pilih Meja</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {availableTables.map(table => (
                  <button
                    key={table.id}
                    onClick={() => setSelectedTable(table)}
                    style={{
                      padding: '12px 8px',
                      borderRadius: 10,
                      border: `2px solid ${selectedTable?.id === table.id ? '#6F4E37' : '#F5E6D3'}`,
                      background: selectedTable?.id === table.id ? '#FFF8E7' : '#fff',
                      color: table.status === 'occupied' ? '#C0392B' : '#2C1810',
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: 13,
                    }}
                  >
                    {table.name || table.table_number}
                    {table.status === 'occupied' && <div style={{ fontSize: 10, fontWeight: 400 }}>Terisi</div>}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button className="btn-cafe" onClick={() => setStep('select-products')}>
            Lanjut Pilih Menu
          </button>
        </div>
      )}

      {step === 'select-products' && (
        <div>
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

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 16 }}>
            {(searchProd ? filteredProducts : products.slice(0, 200)).map(prod => {
              const inCart = items.find(i => i.product_id === prod.id);
              return (
                <button
                  key={prod.id}
                  onClick={() => openConfig(prod)}
                  style={{
                    padding: '12px 10px',
                    borderRadius: 10,
                    border: `1.5px solid ${inCart ? '#6F4E37' : '#F5E6D3'}`,
                    background: inCart ? '#FFF8E7' : '#fff',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontSize: 13,
                    position: 'relative',
                  }}
                >
                  <div style={{ fontWeight: 600, color: '#2C1810', marginBottom: 4 }}>{prod.name}</div>
                  <div style={{ color: '#6F4E37', fontWeight: 700 }}>
                    Rp {Number(prod.price).toLocaleString('id-ID')}
                  </div>
                  {(prod.has_variants || prod.has_addons) && (
                    <div style={{ fontSize: 9, color: '#C4A882', marginTop: 4 }}>
                      + varian / tambahan
                    </div>
                  )}
                  {inCart && (
                    <div style={{ color: '#27AE60', fontSize: 11, marginTop: 4 }}>
                      {inCart.quantity}x di keranjang
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Cart */}
          {items.length > 0 && (
            <div className="member-card" style={{ marginBottom: 12 }}>
              <div className="list-header-row" style={{ marginBottom: 8 }}>
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>
                  Pesanan ({items.length} item)
                </h3>
              </div>
              {items.map((item, idx) => (
                <div key={`${item.product_id}-${idx}`} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '8px 0', borderBottom: '1px solid #F5E6D3',
                }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{item.name}</div>
                    <div style={{ fontSize: 11, color: '#9B8B7A' }}>
                      Rp {item.price.toLocaleString('id-ID')} × {item.quantity}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <button className="icon-btn" onClick={() => updateQty(idx, -1)}>
                      <Minus size={14} />
                    </button>
                    <span style={{ fontWeight: 700, fontSize: 14, minWidth: 24, textAlign: 'center' }}>
                      {item.quantity}
                    </span>
                    <button className="icon-btn" onClick={() => updateQty(idx, 1)}>
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              ))}
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                paddingTop: 10, fontWeight: 700, fontSize: 16,
              }}>
                <span>Total</span>
                <span>Rp {subtotal.toLocaleString('id-ID')}</span>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className="btn-cafe-outline"
              style={{ flex: 1, justifyContent: 'center' }}
              onClick={() => setStep('select-table')}
            >
              Kembali
            </button>
            <button
              className="btn-cafe"
              style={{ flex: 2 }}
              onClick={handleCreateOrder}
              disabled={submitting || items.length === 0}
            >
              {submitting ? <><Loader size={16} className="spin" /> Membuat...</> : 'Buat Pesanan'}
            </button>
          </div>
        </div>
      )}

      {/* Product Config Modal */}
      {configProduct && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.5)', display: 'flex',
          alignItems: 'flex-end', justifyContent: 'center',
        }} onClick={() => setConfigProduct(null)}>
          <div style={{
            background: '#fff', width: '100%', maxWidth: 480,
            borderRadius: '20px 20px 0 0', padding: '24px 20px 32px',
            maxHeight: '85vh', overflowY: 'auto',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{configProduct.name}</h3>
              <button className="icon-btn" onClick={() => setConfigProduct(null)}><X size={20} /></button>
            </div>

            {configLoading ? (
              <div className="member-loading"><Loader size={24} className="spin" /></div>
            ) : (
              <div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#6F4E37', marginBottom: 16 }}>
                  Rp {(calcConfigPrice() + calcConfigAddonTotal()).toLocaleString('id-ID')}
                </div>

                {/* Variants */}
                {configGroups.map(group => (
                  <div key={group.id} style={{ marginBottom: 16 }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: '#6F4E37', display: 'block', marginBottom: 8 }}>
                      {group.name} {group.is_required ? '*' : ''}
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {(group.options || []).map(opt => (
                        <button
                          key={opt.id}
                          onClick={() => setSelectedVariants(prev => ({ ...prev, [group.id]: opt.id }))}
                          style={{
                            padding: '8px 14px', borderRadius: 20, fontSize: 13,
                            border: `1.5px solid ${selectedVariants[group.id] === opt.id ? '#6F4E37' : '#F5E6D3'}`,
                            background: selectedVariants[group.id] === opt.id ? '#FFF8E7' : '#fff',
                            color: '#2C1810', cursor: 'pointer', fontWeight: 500,
                          }}
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

                {/* Addons */}
                {configAddonGroups.map(group => (
                  <div key={group.id} style={{ marginBottom: 16 }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: '#6F4E37', display: 'block', marginBottom: 8 }}>
                      {group.name}
                    </label>
                    {(group.addons || []).map(addon => {
                      const qty = selectedAddons[addon.id] || 0;
                      return (
                        <div key={addon.id} style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          padding: '8px 0', borderBottom: '1px solid #F5E6D3',
                        }}>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 500 }}>{addon.name}</div>
                            <div style={{ fontSize: 11, color: '#9B8B7A' }}>
                              +Rp {Number(addon.price).toLocaleString('id-ID')}
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            {qty > 0 && (
                              <>
                                <button className="icon-btn" onClick={() => updateAddonQty(addon.id, -1)}>
                                  <Minus size={14} />
                                </button>
                                <span style={{ fontWeight: 700 }}>{qty}</span>
                              </>
                            )}
                            <button className="icon-btn" onClick={() => updateAddonQty(addon.id, 1)}>
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}

                <button className="btn-cafe" onClick={confirmConfig} style={{ marginTop: 8 }}>
                  <Check size={16} /> Tambahkan ke Pesanan
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function EditOrderTab({ user, orderId, onBack, onSaved }) {
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);

  const [configProduct, setConfigProduct] = useState(null);
  const [configLoading, setConfigLoading] = useState(false);
  const [configGroups, setConfigGroups] = useState([]);
  const [configAddonGroups, setConfigAddonGroups] = useState([]);
  const [selectedVariants, setSelectedVariants] = useState({});
  const [selectedAddons, setSelectedAddons] = useState({});

  const [products, setProducts] = useState([]);
  const [searchProd, setSearchProd] = useState('');

  const fetchOrder = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/orders/${orderId}`);
      setOrder(data.order);
      setItems((data.order.items || []).map(i => {
        let variants = [];
        let addons = [];
        try { if (i.variants_selected) variants = JSON.parse(i.variants_selected).map(v => ({ group_id: v.group_id, option_id: v.option_id })); } catch {}
        try { if (i.addons_selected) addons = JSON.parse(i.addons_selected).map(a => ({ addon_id: a.addon_id, qty: a.qty })); } catch {}
        return {
          product_id: i.product_id,
          name: i.product_name,
          price: Number(i.unit_price),
          quantity: i.quantity,
          order_item_id: i.id,
          variants,
          addons,
        };
      }));
    } catch (err) {
      console.error(err);
      alert('Gagal memuat pesanan');
      onBack();
    } finally {
      setLoading(false);
    }
  }, [orderId, onBack]);

  useEffect(() => { fetchOrder(); }, [fetchOrder]);

  useEffect(() => {
    const fet = async () => {
      try {
        const params = { status: 'active', limit: 200 };
        if (user.branch_id) params.branch_id = user.branch_id;
        const { data } = await api.get('/products', { params });
        setProducts(data.products || []);
      } catch (err) { console.error(err); }
    };
    fet();
  }, [user.branch_id]);

  const updateQty = (idx, delta) => {
    setItems(prev => {
      const updated = prev.map((i, index) => {
        if (index !== idx) return i;
        const newQty = i.quantity + delta;
        return newQty > 0 ? { ...i, quantity: newQty } : null;
      }).filter(Boolean);
      return updated;
    });
  };

  const removeItem = (idx) => {
    setItems(prev => prev.filter((_, i) => i !== idx));
  };

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const handleSave = async () => {
    if (items.length === 0) {
      alert('Pesanan harus memiliki minimal 1 item');
      return;
    }
    setSaving(true);
    try {
      await api.put(`/orders/${orderId}/items`, {
        items: items.map(i => ({
          product_id: i.product_id,
          quantity: i.quantity,
          ...(i.variants?.length ? { variants: i.variants } : {}),
          ...(i.addons?.length ? { addons: i.addons } : {}),
        })),
      });
      alert('Pesanan berhasil diupdate!');
      onSaved();
    } catch (err) {
      alert(err.response?.data?.error || err.message || 'Gagal menyimpan');
    } finally {
      setSaving(false);
    }
  };

  const openAddConfig = async (product) => {
    if (!product.has_variants && !product.has_addons) {
      setItems(prev => {
        const existing = prev.find(i => i.product_id === product.id);
        if (existing) {
          return prev.map(i =>
            i.product_id === product.id ? { ...i, quantity: i.quantity + 1 } : i
          );
        }
        return [...prev, {
          product_id: product.id,
          name: product.name,
          price: Number(product.price),
          quantity: 1,
        }];
      });
      setShowAddProduct(false);
      return;
    }
    setConfigLoading(true);
    setConfigProduct(product);
    try {
      const { data } = await api.get(`/products/${product.id}`);
      const p = data.product || data;
      setConfigGroups(p.variant_groups || []);
      setConfigAddonGroups(p.addon_groups || []);
      const defaults = {};
      (p.variant_groups || []).forEach(g => {
        const def = g.options?.find(o => o.is_default) || g.options?.[0];
        if (def) defaults[g.id] = def.id;
      });
      setSelectedVariants(defaults);
      setSelectedAddons({});
    } catch (err) {
      console.error(err);
      alert('Gagal memuat detail produk');
      setConfigProduct(null);
    } finally {
      setConfigLoading(false);
    }
  };

  const toggleAddon = (addonId) => {
    setSelectedAddons(prev => ({ ...prev, [addonId]: prev[addonId] ? 0 : 1 }));
  };

  const updateAddonQty = (addonId, delta) => {
    setSelectedAddons(prev => {
      const cur = prev[addonId] || 0;
      const next = cur + delta;
      return { ...prev, [addonId]: next > 0 ? next : 0 };
    });
  };

  const calcConfigPrice = () => {
    if (!configProduct) return 0;
    let base = Number(configProduct.price);
    configGroups.forEach(g => {
      const optId = selectedVariants[g.id];
      if (optId) {
        const opt = g.options?.find(o => o.id === optId);
        if (opt) base += Number(opt.price_modifier || 0);
      }
    });
    return base;
  };

  const calcConfigAddonTotal = () => {
    let total = 0;
    Object.entries(selectedAddons).forEach(([addonId, qty]) => {
      if (!qty) return;
      for (const ag of configAddonGroups) {
        const addon = ag.addons?.find(a => a.id === Number(addonId));
        if (addon) total += Number(addon.price) * qty;
      }
    });
    return total;
  };

  const confirmAddItem = () => {
    if (!configProduct) return;
    const unitPrice = calcConfigPrice();
    const addons = [];
    Object.entries(selectedAddons).forEach(([addonId, qty]) => {
      if (!qty) return;
      for (const ag of configAddonGroups) {
        const addon = ag.addons?.find(a => a.id === Number(addonId));
        if (addon) addons.push({ addon_id: Number(addonId), qty });
      }
    });
    const variants = Object.entries(selectedVariants)
      .filter(([_, optId]) => optId)
      .map(([groupId, optId]) => ({ group_id: Number(groupId), option_id: optId }));
    setItems(prev => [...prev, {
      product_id: configProduct.id,
      name: configProduct.name,
      price: unitPrice,
      quantity: 1,
      variants,
      addons,
    }]);
    setConfigProduct(null);
    setShowAddProduct(false);
  };

  const filteredProducts = products.filter(p =>
    !searchProd || p.name.toLowerCase().includes(searchProd.toLowerCase())
  );

  if (loading) return <div className="member-loading"><Loader size={24} className="spin" /></div>;

  return (
    <div>
      <div className="list-header-row">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={onBack} className="icon-btn"><ArrowLeft size={18} /></button>
          <h2 className="section-title" style={{ margin: 0 }}>
            Edit Pesanan
          </h2>
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
            {order.table_number && <span>Meja {order.table_number} · </span>}
            {order.order_type}
          </div>
        </div>
      )}

      <div className="member-card" style={{ marginBottom: 12 }}>
        <div className="list-header-row" style={{ marginBottom: 8 }}>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Item ({items.length})</h3>
        </div>
        {items.map((item, idx) => (
          <div key={`${item.product_id}-${idx}`} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '8px 0', borderBottom: '1px solid #F5E6D3',
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 13 }}>{item.name}</div>
              <div style={{ fontSize: 11, color: '#9B8B7A' }}>
                Rp {item.price.toLocaleString('id-ID')} × {item.quantity}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button className="icon-btn" onClick={() => updateQty(idx, -1)}>
                <Minus size={14} />
              </button>
              <span style={{ fontWeight: 700, fontSize: 14, minWidth: 24, textAlign: 'center' }}>
                {item.quantity}
              </span>
              <button className="icon-btn" onClick={() => updateQty(idx, 1)}>
                <Plus size={14} />
              </button>
              <button className="icon-btn" onClick={() => removeItem(idx)} style={{ color: '#E74C3C', marginLeft: 4 }}>
                <X size={14} />
              </button>
            </div>
          </div>
        ))}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          paddingTop: 10, fontWeight: 700, fontSize: 16,
        }}>
          <span>Total</span>
          <span>Rp {subtotal.toLocaleString('id-ID')}</span>
        </div>
      </div>

      <button
        className="btn-cafe-outline"
        style={{ width: '100%', justifyContent: 'center', marginBottom: 12 }}
        onClick={() => setShowAddProduct(!showAddProduct)}
      >
        <PlusCircle size={16} /> Tambah Item
      </button>

      {showAddProduct && (
        <div className="member-card" style={{ marginBottom: 12 }}>
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, maxHeight: 240, overflowY: 'auto' }}>
            {(searchProd ? filteredProducts : products.slice(0, 30)).map(prod => (
              <button
                key={prod.id}
                onClick={() => openAddConfig(prod)}
                style={{
                  padding: '10px', borderRadius: 10,
                  border: '1.5px solid #F5E6D3', background: '#fff',
                  cursor: 'pointer', textAlign: 'left', fontSize: 13,
                }}
              >
                <div style={{ fontWeight: 600, color: '#2C1810', marginBottom: 2 }}>{prod.name}</div>
                <div style={{ color: '#6F4E37', fontWeight: 700, fontSize: 12 }}>
                  Rp {Number(prod.price).toLocaleString('id-ID')}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn-cafe-outline" style={{ flex: 1, justifyContent: 'center' }} onClick={onBack}>
          Batal
        </button>
        <button className="btn-cafe" style={{ flex: 2 }} onClick={handleSave} disabled={saving || items.length === 0}>
          {saving ? <><Loader size={16} className="spin" /> Menyimpan...</> : 'Simpan'}
        </button>
      </div>

      {configProduct && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.5)', display: 'flex',
          alignItems: 'flex-end', justifyContent: 'center',
        }} onClick={() => setConfigProduct(null)}>
          <div style={{
            background: '#fff', width: '100%', maxWidth: 480,
            borderRadius: '20px 20px 0 0', padding: '24px 20px 32px',
            maxHeight: '85vh', overflowY: 'auto',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{configProduct.name}</h3>
              <button className="icon-btn" onClick={() => setConfigProduct(null)}><X size={20} /></button>
            </div>
            {configLoading ? (
              <div className="member-loading"><Loader size={24} className="spin" /></div>
            ) : (
              <div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#6F4E37', marginBottom: 16 }}>
                  Rp {(calcConfigPrice() + calcConfigAddonTotal()).toLocaleString('id-ID')}
                </div>
                {configGroups.map(group => (
                  <div key={group.id} style={{ marginBottom: 16 }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: '#6F4E37', display: 'block', marginBottom: 8 }}>
                      {group.name} {group.is_required ? '*' : ''}
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {(group.options || []).map(opt => (
                        <button
                          key={opt.id}
                          onClick={() => setSelectedVariants(prev => ({ ...prev, [group.id]: opt.id }))}
                          style={{
                            padding: '8px 14px', borderRadius: 20, fontSize: 13,
                            border: `1.5px solid ${selectedVariants[group.id] === opt.id ? '#6F4E37' : '#F5E6D3'}`,
                            background: selectedVariants[group.id] === opt.id ? '#FFF8E7' : '#fff',
                            color: '#2C1810', cursor: 'pointer', fontWeight: 500,
                          }}
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
                {configAddonGroups.map(group => (
                  <div key={group.id} style={{ marginBottom: 16 }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: '#6F4E37', display: 'block', marginBottom: 8 }}>
                      {group.name}
                    </label>
                    {(group.addons || []).map(addon => {
                      const qty = selectedAddons[addon.id] || 0;
                      return (
                        <div key={addon.id} style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          padding: '8px 0', borderBottom: '1px solid #F5E6D3',
                        }}>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 500 }}>{addon.name}</div>
                            <div style={{ fontSize: 11, color: '#9B8B7A' }}>
                              +Rp {Number(addon.price).toLocaleString('id-ID')}
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            {qty > 0 && (
                              <>
                                <button className="icon-btn" onClick={() => updateAddonQty(addon.id, -1)}>
                                  <Minus size={14} />
                                </button>
                                <span style={{ fontWeight: 700 }}>{qty}</span>
                              </>
                            )}
                            <button className="icon-btn" onClick={() => updateAddonQty(addon.id, 1)}>
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
                <button className="btn-cafe" onClick={confirmAddItem} style={{ marginTop: 8 }}>
                  <Check size={16} /> Tambahkan
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
