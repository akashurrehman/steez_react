import React, { useState, useEffect } from "react";
import { getUserProfile, updateUserProfile, getMyOrders } from "../../api";
import AdminProductManagement from "./AdminProductManagement";
import AdminOrders from "./AdminOrders";
import SwipeBackWrapper from './../../lib/SwipeBackWrapper';

const AdminPanel = ({setActiveSection}) => {
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({
    full_name: "",
    address: "",
    phone: ""
  });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [error, setError] = useState("");
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const userResponse = await getUserProfile();
        setUserData(userResponse.data);
        setFormData({
          full_name: userResponse.data.full_name || "",
          address: userResponse.data.address || "",
          phone: userResponse.data.phone || ""
        });

        const ordersResponse = await getMyOrders();
        setOrders(ordersResponse.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError("Παρουσιάστηκε σφάλμα κατά τη φόρτωση των δεδομένων");
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdateSuccess(false);
    setError("");

    try {
      setUpdateLoading(true);
      await updateUserProfile(formData);
      setUpdateSuccess(true);
      setUpdateLoading(false);
    } catch (error) {
      setUpdateLoading(false);
      setError(
        error.response?.data?.message ||
        "Παρουσιάστηκε σφάλμα κατά την ενημέρωση του προφίλ"
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-xl">Φόρτωση...</div>
      </div>
    );
  }

  return (
    <SwipeBackWrapper onBack={() => setActiveSection("Αρχική Σελίδα")}>
      <div className="min-h-screen bg-black text-white px-4 py-6 md:px-20">
        {/* Mobile Header */}
        <div className="md:hidden flex justify-between items-center mb-4">
          <button
            onClick={() => setActiveSection("Αρχική Σελίδα")}
            className="flex items-center gap-1 text-sm px-3 py-1 border border-white/30 rounded-full hover:bg-white hover:text-black transition"
          >
            <span className="text-lg">←</span>
          </button>
          <h1 className="text-xl font-bold uppercase">Admin Panel</h1>
          <button 
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Desktop Back Button */}
        <div className="hidden md:block">
          <button
            onClick={() => setActiveSection("Αρχική Σελίδα")}
            className="inline-flex items-center gap-2 text-sm px-4 py-2 border border-white/30 rounded-full hover:bg-white hover:text-black transition mb-8"
          >
            <span className="text-lg">←</span> Πίσω στην Αρχική Σελίδα
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {showMobileMenu && (
          <div className="md:hidden bg-zinc-800 rounded-lg mb-6 p-2">
            <button
              onClick={() => { setActiveTab("profile"); setShowMobileMenu(false); }}
              className={`block w-full text-left px-4 py-3 ${activeTab === "profile" ? "bg-zinc-700 font-bold" : "text-gray-400"}`}
            >
              Στοιχεία Προφίλ
            </button>
            <button
              onClick={() => { setActiveTab("products"); setShowMobileMenu(false); }}
              className={`block w-full text-left px-4 py-3 ${activeTab === "products" ? "bg-zinc-700 font-bold" : "text-gray-400"}`}
            >
              Product Management
            </button>
            <button
              onClick={() => { setActiveTab("allorders"); setShowMobileMenu(false); }}
              className={`block w-full text-left px-4 py-3 ${activeTab === "allorders" ? "bg-zinc-700 font-bold" : "text-gray-400"}`}
            >
              All Orders
            </button>
            <button
              onClick={() => { setActiveTab("orders"); setShowMobileMenu(false); }}
              className={`block w-full text-left px-4 py-3 ${activeTab === "orders" ? "bg-zinc-700 font-bold" : "text-gray-400"}`}
            >
              Οι Παραγγελίες μου
            </button>
          </div>
        )}

        <h1 className="hidden md:block text-3xl md:text-4xl font-bold mb-6 text-center uppercase">Admin Panel</h1>

        <div className="max-w-4xl mx-auto">
          {/* Desktop Tabs */}
          <div className="hidden md:flex mb-8 border-b border-zinc-700">
            <button
              onClick={() => setActiveTab("profile")}
              className={`px-6 py-3 ${activeTab === "profile" ? "border-b-2 border-white font-bold" : "text-gray-400"}`}
            >
              Στοιχεία Προφίλ
            </button>
            <button
              onClick={() => setActiveTab("products")}
              className={`px-6 py-3 ${activeTab === "products" ? "border-b-2 border-white font-bold" : "text-gray-400"}`}
            >
              Product Management
            </button>
            <button
              onClick={() => setActiveTab("allorders")}
              className={`px-6 py-3 ${activeTab === "allorders" ? "border-b-2 border-white font-bold" : "text-gray-400"}`}
            >
              All Orders
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`px-6 py-3 ${activeTab === "orders" ? "border-b-2 border-white font-bold" : "text-gray-400"}`}
            >
              Οι Παραγγελίες μου
            </button>
          </div>

          {activeTab === "profile" && (
            <div className="bg-zinc-900 p-4 md:p-6 rounded-xl shadow-md">
              <div className="mb-6">
                <h2 className="text-xl md:text-2xl font-semibold mb-2">Πληροφορίες Λογαριασμού</h2>
                <p className="text-sm md:text-base"><strong>Username:</strong> {userData.username}</p>
                <p className="text-sm md:text-base"><strong>Email:</strong> {userData.email}</p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded text-center text-sm md:text-base">
                  {error}
                </div>
              )}

              {updateSuccess && (
                <div className="mb-4 p-3 bg-green-900/50 border border-green-500 rounded text-center text-sm md:text-base">
                  Το προφίλ σας ενημερώθηκε με επιτυχία!
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block mb-1 text-sm md:text-base">Ονοματεπώνυμο</label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    className="w-full p-2 md:p-3 rounded bg-zinc-800 text-white focus:outline-none border border-zinc-700 text-sm md:text-base"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm md:text-base">Διεύθυνση</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full p-2 md:p-3 rounded bg-zinc-800 text-white focus:outline-none border border-zinc-700 text-sm md:text-base"
                    rows="3"
                  ></textarea>
                </div>

                <div>
                  <label className="block mb-1 text-sm md:text-base">Τηλέφωνο</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full p-2 md:p-3 rounded bg-zinc-800 text-white focus:outline-none border border-zinc-700 text-sm md:text-base"
                  />
                </div>

                <button
                  type="submit"
                  disabled={updateLoading}
                  className="w-full md:w-auto bg-white text-black py-2 md:py-3 px-4 md:px-6 rounded font-semibold hover:bg-gray-200 transition text-sm md:text-base"
                >
                  {updateLoading ? "Αποθήκευση..." : "Αποθήκευση Αλλαγών"}
                </button>
              </form>
            </div>
          )}

          {activeTab === "orders" && (
            <div className="bg-zinc-900 p-4 md:p-6 rounded-xl shadow-md">
              <h2 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6">Οι Παραγγελίες μου</h2>

              {orders.length === 0 ? (
                <p className="text-gray-400 text-center py-4 text-sm md:text-base">Δεν έχετε κάνει καμία παραγγελία ακόμα.</p>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border border-zinc-700 rounded-lg p-3 md:p-4">
                      <div className="flex flex-col md:flex-row md:justify-between mb-2 md:mb-3">
                        <div className="mb-2 md:mb-0">
                          <p className="text-base md:text-lg font-semibold">Παραγγελία #{order.id}</p>
                          <p className="text-xs md:text-sm text-gray-400">{new Date(order.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="text-left md:text-right">
                          <p className="font-bold text-sm md:text-base">{order.total_amount}€</p>
                          <span className={`inline-block px-2 py-1 text-xs rounded ${order.status === 'delivered' ? 'bg-green-900 text-green-200' :
                              order.status === 'cancelled' ? 'bg-red-900 text-red-200' :
                                'bg-yellow-900 text-yellow-200'
                            }`}>
                            {order.status === 'pending' ? 'Σε αναμονή' :
                              order.status === 'processing' ? 'Σε επεξεργασία' :
                                order.status === 'shipped' ? 'Απεστάλη' :
                                  order.status === 'delivered' ? 'Παραδόθηκε' :
                                    'Ακυρώθηκε'}
                          </span>
                        </div>
                      </div>

                      <div className="border-t border-zinc-700 pt-2 md:pt-3">
                        <p className="font-medium mb-1 md:mb-2 text-sm md:text-base">Προϊόντα:</p>
                        <ul className="space-y-1 md:space-y-2">
                          {order.items.map((item) => (
                            <li key={item.id} className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                {item.image_url && (
                                  <img
                                    src={`https://api.steez.gr${item.image_url}`}
                                    alt={item.name}
                                    className="w-8 h-8 md:w-10 md:h-10 object-cover rounded"
                                  />
                                )}
                                <span className="text-xs md:text-sm">{item.name} x{item.quantity}</span>
                              </div>
                              <span className="text-xs md:text-sm">{item.price}€</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="mt-2 md:mt-3 pt-2 md:pt-3 border-t border-zinc-700 text-xs md:text-sm">
                        <p><strong>Διεύθυνση Παράδοσης:</strong> {order.shipping_address}</p>
                        <p><strong>Τηλέφωνο Επικοινωνίας:</strong> {order.contact_phone}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {activeTab === "products" && <AdminProductManagement />}
          {activeTab === 'allorders' && <AdminOrders />}
        </div>
      </div>
    </SwipeBackWrapper>
  );
};

export default AdminPanel;