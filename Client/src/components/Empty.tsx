import { IconButton, Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { AppButton } from "./Buttons";
import React from "react";
import { RefreshCcw } from "lucide-react";
import { BasicTooltip } from "./Tooltips";

interface EmptyProps {
  headline?: string;
  tagline?: string;
  icon?: React.ReactNode;
  style?: {
    container?: any;
    headline?: any;
    tagline?: any;
    icon?: any;
    primaryCta?: any;
    secondaryCta?: any;
  };
  primaryCta?: {
    type?: "BUTTON" | "ICON";
    variant?: "contained" | "outlined";
    label?: string | React.ReactNode;
    toolTip?: string;
    action: () => void;
  };
  secondaryCta?: {
    type?: "BUTTON" | "ICON";
    label?: string | React.ReactNode;
    toolTip?: string;
    action: () => void;
  };
}

export const Empty: React.FC<EmptyProps> = ({
  headline,
  tagline,
  icon,
  style,
  primaryCta,
  secondaryCta,
}) => {
  const theme = useTheme();
  const primaryCtaType = primaryCta?.type || "BUTTON";
  const secondaryCtaType = secondaryCta?.type || "BUTTON";
  return (
    <Stack
      sx={{
        backgroundColor: theme.palette.gray.trans[1],
        padding: theme.boxSpacing(12, 8),
        textAlign: "center",
        borderRadius: theme.radius[3],
        alignItems: "center",
        justifyContent: "center",
        ...style?.container,
      }}>
      {/* Icon */}
      {icon && (
        <Stack
          sx={{
            width: "32px",
            height: "32px",
            "& svg": {
              width: "100%",
              height: "100%",
              fill: theme.palette.gray[200],
              ...style?.icon?.svg,
            },
            ...style?.icon,
          }}>
          {icon}
        </Stack>
      )}
      {/* Headline */}
      {headline && (
        <Typography
          variant="body1"
          component={"h6"}
          sx={{
            fontWeight: "bold",
            ...style?.headline,
          }}>
          {headline}
        </Typography>
      )}
      {/* Tagline */}
      {tagline && (
        <Typography
          variant="body3"
          sx={{
            ...style?.tagline,
          }}>
          {tagline}
        </Typography>
      )}
      {/* CTAs */}
      {primaryCta &&
        (primaryCtaType === "BUTTON" ? (
          <AppButton
            variant={primaryCta.variant || "contained"}
            style={{
              fontSize: "14px",
              padding: theme.boxSpacing(2, 6),
              marginTop: theme.boxSpacing(6),
              ...style?.primaryCta,
            }}
            onClick={primaryCta.action}>
            {primaryCta.label || "Start"}
          </AppButton>
        ) : (
          <BasicTooltip title={primaryCta.toolTip || ""}>
            <IconButton onClick={primaryCta.action}>
              {primaryCta.label || <RefreshCcw />}
            </IconButton>
          </BasicTooltip>
        ))}
      {secondaryCta &&
        (secondaryCtaType === "BUTTON" ? (
          <AppButton
            variant="text"
            onClick={secondaryCta.action}
            style={{ ...style?.secondaryCta }}>
            {secondaryCta.label || "Start"}
          </AppButton>
        ) : (
          <BasicTooltip title={secondaryCta.toolTip || ""}>
            <IconButton onClick={secondaryCta.action}>
              {secondaryCta.label || <RefreshCcw />}
            </IconButton>
          </BasicTooltip>
        ))}
    </Stack>
  );
};
