import React from "react";
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Divider,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home"; // 🏠 New icon
import DashboardIcon from "@mui/icons-material/Dashboard";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import GroupIcon from "@mui/icons-material/Group";

import ListAltIcon from "@mui/icons-material/ListAlt";
import { useNavigate } from "react-router-dom";

const drawerWidth = 240;

interface AdminSidebarProps {
  open: boolean;
  onClose: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ open, onClose }) => {
  const navigate = useNavigate();

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
      variant="temporary"
      open={open}
      onClose={onClose}
      sx={{
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          bgcolor: "#000",
          color: "#FFD700",
          boxSizing: "border-box",
        },
      }}
    >
      <Toolbar />
      <Divider sx={{ bgcolor: "#333" }} />

      <List>
        {menuItems.map((item) => (
          <ListItemButton
            key={item.text}
            onClick={() => {
              navigate(item.path);
              onClose();
            }}
            sx={{
              "&:hover": {
                bgcolor: "#FFD700",
                color: "#000",
              },
            }}
          >
            <ListItemIcon sx={{ color: "inherit" }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItemButton>
        ))}
      </List>

      <Divider sx={{ bgcolor: "#333" }} />
    </Drawer>
  );
};

export default AdminSidebar;
