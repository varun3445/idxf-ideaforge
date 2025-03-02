
import { Link } from 'react-router-dom';

interface FooterProps {
  className?: string;
}

const Footer = ({ className = '' }: FooterProps) => {
  return (
    <footer className={`border-t-2 border-border py-4 px-6 bg-black text-white shadow-md ${className}`}>
      <div className="flex flex-col md:flex-row justify-between items-center text-sm">
        <div className="mb-4 md:mb-0">
          <p>© 2024 Idea Forge. All rights reserved.</p>
        </div>
        
        <div className="flex space-x-4">
          <Link to="#" className="hover:text-primary transition-colors">Privacy</Link>
          <Link to="#" className="hover:text-primary transition-colors">Terms</Link>
          <Link to="#" className="hover:text-primary transition-colors">Cookies</Link>
          <Link to="#" className="hover:text-primary transition-colors">FAQ</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
