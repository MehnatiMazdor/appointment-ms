"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase-frontend-client";
import type { User } from "@supabase/supabase-js";

interface Profile {
  id: string;
  email: string | null;
  role: "patient" | "doctor" | "admin";
  created_at: string;
  updated_at: string;
}

interface AuthState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  signInWithOtp: (email: string) => Promise<{ success: boolean; error: string | null }>;
  verifyOtp: (email: string, token: string) => Promise<{ success: boolean; error: string | null }>;
  signOut: () => Promise<{ success: boolean; error: unknown }>;
  getDashboardPath: (role?: string) => string;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

// Define the initial state with all required properties
const initialState: Omit<AuthState, "signInWithOtp" | "verifyOtp" | "signOut" | "getDashboardPath"> = {
  user: null,
  profile: null,
  loading: true,
  error: null,
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authState, setAuthState] = useState(initialState);
  const profileFetchingRef = useRef(false);

  const getProfile = useCallback(async (userId: string) => {
    if (profileFetchingRef.current) return null;

    try {
      profileFetchingRef.current = true;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching profile:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error fetching profile:", error);
      return null;
    } finally {
      profileFetchingRef.current = false;
    }
  }, []);

  // const createProfile = useCallback(async (user: User) => {
  //   try {

  //     const { data, error } = await supabase
  //       .from("profiles")
  //       .insert({ id: user.id, email: user.email })
  //       .select()
  //       .single();

  //     if (error) throw error;
  //     return data;
  //   } catch (error) {
  //     console.error("Error creating profile:", error);
  //     return null;
  //   }
  // }, []);

  useEffect(() => {
    const getInitialSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session?.user) {
        setAuthState({ user: null, profile: null, loading: false, error: null });
        return;
      }

      const user = session.user;
      let profile = await getProfile(user.id);
      // if (!profile) profile = await createProfile(user);
      if (!profile) {
        console.log("Unauthorized profile");
        return
      }

      setAuthState({ user, profile, loading: false, error: null });
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        const user = session.user;
        let profile = await getProfile(user.id);
        if (!profile) {
          console.log("Unauthorized profile");
          return;
        }

        setAuthState({ user, profile, loading: false, error: null });
      }

      if (event === "SIGNED_OUT") {
        setAuthState({ user: null, profile: null, loading: false, error: null });
      }
    });

    return () => subscription.unsubscribe();
  }, [getProfile]);

  const signInWithOtp = useCallback(async (email: string) => {
    try {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }));

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true },
      });

      if (error) throw error;

      setAuthState((prev) => ({ ...prev, loading: false, error: null }));
      return { success: true, error: null };
    } catch (error: any) {
      const errorMessage = error.message || "Failed to send OTP";
      setAuthState((prev) => ({ ...prev, error: errorMessage, loading: false }));
      return { success: false, error: errorMessage };
    }
  }, []);

  const verifyOtp = useCallback(async (email: string, token: string) => {
    try {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }));

      const { data, error } = await supabase.auth.verifyOtp({ email, token, type: "email" });

      if (error || !data?.user) throw new Error("Authentication failed");

      return { success: true, error: null };
    } catch (error: any) {
      const errorMessage = error.message || "Authentication failed. Please try again.";
      setAuthState((prev) => ({ ...prev, error: errorMessage, loading: false }));
      return { success: false, error: errorMessage };
    }
  }, []);

  // const signOut = useCallback(async () => {
  //   try {
  //     await supabase.auth.signOut();
  //     setAuthState({ user: null, profile: null, loading: false, error: null });
  //   } catch (error) {
  //     console.error("Error signing out:", error);
  //   }
  // }, []);

  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setAuthState({
        user: null,
        profile: null,
        loading: false,
        error: null
      });
      console.log("User signed out successfully");
      return { success: true, error: null };
    } catch (error) {
      console.error("Error signing out:", error);
      return { success: false, error };
    }
  }, []);

  const getDashboardPath = useCallback((role?: string) => {
    switch (role) {
      case "admin":
        return "/dashboard/admin";
      case "doctor":
        return "/dashboard/doctor";
      default:
        return "/dashboard/patient";
    }
  }, []);

  // Create the context value with all required properties
  const value: AuthState = {
    user: authState.user,
    profile: authState.profile,
    loading: authState.loading,
    error: authState.error,
    signInWithOtp,
    verifyOtp,
    signOut,
    getDashboardPath,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthState => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

