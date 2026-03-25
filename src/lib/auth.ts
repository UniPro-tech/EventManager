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
  logger: {
    disabled: false,
    disableColors: false,
    level: "debug",
    log: (level, message, ...args) => {
      // Custom logging implementation
      console.log(`[${level}] ${message}`, ...args);
    },
  },
  plugins: [
    genericOAuth({
      config: [
        {
          providerId: "unique",
          clientId: process.env.UNIQUE_CLIENT_ID!,
          clientSecret: process.env.UNIQUE_CLIENT_SECRET!,
          scopes: ["openid", "profile", "email"],
          discoveryUrl:
            "https://auth.uniproject.jp/.well-known/openid-configuration",
        },
      ],
    }),
    admin(),
  ],
});
