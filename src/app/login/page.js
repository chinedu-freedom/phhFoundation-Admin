"use client";

import { useState, Suspense } from "react";
import { loginAction } from "@/app/actions/auth";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get("callbackUrl") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsPending(true);

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    try {
      const res = await loginAction(null, formData);
      if (res?.success) {
        toast.success("Welcome back!");
        setTimeout(() => {
          window.location.href = callbackUrl;
        }, 800);
      } else if (res?.error) {
        setError(res.error);
        toast.error(res.error);
      }
    } catch (err) {
      toast.error("Failed to sign in. Please check your network connection.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="space-y-5">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300"
          >
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 block w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-blue-600 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:focus:bg-zinc-900"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300"
          >
            Password
          </label>
          <div className="relative mt-2">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-4 pr-12 py-3.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-blue-600 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:focus:bg-zinc-900"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 focus:outline-none cursor-pointer"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center space-x-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-950 dark:checked:bg-blue-600"
          />
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            Keep me logged in
          </span>
        </label>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="flex w-full items-center justify-center rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 hover:bg-blue-700 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" className="animate-spin">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          "Sign in"
        )}
      </button>
    </form>
  );
}

export default function Login() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white dark:bg-zinc-950 sm:bg-zinc-50 sm:dark:bg-zinc-950 px-0 sm:px-6 py-0 sm:py-12">
      <div className="w-full h-full min-h-screen sm:min-h-0 sm:max-w-md flex flex-col justify-center sm:justify-start space-y-8 bg-white p-6 sm:p-10 sm:rounded-3xl sm:shadow-xl sm:shadow-zinc-200/50 dark:bg-zinc-950 sm:dark:bg-zinc-900 dark:shadow-none sm:border sm:border-zinc-100 sm:dark:border-zinc-800/80">
        {/* Header */}
        <div className="flex flex-col items-start sm:items-center">
          <div className="relative h-14 w-14 overflow-hidden rounded-xl border border-zinc-100 dark:border-zinc-800/50">
            <Image
              src="/logo.jpeg"
              alt="HH Foundation Logo"
              fill
              className="object-cover"
              sizes="56px"
            />
          </div>
          <h2 className="mt-8 text-3xl font-bold tracking-tight text-zinc-900 dark:text-white font-poppins">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Sign in to access the administrator console
          </p>
        </div>

        {/* Form Wrap in Suspense */}
        <Suspense fallback={<div className="text-center py-4 text-sm text-zinc-400">Loading form...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
