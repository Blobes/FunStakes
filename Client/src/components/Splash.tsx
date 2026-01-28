import { Stack, useTheme } from "@mui/material";
import { img } from "@/assets/exported";
import Image from "next/image";
import { pulseAndRotate } from "@/helpers/animations";
import { AnimatedWrapper } from "./AnimationWrapper";


export const Splash = () => {
  const theme = useTheme();
  return (
    <Stack
      sx={{
        position: "fixed",
        height: "100svh",
        width: "100%",
        gap: 0,
        backgroundColor: theme.palette.gray[0],
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
    </Stack>
  );
};
