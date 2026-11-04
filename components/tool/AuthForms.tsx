"use client";

import { SignIn, SignUp } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";

/** The page to return to (a path on this site, from `redirect_url`), or home. */
function useReturnTo() {
  const asked = useSearchParams().get("redirect_url") ?? "";
  return asked.startsWith("/") && !asked.startsWith("//") ? asked : "/";
}

const withReturn = (path: string, back: string) => (back === "/" ? path : `${path}?redirect_url=${encodeURIComponent(back)}`);

/**
 * Clerk's sign-in form, keeping where the person was going ("Konu aç", a heart, "Satıcıya yaz")
 * through to sign-up and back: without it, "Kayıt ol" dropped `redirect_url` and a new account
 * ended on the home page instead of the button that asked for it.
 */
export function SignInForm() {
  const back = useReturnTo();
  return <SignIn routing="hash" signUpUrl={withReturn("/kayit", back)} fallbackRedirectUrl={back} signUpFallbackRedirectUrl={back} />;
}

/** Clerk's sign-up form, the same way round. */
export function SignUpForm() {
  const back = useReturnTo();
  return <SignUp routing="hash" signInUrl={withReturn("/giris", back)} fallbackRedirectUrl={back} signInFallbackRedirectUrl={back} />;
}
