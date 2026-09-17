const fs = require('fs');

let content = fs.readFileSync('src/pages/TableOrderPage.jsx', 'utf8');

// 1. Add User to imports and useNavigate
if (!content.includes('User, ListOrdered')) {
  content = content.replace(
    /import { ShoppingBag, ChevronLeft, Plus, Minus, Search, Coffee, Info, X, MapPin } from 'lucide-react';/,
    `import { ShoppingBag, ChevronLeft, Plus, Minus, Search, Coffee, Info, X, MapPin, User, FileText, Menu as MenuIcon } from 'lucide-react';`
  );
  content = content.replace(
    /import \{ useAuth \} from '\.\.\/context\/AuthContext';/,
    `import { useAuth } from '../context/AuthContext';\nimport { useNavigate } from 'react-router-dom';`
  );
}

// 2. Add cafeName state and useNavigate
if (!content.includes('const [cafeName, setCafeName]')) {
  content = content.replace(
    /const \{ user \} = useAuth\(\);/,
    `const { user } = useAuth();\n  const navigate = useNavigate();\n  const [cafeName, setCafeName] = useState('Café Azzura');`
  );
}

// 3. Update settings parse to get site_name
if (!content.includes('setCafeName(')) {
  content = content.replace(
    /setPaymentSetting\(val\);/,
    `setPaymentSetting(val);\n          const nameVal = list.find(s => s.key === 'site_name' || s.key === 'cafe_name')?.value || 'Café Azzura';\n          setCafeName(nameVal);`
  );
}

// 4. Replace CAFE_NAME with cafeName
content = content.replace(/\{CAFE_NAME\}/g, '{cafeName}');
content = content.replace(/<h2>\{CAFE_NAME\}<\/h2>/, '<h2>{cafeName}</h2>'); // Actually this is covered by the global one.

// 5. Add Bottom Navigation Bar inside the return (in the main browsing layout)
const bottomBarHtml = `
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
`;

if (!content.includes('to-bottom-nav')) {
  content = content.replace(
    /\{cart\.length > 0 && \(\s*<motion\.button className="to-fab"/,
    bottomBarHtml + `\n      {cart.length > 0 && (\n        <motion.button className="to-fab"`
  );
}

fs.writeFileSync('src/pages/TableOrderPage.jsx', content);
console.log("Patched TableOrderPage for bottom nav and cafe name");
