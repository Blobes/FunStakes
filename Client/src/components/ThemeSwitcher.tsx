"use client";

import { useColorScheme, useTheme } from "@mui/material/styles";
import { Stack } from "@mui/material";
import React from "react";
import { BasicTooltip } from "./Tooltips";
import { MoonStar, Sun } from "lucide-react";

export const ThemeSwitcher: React.FC = () => {
  const { mode, systemMode, setMode } = useColorScheme();
  const theme = useTheme();
  const effectiveMode = mode === "system" ? systemMode ?? "dark" : mode;

  const toggleMode = () => {
    setMode(effectiveMode === "dark" ? "light" : "dark");
  };

  return (
    <Stack
      role="switch"
      aria-checked={effectiveMode === "dark"}
      onClick={toggleMode}
      sx={{
        width: 44,
        padding: theme.boxSpacing(1),
        borderRadius: theme.radius.full,
        backgroundColor: theme.palette.gray.trans[1],
        border: `1px solid ${theme.palette.gray.trans[1]}`,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        "&:hover": {
          backgroundColor: theme.palette.gray.trans[2],
        },
      }}>
      {/* THUMB */}
      <Stack
        sx={{
          width: 22,
          height: 22,
          borderRadius: theme.radius.full,
          backgroundColor: theme.palette.gray[0],
          padding: theme.boxSpacing(2),
          alignItems: "center",
          justifyContent: "center",
          transition: "transform 200ms cubic-bezier(0.4, 0, 0.2, 1)",
          transform:
            effectiveMode === "dark" ? "translateX(8px)" : "translateX(-8px)",
        }}>
        <BasicTooltip
          title={effectiveMode === "dark" ? "Dark Theme" : "Light Theme"}>
          {effectiveMode === "dark" ? (
            <MoonStar
              fontSize="small"
              style={{ width: "100%", height: "100%" }}
            />
          ) : (
            <Sun fontSize="small" style={{ width: "100%", height: "100%" }} />
          )}
        </BasicTooltip>
      </Stack>
    </Stack>
  );
};
