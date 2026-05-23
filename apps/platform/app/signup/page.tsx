"use client";

import React from "react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { SignUpForm } from "@/components/auth/SignUpForm";

export default function SignUpPage() {
  return (
    <AuthLayout
      title="Create your LUMINUS account"
      subtitle="Start building your profile and connect with a network focused on wellbeing, growth and purpose."
    >
      <SignUpForm />
    </AuthLayout>
  );
}
