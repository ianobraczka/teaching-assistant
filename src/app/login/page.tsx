"use client";

import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { Suspense } from "react";

import { Button } from "@/components/ui/button";

function safeNextPath(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) {
    return "/assessment-assistant";
  }
  // Only allow redirect back into Assessment Assistant after Schoology unlock
  if (
    raw === "/assessment-assistant" ||
    raw.startsWith("/assessment-assistant/")
  ) {
    return raw;
  }
  return "/assessment-assistant";
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = safeNextPath(searchParams.get("next"));

  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        setError(data.error || "Could not sign in.");
        return;
      }
      router.replace(nextPath);
      router.refresh();
    } catch {
      setError("Could not sign in. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-sm"
    >
      <h1 className="text-lg font-semibold tracking-tight">Assessment Assistant</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Enter the password to connect to Schoology. Other Teaching Assistant pages stay open.
      </p>

      <label className="mt-5 block text-sm font-medium" htmlFor="site-password">
        Schoology access password
      </label>
      <input
        id="site-password"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        className="mt-1.5 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        required
        autoFocus
      />

      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}

      <Button type="submit" className="mt-5 w-full" disabled={submitting || !password}>
        {submitting ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <Suspense
        fallback={
          <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground shadow-sm">
            Loading…
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </main>
  );
}
