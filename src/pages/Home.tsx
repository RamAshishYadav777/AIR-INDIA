import React from "react";
import { Box, Container, Divider, keyframes } from "@mui/material";
import HomeBanner from "../components/HomeBanner";
import SearchFlights from "./SearchFlights";
import PopularRoutes from "./homepage/PopularRoutes";

import { motion } from "framer-motion";
import Services from "./homepage/Services";

// ✨ Animations
const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay },
  }),
};

const goldenGlow = keyframes`
  0%, 100% { opacity: 0.5; box-shadow: 0 0 8px rgba(255,215,0,0.4); }
  50% { opacity: 1; box-shadow: 0 0 25px rgba(255,215,0,0.8); }
`;

const Home: React.FC = () => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: `
          radial-gradient(
            circle at top left,
            rgba(255, 215, 0, 0.08),
            transparent 40%
          ),
          linear-gradient(180deg, #000000 0%, #0a0a0a 50%, #111111 100%)
        `,
        color: "#fff",
        overflowX: "hidden",
      }}
    >
      {/* 🛫 Banner Section */}
      <motion.div variants={fadeIn} initial="hidden" animate="visible" custom={0}>
        <Box>
          <HomeBanner />
        </Box>
      </motion.div>

      {/* ✈️ Search Flights Section */}
      <motion.div
        variants={fadeIn}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        custom={0.2}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              mb: { xs: 6, md: 8 },
              py: { xs: 3, md: 4 },
              background:
                "linear-gradient(180deg, rgba(255,215,0,0.08) 0%, rgba(20,20,20,0.8) 100%)",
              borderRadius: "18px",
              border: "1px solid rgba(255,215,0,0.25)",
              backdropFilter: "blur(8px)",
              boxShadow: "0 0 20px rgba(255,215,0,0.15)",
            }}
          >
            <SearchFlights />
          </Box>
        </Container>
      </motion.div>

      {/* ✨ Divider */}
      <Divider
        sx={{
          width: "60%",
          mx: "auto",
          borderColor: "rgba(255,215,0,0.4)",
          mb: 8,
          animation: `${goldenGlow} 6s ease-in-out infinite`,
        }}
      />

      {/* 💼 Services Section  */}
      <motion.div
        variants={fadeIn}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        custom={0.4}
      >
        <Container maxWidth="lg">
          <Box sx={{ mb: { xs: 6, md: 8 } }}>
            <Services />
          </Box>
        </Container>
      </motion.div>

      {/* 🌏 Popular Routes */}
      <motion.div
        variants={fadeIn}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        custom={0.6}
      >
        <Container maxWidth="lg">
          <Box sx={{ mb: { xs: 6, md: 8 } }}>
            <PopularRoutes />
          </Box>
        </Container>
      </motion.div>

      {/* ✨ Divider
      <Divider
        sx={{
          width: "60%",
          mx: "auto",
          borderColor: "rgba(255,215,0,0.4)",
          mb: 8,
          animation: `${goldenGlow} 6s ease-in-out infinite`,
        }}
      />

      {/* 💰 Special Offers
      <motion.div
        variants={fadeIn}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        custom={0.8}
      > */}
        {/* <Container maxWidth="lg">
          <Box
            sx={{
              mb: { xs: 8, md: 10 },
              pb: { xs: 4, md: 6 },
              borderRadius: "18px",
              border: "1px solid rgba(255,215,0,0.25)",
              background:
                "linear-gradient(180deg, rgba(255,215,0,0.08) 0%, rgba(20,20,20,0.8) 100%)",
              boxShadow: "0 0 25px rgba(255,215,0,0.15)",
            }}
          >
            <SpecialOffers />
          </Box>
        </Container> */}
      {/* </motion.div> */}
    </Box>
  );
};

export default Home;
