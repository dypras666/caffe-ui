import { motion, AnimatePresence } from 'framer-motion';
import { Coffee, Menu, X, User, LogIn, MapPin } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = ({ scrollToSection }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [cafeName, setCafeName] = useState('Cafe');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/settings/cafe_name').then(r => r.json()).then(d => {
      setCafeName(d?.setting_value || d?.value || 'Cafe');
    }).catch(() => {});
    const saved = localStorage.getItem('selected_branch');
    if (saved) { try { setSelectedBranch(JSON.parse(saved)); } catch {} }
  }, []);

  const menuItems = [
    { name: 'Home', id: 'home' },
    { name: 'Menu', id: 'menu' },
    { name: 'Blog', id: 'blog', link: '/blog' },
    { name: 'Virtual Tour', id: 'tour' },
    { name: 'Brew Service', id: 'brew' },
    { name: 'Booking', id: 'booking' },
    { name: 'Gallery', id: 'gallery' },
    { name: 'Contact', id: 'contact' },
  ];

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
          {menuItems.map((item, index) =>
            item.link ? (
              <Link key={item.id} to={item.link} onClick={() => setIsOpen(false)}
                className="navbar-link"
                style={{ opacity: 1 }}
              >
                {item.name}
              </Link>
            ) : (
              <motion.a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(item.id);
                  setIsOpen(false);
                }}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.1, color: '#D4A574' }}
              >
                {item.name}
              </motion.a>
            )
          )}
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
