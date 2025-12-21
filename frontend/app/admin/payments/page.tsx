'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Booking {
  id: string;
  userId: string;
  items: string;
  totalAmount: number;
  status: string;
  paymentProof: string | null;
  customer: string | null;
  createdAt: string;
}

export default function AdminPaymentsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProof, setSelectedProof] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchPendingBookings();
  }, []);

  const fetchPendingBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      // Use the same API_URL logic as in api.ts
      const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL 
        ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api` 
        : 'https://upsosh-production.up.railway.app/api';
      
      console.log('Fetching pending bookings from:', `${API_URL}/bookings/pending`);
      
      const response = await fetch(`${API_URL}/bookings/pending`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error response:', errorData);
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Received bookings:', data);
      setBookings(data);
    } catch (error: any) {
      console.error('Error fetching bookings:', error);
      alert(`Failed to load pending bookings: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const approvePayment = async (bookingId: string) => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL 
        ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api` 
        : 'https://upsosh-production.up.railway.app/api';
        
      const response = await fetch(
        `${API_URL}/bookings/${bookingId}/approve`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to approve payment');
      }
      
      alert('Payment approved! User can now access their tickets.');
      fetchPendingBookings(); // Refresh list
    } catch (error: any) {
      console.error('Error approving payment:', error);
      alert(`Failed to approve payment: ${error.message}`);
    }
  };

  const rejectPayment = async (bookingId: string) => {
    const reason = prompt('Reason for rejection (optional):');
    try {
      const token = localStorage.getItem('token');
      const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL 
        ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api` 
        : 'https://upsosh-production.up.railway.app/api';
        
      const response = await fetch(
        `${API_URL}/bookings/${bookingId}/reject`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ reason }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to reject payment');
      }
      
      alert('Payment rejected.');
      fetchPendingBookings(); // Refresh list
    } catch (error: any) {
      console.error('Error rejecting payment:', error);
      alert(`Failed to reject payment: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Payment Approvals
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Review and approve pending payments ({bookings.length} pending)
          </p>
        </div>

        {bookings.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              No pending payments to review
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => {
              const items = JSON.parse(booking.items);
              const customer = booking.customer ? JSON.parse(booking.customer) : null;

              return (
                <div
                  key={booking.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Booking #{booking.id.slice(0, 8)}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(booking.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          ₹{booking.totalAmount}
                        </p>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                          {booking.status}
                        </span>
                      </div>
                    </div>

                    {customer && (
                      <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                          Customer Details
                        </h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <p className="text-gray-600 dark:text-gray-400">
                            Name: {customer.name}
                          </p>
                          <p className="text-gray-600 dark:text-gray-400">
                            Email: {customer.email}
                          </p>
                          <p className="text-gray-600 dark:text-gray-400">
                            Phone: {customer.phone}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                        Tickets
                      </h4>
                      <div className="space-y-2">
                        {items.map((item: any, index: number) => (
                          <div
                            key={index}
                            className="flex justify-between text-sm text-gray-600 dark:text-gray-400"
                          >
                            <span>
                              {item.eventTitle} - {item.ticketType}
                            </span>
                            <span>
                              {item.quantity} × ₹{item.price} = ₹{item.quantity * item.price}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {booking.paymentProof && (
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                          Payment Proof
                        </h4>
                        <button
                          onClick={() => setSelectedProof(booking.paymentProof)}
                          className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                        >
                          View Screenshot
                        </button>
                      </div>
                    )}

                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={() => approvePayment(booking.id)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition"
                      >
                        ✓ Approve Payment
                      </button>
                      <button
                        onClick={() => rejectPayment(booking.id)}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition"
                      >
                        ✗ Reject Payment
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Payment Proof Modal */}
      {selectedProof && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedProof(null)}
        >
          <div className="max-w-4xl max-h-[90vh] overflow-auto">
            <img
              src={selectedProof}
              alt="Payment proof"
              className="w-full h-auto rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
}
