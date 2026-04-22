import React from "react";
import {
  Container,
  Typography,
  Paper,
  Button,
} from "@mui/material";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import type { RootState } from "../hooks/redux/store";
import SeatMap from "../components/SeatMap";

const FlightDetails: React.FC = () => {
  const { id: flightId } = useParams<{ id: string }>();
  const user = useSelector((state: RootState) => state.auth.user);
  // const userId = user?.id || "Guest";

  return (
    <Container maxWidth="md" sx={{ py: 5 }}>

      {/* ✨ Heading Only */}
      <Typography
        variant="h4"
        fontWeight={700}
        textAlign="center"
        mb={4}
        sx={{ color: "#b30000" }}
      >
        Select Your Seat
      </Typography>

      {/* Seat Selection Section */}
      <Paper
        elevation={4}
        sx={{
          p: 4,
          borderRadius: 3,
          backgroundColor: "#f8f9fa",
        }}
      >
        {user ? (
          <SeatMap />
        ) : (
          <Button
            variant="contained"
            sx={{
              backgroundColor: "#FFD700",
              color: "#000",
              mt: 2,
              "&:hover": { backgroundColor: "#e6c200" }
            }}
            onClick={() =>
              window.location.href = `/login?redirect=/flights/${flightId}`
            }
          >
            Login to View Seat Map
          </Button>
        )}
      </Paper>
    </Container>
  );
};

export default FlightDetails;
