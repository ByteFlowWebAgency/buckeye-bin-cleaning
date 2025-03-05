"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrderDetails() {
      if (!sessionId) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/order-details?session_id=${sessionId}`);
        const data = await response.json();
        
        if (data.success) {
          setOrderDetails(data.orderDetails);
        }
      } catch (error) {
        console.error("Error fetching order details:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchOrderDetails();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold">Loading your order details...</h2>
        </div>
      </div>
    );
  }

  if (!sessionId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="text-center">
            <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Thank You for Your Order!</h1>
            <p className="text-gray-600 mb-6">Your bin cleaning service has been scheduled successfully.</p>
            <Link href="/" passHref>
              <Button className="w-full">Return to Home</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-gray-200">
            <div className="flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-green-500 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <h1 className="text-2xl font-bold text-gray-900">Order Confirmed!</h1>
            </div>
            <p className="text-center text-gray-600 mb-4">
              Your bin cleaning service has been scheduled. We've sent a confirmation email with all the details.
            </p>
          </div>

          {orderDetails && (
            <div className="px-6 sm:px-8 py-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
              <div className="border rounded-md overflow-hidden">
                <div className="grid grid-cols-2 gap-4 px-4 py-3 bg-gray-50">
                  <div className="font-medium text-gray-500">Service Plan</div>
                  <div className="text-gray-900">{orderDetails.servicePlan}</div>
                </div>
                <div className="grid grid-cols-2 gap-4 px-4 py-3 border-t">
                  <div className="font-medium text-gray-500">Customer</div>
                  <div className="text-gray-900">{orderDetails.name}</div>
                </div>
                <div className="grid grid-cols-2 gap-4 px-4 py-3 border-t">
                  <div className="font-medium text-gray-500">Service Address</div>
                  <div className="text-gray-900">{orderDetails.address}</div>
                </div>
                <div className="grid grid-cols-2 gap-4 px-4 py-3 border-t">
                  <div className="font-medium text-gray-500">Pickup Schedule</div>
                  <div className="text-gray-900">{orderDetails.dayOfPickup}, {orderDetails.timeOfPickup}</div>
                </div>
                {orderDetails.message && (
                  <div className="grid grid-cols-2 gap-4 px-4 py-3 border-t">
                    <div className="font-medium text-gray-500">Special Instructions</div>
                    <div className="text-gray-900">{orderDetails.message}</div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4 px-4 py-3 border-t bg-gray-50">
                  <div className="font-medium text-gray-500">Total Paid</div>
                  <div className="text-gray-900 font-bold">${orderDetails.amount}</div>
                </div>
              </div>
            </div>
          )}

          <div className="px-6 sm:px-8 py-6 border-t border-gray-200 bg-gray-50">
            <h3 className="text-lg font-medium text-gray-900 mb-2">What's Next?</h3>
            <p className="text-gray-600 mb-4">
              Our team will service your bins on your next trash pickup day. You'll receive a text message reminder the day before.
            </p>
            <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
              <Link href="/" passHref>
                <Button className="w-full sm:w-auto">Return to Home</Button>
              </Link>
              <Link href="/contact" passHref>
                <Button className="w-full sm:w-auto bg-white text-red-600 border border-red-600 hover:bg-red-50">
                  Contact Support
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}