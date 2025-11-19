// src/pages/booking/BookingForm.tsx
import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  Avatar,
  Divider,
} from "@mui/material";
import { MenuItem } from "@mui/material";

import { useDispatch } from "react-redux";
import { setPassengers } from "../../hooks/redux/slices/bookingSlice";
import { useNavigate } from "react-router-dom";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";

const BookingForm: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // 🔹 Single Passenger Only
  const [passenger, setPassenger] = useState({
    name: "",
    age: "",
    gender: "",
  });

  // Form Update Handler
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassenger({ ...passenger, [e.target.name]: e.target.value });
  };

  // Submit Handler
  const handleSubmit = () => {
    if (!passenger.name || !passenger.age || !passenger.gender) {
      alert("All fields are required!");
      return;
    }

    dispatch(
      setPassengers([
        {
          name: passenger.name,
          age: Number(passenger.age),
          gender: passenger.gender,
        },
      ])
    );

    navigate("/booking/payment");
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
      {/* ✨ Golden Aura Background Orbs */}
      {[
        { size: 300, top: "10%", left: "15%", opacity: 0.2 },
        { size: 400, bottom: "10%", right: "10%", opacity: 0.15 },
        { size: 250, top: "60%", left: "30%", opacity: 0.12 },
      ].map((orb, i) => (
        <Box
          key={i}
          sx={{
            position: "absolute",
            width: orb.size,
            height: orb.size,
            borderRadius: "50%",
            background: "radial-gradient(circle, #FFD700, transparent 70%)",
            opacity: orb.opacity,
            filter: "blur(160px)",
            animation: `floatAura 40s linear infinite`,
            "@keyframes floatAura": {
              "0%": { transform: "scale(1)" },
              "50%": { transform: "scale(1.1)" },
              "100%": { transform: "scale(1)" },
            },
          }}
        />
      ))}

      {/* 💎 Glass Card */}
      <Paper
        elevation={12}
        sx={{
          p: 5,
          width: 450,
          borderRadius: 5,
          backdropFilter: "blur(18px)",
          background: "rgba(30, 30, 30, 0.65)",
          border: "1px solid rgba(255, 215, 0, 0.3)",
          boxShadow: "0 8px 50px rgba(255, 215, 0, 0.18)",
          color: "#fff",
          zIndex: 2,
          animation: "cardFloat 6s ease-in-out infinite",
          "@keyframes cardFloat": {
            "0%,100%": { transform: "translateY(0)" },
            "50%": { transform: "translateY(-8px)" },
          },
        }}
      >
        <Stack alignItems="center" spacing={2} mb={3}>
          <Avatar
            sx={{
              bgcolor: "#FFD700",
              width: 70,
              height: 70,
              boxShadow: "0 4px 18px rgba(255, 215, 0, 0.6)",
            }}
          >
            <FlightTakeoffIcon sx={{ fontSize: 38, color: "#000" }} />
          </Avatar>

          <Typography
            variant="h5"
            fontWeight={700}
            sx={{
              color: "#FFD700",
              textAlign: "center",
              letterSpacing: 0.5,
              textShadow: "0 0 10px rgba(255,215,0,0.3)",
            }}
          >
            Passenger Details
          </Typography>

          <Typography
            variant="body2"
            sx={{ color: "rgba(255,255,255,0.85)", textAlign: "center" }}
          >
            Please enter your passenger information.
          </Typography>
        </Stack>

        <Divider sx={{ mb: 3, borderColor: "rgba(255,255,255,0.1)" }} />

        {/* 🧾 Passenger Form */}
        <TextField
          label="Full Name"
          name="name"
          fullWidth
          margin="normal"
          required
          value={passenger.name}
          onChange={handleChange}
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
              "&:hover fieldset": { borderColor: "#FFD700" },
              "&.Mui-focused fieldset": { borderColor: "#FFD700" },
            },
          }}
        />

        <TextField
          label="Age"
          name="age"
          type="number"
          fullWidth
          margin="normal"
          required
          value={passenger.age}
          onChange={handleChange}
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
              "&:hover fieldset": { borderColor: "#FFD700" },
              "&.Mui-focused fieldset": { borderColor: "#FFD700" },
            },
          }}
        />

        <TextField
          select
          label="Gender"
          name="gender"
          fullWidth
          margin="normal"
          required
          value={passenger.gender}
          onChange={handleChange}
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
              "&:hover fieldset": { borderColor: "#FFD700" },
              "&.Mui-focused fieldset": { borderColor: "#FFD700" },
            },
          }}
        >
          <MenuItem value="Male">Male</MenuItem>
          <MenuItem value="Female">Female</MenuItem>
          <MenuItem value="Other">Other</MenuItem>
        </TextField>

        <Button
          variant="contained"
          fullWidth
          sx={{
            mt: 3,
            py: 1.3,
            fontWeight: 700,
            fontSize: "1rem",
            borderRadius: 12,
            bgcolor: "#FFD700",
            color: "#000",
            transition: "all 0.3s ease",
            boxShadow: "0 6px 25px rgba(255, 215, 0, 0.5)",
            "&:hover": {
              transform: "scale(1.05)",
              bgcolor: "#ffcf33",
            },
          }}
          onClick={handleSubmit}
        >
          Proceed to Payment
        </Button>
      </Paper>
    </Box>
  );
};

export default BookingForm;
