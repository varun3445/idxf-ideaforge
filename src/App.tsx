
import { Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from './components/ui/toaster';
import { AuthProvider } from './AuthContext';
import Navbar from './components/Navbar';
import { useMediaQuery } from './hooks/useMediaQuery';

import Index from './pages/Index';
import Explore from './pages/Explore';
import Matches from './pages/Matches';
import Profile from './pages/Profile';
import ProfilePage from './pages/ProfilePage';
import NotFound from './pages/NotFound';
import ProjectDetail from './pages/ProjectDetail';
import Projects from './pages/Projects';
import Forge from './pages/Forge';
import JoinProject from './pages/JoinProject';
import Communities from './pages/Communities';
import Login from './pages/Login';
import Signup from './pages/Signup';

import './App.css';

// Inner component that uses the auth context
const AppContent = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const location = useLocation();
  
  // Only hide navbar on landing page and auth pages
  const isLandingPage = location.pathname === '/';
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
  // Authentication is now disabled - we always show navbar except on landing/auth pages
  const showNavbar = !isLandingPage && !isAuthPage;

  return (
    <>
      {showNavbar && <Navbar />}
      <div className={`app-content ${isMobile && showNavbar ? "pt-16 pb-20 mobile-page-padding" : showNavbar ? "fixed-nav-content" : ""}`}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* All routes are now accessible without login */}
          <Route path="/explore" element={<Explore />} />
          <Route path="/matches" element={<Matches />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile-page" element={<ProfilePage />} />
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
