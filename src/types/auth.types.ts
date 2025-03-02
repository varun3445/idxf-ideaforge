
export interface User {
  id: string;
  email: string;
  name?: string;
  location?: string;
  sex?: string;
  skills?: string[];
  avatar?: string | null;
}

export interface AuthContextType {
  user: User | null;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  error: string | null;
  
  // Adding missing properties and methods
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ error?: any }>;
  signup: (name: string, email: string, password: string, location: string, skills: string[]) => Promise<{ error?: any }>;
}
