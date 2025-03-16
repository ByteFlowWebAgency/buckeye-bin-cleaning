"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

import { useAuth, AuthProvider } from "@/contexts/AuthContext";

// Admin layout component without the AuthProvider
function AdminLayout({ children }) {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  // Don't redirect if we're already on the login page
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (!loading && !user && !isLoginPage) {
      router.push("/admin/login");
    }
  }, [user, loading, router, isLoginPage]);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/admin/login");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  // On login page, just render the children (which is the login form)
  if (isLoginPage) {
    return children;
  }

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  // For protected pages, show nothing if not logged in (will redirect)
  if (!user && !isLoginPage) {
    return null;
  }

  // Normal admin layout for authenticated users
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">Buckeye Bin Cleaning Admin</h1>
          <button 
            onClick={ handleSignOut }
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
          >
            Sign Out
          </button>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          { children }
        </div>
      </main>
    </div>
  );
}

// Wrap the layout with the AuthProvider
export default function AdminLayoutWithAuth({ children }) {
  return (
    <AuthProvider>
      <AdminLayout>{ children }</AdminLayout>
    </AuthProvider>
  );
}