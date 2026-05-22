import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      id: "guest",
      name: "Guest",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (credentials?.email === "guest@hotelhub.com" && credentials?.password === "guest123") {
          return {
            id: "guest-1",
            name: "Guest User",
            email: "guest@hotelhub.com",
            isDonor: false,
          };
        }
        return null;
      },
    }),
    Credentials({
      id: "donor",
      name: "Donor",
      credentials: {
        email: { label: "Email", type: "email" },
        donorId: { label: "Donor ID", type: "text" },
      },
      async authorize(credentials) {
        if (
          credentials?.email === "priya@example.com" &&
          credentials?.donorId === "DH-2024-8842"
        ) {
          return {
            id: "donor-1",
            name: "Priya Sharma",
            email: "priya@example.com",
            isDonor: true,
            donorId: "DH-2024-8842",
            tier: "gold",
          };
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.isDonor = (user as { isDonor?: boolean }).isDonor ?? false;
        token.donorId = (user as { donorId?: string }).donorId;
        token.tier = (user as { tier?: string }).tier;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { isDonor?: boolean }).isDonor = token.isDonor as boolean;
        (session.user as { donorId?: string }).donorId = token.donorId as string;
        (session.user as { tier?: string }).tier = token.tier as string;
      }
      return session;
    },
  },
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
});
