const fs = require('fs');
let code = fs.readFileSync('src/pages/TableOrderPage.jsx', 'utf8');

const searchStr = `
                        {(group.addons || []).map(addon => {
                          const checked = (addonSelections[group.id] || []).some(a => a.id === addon.id);
                          return (
                            <label key={addon.id} className={\`to-option \${checked ? 'selected' : ''}\`}>
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
`;
const replaceStr = `
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
`;
if (code.includes(searchStr.trim().split('\n')[0].trim())) {
  // Try to replace based on starting line to make it more resilient
  const searchRe = /\{\(group\.addons \|\| \[\]\)\.map\(addon => \{[\s\S]*?\}\)\}/;
  code = code.replace(searchRe, replaceStr.trim());
}

// Now we must update computedVariantPrice to multiply by qty!
code = code.replace(
  'Object.values(addonSelections).forEach(arr => (arr || []).forEach(a => { if (a?.price) total += Number(a.price); }));',
  'Object.values(addonSelections).forEach(arr => (arr || []).forEach(a => { if (a?.price) total += Number(a.price) * (a.qty || 1); }));'
);

// And update confirmVariant to include qty in the cart key and addons list!
// Old: const aKeys = Object.entries(addonSelections).flatMap(([g, arr]) => (arr || []).map(a => `${g}:${a.id}`)).join('|');
code = code.replace(
  "const aKeys = Object.entries(addonSelections).flatMap(([g, arr]) => (arr || []).map(a => `${g}:${a.id}`)).join('|');",
  "const aKeys = Object.entries(addonSelections).flatMap(([g, arr]) => (arr || []).map(a => `${g}:${a.id}x${a.qty || 1}`)).join('|');"
);

fs.writeFileSync('src/pages/TableOrderPage.jsx', code);
