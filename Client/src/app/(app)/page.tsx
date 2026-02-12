"use client";

import { useController } from "@/hooks/global";
import { useTheme } from "@mui/material/styles";
import { Stack } from "@mui/material";
import { RightSidebar } from "./(home)/sidebar/RightSidebar";
import { useGlobalContext } from "../GlobalContext";
import { Welcome } from "./Welcome";
import { Feed } from "./(home)/Feed";

export default function HomePage() {
  const { isDesktop } = useController();
  const theme = useTheme();
  const { authStatus } = useGlobalContext();


  return (
    <>
      {authStatus === "AUTHENTICATED" && (
        isDesktop ? (
          <Stack sx={{
            height: "100%",
            flexDirection: "row",
            gap: 0,
            overflow: "hidden",
            width: "100%",
          }}>
            <Feed />
            <RightSidebar />
          </Stack>
        ) : (
          <Feed />
        )
      )}
      {authStatus === "UNAUTHENTICATED" && (
        <Welcome />
      )}
    </>
  )

}