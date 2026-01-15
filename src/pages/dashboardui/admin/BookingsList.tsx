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
  Chip,
  InputAdornment,
} from "@mui/material";
import { supabase } from "../../../lib/supabase";
import toast from "react-hot-toast";
import SearchIcon from "@mui/icons-material/Search";
import CancelIcon from "@mui/icons-material/Cancel";

interface Booking {
  id: number;
  user_id: string;
  passenger_name: string;
  passenger_age: number;
  passenger_gender: string;
  flight_id: string;
  seat_number: string;
  booking_id: string;
  payment_status: "success" | "failed" | "pending";
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

      setBookings(data as Booking[] || []);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "success";
      case "failed":
        return "error";
      case "pending":
        return "warning";
      default:
        return "default";
    }
  };

  return (
    <Box p={4}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" fontWeight="bold" sx={{ color: "#333" }}>
          🎟️ Booking Management
        </Typography>
        <Button
          variant="contained"
          onClick={fetchAllBookings}
          sx={{
            bgcolor: "#000",
            color: "#FFD700",
            fontWeight: "bold",
            borderRadius: "20px",
            "&:hover": { bgcolor: "#333" },
          }}
        >
          Refresh Data
        </Button>
      </Box>

      {/* Search Bar */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 4,
          borderRadius: 4,
          border: "1px solid #eee",
          display: "flex",
          alignItems: "center",
        }}
      >
        <TextField
          placeholder="Search by Passenger, User ID, or Flight..."
          variant="standard"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth
          InputProps={{
            disableUnderline: true,
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "#ccc", mr: 1 }} />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {/* Loading */}
      {loading ? (
        <Box textAlign="center" mt={5}>
          <CircularProgress sx={{ color: "#FFD700" }} />
          <Typography mt={2}>Loading bookings...</Typography>
        </Box>
      ) : (
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            borderRadius: 4,
            boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
            border: "1px solid #f0f0f0",
            overflow: "hidden",
          }}
        >
          <Table>
            <TableHead sx={{ backgroundColor: "#000" }}>
              <TableRow>
                {[
                  "#",
                  "User",
                  "Passenger",
                  "Gender",
                  "Age",
                  "Flight ID",
                  "Route",
                  "Departure",
                  "Seat",
                  "Payment",
                  "Booking ID",
                  "Action",
                ].map((head) => (
                  <TableCell
                    key={head}
                    sx={{ color: "#FFD700", fontWeight: "bold", borderBottom: "none" }}
                  >
                    {head}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredBookings.length > 0 ? (
                filteredBookings.map((b, i) => (
                  <TableRow
                    key={b.id}
                    sx={{
                      "&:hover": { bgcolor: "rgba(255, 215, 0, 0.05)" },
                      borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    <TableCell>{i + 1}</TableCell>

                    {/* User */}
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Avatar
                          sx={{
                            bgcolor: "#fff",
                            color: "#000",
                            border: "1px solid #ddd",
                            width: 30,
                            height: 30,
                            fontSize: 14,
                            fontWeight: "bold",
                          }}
                        >
                          {b.passenger_name.charAt(0).toUpperCase()}
                        </Avatar>
                        <Typography variant="body2" color="text.secondary">
                          {b.user_id?.substring(0, 8)}...
                        </Typography>
                      </Stack>
                    </TableCell>

                    <TableCell sx={{ fontWeight: 600 }}>{b.passenger_name}</TableCell>
                    <TableCell>{b.passenger_gender}</TableCell>
                    <TableCell>{b.passenger_age}</TableCell>
                    <TableCell sx={{ fontFamily: "monospace" }}>
                      {b.flight_id?.substring(0, 8)}
                    </TableCell>

                    <TableCell>
                      {b.flights
                        ? `${b.flights.origin} ➝ ${b.flights.destination}`
                        : "N/A"}
                    </TableCell>

                    <TableCell>
                      {b.flights
                        ? new Date(b.flights.departure_time).toLocaleDateString()
                        : "N/A"}
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={b.seat_number}
                        size="small"
                        sx={{ bgcolor: "#eee", fontWeight: "bold" }}
                      />
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={b.payment_status?.toUpperCase()}
                        color={getStatusColor(b.payment_status) as any}
                        size="small"
                        variant="filled"
                        sx={{ fontWeight: "bold", minWidth: 80 }}
                      />
                    </TableCell>

                    <TableCell sx={{ fontFamily: "monospace", fontSize: 12 }}>
                      {b.booking_id || "-"}
                    </TableCell>

                    {/* ❌ CANCEL BUTTON */}
                    <TableCell>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        startIcon={<CancelIcon />}
                        onClick={() => handleCancelBooking(b.id)}
                        sx={{ borderRadius: 20, textTransform: "none" }}
                      >
                        Cancel
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={12} align="center" sx={{ py: 5 }}>
                    <Typography variant="h6" color="text.secondary">
                      😕 No bookings found
                    </Typography>
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
