"use client";

import { Posts } from "./(post)/Posts";
import { useGlobalContext } from "../GlobalContext";
import { OfflinePromptUI } from "./OfflinePromptUI";

export default function HomePage() {

  const { offlineMode } = useGlobalContext();

  return <Posts />
}