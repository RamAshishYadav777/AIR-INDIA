import React from "react";
import { Box, Typography } from "@mui/material";
import { motion } from "framer-motion";
import logo from "../../assets/logo.png"; // Ensure this path is correct

const LoadingScreen: React.FC = () => {
  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        bgcolor: "#000000",
        zIndex: 9999,
        overflow: "hidden",
      }}
    >
      {/* Background Decor: Abstract Red Swoosh */}
      <Box
        component={motion.div}
        initial={{ opacity: 0, x: -100 }}
        animate={{ opacity: 0.15, x: 0 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        sx={{
          position: "absolute",
          width: "120%",
          height: "40%",
          bgcolor: "#b71c1c",
          transform: "rotate(-15deg)",
          top: "-10%",
          zIndex: 0,
          borderRadius: "50%",
        }}
      />

      <Box
        component={motion.div}
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 0.15, x: 0 }}
        transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
        sx={{
          position: "absolute",
          width: "120%",
          height: "40%",
          bgcolor: "#b71c1c",
          transform: "rotate(-15deg)",
          bottom: "-10%",
          zIndex: 0,
          borderRadius: "50%",
        }}
      />

      {/* Main Content Container */}
      <Box
        sx={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* Pulsing Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            duration: 0.8,
            ease: "easeOut",
          }}
        >
          <motion.img
            src={logo}
            alt="Air India"
            style={{
              width: "180px",
              height: "auto",
              objectFit: "contain",
              marginBottom: "20px",
            }}
            animate={{
              y: [0, -10, 0], // Floating effect
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>

        {/* Loading Spinner / Progress Bar */}
        <Box
          sx={{
            width: "200px",
            height: "4px",
            bgcolor: "#333",
            borderRadius: "2px",
            overflow: "hidden",
            mt: 4,
            position: "relative",
          }}
        >
          <Box
            component={motion.div}
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{
              repeat: Infinity,
              duration: 1.5,
              ease: "easeInOut",
            }}
            sx={{
              width: "50%",
              height: "100%",
              bgcolor: "#FFD700", // Gold
              borderRadius: "2px",
            }}
          />
        </Box>

        {/* Text */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <Typography
            variant="h6"
            sx={{
              mt: 3,
              color: "#D32F2F", // Air India Red
              fontWeight: 600,
              letterSpacing: 1.2,
              textTransform: "uppercase",
              fontSize: "0.9rem",
            }}
          >
            Welcome Aboard
          </Typography>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          <Typography
            variant="body2"
            sx={{
              mt: 1,
              color: "#999",
              fontSize: "0.8rem",
              fontStyle: "italic",
            }}
          >
            Preparing your journey...
          </Typography>
        </motion.div>
      </Box>
    </Box>
  );
};

export default LoadingScreen;
