'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Error({ error, reset }) {
  const router = useRouter();

  useEffect(() => {
    // Log the error to console for debugging
    console.error('Admin Error:', error);
  }, [error]);

  const handleBackToLogin = () => {
    // Clear any stored auth state
    localStorage.removeItem('adminAuthState');
    sessionStorage.removeItem('adminAuthState');
    
    // Redirect to login
    router.replace('/admin/login');
  };

  const handleTryAgain = () => {
    // Attempt to reset the error boundary
    reset();
  };

  // Determine if error is authentication related
  const isAuthError = error?.message?.toLowerCase().includes('auth') || 
                     error?.message?.toLowerCase().includes('permission') ||
                     error?.message?.toLowerCase().includes('unauthorized');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white shadow-lg rounded-lg px-8 py-6 text-center">
          <div className="mb-4">
            <svg
              className="mx-auto h-12 w-12 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {isAuthError ? 'Authentication Error' : 'Something went wrong'}
          </h2>
          
          <p className="text-gray-600 mb-6">
            {isAuthError 
              ? 'Please sign in again to continue.'
              : 'An unexpected error occurred. Please try again.'}
          </p>

          <div className="space-y-3">
            <button
              onClick={handleBackToLogin}
              className="w-full bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors duration-200"
            >
              Back to Login
            </button>
            
            {!isAuthError && (
              <button
                onClick={handleTryAgain}
                className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors duration-200"
              >
                Try Again
              </button>
            )}
          </div>

          {process.env.NODE_ENV === 'development' && (
            <div className="mt-6 p-4 bg-gray-50 rounded-md">
              <p className="text-sm text-left text-gray-500 font-mono break-all">
                {error?.message || 'Unknown error occurred'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}