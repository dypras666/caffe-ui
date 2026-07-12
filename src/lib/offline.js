const QUEUE_KEY = 'kasir_order_queue';
const CACHE_PREFIX = 'kasir_c_';

export function getQueue() {
  try { return JSON.parse(localStorage.getItem(QUEUE_KEY)) || []; }
  catch { return []; }
}

export function enqueue(payload) {
  const id = `OFF-${Date.now()}`;
  const entry = { _offlineId: id, _queuedAt: new Date().toISOString(), ...payload };
  localStorage.setItem(QUEUE_KEY, JSON.stringify([...getQueue(), entry]));
  return entry;
}

export function dequeue(offlineId) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(getQueue().filter(e => e._offlineId !== offlineId)));
}

export function saveCache(key, data) {
  localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ d: data, t: Date.now() }));
}

export function loadCache(key) {
  try {
    const v = JSON.parse(localStorage.getItem(CACHE_PREFIX + key));
    return v?.d ?? null;
  } catch { return null; }
}
