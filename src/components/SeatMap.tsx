// STATIC Boeing 787 SeatMap (View Only)
// src/components/SeatMap.tsx

import React from "react";
import { Box, Typography } from "@mui/material";

const SeatMap: React.FC = () => {
  // Boeing 787 Layout
  const businessRows = [1, 2, 3, 4];
  const premiumRows = [5, 6];
  const economyRows = Array.from({ length: 20 }, (_, i) => i + 7);

  const businessLayout = ["A", "D", "G", "K"]; // 1-2-1
  const premiumLayout = ["A", "B", "D", "E", "F", "G", "J"]; // 2-3-2
  const economyLayout = ["A", "B", "C", "D", "E", "F", "G", "H", "J"]; // 3-3-3

  const renderRow = (
    row: number,
    layout: string[],
    cabin: "business" | "premium" | "economy"
  ) => {
    return (
      <Box
        key={row}
        display="flex"
        justifyContent="center"
        gap={cabin === "business" ? 4 : 2}
        mb={1}
      >
        {layout.map((col) => {
          const id = `${row}${col}`;

          return (
            <Box
              key={id}
              sx={{
                width: cabin === "business" ? 50 : 40,
                height: cabin === "business" ? 50 : 40,
                borderRadius: 2,
                bgcolor:
                  cabin === "business"
                    ? "#1f4cb7"
                    : cabin === "premium"
                    ? "#c68b00"
                    : "#4cb7a7",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                userSelect: "none",
                cursor: "default",
              }}
            >
              {id}
            </Box>
          );
        })}
      </Box>
    );
  };

  return (
    <Box textAlign="center" mt={2} pb={6}>
      {/* New Clean Heading */}
      <Typography
        variant="h4"
        fontWeight={800}
        mb={4}
        sx={{
          color: "#b30000",
          textTransform: "uppercase",
          letterSpacing: 1,
        }}
      >
        Air India — Aircraft Seat Map
      </Typography>

      {/* Color Guide */}
      <Box mb={4}>
        <Typography fontWeight={700}>Seat Legend</Typography>
        <Box display="flex" justifyContent="center" gap={3} mt={1}>
          <Box display="flex" alignItems="center" gap={1}>
            <Box sx={{ width: 18, height: 18, bgcolor: "#1f4cb7", borderRadius: 1 }} />
            <Typography>Business Class</Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Box sx={{ width: 18, height: 18, bgcolor: "#c68b00", borderRadius: 1 }} />
            <Typography>Premium Economy</Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Box sx={{ width: 18, height: 18, bgcolor: "#4cb7a7", borderRadius: 1 }} />
            <Typography>Economy</Typography>
          </Box>
        </Box>
      </Box>

      {/* Business */}
      <Typography fontWeight={700} mt={2} mb={1}>
        Business Class – 1-2-1 Layout
      </Typography>
      {businessRows.map((row) => renderRow(row, businessLayout, "business"))}

      {/* Premium */}
      <Typography fontWeight={700} mt={3} mb={1}>
        Premium Economy – 2-3-2 Layout
      </Typography>
      {premiumRows.map((row) => renderRow(row, premiumLayout, "premium"))}

      {/* Economy */}
      <Typography fontWeight={700} mt={3} mb={1}>
        Economy Class – 3-3-3 Layout
      </Typography>
      {economyRows.map((row) => renderRow(row, economyLayout, "economy"))}
    </Box>
  );
};

export default SeatMap;
