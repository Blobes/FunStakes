import React, { useState, useCallback, useRef } from "react";
import { Box } from "@mui/material";
import { Heart } from "lucide-react";
import { red } from "@mui/material/colors";
import { heartPop } from "@/helpers/animations";
import { vibrate } from "@/helpers/global";

interface DoubleTapProps {
    children: React.ReactNode;
    isLiked: boolean;
    onSingleTap: () => void;
    onDoubleTap: () => void;
    iconSize?: number
}

export const DoubleTapLike = ({ children, isLiked, onDoubleTap,
    onSingleTap, iconSize = 60 }: DoubleTapProps) => {

    const [showHeart, setShowHeart] = useState(false);
    const lastTap = useRef<number>(0);
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleTouch = useCallback((e: React.PointerEvent) => {
        e.stopPropagation();

        if (e.cancelable) e.preventDefault();

        const now = Date.now();
        const DOUBLE_PRESS_DELAY = 300;

        if (now - lastTap.current < DOUBLE_PRESS_DELAY) {
            // --- DOUBLE TAP DETECTED ---
            if (timer.current) {
                clearTimeout(timer.current);
                timer.current = null;
            }
            // Trigger Vibe and Animation
            vibrate();
            setShowHeart(false);
            setTimeout(() => setShowHeart(true), 10);

            if (!isLiked) onDoubleTap();

            setTimeout(() => setShowHeart(false), 700);
            lastTap.current = 0; // Reset
        } else {
            // --- POTENTIAL SINGLE TAP ---
            lastTap.current = now;
            if (timer.current) clearTimeout(timer.current);
            timer.current = setTimeout(() => {
                onSingleTap();
                timer.current = null;
            }, DOUBLE_PRESS_DELAY);
        }
    }, [isLiked, onDoubleTap, onSingleTap]);

    return (
        <Box
            onPointerDown={handleTouch}
            onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
            }}
            sx={{ position: "relative", width: "100%" }}>
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