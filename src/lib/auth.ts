import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Admin Login",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                const adminEmail = "naufalnizam25@gmail.com";
                const adminPassword = process.env.ADMIN_PASSWORD;

                if (!adminPassword) {
                    throw new Error("Admin password not set in environment variables");
                }

                if (credentials.email !== adminEmail) {
                    throw new Error("invalid-email");
                }

                if (credentials.password !== adminPassword) {
                    throw new Error("invalid-password");
                }

                return { id: "1", name: "Admin", email: adminEmail };
            },
        }),
    ],
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/admin/login",
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).id = token.id;
            }
            return session;
        },
    },
};
