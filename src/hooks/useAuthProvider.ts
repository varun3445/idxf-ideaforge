
import { useState, useEffect } from "react";
import { User } from "../types/auth.types";
import { supabase } from "../integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";

export const useAuthProvider = () => {
  const [user, setUser] = useState<User | null>({
    id: 'user-1',
    email: 'user@example.com',
    name: 'Default User',
    location: 'Somewhere',
    skills: ['React', 'JavaScript'],
    avatar: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  // Initialize local storage with test data if needed
  useEffect(() => {
    // Load any existing projects from localStorage when initializing
    const savedProjects = localStorage.getItem('userProjects');
    if (!savedProjects) {
      // Initialize with an empty array if no projects exist
      localStorage.setItem('userProjects', JSON.stringify([]));
      console.log("Initialized empty userProjects in localStorage");
    } else {
      console.log("Found existing projects in localStorage:", JSON.parse(savedProjects));
    }
    
    // Initialize backing projects if it doesn't exist
    if (!localStorage.getItem('backingProjects')) {
      localStorage.setItem('backingProjects', JSON.stringify({}));
      console.log("Initialized empty backingProjects in localStorage");
    }
    
    // Initialize user notifications if they don't exist
    if (!localStorage.getItem('userNotifications')) {
      localStorage.setItem('userNotifications', JSON.stringify([]));
      console.log("Initialized empty userNotifications in localStorage");
    }
    
    console.log("Auth initialized with mock user:", user);
  }, []);

  const login = async (email: string, password: string) => {
    // Simulate successful login
    console.log("Mock login with:", email);
    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    // Simulate successful sign in
    console.log("Mock signIn with:", email);
  };

  const signup = async (
    name: string, 
    email: string, 
    password: string, 
    location: string, 
    skills: string[] = [],
    avatar: string | null = null
  ) => {
    // Simulate successful signup
    console.log("Mock signup for:", name, email);
    return { error: null };
  };

  const signUp = async (email: string, password: string, name: string) => {
    // Simulate successful sign up
    console.log("Mock signUp for:", name, email);
  };

  const logout = async () => {
    // No actual logout needed
    console.log("Mock logout");
  };

  return {
    user,
    setUser,
    loading,
    error,
    isAuthenticated,
    login,
    signup,
    logout,
    signIn,
    signUp,
  };
};
