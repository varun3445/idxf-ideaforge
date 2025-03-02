
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Index from './pages/Index';
import Explore from './pages/Explore';
import Matches from './pages/Matches';
import ExperimentLab from './pages/ExperimentLab';
import NotFound from './pages/NotFound';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import { useLocation } from 'react-router-dom';

function App() {
  const location = useLocation();
  const showNavbar = !['/', '/login', '/signup'].includes(location.pathname);
  
  return (
    <div className="min-h-screen flex">
      {showNavbar && <Navbar />}
      <main className={`flex-1 ${showNavbar ? 'md:ml-20' : ''}`}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
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
          <Route path="/lab" element={
            <ProtectedRoute>
              <ExperimentLab />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
