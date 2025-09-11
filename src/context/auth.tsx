import { onAuthStateChanged, signOut, User } from "firebase/auth";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import { auth } from "@/services/firebaseConfig";
interface AuthProviderProps {
  children: ReactNode;
}
interface AuthContextType {
  authed: User | false | null;
  handleSignOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [authed, setAuthed] = useState<User | null | false>(null);

  async function handleSignOut() {
    signOut(auth);
    setAuthed(false);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setAuthed(user);
      } else {
        setAuthed(false);
      }
    });

    return () => unsubscribe();
  }, []);
  return (
    <AuthContext.Provider value={{ authed, handleSignOut }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("context not fount for auth");
  }
  return context;
}
