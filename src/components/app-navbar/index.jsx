import { Logout } from "@mui/icons-material";
import styles from "./styles.module.css";
import MenuIcon from "@mui/icons-material/Menu";
import {
  AppBar,
  Box,
  Button,
  Divider,
  Drawer,
  MenuItem,
  Toolbar,
  Typography,
} from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLogo } from "src/components/";
import { AuthContext } from "src/contexts/auth";
import { SnackbarContext } from "src/contexts/snackbar";
import { firebaseService } from "src/services/firebase";

const menuItems = [
  {
    id: 1,
    name: "Products",
    path: "products",
    allowedRoles: ["admin"],
  },
  {
    id: 2,
    name: "Quotes",
    path: "quotes",
    allowedRoles: ["admin"],
  },
  {
    id: 3,
    name: "Suppliers",
    path: "suppliers",
    allowedRoles: ["admin"],
  },
  {
    id: 4,
    name: "Contacts",
    path: "contacts",
    allowedRoles: ["admin"],
  },
  {
    id: 5,
    name: "Purchase Requests",
    path: "purchase-requests",
    allowedRoles: ["admin", "collaborator"],
  },
];

export default function AppNavbar() {
  const [open, setOpen] = useState(false);

  const handleOnOpen = () => setOpen(true);

  const handleOnClose = () => setOpen(false);

  const navigate = useNavigate();

  const [, setUser] = useContext(AuthContext);

  const [, setSnack, setSeverity] = useContext(SnackbarContext);

  const [userRole, setUserRole] = useState(null);

  const getCurrentUserRole = async () => {
    const userId = firebaseService.auth.currentUser.uid;
    const response = await firebaseService.findOneDoc("users", userId);
    if (response.code !== 200) return setUserRole("collaborator");
    return setUserRole(response.data?.role || "collaborator");
  };

  const signOut = async () => {
    const response = await firebaseService.signOut();
    setUser(response.data);
    setSeverity(response.code === 200 ? "success" : "error");
    setSnack(response.message);
  };

  useEffect(() => {
    if (!userRole) getCurrentUserRole();
  }, []);

  return (
    <AppBar className={styles.app_navbar}>
      <Box component="nav" className={styles.app_navbar_container}>
        <Toolbar className={styles.app_navbar_toolbar}>
          <AppLogo />
          <Box className={styles.app_navbar_mobile}>
            <Button
              aria-label="menu"
              sx={{ minWidth: "30px" }}
              onClick={handleOnOpen}
            >
              <MenuIcon />
            </Button>
            <Drawer anchor="right" open={open} onClose={handleOnClose}>
              <Box minWidth="40dvw" padding="1rem">
                <Box textAlign="center">
                  <AppLogo />
                  <Divider sx={{ margin: "1rem 0" }} />
                </Box>
                {menuItems.map(
                  (item) =>
                    item.allowedRoles.includes(userRole) && (
                      <MenuItem
                        key={item.id}
                        tabIndex={0}
                        onClick={() => navigate(item.path)}
                      >
                        <Typography color="textPrimary">{item.name}</Typography>
                      </MenuItem>
                    )
                )}
                <Box>
                  <Divider sx={{ margin: "1rem 0" }} />
                  <Button
                    variant="outlined"
                    fullWidth
                    sx={{ marginTop: "1rem" }}
                    onClick={signOut}
                  >
                    Exit
                  </Button>
                </Box>
              </Box>
            </Drawer>
          </Box>
          <Box className={styles.app_navbar_desktop}>
            <Box display="flex">
              {menuItems.map(
                (item) =>
                  item.allowedRoles.includes(userRole) && (
                    <MenuItem
                      key={item.id}
                      tabIndex={0}
                      onClick={() => navigate(item.path)}
                    >
                      <Typography color="textPrimary" component="span">
                        {item.name}
                      </Typography>
                    </MenuItem>
                  )
              )}
            </Box>
            <Box>
              <Button startIcon={<Logout />} onClick={signOut}>
                Exit
              </Button>
            </Box>
          </Box>
        </Toolbar>
      </Box>
    </AppBar>
  );
}
