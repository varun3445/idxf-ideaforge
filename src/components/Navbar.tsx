import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { Button } from './ui/button';
import { Globe, Search, Bell, User, LogOut, Plus, LogIn } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { useEffect } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    user,
    logout,
    isAuthenticated
  } = useAuth();
  const isMobile = useMediaQuery('(max-width: 768px)');

  // Mobile menu items - added Login section
  const menuItems = [{
    name: 'Explore',
    path: '/explore',
    icon: <Globe className="h-5 w-5" />
  }, {
    name: 'Search',
    path: '/matches',
    icon: <Search className="h-5 w-5" />
  }, {
    name: 'Create',
    path: '/projects',
    icon: <Plus className="h-5 w-5" />
  }, 
  ...(!isAuthenticated ? [{
    name: 'Login',
    path: '/login',
    icon: <LogIn className="h-5 w-5" />
  }] : [{
    name: 'Profile',
    path: '/profile-page',
    icon: <User className="h-5 w-5" />
  }])];
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  useEffect(() => {
    console.log('Navbar rendered, isMobile:', isMobile);
  }, [isMobile]);
  
  return <>
      {/* Desktop right menu - keep for desktop only */}
      {isMobile && <div className="fixed top-2 right-2 z-50">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 rounded-full">
                <Bell className="h-5 w-5" />
                <span className="sr-only">Open notifications</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>No new notifications</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>}

      {/* Mobile center logo */}
      {isMobile && <div className="fixed top-3 left-0 right-0 z-50 flex justify-center">
          <div className="h-8 w-16">
            <img src="/lovable-uploads/c6e48869-9ce9-4e6a-b36b-47605ec8017a.png" alt="IDXF" className="h-full" />
          </div>
        </div>}

      {/* Mobile Bottom Navigation with equal spacing */}
      {isMobile ? <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-center backdrop-blur-md border-t border-border bg-background/90 p-2 rounded-t-xl mx-0 my-0 py-[15px]">
          <div className="w-full grid grid-cols-4 gap-0">
            {menuItems.map(item => {
          const isActiveItem = isActive(item.path);
          const isCreateButton = item.name === 'Create';
          return <Button key={item.name} variant="ghost" size="sm" className={`flex flex-col items-center justify-center py-1 ${isCreateButton ? 'text-blue-500' : ''} ${isActiveItem ? 'text-blue-500 font-medium' : 'text-foreground/80'}`} onClick={() => navigate(item.path)}>
                  {item.icon}
                  <span className="text-xs mt-1">{item.name}</span>
                </Button>;
        })}
          </div>
        </div> : <div className="left-0 top-0 z-50 w-56 h-screen bg-black/80 backdrop-blur-md border-r border-border fixed rounded-r-xl">
          <div className="px-3 py-4 h-full flex flex-col">
            <div className="flex items-center mb-6 px-2">
              <div className="h-7 w-16 mr-2">
                <img src="/lovable-uploads/c6e48869-9ce9-4e6a-b36b-47605ec8017a.png" alt="IDXF" className="h-full" />
              </div>
            </div>
            <ul className="space-y-1 flex-grow">
              {/* Show all menu items except login/profile which will be at bottom */}
              {menuItems.filter(item => item.name !== 'Login' && item.name !== 'Profile').map(item => <li key={item.name}>
                  <Button variant={isActive(item.path) ? 'default' : 'ghost'} className="w-full justify-start" onClick={() => navigate(item.path)}>
                    <span className="mr-1">{item.icon}</span>
                    {item.name}
                  </Button>
                </li>)}
            </ul>
            <div className="pt-4 border-t border-border">
              {isAuthenticated ? (
                <>
                  <Button variant={isActive('/profile-page') ? 'default' : 'ghost'} className="w-full justify-start" onClick={() => navigate('/profile-page')}>
                    <Avatar className="h-5 w-5 mr-1">
                      <AvatarImage src={user?.avatar || undefined} alt={user?.name} />
                      <AvatarFallback>{user?.name?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    Profile
                  </Button>
                  <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive/90 hover:bg-destructive/10 mt-1" onClick={() => logout()}>
                    <LogOut className="h-4 w-4 mr-1" />
                    Logout
                  </Button>
                </>
              ) : (
                <Button variant={isActive('/login') ? 'default' : 'ghost'} className="w-full justify-start" onClick={() => navigate('/login')}>
                  <LogIn className="h-5 w-5 mr-1" />
                  Login
                </Button>
              )}
            </div>
          </div>
        </div>}
    </>;
};

export default Navbar;
