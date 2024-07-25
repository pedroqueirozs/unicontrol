import { getAuth, onAuthStateChanged } from "firebase/auth";
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [authed, setAuthed] = useState<any>(null);
  const auth = getAuth();

  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      //   console.log("user.auth.currentUser");
      //   console.log(user.auth.currentUser);
      if (auth) {
        setAuthed(auth);
      }
    });
  }, []);
  console.log(authed);
  return (
    <AuthContext.Provider value={{ authed }}>{children}</AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("context not fount for auth");
  }
  return context;
}
