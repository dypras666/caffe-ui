import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Coffee } from 'lucide-react';
import SEO from '../components/SEO';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function NotFoundPage() {
  return (
    <div className="app">
      <SEO title="Halaman Tidak Ditemukan" description="Halaman yang Anda cari tidak ditemukan." />
      <Navbar scrollToSection={() => {}} />
      <main className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center px-4">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <Coffee className="w-20 h-20 mx-auto text-[var(--cafe-brown)] mb-6" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-8xl font-bold text-[var(--cafe-dark)] mb-2"
          >
            404
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-xl text-[var(--cafe-mocha)] mb-2"
          >
            Halaman Tidak Ditemukan
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-[var(--cafe-mocha)] mb-8"
          >
            Sepertinya kopi ini belum tersedia...
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Link to="/"
              className="inline-flex items-center gap-2 bg-[var(--cafe-brown)] text-white px-6 py-3 rounded-full font-medium hover:bg-[var(--cafe-dark)] transition-colors"
            >
              Kembali ke Beranda
            </Link>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
