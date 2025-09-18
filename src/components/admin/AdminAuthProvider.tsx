import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AdminUser {
  id: string;
  email: string;
  role: 'admin';
}

interface AdminAuthContextType {
  user: AdminUser | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
};

interface AdminAuthProviderProps {
  children: ReactNode;
}

export const AdminAuthProvider = ({ children }: AdminAuthProviderProps) => {
  const [user, setUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    // For demo purposes, auto-login as admin
    const adminUser: AdminUser = {
      id: 'admin-001',
      email: 'admin@kbeauty.com',
      role: 'admin'
    };
    setUser(adminUser);
  }, []);

  const signIn = async (email: string, password: string) => {
    // Mock sign in for demo
    const adminUser: AdminUser = {
      id: 'admin-001',
      email: email,
      role: 'admin'
    };
    setUser(adminUser);
  };

  const signOut = () => {
    setUser(null);
  };

  return (
    <AdminAuthContext.Provider value={{ user, signIn, signOut }}>
      {children}
    </AdminAuthContext.Provider>
  );
};