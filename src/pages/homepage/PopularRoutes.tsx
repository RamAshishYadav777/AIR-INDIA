// import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Typography,
  Card,
  CardMedia,
  CardContent,
  keyframes,
} from "@mui/material";

import { Link } from "react-router-dom";


// 🏙 Example cities
import delhi from "../../assets/delhi.jpg";
import MumbaiImg from "../../assets/mumbai.jpg";
import LondonImg from "../../assets/london.jpg";
import NewYorkImg from "../../assets/newyork.jpg";
import singaporeImg from "../../assets/singaporeImg.jpg";
import dubaiimg from "../../assets/dubaiimg.jpg";

// ✅ Type
interface Route {
  city: string;
  image: string;
  url:string;
}

const routes: Route[] = [
  {
    city: "Delhi",
    image: delhi,
    url: "https://delhitourism.gov.in/aboutus/index.html",
  },
  {
    city: "Mumbai",
    image: MumbaiImg,
    url: "https://mumbaicity.gov.in/en/about-district/",
  },
  { city: "London", image: LondonImg, url: "https://www.visitlondon.com/" },
  { city: "New York", image: NewYorkImg, url: "https://www.nyctourism.com/" },
  {
    city: "Singapore",
    image: singaporeImg,
    url: "https://www.visitsingapore.com/travel-tips/travelling-to-singapore/?cmp=SEM_MA25-101_IN_MA_ENG_NA_NA_NONE_BM-TravelReq-GN_NA_GOOG_SEA_AO_Cross_XTG&gclsrc=aw.ds&gad_source=1&gad_campaignid=21138569717&gbraid=0AAAAADMjZQL_JWHMPG723GCdPBE0f7f6s&gclid=CjwKCAiAz_DIBhBJEiwAVH2XwPy3gHASowQ0qcNTgXLxuluYLfdLnEgiC87cHOCEaOzzUEHDmOleJRoC9rUQAvD_BwE",
  },
  { city: "Dubai", image: dubaiimg, url: "https://www.visitdubai.com/en/" },
];


// ✨ Animations
const glow = keyframes`
  0%, 100% { box-shadow: 0 0 0 rgba(255,215,0,0); }
  50% { box-shadow: 0 0 20px rgba(255,215,0,0.5); }
`;

const frameGlow = keyframes`
  0%, 100% { opacity: 0.7; box-shadow: 0 0 8px rgba(255,215,0,0.2), inset 0 0 15px rgba(255,215,0,0.15); }
  50% { opacity: 1; box-shadow: 0 0 22px rgba(255,215,0,0.4), inset 0 0 25px rgba(255,215,0,0.3); }
`;

const floatParticle = keyframes`
  0% { transform: translateY(0px) translateX(0px); opacity: 0.3; }
  50% { transform: translateY(-15px) translateX(10px); opacity: 0.6; }
  100% { transform: translateY(0px) translateX(0px); opacity: 0.3; }
`;

const lightSweep = keyframes`
  0% { transform: translateX(-100%); opacity: 0; }
  20% { opacity: 0.2; }
  50% { opacity: 0.4; }
  80% { opacity: 0.2; }
  100% { transform: translateX(150%); opacity: 0; }
`;

const PopularRoutes: React.FC = () => {
  // const [_scrollY, setScrollY] = useState(0);
  // const [_mouseX, setMouseX] = useState(0);

  // // Track scroll
  // useEffect(() => {
  //   const handleScroll = () => setScrollY(window.scrollY);
  //   window.addEventListener("scroll", handleScroll);
  //   return () => window.removeEventListener("scroll", handleScroll);
  // }, []);

  // // Track mouse
  // useEffect(() => {
  //   const handleMouseMove = (e: MouseEvent) => {
  //     const xPos = e.clientX / window.innerWidth;
  //     setMouseX(xPos);
  //   };
  //   window.addEventListener("mousemove", handleMouseMove);
  //   return () => window.removeEventListener("mousemove", handleMouseMove);
  // }, []);


  // const shimmerOffset = (scrollY % 500) / 5 + mouseX * 30;

  return (
    <Box
      sx={{
        py: 10,
        px: { xs: 2, md: 5 },
        position: "relative",
        overflow: "hidden",
        background:
          "linear-gradient(180deg, #160000 0%, #2b0000 60%, #000 100%)",
        borderRadius: "20px",
        animation: `${frameGlow} 10s ease-in-out infinite`,
        border: "2px solid rgba(255,215,0,0.2)",
        boxShadow:
          "0 0 16px rgba(255,215,0,0.15), inset 0 0 10px rgba(255,215,0,0.08)",
      }}
    >
      {/* 🌞 Light Sweep (Sunlight Effect) */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "200%",
          height: "100%",
          background:
            "linear-gradient(100deg, rgba(255,215,0,0) 0%, rgba(255,215,0,0.15) 50%, rgba(255,215,0,0) 100%)",
          animation: `${lightSweep} 20s linear infinite`,
          filter: "blur(20px)",
          zIndex: 0,
        }}
      />

      {/* ✨ Floating subtle golden particles */}
      {Array.from({ length: 15 }).map((_, i) => (
        <Box
          key={i}
          sx={{
            position: "absolute",
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            width: "3px",
            height: "3px",
            borderRadius: "50%",
            backgroundColor: "rgba(255,215,0,0.4)",
            filter: "blur(1px)",
            animation: `${floatParticle} ${
              5 + Math.random() * 5
            }s ease-in-out infinite`,
            animationDelay: `${Math.random() * 4}s`,
            zIndex: 1,
          }}
        />
      ))}

      {/* ✈️ Section Title */}
      <Typography
        variant="h4"
        sx={{
          fontWeight: "bold",
          mb: 6,
          textAlign: "center",
          color: "#FFD700",
          letterSpacing: "0.5px",
          position: "relative",
          zIndex: 2,
          textShadow: "0 0 10px rgba(255,215,0,0.3)",
        }}
      >
        Popular Destinations
      </Typography>

      {/* 🧳 Destination Cards */}
      <Grid
        container
        spacing={4}
        justifyContent="center"
        sx={{ position: "relative", zIndex: 2 }}
      >
        {routes.map((route, index) => (
          <Grid key={index} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <Link to={route.url} style={{ textDecoration: "none" }}>
              <Card
                sx={{
                  borderRadius: 3,
                  cursor: "pointer",
                  transition: "transform 0.3s, box-shadow 0.3s, border 0.3s",
                  border: "1px solid rgba(255,215,0,0.25)",
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.06) 100%)",
                  "&:hover": {
                    transform: "translateY(-10px)",
                    border: "1px solid #FFD700",
                    animation: `${glow} 2s ease-in-out infinite`,
                    boxShadow:
                      "0 8px 25px rgba(255,215,0,0.3), inset 0 0 10px rgba(255,215,0,0.15)",
                  },
                }}
              >
                <CardMedia
                  component="img"
                  image={route.image}
                  alt={route.city}
                  sx={{
                    height: 200,
                    aspectRatio: "16/9",
                    objectFit: "cover",
                    borderRadius: "8px 8px 0 0",
                    transition: "filter 0.4s ease",
                    "&:hover": { filter: "brightness(1.1)" },
                  }}
                />
                <CardContent sx={{ textAlign: "center" }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: "bold",
                      color: "#FFD700",
                      transition: "text-shadow 0.3s ease",
                      "&:hover": { textShadow: "0 0 8px rgba(255,215,0,0.6)" },
                    }}
                  >
                    {route.city}
                  </Typography>
                </CardContent>
              </Card>
            </Link>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default PopularRoutes;
