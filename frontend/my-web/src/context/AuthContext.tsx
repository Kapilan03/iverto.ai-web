import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { supabase } from "../lib/supabase";

export interface User {
  id: string;
  email: string;
  role: "admin" | "staff" | "parent";
  name: string;
  studentId?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user.id, session.user.email!);
      } else {
        setIsLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchUserProfile(session.user.id, session.user.email!);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string, email: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.warn("Could not fetch user profile details.");
        // Fallback or handle missing profile
        let fallbackRole = 'parent';
        if (email.includes('admin')) fallbackRole = 'admin';
        if (email.includes('staff')) fallbackRole = 'staff';
        
        setUser({ id: userId, email, role: fallbackRole as any, name: email.split('@')[0].toUpperCase() + ' Demo' });
      } else if (data) {
        setUser({
          id: userId,
          email: data.email,
          role: data.role as any,
          name: data.name,
          studentId: data.student_id
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    // Auto-fallback for demo: if user doesn't exist, try to sign them up immediately!
    if (error && error.message.toLowerCase().includes('invalid login credentials')) {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ 
        email, 
        password 
      });
      
      if (signUpError) {
        return { success: false, error: signUpError.message };
      }

      if (signUpData?.user) {
        // Automatically set the role based on the demo email
        let role = 'parent';
        if (email.includes('admin')) role = 'admin';
        if (email.includes('staff')) role = 'staff';
        
        await supabase.from('user_profiles').upsert({
          id: signUpData.user.id,
          email,
          role,
          name: email.split('@')[0].toUpperCase() + ' Demo'
        });

        // The signup automatically logs them in IF email confirmation is disabled
        if (signUpData.session) {
          return { success: true };
        } else {
          return { success: false, error: "Please go to Supabase Dashboard -> Authentication -> Providers -> Email -> Turn OFF 'Confirm email', then try again." };
        }
      }
    } else if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">Loading session...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
