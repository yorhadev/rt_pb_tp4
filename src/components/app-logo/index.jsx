import { Typography } from "@mui/material";
import { Link } from "react-router-dom";

export default function AppLogo() {
  return (
    <Link to="/dashboard" style={{ textDecoration: "none" }}>
      <Typography component="p" variant="h6">
        <Typography component="span" color="primary" fontWeight="700">
          GENERICO
        </Typography>
        <Typography component="span" color="primary" fontWeight="300">
          SYSTEM
        </Typography>
      </Typography>
    </Link>
  );
}
