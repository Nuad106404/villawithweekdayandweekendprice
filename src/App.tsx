import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { VillaHero } from './components/villa/VillaHero';
import { VillaDetails } from './components/villa/VillaDetails';
import { BookingCard } from './components/booking/BookingCard';
import { ThemeProvider } from './context/ThemeContext';
import { Provider } from 'react-redux';
import { store } from './store';
import { ToastContainer } from 'react-toastify';
import { ErrorBoundary } from './components/error/ErrorBoundary';
import 'react-toastify/dist/ReactToastify.css';

// Lazy load components
const BookingPage = lazy(() => import('./pages/BookingPage'));
const CustomerInfoForm = lazy(() => import('./components/booking/CustomerInfoForm').then(module => ({ default: module.CustomerInfoForm })));
const PaymentMethod = lazy(() => import('./components/booking/PaymentMethod').then(module => ({ default: module.PaymentMethod })));
const BookingConfirmation = lazy(() => import('./components/booking/BookingConfirmation').then(module => ({ default: module.BookingConfirmation })));

// Admin components
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminBookings = lazy(() => import('./pages/admin/AdminBookings'));
const AdminVilla = lazy(() => import('./pages/admin/AdminVilla'));
const AdminBank = lazy(() => import('./pages/admin/AdminBank'));
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminRegister = lazy(() => import('./pages/admin/AdminRegister'));
const DashboardLayout = lazy(() => import('./components/admin/DashboardLayout').then(module => ({ default: module.default })));
const ProtectedRoute = lazy(() => import('./components/auth/ProtectedRoute'));

function HomePage() {
  return (
    <main className="relative">
      <VillaHero />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            <VillaDetails />
          </div>
          <div className="lg:col-span-4">
            <div className="sticky top-24">
              <BookingCard />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div className="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {!isAdminRoute && <Header />}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      <ErrorBoundary>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/booking" element={<BookingPage />} />
            <Route path="/booking/:id/customer-info" element={<CustomerInfoForm />} />
            <Route path="/booking/:id/payment" element={<PaymentMethod />} />
            <Route path="/booking/:id/confirmation" element={<BookingConfirmation />} />
            
            {/* Admin Auth Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/register" element={<AdminRegister />} />
            
            {/* Protected Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="bank" element={<AdminBank />} />
              <Route path="villa" element={<AdminVilla />} />
              <Route path="bookings" element={<AdminBookings />} />
            </Route>
            
            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <Router>
          <AppContent />
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;