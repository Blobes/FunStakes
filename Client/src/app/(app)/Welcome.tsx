import { AppButton } from "@/components/Buttons";
import { clientRoutes } from "@/helpers/routes";
import { usePage } from "@/hooks/page";
import { Stack, Typography } from "@mui/material"
import { useTheme } from "@mui/material/styles";
import { Footer } from "../(web)/navbars/Footer";

export const Welcome = () => {
    const { navigateTo } = usePage();
    const theme = useTheme();

    return (
        <>
            <Stack
                sx={{
                    alignItems: "center",
                    textAlign: "center",
                    justifyContent: "center",
                    height: "100%",
                    width: "100%",
                    minHeight: "fit-content",
                    padding: theme.boxSpacing(12),
                }}>
                <Typography variant="h5" component="h5">
                    Join millions of stakers on FunStakes
                </Typography>
                <AppButton
                    href={clientRoutes.signup.path}
                    onClick={(e: React.MouseEvent) =>
                        navigateTo(clientRoutes.signup,
                            {
                                type: "element",
                                savePage: false,
                                loadPage: true,
                                event: e
                            })
                    }>
                    Get started
                </AppButton>
            </Stack>
            <Footer />
        </>
    )
}


