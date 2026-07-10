import { BrowserRouter, Routes, Route, useSearchParams, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import BlogPage from './pages/BlogPage';
import PostDetailPage from './pages/PostDetailPage';
import TableOrderPage from './pages/TableOrderPage';
import NotFoundPage from './pages/NotFoundPage';
import MemberLoginPage from './pages/member/MemberLoginPage';
import MemberProfilePage from './pages/member/MemberProfilePage';
import MemberTopupPage from './pages/member/MemberTopupPage';
import MemberOrdersPage from './pages/member/MemberOrdersPage';
import MemberBookingsPage from './pages/member/MemberBookingsPage';
import BranchSelectorPage from './pages/BranchSelectorPage';
import KasirLoginPage from './pages/kasir/KasirLoginPage';
import KasirDashboardPage from './pages/kasir/KasirDashboardPage';
import SetupWizardPage from './pages/SetupWizardPage';
import SEO from './components/SEO';
import './App.css';

export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<RouterRoot />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<PostDetailPage />} />
            <Route path="/table-order" element={<TableOrderPage />} />

            {/* Member portal */}
            <Route path="/member" element={<MemberRoute />} />
            <Route path="/member/login" element={<MemberLoginPage />} />
            <Route
              path="/member/profile"
              element={<RequireMember><MemberProfilePage /></RequireMember>}
            />
            <Route
              path="/member/bookings"
              element={<RequireMember><MemberBookingsPage /></RequireMember>}
            />
            <Route
              path="/member/orders"
              element={<RequireMember><MemberOrdersPage /></RequireMember>}
            />
            <Route
              path="/member/topup"
              element={<RequireMember><MemberTopupPage /></RequireMember>}
            />

            {/* Branch selector */}
            <Route path="/branches" element={<BranchSelectorPage />} />

            {/* Kasir routes */}
            <Route path="/kasir" element={<Navigate to="/kasir/dashboard" replace />} />
            <Route path="/kasir/login" element={<KasirLoginPage />} />
            <Route path="/kasir/dashboard" element={<RequireStaff><KasirDashboardPage /></RequireStaff>} />

            {/* Setup Wizard */}
            <Route path="/setup" element={<SetupWizardPage />} />

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
}

function RouterRoot() {
  const [searchParams] = useSearchParams();
  const qrToken = searchParams.get('qr');
  if (qrToken) return <TableOrderPage />;
  return <LandingPage />;
}

function MemberRoute() {
  const { user } = useAuth();
  return <Navigate to={user ? '/member/profile' : '/member/login'} replace />;
}

function RequireMember({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/member/login" replace />;
  return children;
}

function RequireStaff({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/kasir/login" replace />;
  if (user.role !== 'admin' && user.role !== 'kasir') return <Navigate to="/member/profile" replace />;
  return children;
}
