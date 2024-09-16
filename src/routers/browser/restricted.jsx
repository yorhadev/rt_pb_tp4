import { Backdrop, CircularProgress } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { firebaseService } from "src/services/firebase";

export default function Restricted({ component }) {
  const [userRole, setUserRole] = useState(null);

  const getCurrentUserRole = async () => {
    const userId = firebaseService.auth.currentUser.uid;
    const response = await firebaseService.findOneDoc("users", userId);
    if (response.code !== 200) return setUserRole("collaborator");
    return setUserRole(response.data?.role || "collaborator");
  };

  const navigate = useNavigate();

  useEffect(() => {
    if (!userRole) {
      getCurrentUserRole();
      return;
    }
    if (userRole === "admin") {
      return;
    }
    navigate("/dashboard", { replace: true });
  }, [userRole]);

  if (userRole === "admin") return component;

  return (
    <Backdrop open={true}>
      <CircularProgress color="primary" />
    </Backdrop>
  );
}
