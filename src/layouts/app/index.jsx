import { AppNavbar } from "src/components";
import { Outlet } from "react-router-dom";

export default function AppLayout() {
  return (
    <div>
      <AppNavbar />
      <Outlet />
    </div>
  );
}
