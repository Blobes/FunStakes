"use client";

import React from "react";
import { Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { NavItem, Page } from "@/types";
import { matchPaths } from "@/helpers/global";
import { usePathname } from "next/navigation";
import { AnchorLink } from "@/components/Buttons";
import { useController } from "@/hooks/global";


// Props for the reusable nav renderer
export interface RenderListProps {
  list: NavItem[];
  itemAction?: () => void;
  style?: any;
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
  const { handleClick } = useController();

  const { fontSize, fontWeight, color, ...restStyle } = style

  const itemStyle: any = {
    alignItems: "center",
    gap: theme.gap(3),
    padding: theme.boxSpacing(2, 6),
    borderRadius: theme.radius.full,

    "&:hover": {
      backgroundColor: theme.palette.gray.trans[1],
      outline: "none",
    },
    title: {
      fontSize: `${fontSize ?? "15px"}!important`,
      fontWeight: `${fontWeight ?? "600"}!important`,
      color: `${color ?? theme.palette.gray[300]}!important`,
      "&:hover": { ...restStyle["&:hover"] }
    },
    ...restStyle,
  }

  return (
    <>
      {list.map((item, index) => {
        if (!item.title && item.element) {
          // Render the "element" alone if there's no title
          return <React.Fragment key={index}>{item.element}</React.Fragment>;
        }
        const isCurrentPage = matchPaths(pathname, item.url);
        return (
          <AnchorLink
            key={index}
            url={item.url ?? "#"}
            onClick={() => {
              const page = {
                title: item.title,
                path: item.url ?? "#",
              };
              handleClick(page as Page);
              if (item.action) item.action();
              if (itemAction) itemAction();
            }}
            aria-current={isCurrentPage ? "page" : undefined}
            role="link"
            tabIndex={0}

            style={{
              backgroundColor: showCurrentPage && isCurrentPage
                ? theme.palette.gray.trans[1]
                : "none",
              ...itemStyle,
            }}>
            {item.element && item.element}
            {item.title && (
              <Typography sx={{ ...itemStyle.title }}>{item.title}</Typography>
            )}
          </AnchorLink>
        );
      })}
    </>
  );
};

