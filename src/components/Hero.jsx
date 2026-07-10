import { motion } from 'framer-motion';
import { Coffee, ChevronDown } from 'lucide-react';
import './Hero.css';

const Hero = ({ scrollToSection }) => {
  const coffeeBeans = Array.from({ length: 20 }, (_, i) => i);

  return (
    <section className="hero" id="home">
      <div className="hero-beans">
        {coffeeBeans.map((bean) => (
          <motion.div
            key={bean}
            className="coffee-bean"
            initial={{ y: -100, opacity: 0, rotate: 0 }}
            animate={{
              y: [null, window.innerHeight + 100],
              opacity: [0, 1, 1, 0],
              rotate: [0, 360],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: 'linear',
            }}
            style={{
              left: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      <div className="hero-content">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        >
          <motion.div
            className="hero-icon"
            animate={{
              rotate: [0, 10, -10, 10, 0],
              scale: [1, 1.1, 1, 1.1, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <Coffee size={80} />
          </motion.div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          Welcome to Café Azzura
        </motion.h1>

        <motion.p
          className="hero-subtitle"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          Where Every Sip Tells a Story
        </motion.p>

        <motion.p
          className="hero-description"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.7 }}
        >
          Experience the perfect blend of artisanal coffee, cozy ambiance, and exceptional service
        </motion.p>

        <motion.div
          className="hero-buttons"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.9 }}
        >
          <motion.button
            className="btn btn-primary"
            whileHover={{ scale: 1.05, boxShadow: '0 10px 30px rgba(111, 78, 55, 0.3)' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => scrollToSection('menu')}
          >
            Explore Menu
          </motion.button>
          <motion.button
            className="btn btn-secondary"
            whileHover={{ scale: 1.05, boxShadow: '0 10px 30px rgba(212, 165, 116, 0.3)' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => scrollToSection('booking')}
          >
            Book a Table
          </motion.button>
        </motion.div>

        <motion.div
          className="hero-scroll"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          onClick={() => scrollToSection('menu')}
        >
          <ChevronDown size={32} />
        </motion.div>
      </div>

      <div className="hero-overlay"></div>
    </section>
  );
};

export default Hero;
