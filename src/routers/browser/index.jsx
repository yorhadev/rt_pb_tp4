import { createBrowserRouter } from "react-router-dom";
import { AppLayout, RootLayout } from "src/layouts";
import {
  Contacts,
  Dashboard,
  Home,
  Login,
  Products,
  PurchaseRequests,
  Quotes,
  Register,
  Suppliers,
} from "src/pages";
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
          {
            path: "products",
            element: <Products />,
          },
          {
            path: "quotes",
            element: <Quotes />,
          },
          {
            path: "suppliers",
            element: <Suppliers />,
          },
          {
            path: "contacts",
            element: <Contacts />,
          },
          {
            path: "purchase-requests",
            element: <PurchaseRequests />,
          },
        ],
      },
    ],
  },
]);
