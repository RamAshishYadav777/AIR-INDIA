import React, { useState, useMemo } from "react";
import Slider from "react-slick";
import type { Settings } from "react-slick";
import {
  Box,
  Typography,
  keyframes,
  Stack,
} from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial, Stars } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// flight section
import AI1 from "../assets/AI1.png";
import AI2 from "../assets/AI2.png";
import AI3 from "../assets/AI3.png";
import AI4 from "../assets/AI4.mp4";
import AI5 from "../assets/AI5.mp4";
import AI6 from "../assets/AI6.png";
import AI7 from "../assets/AI7.mp4";
import AI8 from "../assets/AI8.mp4";
import AIANB from "../assets/AIANB.png";


// city section
import an1 from "../assets/an1.mp4";
import an2 from "../assets/an2.mp4";
import an3 from "../assets/an3.mp4";
import delhi from "../assets/delhi.jpg";
import an4 from "../assets/an4.mp4";
import T1 from "../assets/T1.jpg";
import AI9 from "../assets/AI9.mp4";
import london from "../assets/london.jpg";
import T2 from "../assets/T2.jpg";
import T3 from "../assets/T3.jpg";
import mumbai from "../assets/mumbai.jpg";
import T4 from "../assets/T4.jpg";
import T6 from "../assets/T6.jpg";
import dubai from "../assets/dubai.mp4";
import ar1 from "../assets/ar1.jpg";
import ar2 from "../assets/ar2.jpg";
import ar3 from "../assets/ar3.jpg";

/* ---------------- ANIMATIONS ---------------- */

const goldSweep = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const zoomIn = keyframes`
  from { transform: scale(1); }
  to { transform: scale(1.1); }
`;

/* ---------------- 3D PARTICLES ---------------- */

const GoldParticles: React.FC<{ count?: number }> = ({ count = 40 }) => {
  const ref = React.useRef<THREE.Points | null>(null);

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 50;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 50;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 50;
    }
    return arr;
  }, [count]);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y += 0.0002;
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime / 20) * 0.04;
  });

  return (
    <Points ref={ref} positions={positions}>
      <PointMaterial
        color="#FFD700"
        size={0.04}
        sizeAttenuation
        transparent
        depthWrite={false}
        opacity={0.5}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
};

/* ---------------- HOME BANNER ---------------- */

const HomeBanner: React.FC = () => {
  const [slideIndex, setSlideIndex] = useState(0);
  const [videoIndex, setVideoIndex] = useState(0);



  const images = useMemo(() => [AI1, AI2, AI3, AI4, AI5, AI6], []);
  const videos = useMemo(() => [
    an1, an2, an3, delhi, an4, london, dubai, AI9
  ], []);

  const captions = [
    { main: "Windows to the World", sub: "Global Luxury" },
    { main: "The New Air India", sub: "Legacy Meets Innovation" },
    { main: "Maharaja Reimagined", sub: "Redefining Hospitality" },
    { main: "Soar with Elegance", sub: "Connecting Global Cities" },
    { main: "Signature Collection", sub: "New Fleet Awaits" },
    { main: "Timeless Journeys", sub: "Crafting Memories" }
  ];

  const cityCaptions = [
    "New York", "International Dining", "Paris", "Delhi", "London", "Rome", "Dubai", "Singapore"
  ];

  const imageSettings: Settings = {
    dots: false,
    infinite: true,
    speed: 1500,
    autoplay: true,
    autoplaySpeed: 5000,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    fade: true,
    lazyLoad: "progressive",
    beforeChange: (_c, n) => setSlideIndex(n),
  };

  const videoSettings: Settings = {
    dots: false,
    infinite: true,
    speed: 1000,
    autoplay: true,
    autoplaySpeed: 6000,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    fade: true,
    beforeChange: (_c, n) => setVideoIndex(n),
  };

  const bannerTitle: SxProps<Theme> = {
    fontWeight: 900,
    fontFamily: '"Playfair Display", serif',
    background: "linear-gradient(90deg, #FFFFFF, #FFD700, #FFFFFF)",
    WebkitBackgroundClip: "text",
    color: "transparent",
    backgroundSize: "200% 100%",
    animation: `${goldSweep} 6s linear infinite`,
    fontSize: { xs: "1.8rem", md: "2.5rem" },
    lineHeight: 1.2,
    mb: 1,
  };

  const renderAsset = (asset: string, index: number, currentIndex: number) => {
    const isVideo = typeof asset === 'string' && (/\.(mp4|webm|ogg|mov)($|\?)/i.test(asset) || asset.includes('data:video'));
    // Only render video if it's the current, next, or previous slide to ensure smooth fade
    const isNear = Math.abs(index - currentIndex) <= 1 || (index === 0 && currentIndex === 5) || (index === 5 && currentIndex === 0);

    if (isVideo) {
      if (!isNear) return <Box sx={{ width: "100%", height: "100%", bgcolor: "#000" }} />;
      return (
        <video
          src={asset}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            willChange: "transform, opacity"
          }}
        />
      );
    }
    return (
      <Box
        component="img"
        src={asset}
        sx={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          animation: isNear ? `${zoomIn} 12s ease-out forwards` : "none",
          display: "block",
          willChange: "transform, opacity"
        }}
      />
    );
  };

  return (
    <Box
      sx={{
        position: "relative",
        overflow: "hidden",
        height: { xs: "auto", md: "85vh" },
        minHeight: { xs: "700px", md: "unset" },
        bgcolor: "#000",
      }}
    >
      {/* 3D Particles Layer */}
      <Box sx={{ position: "absolute", inset: 0, zIndex: 5, pointerEvents: "none" }}>
        <Canvas 
          dpr={[1, 1.5]}
          gl={{ antialias: false, powerPreference: "high-performance" }}
          camera={{ position: [0, 0, 15], fov: 45 }}
        >
          <GoldParticles />
          <Stars radius={100} depth={50} count={300} factor={4} saturation={0} fade speed={0.5} />
        </Canvas>
      </Box>

      <Stack direction={{ xs: "column", md: "row" }} sx={{ height: "100%", width: "100%" }}>

        {/* LEFT SECTION: FLIGHTS */}
        <Box sx={{
          flex: { xs: "none", md: 6.5 },
          height: { xs: "50vh", md: "100%" },
          position: "relative",
          overflow: "hidden",
          borderRight: { md: "2px solid rgba(255,215,0,0.2)" },
          borderBottom: { xs: "1px solid rgba(255,215,0,0.1)", md: "none" }
        }}>
          <Slider {...imageSettings}>
            {images.map((asset, idx) => (
              <Box key={idx} sx={{ height: { xs: "50vh", md: "85vh" }, outline: "none" }}>
                {renderAsset(asset, idx, slideIndex)}
              </Box>
            ))}
          </Slider>

          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to right, rgba(0,0,0,0.8) 0%, transparent 60%)",
              zIndex: 3,
              pointerEvents: "none"
            }}
          />

          <Box sx={{ position: "absolute", bottom: { xs: 40, md: 80 }, left: { xs: 24, md: 48 }, zIndex: 10, maxWidth: "80%" }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={slideIndex}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.8 }}
              >
                <Typography sx={{ color: "#FFD700", fontWeight: 800, fontSize: "0.75rem", letterSpacing: "0.4em", textTransform: "uppercase", mb: 1.5, opacity: 0.8 }}>
                  {captions[slideIndex % captions.length].sub}
                </Typography>
                <Typography variant="h2" sx={bannerTitle}>
                  {captions[slideIndex % captions.length].main}
                </Typography>
                <Box sx={{ width: "60px", height: "4px", bgcolor: "#D41B2D", mt: 3, borderRadius: "2px" }} />
              </motion.div>
            </AnimatePresence>
          </Box>
        </Box>

        {/* RIGHT SECTION: CITIES */}
        <Box sx={{
          flex: { xs: "none", md: 3.5 },
          height: { xs: "50vh", md: "100%" },
          position: "relative",
          overflow: "hidden"
        }}>
          <Slider {...videoSettings}>
            {videos.map((asset, idx) => (
              <Box key={idx} sx={{ height: { xs: "50vh", md: "85vh" }, outline: "none" }}>
                {renderAsset(asset, idx, videoIndex)}
              </Box>
            ))}
          </Slider>

          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to left, rgba(0,0,0,0.8) 0%, transparent 60%)",
              zIndex: 3,
              pointerEvents: "none"
            }}
          />

          <Box sx={{ position: "absolute", bottom: { xs: 30, md: 80 }, right: { xs: 24, md: 48 }, zIndex: 10, textAlign: "right" }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={videoIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.8 }}
              >
                <Typography sx={{ color: "#FFD700", fontWeight: 800, fontSize: { xs: "0.65rem", md: "0.75rem" }, letterSpacing: "0.4em", textTransform: "uppercase", mb: 1, opacity: 0.8 }}>
                  Discover
                </Typography>
                <Typography variant="h2" sx={{ ...bannerTitle, fontSize: { xs: "1.8rem", md: "4.5rem" } }}>
                  {cityCaptions[videoIndex % cityCaptions.length]}
                </Typography>
                <Box sx={{ width: { xs: "40px", md: "60px" }, height: { xs: "2px", md: "4px" }, bgcolor: "#FFD700", ml: "auto", mt: 2, borderRadius: "2px" }} />
              </motion.div>
            </AnimatePresence>
          </Box>
        </Box>

      </Stack>

    </Box>
  );
};

export default HomeBanner;
