import { adminClient, genericOAuthClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const { signIn, signUp, signOut, useSession, getSession } =
  createAuthClient({
    plugins: [genericOAuthClient(), adminClient()],
    baseURL: process.env.BETTER_AUTH_URL,
  });
