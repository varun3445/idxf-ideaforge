
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { Button } from './ui/button';
import { Globe, Search, PenTool, User, LogOut, Menu } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { useEffect } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    user,
    logout
  } = useAuth();
  const isMobile = useMediaQuery('(max-width: 768px)');

  // Updated menu items to match the image
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
    icon: <PenTool className="h-5 w-5" />
  }, {
    name: 'Profile',
    path: '/profile-page',
    icon: <User className="h-5 w-5" />
  }];
  
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
              <Button variant="ghost" size="icon" className="bg-black/80 backdrop-blur-md rounded-full h-10 w-10">
                <Menu className="h-5 w-5 text-white" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-black/90 backdrop-blur-md border border-white/10 text-white">
              <DropdownMenuLabel>Menu</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/10" />
              {menuItems.map(item => (
                <DropdownMenuItem 
                  key={item.name} 
                  className={`${isActive(item.path) ? 'bg-[#e3f988]/10 text-[#e3f988]' : 'text-white'}`}
                  onClick={() => navigate(item.path)}
                >
                  {item.icon}
                  <span className="ml-2">{item.name}</span>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem 
                className="text-red-400"
                onClick={() => logout()}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>}

      {/* Mobile center logo */}
      {isMobile && <div className="fixed top-3 left-0 right-0 z-50 flex justify-center">
          <div className="h-8 w-16">
            <img src="/lovable-uploads/c6e48869-9ce9-4e6a-b36b-47605ec8017a.png" alt="IDXF" className="h-full" />
          </div>
        </div>}

      {/* Mobile Bottom Navigation - updated to match the Figma design */}
      {isMobile ? <div className="fixed bottom-0 left-0 right-0 z-50 bg-black border-t border-white/10 py-4">
          <div className="w-full grid grid-cols-4 gap-0">
            {menuItems.map(item => {
              const isActiveItem = isActive(item.path);
              return <button 
                key={item.name} 
                className={`flex flex-col items-center justify-center py-1 ${isActiveItem ? 'text-[#e3f988]' : 'text-white/80'}`}
                onClick={() => navigate(item.path)}
              >
                {item.icon}
                <span className="text-xs mt-1 font-satoshi">{item.name}</span>
              </button>;
            })}
          </div>
        </div> : <div className="left-0 top-0 z-50 w-56 h-screen bg-black/95 backdrop-blur-md border-r border-white/10 fixed">
          <div className="px-3 py-4 h-full flex flex-col">
            <div className="flex items-center mb-6 px-2">
              <div className="h-7 w-16 mr-2">
                <img src="/lovable-uploads/c6e48869-9ce9-4e6a-b36b-47605ec8017a.png" alt="IDXF" className="h-full" />
              </div>
            </div>
            <ul className="space-y-2 flex-grow">
              {/* Show all top menu items */}
              {menuItems.slice(0, 3).map(item => <li key={item.name}>
                  <Button 
                    variant={isActive(item.path) ? 'default' : 'ghost'} 
                    className={`w-full justify-start rounded-md ${isActive(item.path) ? 'bg-[#e3f988] text-black' : 'text-white hover:bg-white/10'}`} 
                    onClick={() => navigate(item.path)}
                  >
                    <span className="mr-2">{item.icon}</span>
                    <span className="font-satoshi">{item.name}</span>
                  </Button>
                </li>)}
            </ul>
            <div className="pt-4 border-t border-white/10">
              <Button 
                variant={isActive('/profile-page') ? 'default' : 'ghost'} 
                className={`w-full justify-start rounded-md ${isActive('/profile-page') ? 'bg-[#e3f988] text-black' : 'text-white hover:bg-white/10'}`}
                onClick={() => navigate('/profile-page')}
              >
                <Avatar className="h-5 w-5 mr-2">
                  <AvatarImage src={user?.avatar || undefined} alt={user?.name} />
                  <AvatarFallback>{user?.name?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="font-satoshi">Profile</span>
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start text-red-400 hover:text-red-400/90 hover:bg-red-400/10 mt-2 rounded-md" 
                onClick={() => logout()}
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span className="font-satoshi">Logout</span>
              </Button>
            </div>
          </div>
        </div>}
    </>;
};

export default Navbar;
