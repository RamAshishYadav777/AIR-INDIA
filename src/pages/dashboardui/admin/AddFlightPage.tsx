import React, { useState } from "react";
import {
  Box,
  Button,
  Paper,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "../../../lib/supabase";
import { useForm } from "react-hook-form";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

interface FlightForm {
  flight_number: string;
  origin: string;
  destination: string;
  departure_date: string;
  departure_time: string;
  arrival_date: string;
  arrival_time: string;
  price: number;
}

const AddFlight: React.FC = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FlightForm>();

  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: FlightForm) => {
    setLoading(true);

    try {
      const departure = dayjs(
        `${data.departure_date}T${data.departure_time}`
      ).toISOString();
      const arrival = dayjs(
        `${data.arrival_date}T${data.arrival_time}`
      ).toISOString();

      const { error } = await supabase.from("flights").insert([
        {
          id: uuidv4(),
          flight_number: data.flight_number,
          origin: data.origin,
          destination: data.destination,
          departure_time: departure,
          arrival_time: arrival,
          price: data.price,
          status: "On Time",
        },
      ]);

      if (error) throw error;

      toast.success("✈️ Flight added successfully!");

      setTimeout(() => navigate("/dashboard/admin"), 1300);

      reset();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        px: 2,
        position: "relative",
        overflow: "hidden",
        background:
          "linear-gradient(135deg, #000000 0%, #0a0a0a 40%, #111111 100%)",
      }}
    >
      {/* Golden glow background orbs */}
      {[300, 400, 250].map((size, i) => (
        <Box
          key={i}
          sx={{
            position: "absolute",
            width: size,
            height: size,
            borderRadius: "50%",
            background: "radial-gradient(circle, #FFD700, transparent 70%)",
            opacity: 0.15,
            top: i === 0 ? "10%" : i === 1 ? "60%" : "30%",
            left: i === 0 ? "15%" : i === 1 ? "30%" : "70%",
            filter: "blur(140px)",
          }}
        />
      ))}

      {/* Animated runway beam */}
      <Box
        sx={{
          position: "absolute",
          width: "160px",
          height: "3px",
          top: "50%",
          left: "-200px",
          borderRadius: "50px",
          background:
            "linear-gradient(90deg,rgba(255,215,0,0),rgba(255,215,0,1))",
          animation: "planeTrail 8s linear infinite",
          "@keyframes planeTrail": {
            "0%": { left: "-200px", opacity: 0 },
            "10%": { opacity: 1 },
            "90%": { opacity: 1 },
            "100%": { left: "110%", opacity: 0 },
          },
        }}
      />

      {/* Glass Card */}
      <Paper
        elevation={12}
        sx={{
          width: 700,
          p: 5,
          borderRadius: 5,
          backdropFilter: "blur(20px)",
          background: "rgba(30, 30, 30, 0.65)",
          border: "1px solid rgba(255,215,0,0.3)",
          boxShadow: "0 8px 40px rgba(255, 215, 0, 0.15)",
          color: "#fff",
          animation: "float 5s ease-in-out infinite",
          "@keyframes float": {
            "0%,100%": { transform: "translateY(0)" },
            "50%": { transform: "translateY(-8px)" },
          },
        }}
      >
        <Typography
          variant="h4"
          textAlign="center"
          fontWeight={700}
          sx={{
            mb: 3,
            color: "#FFD700",
            textShadow: "0 0 12px rgba(255,215,0,0.3)",
          }}
        >
          ✈️ Add New Flight
        </Typography>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Box
            display="grid"
            gridTemplateColumns={{ xs: "1fr", sm: "1fr 1fr" }}
            gap={2}
          >
            {/* Flight Number */}
            <Box>
              <TextField
                label="Flight Number"
                fullWidth
                {...register("flight_number", { required: "Required" })}
                error={!!errors.flight_number}
                helperText={errors.flight_number?.message}
                InputLabelProps={{ style: { color: "#ccc" } }}
                InputProps={{
                  style: {
                    color: "#fff",
                    borderRadius: 12,
                    background: "rgba(255,255,255,0.08)",
                  },
                }}
              />
            </Box>

            {/* Origin */}
            <Box>
              <TextField
                label="Origin"
                fullWidth
                {...register("origin", { required: "Required" })}
                error={!!errors.origin}
                helperText={errors.origin?.message}
                InputLabelProps={{ style: { color: "#ccc" } }}
                InputProps={{
                  style: {
                    color: "#fff",
                    borderRadius: 12,
                    background: "rgba(255,255,255,0.08)",
                  },
                }}
              />
            </Box>

            {/* Destination */}
            <Box>
              <TextField
                label="Destination"
                fullWidth
                {...register("destination", { required: "Required" })}
                error={!!errors.destination}
                helperText={errors.destination?.message}
                InputLabelProps={{ style: { color: "#ccc" } }}
                InputProps={{
                  style: {
                    color: "#fff",
                    borderRadius: 12,
                    background: "rgba(255,255,255,0.08)",
                  },
                }}
              />
            </Box>

            {/* Price */}
            <Box>
              <TextField
                label="Price (₹)"
                type="number"
                fullWidth
                {...register("price", { required: "Required" })}
                error={!!errors.price}
                helperText={errors.price?.message}
                InputLabelProps={{ style: { color: "#ccc" } }}
                InputProps={{
                  style: {
                    color: "#fff",
                    borderRadius: 12,
                    background: "rgba(255,255,255,0.08)",
                  },
                }}
              />
            </Box>

            {/* Departure Date */}
            <Box>
              <TextField
                label="Departure Date"
                type="date"
                fullWidth
                {...register("departure_date", { required: "Required" })}
                error={!!errors.departure_date}
                helperText={errors.departure_date?.message}
                InputLabelProps={{ shrink: true, style: { color: "#ccc" } }}
                InputProps={{
                  style: {
                    color: "#fff",
                    borderRadius: 12,
                    background: "rgba(255,255,255,0.08)",
                  },
                }}
              />
            </Box>

            {/* Departure Time */}
            <Box>
              <TextField
                label="Departure Time"
                type="time"
                fullWidth
                {...register("departure_time", { required: "Required" })}
                error={!!errors.departure_time}
                helperText={errors.departure_time?.message}
                InputLabelProps={{ shrink: true, style: { color: "#ccc" } }}
                InputProps={{
                  style: {
                    color: "#fff",
                    borderRadius: 12,
                    background: "rgba(255,255,255,0.08)",
                  },
                }}
              />
            </Box>

            {/* Arrival Date */}
            <Box>
              <TextField
                label="Arrival Date"
                type="date"
                fullWidth
                {...register("arrival_date", { required: "Required" })}
                error={!!errors.arrival_date}
                helperText={errors.arrival_date?.message}
                InputLabelProps={{ shrink: true, style: { color: "#ccc" } }}
                InputProps={{
                  style: {
                    color: "#fff",
                    borderRadius: 12,
                    background: "rgba(255,255,255,0.08)",
                  },
                }}
              />
            </Box>

            {/* Arrival Time */}
            <Box>
              <TextField
                label="Arrival Time"
                type="time"
                fullWidth
                {...register("arrival_time", { required: "Required" })}
                error={!!errors.arrival_time}
                helperText={errors.arrival_time?.message}
                InputLabelProps={{ shrink: true, style: { color: "#ccc" } }}
                InputProps={{
                  style: {
                    color: "#fff",
                    borderRadius: 12,
                    background: "rgba(255,255,255,0.08)",
                  },
                }}
              />
            </Box>
          </Box>

          {/* Buttons */}
          <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
            <Button
              variant="outlined"
              sx={{
                borderColor: "#FFD700",
                color: "#FFD700",
                "&:hover": { background: "#FFD700", color: "#000" },
              }}
              onClick={() => navigate("/dashboard/admin")}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                bgcolor: "#FFD700",
                color: "#000",
                fontWeight: "bold",
                "&:hover": { bgcolor: "#ffcf33" },
              }}
              startIcon={loading ? <CircularProgress size={20} /> : undefined}
            >
              {loading ? "Saving..." : "Add Flight"}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default AddFlight;
