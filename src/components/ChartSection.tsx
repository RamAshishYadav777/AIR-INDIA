import React from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ChartData {
  name: string;
  revenue: number;
}

interface ChartSectionProps {
  data: ChartData[];
}

const ChartSection: React.FC<ChartSectionProps> = ({ data }) => {
  return (
    <Card
      sx={{
        mt: 4,
        borderRadius: 4,
        boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
        background: "linear-gradient(135deg, #fff 0%, #f9f9f9 100%)",
        border: "1px solid rgba(0,0,0,0.05)",
      }}
    >
      <CardContent sx={{ p: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h6" fontWeight="bold" sx={{ color: "#333" }}>
            Revenue Analytics 📈
          </Typography>
          <Box
            sx={{
              px: 2,
              py: 0.5,
              bgcolor: "rgba(255, 215, 0, 0.15)",
              borderRadius: "20px",
              color: "#b8860b",
              fontWeight: "bold",
              fontSize: "0.85rem",
            }}
          >
            Last 7 Days
          </Box>
        </Box>

        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#d2691e" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#d2691e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#888", fontSize: 12 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#888", fontSize: 12 }}
              tickFormatter={(value) => `₹${value / 1000}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                borderRadius: "12px",
                border: "none",
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              }}
              formatter={(value: number) => [`₹${value.toLocaleString()}`, "Revenue"]}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#d2691e"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorRevenue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default ChartSection;
