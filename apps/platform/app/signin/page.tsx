"use client";

import React from "react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { SignInForm } from "@/components/auth/SignInForm";

export default function SignInPage() {
  return (
    <AuthLayout
      title="Welcome back to LUMINUS"
      subtitle="Continue your journey and access your personal space."
    >
      <SignInForm />
    </AuthLayout>
  );
}
