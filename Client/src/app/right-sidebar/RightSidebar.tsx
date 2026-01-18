"use client";

import { Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { ProfileCard } from "./RightSidebarCards";
import { Followers } from "./Followers";
import { useAppContext } from "../AppContext";
import { AppButton } from "@/components/Buttons";
import { useRouter } from "next/navigation";
import { useStyles } from "@/helpers/styles";

export const RightSidebar = () => {
  const theme = useTheme();
  const { loginStatus } = useAppContext();
  const router = useRouter();
  const { autoScroll } = useStyles();

  return (
    <Stack
      sx={{
        width: "28%",
        minWidth: "300px",
        maxWidth: "500px",
        gap: theme.gap(8),
        flex: "none",
        padding: theme.boxSpacing(8, 16),
        ...autoScroll().base,
        [theme.breakpoints.down("md")]: {
          display: "none",
          ...autoScroll().mobile,
        },
      }}>
      {loginStatus === "AUTHENTICATED" ? (
        <>
          <ProfileCard />
          <Typography variant="subtitle1" sx={{ width: "100%" }}>
            Those following you
          </Typography>
          <Followers />
        </>
      ) : (
        <Stack sx={{ alignItems: "center", textAlign: "center" }}>
          <Typography component="h5">
            Join millions of stakers on FunStakes
          </Typography>
          <AppButton onClick={() => router.replace("/auth/login")}>
            Get started
          </AppButton>
        </Stack>
      )}
    </Stack>
  );
};
