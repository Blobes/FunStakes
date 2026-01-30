"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { About } from "./About";
import { getFromLocalStorage } from "@/helpers/storage";
import { useController } from "@/hooks/global";
import { Page } from "@/types";

export default function AboutPage() {
  return <About />;
}
