"use client";

import { useTheme } from "@mui/material/styles";
import { AuthStepper } from "./AuthStepper";
import { Stack } from "@mui/material";
import { useEffect } from "react";
import { useAppContext } from "@/app/AppContext";
import { useRouter } from "next/navigation";
import { getFromLocalStorage } from "@/helpers/others";
import { SavedPage } from "@/types";

export default function LoginPage() {
  const theme = useTheme();
  const { loginStatus, lastPage } = useAppContext();
  const router = useRouter();

  const savedPage = getFromLocalStorage<SavedPage>();
  const savedPath = savedPage?.path;

  useEffect(() => {
    if (savedPath && loginStatus === "AUTHENTICATED") {
      router.replace(savedPage.path);
    }
  }, [savedPath]);

  return (
    <Stack
      sx={{
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
        padding: theme.boxSpacing(10),
      }}>
      <AuthStepper
        style={{
          container: {
            width: "400px",
            padding: theme.boxSpacing(18, 16),
          },
        }}
      />
    </Stack>
  );
}
