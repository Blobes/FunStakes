import { CircularProgress, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";

interface ProgressProps {
  style?: any;
  otherProps?: any;
  info?: string;
}

export const ProgressIcon = ({ style, otherProps, info }: ProgressProps) => {
  const theme = useTheme();
  return (
    <>
      <CircularProgress
        {...otherProps}
        sx={{ color: theme.palette.primary.light, ...style }}
      />
      {info && <Typography variant="body2"
        sx={{
          textAlign: "center",
          fontWeight: "500",
          fontStyle: "italic"
        }}>{info}</Typography>}
    </>
  );
};
