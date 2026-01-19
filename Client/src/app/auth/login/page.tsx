"use client";

import { useTheme } from "@mui/material/styles";
import { AuthStepper } from "./AuthStepper";
import { Stack } from "@mui/material";
import { useEffect } from "react";
import { useAppContext } from "@/app/AppContext";
import { useRouter } from "next/navigation";
import { getFromLocalStorage } from "@/helpers/others";
import { SavedPage } from "@/types";
import { clientRoutes } from "@/helpers/info";
import { Empty } from "@/components/Empty";
import { ShieldCheck } from "lucide-react";
import { useSharedHooks } from "@/hooks";
import { useAuth } from "../authHooks";

export default function LoginPage() {
  const theme = useTheme();
  const { loginStatus } = useAppContext();
  const router = useRouter();
  const savedPage = getFromLocalStorage<SavedPage>();
  const savedPath = savedPage?.path;
  const { setLastPage } = useSharedHooks();
  const { handleLogout } = useAuth();

  const handleBack = () => {
    setLastPage(clientRoutes.home);
    router.replace(clientRoutes.home.path);
  };

  return (
    <Stack
      sx={{
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
        padding: theme.boxSpacing(10),
      }}>
      {loginStatus === "UNAUTHENTICATED" ? (
        <AuthStepper
          style={{
            container: {
              width: "400px",
              padding: theme.boxSpacing(18, 16),
            },
          }}
        />
      ) : (
        <Empty
          headline="You are still logged in"
          tagline="Return to funstakes.com or logout."
          style={{
            container: { padding: theme.boxSpacing(18) },
            primaryCta: { width: "100%" },
            icon: {
              width: "40px",
              height: "40px",
              svg: {
                fill: "none",
                strokeWidth: "1px",
              },
            },
          }}
          icon={<ShieldCheck />}
          primaryCta={{ label: "Go to Funstakes.com", action: handleBack }}
          secondaryCta={{ label: "Logout", action: handleLogout }}
        />
      )}
    </Stack>
  );
}
