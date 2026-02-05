"use client"

import { useImageColors } from "@/hooks/color";
import Image, { StaticImageData } from "next/image";
import { useTheme } from "@mui/material/styles";
import { Box, Typography } from "@mui/material";
import { useController } from "@/hooks/global";
import { useStyles } from "@/hooks/style";

interface SingleMediaProps {
    mediaSrc: string | StaticImageData,
    type?: "image" | "video"
}
export const SingleMedia = ({ mediaSrc, type = "image" }: SingleMediaProps) => {
    const src = typeof mediaSrc === "string" ? mediaSrc : mediaSrc.src;
    const theme = useTheme();
    const { isDesktop } = useController();
    const { applyBGEffect } = useStyles()
    const { gradient, isPortrait } = useImageColors(src);


    return (
        <Box sx={{
            position: "relative",
            overflow: "hidden",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "300px",
            width: "100%",
            ...applyBGEffect(gradient)
        }}>
            {type === "image" ?
                (< Image src={mediaSrc}
                    alt="Post image"
                    style={{
                        height: isPortrait ? "80svh" : "auto",
                        width: isPortrait ? "auto" : "100%",
                        maxHeight: "80vh",
                        maxWidth: "100%",
                        objectFit: "contain",
                        zIndex: 4,
                        boxShadow: "0 10px 80px rgba(0,0,0,0.2)",
                        ...(!isDesktop && {
                            width: "100%",
                            height: isPortrait ? "auto" : "unset",
                            maxHeight: isPortrait ? "none" : "60svh",
                        }),
                    }} />) :
                <Typography>Video coming soon</Typography>
            }
        </Box >
    );
};