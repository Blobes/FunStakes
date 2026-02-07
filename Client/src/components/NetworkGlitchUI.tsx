import { useTheme } from "@mui/material";
import { Empty } from "@/components/Empty";
import { Unplug } from "lucide-react";
import { ProgressIcon } from "./LoadingUIs";
import { useGlobalContext } from "@/app/GlobalContext";
import { RootUIContainer } from "./Containers";
import { useController } from "@/hooks/global";

export const NetworkGlitchUI = () => {
  const theme = useTheme();
  const { checkingSignal } = useGlobalContext();
  const { isUnstableNetwork } = useController();

  return (
    <RootUIContainer
      style={{
        alignItems: "center",
        justifyContent: "center",
        gap: theme.gap(30)
      }}>
      {isUnstableNetwork && checkingSignal ? (
        <ProgressIcon otherProps={{ size: "30px" }} info="Retrieving connection..." />
      ) :
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
            action: () => window.location.reload(),
          }}
        />
        )}
    </RootUIContainer>
  )
};
