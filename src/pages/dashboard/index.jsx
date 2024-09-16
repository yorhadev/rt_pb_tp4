import styles from "./styles.module.css";
import { Box, Typography } from "@mui/material";

export default function Dashboard() {
  return (
    <Box className={styles.dashboard_container}>
      <Typography component="h1" variant="h3">
        Welcome! 👋
      </Typography>
    </Box>
  );
}
