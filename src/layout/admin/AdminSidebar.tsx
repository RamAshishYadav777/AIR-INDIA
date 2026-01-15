import React from "react";
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Divider,
  useTheme,
  useMediaQuery,
  IconButton,
  Box,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home"; // 🏠 New icon
import DashboardIcon from "@mui/icons-material/Dashboard";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import GroupIcon from "@mui/icons-material/Group";

import ListAltIcon from "@mui/icons-material/ListAlt";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useNavigate } from "react-router-dom";

const drawerWidth = 240;

interface AdminSidebarProps {
  open: boolean;
  onClose: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ open, onClose }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  // ✅ Sidebar Menu Items
  const menuItems = [
    { text: "Home", icon: <HomeIcon />, path: "/" }, // 🏠 Added home link
    { text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard/admin" },
    { text: "Add Flight", icon: <FlightTakeoffIcon />, path: "/dashboard/addflight" },
    { text: "Bookings", icon: <GroupIcon />, path: "/dashboard/bookings" },
    { text: "Flight List", icon: <ListAltIcon />, path: "/dashboard/flightlist" },
  ];

  return (
    <Drawer
      variant={isDesktop ? "permanent" : "temporary"}
      open={open}
      onClose={onClose}
      ModalProps={{ keepMounted: true }} // Better mobile performance
      sx={{
        "& .MuiDrawer-paper": {
          width: isDesktop ? (open ? drawerWidth : 80) : drawerWidth,
          bgcolor: "#000",
          color: "#FFD700",
          boxSizing: "border-box",
          borderRight: "1px solid rgba(255, 215, 0, 0.2)",
          transition: "width 0.3s ease",
          overflow: "visible", // Allow button to hang off edge
        },
      }}
    >
      <Toolbar />
      <Divider sx={{ bgcolor: "rgba(255, 215, 0, 0.2)" }} />

      <List>
        {menuItems.map((item) => (
          <ListItemButton
            key={item.text}
            onClick={() => {
              navigate(item.path);
              if (!isDesktop) onClose();
            }}
            sx={{
              minHeight: 48,
              justifyContent: open ? "initial" : "center",
              px: 2.5,
              "&:hover": {
                bgcolor: "rgba(255, 215, 0, 0.15)",
                color: "#FFD700",
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: open ? 3 : "auto",
                justifyContent: "center",
                color: "inherit",
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.text}
              sx={{ opacity: open ? 1 : 0, display: open ? "block" : "none" }}
            />
          </ListItemButton>
        ))}
      </List>

      <Divider sx={{ bgcolor: "rgba(255, 215, 0, 0.2)" }} />


      {/* 🟢 Expand/Collapse Toggle Button (Middle of Sidebar) */}
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          right: -14,
          transform: "translateY(-50%)",
          zIndex: 1400,
          display: { xs: "none", md: "flex" }, // Hide on mobile
        }}
      >
        <IconButton
          onClick={onClose}
          sx={{
            bgcolor: "#000",
            border: "1px solid #FFD700",
            padding: "4px",
            "&:hover": { bgcolor: "#222" },
            width: 28,
            height: 28,
            boxShadow: "0 0 10px rgba(0,0,0,0.5)"
          }}
        >
          {open ? (
            <ChevronLeftIcon sx={{ color: "#FFD700", fontSize: 18 }} />
          ) : (
            <ChevronRightIcon sx={{ color: "#FFD700", fontSize: 18 }} />
          )}
        </IconButton>
      </Box>

    </Drawer>
  );
};

export default AdminSidebar;
