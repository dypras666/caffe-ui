const fs = require('fs');
let code = fs.readFileSync('src/pages/TableOrderPage.jsx', 'utf8');

code = code.replace(
  'let total = variantProduct.price;',
  'let total = Number(variantProduct.price);'
);

fs.writeFileSync('src/pages/TableOrderPage.jsx', code);
