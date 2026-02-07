"use client";

import { AppBar, Stack } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useGlobalContext } from "@/app/GlobalContext";
import { useController } from "@/hooks/global";
import { SearchContainer } from "@/components/Search";
import OfflineAvatar from "@/assets/svgs/offline-avatar.svg"
import { AnchorLink, AppButton } from "@/components/Buttons";
import { clientRoutes } from "@/helpers/routes";
import { img } from "@/assets/exported";
import Image from "next/image";
import { zIndexes } from "@/helpers/global";
import { usePage } from "@/hooks/page";
import { usePageScroll } from "@/hooks/pageScroll";

interface AppHeaderProps {
  scrollRef?: React.RefObject<HTMLElement | null>;
}
export const Header: React.FC<AppHeaderProps> = ({ scrollRef }) => {
  const { authStatus } = useGlobalContext();
  const { isDesktop } = useController();
  const { navigateTo } = usePage();
  const { handlePageScroll } = usePageScroll();
  const theme = useTheme();
  const isLoggedIn = authStatus === "AUTHENTICATED";
  const scrollDir = handlePageScroll(scrollRef);

  /* ---------------------------------- render ---------------------------------- */
  return (
    <AppBar
      position="sticky"
      component="nav"
      aria-label="Main navigation"
      role="navigation"
      sx={{
        zIndex: zIndexes[500],
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        gap: theme.gap(6),
        backdropFilter: "blur(24px)",
        ...(!isDesktop && {
          transform: scrollDir === "down" ? "translateY(-100%)" : "translateY(0)",
          transition: "transform 0.3s ease-in-out",
        }),
      }}>

      {/* Logo */}
      {(!isDesktop) && (
        <AnchorLink
          url={clientRoutes.home.path}
          onClick={() => {
            navigateTo(clientRoutes.home);
          }}
          style={{ display: "inline-flex" }}
        ><Image
            src={img.logo}
            alt="logo"
            style={{
              width: 34,
              height: 34,
              borderRadius: `${theme.radius.full}`,
            }}
          /></AnchorLink>
      )}

      {/* Search */}
      {isDesktop && <SearchContainer />}

      {/* Right side elements */}
      <Stack direction="row" alignItems="center" spacing={theme.gap(8)}>
        <OfflineAvatar
          style={{
            width: "34px", height: "34px",
            [theme.breakpoints.down("md")]: {
              width: "28px", height: "28px"
            },
          }} />



        {/* Login Button */}
        {authStatus === "UNAUTHENTICATED" && (
          <AppButton
            href={clientRoutes.login.path}
            variant="outlined"
            style={{ fontSize: "14px" }}
            onClick={() =>
              navigateTo(clientRoutes.login,
                { type: "element", savePage: false, loadPage: true })
            }>
            Sign in
          </AppButton>
        )}
      </Stack>
    </AppBar >
  );
};
