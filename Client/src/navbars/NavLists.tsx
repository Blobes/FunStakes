"use client";
import { useAuth } from "@/app/auth/login/authHooks";
import { defaultPage, clientRoutes } from "@/helpers/info";
import { NavItem } from "@/types";
import {
  Home,
  Notifications,
  Settings,
  Logout,
  AccountCircle,
  Mail,
} from "@mui/icons-material";
import { Divider } from "@mui/material";
export const useNavLists = () => {
  const { handleLogout } = useAuth();

  // Web navigation list visible to all users on the web
  const webNavList: NavItem[] = [
    {
      title: "Support",
      element: <Notifications />,
      url: clientRoutes.support,
    },
    {
      title: "Pricing",
      element: <Notifications />,
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
      title: "Update Status",
      element: <Notifications />,
    },
    {
      element: <Divider />,
    },
    {
      title: "Profile",
      element: <AccountCircle />,
      url: clientRoutes.profile,
    },
    {
      title: "Bookmarks",
      element: <Mail />,
      url: clientRoutes.bookmarks,
    },

    {
      element: <Divider />,
    },
    {
      title: "Premium",
      element: <Mail />,
      url: clientRoutes.pricing,
    },
    {
      title: "Logout",
      element: <Logout />,
      action: async () => await handleLogout(),
    },
  ];

  // Left Sidebar navigation list visible to only logged-in users
  const sidebarNavList: NavItem[] = [
    {
      title: "Timeline",
      element: <AccountCircle />,
      url: clientRoutes.timeline,
    },
    {
      title: "Stakes",
      element: <AccountCircle />,
      url: clientRoutes.stakes,
    },
    {
      title: "Explore",
      element: <Notifications />,
      url: clientRoutes.explore,
    },
    {
      title: "Inbox",
      element: <Mail />,
      url: clientRoutes.inbox,
    },
    {
      element: <Divider />,
    },
    {
      title: "Settings",
      element: <Settings />,
      url: clientRoutes.settings,
    },
  ];

  return { webNavList, userNavList, footerNavList, sidebarNavList };
};
