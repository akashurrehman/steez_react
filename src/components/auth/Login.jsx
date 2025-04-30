import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import SwipeBackWrapper from './../../lib/SwipeBackWrapper';

const Login = ({ onSwitchToRegister, onClose }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { loginUser, guestLogin, error, setError } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!email || !password) {
      setError("Παρακαλώ συμπληρώστε όλα τα πεδία");
      return;
    }
    
    try {
      setLoading(true);
      const success = await loginUser(email, password);
      setLoading(false);
      
      if (success) {
        onClose();
      }
    } catch (err) {
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    guestLogin();
    onClose();
  };

  return (
    <SwipeBackWrapper onBack={() => setActiveSection("Αρχική Σελίδα")}>
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="bg-zinc-900 p-8 rounded-xl shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center">Σύνδεση</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded text-center">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded bg-zinc-800 text-white focus:outline-none border border-zinc-700"
              placeholder="Εισάγετε το email σας"
            />
          </div>
          
          <div>
            <label className="block mb-1">Κωδικός</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded bg-zinc-800 text-white focus:outline-none border border-zinc-700"
              placeholder="Εισάγετε τον κωδικό σας"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black py-3 rounded font-semibold hover:bg-gray-200 transition"
          >
            {loading ? "Σύνδεση..." : "Σύνδεση"}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <button
            onClick={handleGuestLogin}
            className="w-full bg-gray-700 text-white py-3 rounded font-semibold hover:bg-gray-600 transition mb-4"
          >
            Συνέχεια ως Guest
          </button>
          
          <p>
            Δεν έχετε λογαριασμό;{" "}
            <button
              onClick={onSwitchToRegister}
              className="text-blue-400 hover:underline"
            >
              Εγγραφείτε
            </button>
          </p>
        </div>
      </div>
    </div>
    </SwipeBackWrapper>
  );
};

export default Login;