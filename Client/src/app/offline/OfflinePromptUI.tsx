import { AppButton } from "@/components/Buttons";
import { Stack, Typography } from "@mui/material"
import { useTheme } from "@mui/material/styles";
import { Footer } from "../(web)/navbars/Footer";
import { ScreenShareOff } from "lucide-react";
import { useOffline } from "./offlineHook";
import { RootUIContainer } from "@/components/Containers";

export const OfflinePromptUI = () => {
    const theme = useTheme();
    const { switchToOfflineMode } = useOffline();

    return (
        <RootUIContainer
            style={{
                alignItems: "center",
                justifyContent: "center",
            }}>
            <Stack
                sx={{
                    alignItems: "center",
                    textAlign: "center",
                    justifyContent: "center",
                    height: "100%",
                    width: "100%",
                    minHeight: "fit-content",
                    padding: theme.boxSpacing(12),
                    gap: theme.gap(6)
                }}>
                <ScreenShareOff size={70}
                    style={{
                        marginBottom: theme.boxSpacing(8),
                        strokeWidth: "1.5px"
                    }} />
                <Typography variant="h5" component="h5">
                    You seem to be offline
                </Typography>
                <Typography variant="body3" component="p">
                    Switch to offline mode to view saved contents.
                </Typography>
                <AppButton
                    variant="outlined"
                    onClick={switchToOfflineMode}
                    style={{
                        fontSize: "15px",
                        marginTop: theme.boxSpacing(8),
                        padding: theme.boxSpacing(2, 8, 3, 8),
                    }}>
                    Use offline mode
                </AppButton>
            </Stack>
            <Footer />
        </RootUIContainer>
    )
}


