import SEO from '../components/SEO';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Menu from '../components/Menu';
import VirtualTour from '../components/VirtualTour';
import BrewService from '../components/BrewService';
import Booking from '../components/Booking';
import Gallery from '../components/Gallery';
import Footer from '../components/Footer';
import MobileBottomNav from '../components/MobileBottomNav';

export default function LandingPage() {
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="app">
      <SEO />
      <Navbar scrollToSection={scrollToSection} />
      <Hero scrollToSection={scrollToSection} />
      <Menu />
      <VirtualTour />
      <BrewService />
      <Booking />
      <Gallery />
      <Footer />
      <MobileBottomNav scrollToSection={scrollToSection} />
    </div>
  );
}
