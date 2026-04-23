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
import HomeIcon from "@mui/icons-material/Home";
import DashboardIcon from "@mui/icons-material/Dashboard";
import GroupIcon from "@mui/icons-material/Group";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useNavigate } from "react-router-dom";

const drawerWidth = 240;

interface AgentSidebarProps {
    open: boolean;
    onClose: () => void;
}

const AgentSidebar: React.FC<AgentSidebarProps> = ({ open, onClose }) => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

    const menuItems = [
        { text: "Home", icon: <HomeIcon />, path: "/" },
        { text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard/agent" },
        { text: "Bookings", icon: <GroupIcon />, path: "/dashboard/agent/bookings" },
    ];

    return (
        <Drawer
            variant={isDesktop ? "permanent" : "temporary"}
            open={open}
            onClose={onClose}
            ModalProps={{ keepMounted: true }}
            sx={{
                "& .MuiDrawer-paper": {
                    width: isDesktop ? (open ? drawerWidth : 80) : drawerWidth,
                    bgcolor: "#0f172a",
                    color: "#fff",
                    boxSizing: "border-box",
                    borderRight: "1px solid rgba(255, 255, 255, 0.1)",
                    transition: "width 0.3s ease",
                    overflow: "visible",
                },
            }}
        >
            <Toolbar />
            <Divider sx={{ bgcolor: "rgba(255, 255, 255, 0.1)" }} />

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
                                bgcolor: "rgba(237, 28, 36, 0.1)",
                                color: "#ed1c24",
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

            <Divider sx={{ bgcolor: "rgba(255, 255, 255, 0.1)" }} />

            <Box
                sx={{
                    position: "absolute",
                    top: "50%",
                    right: -14,
                    transform: "translateY(-50%)",
                    zIndex: 1400,
                    display: { xs: "none", md: "flex" },
                }}
            >
                <IconButton
                    onClick={onClose}
                    sx={{
                        bgcolor: "#0f172a",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        padding: "4px",
                        "&:hover": { bgcolor: "#1e293b" },
                        width: 28,
                        height: 28,
                        boxShadow: "0 0 10px rgba(0,0,0,0.5)"
                    }}
                >
                    {open ? (
                        <ChevronLeftIcon sx={{ color: "#fff", fontSize: 18 }} />
                    ) : (
                        <ChevronRightIcon sx={{ color: "#fff", fontSize: 18 }} />
                    )}
                </IconButton>
            </Box>
        </Drawer>
    );
};

export default AgentSidebar;
