"use client";

import { useEffect } from "react";
import { getFromLocalStorage } from "@/helpers/storage";
import { useController } from "@/hooks/global";
import { Page } from "@/types";
import { useTheme } from "@mui/material/styles";
import { Posts } from "./post/Posts";
import { usePathname, useRouter } from "next/navigation";
import { Stack, Typography } from "@mui/material";
import { RightSidebar } from "./feed-sidebar/RightSidebar";
import { useAppContext } from "./AppContext";
import { AppButton } from "@/components/Buttons";
import { Footer } from "@/navbars/Footer";

export default function HomePage() {
  const router = useRouter();
  const pathname = usePathname();
  const { isDesktop } = useController();
  const theme = useTheme();
  const savedPage = getFromLocalStorage<Page>();
  const savedPath = savedPage?.path;
  const { loginStatus } = useAppContext();

  useEffect(() => {
    if (savedPath && savedPath !== pathname) router.push(savedPage.path);
  }, [savedPath]);

  return loginStatus === "AUTHENTICATED" ? (
    isDesktop ?
      <Stack sx={{
        height: "100%",
        flexDirection: "row",
        overflow: "hidden",
        borderTop: `1px solid ${theme.palette.gray.trans[1]}`,
      }}>
        <Posts />
        <RightSidebar />
      </Stack> : <Posts />
  ) : (
    <>
      <Stack
        sx={{
          alignItems: "center",
          textAlign: "center",
          justifyContent: "center",
          height: "100%",
          width: "100%",
          minHeight: "fit-content",
          padding: theme.boxSpacing(12),
        }}>
        <Typography component="h5">
          Join millions of stakers on FunStakes
        </Typography>
        <AppButton onClick={() => router.replace("/auth/login")}>
          Get started
        </AppButton>
      </Stack>
      <Footer />
    </>

  );
}
