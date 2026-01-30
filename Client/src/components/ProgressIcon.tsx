import { CircularProgress } from "@mui/material";
import { useTheme } from "@mui/material/styles";

interface IconProps {
  style?: any;
  otherProps?: any;
}

export const ProgressIcon: React.FC<IconProps> = ({ style, otherProps }) => {
  const theme = useTheme();
  return (
    <CircularProgress
      {...otherProps}
      sx={{ color: theme.palette.primary.light, ...style }}
    />
  );
};
