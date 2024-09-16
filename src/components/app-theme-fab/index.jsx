import { DarkMode, LightMode } from "@mui/icons-material";
import { Fab, useColorScheme } from "@mui/material";
import { useMemo } from "react";

export default function AppThemeFab() {
  const { mode, setMode, systemMode } = useColorScheme();
  const modeIsDark = useMemo(
    () => (systemMode ? systemMode === "dark" : mode === "dark"),
    [mode]
  );
  const toggleTheme = () => setMode(modeIsDark ? "light" : "dark");

  return (
    <Fab aria-label="toggle theme button" color="primary" onClick={toggleTheme}>
      {modeIsDark ? <LightMode /> : <DarkMode />}
    </Fab>
  );
}
