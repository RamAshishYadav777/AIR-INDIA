import React from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";

interface StatCardProps {
  title: string;
  value: string | number;
}

const StatCard: React.FC<StatCardProps> = ({ title, value }) => {
  return (
    <Card
      sx={{
        borderTop: "4px solid #FFD700",
        borderRadius: 3,
        boxShadow: 3,
        transition: "0.3s",
        "&:hover": {
          transform: "translateY(-5px)",
          boxShadow: 6,
        },
      }}
    >
      <CardContent>
        <Typography color="textSecondary" fontWeight="bold">
          {title}
        </Typography>
        <Box mt={1}>
          <Typography variant="h5" fontWeight="bold">
            {value}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatCard;
