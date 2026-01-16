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
  Chip,
  Stack,
  Divider,
  Container,
} from "@mui/material";
import {
  Save as SaveIcon,
  FlightTakeoff,
  Person,
  Settings,
  Logout,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import { supabase } from "../../../lib/supabase";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

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
  payment_status: "success" | "failed" | "pending";
  flights?: {
    flight_number: string;
    origin: string;
    destination: string;
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
              departure_time,
              arrival_time
            )
          `
          )
          .eq("user_id", user.id)
          .order("id", { ascending: false });

        if (error) throw error;

        setBookings(data as Booking[] || []);
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
  const formatDateTime = (isoString?: string) => {
    if (!isoString) return { date: "N/A", time: "N/A" };
    const date = new Date(isoString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success": return "success";
      case "failed": return "error";
      case "pending": return "warning";
      default: return "default";
    }
  };

  if (loading) {
    return (
      <Box
        minHeight="100vh"
        display="flex"
        justifyContent="center"
        alignItems="center"
        bgcolor="#f8f9fa"
      >
        <CircularProgress sx={{ color: "#FFD700" }} />
      </Box>
    );
  }

  const TabPanel = ({ children, index }: { children: React.ReactNode; index: number }) => (
    <div role="tabpanel" hidden={tabIndex !== index}>
      <AnimatePresence mode="wait">
        {tabIndex === index && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <>
      <Box
        sx={{
          minHeight: "90vh",
          background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
          pb: 8,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background Decors */}
        <Box
          sx={{
            position: "absolute",
            top: -100,
            left: -100,
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "rgba(255, 215, 0, 0.1)",
            filter: "blur(80px)",
            zIndex: 0,
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: -50,
            right: -50,
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: "rgba(0, 0, 0, 0.05)",
            filter: "blur(60px)",
            zIndex: 0,
          }}
        />

        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1, pt: 6 }}>
          {/* Header */}
          <Box textAlign="center" mb={6}>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Typography
                variant="h3"
                fontWeight={800}
                sx={{
                  background: "linear-gradient(90deg, #1a1a1a, #4a4a4a)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  mb: 1,
                }}
              >
                Welcome back, {user?.full_name?.split(" ")[0] || "Traveler"}! 👋
              </Typography>
              <Typography variant="h6" color="text.secondary" fontWeight={500}>
                Your personal travel command center
              </Typography>
            </motion.div>
          </Box>

          {/* Navigation Tabs */}
          <Paper
            elevation={0}
            sx={{
              borderRadius: "50px",
              bgcolor: "rgba(255,255,255,0.7)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.8)",
              mb: 5,
              mx: "auto",
              maxWidth: 600,
              p: 0.5,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Tabs
              value={tabIndex}
              onChange={(_, val) => setTabIndex(val)}
              variant="scrollable"
              scrollButtons="auto"
              textColor="primary"
              indicatorColor="primary"
              sx={{
                "& .MuiTab-root": {
                  borderRadius: "50px",
                  minHeight: 48,
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "1rem",
                  px: 3,
                  transition: "all 0.2s",
                  color: "#666",
                  "&.Mui-selected": {
                    color: "#000",
                    bgcolor: "#fff",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  },
                },
                "& .MuiTabs-indicator": { display: "none" },
              }}
            >
              <Tab icon={<Person fontSize="small" />} iconPosition="start" label="Profile" />
              <Tab icon={<FlightTakeoff fontSize="small" />} iconPosition="start" label="Bookings" />
              <Tab icon={<Settings fontSize="small" />} iconPosition="start" label="Settings" />
              <Tab icon={<Logout fontSize="small" />} iconPosition="start" label="Logout" sx={{ color: "error.main" }} />
            </Tabs>
          </Paper>

          {/* Profile Tab */}
          <TabPanel index={0}>
            <Card
              sx={{
                maxWidth: 700,
                mx: "auto",
                borderRadius: 4,
                overflow: "hidden",
                boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
                background: "rgba(255,255,255,0.8)",
                backdropFilter: "blur(20px)",
              }}
            >
              <Box
                sx={{
                  height: 140,
                  background: "linear-gradient(90deg, #000 0%, #333 100%)",
                  position: "relative",
                }}
              />
              <Box sx={{ px: 4, pb: 4, mt: -6, textAlign: "center" }}>
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    border: "4px solid #fff",
                    bgcolor: "#FFD700",
                    color: "#000",
                    fontSize: 48,
                    fontWeight: "bold",
                    mx: "auto",
                    boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
                    mb: 2,
                  }}
                >
                  {user?.full_name?.charAt(0).toUpperCase() || "U"}
                </Avatar>
                <Typography variant="h5" fontWeight={700}>
                  {user?.full_name || "Guest User"}
                </Typography>
                <Typography color="text.secondary" gutterBottom>
                  {user?.email}
                </Typography>
                <Chip
                  label="Frequent Flyer"
                  size="small"
                  sx={{ bgcolor: "#FFD700", color: "#000", fontWeight: "bold", mt: 1 }}
                />

                <Divider sx={{ my: 3 }} />

                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  justifyContent="center"
                  spacing={{ xs: 2, sm: 4 }}
                  divider={<Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />}
                >
                  <Box>
                    <Typography variant="h4" fontWeight={800} color="primary">
                      {bookings.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Flights
                    </Typography>
                  </Box>
                  <Divider sx={{ display: { xs: 'block', sm: 'none' } }} />
                  <Box>
                    <Typography variant="h4" fontWeight={800} color="primary">
                      0
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Points Earned
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </Card>
          </TabPanel>

          {/* Bookings Tab */}
          <TabPanel index={1}>
            <Card
              sx={{
                borderRadius: 4,
                boxShadow: "0 4px 25px rgba(0,0,0,0.05)",
                overflow: "hidden",
              }}
            >
              <Box p={3} bgcolor="#000" color="#fff" display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" fontWeight={700} color="#FFD700">
                  ✈️ My Flight History
                </Typography>
                <Chip label={`${bookings.length} Bookings`} sx={{ bgcolor: "rgba(255,215,0,0.2)", color: "#FFD700" }} />
              </Box>

              {fetchingBookings ? (
                <Box textAlign="center" py={8}>
                  <CircularProgress size={40} sx={{ color: "#FFD700" }} />
                  <Typography mt={2} color="text.secondary">Fetching your flights...</Typography>
                </Box>
              ) : bookings.length > 0 ? (
                <>
                  {/* Desktop Table View */}
                  <Box sx={{ display: { xs: "none", md: "block" } }}>
                    <TableContainer component={Paper} elevation={0}>
                      <Table>
                        <TableHead sx={{ bgcolor: "#f5f5f5" }}>
                          <TableRow>
                            {["Flight", "From → To", "Date & Time", "Passenger", "Seat", "Status", "Action"].map((h) => (
                              <TableCell key={h} sx={{ fontWeight: "bold", color: "#555" }}>
                                {h}
                              </TableCell>
                            ))}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {bookings.map((b) => {
                            const dep = formatDateTime(b.flights?.departure_time);
                            const arr = formatDateTime(b.flights?.arrival_time);
                            return (
                              <TableRow key={b.id} hover>
                                <TableCell>
                                  <Typography fontWeight={600}>{b.flights?.flight_number || "N/A"}</Typography>
                                  <Typography variant="caption" color="text.secondary">{b.booking_id}</Typography>
                                </TableCell>

                                <TableCell>
                                  <Typography fontWeight={600} fontSize="0.9rem">
                                    {b.flights?.origin}
                                    <span style={{ margin: "0 8px", color: "#ccc" }}>✈</span>
                                    {b.flights?.destination}
                                  </Typography>
                                </TableCell>

                                <TableCell>
                                  <Typography variant="body2" fontWeight={500}>{dep.date}</Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {dep.time} - {arr.time}
                                  </Typography>
                                </TableCell>

                                <TableCell>{b.passenger_name}</TableCell>

                                <TableCell>
                                  <Chip label={b.seat_number} size="small" sx={{ bgcolor: "#eee", fontWeight: "bold" }} />
                                </TableCell>

                                <TableCell>
                                  <Chip
                                    label={b.payment_status.toUpperCase()}
                                    color={getStatusColor(b.payment_status) as any}
                                    size="small"
                                    variant="filled"
                                    sx={{ fontWeight: "bold", fontSize: "0.75rem", minWidth: 80 }}
                                  />
                                </TableCell>

                                <TableCell>
                                  <Button
                                    variant="outlined"
                                    color="error"
                                    size="small"
                                    startIcon={<CancelIcon />}
                                    onClick={() => {
                                      setSelectedBookingId(b.id);
                                      setOpenDialog(true);
                                    }}
                                    sx={{ borderRadius: 20, textTransform: "none" }}
                                  >
                                    Cancel
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>

                  {/* Mobile Card View */}
                  <Box sx={{ display: { xs: "block", md: "none" } }}>
                    <Stack spacing={2}>
                      {bookings.map((b) => {
                        const dep = formatDateTime(b.flights?.departure_time);
                        return (
                          <Card key={b.id} sx={{ p: 2, borderRadius: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                              <Box>
                                <Typography variant="h6" fontWeight={700}>{b.flights?.origin} ➝ {b.flights?.destination}</Typography>
                                <Typography variant="caption" color="text.secondary">{dep.date} • {dep.time}</Typography>
                              </Box>
                              <Chip
                                label={b.payment_status.toUpperCase()}
                                color={getStatusColor(b.payment_status) as any}
                                size="small"
                                variant="filled"
                                sx={{ height: 24, fontSize: "0.7rem", fontWeight: "bold" }}
                              />
                            </Stack>

                            <Divider sx={{ my: 1 }} />

                            <Stack spacing={0.5} mb={2}>
                              <Typography variant="body2"><strong>Flight:</strong> {b.flights?.flight_number}</Typography>
                              <Typography variant="body2"><strong>Passenger:</strong> {b.passenger_name}</Typography>
                              <Typography variant="body2"><strong>Seat:</strong> {b.seat_number}</Typography>
                              <Typography variant="caption" color="text.secondary">Booking ID: {b.booking_id}</Typography>
                            </Stack>

                            <Button
                              variant="outlined"
                              color="error"
                              fullWidth
                              size="small"
                              startIcon={<CancelIcon />}
                              onClick={() => {
                                setSelectedBookingId(b.id);
                                setOpenDialog(true);
                              }}
                            >
                              Cancel Booking
                            </Button>
                          </Card>
                        );
                      })}
                    </Stack>
                  </Box>
                </>
              ) : (
                <Box textAlign="center" py={8}>
                  <Typography variant="h6" color="text.secondary">No bookings found</Typography>
                  <Button variant="contained" sx={{ mt: 2, bgcolor: "#000", color: "#FFD700" }} onClick={() => navigate("/")}>
                    Book a Flight
                  </Button>
                </Box>
              )}
            </Card>
          </TabPanel>

          {/* Settings Tab */}
          <TabPanel index={2}>
            <Card
              sx={{
                maxWidth: 550,
                mx: "auto",
                p: 4,
                borderRadius: 4,
                boxShadow: "0 8px 30px rgba(0,0,0,0.05)",
              }}
            >
              <Typography variant="h5" fontWeight={700} mb={3}>
                ⚙️ Account Settings
              </Typography>

              <TextField
                label="Full Name"
                fullWidth
                margin="normal"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                InputProps={{ sx: { borderRadius: 2 } }}
              />

              <TextField
                label="New Password"
                type="password"
                fullWidth
                margin="normal"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{ sx: { borderRadius: 2 } }}
                helperText="Leave blank to keep current password"
              />

              <Button
                variant="contained"
                fullWidth
                startIcon={<SaveIcon />}
                size="large"
                sx={{
                  mt: 4,
                  bgcolor: "#000",
                  color: "#FFD700",
                  fontWeight: "bold",
                  borderRadius: 2,
                  py: 1.5,
                  "&:hover": { bgcolor: "#333" },
                }}
                onClick={handleUpdateProfile}
              >
                Save Changes
              </Button>
            </Card>
          </TabPanel>

          {/* Logout Tab */}
          <TabPanel index={3}>
            <Box textAlign="center" mt={8}>
              <Typography variant="h5" gutterBottom fontWeight={600}>
                Ready to take a break?
              </Typography>
              <Typography color="text.secondary" mb={4}>
                You are about to sign out of your account.
              </Typography>
              <Button
                variant="contained"
                color="error"
                size="large"
                startIcon={<Logout />}
                onClick={handleLogout}
                sx={{ px: 6, py: 1.5, borderRadius: 50, fontWeight: "bold" }}
              >
                Sign Out
              </Button>
            </Box>
          </TabPanel>
        </Container>

        {/* Cancel Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle>Cancel Booking?</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to cancel this flight? This action typically cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenDialog(false)} variant="outlined" sx={{ borderRadius: 2 }}>
              Keep Flight
            </Button>
            <Button
              onClick={handleCancelBooking}
              variant="contained"
              color="error"
              sx={{ borderRadius: 2 }}
              autoFocus
            >
              Confirm Cancel
            </Button>
          </DialogActions>
        </Dialog>
      </Box >
    </>
  );
};

export default UserDashboard;
