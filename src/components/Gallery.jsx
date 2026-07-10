import { motion } from 'framer-motion';
import { useGallery, useStats } from '../hooks/useApi';
import './Gallery.css';

const Gallery = () => {
  const { data: galleryItems } = useGallery();
  const { data: statsData } = useStats();

  // Category colors mapping
  const categoryColors = {
    'Coffee': '#6F4E37',
    'Interior': '#D4A574',
    'Food': '#8B4513',
  };

  // Convert stats object to array
  const stats = statsData ? [
    { number: statsData.customers, label: 'Happy Customers' },
    { number: statsData.varieties, label: 'Coffee Varieties' },
    { number: `${statsData.experience} Years`, label: 'Experience' },
    { number: `${statsData.rating}★`, label: 'Average Rating' },
  ] : [];

  return (
    <section className="gallery-section" id="gallery">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <h2>Our Gallery</h2>
        <p className="gallery-subtitle">Moments That Matter</p>
      </motion.div>

      <div className="gallery-grid">
        {galleryItems && galleryItems.map((item, index) => (
          <motion.div
            key={item.id}
            className="gallery-item"
            style={{ backgroundColor: categoryColors[item.category] || '#6F4E37' }}
            initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            whileHover={{ scale: 1.05, rotate: 2, boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)' }}
          >
            <div className="gallery-img-wrap">
              {item.file_path ? (
                <img
                  src={item.url || item.file_path}
                  alt={item.title || ''}
                  className="gallery-img"
                />
              ) : (
                <motion.div
                  className="gallery-emoji"
                  animate={{
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: index * 0.5,
                  }}
                >
                  {item.image || '📸'}
                </motion.div>
              )}
            </div>
            <h3>{item.title || item.file_name || 'Gallery'}</h3>
            {item.description && <p className="gallery-desc">{item.description}</p>}
          </motion.div>
        ))}
      </div>

      <motion.div
        className="stats-container"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            className="stat-card"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            whileHover={{ y: -10, boxShadow: '0 20px 40px rgba(111, 78, 55, 0.2)' }}
          >
            <motion.h3
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 + 0.3, type: 'spring', stiffness: 200 }}
            >
              {stat.number}
            </motion.h3>
            <p>{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default Gallery;
