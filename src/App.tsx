
import { Routes, Route, useLocation } from 'react-router-dom';
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
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import BetaIndicator from './components/BetaIndicator';
import ProjectDetail from './pages/ProjectDetail';
import Projects from './pages/Projects';
import Forge from './pages/Forge';
import JoinProject from './pages/JoinProject';

import './App.css';

// Inner component that uses the auth context
const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const location = useLocation();
  
  // Hide navbar only on landing page
  const showNavbar = location.pathname !== '/';

  return (
    <>
      {showNavbar && isAuthenticated && <Navbar />}
      {showNavbar && isAuthenticated && <BetaIndicator />}
      <div className={`${isMobile && showNavbar && isAuthenticated ? "pb-16 mobile-page-padding" : showNavbar && isAuthenticated ? "fixed-nav-content" : ""}`}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route 
            path="/explore" 
            element={
              <ProtectedRoute>
                <Explore />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/matches" 
            element={
              <ProtectedRoute>
                <Matches />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/project/:id" 
            element={
              <ProtectedRoute>
                <ProjectDetail />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/projects" 
            element={
              <ProtectedRoute>
                <Projects />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/forge/:projectId" 
            element={
              <ProtectedRoute>
                <Forge />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/join-project/:shareCode" 
            element={
              <ProtectedRoute>
                <JoinProject />
              </ProtectedRoute>
            } 
          />
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
