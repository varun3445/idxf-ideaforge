
import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { Compass, Users, User, LogOut, FileCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMediaQuery } from '@/hooks/useMediaQuery';

const Navbar = () => {
  const { logout, user } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const navigation = [
    { name: 'Explore', href: '/explore', icon: <Compass size={24} /> },
    { name: 'Matches', href: '/matches', icon: <Users size={24} /> },
    { name: 'Forge', href: '/forge', icon: <FileCode size={24} /> },
    { name: 'Profile', href: '/profile', icon: <User size={24} /> },
  ];

  return (
    <>
      <nav className="bg-background border-b border-border fixed top-0 left-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="text-xl font-bold text-black">
                Idea Forge
              </Link>
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                  {navigation.slice(0, 3).map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`text-black hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium ${location.pathname === item.href ? 'bg-gray-900 text-white' : 'text-gray-300'
                        }`}
                    >
                      <div className="flex items-center">
                        <span className="mr-2">{item.icon}</span>
                        {item.name}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-4 flex items-center md:ml-6">
                <Link to="/profile" className="flex items-center mr-4">
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user?.name || 'User'} className="w-full h-full object-cover" />
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                  </div>
                  <span className="ml-2 text-sm">
                    {user?.name}
                  </span>
                </Link>
                <Button variant="outline" size="sm" onClick={async () => {
                  await logout();
                }}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
            <div className="md:hidden">
              <Button variant="outline" size="sm" onClick={async () => {
                await logout();
              }}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile bottom navigation */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-white border-t border-gray-200">
          <div className="grid h-full grid-cols-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`inline-flex flex-col items-center justify-center px-5 ${
                  location.pathname === item.href
                    ? 'text-primary'
                    : 'text-gray-500 hover:text-primary'
                }`}
              >
                {item.icon}
                <span className="text-xs mt-1">{item.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
