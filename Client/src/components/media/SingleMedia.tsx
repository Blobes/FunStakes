"use client"

import { useImageColors } from "@/hooks/color";
import { useTheme } from "@mui/material/styles";
import { Box } from "@mui/material";
import { useStyles } from "@/hooks/style";
import Image from "next/image";
import { useController } from "@/hooks/global";

export interface Media {
    src: string;
    title?: string;
    type?: "image" | "video";
}

export interface MediaStyle {
    container?: { base?: any, smallScreen?: any },
    content?: any
};

export interface SingleMediaProps {
    id?: string;
    media: Media;
    onClick?: (id?: string) => void;
    usage?: "list" | "item"
    style?: MediaStyle;
}

export const SingleMedia = ({ id, media, onClick, style, usage = "item" }: SingleMediaProps) => {
    const theme = useTheme();
    const { applyBGEffect } = useStyles()
    const { isPortrait } = useImageColors(media.src);
    const mediaId = id || (Math.random() * 100).toString();
    const mediaType = media.type ?? "image"
    const { isDesktop } = useController();

    const contentStyle = {
        height: isPortrait ? "80svh" : "auto",
        width: isPortrait ? "auto" : "100%",
        maxHeight: "80svh",
        maxWidth: "100%",
        objectFit: "contain",
        zIndex: 4,
        //  boxShadow: "0 10px 80px rgba(0,0,0,0.2)",

        // Responsive Breakpoints
        ...(!isDesktop && {
            width: "100%",
            height: isPortrait ? "auto" : "unset",
            maxHeight: isPortrait ? "none" : "60svh",
        }),
        ...style?.content,
    }

    return (
        <Box onClick={() => onClick && onClick(mediaId)}
            sx={{
                position: "relative",
                overflow: "hidden",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                // minHeight: "300px",
                bgcolor: theme.palette.gray.trans[1],
                cursor: "pointer",
                // ...applyBGEffect(media.src),
                ...style?.container?.base,
                [theme.breakpoints.down("md")]: {
                    ...style?.container?.smallScreen
                },
            }}>
            {/* Blurred backround */}
            <Image
                src={media.src}
                alt=""
                fill
                style={{
                    objectFit: 'cover',
                    filter: 'blur(8px)',
                    opacity: 1
                }}
                priority={false}
            />
            {mediaType === "image" ? (
                < Image
                    src={media.src}
                    width={0}
                    height={0}
                    sizes="100vw"
                    loading="lazy"
                    alt={media.title || "Post image"}
                    style={{ ...contentStyle }} />
            ) : (
                <Box
                    component="video" src={media.src}
                    autoPlay loop muted playsInline
                    controls
                    sx={{ ...contentStyle }} />
            )}
        </Box >
    );
};