import { Stack, Typography, useTheme } from "@mui/material";
import { useSharedHooks } from "@/hooks";
import { useStyles } from "@/helpers/styles";
import { useAppContext } from "@/app/AppContext";
import { useEffect, useState } from "react";
import { delay, isOnline } from "@/helpers/others";
import { ProgressIcon } from "@/components/Loading";
import { AppButton } from "@/components/Buttons";
import { useRouter } from "next/navigation";

export const LeftNav = () => {
  const { isDesktop } = useSharedHooks();
  const theme = useTheme();
  const { autoScroll } = useStyles();
  const [loading, setLoading] = useState(false);
  const { loginStatus } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    const handleNav = async () => {
      if (loginStatus === "UNKNOWN") {
        setLoading(true);
        await delay();
        setLoading(false);
      }
    };
    handleNav();
  }, [isOnline()]);

  return (
    isDesktop && (
      <Stack
        sx={{
          width: "18%",
          maxWidth: "400px",
          minWidth: "250px",
          padding: theme.boxSpacing(8, 16),
          borderRight: `1px solid ${theme.palette.gray.trans[1]}`,
          alignItems: loading || loginStatus === "UNKNOWN" ? "center" : "unset",
          justifyContent:
            loading || loginStatus === "UNKNOWN" ? "center" : "unset",
          ...autoScroll().base,
          [theme.breakpoints.down("md")]: {
            display: "none",
            ...autoScroll().mobile,
          },
        }}>
        {loading && <ProgressIcon otherProps={{ size: 20 }} />}
        {!loading && isOnline() && loginStatus === "AUTHENTICATED" && (
          <Typography>Left hand navigation</Typography>
        )}
        {!loading && isOnline() && loginStatus === "UNAUTHENTICATED" && (
          <Typography>See what people are talking about today</Typography>
        )}
        {!loading && (!isOnline() || loginStatus === "UNKNOWN") && (
          <Typography
            variant="body2"
            sx={{
              width: "unset",
              color: theme.palette.gray[200],
            }}>
            Failed to load menu
          </Typography>
        )}
      </Stack>
    )
  );
};
