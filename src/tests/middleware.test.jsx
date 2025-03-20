import { expect, vi, it, describe } from 'vitest';
import { NextResponse } from 'next/server';
import { middleware } from '../middleware';

vi.mock('next/server', () => ({
  NextResponse: {
    redirect: vi.fn((url) => ({ redirected: true, url })),
    next: vi.fn(() => ({ next: true })),
  },
}));

describe('middleware', () => {
  it('redirects to /admin/login when accessing protected admin routes', () => {
    const request = {
      nextUrl: {
        pathname: '/admin/dashboard',
        includes: vi.fn((path) => path === '/admin/login'),
      },
      url: 'http://localhost:3000/admin/dashboard',
    };

    const response = middleware(request);
    expect(response.redirected).toBe(true);
    expect(response.url.toString()).toBe('http://localhost:3000/admin/login');
  });

  // ... rest of the tests
}); 