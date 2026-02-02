import { Stack, useTheme } from "@mui/material";
import { img } from "@/assets/exported";
import Image from "next/image";
import { pulseAndRotate } from "@/helpers/animations";
import { AnimatedWrapper } from "./AnimationWrapper";
import { RootUIContainer } from "./Containers";
import { useEffect } from "react";
import { delay } from "@/helpers/global";


export const SplashUI = ({ reload = false }: { reload?: boolean }) => {
  const theme = useTheme();

  useEffect(() => {
    if (reload === true)
      (async () => {
        await delay(200)
        window.location.reload()
      }
      )
  }, []);


  return (
    <RootUIContainer
      style={{
        alignItems: "center",
        justifyContent: "center",
      }}>
      <AnimatedWrapper sx={{
        borderRadius: theme.radius.full,
        animation: `${pulseAndRotate} 0.8s ease-in-out infinite alternate`
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
