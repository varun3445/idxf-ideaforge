
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { Button } from './ui/button';
import { Compass, Heart, FolderKanban, Users, Menu } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "./ui/sheet";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Make sure the component is mounted to avoid hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  const menuItems = [
    { name: 'Explore', path: '/explore', icon: <Compass className="h-5 w-5" /> },
    { name: 'Matches', path: '/matches', icon: <Heart className="h-5 w-5" /> },
    { name: 'Projects', path: '/projects', icon: <FolderKanban className="h-5 w-5" /> },
    { name: 'Communities', path: '/communities', icon: <Users className="h-5 w-5" /> },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  if (!mounted) return null;

  return (
    <>
      {isMobile ? (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-2 py-3 bg-secondary border-t border-border">
          {menuItems.map((item) => (
            <Button
              key={item.name}
              variant={isActive(item.path) ? "default" : "ghost"}
              size="sm"
              className="flex flex-col items-center justify-center"
              onClick={() => navigate(item.path)}
            >
              {item.icon}
              <span className="text-xs mt-1">{item.name}</span>
            </Button>
          ))}
          <Button
            variant={isActive('/profile') ? "default" : "ghost"}
            size="sm"
            className="flex flex-col items-center justify-center"
            onClick={() => navigate('/profile')}
          >
            <Avatar className="h-5 w-5">
              <AvatarImage src={user?.avatar || undefined} alt={user?.name} />
              <AvatarFallback>{user?.name?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className="text-xs mt-1">Profile</span>
          </Button>
        </div>
      ) : (
        <div className="left-0 top-0 z-50 w-64 h-screen bg-secondary border-r border-border fixed">
          <div className="px-3 py-4 h-full flex flex-col">
            <div className="flex items-center mb-6 px-2">
              <Avatar className="h-8 w-8 mr-2">
                <AvatarImage src="/ideaforge-favicon.png" alt="IdeaForge" />
                <AvatarFallback>IF</AvatarFallback>
              </Avatar>
              <span className="text-xl font-semibold font-playfair">IdeaForge</span>
            </div>
            <ul className="space-y-2 flex-grow">
              {menuItems.map((item) => (
                <li key={item.name}>
                  <Button
                    variant={isActive(item.path) ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => navigate(item.path)}
                  >
                    {item.icon}
                    <span className="ml-2">{item.name}</span>
                  </Button>
                </li>
              ))}
            </ul>
            <div className="pt-4 border-t border-border">
              <Button
                variant={isActive('/profile') ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => navigate('/profile')}
              >
                <Avatar className="h-5 w-5 mr-2">
                  <AvatarImage src={user?.avatar || undefined} alt={user?.name} />
                  <AvatarFallback>{user?.name?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                Profile
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-destructive hover:text-destructive/90 hover:bg-destructive/10 mt-2"
                onClick={() => logout()}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
