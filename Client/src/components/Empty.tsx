import { Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { AppButton } from "./Buttons";

interface EmptyProps {
  headline?: string;
  tagline?: string;
  icon?: React.ReactNode;
  style?: any;
  cta?: { label?: string; action: () => void };
}

export const Empty: React.FC<EmptyProps> = ({
  headline,
  tagline,
  icon,
  style,
  cta,
}) => {
  const theme = useTheme();
  return (
    <Stack
      sx={{
        backgroundColor: theme.palette.gray.trans[1],
        padding: theme.boxSpacing(12, 4),
        textAlign: "center",
        borderRadius: theme.radius[2],
        alignItems: "center",
        ...style.container,
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
            },
            ...style.icon,
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
            ...style.headline,
          }}>
          {headline}
        </Typography>
      )}
      {/* Tagline */}
      {tagline && (
        <Typography
          variant="body3"
          sx={{
            ...style.tagline,
          }}>
          {tagline}
        </Typography>
      )}
      {/* CTA */}
      {cta && (
        <AppButton
          variant="contained"
          style={{
            fontSize: "14px",
            padding: theme.boxSpacing(2, 6),
            marginTop: theme.boxSpacing(6),
          }}
          onClick={cta.action}>
          {cta.label || "Start"}
        </AppButton>
      )}
    </Stack>
  );
};
