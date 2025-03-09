
import { useLocation } from 'react-router-dom';
import { Grid, Users, Flame, User, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { useToast } from '../hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useMediaQuery } from '../hooks/useMediaQuery';

const Navbar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const navItems = [
    { path: '/explore', label: 'Explore', icon: Grid },
    { path: '/matches', label: 'Network', icon: Users },
    { path: '/lab', label: 'Forge', icon: Flame },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account"
      });
      navigate('/'); // Changed from '/login' to '/' to redirect to landing page
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Logout failed",
        description: "An error occurred while logging out",
        variant: "destructive"
      });
    }
  };

  // Mobile top profile button and bottom navigation
  if (isMobile) {
    return (
      <>
        {/* Mobile profile button (top right) */}
        <div className="fixed top-4 right-4 z-40">
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center justify-center w-10 h-10 rounded-full overflow-hidden bg-black shadow-lg border border-white/10"
            >
              {user && user.avatar ? (
                <img 
                  src={user.avatar}
                  alt={user.name || 'User'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={20} className="text-white" />
              )}
            </button>

            {profileOpen && (
              <div 
                className="absolute right-0 top-full mt-2 rounded-md shadow-lg bg-black/95 border border-white/10 z-50 w-36"
              >
                <div className="py-1">
                  <Link 
                    to="/profile" 
                    className="flex items-center px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors"
                    onClick={() => setProfileOpen(false)}
                  >
                    <Settings size={16} className="mr-2" />
                    Edit Profile
                  </Link>
                  <button 
                    onClick={() => {
                      setProfileOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/10 transition-colors"
                  >
                    <LogOut size={16} className="mr-2" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Mobile bottom navigation - improved spacing */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-black text-white border-t border-border/10 overflow-hidden">
          <div className="flex justify-around items-center h-16">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center w-full h-full ${
                  isActive(item.path)
                    ? 'text-primary'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                <item.icon size={20} className="mb-1" />
                <span className="text-xs">{item.label}</span>
              </Link>
            ))}
          </div>
        </nav>
      </>
    );
  }

  // Desktop sidebar navigation
  return (
    <nav className="fixed inset-y-0 left-0 z-40 flex flex-col bg-black text-white border-r border-border/10 w-64 hidden md:flex">
      <div className="flex flex-col h-full p-4">
        <Link 
          to="/explore" 
          className="text-xl font-bold tracking-tight transition-all mb-8 text-left"
        >
          <span className="text-white">Idea <span className="text-primary">Forge</span></span>
        </Link>
        
        <div className="flex flex-col space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-4 py-3 rounded-lg transition-all duration-300 flex items-center justify-start space-x-3 ${
                isActive(item.path)
                  ? 'bg-primary text-black font-medium'
                  : 'hover:bg-white/10'
              }`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </Link>
          ))}
        </div>

        <div className="mt-auto">
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center justify-start space-x-3 w-full p-3 rounded-lg hover:bg-white/10 transition-colors overflow-hidden"
            >
              <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-white/10 flex items-center justify-center">
                {user && user.avatar ? (
                  <img 
                    src={user.avatar}
                    alt={user.name || 'User'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={18} className="text-white" />
                )}
              </div>
              <div className="text-left overflow-hidden text-ellipsis">
                <p className="font-medium truncate">{user?.name || 'User'}</p>
                <p className="text-xs text-white/60 truncate">{user?.email || ''}</p>
              </div>
            </button>

            {profileOpen && (
              <div 
                className="absolute right-0 left-0 bottom-full mb-2 rounded-md shadow-lg bg-black/95 border border-white/10 z-50"
              >
                <div className="py-1">
                  <Link 
                    to="/profile" 
                    className="flex items-center px-4 py-2 text-sm hover:bg-white/10 transition-colors"
                    onClick={() => setProfileOpen(false)}
                  >
                    <Settings size={16} className="mr-2" />
                    Edit Profile
                  </Link>
                  <button 
                    onClick={() => {
                      setProfileOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/10 transition-colors"
                  >
                    <LogOut size={16} className="mr-2" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
