"use client";

import { useActionState, useEffect, useState, Suspense } from "react";
import { loginAction } from "@/app/actions/auth";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get("callbackUrl") || "/";

  const [state, formAction, isPending] = useActionState(loginAction, null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (state?.success) {
      router.push(callbackUrl);
      router.refresh();
    }
  }, [state, callbackUrl, router]);

  return (
    <form action={formAction} className="mt-8 space-y-6">
      {state?.error && (
        <div className="rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700 dark:bg-red-950/20 dark:text-red-400">
          {state.error}
        </div>
      )}

      <div className="space-y-4">
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
            className="mt-2 block w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:border-blue-600 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:focus:bg-zinc-900"
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
              className="block w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-4 pr-12 py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:border-blue-600 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:focus:bg-zinc-900"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 focus:outline-none"
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

      <button
        type="submit"
        disabled={isPending}
        className="flex w-full items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}

export default function Login() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-6 py-12 dark:bg-zinc-950">
      <div className="w-full max-w-md space-y-8 rounded-3xl bg-white p-8 shadow-xl shadow-zinc-200/50 dark:bg-zinc-900 dark:shadow-none">
        {/* Header */}
        <div className="flex flex-col items-center">
          <div className="relative h-16 w-16 overflow-hidden rounded-sm dark:border-zinc-800">
            <Image
              src="/logo.jpeg"
              alt="HH Foundation Logo"
              fill
              className="object-cover"
              sizes="48px"
            />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Admin Portal
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
