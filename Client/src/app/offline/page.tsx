"use client";

import { Posts } from "./(post)/Posts";
import { useGlobalContext } from "../GlobalContext";
import { ConfirmOffline } from "./ConfirmOffline";

export default function HomePage() {

  const { offlineMode } = useGlobalContext();

  return offlineMode ? <Posts /> : <ConfirmOffline />
}