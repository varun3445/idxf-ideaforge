import { Link } from 'react-router-dom';
import { Heart, Info, HelpCircle, Mail, MessageSquare, Users } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-background/80 backdrop-blur-sm border-t border-border py-8 mt-16 md:mt-24">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-medium text-lg mb-3">Idea Forge</h3>
            <p className="text-sm text-muted-foreground">
              Connect with creative professionals and bring your ideas to life.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Info size={16} />
              About
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/team" className="text-muted-foreground hover:text-foreground transition-colors">
                  Our Team
                </Link>
              </li>
              <li>
                <Link to="/careers" className="text-muted-foreground hover:text-foreground transition-colors">
                  Careers
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <HelpCircle size={16} />
              Help
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/faq" className="text-muted-foreground hover:text-foreground transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/help" className="text-muted-foreground hover:text-foreground transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <MessageSquare size={16} />
              Contact
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
                  <Mail size={14} />
                  <span>support@ideaforge.example</span>
                </Link>
              </li>
              <li>
                <Link to="/community" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
                  <Users size={14} />
                  <span>Join Community</span>
                </Link>
              </li>
              <li>
                <Link to="/feedback" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
                  <Heart size={14} />
                  <span>Send Feedback</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>© {currentYear} Idea Forge. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
