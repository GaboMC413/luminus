"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { SocialAuthButtons } from "./SocialAuthButtons";
import { AuthDivider } from "./AuthDivider";
import { User, Mail, Lock, ArrowRight, AlertCircle } from "lucide-react";
import Link from "next/link";

export const SignUpForm: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name || !email || !password) {
      setError("Please fill in all the required fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await signUp(email, name);
      if (success) {
        router.push("/onboarding");
      } else {
        setError("An account with this email address already exists. Try signing in.");
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
        onGoogleClick={() => alert("Mock Google Sign Up clicked. Try using email signup to test the flow!")}
        onAppleClick={() => alert("Mock Apple Sign Up clicked. Try using email signup to test the flow!")}
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
          type="text"
          label="Your Full Name"
          placeholder="e.g. Camila Silva"
          value={name}
          onChange={(e) => setName(e.target.value)}
          icon={<User className="w-4 h-4" />}
          required
        />

        <Input
          type="email"
          label="Email Address"
          placeholder="you@domain.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<Mail className="w-4 h-4" />}
          required
        />

        <Input
          type="password"
          label="Choose Password"
          placeholder="Min. 6 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          icon={<Lock className="w-4 h-4" />}
          required
        />

        <div className="flex items-start gap-2 pl-1 mt-1 text-[11px] text-wellness-slate-500 leading-normal">
          <input
            type="checkbox"
            id="terms"
            className="mt-0.5 h-3.5 w-3.5 border-wellness-sand-200 rounded text-wellness-sage-600 focus:ring-wellness-sage-400 cursor-pointer"
            required
          />
          <label htmlFor="terms" className="cursor-pointer">
            I agree to the{" "}
            <a href="#" className="font-semibold text-wellness-sage-600 underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="font-semibold text-wellness-sage-600 underline">
              Privacy Policy
            </a>
            .
          </label>
        </div>

        <Button
          type="submit"
          isLoading={isSubmitting}
          className="w-full flex items-center justify-center gap-2 mt-2"
        >
          <span>Begin Experience</span>
          <ArrowRight className="w-4 h-4" />
        </Button>

        <p className="text-center text-xs font-medium text-wellness-slate-500 mt-2">
          Already have an account?{" "}
          <Link
            href="/signin"
            className="font-bold text-wellness-sage-600 hover:text-wellness-sage-700 transition-colors underline"
          >
            Sign In
          </Link>
        </p>
      </form>
    </div>
  );
};
export default SignUpForm;
