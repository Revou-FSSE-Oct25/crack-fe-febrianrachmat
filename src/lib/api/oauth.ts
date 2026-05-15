import { getApiBaseUrl } from "./config";
import { apiFetch } from "./client";

export type OAuthProviderId = "google" | "apple" | "github" | "facebook";

export type OAuthProvidersResponse = {
  providers: OAuthProviderId[];
};

export async function fetchOAuthProviders(): Promise<OAuthProviderId[]> {
  const data = await apiFetch<OAuthProvidersResponse>("/auth/oauth/providers", {
    skipAuth: true,
  });
  return data.providers;
}

export function buildOAuthStartUrl(
  provider: OAuthProviderId,
  options?: {
    role?: "PATIENT" | "PHYSIOTHERAPIST";
    next?: string;
  },
): string {
  const url = new URL(`${getApiBaseUrl()}/auth/${provider}`);
  if (options?.role) {
    url.searchParams.set("role", options.role);
  }
  if (options?.next) {
    url.searchParams.set("next", options.next);
  }
  return url.toString();
}
