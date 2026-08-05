import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserProfile, AuditLog } from '../../domain/entities';
import { INITIAL_USERS, INITIAL_AUDITS } from '../../domain/constants/mockData';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';

interface AuthContextType {
  currentUser: UserProfile | null;
  users: UserProfile[];
  audits: AuditLog[];
  login: (user: UserProfile) => void;
  logout: () => void;
  register: (user: UserProfile) => Promise<void>;
  updateCredentials: (userId: string, newUsername: string, newPassword?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [users, setUsers] = useState<UserProfile[]>(INITIAL_USERS);
  const [audits, setAudits] = useState<AuditLog[]>(INITIAL_AUDITS);

  // Example minimal context for now
  const login = (user: UserProfile) => {
    setCurrentUser(user);
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const register = async (user: UserProfile) => {
    setUsers([...users, user]);
  };

  const updateCredentials = async (userId: string, newUsername: string, newPassword?: string) => {
    setUsers(users.map(u => u.id === userId ? { ...u, username: newUsername, password: newPassword || u.password } : u));
  };

  return (
    <AuthContext.Provider value={{ currentUser, users, audits, login, logout, register, updateCredentials }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
