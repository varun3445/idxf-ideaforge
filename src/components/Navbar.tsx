
import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Grid, Heart, Lightbulb, User, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { useToast } from '../hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const navItems = [
    { path: '/explore', label: 'Explore', icon: Grid },
    { path: '/matches', label: 'Matches', icon: Heart },
    { path: '/lab', label: 'Experiment Lab', icon: Lightbulb },
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
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Logout failed",
        description: "An error occurred while logging out",
        variant: "destructive"
      });
    }
  };

  // Gets the avatar source based on user information
  const getAvatarSrc = () => {
    if (user?.avatar) {
      return user.avatar;
    } else if (user?.name) {
      return `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}&gender=${user.sex || 'male'}`;
    }
    return '';
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 sm:px-6 ${
        scrolled ? 'py-3 glassmorphism' : 'py-5 bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link 
          to="/explore" 
          className="text-xl font-bold tracking-tight transition-opacity hover:opacity-80"
        >
          <span>Idea Forge</span>
        </Link>
        
        <div className="hidden md:flex space-x-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-4 py-2 rounded-full transition-all duration-300 flex items-center space-x-2 ${
                isActive(item.path)
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-secondary'
              }`}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </Link>
          ))}

          {/* Profile Picture and Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-secondary hover:bg-secondary/80 transition-colors overflow-hidden"
            >
              {user ? (
                <img 
                  src={getAvatarSrc()}
                  alt={user.name || 'User'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={18} />
              )}
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-background border border-border">
                <div className="py-2 px-4 border-b border-border">
                  <p className="font-medium">{user?.name}</p>
                  <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
                </div>
                <div className="py-1">
                  <Link 
                    to="/profile" 
                    className="flex items-center px-4 py-2 text-sm hover:bg-secondary/50 transition-colors"
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
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <LogOut size={16} className="mr-2" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex md:hidden">
          <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-200 flex justify-around py-3 px-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <item.icon size={20} />
                <span className="text-xs mt-1">{item.label}</span>
              </Link>
            ))}
            
            <Link
              to="/profile"
              className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                isActive('/profile')
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <User size={20} />
              <span className="text-xs mt-1">Profile</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
