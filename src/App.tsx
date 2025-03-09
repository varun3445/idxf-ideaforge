import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Index from './pages/Index';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Projects from './pages/Projects';
import Forge from './pages/Forge';
import Profile from './pages/Profile';
import Explore from './pages/Explore';
import Matches from './pages/Matches';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';
import JoinProject from './pages/JoinProject';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            
            <Route path="/" element={<ProtectedRoute />}>
              <Route path="/projects" element={<Projects />} />
              <Route path="/forge/:projectId" element={<Forge />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/matches" element={<Matches />} />
            </Route>
            
            <Route path="/join-project/:shareCode" element={<JoinProject />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        
        <Footer />
        <Toaster />
      </div>
    </Router>
  );
}

export default App;
