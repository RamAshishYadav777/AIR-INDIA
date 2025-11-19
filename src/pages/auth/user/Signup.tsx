import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Link,
  Stack,
  Checkbox,
  FormControlLabel,
  Avatar,
  Divider,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../lib/supabase";
import toast from "react-hot-toast";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";

const Signup: React.FC = () => {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!acceptTerms) return toast.error("Please accept Terms & Conditions.");
    if (password !== confirmPassword)
      return toast.error("Passwords do not match!");

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role: "user" },
      },
    });

    setLoading(false);

    if (error) toast.error(error.message);
    else {
      toast.success("Account created! Please verify your email.");
      navigate("/login");
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
      {/* 🔥 Red Aura Glows */}
      {[
        { size: 300, top: "12%", left: "15%", opacity: 0.25 },
        { size: 400, bottom: "12%", right: "10%", opacity: 0.15 },
        { size: 250, top: "60%", left: "25%", opacity: 0.1 },
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
            filter: "blur(160px)",
            animation: "spinGlow 40s linear infinite",
            "@keyframes spinGlow": {
              "0%": { transform: "rotate(0deg) scale(1)" },
              "50%": { transform: "rotate(180deg) scale(1.1)" },
              "100%": { transform: "rotate(360deg) scale(1)" },
            },
          }}
        />
      ))}

      {/* ✨ Red airplane trail */}
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

      {/* 🔲 Glass Signup Card */}
      <Paper
        elevation={12}
        sx={{
          p: 5,
          width: 430,
          borderRadius: 5,
          backdropFilter: "blur(20px)",
          background: "rgba(25, 25, 25, 0.6)",
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
        {/* 🔴 Header */}
        <Stack alignItems="center" spacing={2} mb={3}>
          <Avatar
            sx={{
              bgcolor: "#FF0000",
              width: 72,
              height: 72,
              boxShadow: "0 4px 18px rgba(255,0,0,0.6)",
            }}
          >
            <FlightTakeoffIcon sx={{ fontSize: 38, color: "#3b0000" }} />
          </Avatar>

          <Typography
            variant="h5"
            fontWeight={700}
            sx={{
              color: "#FF0000",
              textShadow: "0 0 10px rgba(255,0,0,0.4)",
            }}
          >
            Create Your Account
          </Typography>

          <Typography sx={{ color: "rgba(255,255,255,0.75)" }}>
            Join Air India and manage all your bookings easily.
          </Typography>
        </Stack>

        <Divider sx={{ mb: 3, borderColor: "rgba(255,255,255,0.1)" }} />

        <form onSubmit={handleSignup}>
          {/* Inputs */}
          {[
            { label: "Full Name", value: fullName, setter: setFullName },
            { label: "Email Address", value: email, setter: setEmail },
          ].map((f, i) => (
            <TextField
              key={i}
              label={f.label}
              fullWidth
              margin="normal"
              required
              value={f.value}
              onChange={(e) => f.setter(e.target.value)}
              InputLabelProps={{ style: { color: "#ccc" } }}
              InputProps={{
                style: {
                  color: "#fff",
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
          ))}

          {/* Password */}
          {[
            { label: "Password", value: password, setter: setPassword },
            {
              label: "Confirm Password",
              value: confirmPassword,
              setter: setConfirmPassword,
            },
          ].map((f, i) => (
            <TextField
              key={i}
              label={f.label}
              type="password"
              fullWidth
              margin="normal"
              required
              value={f.value}
              onChange={(e) => f.setter(e.target.value)}
              InputLabelProps={{ style: { color: "#ccc" } }}
              InputProps={{
                style: {
                  color: "#fff",
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
          ))}

          {/* Terms Checkbox */}
          <FormControlLabel
            control={
              <Checkbox
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                sx={{
                  color: "#FF0000",
                  "&.Mui-checked": { color: "#FF0000" },
                }}
              />
            }
            label={
              <Typography sx={{ color: "rgba(255,255,255,0.85)" }}>
                I agree to the{" "}
                <Link sx={{ color: "#FF4444", fontWeight: 600 }}>
                  Terms & Conditions
                </Link>{" "}
                and{" "}
                <Link sx={{ color: "#FF4444", fontWeight: 600 }}>
                  Privacy Policy
                </Link>
                .
              </Typography>
            }
          />

          {/* Sign Up Button */}
          <Button
            variant="contained"
            fullWidth
            type="submit"
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
                transform: "scale(1.04)",
                bgcolor: "#FF3333",
              },
            }}
          >
            {loading ? "Creating account..." : "Sign Up"}
          </Button>
        </form>

        {/* Login Link */}
        <Stack direction="row" justifyContent="center" mt={3} spacing={1}>
          <Typography sx={{ color: "rgba(255,255,255,0.85)" }}>
            Already have an account?
          </Typography>
          <Link
            component="button"
            underline="hover"
            sx={{ color: "#FF4444", fontWeight: 600 }}
            onClick={() => navigate("/login")}
          >
            Login
          </Link>
        </Stack>
      </Paper>
    </Box>
  );
};

export default Signup;
