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
} from "@mui/material";
import StatCard from "../../../components/StatCard";
import ChartSection from "../../../components/ChartSection";
import FlightTable from "./FlightTable";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../../hooks/redux/store";
import { fetchFlights } from "../../../hooks/redux/slices/flightSlice";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../lib/supabase";

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

      // ✅ Count Flights
      const { count: flightCount, error: flightError } = await supabase
        .from("flights")
        .select("*", { count: "exact", head: true });
      if (flightError) throw flightError;

      // ✅ Count Bookings
      const { count: bookingCount, error: bookingError } = await supabase
        .from("passengers")
        .select("*", { count: "exact", head: true });
      if (bookingError) throw bookingError;

      // ✅ Count Active Users (via passengers unique user_id)
      const { data: passengersData } = await supabase
        .from("passengers")
        .select("user_id");

      const uniqueUsers = new Set(passengersData?.map((p) => p.user_id)).size;

      // ✅ Calculate Total Revenue & Chart Data
      const { data: payments, error: paymentError } = await supabase
        .from("payments")
        .select("amount, created_at")
        .eq("status", "success");

      if (paymentError && paymentError.code !== "PGRST116") throw paymentError;

      // Total Revenue
      const totalRevenue = payments?.reduce(
        (sum: number, row: any) => sum + (row.amount || 0),
        0
      );

      // Process Chart Data (Group by Day Name: Mon, Tue...)
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const revenueByDay: Record<string, number> = {};

      // Initialize with 0 to ensure order if desired, or just aggregate existing
      // Let's aggregate existing data points
      payments?.forEach((p) => {
        const date = new Date(p.created_at);
        const dayName = days[date.getDay()];
        revenueByDay[dayName] = (revenueByDay[dayName] || 0) + (p.amount || 0);
      });

      // Convert to array suitable for chart
      // For a "Last 7 days" view, ideally we project back 7 days, but for now simple aggregation:
      const chartData = Object.entries(revenueByDay).map(([name, revenue]) => ({
        name,
        revenue,
      }));

      // Sort chart data by day index to keep order Mon-Sun or relative? 
      // Simple sort by day index for display consistency
      chartData.sort((a, b) => days.indexOf(a.name) - days.indexOf(b.name));

      setStats({
        totalFlights: flightCount || 0,
        totalBookings: bookingCount || 0,
        totalUsers: uniqueUsers || 0,
        totalRevenue: totalRevenue || 0,
        chartData: chartData.length > 0 ? chartData : [{ name: "No Data", revenue: 0 }],
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

  // Realtime subscriptions
  useEffect(() => {
    const flightSub = supabase
      .channel("realtime_flights")
      .on("postgres_changes", { event: "*", schema: "public", table: "flights" }, () =>
        fetchDashboardData()
      )
      .subscribe();

    const bookingSub = supabase
      .channel("realtime_bookings")
      .on("postgres_changes", { event: "*", schema: "public", table: "passengers" }, () =>
        fetchDashboardData()
      )
      .subscribe();

    const paymentSub = supabase
      .channel("realtime_payments")
      .on("postgres_changes", { event: "*", schema: "public", table: "payments" }, () =>
        fetchDashboardData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(flightSub);
      supabase.removeChannel(bookingSub);
      supabase.removeChannel(paymentSub);
    };
  }, []);

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
            value={`₹${stats.totalRevenue.toLocaleString()}`}
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
