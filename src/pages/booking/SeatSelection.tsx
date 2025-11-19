// src/pages/booking/SeatSelection.tsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Grid,
  Paper,
  Divider,
  Tooltip,
} from "@mui/material";
import { useDispatch } from "react-redux";
import { setSeatNumber, setFlightId } from "../../hooks/redux/slices/bookingSlice";
import { useNavigate, useSearchParams } from "react-router-dom";

interface Seat {
  id: string;
  type: "window" | "aisle" | "middle";
  class: "Business" | "Economy";
  price: number;
}

const SeatSelection: React.FC = () => {
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  // ⭐ Read flight id from URL: /booking/seat-selection?flight=xxx
  const flightId = params.get("flight");

  // ⭐ Save flightId to Redux
  useEffect(() => {
    if (flightId) {
      console.log("🎯 Flight ID saved:", flightId);
      dispatch(setFlightId(flightId));
    }
  }, [flightId, dispatch]);

  // ✈️ Define Boeing 787 seat structure
  const businessRows = 2;
  const economyRows = 6;
  const seatsPerRow = ["A", "B", "C", "D", "E", "F"];

  // Generate seats
  const generateSeats = (
    rows: number,
    seatClass: "Business" | "Economy",
    startRow: number
  ) => {
    const price = seatClass === "Business" ? 3000 : 1500;
    const seatList: Seat[] = [];

    for (let row = 0; row < rows; row++) {
      const rowNumber = startRow + row;

      seatsPerRow.forEach((seatLetter) => {
        let type: Seat["type"] =
          seatLetter === "A" || seatLetter === "F"
            ? "window"
            : seatLetter === "C" || seatLetter === "D"
            ? "aisle"
            : "middle";

        seatList.push({
          id: `${rowNumber}${seatLetter}`,
          type,
          class: seatClass,
          price,
        });
      });
    }
    return seatList;
  };

  const seats: Seat[] = [
    ...generateSeats(businessRows, "Business", 1),
    ...generateSeats(economyRows, "Economy", businessRows + 1),
  ];

  const handleSelectSeat = (seat: Seat) => {
    setSelectedSeat(seat);
  };

  const handleContinue = () => {
    if (!selectedSeat) {
      alert("Please select a seat to continue!");
      return;
    }

    dispatch(setSeatNumber(selectedSeat.id));
    navigate("/booking/form", {
      state: {
        seatClass: selectedSeat.class,
        seatPrice: selectedSeat.price,
      },
    });
  };

  const getSeatColor = (seat: Seat) => {
    if (selectedSeat?.id === seat.id) return "#007b00";
    if (seat.class === "Business") return "#004d99";
    return "#777";
  };

  const renderSeatRows = (seatClass: "Business" | "Economy") => {
    const classSeats = seats.filter((s) => s.class === seatClass);
    const rows = Array.from(
      new Set(classSeats.map((s) => s.id.match(/\d+/)?.[0]))
    );

    return (
      <Box sx={{ mb: 6 }}>
        <Typography
          variant="h6"
          sx={{
            mb: 2,
            mt: 3,
            color: seatClass === "Business" ? "#004d99" : "#444",
            fontWeight: "bold",
          }}
        >
          {seatClass} Class ({seatClass === "Business" ? "₹3000" : "₹1500"})
        </Typography>

        <Grid
          container
          spacing={2}
          justifyContent="center"
          sx={{
            background: "#f9f9f9",
            borderRadius: 3,
            py: 2,
            boxShadow: 2,
          }}
        >
          {rows.map((rowNum) => (
            <Grid
              key={rowNum}
              size={{ xs: 12 }}
              sx={{
                display: "flex",
                justifyContent: "center",
                gap: "10px",
              }}
            >
              {/* Left Side */}
              {["A", "B", "C"].map((letter) => {
                const seat = classSeats.find(
                  (s) => s.id === `${rowNum}${letter}`
                );
                return seat ? (
                  <Tooltip
                    key={seat.id}
                    title={`${seat.id} (${seat.type}) - ₹${seat.price}`}
                  >
                    <Paper
                      onClick={() => handleSelectSeat(seat)}
                      sx={{
                        width: 45,
                        height: 45,
                        backgroundColor: getSeatColor(seat),
                        color: "white",
                        textAlign: "center",
                        lineHeight: "45px",
                        fontWeight: "bold",
                        cursor: "pointer",
                        borderRadius: 1,
                        transition: "0.3s",
                        "&:hover": {
                          backgroundColor:
                            selectedSeat?.id === seat.id
                              ? "#007b00"
                              : "#0066cc",
                        },
                      }}
                    >
                      {seat.id}
                    </Paper>
                  </Tooltip>
                ) : (
                  <Box key={letter} width={40} />
                );
              })}

              {/* Aisle */}
              <Box width={40}></Box>

              {/* Right Side */}
              {["D", "E", "F"].map((letter) => {
                const seat = classSeats.find(
                  (s) => s.id === `${rowNum}${letter}`
                );
                return seat ? (
                  <Tooltip
                    key={seat.id}
                    title={`${seat.id} (${seat.type}) - ₹${seat.price}`}
                  >
                    <Paper
                      onClick={() => handleSelectSeat(seat)}
                      sx={{
                        width: 45,
                        height: 45,
                        backgroundColor: getSeatColor(seat),
                        color: "white",
                        textAlign: "center",
                        lineHeight: "45px",
                        fontWeight: "bold",
                        cursor: "pointer",
                        borderRadius: 1,
                        transition: "0.3s",
                        "&:hover": {
                          backgroundColor:
                            selectedSeat?.id === seat.id
                              ? "#007b00"
                              : "#0066cc",
                        },
                      }}
                    >
                      {seat.id}
                    </Paper>
                  </Tooltip>
                ) : (
                  <Box key={letter} width={40} />
                );
              })}
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };

  return (
    <Box textAlign="center" mt={4} mb={6}>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Boeing 787 Seat Selection
      </Typography>

      <Divider sx={{ mb: 4 }} />

      {renderSeatRows("Business")}
      {renderSeatRows("Economy")}

      <Divider sx={{ mt: 4, mb: 3 }} />

      {selectedSeat && (
        <Paper
          elevation={3}
          sx={{
            maxWidth: 400,
            mx: "auto",
            p: 2,
            borderRadius: 2,
            mb: 3,
            backgroundColor: "#f5f5f5",
          }}
        >
          <Typography variant="h6" mb={1}>
            Seat Summary
          </Typography>
          <Typography>
            <strong>Seat:</strong> {selectedSeat.id}
          </Typography>
          <Typography>
            <strong>Class:</strong> {selectedSeat.class}
          </Typography>
          <Typography>
            <strong>Price:</strong> ₹{selectedSeat.price}
          </Typography>
        </Paper>
      )}

      {/* Legend */}
      <Box sx={{ display: "flex", justifyContent: "center", gap: 3, mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Paper sx={{ width: 25, height: 25, backgroundColor: "#004d99" }} />
          <Typography variant="body2">Business</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Paper sx={{ width: 25, height: 25, backgroundColor: "#777" }} />
          <Typography variant="body2">Economy</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Paper sx={{ width: 25, height: 25, backgroundColor: "#007b00" }} />
          <Typography variant="body2">Selected</Typography>
        </Box>
      </Box>

      <Button
        variant="contained"
        color="primary"
        sx={{ mt: 2, px: 4, py: 1.2, fontWeight: "bold" }}
        onClick={handleContinue}
      >
        Continue to Passenger Details
      </Button>
    </Box>
  );
};

export default SeatSelection;
