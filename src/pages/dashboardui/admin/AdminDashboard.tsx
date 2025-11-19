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

interface DashboardStats {
  totalFlights: number;
  totalBookings: number;
  totalUsers: number;
  totalRevenue: number;
}

const AdminDashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalFlights: 0,
    totalBookings: 0,
    totalUsers: 0,
    totalRevenue: 0,
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

      // ✅ Count Bookings (passengers table)
      const { count: bookingCount, error: bookingError } = await supabase
        .from("passengers")
        .select("*", { count: "exact", head: true });
      if (bookingError) throw bookingError;

      // ✅ Count Users
      const { data: usersData, error: usersError } = await supabase
        .from("users")
        .select("id");
      if (usersError) throw usersError;

      // ✅ Calculate Total Revenue (sum of payments)
      const { data: payments, error: paymentError } = await supabase
        .from("payments")
        .select("amount")
        .eq("status", "success");
      if (paymentError && paymentError.code !== "PGRST116") throw paymentError;

      const totalRevenue = payments?.reduce(
        (sum: number, row: any) => sum + (row.amount || 0),
        0
      );

      setStats({
        totalFlights: flightCount || 0,
        totalBookings: bookingCount || 0,
        totalUsers: usersData?.length || 0,
        totalRevenue: totalRevenue || 0,
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

  // ✅ Fetch once when component loads
  useEffect(() => {
    fetchDashboardData();
    dispatch(fetchFlights());
  }, [dispatch]);

  // ✅ Supabase Realtime — auto update dashboard
  useEffect(() => {
    const flightSub = supabase
      .channel("realtime_flights")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "flights" },
        () => fetchDashboardData()
      )
      .subscribe();

    const bookingSub = supabase
      .channel("realtime_bookings")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "passengers" },
        () => fetchDashboardData()
      )
      .subscribe();

    const paymentSub = supabase
      .channel("realtime_payments")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "payments" },
        () => fetchDashboardData()
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
        mb={2}
      >
        <Typography variant="h5" fontWeight="bold">
          Dashboard Overview
        </Typography>

        {/* ✅ Redirect to AddFlight Page */}
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate("/dashboard/addflight")}
        >
          + Add Flight
        </Button>
      </Box>

      {/* Dashboard Stats */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Flights"
            value={stats.totalFlights.toString()}
          />
        </Grid>
        {/* <Grid item xs={12} sm={6} md={3}> */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Total Bookings"
            value={stats.totalBookings.toString()}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Total Users" value={stats.totalUsers.toString()} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Total Revenue"
            value={`₹${stats.totalRevenue.toLocaleString()}`}
          />
        </Grid>
      </Grid>

      {/* Chart Section */}
      <ChartSection />

      {/* Flight Table */}
      <Box mt={4}>
        <Typography variant="h6" fontWeight="bold" mb={1}>
          ✈️ Flights List
        </Typography>
        <FlightTable />
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
