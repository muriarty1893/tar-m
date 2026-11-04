import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/components/tool/AuthShell";
import { SignUpForm } from "@/components/tool/AuthForms";
import { SignedInRedirect } from "@/components/tool/SignedInRedirect";

export const metadata: Metadata = { title: "Hesap aç", robots: { index: false } };

const formSpace = <div aria-hidden="true" className="h-[28rem] w-full max-w-[25rem] rounded-2xl bg-muted motion-safe:animate-pulse" />;

export default function SignUpPage() {
  return (
    <AuthShell title="Ücretsiz hesap açın">
      <SignedInRedirect>
        <Suspense fallback={formSpace}>
          <SignUpForm />
        </Suspense>
      </SignedInRedirect>
    </AuthShell>
  );
}
