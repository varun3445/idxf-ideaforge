
export interface User {
  id: string;
  name: string;
  email: string;
  location: string;
  skills: string[];
  sex: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ error: Error | null }>;
  signup: (name: string, email: string, password: string, location: string, skills: string[]) => Promise<{ error: Error | null }>;
  logout: () => Promise<void>;
  loading: boolean;
}
