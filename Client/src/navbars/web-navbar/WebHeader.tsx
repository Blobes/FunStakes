"use client";

import React, { useEffect } from "react";
import { AppBar, Stack, IconButton } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { usePathname } from "next/navigation";
import { useAppContext } from "@/app/AppContext";
import { useController } from "@/hooks/generalHooks";
import { DesktopWebNav, MobileWebNav } from "./WebNav";
import { AnchorLink, AppButton } from "@/components/Buttons";
import { clientRoutes } from "@/helpers/info";
import { img } from "@/assets/exported";
import Image from "next/image";
import { Menu } from "lucide-react";

export const WebHeader: React.FC = () => {
  const { loginStatus } = useAppContext();
  const {
    setLastPage,
    openModal,
    closeModal,
    isDesktop,
    isOnWeb,
    handleWindowResize,
    handleLinkClick,
  } = useController();
  const theme = useTheme();
  const isLoggedIn = loginStatus === "AUTHENTICATED";
  const pathname = usePathname();

  /* ---------------------------------- effects --------------------------------- */
  useEffect(() => {
    window.addEventListener("resize", handleWindowResize);
    return () => window.removeEventListener("resize", handleWindowResize);
  }, []);

  /* -------------------------------- handlers --------------------------------- */

  const openMobileWebNav = () =>
    openModal({
      content: (
        <MobileWebNav
          style={{
            gap: theme.gap(4),
          }}
        />
      ),
      source: "navbar",
      onClose: () => closeModal(),
      style: {
        content: { otherStyles: { height: "100%" } },
      },
    });

  /* ---------------------------------- render ---------------------------------- */
  return (
    <AppBar
      position="sticky"
      component="nav"
      aria-label="Main navigation"
      role="navigation"
      sx={{
        zIndex: 500,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexDirection: "row",
        gap: theme.gap(6),
        borderBottom: `1px solid ${theme.palette.gray.trans[1]}`,
      }}>



      {/* Logo */}
      <AnchorLink
        url={clientRoutes.home.path}
        onClick={(e: React.MouseEvent<HTMLAnchorElement>) =>
          handleLinkClick(e, clientRoutes.about)
        }
        style={{ display: "inline-flex" }}
        icon={
          <Image
            src={img.logo}
            alt="logo"
            style={{
              width: 38,
              height: 38,
              borderRadius: `${theme.radius.full}`,
            }}
          />
        }
      />

      {/* Right controls */}
      {isDesktop && (
        <Stack direction="row" alignItems="center" spacing={theme.gap(8)}>
          <DesktopWebNav
            style={{
              display: { xs: "none", md: "flex", flexDirection: "row" },
              gap: theme.gap(4),
            }}
          />

          {isLoggedIn && (
            <AppButton
              href={clientRoutes.home.path}
              variant="outlined"
              style={{ fontSize: "14px" }}
              onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
                handleLinkClick(e, clientRoutes.home)
              }>
              Go to funstakes.com
            </AppButton>
          )}

          {loginStatus === "UNAUTHENTICATED" && (
            <Stack direction="row" alignItems="center" spacing={theme.gap(0)}>
              <AppButton
                href={clientRoutes.signup.path}
                style={{ fontSize: "14px" }}
                onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
                  handleLinkClick(e, clientRoutes.signup, false)
                }>
                Sign up
              </AppButton>
              <AppButton
                href={clientRoutes.login.path}
                variant="outlined"
                style={{ fontSize: "14px" }}
                onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
                  handleLinkClick(e, clientRoutes.login, false)
                }>
                Login
              </AppButton>
            </Stack>
          )}
        </Stack>)}

      {/* Mobile hamburger (logged out only) */}
      {!isDesktop && (
        <IconButton onClick={openMobileWebNav} aria-label="Open menu">
          <Menu />
        </IconButton>
      )}

    </AppBar>
  );
};
