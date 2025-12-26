
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { UserRole } from './types';
import Login from './pages/Login';
import Register from './pages/Register';
import LandingPage from './pages/LandingPage';
import DonorDashboard from './pages/donor/Dashboard';
import CreatePost from './pages/donor/CreatePost';
import DonorHistory from './pages/donor/History';
import NgoDashboard from './pages/ngo/Dashboard';
import AdminDashboard from './pages/admin/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import DistributeFood from './pages/ngo/Distribute';
import DeliveryPage from './pages/ngo/DeliveryPage';
import DistributeNGOLogin from './pages/DistributeNGOLogin';
import DistributeNGOSignup from './pages/DistributeNGOSignup';
import RecipientLogin from './pages/recipient/Login';
import RecipientRegister from './pages/recipient/Register';
import RecipientDashboard from './pages/recipient/Dashboard';
import Profile from './pages/Profile';
import { Layout } from './components/Layout';
import { AuthProvider, useAuth } from './context/AuthContext';

// Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRoles }: { children?: React.ReactNode, allowedRoles?: UserRole[] }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to their appropriate dashboard if they try to access a wrong route
    if (user.role === UserRole.ADMIN) return <Navigate to="/admin" replace />;
    if (user.role === UserRole.NGO) return <Navigate to="/ngo" replace />;
    if (user.role === UserRole.DONOR) return <Navigate to="/donor" replace />;
    if (user.role === UserRole.RECIPIENT) return <Navigate to="/recipient" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/distribute-ngologin" element={<DistributeNGOLogin />} />
          <Route path="/distribute-ngosignup" element={<DistributeNGOSignup />} />
          <Route path="/recipient-login" element={<RecipientLogin />} />
          <Route path="/recipient-register" element={<RecipientRegister />} />

          {/* Shared Routes */}
          <Route path="/profile" element={
             <ProtectedRoute>
               <Layout>
                 <Profile />
               </Layout>
             </ProtectedRoute>
          } />

          {/* Donor Routes */}
          <Route path="/donor" element={
            <ProtectedRoute allowedRoles={[UserRole.DONOR]}>
              <Layout>
                <DonorDashboard />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/donor/create" element={
            <ProtectedRoute allowedRoles={[UserRole.DONOR]}>
              <Layout>
                <CreatePost />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/donor/history" element={
            <ProtectedRoute allowedRoles={[UserRole.DONOR]}>
              <Layout>
                <DonorHistory />
              </Layout>
            </ProtectedRoute>
          } />

          {/* NGO Routes */}
          <Route path="/ngo" element={
            <ProtectedRoute allowedRoles={[UserRole.NGO]}>
              <Layout>
                <NgoDashboard />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/ngo/distribute" element={
            <ProtectedRoute allowedRoles={[UserRole.NGO]}>
              <Layout>
                <DistributeFood />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/ngo/deliver/:recipientId" element={
            <ProtectedRoute allowedRoles={[UserRole.NGO]}>
              <Layout>
                <DeliveryPage />
              </Layout>
            </ProtectedRoute>
          } />

          {/* Recipient Routes (Orphanages) */}
          <Route path="/recipient" element={
            <ProtectedRoute allowedRoles={[UserRole.RECIPIENT]}>
              <Layout>
                <RecipientDashboard />
              </Layout>
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
              <Layout>
                <AdminDashboard />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/admin/users" element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
              <Layout>
                <UserManagement />
              </Layout>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
