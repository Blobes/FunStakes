"use client";

import React from "react";
import { Typography, typographyClasses } from "@mui/material";
import { useTheme, styled } from "@mui/material/styles";
import { NavItem, GenericObject, SavedPage } from "@/types";
import { matchPaths } from "@/helpers/others";
import { usePathname, useRouter } from "next/navigation";
import { AnchorLink } from "@/components/Buttons";

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
  setLastPage: (page: SavedPage) => void;
  onClose?: () => void;
  style?: GenericObject<string>;
}
// Renders an advance nav list
export const RenderAdvList: React.FC<RenderListProps> = ({
  list,
  setLastPage,
  onClose: onClick,
  style = {},
}) => {
  const router = useRouter();
  const theme = useTheme();
  const pathname = usePathname();

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
              e.preventDefault();
              router.push(item.url ?? "#");

              if (item.action) item.action();
              if (item.title)
                setLastPage({
                  title: item.title.toLowerCase(),
                  path: item.url ?? "#",
                });
              if (onClick) onClick();
            }}
            aria-current={isCurrentPage ? "page" : undefined}
            role="link"
            tabIndex={0}
            sx={{
              backgroundColor: isCurrentPage
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

// Renders a simple nav list
export const RenderSimpleList: React.FC<RenderListProps> = ({
  list,
  setLastPage,
  onClose: onClick,
  style = {},
}) => {
  const router = useRouter();

  return (
    <>
      {list.map((item, index) => {
        if (!item.title && item.element) {
          // Render the "element" alone if there's no title (Divider, custom element, etc.)
          return <React.Fragment key={index}>{item.element}</React.Fragment>;
        }
        return (
          <ItemWrapper
            key={index}
            url={item.url ?? "#"}
            onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
              e.preventDefault();
              router.push(item.url ?? "#");

              if (item.action) item.action();
              if (item.title)
                setLastPage({
                  title: item.title.toLowerCase(),
                  path: item.url ?? "#",
                });
              if (onClick) onClick();
            }}
            role="link"
            tabIndex={0}
            sx={{
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
