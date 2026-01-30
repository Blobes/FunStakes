"use client";

import { useRef } from "react";
import {
  Typography,
  Divider,
  Stack,
  svgIconClasses,
  IconButton,
  typographyClasses,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useGlobalContext } from "@/app/GlobalContext";
import { Strip } from "../components/StripBar";
import { summarizeNum } from "@/helpers/numberSum";
import { RenderItemList } from "../components/RenderItems";
import { MenuRef, MenuPopup } from "@/components/Menus";
import { useNavLists } from "./NavLists";
import { useController } from "@/hooks/global";
import { CircleCheckBig, WalletMinimal } from "lucide-react";
import { ThemeMode } from "@/components/ThemeSwitcher";

export const DesktopUserNav = ({
  menuRef,
}: {
  menuRef: React.RefObject<MenuRef>;
}) => {
  const theme = useTheme();
  const { userNavList } = useNavLists();
  const { setModalContent } = useGlobalContext();

  return (
    <Stack
      sx={{
        display: {
          xs: "none",
          md: "flex",
        },
        position: "absolute",
        flexDirection: "row",
        gap: theme.gap(4),
      }}>
      <MenuPopup
        ref={menuRef}
        contentElement={
          <RenderItemList
            list={userNavList}
            itemAction={() => {
              menuRef.current?.closeMenu();
              setModalContent(null);
            }}
            style={{
              padding: theme.boxSpacing(4, 8),
              borderRadius: "unset",
              gap: theme.gap(8),
              [`& .${svgIconClasses.root}`]: {
                fill: theme.palette.gray[200],
                width: "20px",
                height: "20px",
              },
            }}
          />
        }
      />
    </Stack>
  );
};

// Mobile-specific wrapper for the same RenderList
// User info
const UserInfo = () => {
  const theme = useTheme();
  const authUser = useGlobalContext().authUser;
  if (!authUser) return null;

  const { firstName, lastName, profileImage, username, followers, following } =
    authUser;
  return (
    <Stack>
      <Stack
        sx={{
          gap: theme.gap(4),
          flexDirection: "row",
          alignItems: "center",
        }}>
        <Stack sx={{ gap: theme.gap(0), width: "100%" }}>
          <Typography variant="body1" sx={{ fontWeight: "600" }}>
            {firstName} {lastName}
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.gray[200] }}>
            {username}
          </Typography>
        </Stack>
        <IconButton sx={{ fontSize: "20px", fontWeight: "500" }}>
          <WalletMinimal style={{ width: "20px", height: "20px" }} />
          12K
        </IconButton>
      </Stack>
      <Divider />
      <Strip
        items={[
          {
            text: followers?.length! > 1 ? " Followers" : " Follower",
            element: (
              <strong style={{ color: theme.palette.gray[300] as string }}>
                {summarizeNum(followers?.length!)}
              </strong>
            ),
          },
          {
            text: " Following",
            element: (
              <strong style={{ color: theme.palette.gray[300] as string }}>
                {summarizeNum(following?.length!)}
              </strong>
            ),
          },
          {
            text: " Likes",
            element: (
              <strong style={{ color: theme.palette.gray[300] as string }}>
                {summarizeNum(3)}
              </strong>
            ),
          },
        ]}
        style={{
          justifyContent: "space-between",
        }}
      />
    </Stack>
  );
};

export const MobileUserNav = ({ }) => {
  const theme = useTheme();
  const { userNavList } = useNavLists();
  const { closeModal } = useController();
  const menuRef = useRef<MenuRef>(null);

  return (
    <Stack>
      <UserInfo />
      <Divider />
      <Stack direction="row" gap={theme.gap(10)} alignItems="center">
        <CircleCheckBig style={{ width: "18px", height: "18px" }} />
        <Typography variant="body2" sx={{ fontWeight: "600" }}>
          Active now
        </Typography>
      </Stack>
      <Divider />
      <Stack gap={theme.gap(10)}>
        <RenderItemList
          list={userNavList}
          itemAction={() => {
            menuRef.current?.closeMenu();
            closeModal();
          }}
          showCurrentPage={false}
          style={{
            gap: theme.gap(10),
            padding: "0",
            background: "none",
            "&:hover": {
              background: "none",
            },
            [`& .${typographyClasses.root}`]: {
              fontSize: "18px",
              "&:hover": {
                color: theme.palette.primary.dark,
              },
            },
            "& svg": {
              width: "22px",
              height: "22px",
            },
          }}
        />
        <Divider />
        <ThemeMode />
      </Stack>
    </Stack>
  );
};
