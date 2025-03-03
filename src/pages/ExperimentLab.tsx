import { useState } from 'react';
import AnimatedTransition from '../components/AnimatedTransition';
import ProjectIdeaCard from '../components/ProjectIdeaCard';
import { projectIdeas } from '../data/mockData';
import { Search, Filter } from 'lucide-react';
import { useMediaQuery } from '../hooks/useMediaQuery';
const ExperimentLab = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const isMobile = useMediaQuery('(max-width: 768px)');
  const categories = ['All', ...new Set(projectIdeas.map(idea => idea.category))];
  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];
  const filteredIdeas = projectIdeas.filter(idea => {
    const matchesSearch = idea.title.toLowerCase().includes(searchQuery.toLowerCase()) || idea.description.toLowerCase().includes(searchQuery.toLowerCase()) || idea.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeFilter === 'All' || idea.category === activeFilter;
    return matchesSearch && matchesCategory;
  });
  return <AnimatedTransition>
      <div className="page-container">
        <div className="mb-6 sm:mb-8">
          <h1 className="page-header text-left">Experiment</h1>
          <p className="page-subheader text-left">Explore creative project ideas and find inspiration for your next endeavor.</p>
        </div>
        
        <div className="flex flex-col gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-muted-foreground" />
            </div>
            <input type="text" placeholder="Search for project ideas..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10 w-full h-10 sm:h-12 rounded-lg border border-input bg-background px-3 sm:px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          </div>
          
          <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
              <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
                <Filter size={14} />
                <span>Category:</span>
              </div>
              <div className="flex flex-wrap gap-1 sm:gap-2">
                {categories.map(category => <button key={category} onClick={() => setActiveFilter(category)} className={`chip text-xs ${activeFilter === category ? 'chip-active' : ''}`}>
                    {category}
                  </button>)}
              </div>
            </div>
          </div>
        </div>
        
        <div className={`grid grid-cols-1 ${isMobile ? 'sm:grid-cols-2' : 'sm:grid-cols-2 md:grid-cols-3'} gap-4 sm:gap-6`}>
          {filteredIdeas.map(idea => <ProjectIdeaCard key={idea.id} idea={idea} />)}
        </div>
        
        {filteredIdeas.length === 0 && <div className="glassmorphic-card text-center py-8 sm:py-12 mt-6 sm:mt-8">
            <h3 className="text-base sm:text-lg font-medium mb-2">No project ideas found</h3>
            <p className="text-muted-foreground text-sm">
              Try adjusting your search criteria or filter selection
            </p>
          </div>}
      </div>
    </AnimatedTransition>;
};
export default ExperimentLab;