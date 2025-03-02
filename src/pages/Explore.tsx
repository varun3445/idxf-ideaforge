
import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import AnimatedTransition from '../components/AnimatedTransition';
import CreativeCard from '../components/CreativeCard';
import { creatives, Creative, PortfolioItem } from '../data/mockData';

const Explore = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCreatives, setFilteredCreatives] = useState<Creative[]>(creatives);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [activeTab, setActiveTab] = useState<'creatives' | 'portfolio'>('portfolio');
  
  useEffect(() => {
    // Collect all portfolio items from all creatives
    const items = creatives.flatMap(creative => 
      creative.portfolio.map(item => ({
        ...item,
        creator: creative.name,
        creatorRole: creative.role,
        creatorId: creative.id
      }))
    );
    
    setPortfolioItems(items);
  }, []);
  
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredCreatives(creatives);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = creatives.filter(
      creative => 
        creative.name.toLowerCase().includes(query) ||
        creative.role.toLowerCase().includes(query) ||
        creative.skills.some(skill => skill.toLowerCase().includes(query)) ||
        creative.bio.toLowerCase().includes(query)
    );
    
    setFilteredCreatives(filtered);
  }, [searchQuery]);
  
  return (
    <AnimatedTransition>
      <div className="page-container">
        <div className="mb-8">
          <h1 className="page-header">Explore</h1>
          <p className="page-subheader">
            Discover talented creatives and inspiring projects
          </p>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-muted-foreground" />
            </div>
            <input
              type="text"
              placeholder="Search by name, role, or skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full h-12 rounded-lg border border-input bg-background px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          
          <div className="flex">
            <button
              onClick={() => setActiveTab('portfolio')}
              className={`px-6 py-3 rounded-l-lg border border-r-0 transition-all ${
                activeTab === 'portfolio'
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-secondary text-secondary-foreground border-input hover:bg-secondary/80'
              }`}
            >
              Portfolio
            </button>
            <button
              onClick={() => setActiveTab('creatives')}
              className={`px-6 py-3 rounded-r-lg border transition-all ${
                activeTab === 'creatives'
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-secondary text-secondary-foreground border-input hover:bg-secondary/80'
              }`}
            >
              Creatives
            </button>
          </div>
        </div>
        
        {activeTab === 'portfolio' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolioItems.map((item) => (
              <div key={item.id} className="group">
                <div className="grid-card rounded-xl overflow-hidden aspect-square mb-3">
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <h3 className="font-medium text-lg mb-1 group-hover:text-primary transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  by <span className="font-medium">{item.creator}</span>
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCreatives.map((creative) => (
              <CreativeCard key={creative.id} creative={creative} />
            ))}
          </div>
        )}
      </div>
    </AnimatedTransition>
  );
};

export default Explore;
