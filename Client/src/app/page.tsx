"use client";

import { useEffect } from "react";
import { getFromLocalStorage } from "@/helpers/others";
import { useSharedHooks } from "@/hooks";
import { SavedPage } from "@/types";
import { useTheme } from "@mui/material/styles";
import { Posts } from "./post/Posts";
import { usePathname, useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const pathname = usePathname();
  const { setLastPage } = useSharedHooks();
  const theme = useTheme();
  const savedPage = getFromLocalStorage<SavedPage>();
  const savedPath = savedPage?.path;

  useEffect(() => {
    if (savedPath && savedPath !== pathname) router.push(savedPage.path);
  }, [savedPath]);
  return <Posts />;
}
