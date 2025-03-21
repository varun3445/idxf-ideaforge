
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { Button } from './ui/button';
import { Home, Compass, Heart, User, FolderKanban, Users } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useMediaQuery } from '../hooks/useMediaQuery';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const isMobile = useMediaQuery('(max-width: 768px)');

  const menuItems = [
    { name: 'Explore', path: '/explore', icon: <Compass className="h-5 w-5" /> },
    { name: 'Matches', path: '/matches', icon: <Heart className="h-5 w-5" /> },
    { name: 'Projects', path: '/projects', icon: <FolderKanban className="h-5 w-5" /> },
    { name: 'Communities', path: '/communities', icon: <Users className="h-5 w-5" /> },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <>
      {isMobile ? (
        <nav className="fixed bottom-0 left-0 z-50 w-full h-16 bg-white border-t border-gray-200 dark:bg-gray-900 dark:border-gray-700">
          <div className="grid h-full max-w-lg grid-cols-5 mx-auto">
            {menuItems.map((item) => (
              <button
                key={item.name}
                type="button"
                className={`inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800 ${
                  isActive(item.path) ? 'text-primary' : 'text-gray-500 dark:text-gray-400'
                }`}
                onClick={() => navigate(item.path)}
              >
                {item.icon}
                <span className="text-xs">{item.name}</span>
              </button>
            ))}
            <button
              type="button"
              className={`inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800 ${
                isActive('/profile') ? 'text-primary' : 'text-gray-500 dark:text-gray-400'
              }`}
              onClick={() => navigate('/profile')}
            >
              <Avatar className="h-5 w-5">
                <AvatarImage src={user?.avatar || undefined} alt={user?.name} />
                <AvatarFallback className="text-xs">{user?.name?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="text-xs">Profile</span>
            </button>
          </div>
        </nav>
      ) : (
        <div className="left-0 top-0 z-50 w-64 h-screen bg-white border-r border-gray-200 dark:bg-gray-900 dark:border-gray-700 fixed">
          <div className="px-3 py-4 h-full flex flex-col">
            <div className="flex items-center mb-6 px-2">
              <Avatar className="h-8 w-8 mr-2">
                <AvatarImage src="/ideaforge-favicon.png" alt="IdeaForge" />
                <AvatarFallback>IF</AvatarFallback>
              </Avatar>
              <span className="text-xl font-semibold">IdeaForge</span>
            </div>
            <ul className="space-y-2 flex-grow">
              <li>
                <Button
                  variant={isActive('/explore') ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => navigate('/explore')}
                >
                  <Compass className="h-5 w-5 mr-2" />
                  Explore
                </Button>
              </li>
              <li>
                <Button
                  variant={isActive('/matches') ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => navigate('/matches')}
                >
                  <Heart className="h-5 w-5 mr-2" />
                  Matches
                </Button>
              </li>
              <li>
                <Button
                  variant={isActive('/projects') ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => navigate('/projects')}
                >
                  <FolderKanban className="h-5 w-5 mr-2" />
                  Projects
                </Button>
              </li>
              <li>
                <Button
                  variant={isActive('/communities') ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => navigate('/communities')}
                >
                  <Users className="h-5 w-5 mr-2" />
                  Communities
                </Button>
              </li>
            </ul>
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
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
                className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 mt-2"
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
