"use client";

import React, { useEffect, useRef, MouseEvent } from "react";
import {
  AppBar,
  Toolbar,
  Stack,
  IconButton,
  Link,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Menu } from "@mui/icons-material";
import { usePathname, useRouter } from "next/navigation";

import { useAppContext } from "@/app/AppContext";
import { useSharedHooks } from "../../hooks";

import { DesktopWebNav, MobileWebNav } from "./WebNav";
import { DesktopUserNav, MobileUserNav } from "./UserNav";

import { SearchBar } from "../../components/Search";
import { UserAvatar } from "@/components/UserAvatar";
import { ThemeSwitcher } from "../../components/ThemeSwitcher";
import { AppButton } from "../../components/Buttons";
import { MenuRef } from "@/components/Menus";

import { defaultPage, flaggedRoutes, clientRoutes } from "@/helpers/info";
import { getCookie } from "@/helpers/others";
import { img, Icon } from "@/assets/exported";
import Image from "next/image";

export const Header: React.FC = () => {
  const { loginStatus, authUser, modalContent, isOnline } = useAppContext();
  const { setLastPage, openModal, closeModal } = useSharedHooks();
  const theme = useTheme();
  const router = useRouter();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const isLoggedIn = loginStatus === "AUTHENTICATED";
  const menuRef = useRef<MenuRef>(null);
  const { firstName, lastName, profileImage } = authUser || {};
  const pathname = usePathname();
  const isWeb = flaggedRoutes.web.includes(pathname);
  const tempUser = getCookie("savedUser");

  /* ---------------------------------- effects --------------------------------- */
  useEffect(() => {
    const handleResize = () => {
      if (isDesktop && modalContent?.source === "navbar") {
        closeModal();
      }
    };
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* -------------------------------- handlers --------------------------------- */
  const handleLogoClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    router.push(defaultPage.path);
    setLastPage(defaultPage);
  };

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
      entryDir: "LEFT",
      onClose: () => closeModal(),
      style: {
        content: { otherStyles: { height: "100%" } },
      },
    });

  const openMobileUserNav = () =>
    openModal({
      content: <MobileUserNav />,
      source: "navbar",
      entryDir: "RIGHT",
      onClose: closeModal,
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
      sx={{ zIndex: 500 }}>
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: theme.gap(6),
          padding: theme.boxSpacing(6, 6),
          borderBottom: `1px solid ${theme.palette.gray.trans[1]}`,
        }}>
        <Stack direction="row" alignItems="center" spacing={theme.gap(8)}>
          {/* Mobile hamburger (logged out only) */}
          {isWeb && !isDesktop && (
            <IconButton onClick={openMobileWebNav} aria-label="Open menu">
              <Menu />
            </IconButton>
          )}

          {/* Logo */}
          <Link
            href={defaultPage.path}
            onClick={handleLogoClick}
            sx={{ display: "inline-flex" }}>
            <Image
              src={img.logo}
              alt="logo"
              style={{
                width: 40,
                height: 40,
                borderRadius: `${theme.radius.full}`,
              }}
            />
          </Link>
        </Stack>

        {/* Search */}
        {isLoggedIn && <SearchBar />}

        {/* Right controls */}
        <Stack direction="row" alignItems="center" spacing={theme.gap(8)}>
          {isWeb && isDesktop && (
            <DesktopWebNav
              style={{
                display: { xs: "none", md: "flex", flexDirection: "row" },
                gap: theme.gap(4),
              }}
            />
          )}
          <ThemeSwitcher />

          {isLoggedIn && (
            <>
              {isDesktop && <DesktopUserNav menuRef={menuRef} />}
              <UserAvatar
                userInfo={{ firstName, lastName, profileImage }}
                toolTipValue={isWeb ? "Back to timeline" : "Open menu"}
                style={{ width: "34px", height: "34px" }}
                action={(e) => {
                  if (isWeb) router.replace(clientRoutes.timeline);
                  else
                    isDesktop
                      ? menuRef.current?.openMenu(e.currentTarget)
                      : openMobileUserNav();
                }}
              />
            </>
          )}
          {!isOnline && (
            <Icon.OfflineAvatar style={{ width: "34px", height: "34px" }} />
          )}
          {((!isOnline && !tempUser) || loginStatus === "UNAUTHENTICATED") && (
            <AppButton
              href={clientRoutes.login}
              style={{ fontSize: "14px" }}
              onClick={(e) => {
                e.preventDefault();
                router.push(clientRoutes.login);
              }}>
              Login
            </AppButton>
          )}
        </Stack>
      </Toolbar>
    </AppBar>
  );
};
