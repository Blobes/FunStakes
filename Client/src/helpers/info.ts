"use client";

// default page
export const defaultPage = {
  title: "home",
  path: "/",
};

export const clientRoutes = {
  // Web
  webRoot: "/web",
  about: "/web/about",
  pricing: "/web/pricing",
  blogs: "/web/blogs",
  support: "/web/support",

  // Auth
  login: "/auth/login",
  signup: "/auth/signup",

  // App
  profile: "/profile",
  bookmarks: "/bookmarks",
  timeline: "/timeline",
  stakes: "/stakes",
  explore: "/explore",
  inbox: "/inbox",
  settings: "/settings",
  post: "/timeline/post",
};

export const flaggedRoutes = {
  auth: [clientRoutes.login, clientRoutes.signup],
  web: [
    defaultPage.path,
    clientRoutes.about,
    clientRoutes.pricing,
    clientRoutes.blogs,
    clientRoutes.support,
  ],
  app: [clientRoutes.timeline, clientRoutes.post],
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
