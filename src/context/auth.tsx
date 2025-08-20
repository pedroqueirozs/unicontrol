import { onAuthStateChanged } from "firebase/auth";
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
const AuthContext = createContext({});

export const AuthProvider = ({ children }: AuthProviderProps) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [authed, setAuthed] = useState<any>(null);

  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        setAuthed(user);
      }
    });
  }, [authed, setAuthed]);
  return (
    <AuthContext.Provider value={{ authed }}>{children}</AuthContext.Provider>
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
