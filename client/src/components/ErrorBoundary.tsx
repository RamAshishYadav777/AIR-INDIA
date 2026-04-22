import { Component } from "react";
import type { ReactNode } from "react";

import {
  Box,
  Typography,
  Paper,
  Button,
  Container,
  Divider,
} from "@mui/material";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: any;
}

class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("🔥 ErrorBoundary caught:", error);
    console.error("📌 Component Stack:", errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Container
          maxWidth="md"
          sx={{
            height: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Paper
            elevation={8}
            sx={{
              p: 4,
              borderRadius: 4,
              textAlign: "center",
              background: "rgba(20, 20, 20, 0.9)",
              backdropFilter: "blur(6px)",
              color: "#fff",
              border: "1px solid rgba(255,215,0,0.3)",
            }}
          >
            <Typography
              variant="h4"
              fontWeight={700}
              sx={{ color: "#ff4b4b", mb: 2 }}
            >
              ⚠️ Something went wrong
            </Typography>

            <Typography sx={{ color: "#FFD700", mb: 1 }}>
              The app crashed due to an error:
            </Typography>

            {/* Actual Error Message */}
            <Box
              sx={{
                mt: 2,
                p: 2,
                borderRadius: 2,
                background: "#1e1e1e",
                color: "gold",
                maxHeight: 200,
                overflow: "auto",
                fontFamily: "monospace",
                fontSize: "0.9rem",
                textAlign: "left",
              }}
            >
              {String(this.state.error)}
            </Box>

            <Divider sx={{ my: 3, borderColor: "rgba(255,255,255,0.1)" }} />

            <Button
              variant="contained"
              onClick={() => window.location.reload()}
              sx={{
                mt: 1,
                background: "#FFD700",
                color: "#000",
                fontWeight: 700,
                px: 4,
                py: 1,
                borderRadius: 2,
                "&:hover": {
                  background: "#e6c200",
                },
              }}
            >
              Reload Page
            </Button>
          </Paper>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
