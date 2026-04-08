import { prismaAdapter } from "better-auth/adapters/prisma";
import { betterAuth } from "better-auth/minimal";
import { admin, genericOAuth } from "better-auth/plugins";
import prisma from "@/lib/prisma";

export const auth = betterAuth({
  experimental: { joins: true },
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // Cache duration in seconds
    },
  },
  plugins: [
    genericOAuth({
      config: [
        {
          providerId: "unique",
          // biome-ignore lint/style/noNonNullAssertion: ランタイムで入ることが保証されているため、ここでは非nullアサーションを使用する
          clientId: process.env.UNIQUE_CLIENT_ID!,
          // biome-ignore lint/style/noNonNullAssertion: ランタイムで入ることが保証されているため、ここでは非nullアサーションを使用する
          clientSecret: process.env.UNIQUE_CLIENT_SECRET!,
          scopes: ["openid", "profile", "email"],
          discoveryUrl:
            "https://auth.uniproject.jp/.well-known/openid-configuration",
          getUserInfo: async (tokens) => {
            const response = await fetch(
              "https://auth.uniproject.jp/userinfo",
              {
                headers: {
                  Authorization: `Bearer ${tokens.accessToken}`,
                },
              },
            );
            if (!response.ok) {
              throw new Error("Failed to fetch user info");
            }
            const userInfo = await response.json();
            return {
              id: userInfo.sub,
              email: userInfo.email,
              name: userInfo.name,
              image: userInfo.picture,
              emailVerified: userInfo.email_verified,
              roles: userInfo.roles || [],
            };
          },
          overrideUserInfo: true,
          mapProfileToUser: (profile) => {
            return {
              name: profile.name,
              email: profile.email,
              image: profile.image,
              emailVerified: profile.email_verified,
              role: profile.roles.includes("admin") ? "admin" : "user",
              accountId: profile.sub,
            };
          },
        },
      ],
    }),
    admin(),
  ],
});
