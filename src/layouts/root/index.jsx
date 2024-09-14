import styles from "./styles.module.css";
import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import { useLayoutEffect, useMemo, useState } from "react";
import { Outlet } from "react-router-dom";
import { ThemeControlFab } from "src/components";
import { AuthContext } from "src/contexts/auth";
import { firebaseService } from "src/services/firebase";

const theme = createTheme({
  colorSchemes: { light: true, dark: true },
  cssVariables: { colorSchemeSelector: "class" },
});

export default function RootLayout() {
  const [user, setUser] = useState(null);
  const [pending, setPending] = useState(true);
  const authenticated = useMemo(() => Boolean(user), [user]);

  useLayoutEffect(() => {
    firebaseService.auth.onAuthStateChanged((authUser) => setUser(authUser));
    setPending(false);
  }, [authenticated]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthContext.Provider value={[user, setUser, pending]}>
        <div className={styles.root_layout}>
          <div className={styles.root_layout_container}>
            <Outlet />
          </div>
          <div className={styles.root_layout_fab_container}>
            <ThemeControlFab />
          </div>
        </div>
      </AuthContext.Provider>
    </ThemeProvider>
  );
}
