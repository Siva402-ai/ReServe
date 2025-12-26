
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { mockDB } from '../services/mockDatabase';

interface AuthContextType {
  user: User | null;
  login: (email: string, password?: string) => boolean | string;
  logout: () => void;
  register: (user: Omit<User, 'id'>) => void;
  updateProfile: (updates: Partial<User>) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('reserve_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (email: string, password?: string) => {
    const result = mockDB.login(email, password);
    if (result && typeof result !== 'string') {
      // Successful login
      setUser(result);
      localStorage.setItem('reserve_user', JSON.stringify(result));
      return true;
    }
    // Return the string error or undefined/false
    return typeof result === 'string' ? result : false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('reserve_user');
  };

  const register = (newUser: Omit<User, 'id'>) => {
    const created = mockDB.createUser(newUser);
    // Only auto-login if account status is ACTIVE/VERIFIED
    // mockDB defaults NGO/RECIPIENT to PENDING.
    if (created.verificationStatus !== 'PENDING') {
        setUser(created);
        localStorage.setItem('reserve_user', JSON.stringify(created));
    }
  };

  const updateProfile = (updates: Partial<User>) => {
    if (!user) return;
    const updated = mockDB.updateUser(user.id, updates);
    if (updated) {
      setUser(updated);
      localStorage.setItem('reserve_user', JSON.stringify(updated));
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
