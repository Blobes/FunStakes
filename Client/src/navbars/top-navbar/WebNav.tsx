"use client";
import React, { useRef } from "react";
import { Divider, Stack, Typography, typographyClasses } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { RenderAdvList, RenderSimpleList } from "../RenderNavLists";
import { MenuRef } from "@/components/Menus";
import { useNavLists } from "../NavLists";
import { useSharedHooks } from "@/hooks";
import { AppButton } from "@/components/Buttons";
import { img } from "@/assets/exported";
import Image from "next/image";

interface WebNavProps {
  style?: any;
}
export const DesktopWebNav: React.FC<WebNavProps> = ({ style }) => {
  const theme = useTheme();
  const { webNavList } = useNavLists();
  const menuRef = useRef<MenuRef>(null);
  const { setLastPage, closeModal } = useSharedHooks();

  return (
    <Stack sx={{ ...style }}>
      <RenderAdvList
        list={webNavList}
        setLastPage={setLastPage}
        onClose={() => {
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

const CTA = () => {
  const theme = useTheme();
  return (
    <Stack sx={{ gap: theme.gap(10) }}>
      <Typography component="h6" variant="h6">
        Join Funstakes Today
      </Typography>
      <Image
        src={img.logo}
        alt="logo"
        style={{
          width: "100%",
          height: "150px",
          objectFit: "cover",
          borderRadius: `${theme.radius[2]}`,
          margin: theme.boxSpacing(2, 0),
        }}
      />
      <Stack direction="row" sx={{ gap: theme.gap(6), width: "100%" }}>
        <AppButton
          variant="outlined"
          style={{
            fontSize: "13px",
            padding: theme.boxSpacing(2, 4),
            borderColor: theme.palette.gray[100],
            width: "100%",
          }}>
          Login
        </AppButton>
        <AppButton
          variant="contained"
          style={{
            fontSize: "13px",
            padding: theme.boxSpacing(2, 4),
            borderColor: theme.palette.gray[100],
            width: "100%",
          }}>
          Sign Up
        </AppButton>
      </Stack>
    </Stack>
  );
};

export const MobileWebNav: React.FC<WebNavProps> = ({ style }) => {
  const theme = useTheme();
  const { webNavList, footerNavList } = useNavLists();
  const menuRef = useRef<MenuRef>(null);
  const { setLastPage, closeModal } = useSharedHooks();

  return (
    <Stack sx={{ ...style }}>
      <CTA />
      <Divider />
      <RenderAdvList
        list={webNavList}
        setLastPage={setLastPage}
        onClose={() => {
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
      <RenderSimpleList
        list={footerNavList} // Footer list
        setLastPage={setLastPage}
        onClose={() => {
          menuRef.current?.closeMenu();
          closeModal();
        }}
        style={{
          [`& .${typographyClasses.root}`]: {
            padding: theme.boxSpacing(1, 0, 0, 0),
            fontSize: "12px",
          },
        }}
      />
    </Stack>
  );
};
