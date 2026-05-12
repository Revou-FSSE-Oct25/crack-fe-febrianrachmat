"use client";

import { useAuth } from "@/contexts/auth-context";
import { ApiRequestError } from "@/lib/api/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function RegisterPage() {
  const { register, user, isReady } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [role, setRole] = useState<"PATIENT" | "PHYSIOTHERAPIST">("PATIENT");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isReady && user) {
      router.replace("/profile");
    }
  }, [isReady, user, router]);

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
      await register({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        phoneNumber: phoneNumber.trim() || undefined,
        role,
      });
      router.push("/profile");
    } catch (err) {
      const msg =
        err instanceof ApiRequestError
          ? err.message
          : "Pendaftaran gagal. Coba lagi.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-md mx-auto py-20 px-6">
      <h1 className="text-3xl font-bold text-center mb-2">Daftar</h1>
      <p className="text-gray-600 text-center mb-8">
        Sudah punya akun?{" "}
        <Link href="/login" className="text-teal-600 font-medium">
          Masuk
        </Link>
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p className="text-red-600 text-sm bg-red-50 border border-red-100 rounded p-3">
            {error}
          </p>
        )}
        <div>
          <label className="block text-sm font-medium mb-1">Nama lengkap</label>
          <input
            required
            minLength={3}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="border rounded w-full p-3"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            required
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
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border rounded w-full p-3"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Nomor telepon (opsional)
          </label>
          <input
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="border rounded w-full p-3"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Peran</label>
          <select
            value={role}
            onChange={(e) =>
              setRole(e.target.value as "PATIENT" | "PHYSIOTHERAPIST")
            }
            className="border rounded w-full p-3"
          >
            <option value="PATIENT">Pasien</option>
            <option value="PHYSIOTHERAPIST">Fisioterapis</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-teal-500 text-white py-3 rounded-lg font-medium disabled:opacity-60"
        >
          {loading ? "Memproses…" : "Daftar"}
        </button>
      </form>
    </main>
  );
}
