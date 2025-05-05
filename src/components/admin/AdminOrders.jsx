import React, { useState, useEffect } from 'react';
import { getAllOrders, updateOrderStatus } from '../../api';
import { useAuth } from '../../context/AuthContext';

const AdminOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [error, setError] = useState(null);

  // Define allowed statuses according to your ENUM
  const allowedStatuses = [
    { value: 'pending', label: 'Pending' },
    { value: 'paid', label: 'Paid' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await getAllOrders(statusFilter);
        setOrders(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch orders');
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [statusFilter]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
    } catch (err) {
      console.error('Error updating order status:', err);
      setError('Failed to update order status');
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="p-4 text-center">
        <h2 className="text-xl font-bold">Admin Access Required</h2>
        <p>You don't have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Order Management</h1>
      
      {/* Status filter */}
      <div className="mb-4">
        <label className="mr-2">Filter by Status:</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border p-2 rounded text-white bg-black"
        >
          <option value="">All Orders</option>
          {allowedStatuses.map(status => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </div>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      {loading ? (
        <div className="text-center">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div>No orders found</div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="border rounded-lg p-4 shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-lg font-semibold">Order #{order.id}</h2>
                  <p className="text-gray-600">
                    {new Date(order.created_at).toLocaleString()}
                  </p>
                  <p>Customer: {order.user_email || 'Guest'}</p>
                  <p>Phone: {order.contact_phone}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">Total: {order.total_amount}€</p>
                  <span className={`inline-block px-2 py-1 rounded text-xs ${
                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    order.status === 'paid' ? 'bg-blue-100 text-blue-800' :
                    order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                    order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {order.status.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="font-medium">Shipping Address:</h3>
                <p className="text-gray-700">{order.shipping_address}</p>
              </div>

              <div className="mb-4">
                <h3 className="font-medium">Items:</h3>
                <ul className="space-y-2">
                  {order.items.map((item) => (
                    <li key={item.id} className="flex justify-between border-b pb-2">
                      <div className="flex items-center">
                        <img
                          src={item.image_url ? `https://api.steez.gr${item.image_url}` : 'https://via.placeholder.com/50'}
                          alt={item.name}
                          className="w-12 h-12 object-cover mr-3"
                        />
                        <div>
                          <p>{item.name}</p>
                          <p className="text-sm text-gray-500">Size: {item.size}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p>{item.quantity} × {item.price}€</p>
                        <p className="font-medium">
                          {(item.quantity * item.price).toFixed(2)}€
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex justify-between items-center">
  <p>Payment: {order.payment_method === 'card' ? 'Credit Card' : 'Cash'}</p>

  <div className="flex items-center gap-2">
    <p>Status:</p>
    <select
      value={order.status}
      onChange={(e) => handleStatusChange(order.id, e.target.value)}
      className="border p-2 rounded bg-black text-white"
    >
      {allowedStatuses
        .filter(
          (status) =>
            status.value !== 'delivered' &&
            status.value !== 'cancelled'
        )
        .map((status) => (
          <option key={status.value} value={status.value}>
            {status.label}
          </option>
        ))}
      <option value="delivered">Delivered</option>
      <option value="cancelled">Cancel</option>
    </select>
    <span className="text-sm text-gray-500 capitalize">({order.status})</span>
  </div>
</div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminOrders;