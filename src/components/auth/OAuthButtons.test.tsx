import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { OAuthButtons } from "./OAuthButtons";
import {
  buildOAuthStartUrl,
  fetchOAuthProviders,
} from "@/lib/api/oauth";

vi.mock("@/lib/api/oauth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api/oauth")>();
  return {
    ...actual,
    fetchOAuthProviders: vi.fn(),
    buildOAuthStartUrl: vi.fn(actual.buildOAuthStartUrl),
  };
});

const mockedFetchProviders = vi.mocked(fetchOAuthProviders);
const mockedBuildStartUrl = vi.mocked(buildOAuthStartUrl);

beforeEach(() => {
  vi.clearAllMocks();
  process.env.NEXT_PUBLIC_API_URL = "https://api.example.com";
});

describe("OAuthButtons", () => {
  it("renders nothing while providers are loading", () => {
    mockedFetchProviders.mockReturnValue(new Promise(() => {}));

    const { container } = render(<OAuthButtons />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing when no providers are configured", async () => {
    mockedFetchProviders.mockResolvedValue([]);

    const { container } = render(<OAuthButtons />);

    await waitFor(() => {
      expect(container).toBeEmptyDOMElement();
    });
  });

  it("renders provider links when OAuth is available", async () => {
    mockedFetchProviders.mockResolvedValue(["google", "github"]);
    mockedBuildStartUrl.mockImplementation((provider, options) => {
      const params = new URLSearchParams();
      if (options?.role) params.set("role", options.role);
      if (options?.next) params.set("next", options.next);
      const qs = params.toString();
      return `https://api.example.com/auth/${provider}${qs ? `?${qs}` : ""}`;
    });

    render(<OAuthButtons role="PATIENT" nextPath="/dashboard" />);

    expect(await screen.findByText("Google")).toBeInTheDocument();
    expect(screen.getByText("GitHub")).toBeInTheDocument();
    expect(screen.getByText("atau lanjut dengan")).toBeInTheDocument();

    expect(screen.getByRole("link", { name: "Google" })).toHaveAttribute(
      "href",
      "https://api.example.com/auth/google?role=PATIENT&next=%2Fdashboard",
    );
    expect(mockedBuildStartUrl).toHaveBeenCalledWith("google", {
      role: "PATIENT",
      next: "/dashboard",
    });
  });

  it("hides section when provider fetch fails", async () => {
    mockedFetchProviders.mockRejectedValue(new Error("network"));

    const { container } = render(<OAuthButtons />);

    await waitFor(() => {
      expect(container).toBeEmptyDOMElement();
    });
  });
});
