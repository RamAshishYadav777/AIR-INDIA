// src/pages/booking/Booking.tsx
import React from "react";
import { Box, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../hooks/redux/store";

const Booking: React.FC = () => {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user); // assume auth slice
  const selectedFlight = useSelector((state: RootState) => state.booking.flightId);

  const handleStartBooking = () => {
    if (!user) {
      alert("Please login to continue booking.");
      navigate("/login");
      return;
    }

    if (!selectedFlight) {
      alert("Please select a flight first!");
      navigate("/flights");
      return;
    }

    navigate("/booking/seat-selection");
  };

  return (
    <Box textAlign="center" mt={5}>
      <Typography variant="h4" mb={2}>
        Start Your Booking
      </Typography>
      <Typography variant="body1" mb={3}>
        Choose your flight seats, fill passenger details, and confirm your payment.
      </Typography>
      <Button variant="contained" color="primary" onClick={handleStartBooking}>
        Continue to Seat Selection
      </Button>
    </Box>
  );
};

export default Booking;
