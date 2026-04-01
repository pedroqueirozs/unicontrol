import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { createContext, useEffect, useState, ReactNode } from "react";
import { doc, getDoc } from "firebase/firestore";

import { auth, db } from "@/services/firebaseConfig";

interface AuthProviderProps {
  children: ReactNode;
}

export type UserRole = "admin" | "expedicao" | "vendas";

export interface UserData {
  companyId: string;
  role: UserRole;
  name: string;
  email: string;
}

interface AuthContextType {
  authed: User | false | null;
  userData: UserData | null;
  handleSignOut: () => Promise<void>;
  registering: boolean;
  setRegistering: (value: boolean) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [authed, setAuthed] = useState<User | null | false>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [registering, setRegistering] = useState(false);

  async function handleSignOut() {
    await signOut(auth);
    setAuthed(false);
    setUserData(null);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data() as UserData);
        } else {
          setUserData(null);
        }
        setAuthed(user);
      } else {
        setAuthed(false);
        setUserData(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{ authed, userData, handleSignOut, registering, setRegistering }}
    >
      {children}
    </AuthContext.Provider>
  );
};
