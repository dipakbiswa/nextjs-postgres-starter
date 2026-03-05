"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

function GoogleSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const token = searchParams.get("auth_token");
    const firstLogin = searchParams.get("first_login");

    if (token) {
      // Store token in localStorage like your current system
      localStorage.setItem("auth_token", token);

      // Redirect to dashboard
      if (firstLogin === "1") {
        window.location.replace("/onboarding");
      } else {
        window.location.replace("/dashboard");
      }
    } else {
      // If no token, redirect to login with error
      router.replace("/login?error=oauth_token_missing");
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-slate-100" />
        <p className=" text-slate-100">Completing Google sign in...</p>
      </div>
    </div>
  );
}

export default function GoogleSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <GoogleSuccessContent />
    </Suspense>
  );
}
