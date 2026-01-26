import { Stack, useTheme } from "@mui/material";
import { img } from "@/assets/exported";
import Image from "next/image";

export const Splash = () => {
  const theme = useTheme();
  return (
    <Stack
      sx={{
        position: "fixed",
        height: "100vh",
        width: "100%",
        gap: 0,
        backgroundColor: theme.palette.gray[0],
        alignItems: "center",
        justifyContent: "center",
      }}>
      <Image
        src={img.logo}
        alt="Splash icon"
        style={{
          width: "60px",
          height: "60px",
          borderRadius: `${theme.radius.full}`,
        }}
      />
    </Stack>
  );
};
