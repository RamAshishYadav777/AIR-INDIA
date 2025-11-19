import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Button,
  Box,
  Avatar,
} from "@mui/material";
import logo from "../../assets/logo.png";
import MenuIcon from "@mui/icons-material/Menu";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks/redux/hooks";
import { logoutUser } from "../../hooks/redux/slices/authSlice";
import { supabase } from "../../lib/supabase";

interface AdminNavbarProps {
  toggleDrawer: () => void;
}

const AdminNavbar: React.FC<AdminNavbarProps> = ({ toggleDrawer }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  // 🟡 Admin Name Fix
  const adminName =
    user?.fullName ||
    
    user?.email?.split("@")[0] ||
    "Admin";

  // 🟡 Avatar Initial Fix
  const avatarLetter = adminName ? adminName[0].toUpperCase() : "A";

  const handleLogout = async () => {
    await supabase.auth.signOut();
    dispatch(logoutUser());
    navigate("/admin/login");
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: 1201,
        background:
          "linear-gradient(90deg, #000000, #1a1a1a, #000000)",
        borderBottom: "2px solid rgba(255,215,0,0.4)",
        backdropFilter: "blur(10px)",
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        {/* ================= LEFT SECTION ================= */}
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton color="inherit" edge="start" onClick={toggleDrawer}>
            <MenuIcon sx={{ color: "#FFD700" }} />
          </IconButton>

          <Box sx={{ display: "flex", alignItems: "center", position: "relative" }}>
            {/* Moving shimmer */}
            <Box
              sx={{
                position: "absolute",
                height: "100%",
                width: "200%",
                left: "-100%",
                background:
                  "linear-gradient(120deg, rgba(255,215,0,0) 0%, rgba(255,215,0,0.4) 50%, rgba(255,215,0,0) 100%)",
                filter: "blur(3px)",
                animation: "shine 8s linear infinite",
                "@keyframes shine": {
                  "0%": { transform: "translateX(-100%)" },
                  "100%": { transform: "translateX(100%)" },
                },
              }}
            />

            <img
              src={logo}
              alt="Air India Logo"
              style={{ height: 60, marginRight: 8, zIndex: 2 }}
            />
          </Box>

          <Typography variant="h6" sx={{ fontWeight: "bold", color: "#FFD700" }}>
            Admin Dashboard
          </Typography>
        </Box>

        {/* ================= RIGHT SECTION ================= */}
        <Box display="flex" alignItems="center" gap={2}>
          {/* Avatar with glow */}
          <Box sx={{ position: "relative" }}>
            <Box
              sx={{
                position: "absolute",
                width: 60,
                height: 60,
                borderRadius: "50%",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                background:
                  "radial-gradient(circle, rgba(255,215,0,0.4), transparent)",
                animation: "pulseGlow 3s infinite ease-in-out",
                "@keyframes pulseGlow": {
                  "0%": { opacity: 0.3, transform: "translate(-50%, -50%) scale(1)" },
                  "50%": { opacity: 0.8, transform: "translate(-50%, -50%) scale(1.15)" },
                  "100%": { opacity: 0.3, transform: "translate(-50%, -50%) scale(1)" },
                },
              }}
            />

            <Avatar
              sx={{
                bgcolor: "#FFD700",
                color: "#000",
                width: 48,
                height: 48,
                fontWeight: 700,
                zIndex: 2,
              }}
            >
              {avatarLetter}
            </Avatar>
          </Box>

          <Typography variant="body1" sx={{ color: "#FFD700", fontWeight: 600 }}>
            Hi, {adminName} 👋
          </Typography>

          <Button
            variant="outlined"
            onClick={handleLogout}
            sx={{
              borderColor: "#FFD700",
              color: "#FFD700",
              "&:hover": {
                bgcolor: "#FFD700",
                color: "#000",
                borderColor: "#FFE55C",
              },
            }}
          >
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default AdminNavbar;
