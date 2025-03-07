
import { Routes, Route } from 'react-router-dom';
import { Toaster } from './components/ui/toaster';
import { AuthProvider, useAuth } from './AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import { useMediaQuery } from './hooks/useMediaQuery';

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
import Projects from './pages/Projects';
import Forge from './pages/Forge';

import './App.css';

// Inner component that uses the auth context
const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <>
      {<Navbar />}
      <BetaIndicator />
      <div className={`${isMobile ? "pb-16 mobile-page-padding" : "fixed-nav-content"}`}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Explore />} />
          <Route path="/signup" element={<Explore />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/matches" element={<Matches />} />
          <Route path="/lab" element={<ExperimentLab />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/project/:id" element={<ProjectDetail />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/forge/:projectId" element={<Forge />} />
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
