import { useTheme } from "@mui/material/styles";
import { ScreenShareOff } from "lucide-react";
import { useOffline } from "./offlineHook";
import { RootUIContainer } from "@/components/Containers";
import { Empty } from "@/components/Empty";

export const OfflinePromptUI = () => {
    const theme = useTheme();
    const { switchToOfflineMode } = useOffline();

    return (
        <RootUIContainer
            style={{
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                height: "100%",
                width: "100%",
                minHeight: "fit-content",
                padding: theme.boxSpacing(12),
                gap: theme.gap(6)
            }}>
            <Empty
                headline="You seem to be offline"
                tagline="  Switch to offline mode to view offline contents."
                icon={<ScreenShareOff />}
                primaryCta={{
                    type: "BUTTON",
                    variant: "outlined",
                    label: "Switch mode",
                    action: () => switchToOfflineMode()
                }}
                style={{
                    container: {
                        height: "100%",
                        backgroundColor: "none",
                    },
                    headline: { fontSize: "24px!important" },
                    tagline: { fontSize: "15px" },
                    icon: {
                        width: "60px",
                        height: "60px",
                        marginBottom: theme.boxSpacing(8),
                        svg: {
                            fill: "none",
                            stroke: theme.palette.gray[200],
                            strokeWidth: "1.5px",
                        },
                    },
                }}
            />
        </RootUIContainer>
    )
}


