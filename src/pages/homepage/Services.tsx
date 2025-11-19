import React, { useRef } from "react";
import { Box, Typography, Card, CardContent, keyframes } from "@mui/material";
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import FlightIcon from "@mui/icons-material/Flight";
import WorkIcon from "@mui/icons-material/Work";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import LiveTvIcon from "@mui/icons-material/LiveTv";

/* ---------------- Animations ---------------- */
const floatUp = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
`;

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

const goldenTrail = keyframes`
  0% { transform: translateX(-100%) rotate(-5deg); opacity: 0; }
  20% { opacity: 1; }
  80% { opacity: 1; }
  100% { transform: translateX(120%) rotate(5deg); opacity: 0; }
`;

const cloudDrift = keyframes`
  0% { transform: translateX(-20%) translateY(0); }
  50% { transform: translateX(10%) translateY(10px); }
  100% { transform: translateX(40%) translateY(0); }
`;

/* ---------------- Service Type ---------------- */
interface Service {
  title: string;
  desc: string;
  icon: React.ReactElement;
  link: string;
}

const services: Service[] = [
  {
    title: "In-Flight Meals",
    desc: "Delicious meals curated by Air India chefs, served with warmth and care.",
    icon: <RestaurantIcon sx={{ fontSize: 55, color: "#FFD700" }} />,
    link: "https://www.airindia.com/in/en/experience/in-air/whats-on-my-ai/dining-experience.html",
  },
  {
    title: "Baggage Allowance",
    desc: "Carry what you need — Air India offers generous baggage policies.",
    icon: <WorkIcon sx={{ fontSize: 55, color: "#FFD700" }} />,
    link: "https://www.airindia.com/in/en/travel-information/baggage-guidelines/checked-baggage-allowance.html",
  },
  {
    title: "Flight Status",
    desc: "Track live flight updates and schedules directly from Air India.",
    icon: <FlightIcon sx={{ fontSize: 55, color: "#FFD700" }} />,
    link: "https://www.airindia.com/in/en/manage/flight-status.html",
  },
  {
    title: "In-Flight Entertainment",
    desc: "Sit back and enjoy Air India’s latest movies, music, and TV shows onboard.",
    icon: <LiveTvIcon sx={{ fontSize: 55, color: "#FFD700" }} />,
    link: "https://www.airindia.com/in/en/experience/in-air/whats-on-my-ai/inflight-entertainment.html",
  },
];

/* ---------------- 3D Hover Tilt Component ---------------- */
const TiltCard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [0, 1], [15, -15]);
  const rotateY = useTransform(x, [0, 1], [-15, 15]);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    x.set(px);
    y.set(py);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        x.set(0.5);
        y.set(0.5);
      }}
      style={{
        perspective: 1000,
      }}
    >
      <motion.div
        style={{
          rotateX: useSpring(rotateX, { stiffness: 100, damping: 15 }),
          rotateY: useSpring(rotateY, { stiffness: 100, damping: 15 }),
          transformStyle: "preserve-3d",
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

/* ---------------- Main Component ---------------- */
const Services: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const bgPosition = useTransform(scrollYProgress, [0, 1], ["0% 0%", "0% 100%"]);

  return (
    <motion.div
      ref={ref}
      style={{
        background:
          "linear-gradient(135deg, #2b0000 0%, #9B111E 40%, #FFD700 100%)",
        backgroundSize: "200% 200%",
        backgroundPosition: bgPosition,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ☁️ Cloud Layers */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          background:
            "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.08), transparent 60%), radial-gradient(circle at 70% 60%, rgba(255,255,255,0.1), transparent 70%)",
          animation: `${cloudDrift} 60s ease-in-out infinite alternate`,
          filter: "blur(40px)",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          background:
            "radial-gradient(circle at 40% 50%, rgba(255,255,255,0.06), transparent 60%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.08), transparent 70%)",
          animation: `${cloudDrift} 90s ease-in-out infinite alternate-reverse`,
          filter: "blur(60px)",
        }}
      />

      <Box
        sx={{
          py: 10,
          px: { xs: 2, md: 6 },
          textAlign: "center",
          position: "relative",
          zIndex: 2,
        }}
      >
        {/* ✨ Animated Golden Trail (Background) */}
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: 0,
            width: "100%",
            height: "4px",
            background:
              "linear-gradient(90deg, rgba(255,215,0,0) 0%, rgba(255,215,0,0.8) 50%, rgba(255,215,0,0) 100%)",
            transform: "rotate(-3deg)",
            opacity: 0.5,
            animation: `${goldenTrail} 10s linear infinite`,
          }}
        />

        {/* 🛫 Title */}
        <Typography
          variant="h4"
          sx={{
            fontWeight: "bold",
            mb: 6,
            textAlign: "center",
            color: "#FFD700",
            textShadow: "0 0 12px rgba(255,215,0,0.4)",
            animation: `${fadeInUp} 1.2s ease`,
          }}
        >
          Our Premium Services
        </Typography>

        {/* 🪩 Cards with 3D Tilt */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: 4,
            flexWrap: "wrap",
            zIndex: 2,
            position: "relative",
          }}
        >
          {services.map((service, index) => (
            <a
              key={index}
              href={service.link}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: "none" }}
            >
              <TiltCard>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card
                    sx={{
                      flex: "1 1 22%",
                      minWidth: 260,
                      maxWidth: 300,
                      borderRadius: 4,
                      textAlign: "center",
                      p: 3,
                      background:
                        "linear-gradient(145deg, rgba(255,255,255,0.12), rgba(255,255,255,0.05))",
                      border: "1.5px solid rgba(255,215,0,0.4)",
                      backdropFilter: "blur(8px)",
                      color: "white",
                      boxShadow:
                        "0px 5px 20px rgba(0,0,0,0.3), inset 0 0 12px rgba(255,215,0,0.1)",
                      transition: "all 0.4s ease",
                      animation: `${fadeInUp} 1.2s ease ${index * 0.2}s both`,
                      "&:hover": {
                        transform: "translateY(-12px)",
                        boxShadow:
                          "0 12px 30px rgba(155,17,30,0.5), 0 0 25px rgba(255,215,0,0.7)",
                        border: "1.5px solid #FFD700",
                        animation: `${floatUp} 2s ease-in-out infinite`,
                      },
                    }}
                  >
                    <Box
                      sx={{
                        mb: 2,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        borderRadius: "50%",
                        width: 90,
                        height: 90,
                        mx: "auto",
                        background:
                          "radial-gradient(circle, rgba(255,215,0,0.3), transparent 70%)",
                      }}
                    >
                      {service.icon}
                    </Box>

                    <CardContent>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: "bold",
                          mb: 1.5,
                          color: "#FFD700",
                          textShadow: "0 0 6px rgba(255,215,0,0.5)",
                        }}
                      >
                        {service.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#f1f1f1",
                          fontSize: "0.95rem",
                          lineHeight: 1.6,
                        }}
                      >
                        {service.desc}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </TiltCard>
            </a>
          ))}
        </Box>

        {/* 🌟 Bottom Glow Overlay */}
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "200px",
            background:
              "radial-gradient(circle at 50% 120%, rgba(255,215,0,0.25), transparent 80%)",
            pointerEvents: "none",
          }}
        />
      </Box>
    </motion.div>
  );
};

export default Services;
