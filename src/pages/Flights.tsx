// src/pages/Flights.tsx
import React, { useEffect, useState } from "react";
import {
  Typography,
  Card,
  CardContent,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  Box,
  Button,
} from "@mui/material";

import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAppSelector } from "../hooks/redux/hooks";
import { useDispatch } from "react-redux";
import { setFlightId, setPrice } from "../hooks/redux/slices/bookingSlice";
import toast from "react-hot-toast";

interface Flight {
  id: string;
  flight_number: string;
  origin: string;
  destination: string;
  departure_time: string;
  arrival_time: string;
  price: number;
  status: string;
}

const Flights: React.FC = () => {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);

  const user = useAppSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const fetchFlights = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("flights")
        .select("*")
        .order("departure_time", { ascending: true });

      if (error) throw error;
      setFlights((data as Flight[]) || []);
    } catch (err) {
      console.error("❌ Error fetching flights:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlights();
  }, []);

  const handleBookFlight = (flight: Flight) => {
    if (!user) {
      toast.error("Please log in to book your flight!");
      navigate("/login");
      return;
    }

    dispatch(setFlightId(flight.id));
    dispatch(setPrice(flight.price));

    navigate(`/booking/seat-selection`);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #000000 0%, #080808 40%, #111111 100%)",
        px: 3,
        py: 5,
        color: "#fff",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* 🔥 Red Aura Glows */}
      {[
        { size: 300, top: "12%", left: "10%", opacity: 0.18 },
        { size: 350, top: "70%", left: "25%", opacity: 0.12 },
        { size: 450, bottom: "10%", right: "10%", opacity: 0.15 },
      ].map((orb, i) => (
        <Box
          key={i}
          sx={{
            position: "absolute",
            width: orb.size,
            height: orb.size,
            borderRadius: "50%",
            background: "radial-gradient(circle, #FF0000, transparent 70%)",
            opacity: orb.opacity,
            top: orb.top,
            left: orb.left,
            bottom: orb.bottom,
            right: orb.right,
            filter: "blur(140px)",
            zIndex: 1,
            animation: "glowMove 30s infinite linear",
            "@keyframes glowMove": {
              "0%": { transform: "translateY(0px)" },
              "50%": { transform: "translateY(15px)" },
              "100%": { transform: "translateY(0px)" },
            },
          }}
        />
      ))}

      {/* HEADER */}
      <Typography
        variant="h4"
        fontWeight={800}
        mb={3}
        sx={{
          color: "#FF0000",
          textShadow: "0 0 15px rgba(255,0,0,0.4)",
          position: "relative",
          zIndex: 3,
        }}
      >
        ✈️ Available Flights
      </Typography>

      {/* MAIN CARD */}
      <Card
        sx={{
          borderRadius: 4,
          background: "rgba(20,20,20,0.55)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(255,0,0,0.25)",
          boxShadow: "0 4px 35px rgba(255,0,0,0.2)",
          position: "relative",
          zIndex: 3,
        }}
      >
        <CardContent>
          {loading ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              minHeight="40vh"
            >
              <CircularProgress sx={{ color: "#FF0000" }} />
            </Box>
          ) : flights.length === 0 ? (
            <Typography textAlign="center" mt={4} color="#ccc">
              No flights available at the moment.
            </Typography>
          ) : (
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow
                  sx={{
                    "& th": {
                      color: "#FF4444",
                      fontWeight: 700,
                      fontSize: "1rem",
                      borderBottom: "1px solid rgba(255,0,0,0.3)",
                    },
                  }}
                >
                  <TableCell>Flight No.</TableCell>
                  <TableCell>Origin</TableCell>
                  <TableCell>Destination</TableCell>
                  <TableCell>Departure</TableCell>
                  <TableCell>Arrival</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {flights.map((flight) => (
                  <TableRow
                    key={flight.id}
                    sx={{
                      "& td": {
                        color: "rgba(255,255,255,0.85)",
                        borderBottom: "1px solid rgba(255,0,0,0.15)",
                      },
                      "&:hover": {
                        background: "rgba(255,0,0,0.08)",
                        transition: "0.3s",
                      },
                    }}
                  >
                    <TableCell>{flight.flight_number}</TableCell>
                    <TableCell>{flight.origin}</TableCell>
                    <TableCell>{flight.destination}</TableCell>
                    <TableCell>
                      {new Date(flight.departure_time).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {new Date(flight.arrival_time).toLocaleString()}
                    </TableCell>
                    <TableCell>₹{flight.price}</TableCell>
                    <TableCell>{flight.status}</TableCell>

                    <TableCell>
                      <Button
                        variant="contained"
                        size="small"
                        sx={{
                          borderRadius: 2,
                          textTransform: "none",
                          fontWeight: 700,
                          background: "#FF0000",
                          boxShadow: "0 4px 15px rgba(255,0,0,0.4)",
                          "&:hover": {
                            background: "#FF3333",
                            transform: "scale(1.05)",
                          },
                          transition: "0.2s",
                        }}
                        onClick={() => handleBookFlight(flight)}
                      >
                        Book
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Flights;
