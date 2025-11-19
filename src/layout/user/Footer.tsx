import React, { useEffect, useRef } from "react";
import {
  Box,
  Container,
  Typography,
  Link,
  IconButton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
  YouTube,
  Email,
  Phone,
  Room,
} from "@mui/icons-material";
import { motion, useAnimation, useInView } from "framer-motion";
import logo from "../../assets/logo.png";
import Mastercard from "../../assets/Mastercard.png";
import GooglePay from "../../assets/GooglePay.png";
import Visa from "../../assets/Visa.png";
import PayPal from "../../assets/PayPal.png";

const Footer: React.FC = () => {
  const theme = useTheme();
  const shimmerControls = useAnimation();
  const pulseControls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));

  // 🟡 Diagonal runway shimmer
  useEffect(() => {
    // let loop: NodeJS.Timeout;
    let loop: ReturnType<typeof setInterval>;

    const shimmer = async () => {
      await shimmerControls.start({
        x: ["-150%", "150%"],
        y: ["20%", "-20%"],
        opacity: [0, 1, 0],
        transition: { duration: 3.0, ease: "easeInOut" },
      });
    };
    if (isInView) {
      shimmer();
      loop = setInterval(shimmer, 3000);
    }
    return () => clearInterval(loop);
  }, [isInView, shimmerControls]);

  // 🌟 Logo pulse animation
  useEffect(() => {
    const pulse = async () => {
      while (true) {
        await pulseControls.start({
          scale: [1, 1.05, 1],
          filter: [
            "drop-shadow(0 0 0px rgba(255,215,0,0))",
            "drop-shadow(0 0 10px rgba(255,215,0,0.8))",
            "drop-shadow(0 0 0px rgba(255,215,0,0))",
          ],
          transition: { duration: 3.5, ease: "easeInOut" },
        });
        await new Promise((r) => setTimeout(r, 6500));
      }
    };
    pulse();
  }, [pulseControls]);

  // 💥 Gold spark burst on click
  // const createSpark = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
  //   const parent = e.currentTarget.parentElement;
  //   if (!parent) return;
  //   const spark = document.createElement("div");
  //   spark.className = "spark";
  //   spark.style.left = `${e.nativeEvent.offsetX}px`;
  //   spark.style.top = `${e.nativeEvent.offsetY}px`;
  //   parent.appendChild(spark);
  //   setTimeout(() => spark.remove(), 800);
  // };

  const createSpark = (e: React.MouseEvent<HTMLElement>) => {
    const parent = (e.currentTarget as HTMLElement).parentElement;
    if (!parent) return;

    const spark = document.createElement("div");
    spark.className = "spark";
    spark.style.left = `${e.nativeEvent.offsetX}px`;
    spark.style.top = `${e.nativeEvent.offsetY}px`;

    parent.appendChild(spark);

    setTimeout(() => spark.remove(), 800);
  };


  return (
    <Box
      ref={ref}
      sx={{
        backgroundColor: "#000",
        color: "#FFD700",
        py: 5,
        mt: 6,
        position: "relative",
        overflow: "hidden",
        borderRadius: "20px",
      }}
    >
      {/* ✨ Runway shimmer line */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          height: "4px",
          width: "100%",
          background: "rgba(255,215,0,0.08)",
          borderTopLeftRadius: "20px",
          borderTopRightRadius: "20px",
          overflow: "hidden",
        }}
      >
        <motion.div
          animate={shimmerControls}
          style={{
            position: "absolute",
            width: "120%",
            height: "4px",
            background:
              "linear-gradient(60deg, rgba(255,215,0,0) 0%, rgba(255,215,0,1) 40%, rgba(255,215,0,0) 100%)",
            boxShadow: "0 0 18px 4px rgba(255,215,0,0.8)",
            filter: "blur(2px)",
            transform: "rotate(12deg)",
          }}
        />
      </Box>

      <Container
        maxWidth="xl"
        sx={{
          display: "flex",
          flexDirection: isSmallScreen ? "column" : "row",
          alignItems: "center",
          justifyContent: "space-between",
          textAlign: isSmallScreen ? "center" : "left",
          gap: isSmallScreen ? 4 : 2,
          flexWrap: "wrap",
        }}
      >
        {/* 🟥 Logo with pulse + sparks */}
        <Box sx={{ flex: 1, minWidth: 200, position: "relative" }}>
          <Box sx={{ display: "flex", justifyContent: isSmallScreen ? "center" : "flex-start" }}>
            <motion.img
              src={logo}
              alt="Air India Logo"
              className="spark-hover"
              animate={pulseControls}
              whileHover={{
                scale: 1.08,
                filter: "drop-shadow(0 0 15px rgba(255,215,0,1))",
                transition: { duration: 0.4 },
              }}
              whileTap={{ scale: 1.15 }}
              style={{
                height: 55,
                cursor: "pointer",
                filter: "drop-shadow(0 0 0px rgba(255,215,0,0))",
                zIndex: 2,
                position: "relative",
              }}
              onClick={createSpark}
            />
          </Box>
          <Typography
            variant="body2"
            sx={{
              mt: 1,
              color: "#FFD700",
              fontSize: "0.9rem",
              maxWidth: 260,
              mx: isSmallScreen ? "auto" : 0,
            }}
          >
            Air India — connecting people and destinations worldwide with
            hospitality, trust, and excellence.
          </Typography>
        </Box>

        {/* 🌍 Explore Links */}
        <Box
          sx={{
            flex: 1,
            minWidth: 200,
            display: "flex",
            flexDirection: "column",
            alignItems: isSmallScreen ? "center" : "flex-start",
          }}
        >
          <Typography variant="h6" sx={{ mb: 1, fontWeight: "bold", color: "#FFD700" }}>
            Explore
          </Typography>
          {[
            { text: "Book Flight", href: "https://www.airindia.com/" },
            { text: "Web Check-In", href: "https://www.airindia.com/in/en/manage/web-checkin.html" },
            { text: "Flight Status", href: "https://www.airindia.com/in/en/manage/flight-status.html" },
            { text: "Baggage Info", href: "https://www.airindia.com/in/en/travel-information/baggage.html" },
            { text: "Contact Us", href: "https://www.airindia.com/in/en/contact-us.html" },
          ].map((link, i) => (
            <Link
              key={i}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              color="#FFD700"
              underline="none"
              sx={{
                fontSize: "0.9rem",
                mb: 0.5,
                transition: "color 0.3s ease",
                "&:hover": { color: "#fff", textDecoration: "underline" },
              }}
            >
              {link.text}
            </Link>
          ))}
        </Box>

        {/* 📞 Contact */}
        <Box
          sx={{
            flex: 1,
            minWidth: 200,
            display: "flex",
            flexDirection: "column",
            alignItems: isSmallScreen ? "center" : "flex-start",
          }}
        >
          <Typography variant="h6" sx={{ mb: 1, fontWeight: "bold", color: "#FFD700" }}>
            Contact
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", mb: 1, gap: 1 }}>
            <Email sx={{ fontSize: 18, color: "#FFD700" }} />
            <Typography variant="body2">support@airindia.com</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", mb: 1, gap: 1 }}>
            <Phone sx={{ fontSize: 18, color: "#FFD700" }} />
            <Typography variant="body2">+91 124 264 1407</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Room sx={{ fontSize: 18, color: "#FFD700" }} />
            <Typography variant="body2">Air India House, New Delhi</Typography>
          </Box>
        </Box>

        {/* 💳 Payments */}
        <Box
          sx={{
            flex: 1,
            minWidth: 200,
            display: "flex",
            flexDirection: "column",
            alignItems: isSmallScreen ? "center" : "flex-start",
          }}
        >
          <Typography variant="h6" sx={{ mb: 1, fontWeight: "bold", color: "#FFD700" }}>
            Payments
          </Typography>
          <Box
            sx={{
              display: "flex",
              justifyContent: isSmallScreen ? "center" : "flex-start",
              gap: 1,
              flexWrap: "wrap",
            }}
          >
            {[Mastercard, GooglePay, Visa, PayPal].map((imgSrc, i) => (
              <Box
                key={i}
                sx={{
                  transition: "transform 0.3s ease",
                  "&:hover": { transform: "scale(1.15)" },
                }}
              >
                <img src={imgSrc} alt="Payment" style={{ height: 30 }} />
              </Box>
            ))}
          </Box>
        </Box>

        {/* 🌐 Social Media */}
        <Box
          sx={{
            flex: 1,
            minWidth: 200,
            display: "flex",
            flexDirection: "column",
            alignItems: isSmallScreen ? "center" : "flex-start",
          }}
        >
          <Typography variant="h6" sx={{ mb: 1, fontWeight: "bold", color: "#FFD700" }}>
            Follow Us
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "center", gap: 1.5 }}>
            {[
              { icon: <Facebook />, href: "https://www.facebook.com/airindia.in/" },
              { icon: <Twitter />, href: "https://twitter.com/airindia" },
              { icon: <Instagram />, href: "https://www.instagram.com/airindia.in/" },
              { icon: <LinkedIn />, href: "https://www.linkedin.com/company/air-india/" },
              { icon: <YouTube />, href: "https://www.youtube.com/@airindiaofficial" },
            ].map(({ icon, href }, i) => (
              <IconButton
                key={i}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={createSpark}
                className="spark-hover"
                sx={{
                  color: "#FFD700",
                  transition: "all 0.3s ease",
                  "&:hover": { color: "#fff", transform: "scale(1.2)" },
                  position: "relative",
                  overflow: "visible",
                }}
              >
                {icon}
              </IconButton>
            ))}
          </Box>
        </Box>
      </Container>

      {/* Divider and Bottom Bar */}
      <Box sx={{ borderTop: "1px solid rgba(255,215,0,0.3)", mt: 4, mb: 2 }} />
      <Container
        sx={{
          display: "flex",
          flexDirection: isSmallScreen ? "column" : "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          textAlign: isSmallScreen ? "center" : "left",
          mb: 2,
        }}
      >
        <Typography variant="body2" sx={{ color: "#FFD700" }}>
          © {new Date().getFullYear()} Air India Ltd. All rights reserved.
        </Typography>
        <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap", justifyContent: "center" }}>
          <Link
            href="https://www.airindia.com/in/en/privacy-policy.html"
            target="_blank"
            rel="noopener noreferrer"
            color="#FFD700"
            underline="none"
            sx={{
              fontSize: "0.9rem",
              "&:hover": { color: "#fff", textDecoration: "underline" },
            }}
          >
            Privacy Policy
          </Link>
          <Link
            href="https://www.airindia.com/in/en/terms-and-conditions.html"
            target="_blank"
            rel="noopener noreferrer"
            color="#FFD700"
            underline="none"
            sx={{
              fontSize: "0.9rem",
              "&:hover": { color: "#fff", textDecoration: "underline" },
            }}
          >
            Terms & Conditions
          </Link>
        </Box>
      </Container>

      {/* CSS for sparks */}
      <style>
        {`
          /* gold click spark */
          .spark {
            position: absolute;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: radial-gradient(circle, #FFD700 40%, transparent 70%);
            pointer-events: none;
            animation: sparkBurst 0.8s ease-out forwards;
          }
          @keyframes sparkBurst {
            0% { transform: scale(0); opacity: 1; box-shadow: 0 0 4px 2px rgba(255,215,0,0.8); }
            50% { transform: scale(3); opacity: 0.9; box-shadow: 0 0 12px 6px rgba(255,215,0,0.9); }
            100% { transform: scale(5); opacity: 0; box-shadow: 0 0 0 0 rgba(255,215,0,0); }
          }

          /* 🔴 red spark burst once per hover */
          .spark-hover::after {
            content: "";
            position: absolute;
            top: 50%;
            left: 50%;
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: radial-gradient(circle, #ff0000 40%, transparent 80%);
            transform: translate(-50%, -50%) scale(0);
            opacity: 0;
            pointer-events: none;
          }
          .spark-hover:hover::after {
            animation: redSpark 0.6s ease-out;
          }
          @keyframes redSpark {
            0% { transform: translate(-50%, -50%) scale(0); opacity: 1; box-shadow: 0 0 6px 2px #ff0000; }
            50% { transform: translate(-50%, -50%) scale(3); opacity: 0.8; box-shadow: 0 0 10px 3px #ff4444; }
            100% { transform: translate(-50%, -50%) scale(5); opacity: 0; box-shadow: 0 0 0 0 #ff0000; }
          }
        `}
      </style>
    </Box>
  );
};

export default Footer;
