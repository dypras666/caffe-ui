import { motion } from 'framer-motion';
import { Coffee, Star, MapPin, Clock, Phone, Share2, ArrowRight, Award, Leaf, Zap } from 'lucide-react';
import CoffeeCup3D from '../components/CoffeeCup3D';
import SEO from '../components/SEO';
import './PremiumLandingPage.css';

const MENU = [
  { name: 'Signature Espresso', desc: 'Single-origin Ethiopian, rich crema', price: 38000, tag: 'Bestseller', emoji: '☕' },
  { name: 'Velvet Latte', desc: 'House blend with microfoam art', price: 45000, tag: 'Favorite', emoji: '🥛' },
  { name: 'Cold Brew Reserve', desc: '18-hour slow-steeped, honey finish', price: 42000, tag: 'New', emoji: '🧊' },
  { name: 'Hazelnut Mocha', desc: 'Dark chocolate, roasted hazelnut', price: 48000, tag: null, emoji: '🍫' },
  { name: 'Matcha Cortado', desc: 'Ceremonial grade, oat milk', price: 52000, tag: 'Premium', emoji: '🍵' },
  { name: 'Vanilla Macchiato', desc: 'Madagascar vanilla, caramel drizzle', price: 44000, tag: null, emoji: '✨' },
];

const FEATURES = [
  { icon: Award, title: 'Award-Winning Beans', desc: 'Sourced directly from single-origin farms across 3 continents' },
  { icon: Leaf, title: 'Sustainably Sourced', desc: 'Every cup supports fair-trade farmers and eco practices' },
  { icon: Zap, title: 'Expert Baristas', desc: 'Our team trains 200+ hours before pulling your first shot' },
];

const TESTIMONIALS = [
  { name: 'Ariana S.', rating: 5, text: 'The espresso here is life-changing. I come every morning just for that crema.' },
  { name: 'Marco D.', rating: 5, text: 'Velvet Latte is unreal. Best coffee in the city, hands down.' },
  { name: 'Lina R.', rating: 5, text: 'Cozy, premium, and the cold brew reserve is absolutely stunning.' },
];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] },
});

export default function PremiumLandingPage() {
  return (
    <div className="premium-page">
      <SEO />

      {/* ── HERO ── */}
      <section className="p-hero">
        <div className="p-hero-bg" />
        <nav className="p-nav">
          <div className="p-nav-logo">
            <Coffee size={22} /> <span>Café Azzura</span>
          </div>
          <ul className="p-nav-links">
            <li><a href="#menu">Menu</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#visit">Visit</a></li>
          </ul>
          <a href="#visit" className="p-nav-cta">Reserve a Table</a>
        </nav>

        <div className="p-hero-inner">
          <motion.div
            className="p-hero-text"
            initial={{ opacity: 0, x: -60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="p-badge">
              <Star size={12} fill="currentColor" /> Premium Coffee Experience
            </span>
            <h1 className="p-hero-title">
              Crafted for<br />
              <em>True Coffee</em><br />
              Lovers
            </h1>
            <p className="p-hero-desc">
              Where artisanal technique meets single-origin beans — every cup
              is a ritual worth slowing down for.
            </p>
            <div className="p-hero-actions">
              <motion.a
                href="#menu"
                className="p-btn p-btn-primary"
                whileHover={{ scale: 1.04, boxShadow: '0 12px 40px rgba(111,78,55,0.45)' }}
                whileTap={{ scale: 0.97 }}
              >
                Explore Our Menu <ArrowRight size={16} />
              </motion.a>
              <motion.a
                href="#about"
                className="p-btn p-btn-ghost"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
              >
                Our Story
              </motion.a>
            </div>
            <div className="p-hero-stats">
              <div className="p-stat"><strong>12+</strong><span>Years of Excellence</span></div>
              <div className="p-stat-divider" />
              <div className="p-stat"><strong>30k+</strong><span>Happy Customers</span></div>
              <div className="p-stat-divider" />
              <div className="p-stat"><strong>4.9★</strong><span>Google Rating</span></div>
            </div>
          </motion.div>

          <motion.div
            className="p-hero-visual"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="p-hero-glow" />
            <div className="p-hero-ring p-ring-1" />
            <div className="p-hero-ring p-ring-2" />
            <CoffeeCup3D />
            <div className="p-hero-float-card fc-left">
              <span className="fc-emoji">🌿</span>
              <div>
                <strong>Single Origin</strong>
                <small>Ethiopia Yirgacheffe</small>
              </div>
            </div>
            <div className="p-hero-float-card fc-right">
              <span className="fc-emoji">🏆</span>
              <div>
                <strong>Award 2024</strong>
                <small>Best Specialty Café</small>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          className="p-hero-scroll"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="p-scroll-dot" />
        </motion.div>
      </section>

      {/* ── FEATURES ── */}
      <section className="p-features" id="about">
        <div className="p-container">
          {FEATURES.map((f, i) => (
            <motion.div key={f.title} className="p-feature-card" {...fadeUp(i * 0.1)}>
              <div className="p-feature-icon">
                <f.icon size={24} />
              </div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── MENU ── */}
      <section className="p-menu" id="menu">
        <div className="p-container">
          <motion.div className="p-section-head" {...fadeUp()}>
            <span className="p-label">The Menu</span>
            <h2>Signature Selections</h2>
            <p>Every recipe refined over hundreds of iterations until it was perfect.</p>
          </motion.div>
          <div className="p-menu-grid">
            {MENU.map((item, i) => (
              <motion.div key={item.name} className="p-menu-card" {...fadeUp(i * 0.07)}>
                <div className="p-menu-emoji">{item.emoji}</div>
                <div className="p-menu-info">
                  <div className="p-menu-title-row">
                    <h3>{item.name}</h3>
                    {item.tag && <span className="p-menu-tag">{item.tag}</span>}
                  </div>
                  <p>{item.desc}</p>
                </div>
                <div className="p-menu-price">
                  Rp {item.price.toLocaleString('id-ID')}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AMBIANCE STRIP ── */}
      <section className="p-ambiance">
        <div className="p-ambiance-inner">
          <motion.div className="p-ambiance-text" {...fadeUp()}>
            <span className="p-label">The Space</span>
            <h2>A Place to Breathe</h2>
            <p>
              Whether you need quiet focus or a warm conversation, our space is designed
              to match the rhythm of your day — warm lighting, natural wood, and the
              constant hum of a perfectly dialled espresso machine.
            </p>
            <a href="#visit" className="p-btn p-btn-primary">
              Find Us <ArrowRight size={16} />
            </a>
          </motion.div>
          <motion.div className="p-ambiance-mosaic" {...fadeUp(0.15)}>
            <div className="p-mosaic-cell p-mosaic-large">
              <div className="p-mosaic-img p-mosaic-img-1" />
            </div>
            <div className="p-mosaic-col">
              <div className="p-mosaic-cell">
                <div className="p-mosaic-img p-mosaic-img-2" />
              </div>
              <div className="p-mosaic-cell">
                <div className="p-mosaic-img p-mosaic-img-3" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="p-testimonials">
        <div className="p-container">
          <motion.div className="p-section-head" {...fadeUp()}>
            <span className="p-label">Stories</span>
            <h2>What Our Guests Say</h2>
          </motion.div>
          <div className="p-testi-grid">
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={t.name} className="p-testi-card" {...fadeUp(i * 0.1)}>
                <div className="p-testi-stars">
                  {Array.from({ length: t.rating }).map((_, si) => (
                    <Star key={si} size={14} fill="currentColor" />
                  ))}
                </div>
                <p>"{t.text}"</p>
                <strong>{t.name}</strong>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VISIT ── */}
      <section className="p-visit" id="visit">
        <div className="p-container">
          <motion.div className="p-visit-inner" {...fadeUp()}>
            <div className="p-visit-info">
              <span className="p-label">Find Us</span>
              <h2>Come Visit</h2>
              <div className="p-visit-row">
                <MapPin size={18} />
                <span>Jl. Kopi Nusantara No. 12, Jakarta Selatan</span>
              </div>
              <div className="p-visit-row">
                <Clock size={18} />
                <span>Mon–Fri 07:00–22:00 · Sat–Sun 08:00–23:00</span>
              </div>
              <div className="p-visit-row">
                <Phone size={18} />
                <span>+62 812-3456-7890</span>
              </div>
              <div className="p-visit-row">
                <Share2 size={18} />
                <span>@cafeazzura.official</span>
              </div>
            </div>
            <div className="p-visit-cta-card">
              <Coffee size={40} />
              <h3>Reserve Your Table</h3>
              <p>Skip the queue — book a spot for your perfect coffee moment.</p>
              <motion.button
                className="p-btn p-btn-primary p-btn-full"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Book Now
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="p-footer">
        <div className="p-footer-inner">
          <div className="p-footer-brand">
            <Coffee size={20} /> <span>Café Azzura</span>
          </div>
          <p>© 2025 Café Azzura. All rights reserved.</p>
          <p className="p-footer-sub">Premium Coffee Experience · Est. 2013</p>
        </div>
      </footer>
    </div>
  );
}
