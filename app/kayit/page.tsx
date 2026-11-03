import type { Metadata } from "next";
import { SignUp } from "@clerk/nextjs";
import { AuthShell } from "@/components/tool/AuthShell";

export const metadata: Metadata = { title: "Hesap aç", robots: { index: false } };

export default function SignUpPage() {
  return (
    <AuthShell title="Ücretsiz hesap açın">
      <SignUp routing="hash" signInUrl="/giris" />
    </AuthShell>
  );
}
