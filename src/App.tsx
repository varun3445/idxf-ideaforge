
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Toaster } from './components/ui/toaster';
import { AuthProvider, useAuth } from './AuthContext';
import Navbar from './components/Navbar';
import { useMediaQuery } from './hooks/useMediaQuery';

import Index from './pages/Index';
import Explore from './pages/Explore';
import Matches from './pages/Matches';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import BetaIndicator from './components/BetaIndicator';
import ProjectDetail from './pages/ProjectDetail';
import Projects from './pages/Projects';
import Forge from './pages/Forge';
import JoinProject from './pages/JoinProject';
import Communities from './pages/Communities';

import './App.css';

// Inner component that uses the auth context
const AppContent = () => {
  const { isAuthenticated } = useAuth();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const location = useLocation();
  
  // Only hide navbar on landing page
  const showNavbar = location.pathname !== '/';

  return (
    <>
      {showNavbar && isAuthenticated && <Navbar />}
      {showNavbar && isAuthenticated && <BetaIndicator />}
      <div className={`${isMobile && showNavbar && isAuthenticated ? "pt-16 pb-16 mobile-page-padding" : showNavbar && isAuthenticated ? "fixed-nav-content" : ""}`}>
        <Routes>
          <Route path="/" element={<Index />} />
          {/* Redirect login and signup routes to explore */}
          <Route path="/login" element={<Navigate to="/explore" replace />} />
          <Route path="/signup" element={<Navigate to="/explore" replace />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/matches" element={<Matches />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/project/:id" element={<ProjectDetail />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/forge/:projectId" element={<Forge />} />
          <Route path="/join-project/:shareCode" element={<JoinProject />} />
          <Route path="/communities" element={<Communities />} />
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
