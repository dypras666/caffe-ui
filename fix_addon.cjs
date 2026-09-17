const fs = require('fs');
let code = fs.readFileSync('src/pages/TableOrderPage.jsx', 'utf8');

const leftover = `
                              />
                              <span className="to-option-name">{addon.name}</span>
                              {Number(addon.price) > 0 && <span className="to-option-price">+{fmt(addon.price)}</span>}
                            </label>
                          );
                        })}
`;
code = code.replace(leftover.trim(), '');

fs.writeFileSync('src/pages/TableOrderPage.jsx', code);
