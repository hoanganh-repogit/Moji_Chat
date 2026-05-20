import { create } from "zustand";
import { toast } from "sonner";
import type { AuthState } from "@/types/store";
import { authService } from "@/services/authService";

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  user: null,
  loading: false,

  setAccessToken: (accessToken) => set({ accessToken }),
  clearState: () => {
    set({ accessToken: null, user: null, loading: false });
  },

  signUp: async (username, password, email, firstName, lastName) => {
    try {
      // call API
      set({ loading: true });

      await authService.signUp(username, password, email, firstName, lastName);

      toast.success("Sign up successful! Please Sign in.");
    } catch (error) {
      console.error("Sign up error:", error);
      toast.error("Failed to sign up. Please try again.");
    } finally {
      set({ loading: false });
    }
  },

  signIn: async (username, password) => {
    try {
      set({ loading: true });

      const { accessToken } = await authService.signIn(username, password);
      get().setAccessToken(accessToken);

      await get().fetchMe();
      toast.success("Sign in successful!");
    } catch (error) {
      console.error("Sign in error:", error);
      toast.error("Failed to sign in. Please try again.");
    } finally {
      set({ loading: false });
    }
  },

  signOut: async () => {
    try {
      await authService.signOut();
      get().clearState();
      toast.success("Sign out successful!");
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("Failed to sign out. Please try again.");
    }
  },

  fetchMe: async () => {
    try {
      set({ loading: true });
      const user = await authService.fetchMe();

      set({ user });
    } catch (error) {
      console.error(error);
      set({ user: null, accessToken: null });
      toast.error("Error occurred while fetching user data. Please try again.");
    } finally {
      set({ loading: false });
    }
  },

  refresh: async () => {
    try {
      set({ loading: true });
      const { user } = get();
      const accessToken = await authService.refreshToken();
      get().setAccessToken(accessToken);
      if (user) {
        await get().fetchMe();
      }
    } catch (error) {
      console.error("Token refresh error:", error);
      get().clearState();
      toast.error("Session expired. Please sign in again.");
    } finally {
      set({ loading: false });
    }
  },
}));
