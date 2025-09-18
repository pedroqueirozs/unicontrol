import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { createContext, useEffect, useState, ReactNode } from "react";

import { auth } from "@/services/firebaseConfig";
interface AuthProviderProps {
  children: ReactNode;
}
interface AuthContextType {
  authed: User | false | null;
  handleSignOut: () => void;
  registering: boolean;
  setRegistering: (value: boolean) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [authed, setAuthed] = useState<User | null | false>(null);
  const [registering, setRegistering] = useState(false);

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
    <AuthContext.Provider
      value={{ authed, handleSignOut, registering, setRegistering }}
    >
      {children}
    </AuthContext.Provider>
  );
};
