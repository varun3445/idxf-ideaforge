
export interface User {
  id: string;
  email: string;
  name: string;
  location: string;
  skills: string[];
  avatar: string | null;
  plan?: string;
}

export interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ error?: any }>;
  signup: (
    name: string, 
    email: string, 
    password: string, 
    location: string, 
    skills?: string[], 
    avatar?: string | null,
    plan?: string,
    promoCode?: string | null
  ) => Promise<{ error?: any }>;
  logout: () => Promise<void>;
  // Add these aliases to match the expected interface
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
}
