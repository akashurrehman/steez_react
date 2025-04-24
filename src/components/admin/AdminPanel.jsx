import React, { useState, useEffect } from "react";
import { getUserProfile, updateUserProfile, getMyOrders } from "../../api";
import AdminProductManagement from "./AdminProductManagement";

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

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);

        // Φόρτωση προφίλ
        const userResponse = await getUserProfile();
        setUserData(userResponse.data);
        setFormData({
          full_name: userResponse.data.full_name || "",
          address: userResponse.data.address || "",
          phone: userResponse.data.phone || ""
        });

        // Φόρτωση παραγγελιών
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
    <div className="min-h-screen bg-black text-white px-4 py-10 md:px-20">

      <button
        onClick={() => setActiveSection("Αρχική Σελίδα")}
        className="inline-flex items-center gap-2 text-sm px-4 py-2 border border-white/30 rounded-full hover:bg-white hover:text-black transition mb-8"
      >
        <span className="text-lg">←</span> Πίσω στην Αρχική Σελίδα
      </button>

      <h1 className="text-4xl font-bold mb-8 text-center uppercase">Το Προφίλ μου</h1>

      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex border-b border-zinc-700">
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
            onClick={() => setActiveTab("orders")}
            className={`px-6 py-3 ${activeTab === "orders" ? "border-b-2 border-white font-bold" : "text-gray-400"}`}
          >
            Οι Παραγγελίες μου
          </button>

        </div>

        {activeTab === "profile" && (
          <div className="bg-zinc-900 p-6 rounded-xl shadow-md">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-2">Πληροφορίες Λογαριασμού</h2>
              <p><strong>Username:</strong> {userData.username}</p>
              <p><strong>Email:</strong> {userData.email}</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded text-center">
                {error}
              </div>
            )}

            {updateSuccess && (
              <div className="mb-4 p-3 bg-green-900/50 border border-green-500 rounded text-center">
                Το προφίλ σας ενημερώθηκε με επιτυχία!
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-1">Ονοματεπώνυμο</label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  className="w-full p-3 rounded bg-zinc-800 text-white focus:outline-none border border-zinc-700"
                />
              </div>

              <div>
                <label className="block mb-1">Διεύθυνση</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full p-3 rounded bg-zinc-800 text-white focus:outline-none border border-zinc-700"
                  rows="3"
                ></textarea>
              </div>

              <div>
                <label className="block mb-1">Τηλέφωνο</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full p-3 rounded bg-zinc-800 text-white focus:outline-none border border-zinc-700"
                />
              </div>

              <button
                type="submit"
                disabled={updateLoading}
                className="bg-white text-black py-3 px-6 rounded font-semibold hover:bg-gray-200 transition"
              >
                {updateLoading ? "Αποθήκευση..." : "Αποθήκευση Αλλαγών"}
              </button>
            </form>
          </div>
        )}

        {activeTab === "orders" && (
          <div className="bg-zinc-900 p-6 rounded-xl shadow-md">
            <h2 className="text-2xl font-semibold mb-6">Οι Παραγγελίες μου</h2>

            {orders.length === 0 ? (
              <p className="text-gray-400 text-center py-4">Δεν έχετε κάνει καμία παραγγελία ακόμα.</p>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => (
                  <div key={order.id} className="border border-zinc-700 rounded-lg p-4">
                    <div className="flex justify-between mb-3">
                      <div>
                        <p className="text-lg font-semibold">Παραγγελία #{order.id}</p>
                        <p className="text-sm text-gray-400">{new Date(order.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{order.total_amount}€</p>
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

                    <div className="border-t border-zinc-700 pt-3">
                      <p className="font-medium mb-2">Προϊόντα:</p>
                      <ul className="space-y-2">
                        {order.items.map((item) => (
                          <li key={item.id} className="flex justify-between">
                            <div className="flex items-center gap-2">
                              {item.image_url && (
                                <img
                                  src={`https://steez-shop-backend.onrender.com${item.image_url}`}
                                  alt={item.name}
                                  className="w-10 h-10 object-cover rounded"
                                />
                              )}
                              <span>{item.name} x{item.quantity}</span>
                            </div>
                            <span>{item.price}€</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-3 pt-3 border-t border-zinc-700">
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
      </div>
    </div>
  );
};

export default AdminPanel;