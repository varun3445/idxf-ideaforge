export interface Creative {
  id: string;
  name: string;
  role: string;
  avatar: string;
  skills: string[];
  portfolio: PortfolioItem[];
  bio: string;
  matchScore?: number;
}

export interface PortfolioItem {
  id: string;
  title: string;
  image: string;
  description: string;
}

export interface ProjectIdea {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  steps: string[];
}

// Skill categories for the skill selector
export const skillCategories = [
  {
    name: 'Design',
    skills: ['UI Design', 'UX Design', 'Graphic Design', 'Motion Design', 'Illustration', 'Typography', 'Brand Identity', '3D Design']
  },
  {
    name: 'Development',
    skills: ['Frontend', 'Backend', 'Full Stack', 'Mobile', 'React', 'JavaScript', 'Python', 'Node.js', 'Swift', 'Kotlin']
  },
  {
    name: 'Photography & Video',
    skills: ['Photography', 'Videography', 'Film Making', 'Editing', 'Color Grading', 'Sound Design']
  },
  {
    name: 'Marketing',
    skills: ['Digital Marketing', 'Content Strategy', 'SEO', 'Social Media', 'Copywriting', 'Email Marketing']
  },
  {
    name: 'Business',
    skills: ['Project Management', 'Product Management', 'Business Strategy', 'Entrepreneurship']
  },
  {
    name: 'Art',
    skills: ['Painting', 'Drawing', 'Sculpture', 'Concept Art', 'Character Design', 'Environment Design']
  }
];

// Mock creatives data
export const creatives: Creative[] = [
  {
    id: '1',
    name: 'Alex Morgan',
    role: 'UI/UX Designer',
    avatar: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158',
    skills: ['UI Design', 'UX Design', 'Prototyping', 'Figma', 'User Research'],
    portfolio: [
      {
        id: '101',
        title: 'Mobile Banking App',
        image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158',
        description: 'A redesign of a banking app focusing on simplicity and usability.'
      },
      {
        id: '102',
        title: 'E-commerce Website',
        image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d',
        description: 'A clean and modern e-commerce experience optimized for conversion.'
      }
    ],
    bio: 'Product designer specializing in creating intuitive digital experiences. Passionate about solving complex problems with elegant, user-centered solutions.'
  },
  {
    id: '2',
    name: 'Jordan Lee',
    role: 'Frontend Developer',
    avatar: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d',
    skills: ['React', 'JavaScript', 'TypeScript', 'CSS', 'Frontend'],
    portfolio: [
      {
        id: '201',
        title: 'Interactive Dashboard',
        image: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b',
        description: 'A responsive dashboard with interactive data visualizations.'
      },
      {
        id: '202',
        title: 'Social Media Platform',
        image: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81',
        description: 'A social media platform built with React and Node.js.'
      }
    ],
    bio: 'Frontend developer with a passion for creating performant, accessible, and beautiful web applications.'
  },
  {
    id: '3',
    name: 'Taylor Chen',
    role: 'Product Designer',
    avatar: 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952',
    skills: ['Product Design', 'UI Design', 'Design Systems', 'User Research'],
    portfolio: [
      {
        id: '301',
        title: 'Productivity App',
        image: 'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7',
        description: 'A productivity app that helps teams collaborate more efficiently.'
      },
      {
        id: '302',
        title: 'Design System',
        image: 'https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b',
        description: 'A comprehensive design system for a large enterprise company.'
      }
    ],
    bio: 'Product designer focused on creating systems that solve business problems and delight users.'
  },
  {
    id: '4',
    name: 'Casey Rivera',
    role: 'Full Stack Developer',
    avatar: 'https://images.unsplash.com/photo-1501286353178-1ec871214838',
    skills: ['JavaScript', 'Python', 'React', 'Node.js', 'Full Stack'],
    portfolio: [
      {
        id: '401',
        title: 'CRM System',
        image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d',
        description: 'A customer relationship management system with analytics features.'
      },
      {
        id: '402',
        title: 'Real-time Collaboration Tool',
        image: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b',
        description: 'A tool that allows teams to collaborate in real-time.'
      }
    ],
    bio: 'Full stack developer with experience building scalable web applications and APIs.'
  },
];

// Mock project ideas
export const projectIdeas: ProjectIdea[] = [
  {
    id: '1',
    title: 'Interactive Portfolio Website',
    description: 'Create a unique portfolio website that showcases your work in an interactive and engaging way.',
    category: 'Web Development',
    difficulty: 'Intermediate',
    steps: [
      'Define your personal brand and visual style',
      'Sketch out the user experience and navigation flow',
      'Design the UI in your preferred design tool',
      'Develop the frontend with animations and interactions',
      'Ensure the site is responsive and performs well',
      'Add analytics to track visitor engagement'
    ]
  },
  {
    id: '2',
    title: 'Mobile App Concept',
    description: 'Design a concept for a mobile app that solves a specific problem you\'ve identified.',
    category: 'UX/UI Design',
    difficulty: 'Intermediate',
    steps: [
      'Identify a problem worth solving',
      'Research the target audience and competitors',
      'Create user personas and journey maps',
      'Design wireframes and user flows',
      'Develop high-fidelity mockups',
      'Create a prototype to demonstrate key interactions',
      'Write a case study explaining your process'
    ]
  },
  {
    id: '3',
    title: 'Brand Identity System',
    description: 'Develop a complete brand identity system for a fictional company or product.',
    category: 'Branding',
    difficulty: 'Advanced',
    steps: [
      'Define the brand strategy and positioning',
      'Design a logo and visual identity',
      'Create a color palette and typography system',
      'Design stationery and marketing materials',
      'Develop brand guidelines',
      'Showcase the brand in various applications'
    ]
  },
  {
    id: '4',
    title: 'Data Visualization Project',
    description: 'Create an interesting visualization of a dataset that reveals insights in a compelling way.',
    category: 'Data Visualization',
    difficulty: 'Intermediate',
    steps: [
      'Find an interesting dataset to work with',
      'Analyze the data to identify patterns and insights',
      'Sketch different visualization approaches',
      'Design the visualization interface',
      'Implement the visualization using appropriate tools',
      'Add interactive elements to explore the data'
    ]
  },
  {
    id: '5',
    title: 'Social Impact Campaign',
    description: 'Design a campaign for a social cause you care about, including messaging and visual assets.',
    category: 'Marketing',
    difficulty: 'Intermediate',
    steps: [
      'Choose a cause and define the campaign objectives',
      'Research the target audience and existing initiatives',
      'Develop key messages and campaign strategy',
      'Create visual assets for various channels',
      'Design a landing page or microsite',
      'Plan the campaign launch and distribution strategy'
    ]
  },
  {
    id: '6',
    title: 'Generative Art Project',
    description: 'Create an art piece or series using code and algorithms to generate unique visual outputs.',
    category: 'Creative Coding',
    difficulty: 'Advanced',
    steps: [
      'Explore different approaches to generative art',
      'Learn the basics of a creative coding framework',
      'Experiment with algorithms and parameters',
      'Refine your approach and aesthetic direction',
      'Generate a series of outputs',
      'Document your process and share your results'
    ]
  }
];
