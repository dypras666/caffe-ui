import { motion } from 'framer-motion';
import { Coffee, Croissant, IceCream, Wine, Loader } from 'lucide-react';
import { useMenu, useSettings } from '../hooks/useApi';
import { mediaUrl } from '../lib/utils';
import './Menu.css';

const Menu = () => {
  const { data: menuItems, categories: catMap, loading, error } = useMenu();
  const settings = useSettings();
  const currencySymbol = settings.currency_symbol || 'Rp';

  // Category icons — map by keyword
  const getIcon = (name = '') => {
    const n = name.toLowerCase();
    if (n.includes('cold') || n.includes('iced') || n.includes('es')) return <IceCream size={40} />;
    if (n.includes('pastry') || n.includes('pastries') || n.includes('roti') || n.includes('cake') || n.includes('food')) return <Croissant size={40} />;
    if (n.includes('special') || n.includes('wine') || n.includes('cocktail')) return <Wine size={40} />;
    return <Coffee size={40} />;
  };

  const formatPrice = (price) => {
    const num = parseFloat(price || 0);
    if (currencySymbol === '$' || currencySymbol === 'USD') return `$${num.toFixed(2)}`;
    return `${currencySymbol} ${num.toLocaleString('id')}`;
  };

  // Build categories from real data
  const menuCategories = Object.entries(catMap || {}).map(([category, items]) => ({
    icon: getIcon(category),
    title: category,
    items: items
      .filter(item => item.is_available)
      .map(item => ({
        name: item.name,
        price: formatPrice(item.price),
        desc: item.description,
        image: item.image,
        available: item.is_available,
        popular: item.is_popular,
        variant_groups: item.variant_groups,
      })),
  })).filter(cat => cat.items.length > 0);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  if (loading) {
    return (
      <section className="menu-section" id="menu">
        <div className="menu-loading">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <Loader size={50} color="var(--cafe-brown)" />
          </motion.div>
          <p>Loading menu...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="menu-section" id="menu">
        <div className="menu-error">
          <p>❌ Error loading menu: {error}</p>
          <p>Using fallback menu...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="menu-section" id="menu">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <h2>Our Menu</h2>
        <p className="menu-subtitle">Crafted with Love, Served with Passion</p>
        {menuItems && (
          <p className="menu-count">✨ {menuItems.length} Items Available</p>
        )}
      </motion.div>

      <motion.div
        className="menu-grid"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
      >
        {menuCategories.map((category, catIndex) => (
          <motion.div
            key={catIndex}
            className="menu-category"
            variants={itemVariants}
            whileHover={{ y: -10, boxShadow: '0 20px 40px rgba(111, 78, 55, 0.2)' }}
          >
            <motion.div
              className="category-icon"
              whileHover={{ rotate: 360, scale: 1.2 }}
              transition={{ duration: 0.6 }}
            >
              {category.icon}
            </motion.div>
            <h3>{category.title}</h3>
            <div className="menu-items">
              {category.items.map((item, itemIndex) => (
                <motion.div
                  key={itemIndex}
                  className={`menu-item ${!item.available ? 'unavailable' : ''}`}
                  whileHover={{ x: 10, backgroundColor: 'rgba(212, 165, 116, 0.1)' }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="item-info">
                    <div className="item-name-row">
                      <h4>{item.name}</h4>
                      {item.popular && <span className="popular-badge">Popular</span>}
                    </div>
                    {item.desc && <p>{item.desc}</p>}
                    {!item.available && <span className="unavailable-tag">Currently Unavailable</span>}
                  </div>
                  <div className="item-right">
                    {item.image && (
                      <img
                        src={mediaUrl(item.image)}
                        alt={item.name}
                        className="item-thumb"
                      />
                    )}
                    <span className="item-price">{item.price}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        className="menu-cta"
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <motion.button
          className="btn btn-primary"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Download Full Menu
        </motion.button>
      </motion.div>
    </section>
  );
};

export default Menu;
