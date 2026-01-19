import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface User {
  id: string;
  username: string;
  displayName: string | null;
  recoveryEmail: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  changeCredentials: (password: string, newUsername?: string, newEmail?: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  isAdmin: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const response = await fetch("/api/auth/me", {
        credentials: "include",
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Failed to fetch user:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const signIn = async (username: string, password: string) => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username, password }),
    });
    
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || "Login failed");
    }
    
    const data = await response.json();
    setUser(data.user);
  };

  const signOut = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    const response = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || "Password change failed");
    }
  };

  const changeCredentials = async (password: string, newUsername?: string, newEmail?: string) => {
    const response = await fetch("/api/auth/change-credentials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ password, newUsername, newEmail }),
    });
    
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || "Credentials change failed");
    }
    
    await refreshUser();
  };

  const requestPasswordReset = async (email: string) => {
    const response = await fetch("/api/auth/request-password-reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || "Password reset request failed");
    }
  };

  const resetPassword = async (token: string, newPassword: string) => {
    const response = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword }),
    });
    
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || "Password reset failed");
    }
  };

  const isAdmin = !!user;

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      signIn, 
      signOut, 
      changePassword,
      changeCredentials,
      requestPasswordReset,
      resetPassword,
      isAdmin,
      refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
