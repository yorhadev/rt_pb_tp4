import styles from "./styles.module.css";
import { Button, Chip, Typography } from "@mui/material";

export default function Home() {
  return (
    <main className={styles.home_container}>
      <div className={styles.home_content_container}>
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
        <div className={styles.home_buttons_container}>
          <Button variant="contained">Start for free</Button>
          <Button variant="text">Sign in</Button>
        </div>
      </div>
    </main>
  );
}
