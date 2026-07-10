// Motion disabled for better UX
import { ShoppingBag, RefreshCw, Loader } from 'lucide-react';
import { useFetch } from '../../hooks/useApi';
import MemberLayout from './MemberLayout';
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

const PAY_STATUS = {
  paid:    { label: 'Lunas',       cls: 'pay-paid' },
  unpaid:  { label: 'Belum Bayar', cls: 'pay-unpaid' },
  partial: { label: 'Sebagian',    cls: 'pay-unpaid' },
};

export default function MemberOrdersPage() {
  // Try member-specific endpoint first, fall back to generic orders
  const { data: memberOrdersData, loading: memberLoading, error: memberError, refetch: refetchMember } =
    useFetch('/members/orders');

  const useFallback = !!memberError;
  const { data: fallbackData, loading: fallbackLoading, refetch: refetchFallback } =
    useFetch(useFallback ? '/orders?limit=20' : null);

  const loading = memberLoading || (useFallback && fallbackLoading);
  const orders = useFallback
    ? (fallbackData?.orders || [])
    : (memberOrdersData?.orders || memberOrdersData?.data || []);

  const refetch = useFallback ? refetchFallback : refetchMember;

  return (
    <MemberLayout>
      <div>
        <div className="list-header-row">
          <div className="section-title" style={{ margin: 0 }}>Riwayat Pesanan</div>
          <button className="icon-btn" onClick={refetch} title="Refresh" disabled={loading}>
            <RefreshCw size={15} className={loading ? 'spin' : ''} />
          </button>
        </div>

        {loading ? (
          <div className="member-loading">
            <Loader size={28} className="spin" color="#6F4E37" />
          </div>
        ) : orders.length === 0 ? (
          <div className="member-empty">
            <ShoppingBag size={40} />
            <p>Belum ada pesanan</p>
          </div>
        ) : (
          orders.map((order, idx) => {
            const st = ORDER_STATUS[order.order_status] || ORDER_STATUS.pending;
            const py = PAY_STATUS[order.payment_status] || PAY_STATUS.unpaid;
            return (
              <div
                key={order.id || idx}
                className="list-card"
              >
                <div className="list-card-top">
                  <div>
                    <div className="list-card-title">
                      {order.order_number || `#${order.id}`}
                    </div>
                    <div className="list-card-sub">
                      {formatDateTime(order.created_at)}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="list-card-amount">{formatRp(order.total)}</div>
                    <span className={`status-badge ${st.cls}`} style={{ marginTop: 4 }}>
                      {st.label}
                    </span>
                  </div>
                </div>

                <div className="order-meta-row">
                  {order.order_type && (
                    <span className="order-meta-tag">{order.order_type}</span>
                  )}
                  {order.table_number && (
                    <span className="order-meta-tag">Meja {order.table_number}</span>
                  )}
                  {order.branch_name && (
                    <span className="order-meta-tag" style={{ background: '#E8D5C0', color: '#6F4E37' }}>
                      📍 {order.branch_name}
                    </span>
                  )}
                  <span className={`order-meta-tag ${py.cls}`}>{py.label}</span>
                </div>

                {order.items && order.items.length > 0 && (
                  <div style={{ marginTop: 8, fontSize: 12, color: '#9B8B7A' }}>
                    {order.items.slice(0, 3).map((item, i) => (
                      <span key={i}>
                        {item.product_name || item.name}
                        {item.qty > 1 ? ` ×${item.qty}` : ''}
                        {i < Math.min(order.items.length, 3) - 1 ? ', ' : ''}
                      </span>
                    ))}
                    {order.items.length > 3 && (
                      <span> +{order.items.length - 3} lainnya</span>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </MemberLayout>
  );
}
