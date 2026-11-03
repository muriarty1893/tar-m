import type { Metadata } from "next";
import { SignIn } from "@clerk/nextjs";
import { AuthShell } from "@/components/tool/AuthShell";

export const metadata: Metadata = { title: "Giriş yap", robots: { index: false } };

export default function SignInPage() {
  return (
    <AuthShell title="Giriş yapın">
      {/* Hash routing keeps every step on /giris, so the page stays static. */}
      <SignIn routing="hash" signUpUrl="/kayit" />
    </AuthShell>
  );
}
