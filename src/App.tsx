
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Toaster } from './components/ui/toaster';
import { AuthProvider, useAuth } from './AuthContext';
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

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// Inner component that uses the auth context
const AppContent = () => {
  const { isAuthenticated } = useAuth();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const location = useLocation();
  
  // Only hide navbar on landing page and auth pages
  const isLandingPage = location.pathname === '/';
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
  const showNavbar = !isLandingPage && !isAuthPage && isAuthenticated;

  return (
    <>
      {showNavbar && <Navbar />}
      <div className={`app-content ${isMobile && showNavbar ? "pt-16 pb-20 mobile-page-padding" : showNavbar ? "fixed-nav-content" : ""}`}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Protected routes */}
          <Route path="/explore" element={
            <ProtectedRoute>
              <Explore />
            </ProtectedRoute>
          } />
          <Route path="/matches" element={
            <ProtectedRoute>
              <Matches />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/profile-page" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          <Route path="/project/:id" element={
            <ProtectedRoute>
              <ProjectDetail />
            </ProtectedRoute>
          } />
          <Route path="/projects" element={
            <ProtectedRoute>
              <Projects />
            </ProtectedRoute>
          } />
          <Route path="/forge/:projectId" element={
            <ProtectedRoute>
              <Forge />
            </ProtectedRoute>
          } />
          <Route path="/join-project/:shareCode" element={
            <ProtectedRoute>
              <JoinProject />
            </ProtectedRoute>
          } />
          <Route path="/communities" element={
            <ProtectedRoute>
              <Communities />
            </ProtectedRoute>
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
