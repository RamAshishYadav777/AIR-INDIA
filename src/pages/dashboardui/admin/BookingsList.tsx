import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Button,
  TextField,
  Stack,
  Avatar,
} from "@mui/material";
import { supabase } from "../../../lib/supabase";
import toast from "react-hot-toast";

interface Booking {
  id: number;
  user_id: string;
  passenger_name: string;
  passenger_age: number;
  passenger_gender: string;
  flight_id: string;
  seat_number: string;
  booking_id: string;
  payment_status: string;
  flights?: {
    id: string;
    origin: string;
    destination: string;
    departure_time: string;
    arrival_time: string;
    price: number;
    status: string;
  };
}

const AllBookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchAllBookings();
  }, []);

  // ✅ Fetch all bookings
  const fetchAllBookings = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("passengers")
        .select(
          `
          *,
          flights (
            id,
            origin,
            destination,
            departure_time,
            arrival_time,
            price,
            status
          )
        `
        )
        .order("id", { ascending: false });

      if (error) throw error;

      setBookings(data || []);
    } catch (err) {
      console.error("❌ Error fetching bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------------------
  // ❌ DELETE BOOKING (Cancel Flight)
  // -----------------------------------------
  const handleCancelBooking = async (bookingId: number) => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this flight booking?"
    );

    if (!confirmCancel) return;

    try {
      const { error } = await supabase
        .from("passengers")
        .delete()
        .eq("id", bookingId);

      if (error) throw error;

      toast.success("Booking cancelled successfully!");

      // Refresh list
      fetchAllBookings();
    } catch (err) {
      console.error("❌ Cancel Error:", err);
      toast.error("Failed to cancel booking!");
    }
  };

  // Filter bookings
  const filteredBookings = bookings.filter((b) =>
    [b.passenger_name, b.user_id, b.flight_id]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom color="primary">
        ✈️ All Bookings
      </Typography>

      {/* Search + Refresh */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mb={3}>
        <TextField
          label="Search by Name / User ID / Flight"
          variant="outlined"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth
        />
        <Button variant="contained" color="primary" onClick={fetchAllBookings}>
          Refresh
        </Button>
      </Stack>

      {/* Loading */}
      {loading ? (
        <Box textAlign="center" mt={5}>
          <CircularProgress />
          <Typography mt={2}>Loading bookings...</Typography>
        </Box>
      ) : (
        <TableContainer component={Paper} elevation={4}>
          <Table>
            <TableHead sx={{ backgroundColor: "#b71c1c" }}>
              <TableRow>
                <TableCell sx={{ color: "white" }}>#</TableCell>
                <TableCell sx={{ color: "white" }}>User</TableCell>
                <TableCell sx={{ color: "white" }}>Passenger</TableCell>
                <TableCell sx={{ color: "white" }}>Gender</TableCell>
                <TableCell sx={{ color: "white" }}>Age</TableCell>
                <TableCell sx={{ color: "white" }}>Flight ID</TableCell>
                <TableCell sx={{ color: "white" }}>Route</TableCell>
                <TableCell sx={{ color: "white" }}>Departure</TableCell>
                <TableCell sx={{ color: "white" }}>Seat</TableCell>
                <TableCell sx={{ color: "white" }}>Payment</TableCell>
                <TableCell sx={{ color: "white" }}>Booking ID</TableCell>
                <TableCell sx={{ color: "white" }}>Action</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredBookings.length > 0 ? (
                filteredBookings.map((b, i) => (
                  <TableRow key={b.id}>
                    <TableCell>{i + 1}</TableCell>

                    {/* User */}
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Avatar sx={{ bgcolor: "#b71c1c" }}>
                          {b.passenger_name.charAt(0).toUpperCase()}
                        </Avatar>
                        <Typography variant="body2">{b.user_id}</Typography>
                      </Stack>
                    </TableCell>

                    <TableCell>{b.passenger_name}</TableCell>
                    <TableCell>{b.passenger_gender}</TableCell>
                    <TableCell>{b.passenger_age}</TableCell>
                    <TableCell>{b.flight_id}</TableCell>

                    <TableCell>
                      {b.flights
                        ? `${b.flights.origin} → ${b.flights.destination}`
                        : "N/A"}
                    </TableCell>

                    <TableCell>
                      {b.flights
                        ? new Date(b.flights.departure_time).toLocaleString()
                        : "N/A"}
                    </TableCell>

                    <TableCell>{b.seat_number}</TableCell>

                    <TableCell
                      sx={{
                        fontWeight: "bold",
                        color:
                          b.payment_status === "success"
                            ? "green"
                            : b.payment_status === "failed"
                            ? "red"
                            : "orange",
                      }}
                    >
                      {b.payment_status.toUpperCase()}
                    </TableCell>

                    <TableCell>{b.booking_id || "-"}</TableCell>

                    {/* ❌ CANCEL BUTTON */}
                    <TableCell>
                      <Button
                        variant="contained"
                        size="small"
                        sx={{
                          bgcolor: "red",
                          "&:hover": { bgcolor: "#d50000" },
                          borderRadius: 2,
                        }}
                        onClick={() => handleCancelBooking(b.id)}
                      >
                        Cancel
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={12} align="center">
                    😕 No bookings found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default AllBookings;
