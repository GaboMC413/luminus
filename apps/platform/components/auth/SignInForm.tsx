"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { SocialAuthButtons } from "./SocialAuthButtons";
import { AuthDivider } from "./AuthDivider";
import { Mail, Lock, ArrowRight, AlertCircle } from "lucide-react";
import Link from "next/link";

export const SignInForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { signIn } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await signIn(email);
      if (success) {
        router.push("/profile");
      } else {
        setError("We couldn't find an account matching that email. Please check the spelling or sign up below.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <SocialAuthButtons 
        onGoogleClick={() => alert("Mock Google Sign In clicked. Try using email signup to test the flow!")}
        onAppleClick={() => alert("Mock Apple Sign In clicked. Try using email signup to test the flow!")}
      />
      
      <AuthDivider />

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full">
        {error && (
          <div className="flex items-start gap-2.5 p-4 bg-wellness-clay-50 border border-wellness-clay-200 text-wellness-clay-600 rounded-2xl animate-scale-in">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span className="text-xs font-semibold leading-normal">{error}</span>
          </div>
        )}

        <Input
          type="email"
          label="Email Address"
          placeholder="yourname@domain.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<Mail className="w-4 h-4" />}
          required
        />

        <div className="flex flex-col gap-2">
          <Input
            type="password"
            label="Password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock className="w-4 h-4" />}
            required
          />
          <div className="flex justify-end px-1">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                alert("Mock password reset email sent!");
              }}
              className="text-xs font-bold text-wellness-sage-600 hover:text-wellness-sage-700 transition-colors"
            >
              Forgot password?
            </a>
          </div>
        </div>

        <Button
          type="submit"
          isLoading={isSubmitting}
          className="w-full flex items-center justify-center gap-2 mt-2"
        >
          <span>Continue Journey</span>
          <ArrowRight className="w-4 h-4" />
        </Button>

        <p className="text-center text-xs font-medium text-wellness-slate-500 mt-2">
          New to LUMINUS?{" "}
          <Link
            href="/signup"
            className="font-bold text-wellness-sage-600 hover:text-wellness-sage-700 transition-colors underline"
          >
            Create an account
          </Link>
        </p>
      </form>
    </div>
  );
};
export default SignInForm;
