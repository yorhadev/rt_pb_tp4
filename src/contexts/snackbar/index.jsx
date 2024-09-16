import { Alert, Snackbar } from "@mui/material";
import { createContext, useLayoutEffect, useMemo, useState } from "react";

export const SnackbarContext = createContext(null);

export function SnackbarProvider({ children }) {
  const [open, setOpen] = useState(false);
  const [snack, setSnack] = useState("");
  const [severity, setSeverity] = useState("info");
  const severityType = useMemo(() => {
    const types = ["success", "info", "warning", "error"];
    if (types.includes(severity)) return severity;
    return "info";
  }, [severity]);
  const handleOnClose = () => {
    setOpen(false);
    setSnack("");
  };

  useLayoutEffect(() => {
    setOpen(Boolean(snack));
  }, [snack]);

  return (
    <SnackbarContext.Provider value={[snack, setSnack, setSeverity]}>
      {children}
      <Snackbar autoHideDuration={3000} open={open} onClose={handleOnClose}>
        <Alert severity={severityType}>{snack}</Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
}
