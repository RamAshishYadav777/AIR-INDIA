import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Button,
  Stack,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from "recharts";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import api from "../../../lib/axios";
import { motion } from "framer-motion";

// CSS for Heatmap Pulsate Animation
const heatmapStyles = `
  @keyframes pulsate {
    0% { transform: scale(1); opacity: 0.7; }
    50% { transform: scale(1.2); opacity: 0.4; }
    100% { transform: scale(1); opacity: 0.7; }
  }
  .pulsating-marker {
    animation: pulsate 2s infinite ease-in-out;
    transform-origin: center;
  }
  .leaflet-container {
    border-radius: 16px;
  }
`;

// Coordinates for major cities
const CITY_COORDINATES: Record<string, [number, number]> = {
  "New York": [40.7128, -74.0060],
  "London": [51.5074, -0.1278],
  "Paris": [48.8566, 2.3522],
  "Delhi": [28.6139, 77.2090],
  "Mumbai": [19.0760, 72.8777],
  "Dubai": [25.2048, 55.2708],
  "Singapore": [1.3521, 103.8198],
  "Sydney": [-33.8688, 151.2093],
  "Tokyo": [35.6762, 139.6503],
  "Rome": [41.9028, 12.4964],
  "Toronto": [43.6532, -79.3832],
  "Berlin": [52.5200, 13.4050],
  "San Francisco": [37.7749, -122.4194],
  "Milan": [45.4642, 9.1900],
  "Barcelona": [41.3851, 2.1734]
};

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [routeRevenue, setRouteRevenue] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, revenueRes] = await Promise.all([
          api.get("/bookings/admin/stats"),
          api.get("/bookings/admin/route-revenue")
        ]);
        setStats(statsRes.data);
        setRouteRevenue(Array.isArray(revenueRes.data) ? revenueRes.data : []);
      } catch (err) {
        console.error("Error fetching analytics data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
        <CircularProgress color="error" />
      </Box>
    );
  }

  const COLORS = ['#D41B2D', '#FFD700', '#2E7D32', '#1976D2', '#9C27B0'];

  return (
    <Box sx={{ p: 3, bgcolor: "#FDFCFB", minHeight: "100vh" }}>
      <style>{heatmapStyles}</style>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 900, color: "#1A1A1A", mb: 1 }}>
              Operational Intelligence
            </Typography>
            <Typography variant="subtitle1" sx={{ color: "#666", fontWeight: 500 }}>
              Global route performance and revenue heatmaps.
            </Typography>
          </Box>
          <Button
            variant="contained"
            sx={{
              bgcolor: "#D41B2D",
              "&:hover": { bgcolor: "#B01625" },
              borderRadius: "8px",
              px: 3,
              fontWeight: 700
            }}
          >
            Export Report
          </Button>
        </Stack>

        <Grid container spacing={3}>
          {/* Top Cards */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)", border: "1px solid #EEE" }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="overline" color="textSecondary" fontWeight={800}>Total Revenue</Typography>
                <Typography variant="h3" sx={{ fontWeight: 900, color: "#D41B2D", mt: 1 }}>
                  ₹{(stats?.totalRevenue ?? 0).toLocaleString('en-IN')}
                </Typography>
                <Typography variant="body2" sx={{ color: "#2E7D32", fontWeight: 700, mt: 1 }}>
                  +12.5% from last month
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)", border: "1px solid #EEE" }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="overline" color="textSecondary" fontWeight={800}>Total Bookings</Typography>
                <Typography variant="h3" sx={{ fontWeight: 900, color: "#1A1A1A", mt: 1 }}>
                  {stats?.bookingCount}
                </Typography>
                <Typography variant="body2" sx={{ color: "#2E7D32", fontWeight: 700, mt: 1 }}>
                  📈 Trending Up
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)", border: "1px solid #EEE" }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="overline" color="textSecondary" fontWeight={800}>Avg. Ticket Value</Typography>
                <Typography variant="h3" sx={{ fontWeight: 900, color: "#1A1A1A", mt: 1 }}>
                  ₹{Math.round((stats?.totalRevenue ?? 0) / (stats?.bookingCount || 1)).toLocaleString('en-IN')}
                </Typography>
                <Typography variant="body2" sx={{ color: "#666", fontWeight: 700, mt: 1 }}>
                  Premium Segment Growth
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Revenue Heatmap */}
          <Grid size={{ xs: 12 }}>
            <Card sx={{ borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)", border: "1px solid #EEE", overflow: "hidden" }}>
              <Box sx={{ p: 3, borderBottom: "1px solid #EEE", bgcolor: "#FAFAFA" }}>
                <Typography variant="h6" fontWeight={800}>Global Distribution Heatmap</Typography>
              </Box>
              <Box sx={{ height: "500px", width: "100%", position: "relative" }}>
                <MapContainer center={[20, 0]} zoom={2} style={{ height: "100%", width: "100%" }}>
                  <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                  />

                  {/* Legend Overlay */}
                  <Box sx={{
                    position: "absolute",
                    bottom: 20,
                    right: 20,
                    zIndex: 1000,
                    bgcolor: "rgba(0,0,0,0.8)",
                    p: 2,
                    borderRadius: 2,
                    border: "1px solid rgba(255,255,255,0.1)",
                    backdropFilter: "blur(4px)"
                  }}>
                    <Typography variant="caption" sx={{ color: "#AAA", display: "block", mb: 1, fontWeight: 700 }}>REVENUE SCALE</Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: "#D41B2D", border: "2px solid #FFF" }} />
                      <Typography variant="caption" sx={{ color: "#FFF", fontWeight: 600 }}>High Traffic</Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center" mt={0.5}>
                      <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "rgba(212, 27, 45, 0.4)", border: "1px solid #FFF" }} />
                      <Typography variant="caption" sx={{ color: "#FFF", fontWeight: 600 }}>Standard</Typography>
                    </Stack>
                  </Box>
                  {Array.isArray(routeRevenue) && routeRevenue.map((route, idx) => {
                    const coords = CITY_COORDINATES[route.city];
                    if (!coords) return null;

                    // Scale circle size based on revenue
                    const radius = Math.min(Math.max(route.revenue / 1000, 5), 25);

                    return (
                      <CircleMarker
                        key={idx}
                        center={coords}
                        radius={radius}
                        pathOptions={{
                          fillColor: "#D41B2D",
                          color: "#FFF",
                          weight: 1,
                          opacity: 1,
                          fillOpacity: 0.7,
                          className: "pulsating-marker"
                        }}
                      >
                        <Popup>
                          <Typography variant="subtitle2" fontWeight={800}>{route.city}</Typography>
                          <Typography variant="body2">Revenue: ₹{(route.revenue ?? 0).toLocaleString('en-IN')}</Typography>
                        </Popup>
                      </CircleMarker>
                    );
                  })}
                </MapContainer>
              </Box>
            </Card>
          </Grid>

          {/* Detailed Charts */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Card sx={{ borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)", border: "1px solid #EEE", height: "100%" }}>
              <Box sx={{ p: 3, borderBottom: "1px solid #EEE", bgcolor: "#FAFAFA" }}>
                <Typography variant="h6" fontWeight={800}>7-Day Revenue Trend</Typography>
              </Box>
              <Box sx={{ p: 3, height: "400px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats?.revenueByDay}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val / 1000}k`} />
                    <Tooltip
                      cursor={{ fill: 'rgba(212, 27, 45, 0.05)' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                    />
                    <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                      {Array.isArray(stats?.revenueByDay) && stats.revenueByDay.map((_: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={index === stats.revenueByDay.length - 1 ? '#D41B2D' : '#FAD3D7'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)", border: "1px solid #EEE", height: "100%" }}>
              <Box sx={{ p: 3, borderBottom: "1px solid #EEE", bgcolor: "#FAFAFA" }}>
                <Typography variant="h6" fontWeight={800}>Revenue Share by City</Typography>
              </Box>
              <Box sx={{ p: 3, height: "400px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={routeRevenue}
                      dataKey="revenue"
                      nameKey="city"
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={120}
                      paddingAngle={5}
                    >
                      {Array.isArray(routeRevenue) && routeRevenue.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <Stack spacing={1} mt={2}>
                  {Array.isArray(routeRevenue) && routeRevenue.slice(0, 5).map((route, i) => (
                    <Stack key={i} direction="row" justifyContent="space-between" alignItems="center">
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: COLORS[i % COLORS.length] }} />
                        <Typography variant="body2" sx={{ color: "#444", fontWeight: 600 }}>{route.city}</Typography>
                      </Stack>
                      <Typography variant="body2" fontWeight={800}>₹{((route.revenue ?? 0) / 1000).toFixed(1)}k</Typography>
                    </Stack>
                  ))}
                </Stack>
              </Box>
            </Card>
          </Grid>
        </Grid>
      </motion.div>
    </Box>
  );
};

export default Analytics;
