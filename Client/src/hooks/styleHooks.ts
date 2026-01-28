"use client";

import { useTheme } from "@mui/material/styles";
import { img } from "@/assets/exported";
import { zIndexes } from "@/helpers/others";

export const useStyles = () => {
  const theme = useTheme();

  const scrollBarStyle = () => {
    return {
      "&::-webkit-scrollbar": {
        height: "6px",
        width: "6px",
      },
      "&::-webkit-scrollbar-track": {
        borderRadius: theme.radius[2],
        margin: "0px 8px",
      },
      "&::-webkit-scrollbar-thumb": {
        background: theme.palette.gray[100] /* Scrollbar color */,
        borderRadius: theme.radius[2],
        boxShadow: "inset 0 0 4px 4px rgba(0, 0, 0, 0.1)",
      },
      "&::-webkit-scrollbar-thumb:hover": {
        background: theme.palette.gray.trans[2] /* Color on hover */,
      },
    };
  };

  const autoScroll = () => ({
    base: {
      overflowY: "auto",
      height: "100%",
      "&::-webkit-scrollbar": {
        width: "0px",
      },
    },
    mobile: {
      height: "fit-content",
      width: "100%",
      overflowY: "unset",
    },
  });

  const applyBGPattern = () => ({
    "& > *": { zIndex: zIndexes[5] }, // Keep the parent container at the top
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundImage: `url(${img.doodle})`,
      backgroundRepeat: "repeat",
      backgroundSize: "800px",
      opacity: 0.3,
      zIndex: zIndexes.minimum,
    },
  });

  return { scrollBarStyle, autoScroll, applyBGPattern };
};
