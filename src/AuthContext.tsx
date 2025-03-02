
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  name: string;
  email: string;
  location: string;
  skills: string[];
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => void;
  signup: (user: User, password: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  
  const login = (email: string, password: string) => {
    // In a real app, this would validate with a server
    // For now, we just simulate a successful login
    setUser({
      name: 'Demo User',
      email: email,
      location: 'San Francisco, CA',
      skills: ['UI Design', 'UX Design', 'Frontend Development']
    });
  };
  
  const signup = (newUser: User, password: string) => {
    // In a real app, this would send data to a server
    // For now, we just simulate a successful signup
    setUser(newUser);
  };
  
  const logout = () => {
    setUser(null);
  };
  
  const value = {
    user,
    isAuthenticated: !!user,
    login,
    signup,
    logout
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
