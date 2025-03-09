
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
import Projects from './pages/Projects';
import Forge from './pages/Forge';

import './App.css';

// Inner component that uses the auth context
const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const location = useLocation();
  
  // Hide navbar on landing page
  const showNavbar = location.pathname !== '/';

  return (
    <>
      {showNavbar && <Navbar />}
      {showNavbar && <BetaIndicator />}
      <div className={`${isMobile && showNavbar ? "pb-16 mobile-page-padding" : showNavbar ? "fixed-nav-content" : ""}`}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/matches" element={<Matches />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/forge/:projectId" element={<Forge />} />
          <Route path="/join/:shareCode" element={
            <div className="flex h-screen w-screen items-center justify-center flex-col">
              <h1 className="text-2xl font-bold mb-4">Join and collaborate on this project</h1>
              <p>This page is under construction. Soon you'll be able to join this project and collaborate with the team.</p>
            </div>
          } />
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
