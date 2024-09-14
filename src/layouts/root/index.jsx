import styles from "./styles.module.css";
import { Box, createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import { Outlet } from "react-router-dom";
import { ThemeControlFab } from "src/components";
import { AuthProvider } from "src/contexts/auth";
import { SnackbarProvider } from "src/contexts/snackbar";

const theme = createTheme({
  colorSchemes: { light: true, dark: true },
  cssVariables: { colorSchemeSelector: "class" },
});

export default function RootLayout() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <SnackbarProvider>
          <Box className={styles.root_layout}>
            <Box className={styles.root_layout_container}>
              <Outlet />
            </Box>
            <Box className={styles.root_layout_fab_container}>
              <ThemeControlFab />
            </Box>
          </Box>
        </SnackbarProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
