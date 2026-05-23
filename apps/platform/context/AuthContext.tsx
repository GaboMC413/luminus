"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface OnboardingData {
  avatar?: string;
  role?: string;
  bio?: string;
  city?: string;
  country?: string;
  interests: string[];
  intention: string;
  plan: string;
}

export interface User {
  email: string;
  name?: string;
  isOnboarded: boolean;
  onboardingData?: OnboardingData;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string) => Promise<boolean>;
  signUp: (email: string, name: string) => Promise<boolean>;
  completeOnboarding: (onboardingData: OnboardingData) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize and load user from localStorage
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("luminus_active_user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error("Error reading auth state", e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get all registered mock users
  const getRegisteredUsers = (): User[] => {
    try {
      const stored = localStorage.getItem("luminus_registered_users");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  // Mock Sign In
  const signIn = async (email: string): Promise<boolean> => {
    setLoading(true);
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const users = getRegisteredUsers();
    const foundUser = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (foundUser) {
      localStorage.setItem("luminus_active_user", JSON.stringify(foundUser));
      setUser(foundUser);
      setLoading(false);
      return true;
    }

    setLoading(false);
    return false; // User not found
  };

  // Mock Sign Up
  const signUp = async (email: string, name: string): Promise<boolean> => {
    setLoading(true);
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const users = getRegisteredUsers();
    const exists = users.some((u) => u.email.toLowerCase() === email.toLowerCase());

    if (exists) {
      setLoading(false);
      return false; // User already exists
    }

    const newUser: User = {
      email: email.toLowerCase(),
      name,
      isOnboarded: false,
    };

    const updatedUsers = [...users, newUser];
    localStorage.setItem("luminus_registered_users", JSON.stringify(updatedUsers));
    localStorage.setItem("luminus_active_user", JSON.stringify(newUser));
    setUser(newUser);
    setLoading(false);
    return true;
  };

  // Mock Onboarding Save
  const completeOnboarding = async (onboardingData: OnboardingData): Promise<void> => {
    if (!user) return;

    setLoading(true);
    // Simulate API database save delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const updatedUser: User = {
      ...user,
      isOnboarded: true,
      onboardingData,
    };

    // Update active session
    localStorage.setItem("luminus_active_user", JSON.stringify(updatedUser));
    
    // Update in registered list
    const users = getRegisteredUsers();
    const updatedUsers = users.map((u) => 
      u.email.toLowerCase() === user.email.toLowerCase() ? updatedUser : u
    );
    localStorage.setItem("luminus_registered_users", JSON.stringify(updatedUsers));

    setUser(updatedUser);
    setLoading(false);
  };

  // Mock Sign Out
  const signOut = () => {
    localStorage.removeItem("luminus_active_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, completeOnboarding, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
