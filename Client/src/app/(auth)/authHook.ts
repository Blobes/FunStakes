"use client";

import { fetcher, fetchUserWithTokenCheck } from "@/helpers/fetcher";
import { clientRoutes, serverApi } from "@/helpers/routes";
import { useGlobalContext } from "../GlobalContext";
import { usePathname, useRouter } from "next/navigation";
import { useSnackbar } from "@/hooks/snackbar";
import { usePage } from "@/hooks/page";

export const useAuth = () => {
  const { setAuthUser, setAuthStatus, setSnackBarMsg } = useGlobalContext();
  const { setLastPage } = usePage();
  const { setSBMessage } = useSnackbar();
  const router = useRouter();
  const pathname = usePathname();

  const verifyAuth = async () => {
    try {
      const res = await fetchUserWithTokenCheck();
      // Success
      if (res.status === "SUCCESS" && res.payload) {
        setAuthUser(res.payload);
        setAuthStatus("AUTHENTICATED");
        return;
      }

      // Network Erorr / Offline
      if (res.status === "ERROR") {
        setAuthUser(null);
        setAuthStatus("ERROR");
        if (res.message)
          setSBMessage({
            msg: { content: res.message, msgStatus: "ERROR", hasClose: true },
          });
        return;
      }

      // Unauthorized State
      if (res.status === "UNAUTHORIZED") {
        setAuthUser(null);
        setAuthStatus("UNAUTHENTICATED");
        return;
      }
    } catch (err: any) {
      // If we reach here, a critical code error occurred
      setAuthUser(null);
      setAuthStatus("ERROR");
      console.log("Bad really bad");
    }
  };

  // Logout
  const handleLogout = async () => {
    try {
      //  Send logout request to backend
      await fetcher(serverApi.logout, { method: "POST" });
      setAuthUser(null);
      setAuthStatus("UNAUTHENTICATED");
      if (pathname !== clientRoutes.home.path) {
        setLastPage(clientRoutes.home);
        router.replace(clientRoutes.home.path);
      } else {
        router.refresh();
      }
    } catch (error: any) {
      setSBMessage({
        msg: { content: error.message, msgStatus: "ERROR" },
      });
      console.error("Logout failed:", error);
    }
    //Reset feedback state
    setSnackBarMsg((prev) => ({ ...prev, messages: [], inlineMsg: null }));
  };

  return {
    verifyAuth,
    handleLogout,
  };
};
