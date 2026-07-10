import { motion } from 'framer-motion';
import { Home, Menu, Eye, Coffee, Calendar, Image } from 'lucide-react';
import { useState, useEffect } from 'react';
import './MobileBottomNav.css';

const MobileBottomNav = ({ scrollToSection }) => {
  const [activeTab, setActiveTab] = useState('home');

  // Scroll spy to detect active section
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'menu', 'tour', 'brew', 'booking', 'gallery'];
      const scrollPosition = window.scrollY + 200;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i]);
        if (section && section.offsetTop <= scrollPosition) {
          setActiveTab(sections[i]);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'home', icon: Home, label: 'Home', badge: null },
    { id: 'menu', icon: Menu, label: 'Menu', badge: '16' },
    { id: 'tour', icon: Eye, label: 'Tour', badge: '5' },
    { id: 'brew', icon: Coffee, label: 'Brew', badge: null },
    { id: 'booking', icon: Calendar, label: 'Book', badge: null },
    { id: 'gallery', icon: Image, label: 'Gallery', badge: '6' },
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    scrollToSection(id);

    // Haptic feedback for mobile devices
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

  return (
    <motion.nav
      className="mobile-bottom-nav"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="mobile-nav-container">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <motion.button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => handleNavClick(item.id)}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <motion.div
                className="nav-icon-wrapper"
                animate={isActive ? { scale: 1.2, y: -5 } : { scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Icon size={24} className="nav-icon" />
                {isActive && (
                  <motion.div
                    className="active-indicator"
                    layoutId="activeIndicator"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                {item.badge && (
                  <motion.span
                    className="nav-badge"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.05 + 0.2, type: 'spring' }}
                  >
                    {item.badge}
                  </motion.span>
                )}
              </motion.div>
              <motion.span
                className="nav-label"
                animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0.7, y: 2 }}
              >
                {item.label}
              </motion.span>
            </motion.button>
          );
        })}
      </div>

      {/* Floating Action Button */}
      <motion.button
        className="fab"
        whileHover={{ scale: 1.1, rotate: 90 }}
        whileTap={{ scale: 0.9 }}
        animate={{
          boxShadow: [
            '0 5px 20px rgba(111, 78, 55, 0.3)',
            '0 8px 30px rgba(111, 78, 55, 0.5)',
            '0 5px 20px rgba(111, 78, 55, 0.3)',
          ],
        }}
        transition={{ duration: 2, repeat: Infinity }}
        onClick={() => handleNavClick('booking')}
      >
        <Calendar size={28} />
      </motion.button>
    </motion.nav>
  );
};

export default MobileBottomNav;
