"use client";

import { useEffect } from "react";
import { getFromLocalStorage } from "@/helpers/storage";
import { useController } from "@/hooks/global";
import { Page } from "@/types";
import { useTheme } from "@mui/material/styles";
import { Posts } from "./post/Posts";
import { usePathname, useRouter } from "next/navigation";
import { Stack, Typography } from "@mui/material";
import { RightSidebar } from "./sidebar/RightSidebar";
import { useGlobalContext } from "../GlobalContext";
import { AppButton } from "@/components/Buttons";
import { Footer } from "../(web)/navbars/Footer";
import { clientRoutes } from "@/helpers/routes";

export default function HomePage() {
  const router = useRouter();
  const pathname = usePathname();
  const { isDesktop, handleClick } = useController();
  const theme = useTheme();
  const savedPage = getFromLocalStorage<Page>();
  const savedPath = savedPage?.path;
  const { loginStatus } = useGlobalContext();

  useEffect(() => {
    if (savedPath && savedPath !== pathname) router.push(savedPage.path);
  }, [pathname]);

  return (
    <>
      {loginStatus === "AUTHENTICATED" && (
        isDesktop ? (
          <Stack sx={{
            height: "100%",
            flexDirection: "row",
            overflow: "hidden",
            borderTop: `1px solid ${theme.palette.gray.trans[1]}`,
          }}>
            <Posts />
            <RightSidebar />
          </Stack>
        ) : (
          <Posts />
        )
      )}

      {loginStatus === "UNAUTHENTICATED" && (
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
            <Typography variant="h5" component="h5"> {/* Added variant for MUI consistency */}
              Join millions of stakers on FunStakes
            </Typography>
            <AppButton
              href={clientRoutes.signup.path}
              onClick={(e: React.MouseEvent) =>
                handleClick(clientRoutes.signup, e, { type: "element", savePage: false })
              }
            >
              Get started
            </AppButton>
          </Stack>
          <Footer />
        </>
      )}
    </>
  );
}