import { create } from "zustand";
import { auth, db } from "@/lib/firebase/config";
import { onAuthStateChanged, User, signOut } from "firebase/auth";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import type { AppUser, UserRole } from "@/lib/types";

interface AuthState {
  user: User | null;
  userProfile: AppUser | null;
  loading: boolean;
  initialized: boolean;
  signIn: (firebaseUser: User) => Promise<void>;
  logOut: () => Promise<void>;
  initializeAuth: () => () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  userProfile: null,
  loading: true,
  initialized: false,

  signIn: async (firebaseUser: User) => {
    set({ loading: true });
    try {
      const userRef = doc(db, "users", firebaseUser.uid);
      const userSnap = await getDoc(userRef);

      let profile: AppUser;
      if (userSnap.exists()) {
        const data = userSnap.data();
        profile = {
          id: firebaseUser.uid,
          displayName: data.displayName || firebaseUser.displayName || "Pengguna",
          email: firebaseUser.email || "",
          role: (data.role as UserRole) || "warehouse",
          permissions: data.permissions || { inventoryEdit: false, orderApproval: false, financialAnalytics: false },
          lastActive: data.lastActive || new Date(),
          status: "active",
          avatarUrl: data.avatarUrl || firebaseUser.photoURL || undefined
        };
      } else {
        // Create a default profile if it doesn't exist
        profile = {
          id: firebaseUser.uid,
          displayName: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Pengguna",
          email: firebaseUser.email || "",
          role: "warehouse",
          permissions: { inventoryEdit: false, orderApproval: false, financialAnalytics: false },
          lastActive: new Date(),
          status: "active",
        };
        await setDoc(userRef, {
          ...profile,
          lastActive: Timestamp.now()
        });
      }

      set({ user: firebaseUser, userProfile: profile, loading: false });
    } catch (error) {
      console.error("Error setting user profile:", error);
      set({ loading: false });
    }
  },

  logOut: async () => {
    set({ loading: true });
    try {
      const uid = get().user?.uid;
      if (uid) {
        const userRef = doc(db, "users", uid);
        // Run Firestore update in background. If it fails (e.g. Permission Denied), do not block signOut.
        setDoc(userRef, { status: "offline" }, { merge: true }).catch((err) => {
          console.warn("Offline status update skipped during logout:", err);
        });
      }
    } catch (err) {
      console.warn("Offline status pre-check error:", err);
    }

    try {
      await signOut(auth);
      set({ user: null, userProfile: null, loading: false });
    } catch (error) {
      console.error("Error signing out:", error);
      set({ loading: false });
    }
  },

  initializeAuth: () => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await get().signIn(firebaseUser);
      } else {
        set({ user: null, userProfile: null, loading: false });
      }
      set({ initialized: true });
    });
    return unsubscribe;
  }
}));
