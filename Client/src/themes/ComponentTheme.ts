"use client";

import { createTheme } from "@mui/material/styles";
import { outlinedInputClasses } from "@mui/material/OutlinedInput";

// Theme configuration
const componentTheme = createTheme({
  // Overriding & Setting Components
  components: {
    //CSS base line
    MuiCssBaseline: {
      styleOverrides: (theme) => ({
        body: {
          WebkitTapHighlightColor: "transparent",
          // Theme switch transition
          "--theme-transition": theme.transitions.create(
            ["background-color", "color", "stroke", "fill"],
            {
              duration: theme.transitions.duration.standard,
            },
          ),
        },
        "div, p, svg": {
          transition: "var(--theme-transition)",
        },
      }),
    },

    // Typography
    MuiTypography: {
      styleOverrides: {
        root: ({ theme }) =>
          theme.unstable_sx({
            color: theme.palette.gray[300],
            margin: "0px",
            width: "inherit",
          }),
      },
    },

    // Buttons
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: ({ theme }) =>
          theme.unstable_sx({
            padding: theme.boxSpacing(4, 9),
            borderRadius: theme.radius.full,
            alignSelf: "flex-start",
            height: "40px",
            fontWeight: "600",
          }),
        contained: ({ theme }) =>
          theme.unstable_sx({
            backgroundColor: theme.palette.primary.main,
            color: theme.fixedColors.gray50,
            "&:hover": {
              backgroundColor: theme.palette.primary.dark,
            },
            "&:disabled": {
              backgroundColor: theme.palette.primary.main,
              color: theme.fixedColors.gray50,
              opacity: 0.6,
            },
          }),
        outlined: ({ theme }) =>
          theme.unstable_sx({
            borderColor: theme.palette.gray.trans[2],
            color: theme.palette.gray[300],
            "&:hover": {
              backgroundColor: theme.fixedColors.mainTrans,
              borderColor: theme.fixedColors.mainTrans,
            },
          }),
      },
    },

    // Tooltip
    MuiTooltip: {
      styleOverrides: {
        tooltip: ({ theme }) =>
          theme.unstable_sx({
            padding: theme.boxSpacing(3, 5),
            backgroundColor: theme.fixedColors.gray800,
            color: theme.fixedColors.gray50,
            fontSize: "12px",
            borderRadius: theme.radius[2],
            boxShadow: theme.shadows[1],
            maxWidth: 420,
            margin: theme.boxSpacing(0, 6),
            border: `1px solid ${theme.palette.gray.trans[1]}`,
          }),
        arrow: ({ theme }) =>
          theme.unstable_sx({
            color: theme.fixedColors.gray800,
            fontSize: "13px",
          }),
      },
    },

    // IconButton
    MuiIconButton: {
      styleOverrides: {
        root: ({ theme }) =>
          theme.unstable_sx({
            padding: theme.boxSpacing(3),
            margin: 0,
          }),
      },
    },

    // Container
    MuiContainer: {
      styleOverrides: {
        root: ({ theme }) => ({
          overflow: "hidden",
          [theme.breakpoints.down("sm")]: {
            padding: theme.boxSpacing(3),
          },
          [theme.breakpoints.between("sm", "lg")]: {
            padding: theme.boxSpacing(6),
          },
          [theme.breakpoints.up("lg")]: {
            padding: theme.boxSpacing(8),
            maxWidth: "1440px",
          },
        }),
      },
    },

    // Stack
    MuiStack: {
      styleOverrides: {
        root: ({ theme }) => ({
          gap: theme.gap(4),
        }),
      },
    },

    // Grid
    MuiGrid2: {
      styleOverrides: {
        root: ({ theme }) => ({}),
      },
    },

    // Card
    MuiCard: {
      styleOverrides: {
        root: ({ theme }) =>
          theme.unstable_sx({
            backgroundColor: theme.fixedColors.mainTrans,
            borderRadius: theme.radius[4],
            boxShadow: "unset",
          }),
      },
    },
    // Card Header
    MuiCardHeader: {
      styleOverrides: {
        root: ({ theme }) =>
          theme.unstable_sx({
            gap: theme.gap(2),
          }),
        avatar: ({ theme }) =>
          theme.unstable_sx({
            margin: 0,
          }),
      },
    },

    // Paper
    MuiPaper: {
      defaultProps: {
        elevation: 8,
      },
      styleOverrides: {
        root: ({ theme }) =>
          theme.unstable_sx({
            borderRadius: theme.radius[4],
          }),
        elevation: ({ theme }) =>
          theme.unstable_sx({
            backgroundColor: theme.palette.gray[0],
            backgroundImage:
              "linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05))",
          }),
        outlined: ({ theme }) =>
          theme.unstable_sx({
            backgroundColor: "unset",
            border: `1px solid ${theme.palette.gray.trans[1]}`,
          }),
        elevation8: {
          boxShadow: "4px 8px 24px rgba(0, 0, 0, 0.2)",
        },
      },
    },

    // Nav Menu Popup
    MuiMenu: {
      styleOverrides: {
        paper: ({ theme }) =>
          theme.unstable_sx({
            backgroundColor: theme.palette.gray[0],
            borderRadius: theme.radius[4],
          }),
      },
    },

    // App Bar
    MuiAppBar: {
      styleOverrides: {
        root: ({ theme }) =>
          theme.unstable_sx({
            background: "unset",
            borderRadius: theme.radius[0],
            boxShadow: "none",
            minHeight: "44px",
            padding: theme.boxSpacing(6),
            [theme.breakpoints.down("md")]: {
              minHeight: "32px",
              padding: theme.boxSpacing(5),
            },
          }),
      },
    },

    // Tool Bar
    MuiToolbar: {
      styleOverrides: {
        root: ({ theme }) =>
          theme.unstable_sx({
            [theme.breakpoints.down("lg")]: {
              minHeight: "32px",
              padding: theme.boxSpacing(3),
            },
          }),
      },
    },

    MuiDivider: {
      styleOverrides: {
        root: ({ theme }) =>
          theme.unstable_sx({
            width: "100%",
            margin: theme.boxSpacing(4, 0),
          }),
      },
    },

    MuiTextField: {
      styleOverrides: {
        root: ({ theme }) =>
          theme.unstable_sx({
            "--TextField-default": theme.palette.gray[50],
            "--TextField-success": theme.palette.info.main,
            "--TextField-error": theme.palette.error.main,

            "& .MuiInputBase-input": {
              fontSize: "15px",
            },
            "& label": {
              fontSize: "14px",
              transform: "translate(14px, 12px)",
            },
            "& label.Mui-error": {
              color: "var(--TextField-error)",
            },
            "& label.Mui-focused, & label.MuiInputLabel-shrink": {
              transform: "translate(14px, -9px) scale(0.95)",
            },

            "& .MuiFormHelperText-root": {
              fontSize: "13px",
              lineHeight: "1.2em",
              margin: theme.boxSpacing(2, 0, 0, 0),
            },
          }),
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme }) =>
          theme.unstable_sx({
            borderColor: "var(--TextField-default)",
            borderRadius: theme.radius[3],
            maxWidth: "600px",
            minWidth: "150px",
            padding: theme.boxSpacing(2, 6, 2, 0),
            [`& .Mui-error .${outlinedInputClasses.notchedOutline}`]: {
              borderColor: "var(--TextField-error)",
            },
          }),
      },
    },
  },
});
export default componentTheme;
