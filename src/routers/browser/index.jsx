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
  Users,
} from "src/pages";
import Protected from "./protected";
import Restricted from "./restricted";

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
            element: <Restricted component={<Products />} />,
          },
          {
            path: "quotes",
            element: <Restricted component={<Quotes />} />,
          },
          {
            path: "suppliers",
            element: <Restricted component={<Suppliers />} />,
          },
          {
            path: "contacts",
            element: <Restricted component={<Contacts />} />,
          },
          {
            path: "purchase-requests",
            element: <PurchaseRequests />,
          },
          {
            path: "users",
            element: <Restricted component={<Users />} />,
          },
        ],
      },
    ],
  },
]);
