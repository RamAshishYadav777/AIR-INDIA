// CheckIn.tsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Divider,
  Stack,
  CircularProgress,
  Chip,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { QRCodeCanvas } from "qrcode.react";
import { supabase } from "../lib/supabase";
import airIndiaLogo from "../assets/logo.png";

interface PassengerFromDB {
  id: number; // supabase primary key
  passenger_name: string;
  passenger_age: number;
  passenger_gender: string;
  seat_number: string;
  checked_in: boolean;
  booking_id?: string;
}

interface Passenger {
  id: number;
  name: string;
  age: number;
  gender: string;
  seatNumber: string;
  checkedIn: boolean;
  bookingId?: string;
}

interface LocationState {
  bookingId?: string;
  date?: string;
  passengers?: Passenger[]; // optional preloaded
}

interface Flight {
  flight_number: string;
  from_city: string;
  to_city: string;
  departure_time: string;
  arrival_time: string;
}

const CheckIn: React.FC = () => {
  const { state } = useLocation() as { state?: LocationState };
  const navigate = useNavigate();

  const bookingId = state?.bookingId;
  const providedPassengers = state?.passengers || [];
  const date = state?.date || new Date().toLocaleDateString();

  const [passengers, setPassengers] = useState<Passenger[]>(providedPassengers);
  const [flight, setFlight] = useState<Flight | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null); // loading per passenger actions
  const [fetching, setFetching] = useState<boolean>(false);

  // Helper: transform DB row -> Passenger
  const mapDbToPassenger = (p: PassengerFromDB): Passenger => ({
    id: p.id,
    name: p.passenger_name,
    age: p.passenger_age,
    gender: p.passenger_gender,
    seatNumber: p.seat_number,
    checkedIn: !!p.checked_in,
    bookingId: p.booking_id,
  });

  // Fetch booking & passenger details from Supabase
  const fetchBookingDetails = async () => {
    if (!bookingId) return;
    try {
      setFetching(true);
      // Example: passengers table with relation to flights (as in your earlier code)
      const { data, error } = await supabase
        .from("passengers")
        .select(
          "*, flights(flight_number, origin, destination, departure_time, arrival_time)"
        )
        .eq("booking_id", bookingId);

      if (error) throw error;

      if (data && data.length > 0) {
        // map DB rows to Passenger
        const passengerList = data.map((row: any) =>
          mapDbToPassenger({
            id: row.id,
            passenger_name: row.passenger_name,
            passenger_age: row.passenger_age,
            passenger_gender: row.passenger_gender,
            seat_number: row.seat_number,
            checked_in: row.checked_in,
            booking_id: row.booking_id,
          })
        );

        setPassengers(passengerList);

        // flight info (assume same flight for booking)
        const flightInfo = data[0].flights;
        if (flightInfo) {
          setFlight({
            flight_number: flightInfo.flight_number,
            from_city: flightInfo.origin,
            to_city: flightInfo.destination,
            departure_time: flightInfo.departure_time,
            arrival_time: flightInfo.arrival_time,
          });
        }
      } else {
        // no rows found
        setPassengers([]);
      }
    } catch (err) {
      console.error("Error fetching booking details:", err);
      alert("Failed to load booking details. Please try again.");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    // If provided passengers were passed in state, keep them, but still attempt fetch for authoritative data
    if (!providedPassengers.length && !bookingId) return;
    fetchBookingDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId]);

  // Determine counts
  const totalPassengers = passengers.length;
  const checkedCount = passengers.filter((p) => p.checkedIn).length;
  const pendingCount = totalPassengers - checkedCount;

  // Check in a single passenger (by DB id)
  const handleCheckInPassenger = async (passengerId: number) => {
    try {
      setActionLoadingId(passengerId);
      // update in DB
      const { error } = await supabase
        .from("passengers")
        .update({ checked_in: true })
        .eq("id", passengerId);

      if (error) throw error;

      // update local state
      setPassengers((prev) =>
        prev.map((p) => (p.id === passengerId ? { ...p, checkedIn: true } : p))
      );
    } catch (err) {
      console.error("Check-in failed:", err);
      alert("Check-in failed for passenger. Try again.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Check in all remaining passengers
  const handleCheckInAllRemaining = async () => {
    const remaining = passengers.filter((p) => !p.checkedIn);
    if (!remaining.length) return;

    try {
      setLoading(true);
      const ids = remaining.map((r) => r.id);
      const { error } = await supabase
        .from("passengers")
        .update({ checked_in: true })
        .in("id", ids);

      if (error) throw error;

      setPassengers((prev) => prev.map((p) => ({ ...p, checkedIn: true })));
      alert("All passengers checked in successfully.");
    } catch (err) {
      console.error("Bulk check-in failed:", err);
      alert("Bulk check-in failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // Download a single passenger boarding pass as PDF
  const handleDownloadBoardingPass = async (passengerId: number) => {
    const element = document.getElementById(`boarding-pass-${passengerId}`);
    if (!element) {
      alert("Boarding pass element not found.");
      return;
    }

    try {
      setActionLoadingId(passengerId);
      // improve quality by scaling
      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      // Landscape small ticket size (mm): 85 x 220 (as you used earlier)
      const pdf = new jsPDF("l", "mm", [85, 220]);
      pdf.addImage(imgData, "PNG", 0, 0, 220, 85);
      const passenger = passengers.find((p) => p.id === passengerId);
      const fileName = `AirIndia_BoardingPass_${
        passenger?.name || passengerId
      }.pdf`;
      pdf.save(fileName);
    } catch (err) {
      console.error("PDF download failed:", err);
      alert("Failed to generate PDF. Try again.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Print single passenger boarding pass
  const handlePrintBoardingPass = (passengerId: number) => {
    const printContent = document.getElementById(
      `boarding-pass-${passengerId}`
    );
    if (!printContent) {
      alert("Boarding pass element not found.");
      return;
    }
    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Boarding Pass</title>
          <style>
            body { font-family: Arial, sans-serif; background: #fff; padding: 20px; }
            .boarding-pass { max-width: 700px; margin: auto; border-radius: 12px; overflow: hidden; }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  // If still fetching
  if (fetching) {
    return (
      <Box textAlign="center" mt={10}>
        <CircularProgress />
        <Typography mt={2}>Loading booking and passenger details...</Typography>
      </Box>
    );
  }

  // No passengers found
  if (!passengers.length) {
    return (
      <Box textAlign="center" mt={10}>
        <Typography variant="h5" color="error">
          ❌ No passengers found for this booking.
        </Typography>
        <Button variant="contained" onClick={() => navigate("/")}>
          Back to Home
        </Button>
      </Box>
    );
  }

  // UI when some passengers still pending
  const anyPending = passengers.some((p) => !p.checkedIn);
  const allChecked = passengers.every((p) => p.checkedIn);

  return (
    <Box display="flex" justifyContent="center" mt={6} mb={8}>
      <Paper
        elevation={6}
        sx={{
          p: 4,
          width: "94%",
          maxWidth: 1000,
          borderRadius: 3,
          textAlign: "center",
        }}
      >
        <Typography variant="h4" color="primary" mb={2}>
          🧳 Online Check-In
        </Typography>

        <Typography variant="body1" mb={1}>
          Booking ID: <strong>{bookingId || "—"}</strong>
        </Typography>
        <Typography variant="body2" mb={2}>
          Date of Journey: <strong>{date}</strong>
        </Typography>

        <Divider sx={{ my: 2 }} />

        {/* Summary Chips */}
        <Stack direction="row" spacing={1} justifyContent="center" mb={3}>
          <Chip label={`Total: ${totalPassengers}`} color="default" />
          <Chip label={`Checked-in: ${checkedCount}`} color="success" />
          <Chip label={`Pending: ${pendingCount}`} color="warning" />
        </Stack>

        {/* If any pending -> show step to check-in */}
        {anyPending && (
          <>
            <Typography variant="h6" mb={2}>
              Passenger List — Complete check-in for remaining passengers
            </Typography>

            <Grid container spacing={2}>
              {passengers.map((p) => (
                <Grid key={p.id} size={{ xs: 12, sm: 6, md: 4 }}>
                  <Paper
                    sx={{
                      p: 2,
                      textAlign: "left",
                      borderRadius: 2,
                      backgroundColor: p.checkedIn ? "#f0fff4" : "#fff",
                    }}
                  >
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      mb={1}
                    >
                      <Box>
                        <Typography variant="subtitle1" fontWeight={700}>
                          {p.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {p.gender} • {p.age} yrs
                        </Typography>
                      </Box>

                      <Box textAlign="right">
                        {p.checkedIn ? (
                          <Chip
                            label="✔ Checked-in"
                            color="success"
                            size="small"
                          />
                        ) : (
                          <Chip label="Pending" color="warning" size="small" />
                        )}
                      </Box>
                    </Box>

                    <Typography variant="body2" mb={1}>
                      Seat: <strong>{p.seatNumber || "—"}</strong>
                    </Typography>

                    <Stack direction="row" spacing={1}>
                      {!p.checkedIn && (
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => handleCheckInPassenger(p.id)}
                          disabled={actionLoadingId === p.id}
                        >
                          {actionLoadingId === p.id
                            ? "Checking..."
                            : "Check-in Now"}
                        </Button>
                      )}

                      {p.checkedIn && (
                        <>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleDownloadBoardingPass(p.id)}
                            disabled={actionLoadingId === p.id}
                          >
                            {actionLoadingId === p.id
                              ? "Preparing..."
                              : "Download Pass"}
                          </Button>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handlePrintBoardingPass(p.id)}
                          >
                            Print
                          </Button>
                        </>
                      )}
                    </Stack>
                  </Paper>
                </Grid>
              ))}
            </Grid>

            <Stack direction="row" spacing={2} justifyContent="center" mt={3}>
              <Button
                variant="contained"
                color="success"
                onClick={handleCheckInAllRemaining}
                disabled={loading}
              >
                {loading
                  ? "Checking all..."
                  : `Check-in All Remaining (${pendingCount})`}
              </Button>

              <Button
                variant="outlined"
                color="inherit"
                onClick={() => navigate("/")}
              >
                Cancel
              </Button>
            </Stack>
          </>
        )}

        {/* If all checked -> show boarding pass(s) */}
        {allChecked && (
          <>
            <Typography variant="h6" mt={2} mb={2}>
              ✅ Passenger checked-in — Boarding Passes
            </Typography>

            <Grid container spacing={3}>
              {passengers.map((p) => (
                <Grid key={p.id} size={{ xs: 12, md: 6 }}>
                  <Box
                    id={`boarding-pass-${p.id}`}
                    sx={{
                      position: "relative",
                      borderRadius: 2,
                      overflow: "hidden",
                      border: "2px solid #b71c1c",
                      background: "#fff",
                    }}
                  >
                    {/* Header */}
                    <Box
                      sx={{
                        backgroundColor: "#b71c1c",
                        color: "#fff",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        px: 2,
                        py: 1,
                      }}
                    >
                      <Box display="flex" alignItems="center" gap={1}>
                        <img
                          src={airIndiaLogo}
                          alt="Air India"
                          style={{ height: 36 }}
                        />
                        <Typography fontWeight="bold" variant="subtitle1">
                          AIR INDIA
                        </Typography>
                      </Box>
                      <Typography fontWeight="bold">ECONOMY</Typography>
                    </Box>

                    {/* Body */}
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "2fr 1fr",
                        gap: 1,
                      }}
                    >
                      <Box sx={{ p: 2, textAlign: "left" }}>
                        <Typography variant="body2">
                          <strong>Name:</strong> {p.name.toUpperCase()}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Flight:</strong>{" "}
                          {flight?.flight_number || "AI 0131"}
                        </Typography>
                        <Typography variant="body2">
                          <strong>From:</strong> {flight?.from_city || "DEL"} →{" "}
                          <strong>To:</strong> {flight?.to_city || "CCU"}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Date:</strong> {date}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Departure:</strong>{" "}
                          {flight?.departure_time || "05:00"}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Arrival:</strong>{" "}
                          {flight?.arrival_time || "07:10"}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Seat:</strong> {p.seatNumber || "—"}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                          mt={1}
                        >
                          ⏰ Boarding closes 45 minutes before departure
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          p: 2,
                          borderLeft: "2px dashed #ccc",
                          textAlign: "center",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "#fdfdfd",
                        }}
                      >
                        <QRCodeCanvas
                          value={JSON.stringify({
                            bookingId: p.bookingId || bookingId,
                            passengerId: p.id,
                            passengerName: p.name,
                            flight: flight?.flight_number,
                            from: flight?.from_city,
                            to: flight?.to_city,
                          })}
                          size={100}
                        />
                        <Typography variant="body2" mt={1}>
                          Gate: 10F | Terminal 3
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  {/* Actions */}
                  <Stack
                    direction="row"
                    spacing={2}
                    justifyContent="center"
                    mt={1}
                  >
                    <Button
                      variant="contained"
                      onClick={() => handleDownloadBoardingPass(p.id)}
                      disabled={actionLoadingId === p.id}
                    >
                      {actionLoadingId === p.id
                        ? "Preparing..."
                        : "Download (PDF)"}
                    </Button>

                    <Button
                      variant="outlined"
                      onClick={() => handlePrintBoardingPass(p.id)}
                    >
                      Print
                    </Button>
                  </Stack>
                </Grid>
              ))}
            </Grid>

            <Stack direction="row" spacing={2} justifyContent="center" mt={3}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate("/")}
              >
                Back to Home
              </Button>
            </Stack>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default CheckIn;
