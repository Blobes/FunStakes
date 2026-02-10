"use client";

import { useController } from "@/hooks/global";
import { useTheme } from "@mui/material/styles";
import { Posts } from "./post/Posts";
import { Stack } from "@mui/material";
import { RightSidebar } from "./sidebar/RightSidebar";
import { useGlobalContext } from "../GlobalContext";
import { Welcome } from "./Welcome";
import { PostList } from "./post/PostList";

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
            <Posts />
            <RightSidebar />
          </Stack>
        ) : (
          <PostList />
        )
      )}
      {authStatus === "UNAUTHENTICATED" && (
        <Welcome />
      )}
    </>
  )

}