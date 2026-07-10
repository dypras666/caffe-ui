import { motion } from 'framer-motion';
import { Calendar, Clock, Users, User, Mail, Phone, MessageSquare, CheckCircle, Loader, MapPin } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import './Booking.css';

const Booking = () => {
  const { user } = useAuth();
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    date: '',
    time: '',
    guests: '2',
    message: '',
    branch_id: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('selected_branch');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSelectedBranch(parsed);
        setFormData(prev => ({ ...prev, branch_id: parsed.id }));
      } catch {}
    }
    api.get('/branches/public')
      .then(r => setBranches(r.data.branches || []))
      .catch(() => {});
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'branch_id') {
      const branch = branches.find(b => b.id === Number(value));
      setSelectedBranch(branch);
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/bookings', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        booking_date: formData.date,
        booking_time: formData.time + ':00',
        guests: parseInt(formData.guests),
        branch_id: formData.branch_id || null,
        special_request: formData.message || null,
      });
      setBookingResult(data.booking);
      setSubmitted(true);

      setTimeout(() => {
        setSubmitted(false);
        setBookingResult(null);
        setFormData({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '', date: '', time: '', guests: '2', message: '', branch_id: selectedBranch?.id || '' });
      }, 6000);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Gagal membuat booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="booking-section" id="booking">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <h2>Reserve Your Table</h2>
        <p className="booking-subtitle">Book Your Perfect Coffee Experience</p>
      </motion.div>

      <div className="booking-container">
        <motion.div
          className="booking-info"
          initial={{ opacity: 0, x: -100 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="info-card"
            whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(111, 78, 55, 0.2)' }}
          >
            <Calendar size={50} className="info-icon" />
            <h3>Opening Hours</h3>
            <p>Monday - Friday: 7:00 AM - 10:00 PM</p>
            <p>Saturday - Sunday: 8:00 AM - 11:00 PM</p>
          </motion.div>

          <motion.div
            className="info-card"
            whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(111, 78, 55, 0.2)' }}
          >
            <Users size={50} className="info-icon" />
            <h3>Group Reservations</h3>
            <p>Private events available</p>
            <p>Up to 50 guests</p>
          </motion.div>

          <motion.div
            className="info-card"
            whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(111, 78, 55, 0.2)' }}
          >
            <Phone size={50} className="info-icon" />
            <h3>Contact Us</h3>
            <p>+1 (555) 123-4567</p>
            <p>info@cafeazzura.com</p>
          </motion.div>
        </motion.div>

        <motion.div
          className="booking-form-container"
          initial={{ opacity: 0, x: 100 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          {!submitted ? (
            <form className="booking-form" onSubmit={handleSubmit}>
              <motion.div
                className="form-group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                <label>
                  <User size={20} />
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  required
                />
              </motion.div>

              <motion.div
                className="form-row"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <div className="form-group">
                  <label>
                    <Mail size={20} />
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    <Phone size={20} />
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 000-0000"
                    required
                  />
                </div>
              </motion.div>

              <motion.div
                className="form-row"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                <div className="form-group">
                  <label>
                    <Calendar size={20} />
                    Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    <Clock size={20} />
                    Time
                  </label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    required
                  />
                </div>
              </motion.div>

              <motion.div
                className="form-group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
              >
                <label>
                  <Users size={20} />
                  Number of Guests
                </label>
                <select name="guests" value={formData.guests} onChange={handleChange}>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'Guest' : 'Guests'}
                    </option>
                  ))}
                </select>
              </motion.div>

              <motion.div
                className="form-group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
              >
                <label>
                  <MapPin size={20} />
                  Pilih Cabang
                </label>
                <select name="branch_id" value={formData.branch_id} onChange={handleChange} required>
                  <option value="">— Pilih Cabang —</option>
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}{b.city ? ` (${b.city})` : ''}</option>
                  ))}
                </select>
              </motion.div>

              <motion.div
                className="form-group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
              >
                <label>
                  <MessageSquare size={20} />
                  Special Requests
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Any special requests or dietary requirements?"
                  rows="4"
                />
              </motion.div>

              <motion.button
                type="submit"
                className="btn btn-primary submit-btn"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.7 }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader size={20} className="spinner" />
                    Processing...
                  </>
                ) : (
                  'Confirm Reservation'
                )}
              </motion.button>
              {error && (
                <div className="form-error">
                  ❌ {error}
                </div>
              )}
            </form>
          ) : (
            <motion.div
              className="success-message"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                transition={{ duration: 0.6 }}
              >
                <CheckCircle size={80} />
              </motion.div>
              <h3>Booking Confirmed!</h3>
              <p>Thank you for your reservation.</p>
              <p>No. Booking: <strong>{bookingResult?.booking_number || `#${bookingResult?.id}`}</strong></p>
              <p>We've sent a confirmation to your email.</p>
              <p className="success-note">Status: Pending Confirmation</p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default Booking;
