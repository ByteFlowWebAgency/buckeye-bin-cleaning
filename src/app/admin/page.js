"use client";

import { useState, useEffect } from "react";
import { collection, query, orderBy, getDocs, doc, updateDoc } from "firebase/firestore";

import { db } from "@/data/firebase";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { user } = useAuth();
  
  useEffect(() => {
    async function fetchOrders() {
      try {
        const ordersRef = collection(db, "orders");
        const q = query(ordersRef, orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        
        const ordersData = [];
        querySnapshot.forEach((doc) => {
          ordersData.push({ id: doc.id, ...doc.data() });
        });
        
        setOrders(ordersData);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    }
    
    if (user) {
      fetchOrders();
    }
  }, [user]);
  
  // Filter orders based on status
  const filteredOrders = filter === "all" 
    ? orders 
    : orders.filter(order => order.status === filter);
  
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      setLoading(true);
      const orderRef = doc(db, "orders", orderId);
      
      let updateData = { status: newStatus };
      
      if (newStatus === "completed") {
        updateData.completedDate = new Date();
      } else if (newStatus === "scheduled") {
        updateData.scheduledDate = new Date();
      }
      
      await updateDoc(orderRef, updateData);
      
      // Update local state
      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus, ...updateData } 
          : order));
      
      // Close detail view if open
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus, ...updateData });
      }
      
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Failed to update order status.");
    } finally {
      setLoading(false);
    }
  };
  
  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
  };
  
  const closeOrderDetails = () => {
    setSelectedOrder(null);
  };
  
  if (loading && !orders.length) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  const exportOrdersToCSV = () => {
    // Format the data for CSV
    const headers = ["Date", "Customer", "Email", "Phone", "Service", "Address", "Amount", "Status"];
    
    const csvData = filteredOrders.map(order => [
      order.createdAt ? new Date(order.createdAt.seconds * 1000).toLocaleDateString() : "N/A",
      order.customerName,
      order.customerEmail,
      order.customerPhone,
      order.servicePlanDisplay || order.servicePlan,
      order.address,
      order.amount,
      order.status
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map(row => row.map(cell => `"${ cell }"`).join(","))
    ].join("\n");
    
    // Create download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `orders-${ new Date().toISOString().slice(0, 10) }.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Orders Dashboard</h1>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8 p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <div className="mb-4 sm:mb-0">
            <h2 className="text-xl font-semibold text-gray-700">Order Management</h2>
            <p className="text-gray-500">View and manage customer orders</p>
          </div>
          
          <div className="flex items-center">
            <label htmlFor="status-filter" className="mr-2 text-gray-700">Filter:</label>
            <select 
              id="status-filter"
              value={ filter } 
              onChange={ (e) => setFilter(e.target.value) }
              className="p-2 border rounded shadow-sm focus:ring-red-500 focus:border-red-500"
            >
              <option value="all">All Orders</option>
              <option value="active">Active</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
        
        { orders.length === 0 ? (
          <div className="text-center p-8 text-gray-500">
            No orders found. New orders will appear here when customers make purchases.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                { filteredOrders.map(order => (
                  <tr key={ order.id } className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      { order.createdAt && new Date(order.createdAt.seconds * 1000).toLocaleDateString() }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{ order.customerName }</div>
                      <div className="text-sm text-gray-500">{ order.customerEmail }</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      { order.servicePlanDisplay || order.servicePlan }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate">
                      { order.address }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${ order.amount }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={ `px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${ order.status === "active" ? "bg-green-100 text-green-800" : 
                    order.status === "completed" ? "bg-blue-100 text-blue-800" : 
                      order.status === "scheduled" ? "bg-yellow-100 text-yellow-800" :
                        "bg-red-100 text-red-800" }` }>
                        { order.status }
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button 
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                        onClick={ () => viewOrderDetails(order) }
                      >
                        View
                      </button>
                      { order.status === "active" && (
                        <button 
                          className="text-yellow-600 hover:text-yellow-900"
                          onClick={ () => handleUpdateStatus(order.id, "scheduled") }
                        >
                          Schedule
                        </button>
                      ) }
                      { order.status === "scheduled" && (
                        <button 
                          className="text-blue-600 hover:text-blue-900"
                          onClick={ () => handleUpdateStatus(order.id, "completed") }
                        >
                          Complete
                        </button>
                      ) }
                    </td>
                  </tr>
                )) }
              </tbody>
            </table>
          </div>
        ) }
      </div>
      
      { /* Order Detail Modal */ }
      { selectedOrder && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg overflow-hidden shadow-xl max-w-2xl w-full m-4">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Order Details</h3>
              <button 
                onClick={ closeOrderDetails }
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-6 py-4">
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-500">Customer Information</h4>
                <div className="mt-2 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-900">Name: { selectedOrder.customerName }</p>
                    <p className="text-sm text-gray-900">Email: { selectedOrder.customerEmail }</p>
                    <p className="text-sm text-gray-900">Phone: { selectedOrder.customerPhone }</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-900">Date: { selectedOrder.createdAt && new Date(selectedOrder.createdAt.seconds * 1000).toLocaleString() }</p>
                    <p className="text-sm text-gray-900">Status: <span className="font-semibold">{ selectedOrder.status }</span></p>
                    <p className="text-sm text-gray-900">Amount: ${ selectedOrder.amount }</p>
                  </div>
                </div>
              </div>
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-500">Service Details</h4>
                <div className="mt-2">
                  <p className="text-sm text-gray-900">Service: { selectedOrder.servicePlanDisplay || selectedOrder.servicePlan }</p>
                  <p className="text-sm text-gray-900">Address: { selectedOrder.address }</p>
                  <p className="text-sm text-gray-900">Pickup Day: { selectedOrder.dayOfPickupDisplay || selectedOrder.dayOfPickup }</p>
                  <p className="text-sm text-gray-900">Pickup Time: { selectedOrder.timeOfPickupDisplay || selectedOrder.timeOfPickup }</p>
                </div>
              </div>
              { selectedOrder.message && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-500">Special Instructions</h4>
                  <p className="mt-2 text-sm text-gray-900">{ selectedOrder.message }</p>
                </div>
              ) }
              { selectedOrder.status === "cancelled" && selectedOrder.refundId && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-500">Refund Information</h4>
                  <p className="mt-2 text-sm text-gray-900">Refund ID: { selectedOrder.refundId }</p>
                  <p className="text-sm text-gray-900">Cancelled: { selectedOrder.cancelledAt && new Date(selectedOrder.cancelledAt.seconds * 1000).toLocaleString() }</p>
                </div>
              ) }
              { selectedOrder.servicePlan === 'monthly' && (
                <div className="mt-2 space-y-1 text-sm">
                  <p className="text-gray-600">
                    <span className="font-semibold">Commitment Period:</span>{' '}
                    {new Date(selectedOrder.startDate).toLocaleDateString()} - {new Date(selectedOrder.endDate).toLocaleDateString()}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-semibold">Monthly Amount:</span>{' '}
                    ${selectedOrder.monthlyAmount?.toFixed(2)}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-semibold">Total Paid:</span>{' '}
                    ${selectedOrder.totalAmount?.toFixed(2)}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-semibold">Commitment:</span>{' '}
                    {selectedOrder.commitmentMonths} months
                  </p>
                </div>
              ) }
            </div>
            <div className="bg-gray-50 px-6 py-4 flex justify-between">
              { selectedOrder.status === "active" && (
                <button 
                  className="px-4 py-2 text-sm font-medium text-yellow-600 bg-yellow-100 rounded-md hover:bg-yellow-200"
                  onClick={ () => handleUpdateStatus(selectedOrder.id, "scheduled") }
                >
                  Mark as Scheduled
                </button>
              ) }
              { selectedOrder.status === "scheduled" && (
                <button 
                  className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200"
                  onClick={ () => handleUpdateStatus(selectedOrder.id, "completed") }
                >
                  Mark as Completed
                </button>
              ) }
              <button 
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                onClick={ closeOrderDetails }
              >
                Close
              </button>
            </div>
            <div className="ml-2 py-2">
              <button 
                onClick={ exportOrdersToCSV }
                className="ml-4 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
              >
                    Export to Spreadsheet
              </button>
            </div>
          </div>
        </div>
      ) }
    </div>
  );
}