import { useTheme } from "@mui/material";
import { img } from "@/assets/exported";
import Image from "next/image";
import { rotate } from "@/helpers/animations";
import { AnimatedWrapper } from "./AnimationWrapper";
import { RootUIContainer } from "./Containers";


export const SplashUI = () => {
  const theme = useTheme();

  return (
    <RootUIContainer
      style={{
        alignItems: "center",
        justifyContent: "center",
      }}>
      <Image
        src={img.logo}
        alt="Splash icon"
        width={56}
        height={56}
        style={{ borderRadius: `${theme.radius.full}` }} />
    </RootUIContainer>
  );
};
