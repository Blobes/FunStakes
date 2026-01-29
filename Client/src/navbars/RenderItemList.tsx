"use client";

import React from "react";
import { Typography, typographyClasses } from "@mui/material";
import { useTheme, styled } from "@mui/material/styles";
import { NavItem, GenericObject, Page } from "@/types";
import { matchPaths } from "@/helpers/global";
import { usePathname } from "next/navigation";
import { AnchorLink } from "@/components/Buttons";
import { useController } from "@/hooks/global";

// Styled wrapper for individual nav items
const ItemWrapper = styled(AnchorLink)(({ theme }) =>
  theme.unstable_sx({
    display: "flex",
    alignItems: "center",
    gap: theme.gap(2),
    textDecoration: "none",
    padding: theme.boxSpacing(2, 6),
    color: theme.palette.gray[300],
    cursor: "pointer",
    borderRadius: theme.radius[2],
    transition: theme.transitions.create("background"),

    [`& .${typographyClasses.root}`]: {
      fontSize: "15px",
      fontWeight: "600",
    },
    "&:hover, &:focus": {
      backgroundColor: theme.palette.gray.trans[1],
      outline: "none",
    },
  })
);

// Props for the reusable nav renderer
export interface RenderListProps {
  list: NavItem[];
  itemAction?: () => void;
  style?: GenericObject<string>;
  showCurrentPage?: boolean
}
// Renders an advance nav list
export const RenderItemList: React.FC<RenderListProps> = ({
  list,
  itemAction,
  style = {},
  showCurrentPage = true
}) => {
  const theme = useTheme();
  const pathname = usePathname();
  const { handleLinkClick } = useController();

  return (
    <>
      {list.map((item, index) => {
        if (!item.title && item.element) {
          // Render the "element" alone if there's no title (Divider, custom element, etc.)
          return <React.Fragment key={index}>{item.element}</React.Fragment>;
        }

        const isCurrentPage = matchPaths(pathname, item.url);
        return (
          <ItemWrapper
            key={index}
            url={item.url ?? "#"}
            onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
              const page = {
                title: item.title,
                path: item.url ?? "#",
              };
              handleLinkClick(e, page as Page);
              if (item.action) item.action();
              if (itemAction) itemAction();
            }}
            aria-current={isCurrentPage ? "page" : undefined}
            role="link"
            tabIndex={0}
            sx={{
              backgroundColor: showCurrentPage && isCurrentPage
                ? theme.palette.gray.trans[1]
                : "none",
              ...style,
            }}>
            {item.element}
            {item.title && (
              <Typography variant="button">{item.title}</Typography>
            )}
          </ItemWrapper>
        );
      })}
    </>
  );
};

