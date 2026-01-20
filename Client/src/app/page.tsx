"use client";

import { useEffect } from "react";
import { getFromLocalStorage } from "@/helpers/others";
import { useSharedHooks } from "@/hooks";
import { SavedPage } from "@/types";
import { useTheme } from "@mui/material/styles";
import { Posts } from "./post/Posts";
import { usePathname, useRouter } from "next/navigation";
import { Stack, Typography } from "@mui/material";
import { RightSidebar } from "./feed-sidebar/RightSidebar";
import { useAppContext } from "./AppContext";
import { AppButton } from "@/components/Buttons";

export default function HomePage() {
  const router = useRouter();
  const pathname = usePathname();
  const { setLastPage } = useSharedHooks();
  const theme = useTheme();
  const savedPage = getFromLocalStorage<SavedPage>();
  const savedPath = savedPage?.path;
  const { loginStatus } = useAppContext();

  useEffect(() => {
    if (savedPath && savedPath !== pathname) router.push(savedPage.path);
  }, [savedPath]);
  return loginStatus === "AUTHENTICATED" ? (
    <Stack>
      <Posts />
      <RightSidebar />
    </Stack>
  ) : (
    <Stack
      sx={{
        alignItems: "center",
        textAlign: "center",
        justifyContent: "center",
      }}>
      <Typography component="h5">
        Join millions of stakers on FunStakes
      </Typography>
      <AppButton onClick={() => router.replace("/auth/login")}>
        Get started
      </AppButton>
    </Stack>
  );
}
