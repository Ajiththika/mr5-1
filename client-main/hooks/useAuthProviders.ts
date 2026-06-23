"use client";

import { useEffect, useState } from "react";

type AuthProviders = {
  google: boolean;
};

export function useAuthProviders() {
  const [providers, setProviders] = useState<AuthProviders>({ google: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch("/api/auth/providers", {
          credentials: "include",
        });
        if (!response.ok) return;
        const payload = await response.json();
        if (!cancelled && payload?.data) {
          setProviders({
            google: Boolean(payload.data.google),
          });
        }
      } catch {
        // OAuth unavailable — keep google false
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { providers, loading };
}
