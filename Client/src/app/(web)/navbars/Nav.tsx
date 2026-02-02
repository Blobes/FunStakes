"use client";
import React, { useRef } from "react";
import { Divider, Stack } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { RenderItemList } from "@/components/RenderItems";
import { MenuRef } from "@/components/Menus";
import { useNavLists } from "./NavLists";
import { useController } from "@/hooks/global";
import { AppButton } from "@/components/Buttons";
import { useGlobalContext } from "@/app/GlobalContext";
import { clientRoutes } from "@/helpers/routes";
import { usePage } from "@/hooks/page";

interface NavProps {
  style?: any;
}
export const DesktopNav: React.FC<NavProps> = ({ style }) => {
  const theme = useTheme();
  const { headerNavList } = useNavLists();
  const menuRef = useRef<MenuRef>(null);


  return (
    <Stack sx={{ ...style }}>
      <RenderItemList
        list={headerNavList}
        itemAction={() => {
          menuRef.current?.closeMenu();
        }}
        style={{
          padding: theme.boxSpacing(2.5, 6, 2.5, 6),
          fontWeight: "500",
          "& svg": {
            width: "16px",
            height: "16px",
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
  const { navigateTo } = usePage();
  const { authStatus: loginStatus } = useGlobalContext();

  return (
    <Stack sx={{ ...style }}>
      <RenderItemList
        list={headerNavList}
        itemAction={() => {
          menuRef.current?.closeMenu();
        }}
        style={{
          padding: theme.boxSpacing(4, 6),
          textAlign: "left",
          gap: theme.boxSpacing(6),
          width: "100%",
          "& svg": {
            stroke: theme.palette.gray[200],
            width: "20px",
            height: "20px",
          },
        }}
      />
      <Divider />
      {loginStatus === "AUTHENTICATED" && (
        <AppButton
          href={clientRoutes.home.path}
          variant="outlined"
          style={{ fontSize: "14px" }}
          onClick={() =>
            navigateTo(clientRoutes.home, { type: "element", loadPage: true, })
          }>
          Go to funstakes.com
        </AppButton>
      )}

      {loginStatus === "UNAUTHENTICATED" && (
        <>
          <AppButton
            href={clientRoutes.signup.path}
            style={{ fontSize: "14px" }}
            onClick={() =>
              navigateTo(clientRoutes.signup,
                { type: "element", savePage: false, loadPage: true, })
            }>
            Sign up
          </AppButton>
          <AppButton
            href={clientRoutes.login.path}
            variant="outlined"
            style={{ fontSize: "14px" }}
            onClick={() =>
              navigateTo(clientRoutes.login,
                { type: "element", savePage: false, loadPage: true, })
            }>
            Login
          </AppButton>
        </>
      )}
    </Stack>
  );
};
