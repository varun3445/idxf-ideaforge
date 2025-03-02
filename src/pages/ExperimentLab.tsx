
import { useState } from 'react';
import AnimatedTransition from '../components/AnimatedTransition';
import ProjectIdeaCard from '../components/ProjectIdeaCard';
import { projectIdeas } from '../data/mockData';
import { Search, Filter } from 'lucide-react';

const ExperimentLab = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('All');
  
  const categories = ['All', ...new Set(projectIdeas.map(idea => idea.category))];
  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];
  
  const filteredIdeas = projectIdeas.filter(idea => {
    const matchesSearch = 
      idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = activeFilter === 'All' || idea.category === activeFilter;
    
    return matchesSearch && matchesCategory;
  });
  
  return (
    <AnimatedTransition>
      <div className="page-container">
        <div className="mb-8">
          <h1 className="page-header">Experiment Lab</h1>
          <p className="page-subheader">
            Explore creative project ideas and find inspiration for your next endeavor
          </p>
        </div>
        
        <div className="flex flex-col gap-6 mb-8">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-muted-foreground" />
            </div>
            <input
              type="text"
              placeholder="Search for project ideas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full h-12 rounded-lg border border-input bg-background px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Filter size={16} />
                <span>Category:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setActiveFilter(category)}
                    className={`chip ${
                      activeFilter === category ? 'chip-active' : ''
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIdeas.map((idea) => (
            <ProjectIdeaCard key={idea.id} idea={idea} />
          ))}
        </div>
        
        {filteredIdeas.length === 0 && (
          <div className="glassmorphic-card text-center py-12 mt-8">
            <h3 className="text-lg font-medium mb-2">No project ideas found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search criteria or filter selection
            </p>
          </div>
        )}
      </div>
    </AnimatedTransition>
  );
};

export default ExperimentLab;
