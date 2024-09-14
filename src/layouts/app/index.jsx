import { Outlet } from "react-router-dom";

export default function AppLayout() {
  return (
    <div>
      <p>app-layout</p>
      <p>nav</p>
      <Outlet />
    </div>
  );
}
