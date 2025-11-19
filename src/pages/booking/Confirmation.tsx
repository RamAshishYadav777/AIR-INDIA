// src/pages/booking/Confirmation.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Divider,
  Grid,
  Stack,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import LoadingScreen from "../../components/ui/LoadingScreen";

interface Passenger {
  passenger_name: string;
  passenger_age: number;
  passenger_gender: string;
  seat_number: string;
  flight_id: string;
}

interface FlightDetails {
  id: string;
  origin: string;
  destination: string;
  departure_time: string;
  arrival_time: string;
}

interface LocationState {
  bookingId?: string;
  totalPrice?: number;
  date?: string;
}

const Confirmation: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useLocation() as { state?: LocationState };

  const bookingId = state?.bookingId;
  const totalPrice = state?.totalPrice || 0;
  const date = state?.date || new Date().toLocaleDateString();
  const pdfRef = useRef<HTMLDivElement>(null);

  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [flight, setFlight] = useState<FlightDetails | null>(null);
  const [loading, setLoading] = useState(true);

  // ========================================
  // FETCH PASSENGERS + FLIGHT DETAILS
  // ========================================
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        if (!bookingId) {
          setLoading(false);
          return;
        }

        // Fetch passengers
        const { data: passengerData, error } = await supabase
          .from("passengers")
          .select("*")
          .eq("booking_id", bookingId)
          .order("id", { ascending: true });

        if (error) throw error;

        setPassengers(passengerData || []);

        // Fetch flight details
        const flightId = passengerData?.[0]?.flight_id;

        if (flightId) {
          const { data: flightData, error: flightErr } = await supabase
            .from("flights")
            .select("*")
            .eq("id", flightId)
            .single();

          if (!flightErr) {
            setFlight(flightData);
          }
        }
      } catch (err) {
        console.error("Error fetching details:", err);
      } finally {
        setTimeout(() => setLoading(false), 500);
      }
    };

    fetchDetails();
  }, [bookingId]);

  // ========================================
  // DOWNLOAD PDF
  // ========================================
  const handleDownloadPDF = async () => {
    const input = pdfRef.current;
    if (!input) return;

    const canvas = await html2canvas(input);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");

    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
    pdf.save(`AirIndia_Ticket_${bookingId || "Booking"}.pdf`);
  };

  // ========================================
  // NAVIGATE TO CHECK-IN
  // ========================================
  const handleCheckIn = () => {
    if (!passengers.length) {
      alert("No passenger data available for check-in.");
      return;
    }

    const formattedPassengers = passengers.map((p) => ({
      name: p.passenger_name,
      age: p.passenger_age,
      gender: p.passenger_gender,
      seatNumber: p.seat_number,
    }));

    navigate("/checkin", {
      state: {
        passengers: formattedPassengers,
        bookingId,
        date,
        flight, // ⭐ PASS DYNAMIC FLIGHT DETAILS
        totalPrice,
      },
    });
  };

  // ========================================
  // LOADER
  // ========================================
  if (loading) {
    return <LoadingScreen />;
  }

  // ========================================
  // MAIN UI
  // ========================================
  return (
    <Box display="flex" justifyContent="center" mt={6} mb={8}>
      <Paper
        ref={pdfRef}
        elevation={4}
        sx={{
          p: 4,
          width: "90%",
          maxWidth: 700,
          borderRadius: 3,
          textAlign: "center",
        }}
      >
        <Typography variant="h4" color="success.main" mb={1}>
          🎉 Booking Confirmed!
        </Typography>

        <Typography variant="body2" color="text.secondary" mb={2}>
          Booking ID: <strong>{bookingId}</strong>
        </Typography>

        {/* ================================
            FLIGHT INFORMATION (Dynamic)
        ================================= */}
        {flight && (
          <Box mb={3}>
            <Typography variant="h5" fontWeight={600}>
              ✈ {flight.origin} → {flight.destination}
            </Typography>

            <Typography mt={1}>
              Departure: <strong>{flight.departure_time}</strong>
            </Typography>

            <Typography>
              Arrival: <strong>{flight.arrival_time}</strong>
            </Typography>
          </Box>
        )}

        <Typography variant="body1" mb={2}>
          Date of Journey: <strong>{date}</strong>
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" mb={2}>
          Passenger Details
        </Typography>

        {passengers.length > 0 ? (
          passengers.map((p, i) => (
            <Paper
              key={i}
              elevation={1}
              sx={{ p: 2, mb: 2, textAlign: "left", borderRadius: 2 }}
            >
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography>
                    <strong>Name:</strong> {p.passenger_name}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Typography>
                    <strong>Age:</strong> {p.passenger_age}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Typography>
                    <strong>Gender:</strong> {p.passenger_gender}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Typography>
                    <strong>Seat:</strong> {p.seat_number}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          ))
        ) : (
          <Typography color="text.secondary">
            ❌ No passenger data found for this booking.
          </Typography>
        )}

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" mb={1}>
          Total Amount Paid: <strong>₹{totalPrice}</strong>
        </Typography>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          justifyContent="center"
          mt={3}
        >
          <Button
            variant="contained"
            color="success"
            onClick={handleDownloadPDF}
          >
            Download Ticket (PDF)
          </Button>

          {passengers.length > 0 && (
            <Button
              variant="contained"
              color="secondary"
              onClick={handleCheckIn}
            >
              Proceed to Check-in
            </Button>
          )}

          <Button
            variant="outlined"
            color="primary"
            onClick={() => navigate("/")}
          >
            Back to Home
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};

export default Confirmation;
