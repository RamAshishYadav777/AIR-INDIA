// src/theme.ts
import { createTheme } from "@mui/material/styles";
import type { ThemeOptions } from "@mui/material/styles";

const themeOptions: ThemeOptions = {
  palette: {
    primary: {
      main: "#B22222", // Dark Red (for main backgrounds)
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#000000", // Black (navbar, footer)
      contrastText: "#FFFFFF",
    },
    action: {
      hover: "#FFD700", // Golden hover
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          backgroundColor: "#B22222", // Red buttons
          color: "#fff",
          "&:hover": {
            backgroundColor: "#FFD700", // Golden on hover
            color: "#000",
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#000000", // Black navbar
        },
      },
    },
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          backgroundColor: "#000000", // Black footer
          color: "#fff",
        },
      },
    },
  },
  typography: {
    fontFamily: "Roboto, Arial, sans-serif",
  },
};

const theme = createTheme(themeOptions);

export default theme;
