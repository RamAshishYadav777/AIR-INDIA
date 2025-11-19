import React from "react";
import { Card, CardContent, Typography } from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "Mon", revenue: 4000 },
  { name: "Tue", revenue: 3000 },
  { name: "Wed", revenue: 5000 },
  { name: "Thu", revenue: 4780 },
  { name: "Fri", revenue: 5890 },
  { name: "Sat", revenue: 6390 },
  { name: "Sun", revenue: 7490 },
];

const ChartSection: React.FC = () => {
  return (
    <Card sx={{ mt: 4, borderRadius: 3, boxShadow: 4 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Weekly Revenue Overview
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#B22222"
              strokeWidth={3}
              dot={{ r: 5 }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default ChartSection;
