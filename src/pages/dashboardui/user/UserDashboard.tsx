import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  Button,
  CircularProgress,
  Avatar,
  Tabs,
  Tab,
  TextField,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { Save as SaveIcon } from "@mui/icons-material";
import { supabase } from "../../../lib/supabase";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

interface UserData {
  id: string;
  email: string;
  full_name?: string;
}

interface Booking {
  id: number;
  booking_id: string;
  flight_id: string;
  seat_number: string;
  passenger_name: string;
  passenger_age: number;
  passenger_gender: string;
  payment_status: string;
  flights?: {
    flight_number: string;
    origin: string;
    destination: string;
    flight_date: string;
    departure_time: string;
    arrival_time: string;
  };
}

const UserDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tabIndex, setTabIndex] = useState(0);
  const [fetchingBookings, setFetchingBookings] = useState(false);
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");

  // Dialog state
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(
    null
  );

  // Fetch user info
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        navigate("/login");
        return;
      }

      setUser({
        id: user.id,
        email: user.email ?? "",
        full_name: user.user_metadata?.full_name ?? "",
      });
      setFullName(user.user_metadata?.full_name ?? "");
      setLoading(false);
    };
    fetchUser();
  }, [navigate]);

  // Fetch bookings
  useEffect(() => {
    const fetchBookings = async () => {
      if (!user?.id) return;

      try {
        setFetchingBookings(true);

        const { data, error } = await supabase
          .from("passengers")
          .select(
            `
            *,
            flights:flight_id (
              flight_number,
              origin,
              destination,
              flight_date,
              departure_time,
              arrival_time
            )
          `
          )
          .eq("user_id", user.id)
          .order("id", { ascending: false });

        if (error) throw error;

        setBookings(data || []);
      } catch (err) {
        console.error("Error fetching bookings:", err);
      } finally {
        setFetchingBookings(false);
      }
    };

    fetchBookings();
  }, [user]);

  // Update profile
  const handleUpdateProfile = async () => {
    if (!user) return;
    if (!fullName.trim()) {
      toast.error("Full Name is required");
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: password || undefined,
      data: { full_name: fullName.trim() },
    });

    if (error) toast.error(error.message);
    else {
      toast.success("Profile updated successfully!");
      setUser({ ...user, full_name: fullName.trim() });
      setPassword("");
    }
  };

  // Cancel Booking
  const handleCancelBooking = async () => {
    if (!selectedBookingId) return;

    try {
      const { error } = await supabase
        .from("passengers")
        .delete()
        .eq("id", selectedBookingId);

      if (error) throw error;

      toast.success("Flight booking cancelled successfully!");

      // Remove cancelled booking from UI
      setBookings((prev) => prev.filter((b) => b.id !== selectedBookingId));
    } catch (err) {
      toast.error("Unable to cancel booking.");
    } finally {
      setOpenDialog(false);
      setSelectedBookingId(null);
    }
  };

  // Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  // Format time helper
  const formatTime = (time: string) =>
    new Date(time).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  if (loading) {
    return (
      <Box
        minHeight="100vh"
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <CircularProgress color="warning" />
      </Box>
    );
  }

  return (
    <>
      <Box
        sx={{
          minHeight: "85vh",
          bgcolor: "#fafafa",
          py: 6,
          px: { xs: 2, sm: 4, md: 8 },
        }}
      >
        {/* Header */}
        <Box textAlign="center" mb={5}>
          <Typography
            variant="h4"
            fontWeight={700}
            sx={{
              background: "linear-gradient(90deg, #d26919, #f39c12)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Welcome, {user?.full_name || user?.email?.split("@")[0]} 👋
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Manage your bookings, profile, and account settings here.
          </Typography>
        </Box>

        {/* Tabs */}
        <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
          <Tabs
            value={tabIndex}
            onChange={(_, val) => setTabIndex(val)}
            textColor="inherit"
            TabIndicatorProps={{ style: { backgroundColor: "#FFD700" } }}
          >
            <Tab label="Profile" />
            <Tab label="Bookings" />
            <Tab label="Settings" />
            <Tab label="Logout" />
          </Tabs>
        </Box>

        {/* Profile Tab */}
        {tabIndex === 0 && (
          <Card
            sx={{
              maxWidth: 800,
              mx: "auto",
              p: 3,
              borderRadius: 3,
              boxShadow: 3,
            }}
          >
            <Box display="flex" alignItems="center" gap={3}>
              <Avatar
                sx={{
                  width: 90,
                  height: 90,
                  bgcolor: "#FFD700",
                  color: "#000",
                  fontSize: 36,
                }}
              >
                {user?.email?.charAt(0).toUpperCase()}
              </Avatar>

              <Box>
                <Typography variant="h6">{user?.full_name}</Typography>
                <Typography color="text.secondary">{user?.email}</Typography>
                <Typography variant="body2" mt={1}>
                  Member since: {new Date().toLocaleDateString()}
                </Typography>
              </Box>
            </Box>
          </Card>
        )}

        {/* Bookings Tab */}
        {tabIndex === 1 && (
          <Card sx={{ p: 3, borderRadius: 3, boxShadow: 3 }}>
            <Typography variant="h6" fontWeight={600} mb={2}>
              ✈️ My Bookings
            </Typography>

            {fetchingBookings ? (
              <Box textAlign="center" py={5}>
                <CircularProgress color="warning" />
                <Typography mt={2}>Loading your bookings...</Typography>
              </Box>
            ) : bookings.length > 0 ? (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead sx={{ backgroundColor: "#d26919" }}>
                    <TableRow>
                      <TableCell sx={{ color: "#fff" }}>Flight</TableCell>
                      <TableCell sx={{ color: "#fff" }}>Route</TableCell>
                      <TableCell sx={{ color: "#fff" }}>Date</TableCell>
                      <TableCell sx={{ color: "#fff" }}>Timing</TableCell>
                      <TableCell sx={{ color: "#fff" }}>Seat</TableCell>
                      <TableCell sx={{ color: "#fff" }}>Passenger</TableCell>
                      <TableCell sx={{ color: "#fff" }}>Payment</TableCell>
                      <TableCell sx={{ color: "#fff" }}>Action</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {bookings.map((b) => (
                      <TableRow key={b.id}>
                        <TableCell>{b.flights?.flight_number}</TableCell>

                        <TableCell>
                          {b.flights?.origin} → {b.flights?.destination}
                        </TableCell>

                        <TableCell>
                          {new Date(
                            b.flights?.flight_date || ""
                          ).toLocaleDateString()}
                        </TableCell>

                        <TableCell>
                          {formatTime(b.flights?.departure_time || "")} →{" "}
                          {formatTime(b.flights?.arrival_time || "")}
                        </TableCell>

                        <TableCell>{b.seat_number}</TableCell>
                        <TableCell>{b.passenger_name}</TableCell>

                        <TableCell>
                          <Typography
                            sx={{
                              color:
                                b.payment_status === "success"
                                  ? "green"
                                  : b.payment_status === "failed"
                                  ? "red"
                                  : "orange",
                              fontWeight: "bold",
                            }}
                          >
                            {b.payment_status}
                          </Typography>
                        </TableCell>

                        {/* CANCEL BUTTON */}
                        <TableCell>
                          <Button
                            variant="contained"
                            color="error"
                            size="small"
                            sx={{
                              fontSize: "12px",
                              textTransform: "none",
                              boxShadow: "none",
                            }}
                            onClick={() => {
                              setSelectedBookingId(b.id);
                              setOpenDialog(true);
                            }}
                          >
                            Cancel Flight
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography color="text.secondary" mt={3}>
                No bookings found.
              </Typography>
            )}
          </Card>
        )}

        {/* Settings Tab */}
        {tabIndex === 2 && (
          <Card
            sx={{
              maxWidth: 600,
              mx: "auto",
              p: 3,
              borderRadius: 3,
              boxShadow: 3,
            }}
          >
            <Typography variant="h6">⚙️ Account Settings</Typography>

            <TextField
              label="Full Name"
              fullWidth
              margin="normal"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />

            <TextField
              label="New Password"
              type="password"
              fullWidth
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              sx={{
                mt: 2,
                bgcolor: "#FFD700",
                color: "#000",
                fontWeight: 600,
              }}
              onClick={handleUpdateProfile}
            >
              Save Changes
            </Button>
          </Card>
        )}

        {/* Logout Tab */}
        {tabIndex === 3 && (
          <Box textAlign="center" mt={6}>
            <Typography>Are you sure you want to logout?</Typography>
            <Button
              variant="contained"
              color="error"
              sx={{ px: 4, mt: 2 }}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Box>
        )}
      </Box>

      {/* CANCEL FLIGHT DIALOG */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Cancel Flight?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to cancel this booking? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>No, Keep Booking</Button>

          <Button
            onClick={handleCancelBooking}
            variant="contained"
            color="error"
          >
            Yes, Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default UserDashboard;
