import React, { useState, useMemo } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  Autocomplete,
  ToggleButtonGroup,
  ToggleButton,
  Divider,
  Avatar,
  Stack,
} from "@mui/material";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import airportsRaw from "../data/airports.json";


/* ---------------- Interfaces ---------------- */
interface Airport {
  iata: string;
  name: string;
  city: string;
  country: string;
}

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

/* ---------------- Data ---------------- */
const allAirports: Airport[] = Object.values(airportsRaw as any).map((a: any) => ({
  iata: a.iata,
  name: a.name,
  city: a.city,
  country: a.country,
}));

/* ---------------- Animations (used inside sx via string templates) ---------------- */
const backgroundAnim = `@keyframes bgShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}`;

const glowSpinKeyframes = `@keyframes spinGlow {
  0% { transform: rotate(0deg) scale(1); }
  50% { transform: rotate(180deg) scale(1.06); }
  100% { transform: rotate(360deg) scale(1); }
}`;

const planeTrailKeyframes = `@keyframes planeTrail {
  0% { left: -180px; opacity: 0; transform: translateY(-6px); }
  10% { opacity: 1; transform: translateY(0); }
  90% { left: 110%; opacity: 1; transform: translateY(0); }
  100% { left: 110%; opacity: 0; transform: translateY(6px); }
}`;

const floatKeyframes = `@keyframes floatCard {
  0%,100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}`;

const underlineGlowKeyframes = `@keyframes underlineGlow {
  0% { width: 0; opacity: 0; }
  40% { width: 100%; opacity: 1; }
  100% { width: 0; opacity: 0; }
}`;

/* ---------------- Component ---------------- */
const SearchFlights: React.FC = () => {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(false);
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [tripType, setTripType] = useState<"oneway" | "roundtrip">("oneway");
  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const navigate = useNavigate();

  /* ---------------- Airports ---------------- */
  const filteredAirports = useMemo(() => {
    const uniqueMap = new Map();

    allAirports.forEach((a) => {
      if (a.iata && a.city && a.country) {
        // overwrite duplicates automatically
        uniqueMap.set(a.iata, {
          label: `${a.city} (${a.iata}) - ${a.country}`,
          iata: a.iata,
        });
      }
    });

    return Array.from(uniqueMap.values());
  }, []);


  /* ---------------- Search Flights ---------------- */
  const handleSearch = async () => {
    if (!origin || !destination) {
      alert("Please select both origin and destination airports.");
      return;
    }

    setLoading(true);
    try {
      let query: any = supabase.from("flights").select("*");

       query = query.eq("origin", origin.toUpperCase());
      
        query = query.eq("destination", destination.toUpperCase());




      // if (origin) query = query.ilike("origin", `%${origin}%`);
      // if (destination) query = query.ilike("destination", `%${destination}%`);

      // if (departureDate) {
      //   const start = new Date(departureDate);
      //   const end = new Date(departureDate);
      //   end.setHours(23, 59, 59, 999);
      //   query = query
      //     .gte("departure_time", start.toISOString())
      //     .lte("departure_time", end.toISOString());
      // }

      if (departureDate) {
        query = query.eq("flight_date", departureDate);
      }


      const { data, error } = await query.order("departure_time", { ascending: true });
      if (error) throw error;

      setFlights(data || []);
    } catch (err) {
      console.error("❌ Error searching flights:", err);
      alert("Error searching flights. See console for details.");
    } finally {
      setLoading(false);
    }
  };

  const handleSwap = () => {
    setOrigin(destination);
    setDestination(origin);
  };

  const handleBookFlight = (flightId: string) => {
    navigate(`/booking?flight=${flightId}`);
  };

  /* ---------------- UI ---------------- */
  return (
    <Box
      sx={{
        minHeight: "100vh",
        position: "relative",
        px: 2,
        py: 6,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        background:
          "linear-gradient(135deg, #000000 0%, #0a0a0a 40%, #111111 100%)",
      }}
    >
      {/* Inject keyframes into page via sx hack */}
      <style>
        {backgroundAnim +
          glowSpinKeyframes +
          planeTrailKeyframes +
          floatKeyframes +
          underlineGlowKeyframes}
      </style>

      {/* Golden aura orbs (like AdminLogin) */}
      {[
        { size: 320, top: "6%", left: "10%", delay: "0s", opacity: 0.16 },
        { size: 420, bottom: "6%", right: "6%", delay: "6s", opacity: 0.12 },
        { size: 220, top: "62%", left: "28%", delay: "12s", opacity: 0.1 },
      ].map((orb, i) => (
        <Box
          key={i}
          sx={{
            position: "absolute",
            width: orb.size,
            height: orb.size,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255,215,0,0.95), rgba(255,215,0,0.25) 40%, transparent 60%)",
            opacity: orb.opacity,
            top: orb.top,
            left: orb.left,
            bottom: orb.bottom,
            right: orb.right,
            filter: "blur(140px)",
            animation: `spinGlow 36s linear infinite ${orb.delay}`,
            zIndex: 0,
          }}
        />
      ))}

      {/* Animated airplane trail */}
      <Box
        sx={{
          position: "absolute",
          width: "160px",
          height: "4px",
          background:
            "linear-gradient(90deg, rgba(255,215,0,0), rgba(255,215,0,1))",
          top: "48%",
          left: "-200px",
          borderRadius: "50%",
          animation: "planeTrail 9s linear infinite",
          transform: "rotate(-2deg)",
          zIndex: 1,
          filter: "blur(0.6px)",
        }}
      />

      {/* Header (matching AdminLogin) */}
      <Stack alignItems="center" spacing={1} mb={3} sx={{ zIndex: 2 }}>
        <Avatar
          sx={{
            bgcolor: "#FFD700",
            width: 64,
            height: 64,
            boxShadow: "0 6px 24px rgba(255,215,0,0.45)",
          }}
        >
          <FlightTakeoffIcon sx={{ fontSize: 34, color: "#000" }} />
        </Avatar>

        <Typography
          variant="h4"
          fontWeight={800}
          sx={{
            color: "#FFD700",
            textShadow: "0 0 10px rgba(255,215,0,0.25)",
            letterSpacing: 0.6,
            zIndex: 2,
          }}
        >
          Search Flights
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: "rgba(255,255,255,0.78)",
            textAlign: "center",
            maxWidth: 700,
          }}
        >
          Find the best flights — securely and quickly. Premium UI inspired by
          admin theme: glass card, golden accents and subtle motion.
        </Typography>
      </Stack>

      <Divider
        sx={{
          width: 220,
          height: 3,
          borderRadius: 2,
          mb: 3,
          background: "linear-gradient(90deg, #FFD700, #9B111E, #FFD700)",
          zIndex: 2,
        }}
      />

      {/* Search Card (glass-like) */}
      <Card
        sx={{
          width: "100%",
          maxWidth: 1200,
          borderRadius: 3,
          p: { xs: 3, md: 5 },
          mb: 4,
          zIndex: 2,
          color: "#fff",
          background: "rgba(30,30,30,0.62)",
          border: "1px solid rgba(255,215,0,0.12)",
          backdropFilter: "blur(12px)",
          boxShadow:
            "0 12px 40px rgba(0,0,0,0.6), 0 6px 30px rgba(155,17,30,0.08)",
          animation: "floatCard 6s ease-in-out infinite",
          position: "relative",
          overflow: "visible",
        }}
      >
        <CardContent sx={{ p: 0 }}>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 2.5,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Origin */}
            <Box
              sx={{
                flexBasis: { xs: "100%", md: "28%" },
                position: "relative",
              }}
            >
              <Autocomplete
                disablePortal
                options={filteredAirports}
                getOptionLabel={(option) => option.label}
                onChange={(_, v) => setOrigin(v ? v.iata : "")}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Origin Airport"
                    variant="filled"
                    fullWidth
                    InputLabelProps={{ style: { color: "#d0c9b0" } }}
                    sx={{
                      "& .MuiFilledInput-root": {
                        background: "rgba(255,255,255,0.03)",
                        color: "#fff",
                        borderRadius: 1.5,
                        "&:hover": { background: "rgba(255,255,255,0.05)" },
                        "&.Mui-focused": {
                          boxShadow: "0 0 0 2px rgba(255,215,0,0.06)",
                        },
                        "& .MuiFilledInput-input": { color: "#fff" },
                      },
                      "& .MuiInputLabel-root.Mui-focused": { color: "#FFD700" },
                    }}
                  />
                )}
              />
              <Box
                sx={{
                  position: "absolute",
                  bottom: -6,
                  left: 6,
                  right: 6,
                  height: 3,
                  borderRadius: 2,
                  background: "linear-gradient(90deg,#FFD700,#FF8C00,#FFD700)",
                  animation: "underlineGlow 3s ease-in-out infinite",
                  opacity: 0.95,
                }}
              />
            </Box>

            {/* Swap */}
            <Box
              sx={{
                flexBasis: { xs: "100%", md: "6%" },
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Button
                onClick={handleSwap}
                variant="outlined"
                sx={{
                  minWidth: 44,
                  height: 44,
                  p: 0,
                  borderRadius: "50%",
                  borderColor: "rgba(255,215,0,0.18)",
                  color: "#FFD700",
                  bgcolor: "transparent",
                  "&:hover": { bgcolor: "rgba(255,215,0,0.06)" },
                }}
              >
                🔄
              </Button>
            </Box>

            {/* Destination */}
            <Box
              sx={{
                flexBasis: { xs: "100%", md: "28%" },
                position: "relative",
              }}
            >
              <Autocomplete
                disablePortal
                options={filteredAirports}
                getOptionLabel={(option) => option.label}
                onChange={(_, v) =>
                  setDestination(v ? v.iata: "")
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Destination Airport"
                    variant="filled"
                    fullWidth
                    InputLabelProps={{ style: { color: "#d0c9b0" } }}
                    sx={{
                      "& .MuiFilledInput-root": {
                        background: "rgba(255,255,255,0.03)",
                        color: "#fff",
                        borderRadius: 1.5,
                        "&:hover": { background: "rgba(255,255,255,0.05)" },
                        "&.Mui-focused": {
                          boxShadow: "0 0 0 2px rgba(155,17,30,0.06)",
                        },
                        "& .MuiFilledInput-input": { color: "#fff" },
                      },
                      "& .MuiInputLabel-root.Mui-focused": { color: "#9B111E" },
                    }}
                  />
                )}
              />
              <Box
                sx={{
                  position: "absolute",
                  bottom: -6,
                  left: 6,
                  right: 6,
                  height: 3,
                  borderRadius: 2,
                  background: "linear-gradient(90deg,#FFD700,#FF8C00,#FFD700)",
                  animation: "underlineGlow 3s ease-in-out infinite",
                }}
              />
            </Box>

            {/* Dates */}
            <Box sx={{ flexBasis: { xs: "100%", md: "16%" } }}>
              <TextField
                label="Departure"
                type="date"
                variant="filled"
                fullWidth
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                InputLabelProps={{ shrink: true, style: { color: "#d0c9b0" } }}
                sx={{
                  "& .MuiFilledInput-root": {
                    background: "rgba(255,255,255,0.03)",
                    color: "#fff",
                    borderRadius: 1.5,
                    "& .MuiFilledInput-input": { color: "#fff" },
                  },
                }}
              />
            </Box>

            {tripType === "roundtrip" && (
              <Box sx={{ flexBasis: { xs: "100%", md: "16%" } }}>
                <TextField
                  label="Return"
                  type="date"
                  variant="filled"
                  fullWidth
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  InputLabelProps={{
                    shrink: true,
                    style: { color: "#d0c9b0" },
                  }}
                  sx={{
                    "& .MuiFilledInput-root": {
                      background: "rgba(255,255,255,0.03)",
                      color: "#fff",
                      borderRadius: 1.5,
                      "& .MuiFilledInput-input": { color: "#fff" },
                    },
                  }}
                />
              </Box>
            )}

            {/* Search Button */}
            <Box sx={{ flexBasis: "100%", textAlign: "center", mt: 2 }}>
              <Button
                onClick={handleSearch}
                variant="contained"
                disabled={loading}
                sx={{
                  px: 6,
                  py: 1.2,
                  borderRadius: 2,
                  bgcolor: "#FFD700",
                  color: "#000",
                  fontWeight: 700,
                  boxShadow: "0 10px 30px rgba(255,215,0,0.18)",
                  "&:hover": {
                    bgcolor: "#ffdd57",
                    transform: "translateY(-3px)",
                  },
                }}
              >
                {loading ? "Searching..." : "Search Flights"}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Results area */}
      {loading ? (
        <Box display="flex" justifyContent="center" mt={4} sx={{ zIndex: 2 }}>
          <CircularProgress sx={{ color: "#FFD700" }} />
        </Box>
      ) : flights.length > 0 ? (
        <Card
          sx={{
            width: "100%",
            maxWidth: 1200,
            borderRadius: 3,
            p: 0,
            zIndex: 2,
            background: "rgba(18,18,18,0.72)",
            border: "1px solid rgba(255,215,0,0.06)",
            boxShadow: "0 12px 30px rgba(0,0,0,0.6)",
          }}
        >
          <CardContent>
            <Table>
              <TableHead>
                <TableRow
                  sx={{ background: "linear-gradient(90deg,#9B111E,#5a060a)" }}
                >
                  {[
                    "Flight No.",
                    "Origin",
                    "Destination",
                    "Departure",
                    "Arrival",
                    "Price",
                    "Action",
                  ].map((h, i) => (
                    <TableCell key={i} sx={{ color: "#fff", fontWeight: 700 }}>
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {flights.map((f) => (
                  <TableRow
                    key={f.id}
                    hover
                    sx={{ "&:hover": { background: "rgba(255,215,0,0.03)" } }}
                  >
                    <TableCell sx={{ color: "#fff" }}>
                      {f.flight_number}
                    </TableCell>
                    <TableCell sx={{ color: "#fff" }}>{f.origin}</TableCell>
                    <TableCell sx={{ color: "#fff" }}>
                      {f.destination}
                    </TableCell>
                    <TableCell sx={{ color: "#fff" }}>
                      {new Date(f.departure_time).toLocaleString()}
                    </TableCell>
                    <TableCell sx={{ color: "#fff" }}>
                      {new Date(f.arrival_time).toLocaleString()}
                    </TableCell>
                    <TableCell sx={{ color: "#FFD700", fontWeight: 700 }}>
                      ₹{f.price}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleBookFlight(f.id)}
                        sx={{
                          bgcolor: "#FFD700",
                          color: "#000",
                          "&:hover": { bgcolor: "#f2c500" },
                        }}
                      >
                        Book
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Typography
          textAlign="center"
          mt={4}
          color="rgba(255,255,255,0.85)"
          sx={{ zIndex: 2 }}
        >
          Your flight will appear here...
        </Typography>
      )}

      {/* Trip type toggles placed at bottom-right floating like admin controls */}
      <Box
        sx={{
          position: "fixed",
          right: 20,
          bottom: 24,
          zIndex: 3,
          display: "flex",
          alignItems: "center",
          gap: 1,
          background: "rgba(0,0,0,0.45)",
          border: "1px solid rgba(255,215,0,0.06)",
          backdropFilter: "blur(6px)",
          p: 1,
          borderRadius: 2,
        }}
      >
        <ToggleButtonGroup
          value={tripType}
          exclusive
          onChange={(_, v) => v && setTripType(v)}
          sx={{
            "& .MuiToggleButton-root": {
              color: "#FFD700",
              borderColor: "rgba(255,215,0,0.08)",
              "&.Mui-selected": {
                bgcolor: "#FFD700",
                color: "#000",
                fontWeight: 700,
              },
              "&:hover": { bgcolor: "rgba(155,17,30,0.14)", color: "#fff" },
            },
          }}
        >
          <ToggleButton value="oneway">One Way</ToggleButton>
          <ToggleButton value="roundtrip">Round Trip</ToggleButton>
        </ToggleButtonGroup>
      </Box>
    </Box>
  );
};

export default SearchFlights;
