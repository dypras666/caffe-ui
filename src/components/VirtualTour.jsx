import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, MapPin, Eye } from 'lucide-react';
import './VirtualTour.css';

const VirtualTour = () => {
  const [currentSpot, setCurrentSpot] = useState(0);

  const tourSpots = [
    {
      name: 'Main Entrance',
      description: 'Step into our welcoming atmosphere with vintage décor and aromatic coffee scents',
      color: 'linear-gradient(135deg, #6F4E37 0%, #8B4513 100%)',
      image: '🚪',
    },
    {
      name: 'Coffee Bar',
      description: 'Watch our skilled baristas craft your perfect cup with precision and care',
      color: 'linear-gradient(135deg, #8B4513 0%, #A0522D 100%)',
      image: '☕',
    },
    {
      name: 'Cozy Seating Area',
      description: 'Comfortable leather sofas and warm lighting create the perfect relaxation spot',
      color: 'linear-gradient(135deg, #D4A574 0%, #DEB887 100%)',
      image: '🛋️',
    },
    {
      name: 'Garden Patio',
      description: 'Enjoy your coffee surrounded by lush greenery and natural sunlight',
      color: 'linear-gradient(135deg, #556B2F 0%, #6B8E23 100%)',
      image: '🌿',
    },
    {
      name: 'Private Lounge',
      description: 'Perfect for meetings or intimate gatherings with premium amenities',
      color: 'linear-gradient(135deg, #3E2723 0%, #4E342E 100%)',
      image: '🎩',
    },
  ];

  // Keyboard navigation
  useEffect(() => {
    const nextSpot = () => {
      setCurrentSpot((prev) => (prev + 1) % tourSpots.length);
    };

    const prevSpot = () => {
      setCurrentSpot((prev) => (prev - 1 + tourSpots.length) % tourSpots.length);
    };

    const handleKeyPress = (e) => {
      if (e.key === 'ArrowRight') nextSpot();
      if (e.key === 'ArrowLeft') prevSpot();
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [tourSpots.length]);

  const nextSpot = () => {
    setCurrentSpot((prev) => (prev + 1) % tourSpots.length);
  };

  const prevSpot = () => {
    setCurrentSpot((prev) => (prev - 1 + tourSpots.length) % tourSpots.length);
  };

  return (
    <section className="virtual-tour" id="tour">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <h2>Virtual Tour</h2>
        <p className="tour-subtitle">Explore Our Café From Anywhere</p>
      </motion.div>

      <motion.div
        className="tour-counter"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <span className="counter-current">{currentSpot + 1}</span>
        <span className="counter-separator">/</span>
        <span className="counter-total">{tourSpots.length}</span>
      </motion.div>

      <div className="tour-container">
        <motion.button
          className="tour-nav prev"
          onClick={prevSpot}
          whileHover={{ scale: 1.1, x: -5 }}
          whileTap={{ scale: 0.9 }}
        >
          <ChevronLeft size={40} />
        </motion.button>

        <div className="tour-viewer">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSpot}
              className="tour-spot"
              initial={{ opacity: 0, scale: 0.8, rotateY: 90 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              exit={{ opacity: 0, scale: 0.8, rotateY: -90 }}
              transition={{ duration: 0.5, type: 'spring' }}
              style={{ background: tourSpots[currentSpot].color }}
            >
              <motion.div
                className="tour-spot-emoji"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              >
                {tourSpots[currentSpot].image}
              </motion.div>

              <motion.div
                className="tour-spot-icon"
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <Eye size={60} />
              </motion.div>

              <motion.div
                className="tour-spot-info"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="spot-marker">
                  <MapPin size={24} />
                </div>
                <h3>{tourSpots[currentSpot].name}</h3>
                <p>{tourSpots[currentSpot].description}</p>
              </motion.div>

              <div className="tour-particles">
                {[...Array(15)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="particle"
                    animate={{
                      y: [0, -300],
                      x: [0, Math.random() * 100 - 50],
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0],
                    }}
                    transition={{
                      duration: Math.random() * 3 + 2,
                      repeat: Infinity,
                      delay: Math.random() * 2,
                    }}
                    style={{
                      left: `${Math.random() * 100}%`,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="tour-indicators">
            {tourSpots.map((_, index) => (
              <motion.button
                key={index}
                className={`indicator ${index === currentSpot ? 'active' : ''}`}
                onClick={() => setCurrentSpot(index)}
                whileHover={{ scale: 1.3 }}
                whileTap={{ scale: 0.9 }}
              />
            ))}
          </div>
        </div>

        <motion.button
          className="tour-nav next"
          onClick={nextSpot}
          whileHover={{ scale: 1.1, x: 5 }}
          whileTap={{ scale: 0.9 }}
        >
          <ChevronRight size={40} />
        </motion.button>
      </div>

      <motion.div
        className="tour-cta"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <motion.button
          className="btn btn-primary"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Experience 360° View
        </motion.button>
      </motion.div>
    </section>
  );
};

export default VirtualTour;
