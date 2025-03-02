
import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Grid, Heart, Lightbulb, User, Settings, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { useToast } from '../hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useMobile } from '../hooks/use-mobile';

const Navbar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [navbarExpanded, setNavbarExpanded] = useState(true);
  const profileRef = useRef<HTMLDivElement>(null);
  const isMobile = useMobile();

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

  // Close mobile menu when navigating to a new page
  useEffect(() => {
    if (isMobile) {
      setNavbarExpanded(false);
    }
  }, [location.pathname, isMobile]);

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

  const toggleNavbar = () => {
    setNavbarExpanded(!navbarExpanded);
  };

  return (
    <>
      {/* Mobile Toggle Button - Fixed position */}
      <button
        onClick={toggleNavbar}
        className="fixed top-4 left-4 z-50 p-2 rounded-md bg-primary/10 md:hidden"
        aria-label={navbarExpanded ? "Close menu" : "Open menu"}
      >
        {navbarExpanded ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Left Side Navbar */}
      <nav
        className={`fixed inset-y-0 left-0 z-40 flex flex-col bg-background border-r border-border transition-all duration-300 ${
          navbarExpanded ? 'w-64' : 'w-20'
        } ${isMobile && !navbarExpanded ? '-translate-x-full' : 'translate-x-0'}`}
      >
        <div className="flex flex-col h-full p-4">
          {/* Logo/Brand */}
          <Link 
            to="/explore" 
            className={`text-xl font-bold tracking-tight transition-all mb-8 ${
              navbarExpanded ? 'text-left' : 'text-center'
            }`}
          >
            {navbarExpanded ? (
              <span>Idea Forge</span>
            ) : (
              <span className="text-2xl">IF</span>
            )}
          </Link>
          
          {/* Navigation Links */}
          <div className="flex flex-col space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-3 rounded-lg transition-all duration-300 flex items-center ${
                  navbarExpanded ? 'justify-start space-x-3' : 'justify-center'
                } ${
                  isActive(item.path)
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-secondary'
                }`}
              >
                <item.icon size={20} />
                {navbarExpanded && <span>{item.label}</span>}
              </Link>
            ))}
          </div>

          {/* Profile Section - At the bottom */}
          <div className="mt-auto">
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className={`flex items-center ${
                  navbarExpanded ? 'justify-start space-x-3 w-full' : 'justify-center w-full'
                } p-3 rounded-lg hover:bg-secondary transition-colors overflow-hidden`}
              >
                <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-secondary flex items-center justify-center">
                  {user ? (
                    <img 
                      src={getAvatarSrc()}
                      alt={user.name || 'User'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={18} />
                  )}
                </div>
                {navbarExpanded && (
                  <div className="text-left overflow-hidden text-ellipsis">
                    <p className="font-medium truncate">{user?.name || 'User'}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email || ''}</p>
                  </div>
                )}
              </button>

              {profileOpen && (
                <div 
                  className={`absolute ${
                    navbarExpanded ? 'right-0 left-0' : 'left-full ml-2'
                  } bottom-full mb-2 rounded-md shadow-lg bg-background border border-border`}
                >
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

          {/* Collapse/Expand Button - Desktop Only */}
          <button
            onClick={toggleNavbar}
            className="mt-4 p-2 rounded-md border border-border hidden md:flex items-center justify-center"
            aria-label={navbarExpanded ? "Collapse sidebar" : "Expand sidebar"}
          >
            {navbarExpanded ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            )}
          </button>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
