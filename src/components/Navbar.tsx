
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { Button } from './ui/button';
import { Globe, Search, User, LogOut, Plus, LogIn } from 'lucide-react';
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

  // IDXF menu items in new design
  const menuItems = [{
    name: 'Explore',
    path: '/explore',
    icon: (isActive: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" 
          stroke={isActive ? "#DEFA69" : "white"} 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"/>
      </svg>
    )
  }, {
    name: 'Search',
    path: '/matches',
    icon: (isActive: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" 
          stroke={isActive ? "#DEFA69" : "white"} 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"/>
      </svg>
    )
  }, {
    name: 'Create',
    path: '/projects',
    icon: (isActive: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 4L10.6412 7.75342L6.75342 10.6412L3 12L6.75342 13.3588L10.6412 16.2466L12 20L13.3588 16.2466L17.2466 13.3588L21 12L17.2466 10.6412L13.3588 7.75342L12 4Z" 
          stroke={isActive ? "#DEFA69" : "white"} 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"/>
      </svg>
    )
  }, 
  ...(!isAuthenticated ? [{
    name: 'Login',
    path: '/login',
    icon: (isActive: boolean) => (
      <LogIn className={`h-6 w-6 ${isActive ? "text-idxf-lime" : "text-white"}`} />
    )
  }] : [{
    name: 'Profile',
    path: '/profile-page',
    icon: (isActive: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" 
          stroke={isActive ? "#DEFA69" : "white"} 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"/>
      </svg>
    )
  }])];
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  useEffect(() => {
    console.log('Navbar rendered, isMobile:', isMobile);
  }, [isMobile]);
  
  if (isMobile) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-idxf-black border-t border-white/10 p-3 flex justify-around z-50">
        {menuItems.map(item => {
          const isActiveItem = isActive(item.path);
          return (
            <div 
              key={item.name} 
              className={`flex flex-col items-center text-xs ${isActiveItem ? 'text-idxf-lime' : 'text-white'}`}
              onClick={() => navigate(item.path)}
            >
              <div className="w-6 h-6 flex items-center justify-center mb-1">
                {item.icon(isActiveItem)}
              </div>
              <span>{item.name}</span>
            </div>
          );
        })}
      </div>
    );
  }
  
  // Desktop sidebar
  return (
    <div className="left-0 top-0 z-50 w-56 h-screen bg-idxf-black/90 backdrop-blur-md border-r border-white/10 fixed rounded-r-xl">
      <div className="px-3 py-4 h-full flex flex-col">
        <div className="flex items-center mb-8 px-2">
          <div className="text-2xl font-bold tracking-tighter text-white mr-auto idxf-logo">IDXF</div>
        </div>
        <ul className="space-y-1 flex-grow">
          {/* Show all menu items except login/profile which will be at bottom */}
          {menuItems.filter(item => item.name !== 'Login' && item.name !== 'Profile').map(item => {
            const isActiveItem = isActive(item.path);
            return (
              <li key={item.name}>
                <Button 
                  variant={isActiveItem ? 'default' : 'ghost'} 
                  className="w-full justify-start"
                  onClick={() => navigate(item.path)}
                >
                  <div className="mr-2">{item.icon(isActiveItem)}</div>
                  {item.name}
                </Button>
              </li>
            );
          })}
        </ul>
        <div className="pt-4 border-t border-white/10">
          {isAuthenticated ? (
            <>
              <Button 
                variant={isActive('/profile-page') ? 'default' : 'ghost'}
                className="w-full justify-start text-white" 
                onClick={() => navigate('/profile-page')}
              >
                <Avatar className="h-5 w-5 mr-1">
                  <AvatarImage src={user?.avatar || undefined} alt={user?.name} />
                  <AvatarFallback className="bg-idxf-olive text-idxf-black text-xs">
                    {user?.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                Profile
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start text-destructive hover:text-destructive/90 hover:bg-destructive/10 mt-1"
                onClick={() => logout()}
              >
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </Button>
            </>
          ) : (
            <Button 
              variant={isActive('/login') ? 'default' : 'ghost'} 
              className="w-full justify-start"
              onClick={() => navigate('/login')}
            >
              <LogIn className="h-5 w-5 mr-1" />
              Login
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
