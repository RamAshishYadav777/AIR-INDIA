import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Link,
  Stack,
  Avatar,
  Divider,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../lib/supabase";
import toast from "react-hot-toast";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";

const UserLogin: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);

    if (error) toast.error(error.message);
    else {
      toast.success("Login successful!");
      navigate("/dashboard/user");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background:
          "linear-gradient(135deg, #000000 0%, #0a0a0a 40%, #111111 100%)",
        px: 2,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* 🔥 Red glowing background orbs */}
      {[
        { size: 300, top: "10%", left: "15%", opacity: 0.25 },
        { size: 400, bottom: "10%", right: "10%", opacity: 0.18 },
        { size: 260, top: "60%", left: "30%", opacity: 0.15 },
      ].map((orb, i) => (
        <Box
          key={i}
          sx={{
            position: "absolute",
            width: orb.size,
            height: orb.size,
            borderRadius: "50%",
            background: "radial-gradient(circle, #FF0000, transparent 70%)",
            opacity: orb.opacity,
            top: orb.top,
            left: orb.left,
            bottom: orb.bottom,
            right: orb.right,
            filter: "blur(150px)",
            animation: "spinGlow 40s linear infinite",
            "@keyframes spinGlow": {
              "0%": { transform: "rotate(0deg) scale(1)" },
              "50%": { transform: "rotate(180deg) scale(1.15)" },
              "100%": { transform: "rotate(360deg) scale(1)" },
            },
          }}
        />
      ))}

      {/* 🛫 Animated red airplane trail */}
      <Box
        sx={{
          position: "absolute",
          width: "150px",
          height: "3px",
          background:
            "linear-gradient(90deg, rgba(255,0,0,0), rgba(255,0,0,1))",
          top: "50%",
          left: "-180px",
          borderRadius: "50%",
          animation: "planeTrail 9s linear infinite",
          "@keyframes planeTrail": {
            "0%": { left: "-180px", opacity: 0 },
            "10%": { opacity: 1 },
            "90%": { opacity: 1 },
            "100%": { left: "110%", opacity: 0 },
          },
        }}
      />

      {/* 📌 Glassmorphic Login Card */}
      <Paper
        elevation={12}
        sx={{
          p: 5,
          width: 430,
          borderRadius: 5,
          backdropFilter: "blur(20px)",
          background: "rgba(25, 25, 25, 0.65)",
          border: "1px solid rgba(255, 0, 0, 0.3)",
          boxShadow: "0 8px 50px rgba(255,0,0,0.15)",
          color: "#fff",
          zIndex: 2,
          animation: "float 5s ease-in-out infinite",
          "@keyframes float": {
            "0%, 100%": { transform: "translateY(0)" },
            "50%": { transform: "translateY(-8px)" },
          },
        }}
      >
        {/* Header */}
        <Stack alignItems="center" spacing={2} mb={3}>
          <Avatar
            sx={{
              bgcolor: "#FF0000",
              width: 72,
              height: 72,
              boxShadow: "0 4px 20px rgba(255,0,0,0.55)",
            }}
          >
            <FlightTakeoffIcon sx={{ fontSize: 40, color: "#3b0000" }} />
          </Avatar>

          <Typography
            variant="h5"
            fontWeight={700}
            sx={{
              color: "#FF0000",
              textShadow: "0 0 12px rgba(255,0,0,0.4)",
            }}
          >
            User Login
          </Typography>

          <Typography
            variant="body2"
            sx={{ color: "rgba(255,255,255,0.75)", textAlign: "center" }}
          >
            Welcome back! Continue your journey with Air India.
          </Typography>
        </Stack>

        <Divider sx={{ mb: 3, borderColor: "rgba(255,255,255,0.1)" }} />

        {/* Login Form */}
        <form onSubmit={handleLogin}>
          <TextField
            label="Email Address"
            type="email"
            fullWidth
            margin="normal"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            InputLabelProps={{ style: { color: "#ccc" } }}
            InputProps={{
              style: {
                color: "#ffffff",
                borderRadius: 12,
                background: "rgba(255,255,255,0.08)",
              },
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "rgba(255,255,255,0.2)" },
                "&:hover fieldset": { borderColor: "#FF0000" },
                "&.Mui-focused fieldset": { borderColor: "#FF0000" },
              },
            }}
          />

          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputLabelProps={{ style: { color: "#ccc" } }}
            InputProps={{
              style: {
                color: "#ffffff",
                borderRadius: 12,
                background: "rgba(255,255,255,0.08)",
              },
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "rgba(255,255,255,0.2)" },
                "&:hover fieldset": { borderColor: "#FF0000" },
                "&.Mui-focused fieldset": { borderColor: "#FF0000" },
              },
            }}
          />

          <Button
            variant="contained"
            type="submit"
            fullWidth
            disabled={loading}
            sx={{
              mt: 3,
              py: 1.3,
              fontWeight: 700,
              fontSize: "1rem",
              borderRadius: 12,
              bgcolor: "#FF0000",
              color: "#fff",
              boxShadow: "0 6px 25px rgba(255,0,0,0.5)",
              "&:hover": {
                transform: "scale(1.05)",
                bgcolor: "#FF3333",
              },
            }}
          >
            {loading ? "Signing in..." : "Login"}
          </Button>
        </form>

        {/* Redirect Link */}
        <Stack direction="row" justifyContent="center" mt={3} spacing={1}>
          <Typography sx={{ color: "rgba(255,255,255,0.8)" }}>
            Don’t have an account?
          </Typography>

          <Link
            component="button"
            sx={{
              color: "#FF3A3A",
              fontWeight: 600,
              "&:hover": { textDecoration: "underline" },
            }}
            onClick={() => navigate("/signup")}
          >
            Sign up
          </Link>
        </Stack>
      </Paper>
    </Box>
  );
};

export default UserLogin;
