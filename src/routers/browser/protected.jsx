import { Backdrop, CircularProgress } from "@mui/material";
import { useContext, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "src/contexts/auth";

export default function Protected({ component }) {
  const [user, _, pending] = useContext(AuthContext);
  const authenticated = useMemo(() => Boolean(user), [user]);
  const navigate = useNavigate();

  useEffect(() => {
    if (authenticated || pending) return;
    navigate("/", { replace: true });
  }, [navigate, authenticated, pending]);

  if (authenticated && !pending) return component;

  return (
    <Backdrop open={true}>
      <CircularProgress color="primary" />
    </Backdrop>
  );
}
