
import { Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from './components/ui/toaster';
import { AuthProvider, useAuth } from './AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

import Index from './pages/Index';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Explore from './pages/Explore';
import Matches from './pages/Matches';
import ExperimentLab from './pages/ExperimentLab';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import BetaIndicator from './components/BetaIndicator';

import './App.css';

const AppContent = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup' || location.pathname === '/';
  
  return (
    <div className="min-h-screen flex flex-col">
      <BetaIndicator />
      {isAuthenticated && <Navbar />}
      <div className={`flex-grow ${isAuthenticated && !isAuthPage ? 'ml-64' : ''}`}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/explore" element={<ProtectedRoute><Explore /></ProtectedRoute>} />
          <Route path="/matches" element={<ProtectedRoute><Matches /></ProtectedRoute>} />
          <Route path="/lab" element={<ProtectedRoute><ExperimentLab /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <Toaster />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
