"use client";
import { useAuth } from "@/app/auth/authHooks";
import { clientRoutes } from "@/helpers/routes";
import { NavItem } from "@/types";
import {
  AudioLines,
  BadgeQuestionMark,
  Bell,
  Bookmark,
  CircleDashed,
  Gem,
  House,
  LogOut,
  Mail,
  Pentagon,
  Search,
  Settings,
  User,
  WalletMinimal,
} from "lucide-react";
export const useNavLists = () => {
  const { handleLogout } = useAuth();

  // Web navigation list visible to all users on the web
  const webNavList: NavItem[] = [
    {
      title: clientRoutes.support.title,
      element: <BadgeQuestionMark />,
      url: clientRoutes.support.path,
    },
    {
      title: clientRoutes.pricing.title,
      element: <Gem />,
      url: clientRoutes.pricing.path,
    },
  ];

  // Footer navigation list visible to all users
  const footerNavList: NavItem[] = [
    {
      title: clientRoutes.about.title,
      url: clientRoutes.about.path,
    },
    {
      title: clientRoutes.support.title,
      url: clientRoutes.support.path,
    },
    {
      title: clientRoutes.pricing.title,
      url: clientRoutes.pricing.path,
    },
    {
      title: clientRoutes.blogs.title,
      url: clientRoutes.blogs.path,
    },
    {
      title: clientRoutes.privacy.title,
      url: clientRoutes.privacy.path,
    },
    {
      title: clientRoutes.terms.title,
      url: clientRoutes.terms.path,
    },
    {
      title: clientRoutes.news.title,
      url: clientRoutes.news.path,
    },
  ];

  // User profile navigation list visible to only logged-in users
  const userNavList: NavItem[] = [
    {
      title: clientRoutes.profile.title,
      element: <User />,
      url: clientRoutes.profile.path,
    },
    {
      title: clientRoutes.pricing.title,
      element: <Gem />,
      url: clientRoutes.pricing.path,
    },
    {
      title: clientRoutes.wallet.title,
      element: <WalletMinimal />,
      url: clientRoutes.wallet.path,
    },
    {
      title: clientRoutes.bookmarks.title,
      element: <Bookmark />,
      url: clientRoutes.bookmarks.path,
    },
    {
      title: clientRoutes.settings.title,
      element: <Settings />,
      url: clientRoutes.settings.path,
    },

    {
      title: "Logout",
      element: <LogOut />,
      action: async () => await handleLogout(),
    },
  ];

  // Left Sidebar navigation list visible to only logged-in users
  const sidebarNavList: NavItem[] = [
    {
      title: clientRoutes.home.title,
      element: <House />,
      url: clientRoutes.home.path,
    },
    {
      title: clientRoutes.explore.title,
      element: <Search />,
      url: clientRoutes.explore.path,
    },
    {
      title: clientRoutes.stakes.title,
      element: <Pentagon />,
      url: clientRoutes.stakes.path,
    },
    {
      title: clientRoutes.vibes.title,
      element: <CircleDashed />,
      url: clientRoutes.vibes.path,
    },
    {
      title: clientRoutes.voices.title,
      element: <AudioLines />,
      url: clientRoutes.voices.path,
    },
    {
      title: clientRoutes.notifications.title,
      element: <Bell />,
      url: clientRoutes.notifications.path,
    },
    {
      title: clientRoutes.inbox.title,
      element: <Mail />,
      url: clientRoutes.inbox.path,
    },
  ];

  return { webNavList, userNavList, footerNavList, sidebarNavList };
};
