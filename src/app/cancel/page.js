"use client";

import Link from "next/link";
import Button from "@/components/ui/Button";

export default function CancelPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <div className="text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Payment Cancelled</h1>
          <p className="text-gray-600 mb-6">Your bin cleaning service order was not completed. No payment has been processed.</p>
          <div className="space-y-4">
            <Link href="/contact#contact-us" passHref>
              <Button className="w-full">Try Again</Button>
            </Link>
            <Link href="/" passHref>
              <Button className="w-full bg-white text-gray-700 border border-gray-300 hover:bg-gray-50">
                Return to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}