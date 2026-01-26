"use client";

import React, {
  useImperativeHandle,
  forwardRef,
  useRef,
  useState,
  MouseEvent,
} from "react";
import { IconButton, Stack } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Close } from "@mui/icons-material";
import { fadeIn, fadeOut, moveIn, moveOut } from "../helpers/animations";
import { useStyles } from "@/hooks/styleHooks";
import { GenericObject } from "@/types";
import { Transition, TransitionType } from "./Transition";

export interface ModalRef {
  openModal: () => void;
  closeModal: () => void;
}

export interface ModalProps {
  header?: React.ReactNode;
  content: React.ReactNode;
  shouldClose?: boolean;
  showHeader?: boolean;
  onClose?: () => void;
  transition?: { type: TransitionType, direction: "left" | "right" | "up" | "down" },
  style?: {
    overlay?: GenericObject<string>;
    content?: {
      width?: { xs?: string; sm?: string; md?: string };
      maxWidth?: { xs?: string; sm?: string; md?: string };
      otherStyles?: GenericObject<string>;
    };
    header?: any;
  };
}

export const Modal = forwardRef<ModalRef, ModalProps>(
  (
    {
      header,
      content,
      transition,
      shouldClose = true,
      showHeader = true,
      onClose,
      style,
    },
    ref
  ) => {
    const [isOpen, setOpen] = useState(false);
    const [shouldRemove, setShouldRemove] = useState(true);
    const containerRef = useRef<HTMLDivElement>(null);
    const closeRef = useRef<HTMLButtonElement>(null);
    const { scrollBarStyle } = useStyles();
    const theme = useTheme();
    const { overlay, content: { width, maxWidth, otherStyles } = {} } =
      style || {};

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

    const transOptions = transition || { type: "slide", direction: "left" }
    const transType = transOptions.type
    const transDir = transOptions.direction

    return (
      <Stack //Overlay container
        ref={containerRef}
        {...(shouldClose ? { onClick: handleClose } : {})}
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 999,
          visibility: !shouldRemove ? "visible" : "hidden",
          transition: "opacity 0.3s ease-in-out, visibility 0.3s",
          opacity: isOpen ? 1 : 0,
          // animation: `${isOpen ? fadeIn : fadeOut} 0.2s linear forwards`,
          alignItems: transType === "slide"
            ? (transDir === "right" ? "flex-start" : transDir === "left" ? "flex-end" : "center")
            : "center",
          justifyContent: transType === "slide"
            ? (transDir === "right" ? "flex-start" : transDir === "left" ? "flex-end" : "center")
            : "center",
          marginLeft: "0!important",
          padding: {
            xs: theme.boxSpacing(4, 2),
            sm: theme.boxSpacing(12, 12),
          },
          backgroundColor: theme.palette.gray.trans.overlay,
          ...(isOpen && overlay),
          backdropFilter: "blur(8px)",
        }}>
        {/* Drawer Content Container */}
        <Transition show={isOpen} {...transOptions} onExited={() => setShouldRemove(true)}>
          <Stack
            sx={{
              maxHeight: "100%",
              width: width?.xs ?? "90%",
              maxWidth: maxWidth?.xs ?? "100%",
              [theme.breakpoints.up("sm")]: {
                width: width?.sm ?? "80%",
                maxWidth: maxWidth?.sm ?? "350px",
              },
              [theme.breakpoints.up("md")]: {
                width: width?.md ?? "40%",
                maxWidth: maxWidth?.md ?? "400px",
              },
              gap: theme.gap(0),
              backgroundColor: theme.palette.gray[50],
              borderRadius: theme.radius[3],
              overflow: "hidden",
              ...otherStyles,
            }}>
            {
              /* Modal with Header and Close */
              showHeader && (
                <Stack
                  direction={"row"}
                  sx={{
                    position: "sticky",
                    padding: theme.boxSpacing(2),
                    justifyContent: "flex-end",
                    alignItems: "center",
                    gap: theme.gap(2),
                    borderBottom: header
                      ? `1px solid ${theme.palette.gray.trans[1]}`
                      : "none",
                    ...style?.header,
                  }}>
                  {header && header}
                  {shouldClose && (
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
        </Transition>
      </Stack>
    );
  }
);
Modal.displayName = "Drawer";
