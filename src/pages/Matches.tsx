
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Just updating the UserProfile interface definition to ensure it includes avatar
interface UserProfile {
  id: string;
  name: string;
  email: string;
  location: string;
  skills: string[];
  avatar?: string | null;
  distance?: number;
  matchScore?: number;
  isNearby?: boolean;
  skillMatch?: boolean;
  locationMatch?: boolean;
}

// Mock data for testing
const mockProfiles: UserProfile[] = [
  {
    id: '1',
    name: 'Alex Johnson',
    email: 'alex@example.com',
    location: 'San Francisco, CA',
    skills: ['React', 'TypeScript', 'Node.js'],
    avatar: '/lovable-uploads/9484ae90-ca94-4226-8d3f-b46add98f1fc.png',
    distance: 5,
    matchScore: 85,
    isNearby: true,
    skillMatch: true,
  },
  {
    id: '2',
    name: 'Sam Wilson',
    email: 'sam@example.com',
    location: 'New York, NY',
    skills: ['Angular', 'JavaScript', 'Python'],
    avatar: '/lovable-uploads/3a8bca34-e0db-482d-8ecc-9aed0ea2913e.png',
    distance: 1200,
    matchScore: 65,
    skillMatch: true,
  },
  {
    id: '3',
    name: 'Jordan Lee',
    email: 'jordan@example.com',
    location: 'Austin, TX',
    skills: ['Vue', 'React', 'MongoDB'],
    avatar: null,
    distance: 800,
    matchScore: 75,
    skillMatch: true,
  },
  {
    id: '4',
    name: 'Taylor Kim',
    email: 'taylor@example.com',
    location: 'Seattle, WA',
    skills: ['GraphQL', 'React Native', 'Redux'],
    avatar: null,
    distance: 950,
    matchScore: 70,
  },
  {
    id: '5',
    name: 'Casey Morgan',
    email: 'casey@example.com',
    location: 'San Francisco, CA',
    skills: ['Node.js', 'Express', 'PostgreSQL'],
    avatar: null,
    distance: 4,
    matchScore: 80,
    isNearby: true,
    locationMatch: true,
  },
  {
    id: '6',
    name: 'Riley Davis',
    email: 'riley@example.com',
    location: 'Chicago, IL',
    skills: ['React', 'Firebase', 'Tailwind'],
    avatar: null,
    distance: 700,
    matchScore: 60,
    skillMatch: true,
  },
];

const Matches = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProfiles, setFilteredProfiles] = useState(mockProfiles);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    
    if (!query) {
      setFilteredProfiles(mockProfiles);
    } else {
      const filtered = mockProfiles.filter(profile => 
        profile.name.toLowerCase().includes(query) ||
        profile.location.toLowerCase().includes(query) ||
        profile.skills.some(skill => skill.toLowerCase().includes(query))
      );
      setFilteredProfiles(filtered);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
  };

  return (
    <div className="minimal-container">
      <header className="mb-8">
        <h1 className="minimal-header">Find Collaborators</h1>
        <p className="text-muted-foreground mb-6">
          Connect with potential collaborators based on proximity and shared interests
        </p>
        
        <div className="relative mb-8 w-full">
          <Input
            type="search"
            placeholder="Search by name, location or skill..."
            className="minimal-search w-full"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
      </header>

      <div className="profile-grid">
        {filteredProfiles.map((profile) => (
          <div key={profile.id} className="profile-card">
            <div className="profile-image">
              {profile.avatar ? (
                <img 
                  src={profile.avatar} 
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{getInitials(profile.name)}</span>
              )}
            </div>
            <div>
              <h3 className="profile-name">{profile.name}</h3>
              <p className="profile-location">{profile.location}</p>
              <div className="profile-skills">
                {profile.skills.map((skill) => (
                  <span key={skill} className="chip">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <div className="profile-metadata">
              <span>
                {profile.isNearby && '📍 Nearby'}
                {profile.locationMatch && '📍 Same city'}
              </span>
              <span>Match: {profile.matchScore}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Matches;
