import { Typography, useTheme } from "@mui/material";
import { useRouter } from "next/navigation";
import { Empty } from "@/components/Empty";
import { Unplug } from "lucide-react";
import { ProgressIcon } from "./ProgressIcon";
import { useGlobalContext } from "@/app/GlobalContext";
import { RootUIContainer } from "./Containers";

export const Offline = () => {
  const theme = useTheme();
  const router = useRouter();
  const { isGlobalLoading } = useGlobalContext();

  return (
    <RootUIContainer
      style={{
        alignItems: "center",
        justifyContent: "center",
        gap: theme.gap(30)
      }}>
      {isGlobalLoading ? (
        <>
          <ProgressIcon otherProps={{ size: "30px" }} />
          <Typography variant="body2"
            sx={{
              textAlign: "center",
              fontWeight: "500",
              fontStyle: "italic"
            }}>Retrieving connection...</Typography>
        </>) :
        (<Empty
          headline="Oops, something went wrong"
          tagline="Check your internet connection."
          style={{
            container: { padding: theme.boxSpacing(16), background: "none" },
            icon: {
              width: "60px",
              height: "60px",
            },
          }}
          icon={<Unplug />}
          primaryCta={{
            label: "Refresh",
            variant: "outlined",
            action: () => router.refresh(),
          }}
        />
        )}
    </RootUIContainer>
  )
};
