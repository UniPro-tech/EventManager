import { Metadata } from "next";
import SignInPageClient from "./Client";

export const metadata: Metadata = {
  title: "Sign In",
};

export default function SignInPage() {
  return <SignInPageClient />;
}
