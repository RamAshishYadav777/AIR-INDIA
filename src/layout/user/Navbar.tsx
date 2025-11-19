import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Button,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  Typography,
  Avatar,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { NavLink, useNavigate } from "react-router-dom";
import { motion, useAnimation, AnimatePresence } from "framer-motion";
import logo from "../../assets/logo.png";
import { useAppDispatch, useAppSelector } from "../../hooks/redux/hooks";
import {
  logoutUser,
  fetchSupabaseUser,
} from "../../hooks/redux/slices/authSlice";
import { supabase } from "../../lib/supabase";

interface NavItem {
  name: string;
  path: string;
  // username?: string;
}

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const [drawerOpen, setDrawerOpen] = useState(false);

  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  const bgControls = useAnimation();
  const reflectionControls = useAnimation();
  const borderGlowControls = useAnimation();
  const avatarGlowControls = useAnimation();
  const loginRippleControls = useAnimation();

  useEffect(() => {
    dispatch(fetchSupabaseUser());
  }, [dispatch]);

  useEffect(() => {
    if (isDesktop && drawerOpen) setDrawerOpen(false);
  }, [isDesktop, drawerOpen]);

  useEffect(() => {
    bgControls.start({
      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
      transition: { duration: 40, ease: "linear", repeat: Infinity },
    });
  }, []);

  useEffect(() => {
    reflectionControls.start({
      x: ["-150%", "150%"],
      opacity: [0, 1, 0.3, 0],
      transition: { duration: 7, ease: "easeInOut", repeat: Infinity },
    });
  }, []);

  useEffect(() => {
    borderGlowControls.start({
      opacity: [0.3, 1, 0.3],
      transition: { duration: 3, ease: "easeInOut", repeat: Infinity },
    });
  }, []);

  useEffect(() => {
    avatarGlowControls.start({
      scale: [1, 1.08, 1],
      opacity: [0.4, 0.8, 0.4],
      transition: { duration: 3, ease: "easeInOut", repeat: Infinity },
    });
  }, []);

  useEffect(() => {
    if (user) {
      loginRippleControls.set({ scale: 0, opacity: 0 });
      loginRippleControls.start({
        scale: [0, 2.5],
        opacity: [0.8, 0],
        transition: { duration: 1.8, ease: "easeOut" },
      });
    }
  }, [user]);

  const toggleDrawer = () => setDrawerOpen((p) => !p);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    dispatch(logoutUser());
    navigate("/login");
  };

  const navItems: NavItem[] = [
    { name: "Home", path: "/" },
    { name: "Flight Booking", path: "/flights" },
    { name: "Our Heroes", path: "/our-heroes" },
    { name: "Seat Map", path: "/seatmap" },
  ];

  if (user?.role === "admin")
    navItems.push({ name: "Admin Dashboard", path: "/dashboard/admin" });

  if (user?.role === "user")
    navItems.push({ name: "Profile", path: "/dashboard/user" });

  const displayedName =
    user?.fullName || user?.username || user?.email || "User";

  const avatarLetter = (displayedName?.[0] || "?").toUpperCase();

  // ============================
  //   DRAWER
  // ============================
  const drawer = (
    <motion.div
      animate={bgControls}
      style={{
        background: "linear-gradient(270deg,#000,rgba(255,215,0,0.06),#000)",
        backgroundSize: "600% 600%",
        width: 260,
        height: "100%",
        overflowY: "auto",
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "center", pt: 3, pb: 2 }}>
        <img src={logo} alt="Logo" style={{ height: 70 }} />
      </Box>

      <List sx={{ mt: 2 }}>
        {navItems.map((item) => (
          <ListItem key={item.name} disablePadding>
            <ListItemButton
              component={NavLink}
              to={item.path}
              onClick={() => {
                navigate(item.path);
                setTimeout(() => setDrawerOpen(false), 80);
              }}
              sx={{
                color: "#FFD700",
                fontWeight: 500,
                letterSpacing: 0.5,
                py: 1.3,
                position: "relative",

                "&::after": {
                  content: '""',
                  position: "absolute",
                  bottom: 6,
                  left: 0,
                  width: "0%",
                  height: "2px",
                  background:
                    "linear-gradient(90deg,rgba(255,215,0,0) 0%,rgba(255,215,0,1) 50%,rgba(255,215,0,0) 100%)",
                  transition: "width 0.4s ease",
                },

                "&:hover::after": {
                  width: "85%",
                },

                "&.active": {
                  color: "#fff",
                  "&::after": {
                    width: "85%",
                    animation: "pulseLine 2s infinite ease-in-out",
                  },
                },
              }}
            >
              <ListItemText primary={item.name} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ bgcolor: "#333" }} />

      <Box sx={{ p: 2 }}>
        {user ? (
          <Button
            fullWidth
            variant="outlined"
            onClick={handleLogout}
            sx={{
              color: "#FFD700",
              borderColor: "#FFD700",
              "&:hover": { bgcolor: "#FFD700", color: "#000" },
            }}
          >
            Logout
          </Button>
        ) : (
          <>
            {/* ✅ UPDATED: close drawer, then navigate */}
            <Button
              fullWidth
              variant="contained"
              sx={{ bgcolor: "#FFD700", color: "#000", mb: 1 }}
              onClick={() => {
                setDrawerOpen(false);
                navigate("/login");
              }}
            >
              User Login
            </Button>

            {/* ✅ UPDATED: close drawer, then navigate */}
            <Button
              fullWidth
              variant="outlined"
              sx={{ borderColor: "#FFD700", color: "#FFD700" }}
              onClick={() => {
                setDrawerOpen(false);
                navigate("/admin/login");
              }}
            >
              Admin Login
            </Button>
          </>
        )}
      </Box>
    </motion.div>
  );

  return (
    <>
      <motion.div
        animate={bgControls}
        style={{
          background: "linear-gradient(270deg,#001f3f,#003366,#000814,#001f3f)",
          backgroundSize: "600% 600%",
          position: "sticky",
          top: 0,
          zIndex: 1200,
        }}
      >
        <motion.div
          animate={borderGlowControls}
          style={{
            height: "2px",
            width: "100%",
            background:
              "linear-gradient(90deg,rgba(255,215,0,0.6),rgba(255,200,0,1),rgba(255,215,0,0.6))",
            opacity: 0.45,
          }}
        />

        <AppBar
          position="static"
          sx={{
            bgcolor: "transparent",
            borderBottom: "1px solid rgba(255,215,0,0.25)",
            backdropFilter: "blur(10px)",
          }}
        >
          <Toolbar sx={{ justifyContent: "space-between", px: 2 }}>
            {/* LOGO WITH SHIMMER (UNCHANGED) */}
            <Box sx={{ position: "relative", overflow: "hidden" }}>
              <motion.div
                animate={reflectionControls}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "180%",
                  height: "100%",
                  background: `
                    linear-gradient(120deg,
                      rgba(255,185,0,0) 0%,
                      rgba(255,185,0,0.3) 40%,
                      rgba(255,215,0,0.9) 50%,
                      rgba(255,185,0,0.3) 60%,
                      rgba(255,185,0,0) 100%
                    )`,
                  transform: "skewX(-25deg)",
                  filter: "blur(1px)",
                }}
              />

              <motion.img
                whileHover={{ scale: 1.05 }}
                src={logo}
                alt="Logo"
                style={{ height: 60 }}
              />
            </Box>

            {/* DESKTOP NAV (UNCHANGED) */}
            <Box
              sx={{
                display: { xs: "none", md: "flex" },
                flexGrow: 1,
                justifyContent: "center",
              }}
            >
              {navItems.map((item) => (
                <Box
                  key={item.name}
                  component={NavLink}
                  to={item.path}
                  className={({ isActive }: any) => (isActive ? "active" : "")}
                  sx={{
                    mx: 2,
                    color: "#FFD700",
                    textDecoration: "none",
                    fontWeight: 500,
                    position: "relative",

                    "&::after": {
                      content: '""',
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      width: "0%",
                      height: "2px",
                      background:
                        "linear-gradient(90deg,rgba(255,215,0,0) 0%,rgba(255,215,0,1) 50%,rgba(255,215,0,0) 100%)",
                      transition: "width 0.4s ease",
                    },

                    "&:hover::after": { width: "100%" },

                    "&.active::after": {
                      width: "100%",
                      animation: "pulseLine 2s infinite ease-in-out",
                    },
                  }}
                >
                  {item.name}
                </Box>
              ))}
            </Box>

            {/* USER SECTION (UNCHANGED) */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              {user ? (
                <>
                  <motion.div style={{ position: "relative" }}>
                    <motion.div
                      animate={avatarGlowControls}
                      style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        width: 70,
                        height: 70,
                        borderRadius: "50%",
                        background:
                          "radial-gradient(circle,rgba(255,215,0,0.4),transparent)",
                        transform: "translate(-50%,-50%)",
                      }}
                    />

                    <Avatar
                      sx={{
                        bgcolor: "#FFD700",
                        color: "#000",
                        width: 56,
                        height: 56,
                        fontWeight: 700,
                      }}
                    >
                      {avatarLetter}
                    </Avatar>
                  </motion.div>

                  <Typography sx={{ color: "#FFD700", fontWeight: 600 }}>
                    {user.role === "admin" ? "Admin" : "User"} {displayedName}
                  </Typography>

                  <Button
                    variant="outlined"
                    onClick={handleLogout}
                    sx={{
                      display: { xs: "none", md: "flex" },
                      borderColor: "#FFD700",
                      color: "#FFD700",
                      "&:hover": { bgcolor: "#FFD700", color: "#000" },
                    }}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <Box sx={{ display: { xs: "none", md: "flex" }, gap: 1 }}>
                  <Button
                    variant="contained"
                    sx={{ bgcolor: "#FFD700", color: "#000" }}
                    onClick={() => {
                      navigate("/login");
                    }}
                  >
                    User Login
                  </Button>
                  <Button
                    variant="outlined"
                    sx={{ borderColor: "#FFD700", color: "#FFD700" }}
                    onClick={() => navigate("/admin/login")}
                  >
                    Admin Login
                  </Button>
                </Box>
              )}

              <IconButton
                sx={{ display: { xs: "flex", md: "none" }, color: "#fff" }}
                onClick={toggleDrawer}
              >
                <MenuIcon />
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>
      </motion.div>

      {/* MOBILE DRAWER */}
      <AnimatePresence>
        {!isDesktop && drawerOpen && (
          <Drawer
            anchor="left"
            open={drawerOpen}
            onClose={toggleDrawer}
            sx={{
              "& .MuiDrawer-paper": {
                background: "transparent",
                color: "#FFD700",
              },
            }}
          >
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              style={{ height: "100%" }}
            >
              {drawer}
            </motion.div>
          </Drawer>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
