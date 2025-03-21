
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Explore from './pages/Explore';
import Index from './pages/Index';
import Matches from './pages/Matches';
import Projects from './pages/Projects';
import Forge from './pages/Forge';
import Profile from './pages/Profile';
import ProjectDetail from './pages/ProjectDetail';
import NotFound from './pages/NotFound';
import JoinProject from './pages/JoinProject';
import ExperimentLab from './pages/ExperimentLab';
import { Toaster } from './components/ui/toaster';
import Communities from './pages/Communities';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/join/:shareCode" element={<JoinProject />} />
            
            <Route
              path="/explore"
              element={
                <ProtectedRoute>
                  <Navbar />
                  <Explore />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/communities"
              element={
                <ProtectedRoute>
                  <Navbar />
                  <Communities />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/matches"
              element={
                <ProtectedRoute>
                  <Navbar />
                  <Matches />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/projects"
              element={
                <ProtectedRoute>
                  <Navbar />
                  <Projects />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/forge/:projectId"
              element={
                <ProtectedRoute>
                  <Navbar />
                  <Forge />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Navbar />
                  <Profile />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/project/:projectId"
              element={
                <ProtectedRoute>
                  <Navbar />
                  <ProjectDetail />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/experiments"
              element={
                <ProtectedRoute>
                  <Navbar />
                  <ExperimentLab />
                </ProtectedRoute>
              }
            />
            
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
          <Toaster />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
