"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { About } from "./About";
import { getFromLocalStorage } from "@/helpers/others";
import { useSharedHooks } from "@/hooks";
import { SavedPage } from "@/types";

export default function AboutPage() {
  return <About />;
}
