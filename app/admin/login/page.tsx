"use client";

import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

const ADMIN_EMAIL = "admin@wearify.com";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // If already logged in as admin, redirect
  useEffect(() => {
    authClient.getSession().then(({ data }) => {
      if (data?.user?.email === ADMIN_EMAIL) {
        router.replace("/admin/dashboard");
      }
    });
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await authClient.signIn.email({ email, password });

      if (result.error) {
        setError("Invalid credentials. Please try again.");
        setLoading(false);
        return;
      }

      // Verify the signed-in user is the superadmin
      const session = await authClient.getSession();
      if (session.data?.user?.email !== ADMIN_EMAIL) {
        await authClient.signOut();
        setError("Access denied. Only the super admin can access this panel.");
        setLoading(false);
        return;
      }

      router.push("/admin/dashboard");
      router.refresh();
    } catch {
      setError("Unable to connect. Please try again later.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-wf-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-xl bg-wf-primary flex items-center justify-center mx-auto mb-4">
            <span className="text-wf-bg text-xl font-bold tracking-wider">W</span>
          </div>
          <h1 className="text-2xl font-extrabold text-wf-text">Wearify</h1>
          <p className="text-sm text-wf-subtext mt-1">Mission Control</p>
        </div>

        <div className="bg-wf-card rounded-xl border border-wf-border p-8">
          <h2 className="text-lg font-bold text-wf-text mb-1">Sign in</h2>
          <p className="text-sm text-wf-subtext mb-6">Authorized personnel only</p>

          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-wf-subtext mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                autoComplete="email"
                className="w-full px-4 py-2.5 rounded-lg border border-wf-border bg-white text-sm text-wf-text focus:outline-none focus:border-wf-primary focus:ring-2 focus:ring-wf-primary/20 transition-colors"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-wf-subtext mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
                className="w-full px-4 py-2.5 rounded-lg border border-wf-border bg-white text-sm text-wf-text focus:outline-none focus:border-wf-primary focus:ring-2 focus:ring-wf-primary/20 transition-colors"
              />
            </div>

            {error && (
              <div className="mb-4 px-4 py-2.5 rounded-lg bg-wf-red/10 border border-wf-red/20 text-sm text-wf-red">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-wf-primary text-white text-sm font-semibold hover:bg-wf-primary/90 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>

        <p className="text-xs text-wf-muted text-center mt-6">
          Phygify Technoservices Pvt. Ltd.
        </p>
      </div>
    </div>
  );
}
