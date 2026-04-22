// src/layout/admin/AdminLayout.tsx
import React, { useState } from "react";
import type { ReactNode } from "react";
import { Box, Toolbar } from "@mui/material";

import AdminNavbar from "../../layout/admin/AdminNavbar";
import AdminSidebar from "../../layout/admin/AdminSidebar";

// Redux
import { useAppDispatch } from "../../hooks/redux/hooks";

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = () => setDrawerOpen((prev) => !prev);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f5f5f5" }}>
      {/* Top Navbar */}
      <AdminNavbar />

      {/* Sidebar */}
      <AdminSidebar open={drawerOpen} onClose={toggleDrawer} />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: drawerOpen ? `calc(100% - 240px)` : `calc(100% - 80px)` },
          ml: { md: drawerOpen ? "240px" : "80px" },
          transition: "margin 0.3s ease, width 0.3s ease",
        }}
      >
        <Toolbar /> {/* Spacing below navbar */}
        {children}
      </Box>
    </Box>
  );
};

export default AdminLayout;
