import React from "react";
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Box,
    Avatar,
} from "@mui/material";
import logo from "../../assets/logo.png";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks/redux/hooks";
import { logoutUser } from "../../hooks/redux/slices/authSlice";

const AgentNavbar: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);

    const agentName =
        user?.fullName ||
        user?.email?.split("@")[0] ||
        "Agent";

    const avatarLetter = agentName ? agentName[0].toUpperCase() : "A";

    const handleLogout = async () => {
        await dispatch(logoutUser()).unwrap();
        navigate("/login");
    };

    return (
        <AppBar
            position="fixed"
            sx={{
                zIndex: 1201,
                background: "white",
                color: "#1e293b",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                borderBottom: "1px solid #e2e8f0",
            }}
        >
            <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
                <Box display="flex" alignItems="center" gap={2}>
                    <img
                        src={logo}
                        alt="Air India Logo"
                        style={{ height: 40, marginRight: 8 }}
                    />
                    <Typography variant="h6" sx={{ fontWeight: "bold", color: "#ed1c24" }}>
                        Check-In Agent Panel
                    </Typography>
                </Box>

                <Box display="flex" alignItems="center" gap={2}>
                    <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 500 }}>
                        Hi, {agentName}
                    </Typography>

                    <Avatar
                        sx={{
                            bgcolor: "#ed1c24",
                            color: "#fff",
                            width: 36,
                            height: 36,
                            fontSize: "0.875rem",
                            fontWeight: 700,
                        }}
                    >
                        {avatarLetter}
                    </Avatar>

                    <Button
                        size="small"
                        variant="outlined"
                        onClick={handleLogout}
                        sx={{
                            borderColor: "#e2e8f0",
                            color: "#64748b",
                            "&:hover": {
                                bgcolor: "#f8fafc",
                                borderColor: "#cbd5e1",
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

export default AgentNavbar;
