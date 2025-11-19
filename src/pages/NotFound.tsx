
import { Container, Paper, Typography, Button } from "@mui/material";
import Lottie from "lottie-react";
import notFoundAnimation from "../assets/lottie/Lonly404.json";

const NotFound = () => {
  return (
    <Container
      maxWidth="md"
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: 4,
          borderRadius: 3,
          textAlign: "center",
          width: "100%",
        }}
      >
        {/* Lottie Animation */}
        <Lottie
          animationData={notFoundAnimation}
          loop
          style={{ width: 300, height: 300, margin: "0 auto" }}
        />

        {/* Text */}
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          404 - Page Not Found
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Oops! The page you’re looking for doesn’t exist.
        </Typography>

        {/* Button */}
        <Button
          variant="contained"
          color="primary"
          href="/"
          sx={{ mt: 2, borderRadius: 2 }}
        >
          Go Home
        </Button>
      </Paper>
    </Container>
  );
};

export default NotFound;
