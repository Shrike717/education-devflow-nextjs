import { authMiddleware } from "@clerk/nextjs";

// Hier ist der Array mit den freigegebenen Public Rouuttes.
export default authMiddleware({
  publicRoutes: ["/"],
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
