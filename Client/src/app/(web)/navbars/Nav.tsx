"use client";
import React, { useRef } from "react";
import { Divider, Stack, typographyClasses } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { RenderItemList } from "@/components/RenderItems";
import { MenuRef } from "@/components/Menus";
import { useNavLists } from "./NavLists";
import { useController } from "@/hooks/global";
import { AppButton } from "@/components/Buttons";
import { useGlobalContext } from "@/app/GlobalContext";
import { clientRoutes } from "@/helpers/routes";

interface NavProps {
  style?: any;
}
export const DesktopNav: React.FC<NavProps> = ({ style }) => {
  const theme = useTheme();
  const { headerNavList } = useNavLists();
  const menuRef = useRef<MenuRef>(null);
  const { closeModal } = useController();

  return (
    <Stack sx={{ ...style }}>
      <RenderItemList
        list={headerNavList}
        itemAction={() => {
          menuRef.current?.closeMenu();
          closeModal();
        }}
        style={{
          padding: theme.boxSpacing(1, 5, 1, 4),
          "& svg": {
            width: "18px",
            height: "18px",
          },
          [`& .${typographyClasses.root}`]: {
            padding: theme.boxSpacing(1, 0, 0, 0),
          },
        }}
      />
    </Stack>
  );
};

export const MobileNav: React.FC<NavProps> = ({ style }) => {
  const theme = useTheme();
  const { headerNavList } = useNavLists();
  const menuRef = useRef<MenuRef>(null);
  const { closeModal, handleLinkClick } = useController();
  const { loginStatus } = useGlobalContext();

  return (
    <Stack sx={{ ...style }}>
      <RenderItemList
        list={headerNavList}
        itemAction={() => {
          menuRef.current?.closeMenu();
          closeModal();
        }}
        style={{
          padding: theme.boxSpacing(1, 5, 1, 4),
          "& svg": {
            fill: theme.palette.gray[200],
            width: "20px",
            height: "20px",
          },
          [`& .${typographyClasses.root}`]: {
            padding: theme.boxSpacing(1, 0, 0, 0),
          },
        }}
      />
      <Divider />
      {loginStatus === "AUTHENTICATED" && (
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
        <>
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
        </>
      )}
    </Stack>
  );
};
