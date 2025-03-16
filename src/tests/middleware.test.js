import { NextResponse } from "next/server";

import { middleware } from "../../middleware";

// Mock NextResponse
vi.mock("next/server", () => ({
  NextResponse: {
    redirect: vi.fn((url) => ({ redirected: true, url })),
    next: vi.fn(() => ({ next: true })),
  },
}));

describe("middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects to /admin/login when accessing protected admin routes", () => {
    const request = {
      nextUrl: {
        pathname: "/admin/dashboard",
        includes: vi.fn((path) => path === "/admin/login"),
      },
      url: "http://localhost:3000/admin/dashboard",
    };

    const response = middleware(request);

    // Check if NextResponse.redirect was called with the correct URL
    expect(NextResponse.redirect).toHaveBeenCalledWith(
      new URL("/admin/login", request.url),
    );
    expect(response).toEqual({
      redirected: true,
      url: "http://localhost:3000/admin/login",
    });
  });

  it("allows access to the /admin/login page", () => {
    const request = {
      nextUrl: {
        pathname: "/admin/login",
        includes: vi.fn((path) => path === "/admin/login"),
      },
      url: "http://localhost:3000/admin/login",
    };

    const response = middleware(request);

    // Check if NextResponse.next was called
    expect(NextResponse.next).toHaveBeenCalled();
    expect(response).toEqual({ next: true });
  });

  it("allows access to non-admin routes", () => {
    const request = {
      nextUrl: {
        pathname: "/about",
        includes: vi.fn((path) => path === "/admin/login"),
      },
      url: "http://localhost:3000/about",
    };

    const response = middleware(request);

    // Check if NextResponse.next was called
    expect(NextResponse.next).toHaveBeenCalled();
    expect(response).toEqual({ next: true });
  });
});
