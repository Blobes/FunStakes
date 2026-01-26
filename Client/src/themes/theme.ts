"use client";

import { grey, red } from "@mui/material/colors";
import { createTheme, responsiveFontSizes } from "@mui/material/styles";
import componentTheme from "./ComponentTheme";

// Theme configuration
let designSystem = createTheme({
  colorSchemes: {
    light: {
      palette: {
        primary: {
          main: "#506AFF",
          dark: "#4355DC",
        },
        gray: {
          0: "#ffffff",
          50: grey[50],
          100: grey[300],
          200: "#536077",
          300: "#101926",
          trans: {
            1: "rgba(1, 13, 23, 0.06)",
            2: "rgba(1, 13, 23, 0.12)",
            overlay: "rgba(1, 13, 23, 0.50)",
          },
        },
        info: {
          light: "#BBC4E8",
          main: "#4863FF",
          dark: "#10142C",
        },
        error: {
          main: red[400],
        },
        tonalOffset: 0.6,
        contrastThreshold: 4.5,
      },
    },
    dark: {
      palette: {
        primary: {
          main: "#5D71EC",
          dark: "#4355DC",
        },
        gray: {
          0: "#010516",
          50: "#171D3A",
          100: "#324763",
          200: "#617A99",
          300: "#ffffff",
          trans: {
            1: "rgba(255, 255, 255, 0.08)",
            2: "rgba(255, 255, 255, 0.20)",
            overlay: "rgba(1, 13, 23, 0.50)",
          },
        },
        info: {
          light: "#10142C",
          main: "#506AFF",
          dark: "#BBC4E8",
        },
        error: {
          main: red[300],
        },
        tonalOffset: 0.6,
        contrastThreshold: 4.5,
      },
    },
  },
  // Fixed colors
  fixedColors: {
    gray50: grey[50],
    gray800: "#06122B",
    mainTrans: "rgba(63, 121, 228, 0.14)",
  },

  // Overriding & Setting Typography
  typography: {
    fontFamily: "'Manrope','Cabinet Grotesk', Arial, sans-serif",
    h1: { fontWeight: 600 },
    h2: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600, fontSize: "26px" },
    h6: { fontWeight: 600, fontSize: "24px" },
    subtitle1: {
      fontSize: "20px",
      fontWeight: 600,
    },
    body1: { fontSize: "18px" },
    body2: { fontSize: "15px" },
    body3: { fontSize: "14px" },
    caption: {},
    overline: {},
    button: { textTransform: "unset", fontSize: "16px" },
  },

  // Radius
  radius: {
    0: "0px",
    1: "4px",
    2: "8px",
    3: "12px",
    4: "16px",
    5: "20px",
    6: "24px",
    full: "1000px",
  },
  // Padding & Margin Spacing
  boxSpacing: (top, right, bottom, left) => {
    return `${top * 2}px ${right || right === 0 ? right * 2 + "px" : ""} ${
      bottom || bottom === 0 ? bottom * 2 + "px" : ""
    } ${left || left === 0 ? left * 2 + "px" : ""}`;
  },

  // Spacing Between Elements
  gap: (value: number) => `${value * 2}px`,
});

designSystem = responsiveFontSizes(designSystem);

// Merge both the design system theme and the component theme
const theme = createTheme({
  ...designSystem,
  components: {
    ...componentTheme.components,
  },
});
export default theme;
