import { authMiddleware } from "@clerk/nextjs";

// This is an array with routes that are public and do not require authentication.
export default authMiddleware({
  publicRoutes: [
    "/",
    "/api/webhooks",
    "/question/:id",
    "/tags",
    "/tags/:id",
    "/profile/:id",
    "/community",
    "/jobs",
  ],
  ignoredRoutes: ["/api/webhooks", "/api/chatgpt"],
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
