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
      <AnimatedWrapper sx={{
        borderRadius: theme.radius.full,
        animation: `${rotate} 1s linear infinite forwards`
      }}>
        <Image
          src={img.logo}
          alt="Splash icon"
          width={54}
          height={54} />
      </AnimatedWrapper>
    </RootUIContainer>
  );
};
