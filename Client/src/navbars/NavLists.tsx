"use client";
import { useAuth } from "@/app/auth/login/authHooks";
import { clientRoutes } from "@/helpers/info";
import { NavItem } from "@/types";
import {
  AudioLines,
  BadgeQuestionMark,
  Bell,
  Bookmark,
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
      title: "Support",
      element: <BadgeQuestionMark />,
      url: clientRoutes.support,
    },
    {
      title: "Pricing",
      element: <Gem />,
      url: clientRoutes.pricing,
    },
  ];

  // Footer navigation list visible to all users
  const footerNavList: NavItem[] = [
    {
      title: "About",
      url: clientRoutes.about,
    },
    {
      title: "Blogs",
      url: clientRoutes.blogs,
    },
    {
      title: "Privacy",
      url: clientRoutes.privacy,
    },
    {
      title: "Terms",
      url: clientRoutes.terms,
    },
    {
      title: "News",
      url: clientRoutes.news,
    },
  ];

  // User profile navigation list visible to only logged-in users
  const userNavList: NavItem[] = [
    {
      title: "Profile",
      element: <User />,
      url: clientRoutes.profile,
    },
    {
      title: "Premium",
      element: <Gem />,
      url: clientRoutes.pricing,
    },
    {
      title: "Wallet",
      element: <WalletMinimal />,
      url: clientRoutes.pricing,
    },
    {
      title: "Bookmarks",
      element: <Bookmark />,
      url: clientRoutes.bookmarks,
    },
    {
      title: "Settings",
      element: <Settings />,
      url: clientRoutes.pricing,
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
      title: "Timeline",
      element: <House />,
      url: clientRoutes.timeline,
    },
    {
      title: "Explore",
      element: <Search />,
      url: clientRoutes.explore,
    },
    {
      title: "Stakes",
      element: <Pentagon />,
      url: clientRoutes.stakes,
    },
    {
      title: "Voice Out",
      element: <AudioLines />,
      url: clientRoutes.settings,
    },
    {
      title: "Notifications",
      element: <Bell />,
      url: clientRoutes.inbox,
    },
    {
      title: "Inbox",
      element: <Mail />,
      url: clientRoutes.inbox,
    },
  ];

  return { webNavList, userNavList, footerNavList, sidebarNavList };
};
