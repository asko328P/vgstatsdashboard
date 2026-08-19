import { create } from "zustand";
import { supabase } from "@/utils/supabase";

export interface AuthState {
  isLoggedIn: boolean;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  setIsLoggedIn: (isLoggedIn: boolean) => set({ isLoggedIn }),
}));

// Bootstrapped here rather than in a component: several screens show a header
// that reacts to the session without ever mounting PageHeader. The session
// outlives a reload (persistSession), so read it once and then follow every
// sign in / sign out.
supabase.auth.getSession().then(({ data }) => {
  useAuthStore.getState().setIsLoggedIn(!!data.session);
});

supabase.auth.onAuthStateChange((_event, session) => {
  useAuthStore.getState().setIsLoggedIn(!!session);
});
