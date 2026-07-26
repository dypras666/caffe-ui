import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import PremiumLandingPage from './pages/PremiumLandingPage';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <PremiumLandingPage />
    </HelmetProvider>
  </StrictMode>
);
