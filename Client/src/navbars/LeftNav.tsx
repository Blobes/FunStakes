import { Stack, Typography, useTheme } from "@mui/material";
import { useSharedHooks } from "@/hooks";
import { useStyles } from "@/helpers/styles";

export const LeftNav = () => {
  const { isDesktop } = useSharedHooks();
  const theme = useTheme();
  const { autoScroll } = useStyles();

  return (
    isDesktop && (
      <Stack
        sx={{
          width: "18%",
          maxWidth: "400px",
          minWidth: "250px",
          padding: theme.boxSpacing(8, 16),
          borderLeft: `1px solid ${theme.palette.gray.trans[1]}`,
          ...autoScroll().base,
          [theme.breakpoints.down("md")]: {
            display: "none",
            ...autoScroll().mobile,
          },
        }}>
        Left hand navigation
      </Stack>
    )
  );
};
