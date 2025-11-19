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
import { supabase } from "../../../lib/supabase";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";

const AdminSignup: React.FC = () => {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [adminSecret, setAdminSecret] = useState("");
  const [loading, setLoading] = useState(false);

  const ADMIN_SECRET = import.meta.env.VITE_ADMIN_SECRET_KEY;

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (adminSecret !== ADMIN_SECRET) {
      toast.error("❌ Invalid Admin Secret Key");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role: "admin" },
      },
    });

    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("✅ Admin signup successful! Verify your email.");
      navigate("/admin/login");
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
          "linear-gradient(135deg, #7A0000 0%, #A30000 40%, #5e0b0b 100%)",
        px: 2,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* 🌟 Golden glow orbs */}
      {[
        { size: 300, top: "10%", left: "15%", delay: "0s", opacity: 0.25 },
        { size: 400, bottom: "10%", right: "10%", delay: "5s", opacity: 0.18 },
      ].map((orb, index) => (
        <Box
          key={index}
          sx={{
            position: "absolute",
            width: orb.size,
            height: orb.size,
            borderRadius: "50%",
            background: "radial-gradient(circle, #FFD700, transparent 70%)",
            opacity: orb.opacity,
            top: orb.top,
            left: orb.left,
            bottom: orb.bottom,
            right: orb.right,
            filter: "blur(140px)",
            animation: `spinGlow 35s linear infinite ${orb.delay}`,
            "@keyframes spinGlow": {
              "0%": { transform: "rotate(0deg) scale(1)" },
              "50%": { transform: "rotate(180deg) scale(1.2)" },
              "100%": { transform: "rotate(360deg) scale(1)" },
            },
          }}
        />
      ))}

      {/* ✨ Moving golden line (runway beam) */}
      <Box
        sx={{
          position: "absolute",
          width: "140px",
          height: "3px",
          background:
            "linear-gradient(90deg, rgba(255,215,0,0), rgba(255,215,0,0.95))",
          top: "50%",
          left: "-160px",
          borderRadius: "50%",
          animation: "planeTrail 9s linear infinite",
          "@keyframes planeTrail": {
            "0%": { left: "-160px", opacity: 0 },
            "10%": { opacity: 1 },
            "90%": { opacity: 1 },
            "100%": { left: "110%", opacity: 0 },
          },
        }}
      />

      {/* 💎 Signup Card */}
      <Paper
        elevation={12}
        sx={{
          p: 5,
          width: 430,
          borderRadius: 5,
          backdropFilter: "blur(20px)",
          background: "rgba(90, 0, 0, 0.6)",
          border: "1px solid rgba(255, 215, 0, 0.25)",
          boxShadow: "0 8px 50px rgba(0,0,0,0.5)",
          color: "#fff",
          zIndex: 2,
          transition: "all 0.4s ease",
          animation: "float 5s ease-in-out infinite",
          "@keyframes float": {
            "0%, 100%": { transform: "translateY(0)" },
            "50%": { transform: "translateY(-10px)" },
          },
        }}
      >
        {/* Header */}
        <Stack alignItems="center" spacing={2} mb={3}>
          <Avatar
            sx={{
              bgcolor: "#FFD700",
              width: 72,
              height: 72,
              boxShadow: "0 4px 18px rgba(255, 215, 0, 0.6)",
            }}
          >
            <FlightTakeoffIcon sx={{ fontSize: 38, color: "#640000" }} />
          </Avatar>

          <Typography
            variant="h5"
            fontWeight={700}
            sx={{
              color: "#FFD700",
              textAlign: "center",
              letterSpacing: 0.5,
              textShadow: "0px 0px 8px rgba(255,215,0,0.3)",
            }}
          >
            Admin Account Signup
          </Typography>

          <Typography
            variant="body2"
            sx={{ color: "rgba(255,255,255,0.85)", textAlign: "center" }}
          >
            Only authorized personnel can create admin accounts.
          </Typography>
        </Stack>

        <Divider sx={{ mb: 3, borderColor: "rgba(255,255,255,0.2)" }} />

        {/* Form */}
        <form onSubmit={handleSignup}>
          {[
            { label: "Full Name", type: "text", value: fullName, setter: setFullName },
            { label: "Email", type: "email", value: email, setter: setEmail },
            { label: "Password", type: "password", value: password, setter: setPassword },
            { label: "Confirm Password", type: "password", value: confirmPassword, setter: setConfirmPassword },
            { label: "Admin Secret Key", type: "password", value: adminSecret, setter: setAdminSecret },
          ].map((field, i) => (
            <TextField
              key={i}
              label={field.label}
              type={field.type}
              fullWidth
              margin="normal"
              required
              value={field.value}
              onChange={(e) => field.setter(e.target.value)}
              InputLabelProps={{ style: { color: "#ddd" } }}
              InputProps={{
                style: {
                  color: "#fff",
                  borderRadius: 12,
                  background: "rgba(255,255,255,0.1)",
                },
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "rgba(255,255,255,0.3)" },
                  "&:hover fieldset": { borderColor: "#FFD700" },
                  "&.Mui-focused fieldset": { borderColor: "#FFD700" },
                },
              }}
            />
          ))}

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
              bgcolor: "#FFD700",
              color: "#4a0000",
              transition: "all 0.3s ease",
              boxShadow: "0 6px 25px rgba(255, 215, 0, 0.5)",
              "&:hover": {
                transform: "scale(1.05)",
                bgcolor: "#ffcf33",
              },
            }}
          >
            {loading ? "Creating account..." : "Sign Up"}
          </Button>
        </form>

        <Stack direction="row" justifyContent="center" mt={3} spacing={1}>
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.85)" }}>
            Already have an account?
          </Typography>
          <Link
            component="button"
            variant="body2"
            underline="hover"
            sx={{
              color: "#FFD700",
              fontWeight: 600,
              "&:hover": { textDecoration: "underline" },
            }}
            onClick={() => navigate("/admin/login")}
          >
            Login
          </Link>
        </Stack>
      </Paper>
    </Box>
  );
};

export default AdminSignup;
