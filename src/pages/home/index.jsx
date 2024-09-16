import { useNavigate } from "react-router-dom";
import styles from "./styles.module.css";
import { Box, Button, Chip, Typography } from "@mui/material";

export default function Home() {
  const navigate = useNavigate();
  const navigateTo = (path) => navigate(path);

  return (
    <Box component="main" className={styles.home_container}>
      <Box className={styles.home_content_container}>
        <Chip label="Generico System is now live! 🎉" />
        <Typography component="h1" variant="h2">
          Quotation
          <br />
          made simple.
        </Typography>
        <Typography component="p" variant="subtitle1">
          Powerful, flexible and data-driven, Generico System makes it easy to
          personalized quotations in just a few clicks.
        </Typography>
        <Box className={styles.home_buttons_container}>
          <Button variant="contained" onClick={() => navigateTo("/register")}>
            Start for free
          </Button>
          <Button variant="text" onClick={() => navigateTo("/login")}>
            Log in
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
