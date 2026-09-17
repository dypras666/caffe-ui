const fs = require('fs');
let code = fs.readFileSync('src/pages/TableOrderPage.jsx', 'utf8');

// 1. In computedVariantPrice, variantSelections is now an array of arrays? No, it's an object of arrays.
code = code.replace(
  'Object.values(variantSelections).forEach(v => { if (v?.price_modifier) total += Number(v.price_modifier); });',
  'Object.values(variantSelections).forEach(arr => { if (Array.isArray(arr)) arr.forEach(v => { if (v?.price_modifier) total += Number(v.price_modifier); }); });'
);

// 2. In confirmVariant, variantSelections is an object of arrays.
code = code.replace(
  "const vKeys = Object.entries(variantSelections).map(([g, v]) => `${g}:${v?.id}`).join('|');",
  "const vKeys = Object.entries(variantSelections).flatMap(([g, arr]) => (arr || []).map(v => `${g}:${v.id}`)).join('|');"
);
code = code.replace(
  "variants: Object.values(variantSelections).filter(Boolean),",
  "variants: Object.values(variantSelections).flat().filter(Boolean),"
);

// 3. In the UI rendering for variant groups
const searchStr = `
                        {(group.options || []).map(opt => (
                          <label key={opt.id} className={\`to-option \${variantSelections[group.id]?.id === opt.id ? 'selected' : ''}\`}>
                            <input type="radio" name={\`vg-\${group.id}\`}
                              checked={variantSelections[group.id]?.id === opt.id}
                              onChange={() => setVariantSelections(p => ({ ...p, [group.id]: opt }))}
                            />
                            <span className="to-option-name">{opt.name}</span>
                            {Number(opt.price_modifier) > 0 && <span className="to-option-price">+{fmt(opt.price_modifier)}</span>}
                          </label>
                        ))}
`;
const replaceStr = `
                        {(group.options || []).map(opt => {
                          const curArr = variantSelections[group.id] || [];
                          const checked = curArr.some(v => v.id === opt.id);
                          const isMulti = group.max_select > 1 || group.max_select === null || group.max_select === 0;
                          return (
                            <label key={opt.id} className={\`to-option \${checked ? 'selected' : ''}\`}>
                              <input type={isMulti ? "checkbox" : "radio"} name={isMulti ? undefined : \`vg-\${group.id}\`}
                                checked={checked}
                                onChange={() => setVariantSelections(p => {
                                  const cur = p[group.id] || [];
                                  if (isMulti) {
                                    if (checked) return { ...p, [group.id]: cur.filter(v => v.id !== opt.id) };
                                    if (group.max_select && cur.length >= group.max_select) {
                                      // optional: alert('Maksimal ' + group.max_select + ' pilihan');
                                      return p;
                                    }
                                    return { ...p, [group.id]: [...cur, opt] };
                                  } else {
                                    if (!group.is_required && checked) return { ...p, [group.id]: [] };
                                    return { ...p, [group.id]: [opt] };
                                  }
                                })}
                              />
                              <span className="to-option-name">{opt.name}</span>
                              {Number(opt.price_modifier) > 0 && <span className="to-option-price">+{fmt(opt.price_modifier)}</span>}
                            </label>
                          );
                        })}
`;

// Wait, we need to handle the replace string precisely. I'll just use string replacement on a smaller chunk.
