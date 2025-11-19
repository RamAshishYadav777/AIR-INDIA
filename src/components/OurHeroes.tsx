// OurHeroes.tsx

import { Box, Typography, Grid, Avatar, Paper, Stack } from "@mui/material";
import { motion } from "framer-motion";

// ⭐ IMPORT YOUR CREW IMAGES
import crew1 from "../assets/crew/crew1.jpg";
import crew2 from "../assets/crew/crew2.jpg";
import crew3 from "../assets/crew/crew3.jpg";
import crew4 from "../assets/crew/crew4.jpg";
import crew5 from "../assets/crew/crew5.jpg";
import crew6 from "../assets/crew/crew6.jpg";
import crew7 from "../assets/crew/crew7.jpg";
import crew8 from "../assets/crew/crew8.jpg";
import crew9 from "../assets/crew/crew9.jpg";
import crew10 from "../assets/crew/crew10.jpg";

// ⭐ Add more when available
// import crew11 from "../assets/crew/crew11.jpg";
// import crew12 from "../assets/crew/crew12.jpg";

const crew = [
  { name: "Crew Member 1", img: crew1 },
  { name: "Crew Member 2", img: crew2 },
  { name: "Crew Member 3", img: crew3 },
  { name: "Crew Member 4", img: crew4 },
  { name: "Crew Member 5", img: crew5 },
  { name: "Crew Member 6", img: crew6 },
  { name: "Crew Member 7", img: crew7 },
  { name: "Crew Member 8", img: crew8 },
  { name: "Crew Member 9", img: crew9 },
  { name: "Crew Member 10", img: crew10 },
];

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function OurHeroes() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #000 0%, #0c0c0c 100%)",
        color: "#fff",
        p: { xs: 3, md: 6 },
      }}
    >
      {/* Header */}
      <Box sx={{ textAlign: "center", mb: 3 }}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            textShadow: "0 0 12px rgba(255,255,255,0.25)",
          }}
        >
          Our Heroes ✈️
        </Typography>

        <Typography
          variant="h6"
          sx={{
            color: "rgba(255,255,255,0.75)",
            maxWidth: 760,
            mx: "auto",
            mt: 1,
            lineHeight: 1.6,
          }}
        >
          In loving memory of the brave Air India crew members of the Ahmedabad
          flight. Their courage, dedication and sacrifice shall forever be
          honoured.
        </Typography>
      </Box>

      {/* Candle + text */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: "center",
          justifyContent: "center",
          mb: 6,
          gap: 4,
        }}
      >
        {/* Candle */}
        <Box
          sx={{
            position: "relative",
            width: 110,
            height: 200,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
          }}
        >
          {/* Candle Body */}
          <Box
            sx={{
              width: 50,
              height: 120,
              background:
                "linear-gradient(180deg, rgba(255,220,150,0.05), rgba(255,180,60,0.05))",
              borderRadius: 2,
              position: "absolute",
              bottom: 0,
              border: "1px solid rgba(255,255,255,0.05)",
              boxShadow:
                "inset 0 4px 12px rgba(255,170,60,0.06), 0 6px 20px rgba(0,0,0,0.5)",
            }}
          />

          {/* Wick */}
          <Box
            sx={{
              width: 6,
              height: 14,
              background: "#222",
              bottom: 120,
              position: "absolute",
              borderRadius: 1,
            }}
          />

          {/* Flame */}
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              y: [0, -5, 0],
              rotate: [0, 2, -2, 0],
            }}
            transition={{ repeat: Infinity, duration: 1.4 }}
            style={{
              position: "absolute",
              bottom: 135,
              width: 20,
              height: 32,
              borderRadius: "50% 50% 45% 45%",
              background:
                "radial-gradient(circle at 50% 30%, #fff7cc, #ffd36b 40%, #ffb236 70%, rgba(255,150,40,0.9) 90%)",
              filter: "blur(0px)",
            }}
          />

          {/* Glow */}
          <Box
            sx={{
              position: "absolute",
              bottom: 120,
              width: 160,
              height: 160,
              background:
                "radial-gradient(circle, rgba(255,200,80,0.18), rgba(255,140,40,0.07), transparent 70%)",
              borderRadius: "50%",
              pointerEvents: "none",
            }}
          />
        </Box>

        {/* Side Text */}
        <Typography
          variant="body1"
          sx={{
            maxWidth: 600,
            color: "rgba(255,255,255,0.75)",
            textAlign: { xs: "center", md: "left" },
            lineHeight: 1.6,
          }}
        >
          In memory of our brave crew, whose courage, dedication, and compassion
          will forever be remembered. Their service and sacrifice remain etched
          in our hearts, never to be forgotten. In memory of our brave crew,
          whose courage and dedication will always be remembered. May their
          souls rest in peace.
        </Typography>
      </Box>

      {/* Crew Cards */}
      <Box
        component={motion.div}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Grid container spacing={4} justifyContent="center">
          {crew.map((c, i) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
              <motion.div variants={cardVariants}>
                <Paper
                  component={motion.div}
                  whileHover={{ scale: 1.05, y: -6 }}
                  transition={{ type: "spring", stiffness: 180, damping: 14 }}
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
                    border: "1px solid rgba(255,255,255,0.05)",
                    backdropFilter: "blur(8px)",
                    textAlign: "center",
                    minHeight: 240,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    boxShadow: "0 8px 20px rgba(0,0,0,0.4)",
                  }}
                >
                  <Stack spacing={1} alignItems="center">
                    <Avatar
                      src={c.img}
                      alt={c.name}
                      component={motion.div}
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 150 }}
                      sx={{
                        width: 180,
                        height: 220,
                        borderRadius: "12px",
                        background: "rgba(255,255,255,0.04)",
                        border: "2px solid rgba(255,255,255,0.1)",
                        padding: "6px",

                        // 🔥 FULL-VISIBLE IMAGE — NO CROPPING EVER
                        objectFit: "contain",

                        // Allow full image aspect ratio
                        img: {
                          objectFit: "contain !important",
                        },

                        boxShadow: "0 4px 18px rgba(0,0,0,0.6)",
                        transition: "0.3s ease",
                        "&:hover": {
                          boxShadow: "0 0 22px rgba(255,200,60,0.55)",
                          borderColor: "rgba(255,200,60,0.5)",
                        },
                      }}
                    />

                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {/* {c.name} */}
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{ color: "rgba(255,255,255,0.6)" }}
                    >
                      Forever Remembered
                    </Typography>
                  </Stack>

                  <Typography
                    variant="caption"
                    sx={{ color: "rgba(255,255,255,0.35)", mt: 1 }}
                  >
                    In Our Hearts ✨
                  </Typography>
                </Paper>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Box sx={{ textAlign: "center", mt: 6 }}>
        <Typography
          variant="caption"
          sx={{ color: "rgba(255,255,255,0.45)" }}
        ></Typography>
      </Box>
    </Box>
  );
}
