import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { Button } from './ui/button';
import { Compass, Heart, FolderKanban, Users, Menu } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [isOpen, setIsOpen] = useState(false);
  
  const menuItems = [
    {
      name: 'Explore',
      path: '/explore',
      icon: <Compass className="h-5 w-5" />
    },
    {
      name: 'Matches',
      path: '/matches',
      icon: <Heart className="h-5 w-5" />
    },
    {
      name: 'Projects',
      path: '/projects',
      icon: <FolderKanban className="h-5 w-5" />
    },
    {
      name: 'Communities',
      path: '/communities',
      icon: <Users className="h-5 w-5" />
    }
  ];
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  // Log visibility for debugging
  useEffect(() => {
    console.log('Navbar rendered, isMobile:', isMobile);
  }, [isMobile]);

  return (
    <>
      {isMobile ? (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-2 bg-secondary/80 backdrop-blur-md border-t border-border rounded-t-xl">
          {menuItems.map((item, index) => (
            <Button
              key={item.name}
              variant={isActive(item.path) ? "default" : "ghost"}
              size="sm"
              className="flex flex-col items-center py-1 px-2"
              onClick={() => navigate(item.path)}
            >
              {item.icon}
              <span className="text-xs mt-1">{item.name}</span>
            </Button>
          ))}
          
          <Button 
            variant="ghost" 
            size="sm"
            className="flex flex-col items-center py-1 px-2 rounded-full" 
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
        <div className="left-0 top-0 z-50 w-56 h-screen bg-secondary/80 backdrop-blur-md border-r border-border fixed rounded-r-xl">
          <div className="px-3 py-4 h-full flex flex-col">
            <div className="flex items-center mb-6 px-2">
              <Avatar className="h-7 w-7 mr-2">
                <AvatarImage src="/ideaforge-favicon.png" alt="IdeaForge" />
                <AvatarFallback>IF</AvatarFallback>
              </Avatar>
              <span className="text-lg font-semibold font-playfair">IdeaForge</span>
            </div>
            <ul className="space-y-1 flex-grow">
              {menuItems.map(item => (
                <li key={item.name}>
                  <Button 
                    variant={isActive(item.path) ? 'default' : 'ghost'} 
                    className="w-full justify-start" 
                    onClick={() => navigate(item.path)}
                  >
                    <span className="mr-1.5">{item.icon}</span>
                    {item.name}
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
                <Avatar className="h-5 w-5 mr-1.5">
                  <AvatarImage src={user?.avatar || undefined} alt={user?.name} />
                  <AvatarFallback>{user?.name?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                Profile
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start text-destructive hover:text-destructive/90 hover:bg-destructive/10 mt-1" 
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
