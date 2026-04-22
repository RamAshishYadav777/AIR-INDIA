// src/layout/agent/AgentLayout.tsx
import React, { useState } from "react";
import type { ReactNode } from "react";
import { Box, Toolbar } from "@mui/material";

import AgentNavbar from "./AgentNavbar";
import AgentSidebar from "./AgentSidebar";

interface AgentLayoutProps {
    children: ReactNode;
}

const AgentLayout: React.FC<AgentLayoutProps> = ({ children }) => {
    const [drawerOpen, setDrawerOpen] = useState(true);

    const toggleDrawer = () => setDrawerOpen((prev) => !prev);

    return (
        <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f8fafc" }}>
            <AgentNavbar />
            <AgentSidebar open={drawerOpen} onClose={toggleDrawer} />

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 0,
                    width: { md: drawerOpen ? `calc(100% - 240px)` : `calc(100% - 80px)` },
                    ml: { md: drawerOpen ? "240px" : "80px" },
                    transition: "margin 0.3s ease, width 0.3s ease",
                }}
            >
                <Toolbar />
                {children}
            </Box>
        </Box>
    );
};

export default AgentLayout;
