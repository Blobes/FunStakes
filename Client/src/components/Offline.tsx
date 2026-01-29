import { useTheme } from "@mui/material";
import { useRouter } from "next/navigation";
import { Empty } from "@/components/Empty";
import { Unplug } from "lucide-react";

export const Offline = () => {
  const theme = useTheme();
  const router = useRouter();
  return (
    <Empty
      headline="Oops, something went wrong"
      tagline="Check your internet connection."
      style={{
        container: { padding: theme.boxSpacing(16), background: "none" },
        icon: {
          width: "60px",
          height: "60px",
          svg: {
            fill: "none",
            strokeWidth: "1.2px",
          },
        },
      }}
      icon={<Unplug />}
      primaryCta={{
        label: "Refresh",
        variant: "outlined",
        action: () => router.refresh(),
      }}
    />
  );
};
