
export interface User {
  id: string;
  email: string;
  name: string;
  location: string;
  skills: string[];
  avatar: string | null;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ error?: any }>;
  signup: (name: string, email: string, password: string, location: string, skills?: string[], avatar?: string | null) => Promise<{ error?: any }>;
}
