import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../hooks/redux/hooks";
import { fetchFlights } from "../../../hooks/redux/slices/flightSlice";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Box,
  Button,
} from "@mui/material";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";

const FlightList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { list, loading, error } = useAppSelector((state) => state.flights);

  useEffect(() => {
    dispatch(fetchFlights());
  }, [dispatch]);

  if (loading)
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <CircularProgress />
      </Box>
    );

  if (error)
    return (
      <Typography color="error" textAlign="center">
        {error}
      </Typography>
    );

  return (
    <Grid container spacing={2} p={3}>
      {list.map((flight) => (
        <Grid key={flight.id} size={{ xs: 12, sm: 6, md: 4 }}>
          <Card sx={{ borderRadius: 3, boxShadow: 3, p: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold">
                ✈️ {flight.flight_number}
              </Typography>
              <Typography>From: {flight.origin}</Typography>
              <Typography>To: {flight.destination}</Typography>
              <Typography>
                {/* Date: {new Date(flight.date).toLocaleDateString()} */}
                Date: {new Date(flight.departure_time).toLocaleDateString()}
              </Typography>
              <Typography>Price: ₹{flight.price}</Typography>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                startIcon={<FlightTakeoffIcon />}
                sx={{ mt: 2 }}
              >
                Book Now
              </Button>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default FlightList;
