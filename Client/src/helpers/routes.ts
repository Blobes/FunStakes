"use client";

import { Page } from "@/types";

export const clientRoutes: Record<string, Page> = {
  // Web
  about: { title: "About", path: "/web" },
  pricing: { title: "Pricing", path: "/web/pricing" },
  blogs: { title: "Blogs", path: "/web/blogs" },
  support: { title: "Support", path: "/web/support" },
  privacy: { title: "Privacy", path: "/web/privacy" },
  terms: { title: "Terms", path: "/web/terms" },
  news: { title: "News", path: "/web/news" },

  // Auth
  login: { title: "Login", path: "/auth/login" },
  signup: { title: "Signup", path: "/auth/signup" },

  // App
  home: { title: "Home", path: "/" },
  profile: { title: "Profile", path: "/profile" },
  bookmarks: { title: "Bookmarks", path: "/bookmarks" },
  // timeline: { title: "Timeline", path: "/timeline" },
  stakes: { title: "Stakes", path: "/stakes" },
  explore: { title: "Explore", path: "/explore" },
  inbox: { title: "Inbox", path: "/inbox" },
  settings: { title: "Settings", path: "/settings" },
  post: { title: "Post", path: "/post" },
  notifications: { title: "Notifications", path: "/notifications" },
  wallet: { title: "Wallet", path: "/wallet" },
  vibes: { title: "Vibes", path: "/vibes" },
  voices: { title: "Voices", path: "/voices" },
} as const;

export const flaggedRoutes = {
  auth: [clientRoutes.login.path, clientRoutes.signup.path],
  web: [
    clientRoutes.about.path,
    clientRoutes.pricing.path,
    clientRoutes.blogs.path,
    clientRoutes.support.path,
    clientRoutes.privacy.path,
    clientRoutes.terms.path,
    clientRoutes.news.path,
  ],
  app: [clientRoutes.home.path, clientRoutes.post.path],
};

export const serverRoutes = {
  // Auth
  authRoot: "/api/auth",
  login: "/api/auth/login",
  logout: "/api/auth/logout",
  signup: "/api/auth/signup",
  checkEmail: "/api/auth/check-email",
  verifyAuthToken: "/api/auth/verify",
  refreshToken: "/api/auth/refresh",

  // Posts
  postsRoot: "/api/posts",
  likePost: (id: string) => `/api/posts/${id}/like`,

  // Users
  usersRoot: "/api/users",
  user: (id: string) => `/api/users/${id}`,
  followers: (id: string) => `/api/users/${id}/followers`,
  follow: (id: string) => `/api/users/${id}/follow`,
};
