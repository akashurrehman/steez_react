import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { createOrder } from "../../api";

const stripePromise = loadStripe('pk_test_51RFKDd09g2nYGpkkGnW28hEbjPa7N7WGa1hAicX24O2wEHpCuhBx97ZbW5aIWhKNYcXrURREeK1muBTvhqpoEj8T00Sk17rvQ8');

const CheckoutForm = ({ cartItems, setCartItems, setActiveSection, formData, setFormData, setError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!formData.shipping_address || !formData.contact_phone) {
      setError("Παρακαλώ συμπληρώστε όλα τα υποχρεωτικά πεδία");
      return;
    }

    for (const item of cartItems) {
      if (item.sizes && item.sizes.length > 0 && !item.size) {
        setError(`Παρακαλώ επιλέξτε μέγεθος για το προϊόν ${item.name}`);
        return;
      }
    }
    
    try {
      setLoading(true);
      
      // For card payments
      if (formData.payment_method === "card") {
        if (!stripe || !elements) {
          return;
        }

        const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
          type: 'card',
          card: elements.getElement(CardElement),
        });

        if (stripeError) {
          setError(stripeError.message);
          setLoading(false);
          return;
        }

        // Prepare order data with payment method
        const orderData = {
          items: cartItems.map(item => ({
            product_id: item.id,
            quantity: item.qty,
            size:item.size
          })),
          shipping_address: formData.shipping_address,
          contact_phone: formData.contact_phone,
          payment_method: "card",
          payment_method_id: paymentMethod.id
        };
        
        // Send to backend
        await createOrder(orderData);
        
      } else if (formData.payment_method === "cash") {
        // For cash on delivery
        const orderData = {
          items: cartItems.map(item => ({
            product_id: item.id,
            quantity: item.qty,
            size:item.size
          })),
          shipping_address: formData.shipping_address,
          contact_phone: formData.contact_phone,
          payment_method: "cash"
        };
        
        await createOrder(orderData);
      }
      
      // Clear cart
      setCartItems([]);
      localStorage.removeItem('cartItems');
      
      // Show success message
      alert(`✅ Η παραγγελία σας ολοκληρώθηκε επιτυχώς με ${formData.payment_method === "card" ? "κάρτα" : "αντικαταβολή"}! Ευχαριστούμε για την αγορά.`);
      setActiveSection("Αρχική Σελίδα");
      
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setError(
        error.response?.data?.message || 
        "Παρουσιάστηκε σφάλμα κατά την ολοκλήρωση της παραγγελίας"
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block mb-1">Διεύθυνση Παράδοσης*</label>
        <textarea
          name="shipping_address"
          value={formData.shipping_address}
          onChange={(e) => setFormData({...formData, shipping_address: e.target.value})}
          className="w-full p-3 rounded bg-zinc-800 text-white focus:outline-none border border-zinc-700"
          rows="3"
          placeholder="Οδός, Αριθμός, Πόλη, ΤΚ"
          required
        ></textarea>
      </div>
      
      <div>
        <label className="block mb-1">Τηλέφωνο Επικοινωνίας*</label>
        <input
          type="text"
          name="contact_phone"
          value={formData.contact_phone}
          onChange={(e) => setFormData({...formData, contact_phone: e.target.value})}
          className="w-full p-3 rounded bg-zinc-800 text-white focus:outline-none border border-zinc-700"
          placeholder="π.χ. 6912345678"
          required
        />
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-2">Τρόπος Πληρωμής</h3>
        <select
          name="payment_method"
          value={formData.payment_method}
          onChange={(e) => setFormData({...formData, payment_method: e.target.value})}
          className="w-full p-3 mb-4 rounded bg-zinc-800 text-white focus:outline-none border border-zinc-700"
        >
          <option value="cash">Αντικαταβολή</option>
          <option value="card">Πληρωμή με Κάρτα</option>
        </select>
        
        {formData.payment_method === "card" && (
          <div className="mt-4 p-4 bg-zinc-800 rounded border border-zinc-700">
            <CardElement 
              options={{
                hidePostalCode: true,
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#ffffff',
                    '::placeholder': {
                      color: '#a0aec0',
                    },
                    backgroundColor: '#1a202c',
                  },
                  invalid: {
                    color: '#9e2146',
                  },
                },
              }}
            />
          </div>
        )}
      </div>
      
      <button
        type="submit"
        disabled={loading || (formData.payment_method === "card" && !stripe)}
        className="w-full bg-white text-black py-3 rounded font-semibold hover:bg-gray-200 transition"
      >
        {loading ? "Επεξεργασία..." : "Επιβεβαίωση & Πληρωμή"}
      </button>
    </form>
  );
};

const Checkout = ({ cartItems, setCartItems, setActiveSection }) => {
  const [formData, setFormData] = useState({
    shipping_address: "",
    contact_phone: "",
    payment_method: "cash"
  });
  const [error, setError] = useState("");

  const subtotal = cartItems.reduce((acc, item) => acc + item.qty * item.price, 0);
  const shipping = 5; // Fixed shipping cost
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen bg-black text-white px-4 py-10 md:px-20">
      <button
        onClick={() => setActiveSection("Καλάθι Αγορών")}
        className="inline-flex items-center gap-2 text-sm px-4 py-2 border border-white/30 rounded-full hover:bg-white hover:text-black transition mb-8"
      >
        <span className="text-lg">←</span> Πίσω στο Καλάθι
      </button>
      
      <h1 className="text-4xl font-bold mb-8 text-center uppercase">Ολοκλήρωση Παραγγελίας</h1>
      
      {error && (
        <div className="mb-6 p-3 bg-red-900/50 border border-red-500 rounded text-center max-w-4xl mx-auto">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Στοιχεία Παραγγελίας</h2>
          <Elements stripe={stripePromise}>
            <CheckoutForm 
              cartItems={cartItems}
              setCartItems={setCartItems}
              setActiveSection={setActiveSection}
              formData={formData}
              setFormData={setFormData}
              setError={setError}
            />
          </Elements>
        </div>
        
        <div>
          <h2 className="text-2xl font-semibold mb-4">Περίληψη Παραγγελίας</h2>
          <div className="bg-zinc-900 p-6 rounded-xl shadow-md">
            <div className="mb-4">
              <h3 className="font-medium mb-2">Τα προϊόντα σας:</h3>
              <ul className="space-y-2 max-h-60 overflow-y-auto">
                {cartItems.map((item, index) => (
                  <li key={index} className="flex justify-between items-center border-b border-zinc-800 pb-2">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-400">Ποσότητα: {item.qty}</p>
                      <p className="text-sm text-gray-400">Μέγεθος: {item.size}</p>
                    </div>
                    <p>{item.price * item.qty}€</p>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between border-b border-zinc-700 pb-2">
                <span>Υποσύνολο</span>
                <span>{subtotal}€</span>
              </div>
              <div className="flex justify-between border-b border-zinc-700 pb-2">
                <span>Μεταφορικά</span>
                <span>{shipping}€</span>
              </div>
              <div className="flex justify-between text-lg font-bold mt-2">
                <span>Σύνολο</span>
                <span>{total}€</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;