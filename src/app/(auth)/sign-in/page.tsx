import type { Metadata } from "next";
import SignInPageClient from "./Client";

export const generateMetadata = async () => {
  return {
    title: "Sign In",
  } as Metadata;
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect } = await searchParams;
  return <SignInPageClient redirect={redirect} />;
}
