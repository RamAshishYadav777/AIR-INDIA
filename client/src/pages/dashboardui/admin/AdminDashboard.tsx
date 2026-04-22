// src/pages/dashboardui/admin/AdminDashboard.tsx
import React, { useEffect, useState } from "react";
import {
  Grid,
  Typography,
  Button,
  Box,
  Snackbar,
  Alert,
  CircularProgress,
  Stack,
} from "@mui/material";
import StatCard from "../../../components/StatCard";
import ChartSection from "../../../components/ChartSection";
import FlightTable from "./FlightTable";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../../hooks/redux/store";
import { fetchFlights } from "../../../hooks/redux/slices/flightSlice";
import { useNavigate } from "react-router-dom";
import api from "../../../lib/axios";

// Icons
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import GroupIcon from "@mui/icons-material/Group";
import SupervisedUserCircleIcon from "@mui/icons-material/SupervisedUserCircle"; // Alternative for users
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";

interface DashboardStats {
  totalFlights: number;
  totalBookings: number;
  totalUsers: number;
  totalRevenue: number;
  chartData: { name: string; revenue: number }[];
}

const AdminDashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalFlights: 0,
    totalBookings: 0,
    totalUsers: 0,
    totalRevenue: 0,
    chartData: [],
  });
  const [loading, setLoading] = useState(true);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    type: "success" | "error";
  }>({
    open: false,
    message: "",
    type: "success",
  });

  // 🧩 Fetch Dashboard Data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch Flights
      const { data: flightRes } = await api.get("/flights");
      const flightCount = flightRes.data.length;

      // Fetch User Stats
      const { data: bookingRes } = await api.get("/bookings");
      const uniqueUsers = new Set(bookingRes.data.map((b: any) => b.user_id?._id || b.user_id)).size;

      // Fetch Dynamic Admin Stats (Revenue, Chart Data)
      const { data: statsRes } = await api.get("/bookings/admin/stats");
      const adminStats = statsRes.data;

      setStats({
        totalFlights: flightCount || 0,
        totalBookings: adminStats.bookingCount || 0,
        totalUsers: uniqueUsers || 0,
        totalRevenue: adminStats.totalRevenue || 0,
        chartData: adminStats.revenueByDay || [],
      });
    } catch (err: any) {
      console.error("❌ Error fetching dashboard data:", err);
      setSnackbar({
        open: true,
        message: "Failed to load dashboard data.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    dispatch(fetchFlights());
  }, [dispatch]);

  if (loading) {
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        height="60vh"
      >
        <CircularProgress color="warning" />
      </Box>
    );
  }

  return (
    <>
      {/* Header Section */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
      >
        <Typography variant="h4" fontWeight="bold" sx={{ color: "#333" }}>
          Dashboard Overview
        </Typography>

        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            onClick={() => navigate("/dashboard/analytics")}
            sx={{
              borderColor: "#FFD700",
              color: "#333",
              fontWeight: "bold",
              padding: "10px 24px",
              "&:hover": {
                borderColor: "#FF8C00",
                bgcolor: "rgba(255, 215, 0, 0.05)",
              }
            }}
          >
            View Insights
          </Button>

          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/dashboard/addflight")}
            sx={{
              background: "linear-gradient(45deg, #FFD700 30%, #FF8C00 90%)",
              color: "#000",
              fontWeight: "bold",
              padding: "10px 24px",
              boxShadow: "0 3px 5px 2px rgba(255, 105, 135, .3)",
            }}
          >
            + Add Flight
          </Button>
        </Stack>
      </Box>

      {/* Dashboard Stats */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Total Flights"
            value={stats.totalFlights.toString()}
            icon={<FlightTakeoffIcon sx={{ fontSize: 28 }} />}
            color="#1E90FF"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Total Bookings"
            value={stats.totalBookings.toString()}
            icon={<GroupIcon sx={{ fontSize: 28 }} />}
            color="#32CD32"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Active Users"
            value={stats.totalUsers.toString()}
            icon={<SupervisedUserCircleIcon sx={{ fontSize: 28 }} />}
            color="#FF4500"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Total Revenue"
            value={`₹${(stats.totalRevenue ?? 0).toLocaleString()}`}
            icon={<AccountBalanceWalletIcon sx={{ fontSize: 28 }} />}
            color="#FFD700"
          />
        </Grid>
      </Grid>

      {/* Chart Section */}
      <ChartSection data={stats.chartData} />

      {/* Flight Table */}
      <Box mt={5}>
        <Typography variant="h5" fontWeight="bold" mb={2} sx={{ color: "#444" }}>
          ✈️ Recent Flights
        </Typography>
        <FlightTable showTitle={false} />
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        sx={{ zIndex: 2000 }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.type}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AdminDashboard;
