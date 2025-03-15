"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";

export default function CancelPage() {
  const searchParams = useSearchParams();
  const refunded = searchParams.get("refunded") === "true";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <div className="text-center">
          {refunded ? (
            // Show for refund confirmation
            <>
              <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <h1 className="text-2xl font-bold text-gray-800 mb-4">Order Cancelled Successfully</h1>
              <p className="text-gray-600 mb-6">
                Your bin cleaning service order has been cancelled and your payment has been refunded.
                The refund should appear in your account within 5-10 business days.
              </p>
            </>
          ) : (
            // Show for regular cancellations
            <>
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <h1 className="text-2xl font-bold text-gray-800 mb-4">Payment Cancelled</h1>
              <p className="text-gray-600 mb-6">Your bin cleaning service order was not completed. No payment has been processed.</p>
            </>
          )}
          
          <div className="space-y-4">
            <Link href="/#contact-us" passHref>
              <Button className="w-full">
                {refunded ? 'Need Help?' : 'Try Again'}
              </Button>
            </Link>
            <div className="ml-2 py-2">
            <Link href="/" passHref className="block w-full sm:w-auto">
              <button
                className="w-full py-2 bg-white text-red-800 border-2 border-red-600 rounded-lg font-medium transition-all duration-300 ease-in-out hover:bg-red-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2"
              >
                Return to Home
              </button>
            </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}