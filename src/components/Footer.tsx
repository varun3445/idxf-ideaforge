
import { Link } from 'react-router-dom';

interface FooterProps {
  className?: string;
}

const Footer = ({ className = '' }: FooterProps) => {
  return (
    <footer className={`border-t border-border py-4 px-6 ${className}`}>
      <div className="flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
        <div className="mb-4 md:mb-0">
          <p>© 2024 Idea Forge. All rights reserved.</p>
        </div>
        
        <div className="flex space-x-4">
          <Link to="#" className="hover:text-foreground transition-colors">Privacy</Link>
          <Link to="#" className="hover:text-foreground transition-colors">Terms</Link>
          <Link to="#" className="hover:text-foreground transition-colors">Cookies</Link>
          <Link to="#" className="hover:text-foreground transition-colors">FAQ</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
