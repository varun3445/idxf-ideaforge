import { Link } from 'react-router-dom';
interface FooterProps {
  className?: string;
}
const Footer = ({
  className = ''
}: FooterProps) => {
  return <footer className={`border-t-2 border-border py-4 px-6 bg-black text-white shadow-md w-full ${className}`}>
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center text-sm">
        <div className="mb-4 md:mb-0 flex items-center">
          <img src="/lovable-uploads/c6e48869-9ce9-4e6a-b36b-47605ec8017a.png" alt="IDXF" className="h-6 mr-2" />
          <p>© 2025 Idea Forge</p>
        </div>
        
        <div className="flex space-x-6">
          
          
          
          
        </div>
      </div>
    </footer>;
};
export default Footer;