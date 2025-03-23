import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { Button } from './ui/button';
import { Compass, Heart, FolderKanban, Users } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { useState, useEffect } from 'react';
const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    user,
    logout
  } = useAuth();
  const isMobile = useMediaQuery('(max-width: 768px)');

  // Swapped Communities and Projects positions in the array for mobile
  const menuItems = [{
    name: 'Explore',
    path: '/explore',
    icon: <Compass className="h-5 w-5" />
  }, {
    name: 'Matches',
    path: '/matches',
    icon: <Heart className="h-5 w-5" />
  }, {
    name: 'Communities',
    path: '/communities',
    icon: <Users className="h-5 w-5" />
  }, {
    name: 'Projects',
    path: '/projects',
    icon: <FolderKanban className="h-5 w-5" />
  }];
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Log visibility for debugging
  useEffect(() => {
    console.log('Navbar rendered, isMobile:', isMobile);
  }, [isMobile]);
  return <>
      {/* Profile Button (Top Right on Mobile) */}
      {isMobile && <div className="fixed top-2 right-2 z-50">
          <Button variant="ghost" size="sm" className="rounded-full p-1" onClick={() => navigate('/profile')}>
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.avatar || undefined} alt={user?.name} />
              <AvatarFallback>{user?.name?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
          </Button>
        </div>}

      {/* Mobile Bottom Navigation */}
      {isMobile ? <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-center px-2 py-2 backdrop-blur-md border-t border-border mx-[10px] rounded-t-xl my-[5px] bg-neutral-50">
          <div className="flex items-center justify-between max-w-[280px] w-full">
            {menuItems.map(item => <Button key={item.name} variant="ghost" size="sm" className={`flex flex-col items-center py-1 px-1.5 ${isActive(item.path) ? 'text-primary font-medium' : 'text-foreground/80'}`} onClick={() => navigate(item.path)}>
                {item.icon}
                <span className="text-xs mt-0.5">{item.name}</span>
              </Button>)}
          </div>
        </div> : <div className="left-0 top-0 z-50 w-56 h-screen bg-secondary/80 backdrop-blur-md border-r border-border fixed rounded-r-xl">
          <div className="px-3 py-4 h-full flex flex-col">
            <div className="flex items-center mb-6 px-2">
              <Avatar className="h-7 w-7 mr-2">
                <AvatarImage src="/ideaforge-favicon.png" alt="IdeaForge" />
                <AvatarFallback>IF</AvatarFallback>
              </Avatar>
              <span className="text-lg font-semibold font-playfair">IdeaForge</span>
            </div>
            <ul className="space-y-1 flex-grow">
              {menuItems.map(item => <li key={item.name}>
                  <Button variant={isActive(item.path) ? 'default' : 'ghost'} className="w-full justify-start" onClick={() => navigate(item.path)}>
                    <span className="mr-1">{item.icon}</span>
                    {item.name}
                  </Button>
                </li>)}
            </ul>
            <div className="pt-4 border-t border-border">
              <Button variant={isActive('/profile') ? 'default' : 'ghost'} className="w-full justify-start" onClick={() => navigate('/profile')}>
                <Avatar className="h-5 w-5 mr-1">
                  <AvatarImage src={user?.avatar || undefined} alt={user?.name} />
                  <AvatarFallback>{user?.name?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                Profile
              </Button>
              <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive/90 hover:bg-destructive/10 mt-1" onClick={() => logout()}>
                Logout
              </Button>
            </div>
          </div>
        </div>}
    </>;
};
export default Navbar;