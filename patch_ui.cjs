const fs = require('fs');
let code = fs.readFileSync('src/pages/TableOrderPage.jsx', 'utf8');

// 1. Add imports
if (!code.includes("import { QRCodeSVG }")) {
  code = code.replace(
    "import { ShoppingBag, ChevronRight, Filter, ShoppingCart, Clock, Store, Utensils, Send, CheckCircle2, ChevronLeft, Minus, Plus, Search, MapPin, AlertCircle, X, ShieldAlert, BadgeInfo, Receipt, FileText, Smartphone, HandCoins, Info } from 'lucide-react';",
    "import { ShoppingBag, ChevronRight, Filter, ShoppingCart, Clock, Store, Utensils, Send, CheckCircle2, ChevronLeft, Minus, Plus, Search, MapPin, AlertCircle, X, ShieldAlert, BadgeInfo, Receipt, FileText, Smartphone, HandCoins, Info } from 'lucide-react';\nimport { QRCodeSVG } from 'qrcode.react';\nimport { generateDynamicQris } from '../lib/qris';"
  );
}

// 2. Add qrisString state
if (!code.includes("const [qrisString, setQrisString]")) {
  code = code.replace(
    "const [paymentSetting, setPaymentSetting] = useState('both');",
    "const [paymentSetting, setPaymentSetting] = useState('both');\n  const [qrisString, setQrisString] = useState('');"
  );
}

// 3. Set qrisString in useEffect
if (!code.includes("setQrisString(list.find(s => s.setting_key === 'qris_string')")) {
  code = code.replace(
    "setPaymentSetting(val);",
    "setPaymentSetting(val);\n          setQrisString(list.find(s => s.setting_key === 'qris_string')?.setting_value || '');"
  );
}

// 4. Update the success screen
const successStr = "<h2>Pesanan Diterima!</h2>";
const replacementStr = `<h2>Pesanan Diterima!</h2>
        <p className="to-order-num">#{orderNum}</p>
        <p className="to-success-msg">Pesanan Anda sedang diproses oleh barista kami.</p>
        <div className="to-success-eta">
          <Clock size={16} />
          <span>Estimasi siap 10–15 menit</span>
        </div>
        
        {paymentMode === 'kasir' && (
          <div className="to-success-pay-note">
            <Receipt size={16} />
            <span>Silakan bayar ke kasir</span>
          </div>
        )}
        
        {paymentMode === 'direct' && orderResult?.payment_method === 'qris' && qrisString && (
          <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'white', padding: '1rem', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#6F4E37', marginBottom: '0.5rem' }}>Scan untuk Bayar Rp {(orderResult?.total || 0).toLocaleString('id')}</span>
            <QRCodeSVG value={generateDynamicQris(qrisString, orderResult?.total || 0)} size={180} level="M" />
            <span style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.5rem', textAlign: 'center' }}>Gunakan aplikasi e-Wallet atau Mobile Banking Anda.</span>
          </div>
        )}
        {paymentMode === 'direct' && orderResult?.payment_method === 'qris' && !qrisString && (
          <div className="to-success-pay-note" style={{ background: '#fef2f2', color: '#b91c1c' }}>
            <span>Mohon maaf, QRIS belum dikonfigurasi. Silakan bayar ke kasir.</span>
          </div>
        )}`;

// replace the old success screen parts
// Wait, the old success screen looks like:
/*
        <h2>Pesanan Diterima!</h2>
        <p className="to-order-num">#{orderNum}</p>
        <p className="to-success-msg">Pesanan Anda sedang diproses oleh barista kami.</p>
        <div className="to-success-eta">
          <Clock size={16} />
          <span>Estimasi siap 10–15 menit</span>
        </div>
        {paymentMode === 'kasir' && (
          <div className="to-success-pay-note">
            <Receipt size={16} />
            <span>Silakan bayar ke kasir</span>
          </div>
        )}
*/
// It's safer to use regex or string indexing
const startIdx = code.indexOf('<h2>Pesanan Diterima!</h2>');
const endIdx = code.indexOf('<motion.button', startIdx);
if (startIdx > -1 && endIdx > -1) {
  code = code.substring(0, startIdx) + replacementStr + '\n        ' + code.substring(endIdx);
}

// Fix button stretching
// <motion.button
//   className="to-btn-primary"
//   style={{ marginTop: '2rem', maxWidth: '280px' }}
code = code.replace(
  "style={{ marginTop: '2rem', maxWidth: '280px' }}",
  "style={{ marginTop: '2rem', maxWidth: '280px', flex: '0 0 auto', padding: '14px 32px' }}"
);

fs.writeFileSync('src/pages/TableOrderPage.jsx', code);
