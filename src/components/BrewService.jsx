import { motion } from 'framer-motion';
import { Coffee, Droplets, Flame, Timer, Thermometer, Heart } from 'lucide-react';
import './BrewService.css';

const BrewService = () => {
  const brewSteps = [
    {
      icon: <Coffee size={40} />,
      title: 'Select Beans',
      description: 'Choose from our premium selection of ethically sourced beans',
    },
    {
      icon: <Thermometer size={40} />,
      title: 'Grind Fresh',
      description: 'Ground to perfection moments before brewing',
    },
    {
      icon: <Droplets size={40} />,
      title: 'Perfect Water',
      description: 'Filtered water heated to the optimal temperature',
    },
    {
      icon: <Timer size={40} />,
      title: 'Precise Timing',
      description: 'Carefully timed extraction for maximum flavor',
    },
    {
      icon: <Flame size={40} />,
      title: 'Expert Brewing',
      description: 'Crafted by our certified baristas',
    },
    {
      icon: <Heart size={40} />,
      title: 'Served Fresh',
      description: 'Delivered with love and attention to detail',
    },
  ];

  const brewMethods = [
    { name: 'Espresso', time: '25-30s', temp: '90-95°C' },
    { name: 'Pour Over', time: '3-4 min', temp: '92-96°C' },
    { name: 'French Press', time: '4-5 min', temp: '90-95°C' },
    { name: 'Cold Brew', time: '12-24 hrs', temp: 'Cold' },
  ];

  return (
    <section className="brew-service" id="brew">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <h2>Our Brew Service</h2>
        <p className="brew-subtitle">The Art & Science of Perfect Coffee</p>
      </motion.div>

      <div className="brew-content">
        <motion.div
          className="brew-steps"
          initial={{ opacity: 0, x: -100 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          {brewSteps.map((step, index) => (
            <motion.div
              key={index}
              className="brew-step"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, duration: 0.5 }}
              whileHover={{ x: 10, backgroundColor: 'rgba(212, 165, 116, 0.1)' }}
            >
              <motion.div
                className="step-number"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
              >
                {index + 1}
              </motion.div>
              <motion.div
                className="step-icon"
                whileHover={{ rotate: 360, scale: 1.2 }}
                transition={{ duration: 0.6 }}
              >
                {step.icon}
              </motion.div>
              <div className="step-content">
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="brew-animation"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="coffee-cup-container">
            <motion.div
              className="coffee-cup"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <div className="cup-body">
                <motion.div
                  className="coffee-liquid"
                  initial={{ height: 0 }}
                  whileInView={{ height: '70%' }}
                  viewport={{ once: true }}
                  transition={{ duration: 2, delay: 0.5 }}
                />
              </div>
              <div className="cup-handle" />

              <motion.div
                className="steam"
                animate={{
                  y: [-20, -60],
                  opacity: [0.8, 0],
                  scale: [1, 1.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeOut',
                }}
                style={{ left: '30%' }}
              />
              <motion.div
                className="steam"
                animate={{
                  y: [-20, -60],
                  opacity: [0.8, 0],
                  scale: [1, 1.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: 0.3,
                  ease: 'easeOut',
                }}
                style={{ left: '50%' }}
              />
              <motion.div
                className="steam"
                animate={{
                  y: [-20, -60],
                  opacity: [0.8, 0],
                  scale: [1, 1.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: 0.6,
                  ease: 'easeOut',
                }}
                style={{ left: '70%' }}
              />
            </motion.div>
          </div>

          <div className="brew-methods">
            <h3>Brew Methods</h3>
            {brewMethods.map((method, index) => (
              <motion.div
                key={index}
                className="method-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 + 1, duration: 0.5 }}
                whileHover={{ scale: 1.05, boxShadow: '0 10px 30px rgba(111, 78, 55, 0.2)' }}
              >
                <h4>{method.name}</h4>
                <div className="method-details">
                  <span><Timer size={16} /> {method.time}</span>
                  <span><Thermometer size={16} /> {method.temp}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div
        className="brew-cta"
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
          Order Your Custom Brew
        </motion.button>
      </motion.div>
    </section>
  );
};

export default BrewService;
