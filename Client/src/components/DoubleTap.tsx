import React, { useState, useCallback, useRef } from "react";
import { Box } from "@mui/material";
import { Heart } from "lucide-react";
import { heartPop } from "@/helpers/animations";
import { vibrate } from "@/helpers/global";

interface DoubleTapProps {
    children: React.ReactNode;
    onSingleTap: () => void;
    onDoubleTap: () => void;
    iconSize?: number;
    style?: any;
}

export const DoubleTap = ({ children, onDoubleTap,
    onSingleTap, iconSize = 70, style }: DoubleTapProps) => {
    const [showHeart, setShowHeart] = useState(false);
    const lastTap = useRef<number>(0);
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleTouch = useCallback((e: React.PointerEvent) => {
        e.stopPropagation();

        const now = Date.now();
        const DOUBLE_TAP_DELAY = 250;

        if (now - lastTap.current < DOUBLE_TAP_DELAY) {
            // --- DOUBLE TAP DETECTED ---
            if (timer.current) {
                clearTimeout(timer.current);
                timer.current = null;
            }
            // Trigger Vibe and Animation
            vibrate();
            setShowHeart(false);
            setTimeout(() => setShowHeart(true), 10);

            onDoubleTap();

            setTimeout(() => setShowHeart(false), 1100);
            lastTap.current = 0; // Reset
        } else {
            // --- POTENTIAL SINGLE TAP ---
            lastTap.current = now;
            timer.current = setTimeout(() => {
                onSingleTap();
                timer.current = null;
            }, DOUBLE_TAP_DELAY);
        }
    }, [onDoubleTap, onSingleTap]);

    return (
        <Box
            onPointerDown={handleTouch}
            sx={{
                position: "relative",
                width: "100%",
                height: "100%",
                touchAction: "manipulation",
                ...style
            }}>
            {showHeart && (
                <Box sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    pointerEvents: "none",
                    animation: `${heartPop} 1.2s linear alternate`,
                    zIndex: 5,
                }}>
                    <Heart
                        size={iconSize}
                        style={{
                            filter: "drop-shadow(0px 0px 10px rgba(0,0,0,0.3))",
                            fill: "white",
                            stroke: "white"
                        }}
                    />
                </Box>)}
            {children}
        </Box >
    );
};