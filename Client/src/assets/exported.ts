import logo from "@/assets/images/logo.png";
import cover from "@/assets/images/cover.jpg";
import Doodle from "@/assets/svgs/doodle-pattern.svg";
import { styled } from "@mui/material";

// Images
const img = {
  logo,
  defaultCover: cover,
};

export { img };

//SVGs or Icons
export const DoodlePattern = styled(Doodle)(({ theme }) => ({
  width: "100vw",
  height: "100vh",
  position: "fixed",
  top: 0,
  left: 0,
  zIndex: -1,
  objectFit: "cover",
  "& path": {
    stroke: theme.palette.gray.trans[2],
  },
}));
