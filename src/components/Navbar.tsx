import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { Compass, Users, User, LogOut, FileCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMediaQuery } from '@/hooks/useMediaQuery';
const Navbar = () => {
  const {
    logout,
    user
  } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);
  const navigation = [{
    name: 'Explore',
    href: '/explore',
    icon: <Compass size={24} />
  }, {
    name: 'Matches',
    href: '/matches',
    icon: <Users size={24} />
  }, {
    name: 'Forge',
    href: '/forge',
    icon: <FileCode size={24} />
  }, {
    name: 'Profile',
    href: '/profile',
    icon: <User size={24} />
  }];
  return <>
      <nav className="bg-background border-b border-border fixed top-0 left-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
        </div>
      </nav>

      {/* Mobile bottom navigation */}
      {isMobile && <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-white border-t border-gray-200">
          <div className="grid h-full grid-cols-4">
            {navigation.map(item => <Link key={item.name} to={item.href} className={`inline-flex flex-col items-center justify-center px-5 ${location.pathname === item.href ? 'text-primary' : 'text-gray-500 hover:text-primary'}`}>
                {item.icon}
                <span className="text-xs mt-1">{item.name}</span>
              </Link>)}
          </div>
        </div>}
    </>;
};
export default Navbar;