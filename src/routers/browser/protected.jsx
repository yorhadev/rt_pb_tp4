import { useContext, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "src/contexts/auth";

export default function Protected({ component }) {
  const [user, _, pending] = useContext(AuthContext);
  const authenticated = useMemo(() => Boolean(user), [user]);
  const navigate = useNavigate();

  useEffect(() => {
    if (authenticated || pending) return;
    navigate("/login", { replace: true });
  }, [navigate, authenticated, pending]);

  if (authenticated && !pending) return component;
}
