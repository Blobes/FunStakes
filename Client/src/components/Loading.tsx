import { CircularProgress } from "@mui/material";
import { useTheme } from "@mui/material/styles";

interface IconProps {
  style?: any;
  props?: any;
}

export const ProgressIcon: React.FC<IconProps> = ({ style, props: props }) => {
  const theme = useTheme();
  return (
    <CircularProgress
      {...props}
      sx={{ color: theme.palette.primary.light, ...style }}
    />
  );
};
