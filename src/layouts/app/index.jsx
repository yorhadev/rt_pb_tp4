import styles from "./styles.module.css";
import { AppNavbar } from "src/components";
import { Outlet } from "react-router-dom";

export default function AppLayout() {
  return (
    <div id="app_layout" className={styles.app_layout}>
      <AppNavbar />
      <Outlet />
    </div>
  );
}
