import React, { useState } from "react";
import Slider from "react-slick";
import type { Settings } from "react-slick";
import {
  Box,
  Typography,
  keyframes,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial, Stars } from "@react-three/drei";
import { motion } from "framer-motion";
import * as THREE from "three";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import AI1 from "../assets/AI1.png";
import AI2 from "../assets/AI2.png";
import AI3 from "../assets/AI3.png";
import AI4 from "../assets/AI4.png";
import AI5 from "../assets/AI5.png";
import AI6 from "../assets/AI6.png";
import AIANB from "../assets/AIANB.png";

/* ---------------- ANIMATIONS ---------------- */

const goldSweep = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const colorCycle = keyframes`
  0% { --ai-glow: rgba(255,215,0,0.28); --ai-accent: rgba(178,34,34,0.12); }
  33% { --ai-glow: rgba(255,200,50,0.32); --ai-accent: rgba(255,99,71,0.12); }
  66% { --ai-glow: rgba(255,215,0,0.22); --ai-accent: rgba(255,140,0,0.10); }
  100% { --ai-glow: rgba(255,215,0,0.28); --ai-accent: rgba(178,34,34,0.12); }
`;

const beamPulse = keyframes`
  0% { opacity: 0.14; transform: translateY(-2%) scaleY(0.98); }
  50% { opacity: 0.26; transform: translateY(0%) scaleY(1.02); }
  100% { opacity: 0.14; transform: translateY(-2%) scaleY(0.98); }
`;

/* ---------------- 3D PARTICLES ---------------- */

const GoldParticles: React.FC<{ count?: number }> = ({ count = 300 }) => {
  const ref = React.useRef<THREE.Points | null>(null);

  const positions = React.useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 60;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 60;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 60;
    }
    return arr;
  }, [count]);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y += 0.0005;
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime / 15) * 0.05;
  });

  return (
    <Points ref={ref} positions={positions}>
      <PointMaterial
        color="#FFD700"
        size={0.06}
        sizeAttenuation
        transparent
        depthWrite={false}
        opacity={0.8}
      />
    </Points>
  );
};

/* ---------------- HOME BANNER ---------------- */

const HomeBanner: React.FC = () => {
  const [slideIndex, setSlideIndex] = useState(0);

  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));

  const images = [AI1, AI2, AI3, AI4, AI5, AI6, AIANB];
  const captions = [
    "Welcome to Air India",
    "Experience the Maharaja Hospitality",
    "Fly Beyond Boundaries",
    "Connecting Dreams Across the World",
    "Luxury. Legacy. Loyalty.",
    "Where Every Journey Feels Royal",
    "Proudly Serving the Skies of India",
  ];

  const settings: Settings = {
    dots: true,
    infinite: true,
    speed: 1000,
    autoplay: true,
    autoplaySpeed: 5000,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    fade: true,
    pauseOnHover: false,
    cssEase: "cubic-bezier(0.87, 0, 0.13, 1)", // Smooth easing
    beforeChange: (_c, n) => setSlideIndex(n),
  };

  /* ------------ Styles ---------------- */
  const shimmerText: SxProps<Theme> = {
    fontWeight: 800,
    background:
      "linear-gradient(90deg, rgba(255,215,0,0.9), rgba(255,255,255,0.95), rgba(255,215,0,0.9))",
    WebkitBackgroundClip: "text",
    color: "transparent",
    backgroundSize: "350% 100%",
    animation: `${goldSweep} 6s linear infinite`,
    textShadow: "0 6px 16px rgba(0,0,0,0.6)",
  };

  return (
    <Box
      sx={{
        position: "relative",
        overflow: "hidden",
        height: { xs: "60vh", md: "85vh" },
        borderRadius: 0,
        animation: `${colorCycle} 18s ease-in-out infinite`,
        bgcolor: "#000",
      }}
    >
      {/* 3D BACKGROUND - Optimized */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          opacity: 0.6,
        }}
      >
        <Canvas camera={{ position: [0, 0, 14], fov: 45 }} dpr={[1, 1.5]}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1.5} color="#FFD700" />
          <GoldParticles />
          <Stars radius={80} factor={3} depth={60} fade speed={0.5} />
        </Canvas>
      </Box>

      {/* Beam Effect */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          width: { xs: "80%", md: "40%" },
          left: { xs: "10%", md: "30%" },
          height: "100%",
          background:
            "linear-gradient(180deg, rgba(255,215,0,0.15), rgba(0,0,0,0), transparent)",
          filter: "blur(40px)",
          pointerEvents: "none",
          animation: `${beamPulse} 8s ease-in-out infinite`,
          zIndex: 2,
        }}
      />

      {/* FOREGROUND */}
      <Box
        sx={{
          position: "relative",
          zIndex: 4,
          height: "100%",
        }}
      >
        {/* TITLE */}
        <motion.div
          key={slideIndex} // Re-trigger animation on slide change
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{
            position: "absolute",
            top: isSmall ? "15%" : "20%",
            right: "5%",
            width: isSmall ? "90%" : "60%",
            textAlign: "right",
            zIndex: 10,
            padding: "0 20px",
          }}
        >
          <Typography variant={isSmall ? "h5" : "h2"} sx={shimmerText}>
            {captions[slideIndex]}
          </Typography>
        </motion.div>

        {/* SLIDER */}
        <Box sx={{ width: "100%", height: "100%" }}>
          <Slider {...settings}>
            {images.map((src, i) => (
              <Box key={i} sx={{ height: "100%", position: "relative" }}>
                <Box
                  component="img"
                  src={src}
                  sx={{
                    width: "100%",
                    height: { xs: "60vh", md: "85vh" },
                    objectFit: "cover",
                    display: "block",
                  }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.8) 100%)",
                  }}
                />
              </Box>
            ))}
          </Slider>
        </Box>
      </Box>
    </Box>
  );
};

export default HomeBanner;
