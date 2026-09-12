import { motion, AnimatePresence } from 'framer-motion';
import { Coffee, Menu, X, User, LogIn, MapPin } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = ({ scrollToSection }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [cafeName, setCafeName] = useState('Cafe');
  const [customMenus, setCustomMenus] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const cached = sessionStorage.getItem('cafe_name');
    if (cached) { setCafeName(cached); }
    fetch('/api/settings/cafe_name').then(r => r.json()).then(d => {
      const n = d?.setting?.setting_value || d?.setting_value || d?.value || '';
      if (n) { setCafeName(n); sessionStorage.setItem('cafe_name', n); }
    }).catch(() => {});
    const saved = localStorage.getItem('selected_branch');
    if (saved) { try { setSelectedBranch(JSON.parse(saved)); } catch {} }

    // Fetch custom navigation menus
    fetch('/api/navigation').then(r => r.json()).then(d => {
      if (d?.menus?.length > 0) {
        setCustomMenus(d.menus);
      }
    }).catch(() => {});
  }, []);

  // Default fallback menus (used if API returns nothing)
  const defaultMenuItems = [
    { label: 'Home', url: '/#home' },
    { label: 'Menu', url: '/#menu' },
    { label: 'Blog', url: '/blog' },
    { label: 'Virtual Tour', url: '/#tour' },
    { label: 'Brew Service', url: '/#brew' },
    { label: 'Booking', url: '/#booking' },
    { label: 'Gallery', url: '/#gallery' },
    { label: 'Contact', url: '/#contact' },
  ];

  const menuItems = customMenus || defaultMenuItems;

  const handleMenuClick = (e, item) => {
    setIsOpen(false);

    const url = item.url || '';

    // External link
    if (url.startsWith('http')) {
      if (item.target === '_blank') {
        window.open(url, '_blank');
      } else {
        window.location.href = url;
      }
      e.preventDefault();
      return;
    }

    // Internal page link (e.g. /blog, /member/login)
    if (url.startsWith('/') && !url.includes('#')) {
      e.preventDefault();
      navigate(url);
      return;
    }

    // Hash link (e.g. /#menu, /#contact)
    if (url.includes('#')) {
      e.preventDefault();
      const sectionId = url.split('#')[1];

      // If we're on the landing page, scroll to section
      if (location.pathname === '/') {
        scrollToSection(sectionId);
      } else {
        // Navigate to home first, then scroll
        navigate('/');
        setTimeout(() => {
          const element = document.getElementById(sectionId);
          if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 300);
      }
      return;
    }
  };

  return (
    <motion.nav
      className="navbar"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      <div className="navbar-container">
        <motion.div
          className="navbar-logo"
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <Coffee size={32} />
          <span>{cafeName}</span>
        </motion.div>

        <div className={`navbar-menu ${isOpen ? 'active' : ''}`}>
          {menuItems.map((item, index) => (
            <motion.a
              key={item.id || index}
              href={item.url || '#'}
              target={item.target === '_blank' ? '_blank' : undefined}
              rel={item.target === '_blank' ? 'noopener noreferrer' : undefined}
              onClick={(e) => handleMenuClick(e, item)}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.1, color: '#D4A574' }}
            >
              {item.label || item.name}
            </motion.a>
          ))}
        </div>

        <div className="navbar-right">
          {/* Branch selector pill */}
          <Link
            to="/branches"
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              background: 'rgba(245,230,211,0.15)', border: '1px solid rgba(245,230,211,0.3)',
              borderRadius: 20, padding: '5px 10px', fontSize: 12, fontWeight: 600,
              color: '#F5E6D3', textDecoration: 'none', whiteSpace: 'nowrap',
            }}
          >
            <MapPin size={12} />
            {selectedBranch ? selectedBranch.name : 'Pilih Cabang'}
          </Link>

          {/* Member button — link ke halaman member */}
          {user ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Link to="/member/profile" className="member-btn active">
                <User size={16} />
                <span className="member-btn-name">{user.name.split(' ')[0]}</span>
              </Link>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Link to="/member/login" className="member-btn">
                <LogIn size={16} />
                <span className="member-btn-name">Member</span>
              </Link>
            </motion.div>
          )}

          <motion.button
            className="navbar-toggle"
            onClick={() => setIsOpen(!isOpen)}
            whileTap={{ scale: 0.9 }}
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </motion.button>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
