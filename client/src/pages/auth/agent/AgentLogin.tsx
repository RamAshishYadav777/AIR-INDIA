import React, { useState } from "react";
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Stack,
    Link,
    Avatar,
    Divider,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../hooks/redux/hooks";
import { loginUser, clearError } from "../../../hooks/redux/slices/authSlice";
import toast from "react-hot-toast";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";

const AgentLogin: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { loading, error } = useAppSelector((state) => state.auth);

    React.useEffect(() => {
        if (error) {
            toast.error(error);
            dispatch(clearError());
        }
    }, [error, dispatch]);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        const result = await dispatch(loginUser({ email, password }));

        if (loginUser.fulfilled.match(result)) {
            const user = result.payload.user;
            if (user.role !== 'agent') {
                toast.error("Access Denied: Not a check-in agent");
                return;
            }
            toast.success("Agent authenticated successfully!");
            navigate("/dashboard/agent");
        }
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
                px: 2,
                position: "relative",
                overflow: "hidden",
            }}
        >
            {/* 🛡️ Slate/Red themed gradients */}
            {[
                { size: 300, top: "10%", left: "15%", opacity: 0.1 },
                { size: 400, bottom: "10%", right: "10%", opacity: 0.08 },
            ].map((orb, index) => (
                <Box
                    key={index}
                    sx={{
                        position: "absolute",
                        width: orb.size,
                        height: orb.size,
                        borderRadius: "50%",
                        background: "radial-gradient(circle, #ed1c24, transparent 70%)",
                        opacity: orb.opacity,
                        top: orb.top,
                        left: orb.left,
                        bottom: orb.bottom,
                        right: orb.right,
                        filter: "blur(160px)",
                    }}
                />
            ))}

            {/* 🆔 Agent login card */}
            <Paper
                elevation={12}
                sx={{
                    p: 5,
                    width: 430,
                    borderRadius: 5,
                    backdropFilter: "blur(20px)",
                    background: "rgba(255, 255, 255, 0.95)",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                    zIndex: 2,
                }}
            >
                <Stack alignItems="center" spacing={2} mb={3}>
                    <Avatar
                        sx={{
                            bgcolor: "#ed1c24",
                            width: 72,
                            height: 72,
                            boxShadow: "0 4px 20px rgba(237, 28, 36, 0.3)",
                        }}
                    >
                        <SupportAgentIcon sx={{ fontSize: 38, color: "#fff" }} />
                    </Avatar>

                    <Typography
                        variant="h5"
                        fontWeight={700}
                        sx={{
                            color: "#0f172a",
                            textAlign: "center",
                        }}
                    >
                        Agent Panel Authentication
                    </Typography>

                    <Typography
                        variant="body2"
                        sx={{ color: "#64748b", textAlign: "center" }}
                    >
                        Enter your credentials to access the check-in system.
                    </Typography>
                </Stack>

                <Divider sx={{ mb: 3 }} />

                <form onSubmit={handleLogin}>
                    <TextField
                        label="Agent Email"
                        type="email"
                        fullWidth
                        margin="normal"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
                    />

                    <TextField
                        label="Password"
                        type="password"
                        fullWidth
                        margin="normal"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
                    />

                    <Button
                        variant="contained"
                        type="submit"
                        fullWidth
                        disabled={loading}
                        sx={{
                            mt: 3,
                            py: 1.5,
                            fontWeight: 700,
                            borderRadius: 3,
                            bgcolor: "#ed1c24",
                            "&:hover": { bgcolor: "#c4191f" },
                        }}
                    >
                        {loading ? "Authenticating..." : "Login to Operator Hub"}
                    </Button>
                </form>
                <Stack direction="row" justifyContent="center" mt={3} spacing={1}>
                    <Typography variant="body2" sx={{ color: "#64748b" }}>
                        Don't have an account?
                    </Typography>
                    <Link
                        component="button"
                        variant="body2"
                        underline="hover"
                        sx={{ color: "#ed1c24", fontWeight: 600 }}
                        onClick={() => navigate("/agent/signup")}
                    >
                        Sign up
                    </Link>
                </Stack>

            </Paper>
        </Box>
    );
};

export default AgentLogin;
