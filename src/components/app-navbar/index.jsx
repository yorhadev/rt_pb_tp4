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
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLogo } from "src/components/";

const menuItems = [
  { id: 1, name: "Products", path: "products" },
  { id: 2, name: "Quotes", path: "quotes" },
  { id: 3, name: "Suppliers", path: "suppliers" },
  { id: 4, name: "Contacts", path: "contacts" },
];

export default function AppNavbar() {
  const [open, setOpen] = useState(false);
  const handleOnOpen = () => setOpen(true);
  const handleOnClose = () => setOpen(false);
  const navigate = useNavigate();

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
              <Box minWidth="60dvw" padding="1rem">
                <Box textAlign="center">
                  <AppLogo />
                  <Divider sx={{ margin: "1rem 0" }} />
                </Box>
                {menuItems.map((item) => (
                  <MenuItem
                    key={item.id}
                    tabIndex={0}
                    onClick={() => navigate(item.path)}
                  >
                    <Typography color="textPrimary">{item.name}</Typography>
                  </MenuItem>
                ))}
                <Box>
                  <Divider sx={{ margin: "1rem 0" }} />
                  <Button
                    variant="outlined"
                    fullWidth
                    sx={{ marginTop: "1rem" }}
                  >
                    Exit
                  </Button>
                </Box>
              </Box>
            </Drawer>
          </Box>
          <Box className={styles.app_navbar_desktop}>
            {menuItems.map((item) => (
              <MenuItem
                key={item.id}
                tabIndex={0}
                onClick={() => navigate(item.path)}
              >
                <Typography color="textPrimary" component="span">
                  {item.name}
                </Typography>
              </MenuItem>
            ))}
          </Box>
        </Toolbar>
      </Box>
    </AppBar>
  );
}
