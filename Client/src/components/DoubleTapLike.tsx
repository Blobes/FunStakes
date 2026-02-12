import React, { useState, useCallback } from "react";
import { Box } from "@mui/material";
import { Heart } from "lucide-react";
import { red } from "@mui/material/colors";
import { heartPop } from "@/helpers/animations";
import { vibrate } from "@/helpers/global";

interface DoubleTapProps {
    children: React.ReactNode;
    isLiked: boolean;
    handleLike: () => void;
    iconSize?: number;
}

export const DoubleTapLike = ({
    children,
    isLiked,
    handleLike,
    iconSize = 80
}: DoubleTapProps) => {
    const [showHeart, setShowHeart] = useState(false);

    const handleDoubleClick = useCallback((e: React.MouseEvent) => {
        // Prevent default browser zoom/behavior on some mobile browsers
        e.preventDefault();

        // 1. Show Animation (Always trigger for feedback)
        setShowHeart(false);
        setTimeout(() => setShowHeart(true), 10);

        vibrate(); // Vibrate

        // 2. Logic: Only Like if currently Unliked
        if (!isLiked) {
            handleLike();
        }

        // 3. Cleanup
        setTimeout(() => setShowHeart(false), 700);
    }, [isLiked, handleLike]);

    return (
        <Box
            onDoubleClick={handleDoubleClick}
            sx={{ position: "relative", width: "100%" }}
        >
            {showHeart && (
                <Box sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    zIndex: 100,
                    pointerEvents: "none",
                    animation: `${heartPop} 0.7s ease-out forwards`,
                }}>
                    <Heart
                        size={iconSize}
                        fill={red[500]}
                        stroke="none"
                        style={{ filter: "drop-shadow(0px 0px 10px rgba(0,0,0,0.3))" }}
                    />
                </Box>
            )
            }
            {children}
        </Box >
    );
};