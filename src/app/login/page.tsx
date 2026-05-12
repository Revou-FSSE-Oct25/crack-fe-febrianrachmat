"use client";

import { useAuth } from "@/contexts/auth-context";
import { ApiRequestError } from "@/lib/api/client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function safeNextPath(next: string | null): string | null {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return null;
  return next;
}

function LoginPageContent() {
  const { login, user, isReady } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const afterLoginPath =
    safeNextPath(searchParams.get("next")) ?? "/profile";

  useEffect(() => {
    if (isReady && user) {
      router.replace(afterLoginPath);
    }
  }, [isReady, user, router, afterLoginPath]);

  if (!isReady) {
    return (
      <main className="py-20 text-center text-gray-600">Memuat…</main>
    );
  }

  if (user) {
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login({ email: email.trim(), password });
      router.push(afterLoginPath);
    } catch (err) {
      const msg =
        err instanceof ApiRequestError
          ? err.message
          : "Login gagal. Periksa email dan kata sandi.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-md mx-auto py-20 px-6">
      <h1 className="text-3xl font-bold text-center mb-2">Masuk</h1>
      <p className="text-gray-600 text-center mb-8">
        Belum punya akun?{" "}
        <Link href="/register" className="text-teal-600 font-medium">
          Daftar
        </Link>
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p className="text-red-600 text-sm bg-red-50 border border-red-100 rounded p-3">
            {error}
          </p>
        )}
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border rounded w-full p-3"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Kata sandi</label>
          <input
            type="password"
            required
            minLength={8}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border rounded w-full p-3"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-teal-500 text-white py-3 rounded-lg font-medium disabled:opacity-60"
        >
          {loading ? "Memproses…" : "Masuk"}
        </button>
      </form>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="py-20 text-center text-gray-600">Memuat…</main>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
