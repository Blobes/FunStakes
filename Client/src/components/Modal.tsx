"use client";

import React, {
  useImperativeHandle,
  forwardRef,
  useRef,
  useState,
  MouseEvent,
} from "react";
import { Box, IconButton, Stack } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Close } from "@mui/icons-material";
import { useStyles } from "@/hooks/styleHooks";
import { Direction, GenericObject } from "@/types";
import { Transition, TransitionType } from "./Transition";
import { useController } from "@/hooks/generalHooks";
import { zIndexes } from "@/helpers/others";

export interface ModalRef {
  openModal: () => void;
  closeModal: () => void;
}

export interface ModalProps {
  content: React.ReactNode;
  showHeader?: boolean;
  header?: React.ReactNode;
  clickToClose?: boolean;
  dragToClose?: boolean;
  onClose?: () => void;
  transition?: {
    base?: { type: TransitionType, direction?: Direction },
    mobile?: { type: TransitionType, direction?: Direction }
  };
  style?: {
    base?: { overlay?: GenericObject<string>, content?: GenericObject<string> };
    smallScreen?: { overlay?: GenericObject<string>, content?: GenericObject<string> };
    mediumScreen?: { overlay?: GenericObject<string>, content?: GenericObject<string> };
    header?: GenericObject<string>;
  };
}

export const Modal = forwardRef<ModalRef, ModalProps>(
  (
    { header, content, transition, clickToClose = true, dragToClose = false,
      showHeader = true, onClose, style,
    },
    ref
  ) => {

    const containerRef = useRef<HTMLDivElement>(null);
    const closeRef = useRef<HTMLButtonElement>(null);
    const { scrollBarStyle } = useStyles();
    const { isDesktop, isMobile } = useController();
    const theme = useTheme();
    // States
    const [isOpen, setOpen] = useState(false);
    const [shouldRemove, setShouldRemove] = useState(true);
    const [dragY, setDragY] = useState(0);
    const [startY, setStartY] = useState(0);

    useImperativeHandle(ref, () => ({
      openModal: () => {
        setShouldRemove(false);
        setOpen(true);
      },
      closeModal: () => {
        setOpen(false);
      },
    }));

    const handleClose = (e: MouseEvent<HTMLDivElement | HTMLButtonElement>) => {
      if (
        (containerRef.current && e.target === containerRef.current) ||
        (closeRef.current && closeRef.current.contains(e.target as HTMLElement))
      ) {
        setOpen(false);
        if (onClose) onClose();
      }
    };

    // Close Drag Event
    const handleTouchStart = (e: React.TouchEvent) => {
      setStartY(e.touches[0].clientY);
    };
    const handleTouchMove = (e: React.TouchEvent) => {
      const currentY = e.touches[0].clientY;
      const diff = currentY - startY;
      // Only allow dragging downwards (positive Y)
      if (diff > 0) {
        setDragY(diff);
      }
    };
    const handleTouchEnd = () => {
      // If dragged down more than 150px, close it
      if (dragY > 150) {
        setOpen(false);
        if (onClose) onClose();
      }
      // Reset position if not closed
      setDragY(0);
    };

    const baseTrans = transition?.base || { type: "slide", direction: "left" }
    const mobileTrans = transition?.mobile || {
      type: baseTrans.type,
      direction: baseTrans.direction ?? "up"
    }
    let transOptions = isDesktop ? baseTrans : mobileTrans;
    const transType = transOptions.type;
    const transDir = transOptions.direction ?? (isDesktop ? "left" : "up");
    transOptions.direction = transDir

    return (
      <Stack //Overlay container
        ref={containerRef}
        {...(clickToClose ? { onClick: handleClose } : {})}
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: zIndexes.maximum,
          visibility: !shouldRemove ? "visible" : "hidden",
          transition: "opacity 0.3s ease-in-out, visibility 0.3s",
          opacity: isOpen ? 1 : 0,
          backgroundColor: theme.palette.gray.trans.overlay(isOpen ? 0.5 - dragY / 400 : 0),
          backdropFilter: `blur(${isOpen ? Math.max(0, 8 - dragY / 50) : 0}px)`,
          marginLeft: "0!important",
          padding: theme.boxSpacing(12),
          // Alignment
          alignItems: transType === "slide"
            ? (transDir === "right" ? "flex-start"
              : transDir === "left" ? "flex-end" : "center")
            : "center",
          justifyContent: transType === "slide"
            ? (transDir === "down" ? "flex-start"
              : transDir === "up" ? "flex-end" : "center")
            : "center",
          ...style?.base?.overlay,

          // Mobile styling
          ...(!isDesktop && {
            padding: theme.boxSpacing(4, 2),
            ...style?.smallScreen?.overlay
          }),
        }}>

        {/* Drawer Content Container */}
        <Transition show={isOpen}
          timeout={400} {...transOptions} onExited={() => setShouldRemove(true)}>
          <Stack
            sx={{
              maxHeight: "100%",
              gap: theme.gap(0),
              backgroundColor: theme.palette.gray[0],
              borderRadius: theme.radius[3],
              overflow: "hidden",
              width: style?.base?.content?.width ?? "40%",
              maxWidth: style?.base?.content?.maxWidth ?? "400px",
              // Drag styling
              ...(dragY > 0 && {
                // This allows the Slide to happen, but adds our dragY on top of it
                transform: `translateY(var(--drag-offset, 0px)) !important`,
                // We only want a transition when the user lets go (snapping back)
                transition: dragY === 0
                  ? "transform 0.3s cubic-bezier(0, 0, 0.2, 1) !important"
                  : "none !important",
              }),
              ...style?.base?.content,

              // Medium screen
              [theme.breakpoints.down("md")]: {
                width: style?.mediumScreen?.content?.width ?? "80%",
                maxWidth: style?.mediumScreen?.content?.maxWidth ?? "350px",
                ...style?.mediumScreen?.content
              },
              // Small screen
              [theme.breakpoints.down("sm")]: {
                width: style?.smallScreen?.content?.width ?? "95%",
                maxWidth: style?.smallScreen?.content?.maxWidth ?? "100%",
                ...style?.smallScreen?.content
              },
              "--drag-offset": `${dragY}px`,
            }}>
            {
              /* Modal with Header*/
              showHeader && (
                <Stack
                  {...(dragToClose && {
                    onTouchStart: handleTouchStart,
                    onTouchMove: handleTouchMove,
                    onTouchEnd: handleTouchEnd
                  })}

                  sx={{
                    position: "sticky",
                    alignItems: "center",
                    gap: theme.gap(0),
                    touchAction: 'none',
                    cursor: dragToClose ? "grab" : "default"
                  }}>
                  {isMobile && dragToClose && (
                    <Box sx={{
                      width: "50px",
                      height: "6px",
                      borderRadius: theme.radius.full,
                      marginTop: theme.boxSpacing(8),
                      backgroundColor: theme.palette.gray.trans[2]
                    }} />
                  )}
                  {(header || clickToClose) && (
                    <Stack
                      direction={"row"}
                      sx={{
                        width: "100%",
                        justifyContent: "flex-end",
                        alignItems: "center",
                        gap: theme.gap(2),
                        padding: theme.boxSpacing(2),
                        ...style?.header,
                        borderBottom: `1px solid ${theme.palette.gray.trans[1]}`
                      }}>
                      {header && header}
                      {clickToClose && (
                        <IconButton
                          aria-label="Drawer closer"
                          aria-controls="close-drawer"
                          aria-haspopup="true"
                          ref={closeRef}
                          onClick={handleClose}>
                          <Close
                            sx={{
                              width: "20px",
                              height: "20px",
                            }}
                          />
                        </IconButton>
                      )}
                    </Stack>
                  )}
                </Stack>
              )
            }
            {/* Modal Body */}
            <Stack
              sx={{
                height: "100%",
                overflowY: "auto",
                padding: theme.boxSpacing(10),
                [theme.breakpoints.up("md")]: {
                  padding: theme.boxSpacing(14),
                },
                gap: theme.gap(8),
                ...(scrollBarStyle() as any),
              }}>
              {content}
            </Stack>
          </Stack>

        </Transition >
      </Stack >
    );
  }
);
Modal.displayName = "Drawer";
