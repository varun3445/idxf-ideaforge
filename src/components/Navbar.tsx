
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
    { name: 'Explore', href: '/explore', icon: <Compass /> },
    { name: 'Matches', href: '/matches', icon: <Users /> },
    { name: 'Forge', href: '/forge', icon: <FileCode /> },
  ];

  return (
    <nav className="bg-background border-b border-border fixed top-0 left-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-black">
              Idea Forge
            </Link>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {navigation.map((item) => (
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
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={toggleMobileMenu}
              type="button"
              className="bg-gray-800 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className={`${isMobileMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              <svg
                className={`${isMobileMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:hidden`} id="mobile-menu">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`text-black hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium ${location.pathname === item.href ? 'bg-gray-900 text-white' : 'text-gray-300'
                }`}
            >
              <div className="flex items-center">
                <span className="mr-2">{item.icon}</span>
                {item.name}
              </div>
            </Link>
          ))}
          <Link
            to="/profile"
            className={`text-black hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium ${location.pathname === '/profile' ? 'bg-gray-900 text-white' : 'text-gray-300'}`}
          >
            <div className="flex items-center">
              <span className="mr-2"><User /></span>
              Profile
            </div>
          </Link>
        </div>
        <div className="pt-4 pb-3 border-t border-gray-700">
          <div className="mt-3 px-2 space-y-1">
            <Button variant="outline" size="sm" className="w-full justify-center" onClick={async () => {
              await logout();
            }}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
