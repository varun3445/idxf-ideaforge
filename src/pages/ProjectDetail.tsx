
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Users, Calendar, Tag, Code, Award, Clock, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AnimatedTransition from '@/components/AnimatedTransition';
import GlassmorphicCard from '@/components/GlassmorphicCard';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

interface ProjectDetails {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  imageUrl: string;
  creator: string;
  collaborators: number;
  category: string;
  techStack: string[];
  createdAt: string;
  goals: string[];
  challenges: string[];
  backersCount: number;
  waitlistCount: number;
}

const ProjectDetail = () => {
  const {
    id
  } = useParams<{
    id: string;
  }>();
  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBackingProject, setIsBackingProject] = useState(false);
  const [isCollaborating, setIsCollaborating] = useState(false);
  const {
    toast
  } = useToast();

  useEffect(() => {
    const mockProjects: Record<string, ProjectDetails> = {
      '1': {
        id: '1',
        title: 'AI-Powered Visual Design Assistant',
        description: 'An intelligent design assistant that provides real-time feedback and suggestions as designers work on their projects.',
        longDescription: 'Our AI-Powered Visual Design Assistant leverages machine learning to analyze design principles, user behavior, and accessibility standards in real-time. As designers work on their projects, the assistant offers contextual suggestions, alternative approaches, and educational insights to improve both the aesthetic quality and functional usability of designs. The system learns from individual designer preferences and adapts its suggestions accordingly, creating a personalized design partnership.',
        imageUrl: 'https://images.unsplash.com/photo-1664575198263-269a022d6e14?q=80&w=1170&auto=format&fit=crop',
        creator: 'Alice Wonderland',
        collaborators: 5,
        category: 'AI & Design',
        techStack: ['React', 'TensorFlow.js', 'WebGL', 'Three.js'],
        createdAt: '2023-11-15',
        goals: ['Create an AI assistant that understands design principles', 'Provide real-time feedback on design decisions', 'Help designers learn and improve through contextual suggestions', 'Adapt to individual designer preferences over time'],
        challenges: ['Training ML models to understand subjective design qualities', 'Creating feedback that\'s helpful without being intrusive', 'Balancing automation with designer creative control', 'Building a system that learns without requiring excessive data'],
        backersCount: 24,
        waitlistCount: 12
      },
      '2': {
        id: '2',
        title: 'Decentralized Creative Marketplace',
        description: 'A blockchain-based platform where creatives can sell their work directly to clients without intermediaries, using smart contracts.',
        longDescription: 'Our Decentralized Creative Marketplace reimagines how creative professionals and clients interact, removing traditional middlemen and allowing direct, secure transactions. Built on blockchain technology, the platform uses smart contracts to automate licensing, payments, and rights management, ensuring creators receive fair compensation while clients get verifiable ownership. The system includes a reputation mechanism, dispute resolution process, and customizable contract templates that adapt to different creative disciplines.',
        imageUrl: 'https://images.unsplash.com/photo-1639762681057-408e52192e55?q=80&w=1332&auto=format&fit=crop',
        creator: 'Bob Builder',
        collaborators: 3,
        category: 'Web3',
        techStack: ['Solidity', 'React', 'IPFS', 'Ethereum'],
        createdAt: '2023-09-23',
        goals: ['Create a trustless marketplace for creative professionals', 'Eliminate intermediary fees through direct client-creator transactions', 'Automate licensing and rights management via smart contracts', 'Build a reputation system that works across creative disciplines'],
        challenges: ['Creating smart contracts flexible enough for creative work', 'Balancing blockchain transaction costs with marketplace usability', 'Designing an accessible UX for non-technical creative professionals', 'Implementing fair dispute resolution mechanisms'],
        backersCount: 18,
        waitlistCount: 8
      },
      '3': {
        id: '3',
        title: 'Immersive Learning Environment',
        description: 'A VR-based educational platform that creates interactive, spatial learning experiences for complex subjects.',
        longDescription: 'Our Immersive Learning Environment transforms abstract and complex educational content into spatial, interactive experiences. Using virtual reality technology, we\'ve created a platform where students can physically interact with mathematical concepts, explore historical events from within, and manipulate scientific models at any scale. The system adapts to different learning styles, tracks comprehension through interaction patterns, and allows educators to collaboratively build new learning modules without requiring programming expertise.',
        imageUrl: 'https://images.unsplash.com/photo-1617802690992-15d93263d3a9?q=80&w=1170&auto=format&fit=crop',
        creator: 'Charlie Chen',
        collaborators: 8,
        category: 'Education',
        techStack: ['Unity', 'WebXR', 'Three.js', 'Node.js'],
        createdAt: '2023-07-09',
        goals: ['Make abstract concepts tangible through spatial interaction', 'Create immersive historical and scientific simulations', 'Adapt content to different learning styles and paces', 'Enable educators to build VR content without coding skills'],
        challenges: ['Designing interactions that enhance rather than distract from learning', 'Making VR experiences accessible to schools with limited resources', 'Creating an authoring tool intuitive enough for non-technical educators', 'Measuring learning outcomes in a new educational medium'],
        backersCount: 15,
        waitlistCount: 5
      },
      '4': {
        id: '4',
        title: 'Sustainable Design Calculator',
        description: 'A tool that helps designers measure and optimize the environmental impact of their digital and physical products.',
        longDescription: 'The Sustainable Design Calculator gives designers a comprehensive view of the environmental impact of their choices, from material selection to manufacturing processes to digital energy consumption. The tool combines lifecycle assessment data with design specifications to calculate carbon footprint, water usage, waste production, and other key sustainability metrics. It then recommends optimizations prioritized by impact, showing designers how small changes can significantly reduce environmental harm while maintaining design integrity.',
        imageUrl: 'https://images.unsplash.com/photo-1516535794938-6f3426ecacba?q=80&w=1206&auto=format&fit=crop',
        creator: 'Dana Davis',
        collaborators: 2,
        category: 'Sustainability',
        techStack: ['React', 'Python', 'D3.js', 'PostgreSQL'],
        createdAt: '2023-05-12',
        goals: ['Create an accessible tool for environmental impact assessment', 'Help designers make sustainable choices without sacrificing quality', 'Provide actionable, prioritized optimization recommendations', 'Support both digital and physical product sustainability'],
        challenges: ['Gathering accurate environmental impact data across industries', 'Making complex sustainability metrics understandable to designers', 'Balancing design constraints with environmental optimizations', 'Creating a system flexible enough for diverse design disciplines'],
        backersCount: 30,
        waitlistCount: 10
      },
      '5': {
        id: '5',
        title: 'Collaborative Audio Workspace',
        description: 'A platform for remote music production and audio engineering teams to work together in real-time.',
        longDescription: 'Our Collaborative Audio Workspace enables dispersed audio professionals to work together as if they were in the same studio. The platform synchronizes multi-track audio editing in real-time with ultra-low latency, supports spatial audio mixing where each participant can hear changes as they\'re made, and includes specialized tools for different audio disciplines from music production to podcast editing to game sound design. The system manages complex version control for audio projects and integrates with industry-standard digital audio workstations.',
        imageUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=1170&auto=format&fit=crop',
        creator: 'Eddie Evans',
        collaborators: 6,
        category: 'Music & Audio',
        techStack: ['WebRTC', 'Web Audio API', 'React', 'Node.js'],
        createdAt: '2023-03-04',
        goals: ['Create studio-quality collaborative experiences for remote teams', 'Support real-time multitrack editing with minimal latency', 'Build specialized tools for different audio disciplines', 'Integrate with existing professional audio workflows'],
        challenges: ['Synchronizing high-fidelity audio editing in real-time', 'Managing complex version control for collaborative audio projects', 'Creating an interface accessible to different audio disciplines', 'Ensuring compatibility with existing professional tools'],
        backersCount: 22,
        waitlistCount: 14
      },
      '6': {
        id: '6',
        title: 'Accessibility Design System',
        description: 'An open-source design system focused on creating highly accessible digital experiences for users of all abilities.',
        longDescription: 'The Accessibility Design System is a comprehensive toolkit that makes building fully accessible digital products simpler and more consistent. It includes components that are technically accessible by default but also aesthetically cohesive, accessibility-focused documentation that explains the "why" alongside the "how," automated testing tools integrated into the development workflow, and adaptable design tokens that support accessibility across brands and visual identities. The system is built with a community-driven approach, incorporating feedback from users with diverse accessibility needs.',
        imageUrl: 'https://images.unsplash.com/photo-1559028012-481c04fa702d?q=80&w=1336&auto=format&fit=crop',
        creator: 'Fiona Frost',
        collaborators: 4,
        category: 'Accessibility',
        techStack: ['React', 'TypeScript', 'ARIA', 'Storybook'],
        createdAt: '2023-01-21',
        goals: ['Create components that are accessible by default, not as an afterthought', 'Build educational tools that teach accessibility best practices', 'Develop testing automation that catches accessibility issues early', 'Support accessibility needs across diverse brands and visual styles'],
        challenges: ['Balancing aesthetic cohesion with accessibility requirements', 'Supporting the full range of assistive technologies', 'Creating educational materials that drive adoption', 'Building components flexible enough for diverse brand identities'],
        backersCount: 45,
        waitlistCount: 20
      }
    };
    
    setTimeout(() => {
      if (id && mockProjects[id]) {
        setProject(mockProjects[id]);
      }
      setIsLoading(false);
    }, 500);
  }, [id]);

  const handleCollaborate = () => {
    if (project) {
      setIsCollaborating(true);
      toast({
        title: "Collaboration Request Sent",
        description: `Your request to collaborate on "${project.title}" has been sent to the project owner.`,
        variant: "success"
      });
      
      // Reset button after a delay for better UX
      setTimeout(() => setIsCollaborating(false), 2000);
    }
  };

  const handleBackProject = () => {
    if (project) {
      setIsBackingProject(true);
      toast({
        title: "Project Backed",
        description: `You have successfully backed "${project.title}"`,
        variant: "success"
      });
      
      // Update the backer count locally for immediate feedback
      setProject(prev => prev ? {...prev, backersCount: prev.backersCount + 1} : prev);
      
      // Reset button after a delay for better UX
      setTimeout(() => setIsBackingProject(false), 2000);
    }
  };

  if (isLoading) {
    return <div className="page-container flex justify-center items-center min-h-[60vh]">
        <div className="animate-pulse text-xl">Loading project details...</div>
      </div>;
  }

  if (!project) {
    return <div className="page-container">
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold mb-4">Project Not Found</h2>
          <p className="mb-8">The project you're looking for doesn't exist or may have been removed.</p>
          <Link to="/explore">
            <Button>Return to Explore</Button>
          </Link>
        </div>
      </div>;
  }

  const formattedDate = format(new Date(project.createdAt), 'dd-MM-yyyy');

  return <AnimatedTransition>
      <div className="page-container">
        <div className="w-full flex justify-start mb-8">
          <Link to="/explore" className="inline-flex items-center gap-2 text-black hover:underline px-0 py-0">
            <ArrowLeft size={18} />
            <span className="text-left px-[2px] mx-0">Back to Explore</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <img src={project.imageUrl} alt={project.title} className="w-full aspect-video object-cover rounded-lg shadow-lg mb-6" />
            
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">{project.title}</h1>
            
            <div className="flex flex-wrap gap-3 mb-8 justify-center">
              <Badge variant="outline" className="inline-flex items-center gap-1 text-sm font-medium bg-primary/30 text-primary border-primary/50 px-4 py-2 rounded-full">
                <Tag size={14} />
                {project.category}
              </Badge>
              <Badge variant="outline" className="inline-flex items-center gap-1 text-sm font-medium bg-muted text-muted-foreground border-muted px-4 py-2 rounded-full">
                <Users size={14} />
                {project.collaborators} collaborators
              </Badge>
              <Badge variant="outline" className="inline-flex items-center gap-1 text-sm font-medium bg-muted text-muted-foreground border-muted px-4 py-2 rounded-full">
                <Calendar size={14} />
                {formattedDate}
              </Badge>
              <Badge variant="outline" className="inline-flex items-center gap-1 text-sm font-medium bg-green-100 text-green-800 border-green-200 px-4 py-2 rounded-full">
                <Award size={14} />
                {project.backersCount} backers
              </Badge>
              {project.waitlistCount > 0 && (
                <Badge variant="outline" className="inline-flex items-center gap-1 text-sm font-medium bg-amber-100 text-amber-800 border-amber-200 px-4 py-2 rounded-full">
                  <Clock size={14} />
                  {project.waitlistCount} in waitlist
                </Badge>
              )}
            </div>
            
            <div className="space-y-6 mb-8">
              <p className="text-lg leading-relaxed text-left">{project.longDescription}</p>
              
              <div>
                <h3 className="text-xl font-semibold mb-4 my-0 py-0 text-left">Project Goals</h3>
                <ul className="list-disc pl-5 space-y-2">
                  {project.goals.map((goal, index) => <li key={index} className="text-muted-foreground text-left">{goal}</li>)}
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-4 text-left">Technical Challenges</h3>
                <ul className="list-disc pl-5 space-y-2">
                  {project.challenges.map((challenge, index) => <li key={index} className="text-muted-foreground px-0 text-left">{challenge}</li>)}
                </ul>
              </div>
            </div>
          </div>
          
          <div>
            <GlassmorphicCard className="sticky top-24">
              <h3 className="text-xl font-semibold mb-6 text-left">Project Details</h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2 text-left">Creator</h4>
                  <p className="text-lg text-left">{project.creator}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2 text-left">Tech Stack</h4>
                  <div className="flex flex-wrap gap-2">
                    {project.techStack.map((tech, index) => (
                      <Badge 
                        key={index} 
                        variant="outline" 
                        className="inline-flex items-center gap-1 text-sm bg-primary/30 text-primary border-primary/50 px-3 py-1.5 rounded-full"
                      >
                        <Code size={14} />
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="pt-6 border-t border-border space-y-3">
                  <Button 
                    className="w-full flex items-center justify-center gap-2"
                    onClick={handleBackProject}
                    variant="secondary"
                    disabled={isBackingProject}
                  >
                    {isBackingProject ? (
                      <span className="flex items-center gap-2">
                        <Heart className="h-4 w-4 fill-current" />
                        Backed!
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Heart className="h-4 w-4" />
                        Back This Project
                      </span>
                    )}
                  </Button>
                  
                  <Button 
                    className="w-full" 
                    onClick={handleCollaborate}
                    disabled={isCollaborating}
                  >
                    {isCollaborating ? "Request Sent!" : "Request to Collaborate"}
                  </Button>
                </div>
              </div>
            </GlassmorphicCard>
          </div>
        </div>
      </div>
    </AnimatedTransition>;
};

export default ProjectDetail;
