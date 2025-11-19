// src/layout/admin/AdminLayout.tsx
import React, { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Box, Toolbar } from "@mui/material";

import AdminNavbar from "../../layout/admin/AdminNavbar";
import AdminSidebar from "../../layout/admin/AdminSidebar";

// Redux
import { useAppDispatch } from "../../hooks/redux/hooks";
import { fetchSupabaseUser } from "../../hooks/redux/slices/authSlice";

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = () => setDrawerOpen((prev) => !prev);

  // 🟡 CRITICAL FIX — Fetch user metadata on every admin page load
  useEffect(() => {
    dispatch(fetchSupabaseUser());
  }, [dispatch]);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f5f5f5" }}>
      {/* Top Navbar */}
      <AdminNavbar toggleDrawer={toggleDrawer} />

      {/* Sidebar */}
      <AdminSidebar open={drawerOpen} onClose={toggleDrawer} />

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar /> {/* Spacing below navbar */}
        {children}
      </Box>
    </Box>
  );
};

export default AdminLayout;
