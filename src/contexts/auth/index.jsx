import { createContext, useLayoutEffect, useMemo, useState } from "react";
import { firebaseService } from "src/services/firebase";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [pending, setPending] = useState(true);
  const authenticated = useMemo(() => Boolean(user), [user]);

  useLayoutEffect(() => {
    firebaseService.auth.onAuthStateChanged((authUser) => setUser(authUser));
    setPending(false);
  }, [authenticated]);

  return (
    <AuthContext.Provider value={[user, setUser, pending]}>
      {children}
    </AuthContext.Provider>
  );
}
