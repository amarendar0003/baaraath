import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

interface BaaraathUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
  vendorId: string | null;
}

interface BaaraathToken {
  id: string;
  role: string;
  vendorId: string | null;
  fullName: string;
}

interface BaaraathSessionUser {
  id: string;
  email?: string | null;
  fullName?: string | null;
  role?: string | null;
  vendorId?: string | null;
}

const authHandler = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const { prisma } = await import("@/lib/prisma");
        const bcjs = await import("bcryptjs");

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          include: { vendor: true },
        });

        if (!user || !user.passwordHash) {
          return null;
        }

        const passwordHash = user.passwordHash as string;
        const password = credentials.password as string;

        const isValid = await bcjs.compare(password, passwordHash);
        if (!isValid) {
          return null;
        }

        const u = user as unknown as BaaraathUser;
        const vendor = (user as { vendor?: { id?: string } }).vendor;
        return {
          id: u.id,
          email: u.email,
          fullName: u.fullName,
          role: u.role,
          vendorId: vendor?.id ?? null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as unknown as BaaraathUser;
        token.id = u.id ?? "";
        token.role = u.role ?? "";
        token.vendorId = u.vendorId ?? null;
        token.fullName = u.fullName ?? "";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const t = token as unknown as BaaraathToken;
        const u = session.user as unknown as BaaraathSessionUser;
        u.id = t.id as string;
        u.role = t.role as string;
        u.vendorId = t.vendorId as string | null;
        u.fullName = t.fullName as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.AUTH_SECRET,
});

export { authHandler as GET, authHandler as POST };
