
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { Button } from './ui/button';
import { Globe, Search, Bell, User, LogOut, Plus, Calendar, ArrowLeft } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { useEffect } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import GlassmorphicCard from './GlassmorphicCard';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    user,
    logout
  } = useAuth();
  const isMobile = useMediaQuery('(max-width: 768px)');

  // Mobile menu items - removed Talk section and adjusted to 4 items
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
  
  const showBackButton = location.pathname !== '/explore' && location.pathname !== '/matches' && 
                         location.pathname !== '/projects' && location.pathname !== '/profile-page';
  
  return <>
      {/* Desktop navigation sidebar */}
      {!isMobile && (
        <div className="left-0 top-0 z-50 w-56 h-screen bg-black/90 backdrop-blur-md border-r border-white/10 fixed rounded-r-xl">
          <div className="px-3 py-4 h-full flex flex-col">
            <div className="flex items-center mb-6 px-2">
              <div className="h-7 w-16 mr-2">
                <img src="/lovable-uploads/c6e48869-9ce9-4e6a-b36b-47605ec8017a.png" alt="IDXF" className="h-full" />
              </div>
            </div>
            <ul className="space-y-1 flex-grow">
              {menuItems.slice(0, 3).map(item => (
                <li key={item.name}>
                  <Button 
                    variant={isActive(item.path) ? 'default' : 'ghost'} 
                    className={`w-full justify-start rounded-full ${isActive(item.path) ? 'bg-creative-pink text-creative-black' : 'hover:bg-white/10'}`} 
                    onClick={() => navigate(item.path)}
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.name}
                  </Button>
                </li>
              ))}
            </ul>
            <div className="pt-4 border-t border-white/10">
              <Button 
                variant={isActive('/profile-page') ? 'default' : 'ghost'} 
                className={`w-full justify-start rounded-full ${isActive('/profile-page') ? 'bg-creative-pink text-creative-black' : 'hover:bg-white/10'}`} 
                onClick={() => navigate('/profile-page')}
              >
                <Avatar className="h-5 w-5 mr-2">
                  <AvatarImage src={user?.avatar || undefined} alt={user?.name} />
                  <AvatarFallback>{user?.name?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
                Profile
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start text-destructive hover:text-destructive/90 hover:bg-destructive/10 mt-2 rounded-full" 
                onClick={() => logout()}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile top navigation */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-white/10 px-4 py-3 flex items-center">
          {showBackButton ? (
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full bg-black/60" 
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          ) : (
            <div className="h-6 w-12">
              <img src="/lovable-uploads/c6e48869-9ce9-4e6a-b36b-47605ec8017a.png" alt="IDXF" className="h-full" />
            </div>
          )}
          
          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="icon" className="rounded-full bg-black/60">
              <Calendar className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full bg-black/60">
              <Bell className="h-5 w-5" />
            </Button>
            <Avatar className="h-8 w-8 border border-white/20" onClick={() => navigate('/profile-page')}>
              <AvatarImage src={user?.avatar || undefined} alt={user?.name} />
              <AvatarFallback>{user?.name?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-center backdrop-blur-md border-t border-white/10 bg-black/90 p-2 rounded-t-xl mx-0 my-0 py-[15px]">
          <div className="w-full grid grid-cols-4 gap-0">
            {menuItems.map(item => {
              const isActiveItem = isActive(item.path);
              const isCreateButton = item.name === 'Create';
              return (
                <Button 
                  key={item.name} 
                  variant="ghost" 
                  size="sm" 
                  className={`flex flex-col items-center justify-center py-1 ${isCreateButton ? 'text-creative-pink' : ''} ${isActiveItem ? 'text-creative-pink font-medium' : 'text-foreground/80'}`} 
                  onClick={() => navigate(item.path)}
                >
                  {item.icon}
                  <span className="text-xs mt-1">{item.name}</span>
                </Button>
              );
            })}
          </div>
        </div>
      )}
    </>;
};

export default Navbar;
