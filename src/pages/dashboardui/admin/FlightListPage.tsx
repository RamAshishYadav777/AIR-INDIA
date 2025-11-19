import React from "react";
import { Box, Typography, Paper } from "@mui/material";
import FlightTable from "./FlightTable";

const FlightListPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" mb={2}>
        ✈️ All Flights
      </Typography>

      <Paper sx={{ p: 2, borderRadius: 3 }}>
        <FlightTable />   {/* Reused component */}
      </Paper>
    </Box>
  );
};

export default FlightListPage;
