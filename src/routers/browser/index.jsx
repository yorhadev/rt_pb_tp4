import { createBrowserRouter } from "react-router-dom";
import { AppLayout, RootLayout } from "src/layouts";
import { Dashboard, Home, Login, Register } from "src/pages";
import Protected from "./protected";

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "register",
        element: <Register />,
      },
      {
        element: <Protected component={<AppLayout />} />,
        children: [
          {
            path: "dashboard",
            element: <Dashboard />,
          },
        ],
      },
    ],
  },
]);
