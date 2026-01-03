"use client";

import { Typography, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";

export const Footer = () => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  return (
    isDesktop && <Typography variant="body1">This is the footer</Typography>
  );
};
