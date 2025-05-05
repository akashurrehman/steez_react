import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import SwipeBackWrapper from './../../lib/SwipeBackWrapper';

const Register = ({ onSwitchToLogin, setActiveSection, onClose }) => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    full_name: "",
    phone: ""
  });
  const [loading, setLoading] = useState(false);
  const { registerUser, error, setError } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      setError("Παρακαλώ συμπληρώστε όλα τα υποχρεωτικά πεδία");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Οι κωδικοί δεν ταιριάζουν");
      return;
    }

    try {
      setLoading(true);
      const success = await registerUser({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        phone: formData.phone
      });
      setLoading(false);

      if (success) {
        window.location.href = '/';
      }
    } catch (err) {
      setLoading(false);
    }
  };

  return (
    <SwipeBackWrapper onBack={() => setActiveSection(" Πίσω")}>
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <div className="bg-zinc-900 p-8 rounded-xl shadow-xl w-full max-w-md">
          <button
            onClick={() => onClose()}
            className="inline-flex items-center gap-2 text-sm px-4 py-2 border border-white/30 rounded-full hover:bg-white hover:text-black transition mb-8"
          >
            <span className="text-lg">←</span> Πίσω
          </button>
          <h2 className="text-3xl font-bold mb-6 text-center">Εγγραφή</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1">Username*</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full p-3 rounded bg-zinc-800 text-white focus:outline-none border border-zinc-700"
                placeholder="Επιλέξτε ένα username"
              />
            </div>

            <div>
              <label className="block mb-1">Email*</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-3 rounded bg-zinc-800 text-white focus:outline-none border border-zinc-700"
                placeholder="Εισάγετε το email σας"
                required
              />
            </div>

            <div>
              <label className="block mb-1">Κωδικός*</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full p-3 rounded bg-zinc-800 text-white focus:outline-none border border-zinc-700"
                placeholder="Δημιουργήστε έναν κωδικό"
              />
            </div>

            <div>
              <label className="block mb-1">Επιβεβαίωση Κωδικού*</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full p-3 rounded bg-zinc-800 text-white focus:outline-none border border-zinc-700"
                placeholder="Επιβεβαιώστε τον κωδικό σας"
              />
            </div>

            <div>
              <label className="block mb-1">Ονοματεπώνυμο</label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                className="w-full p-3 rounded bg-zinc-800 text-white focus:outline-none border border-zinc-700"
                placeholder="Εισάγετε το ονοματεπώνυμό σας"
              />
            </div>

            <div>
              <label className="block mb-1">Τηλέφωνο</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full p-3 rounded bg-zinc-800 text-white focus:outline-none border border-zinc-700"
                placeholder="Εισάγετε το τηλέφωνό σας"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black py-3 rounded font-semibold hover:bg-gray-200 transition"
            >
              {loading ? "Δημιουργία λογαριασμού..." : "Δημιουργία λογαριασμού"}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p>
              Έχετε ήδη λογαριασμό;{" "}
              <button
                onClick={onSwitchToLogin}
                className="text-blue-400 hover:underline"
              >
                Συνδεθείτε
              </button>
            </p>
          </div>
        </div>
      </div>
    </SwipeBackWrapper>
  );
};

export default Register;