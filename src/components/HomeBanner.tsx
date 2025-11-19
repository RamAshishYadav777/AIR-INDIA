import React, { useEffect, useRef, useState, useMemo } from "react";
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
import { EffectComposer, Bloom } from "@react-three/postprocessing";
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

type MousePos = { x: number; y: number };

const GoldParticles: React.FC<{ mouse: MousePos; count?: number }> = ({
  
  count = 2000,
}) => {
  const ref = useRef<THREE.Points | null>(null);

  const positions = useMemo(() => {
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

    ref.current.rotation.y += 0.0008;
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime / 12) * 0.08;
  });

  return (
    <Points ref={ref} positions={positions}>
      <PointMaterial
        color="#FFD700"
        size={0.05}
        sizeAttenuation
        transparent
        depthWrite={false}
      />
    </Points>
  );
};

/* ---------------- HOME BANNER ---------------- */

const HomeBanner: React.FC = () => {
  const [slideIndex, setSlideIndex] = useState(0);
  const [mousePos, setMousePos] = useState<MousePos>({ x: 0.5, y: 0.5 });
  // const [ setScrollY] = useState(0);
  const [, setScrollY] = useState(0);


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
    speed: 900,
    autoplay: true,
    autoplaySpeed: 5200,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    fade: true,
    pauseOnHover: false,
    cssEase: "ease-in-out",
    beforeChange: (_c, n) => setSlideIndex(n),
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) =>
      setMousePos({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });

    const onScroll = () => setScrollY(window.scrollY);

    window.addEventListener("mousemove", onMove);
    window.addEventListener("scroll", onScroll);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

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
        mt: 4,
        height: { xs: "60vh", md: "90vh" },
        borderRadius: 0,
        animation: `${colorCycle} 18s ease-in-out infinite`,
      }}
    >
      {/* Beam */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          width: "30%",
          left: "35%",
          height: "100%",
          background:
            "linear-gradient(180deg, rgba(255,245,200,0.2), rgba(255,215,0,0.05), transparent)",
          filter: "blur(30px)",
          pointerEvents: "none",
          animation: `${beamPulse} 7s ease-in-out infinite`,
          zIndex: 2,
        }}
      />

      {/* 3D BACKGROUND */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
        }}
      >
        <Canvas camera={{ position: [0, 0, 12], fov: 50 }}>
          <ambientLight intensity={0.28} />
          <pointLight position={[6, 6, 6]} intensity={1.4} color="#FFD700" />
          <GoldParticles mouse={mousePos} />
          <Stars radius={70} factor={4} depth={80} fade speed={1} />
          <EffectComposer>
            <Bloom intensity={0.9} luminanceThreshold={0.1} luminanceSmoothing={0.45} />
          </EffectComposer>
        </Canvas>
      </Box>

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
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0 }}
          style={{
            position: "absolute",
            top: isSmall ? "auto" : 30,
            bottom: isSmall ? 24 : "auto",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 6,
          }}
        >
          <Typography variant={isSmall ? "h6" : "h3"} sx={shimmerText}>
            {captions[slideIndex]}
          </Typography>
        </motion.div>

        {/* SLIDER */}
        <Box sx={{ width: "100%", height: "100%" }}>
          <Slider {...settings}>
            {images.map((src, i) => (
              <Box key={i} sx={{ height: "100%", position: "relative" }}>
                <motion.div
                  initial={{ opacity: 0, scale: 1.03 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1.1 }}
                >
                  <Box
                    component="img"
                    src={src}
                    sx={{
                      width: "100%",
                      height: { xs: "60vh", md: "90vh" },
                      objectFit: "cover",
                      display: "block",
                      transform: `translate3d(${(mousePos.x - 0.5) * 20}px,
                                             ${(mousePos.y - 0.5) * 12}px, 0)`,
                      transition: "transform 0.1s linear",
                    }}
                  />
                </motion.div>

                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(180deg, rgba(0,0,0,0.15), rgba(0,0,0,0.5), rgba(0,0,0,0.9))",
                  }}
                />
              </Box>
            ))}
          </Slider>
        </Box>

        {/* Mouse sparkle */}
        <Box
          sx={{
            position: "absolute",
            top: `${mousePos.y * 100}%`,
            left: `${mousePos.x * 100}%`,
            transform: "translate(-50%, -50%)",
            fontSize: 22,
            opacity: 0.6,
            color: "gold",
            pointerEvents: "none",
            zIndex: 10,
          }}
        >
          ✨
        </Box>
      </Box>
    </Box>
  );
};

export default HomeBanner;
