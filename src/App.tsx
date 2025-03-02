import { Routes, Route } from 'react-router-dom';
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
import ProjectDetail from './pages/ProjectDetail';

import './App.css';

// Inner component that uses the auth context
const AppContent = () => {
  const { isAuthenticated } = useAuth();

  return (
    <>
      {isAuthenticated && <Navbar />}
      <BetaIndicator />
      <div className={isAuthenticated ? "fixed-nav-content" : ""}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/explore" element={<ProtectedRoute><Explore /></ProtectedRoute>} />
          <Route path="/matches" element={<ProtectedRoute><Matches /></ProtectedRoute>} />
          <Route path="/lab" element={<ProtectedRoute><ExperimentLab /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/project/:id" element={<ProjectDetail />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <Toaster />
    </>
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
