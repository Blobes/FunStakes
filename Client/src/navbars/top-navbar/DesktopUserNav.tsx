"use client";
import { Stack, svgIconClasses } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useAppContext } from "@/app/AppContext";
import { RenderAdvList } from "../RenderNavLists";
import { MenuPopup, MenuRef } from "@/components/Menus";
import { useNavLists } from "../NavLists";
import { useSharedHooks } from "@/hooks";

export const DesktopUserNav = ({
  menuRef,
}: {
  menuRef: React.RefObject<MenuRef>;
}) => {
  const theme = useTheme();
  const { userNavList } = useNavLists();
  const { setLastPage } = useSharedHooks();
  const { setModalContent } = useAppContext();

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
          <RenderAdvList
            list={userNavList}
            setLastPage={setLastPage}
            onClick={() => {
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
