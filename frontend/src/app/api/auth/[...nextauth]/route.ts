import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    secret: process.env.NEXTAUTH_SECRET,
    session: { strategy: "jwt" },

    events: {
        async signIn({ user, account, profile }) {
            const extractProfileSub = (): string | undefined => {
                if (!profile || typeof profile !== "object") return undefined;
                if (!("sub" in profile)) return undefined;
                const subValue = (profile as Record<string, unknown>).sub;
                return typeof subValue === "string" ? subValue : undefined;
            };

            try {
                const provider = account?.provider ?? "google";
                const providerSub =
                    account?.providerAccountId ?? extractProfileSub() ?? "";

                console.log("UPsert →", process.env.NEXT_PUBLIC_BACKEND_BASE);
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_BACKEND_BASE}/api/v1/users/upsert`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            provider,
                            provider_sub: providerSub,
                            email: user.email,
                            name: user.name,
                        }),
                    }
                );

                const text = await res.text();
                console.log("UPsert status:", res.status, text);
            } catch (e) {
                console.error("User upsert failed:", e);
            }
        },
    },
    callbacks: {
        async session({ session, token }) {
            session.user = {
                ...session.user,
                name: token.name as string | undefined,
                email: token.email as string | undefined,
                image: (token.picture as string | undefined) ?? session.user?.image,
            };
            return session;
        },
    },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };