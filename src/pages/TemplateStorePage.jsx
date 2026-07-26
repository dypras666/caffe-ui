import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Lock, Star, ExternalLink, X, Coffee, Sparkles, Crown } from 'lucide-react';
import './TemplateStorePage.css';

const REGISTRY_URL = import.meta.env.VITE_REGISTRY_URL || 'http://localhost:3000';

function useTenantAuth() {
  const raw = localStorage.getItem('cafe_tenant_token');
  const user = (() => { try { return JSON.parse(localStorage.getItem('cafe_tenant_user') || 'null'); } catch { return null; } })();
  return { token: raw, user };
}

export default function TemplateStorePage() {
  const { token, user } = useTenantAuth();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(null);
  const [activating, setActivating] = useState(null);
  const [preview, setPreview] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetch(`${REGISTRY_URL}/api/templates`)
      .then(r => r.json())
      .then(d => setTemplates(d.templates || []))
      .catch(() => setTemplates([]))
      .finally(() => setLoading(false));
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handlePurchase = async (tpl) => {
    if (!token) { showToast('Login sebagai tenant owner dulu.', 'error'); return; }
    setPurchasing(tpl.id);
    try {
      const res = await fetch(`${REGISTRY_URL}/api/templates/${tpl.id}/purchase`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal beli template');
      setTemplates(prev => prev.map(t => t.id === tpl.id ? { ...t, owned: true } : t));
      showToast(`Template "${tpl.name}" berhasil dibeli!`);
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setPurchasing(null);
    }
  };

  const handleActivate = async (tpl) => {
    if (!token) { showToast('Login sebagai tenant owner dulu.', 'error'); return; }
    setActivating(tpl.id);
    try {
      const res = await fetch(`${REGISTRY_URL}/api/templates/${tpl.id}/activate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal aktifkan template');
      setTemplates(prev => prev.map(t => ({
        ...t,
        is_active_for_tenant: t.id === tpl.id,
      })));
      showToast(`Template "${tpl.name}" aktif!`);
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setActivating(null);
    }
  };

  const TIER_ICON = { free: Coffee, premium: Crown, exclusive: Sparkles };
  const TIER_LABEL = { free: 'Free', premium: 'Premium', exclusive: 'Exclusive' };

  return (
    <div className="ts-page">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            className={`ts-toast ts-toast-${toast.type}`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="ts-header">
        <motion.div
          className="ts-header-inner"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="ts-eyebrow">Template Store</span>
          <h1>Choose Your Landing Page</h1>
          <p>Pick a premium template to give your café a unique online presence.</p>
          {user && (
            <div className="ts-balance-badge">
              <Coffee size={14} />
              <span>Balance: <strong>Rp {Number(user.balance || 0).toLocaleString('id-ID')}</strong></span>
            </div>
          )}
        </motion.div>
      </div>

      {/* Grid */}
      <div className="ts-container">
        {loading ? (
          <div className="ts-loading">
            <div className="ts-spinner" />
            <span>Memuat template...</span>
          </div>
        ) : templates.length === 0 ? (
          <div className="ts-empty">Belum ada template tersedia.</div>
        ) : (
          <div className="ts-grid">
            {templates.map((tpl, i) => {
              const TierIcon = TIER_ICON[tpl.tier] || Coffee;
              const isBuying = purchasing === tpl.id;
              const isActivating = activating === tpl.id;

              return (
                <motion.div
                  key={tpl.id}
                  className={`ts-card ${tpl.is_active_for_tenant ? 'ts-card-active' : ''}`}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07, duration: 0.5 }}
                >
                  {/* Thumbnail */}
                  <div className="ts-thumb" style={{ '--thumb-hue': tpl.preview_hue || '30' }}>
                    <div className="ts-thumb-bg" />
                    {tpl.thumbnail_url
                      ? <img src={tpl.thumbnail_url} alt={tpl.name} className="ts-thumb-img" />
                      : <div className="ts-thumb-placeholder"><Coffee size={40} /></div>
                    }
                    <button className="ts-preview-btn" onClick={() => setPreview(tpl)}>
                      <ExternalLink size={14} /> Preview
                    </button>
                    {tpl.is_active_for_tenant && (
                      <div className="ts-active-badge">
                        <Check size={12} /> Active
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="ts-card-body">
                    <div className="ts-card-top">
                      <div>
                        <h3>{tpl.name}</h3>
                        <p className="ts-card-desc">{tpl.description}</p>
                      </div>
                      <div className={`ts-tier-badge ts-tier-${tpl.tier}`}>
                        <TierIcon size={11} />
                        {TIER_LABEL[tpl.tier] || tpl.tier}
                      </div>
                    </div>

                    {/* Tags */}
                    {tpl.tags && (
                      <div className="ts-tags">
                        {tpl.tags.split(',').map(tag => (
                          <span key={tag} className="ts-tag">{tag.trim()}</span>
                        ))}
                      </div>
                    )}

                    {/* Stars */}
                    {tpl.rating > 0 && (
                      <div className="ts-rating">
                        <Star size={12} fill="currentColor" />
                        <span>{Number(tpl.rating).toFixed(1)}</span>
                        {tpl.review_count > 0 && <span className="ts-review-count">({tpl.review_count})</span>}
                      </div>
                    )}

                    {/* Footer */}
                    <div className="ts-card-footer">
                      <div className="ts-price">
                        {tpl.price === 0
                          ? <span className="ts-price-free">Gratis</span>
                          : <span>Rp {Number(tpl.price).toLocaleString('id-ID')}</span>
                        }
                      </div>

                      {tpl.is_active_for_tenant ? (
                        <button className="ts-btn ts-btn-active" disabled>
                          <Check size={14} /> Aktif
                        </button>
                      ) : tpl.owned || tpl.price === 0 ? (
                        <button
                          className="ts-btn ts-btn-activate"
                          onClick={() => handleActivate(tpl)}
                          disabled={isActivating}
                        >
                          {isActivating ? <span className="ts-btn-spinner" /> : <Check size={14} />}
                          {isActivating ? 'Mengaktifkan...' : 'Gunakan'}
                        </button>
                      ) : (
                        <button
                          className="ts-btn ts-btn-buy"
                          onClick={() => handlePurchase(tpl)}
                          disabled={isBuying}
                        >
                          {isBuying
                            ? <><span className="ts-btn-spinner" /> Proses...</>
                            : <><Lock size={14} /> Beli</>
                          }
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {preview && (
          <motion.div
            className="ts-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreview(null)}
          >
            <motion.div
              className="ts-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <button className="ts-modal-close" onClick={() => setPreview(null)}>
                <X size={18} />
              </button>
              <h2>{preview.name}</h2>
              <p>{preview.description}</p>
              {preview.preview_url ? (
                <iframe
                  src={preview.preview_url}
                  className="ts-modal-frame"
                  title={`Preview ${preview.name}`}
                />
              ) : (
                <div className="ts-modal-no-preview">
                  <Coffee size={48} />
                  <p>Preview tidak tersedia untuk template ini.</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
