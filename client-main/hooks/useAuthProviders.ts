"use client";

import { useEffect, useState } from "react";
import { getApiBaseUrl } from "@/lib/api-base";

type AuthProviders = {
  google: boolean;
};

const devGoogleFallback =
  process.env.NODE_ENV === "development" &&
  process.env.NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED === "true";

export function useAuthProviders() {
  const [providers, setProviders] = useState<AuthProviders>({
    google: devGoogleFallback,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch(`${getApiBaseUrl()}/api/auth/providers`, {
          credentials: "include",
        });
        if (!response.ok) {
          if (devGoogleFallback && !cancelled) {
            setProviders({ google: true });
          }
          return;
        }
        const payload = await response.json();
        if (!cancelled && payload?.data) {
          setProviders({
            google: Boolean(payload.data.google),
          });
        }
      } catch {
        if (devGoogleFallback && !cancelled) {
          setProviders({ google: true });
        }
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
