import "@mui/material/styles";
import { GenericObject } from "../types";

// type ExtendedGenericObject<T> = GenericObject<T> & {
//   trans: GenericObject<T>;
// };

declare module "@mui/material/styles" {
  interface Palette {
    gray: {
      0: string;
      50: string;
      100: string;
      200: string;
      300: string;
      trans: {
        1: string;
        2: string;
        // Explicitly define overlay as a function
        overlay: (trans?: number) => string;
      };
    };
  }
  interface PaletteOptions {
    gray?: Partial<Palette["gray"]>;
  }

  // interface Palette {
  //   gray: ExtendedGenericObject<string | (() => any)>;
  // }
  // interface PaletteOptions {
  //   gray?: ExtendedGenericObject<string | (() => any)>;
  // }
  interface Theme {
    fixedColors: GenericObject<string>;
    radius: GenericObject<string>;
    boxSpacing: (
      val1: number,
      val2?: number,
      val3?: number,
      val4?: number,
    ) => string;
    gap: (value: number) => string;
  }
  interface ThemeOptions {
    fixedColors?: GenericObject<string>;
    radius?: GenericObject<string>;
    boxSpacing?: (
      val1: number,
      val2?: number,
      val3?: number,
      val4?: number,
    ) => string;
    gap?: (value: number) => string;
  }
  interface TypographyVariants {
    body3: React.CSSProperties;
  }
  interface TypographyVariantsOptions {
    body3?: React.CSSProperties;
  }
}

declare module "@mui/material/Typography" {
  interface TypographyPropsVariantOverrides {
    body3: true;
  }
}
