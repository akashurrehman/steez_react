import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, ChevronDown, Flame, Home, Package, Contact, Search, User } from "lucide-react";
import { getProducts, getCategories, getBrands } from "./api";
import Profile from "@/components/profile/Profile";
import Checkout from "@/components/checkout/Checkout";
import AdminPanel from "@/components/admin/AdminPanel";
import { useAuth } from './context/AuthContext';
import Login from '@/components/auth/Login';
import Register from '@/components/auth/Register';

const Home1 = () => {
  const { user, isGuest, logout, guestLogin } = useAuth();

  const [authMode, setAuthMode] = useState(null); // 'login' or 'register'

  // Cart state
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('cartItems');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [showCart, setShowCart] = useState(false);
  const [activeSection, setActiveSection] = useState("Αρχική Σελίδα");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeBrand, setActiveBrand] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBrands, setShowBrands] = useState(false);

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productsRes, categoriesRes, brandsRes] = await Promise.all([
          getProducts(),
          getCategories(),
          getBrands()
        ]);
        
        console.log("Product response in fetch Data:",productsRes.data)
        setProducts(productsRes.data);
        setCategories(categoriesRes.data.map(c => c.name));
        setBrands(brandsRes.data.map(b => b.name));
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Παρουσιάστηκε σφάλμα κατά τη φόρτωση δεδομένων");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (authMode) {
    return authMode === 'login' ? (
      <Login
        onLogin={() => setAuthMode(null)}
        onSwitchToRegister={() => setAuthMode('register')}
        onClose={() => setAuthMode(null)}
      />
    ) : (
      <Register
        onRegister={() => setAuthMode(null)}
        onSwitchToLogin={() => setAuthMode('login')}
        onClose={() => setAuthMode(null)}
      />
    );
  }

  const renderAuthButtons = () => (
    <div className="flex items-center gap-2">
      {user ? (
        <>
          {isGuest && (
            <span className="text-sm text-gray-400">Guest</span>
          )}
          <button
            onClick={() => setActiveSection("Προφίλ")}
            className="text-sm px-3 py-1 rounded border border-white/20 bg-white hover:bg-white hover:text-black transition"
          >
            {isGuest ? "Guest" : "Προφίλ"}
          </button>
          <button
            onClick={() => {
              logout();
              setActiveSection("Αρχική Σελίδα");
            }}
            className="text-sm px-3 py-1 rounded border border-white/20 bg-white hover:bg-white hover:text-black transition"
          >
            {isGuest ? "Exit Guest" : "Αποσύνδεση"}
          </button>
        </>
      ) : (
        <>
          <button
            onClick={() => setAuthMode('login')}
            className="text-sm px-3 py-1 rounded border border-white/20 bg-white hover:bg-white hover:text-black transition"
          >
            Σύνδεση
          </button>
          <button
            onClick={() => setAuthMode('register')}
            className="text-sm px-3 py-1 rounded border border-white/20 bg-white hover:bg-white hover:text-black transition"
          >
            Εγγραφή
          </button>
          <button
            onClick={guestLogin}
            className="text-sm px-3 py-1 rounded border border-white/20 bg-white hover:bg-white hover:text-black transition"
          >
            Guest
          </button>
        </>
      )}
    </div>
  );

  const showProfileOption = !!user;
  const isAdmin = user?.role === 'admin' || user?.email === 'admin@gmail.com';

  const filteredProducts = products.filter((product) => {
    if (activeBrand && product.brand_name !== activeBrand) {
      return false;
    }

    if (searchTerm && categories.includes(searchTerm)) {
      return product.category_name === searchTerm;
    }

    if (searchTerm && !categories.includes(searchTerm)) {
      return product.name.toLowerCase().includes(searchTerm.toLowerCase());
    }

    return true;
  });

  const handleQtyChange = (index, delta, event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    setCartItems((prev) => {
      const updated = [...prev];
      updated[index].qty += delta;
      if (updated[index].qty <= 0) updated.splice(index, 1);
      return updated;
    });
  };

  const handleRemove = (index) => {
    setCartItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Profile section
  if (activeSection === "Προφίλ") {
    return <Profile setActiveSection={setActiveSection} />;
  }

  // Checkout section
  if (activeSection === "checkout") {
    return <Checkout cartItems={cartItems} setCartItems={setCartItems} setActiveSection={setActiveSection} />;
  }

  // Admin section
  if (activeSection === "Admin") {
    return <AdminPanel setActiveSection={setActiveSection} />;
  }

  // Shopping cart section
  if (activeSection === "Καλάθι Αγορών") {
    return (
      <div className="min-h-screen bg-black text-white px-4 py-10 md:px-20">
        <button
          onClick={() => setActiveSection("Αρχική Σελίδα")}
          className="inline-flex items-center gap-2 text-sm px-4 py-2 border border-white/30 rounded-full hover:bg-white hover:text-black transition mb-8"
        >
          <span className="text-lg">←</span> Πίσω στην Αρχική Σελίδα
        </button>
        <h1 className="text-4xl font-bold mb-8 text-center uppercase">Καλάθι Αγορών</h1>
        {cartItems.length === 0 ? (
          <p className="text-center text-gray-400">Το καλάθι σας είναι άδειο.</p>
        ) : (
          <div>
            <ul className="space-y-4">
              {cartItems.map((item, index) => (
                <li key={index} className="flex gap-4 items-center border-b border-gray-700 pb-4">
                  <img
                    src={item.image || `https://via.placeholder.com/80x80?text=${encodeURIComponent(item.name)}`}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-md"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-500">Ποσότητα: {item.qty}</p>
                    <p className="text-sm text-gray-500">{item.size}</p>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <button
                      onClick={(e) => handleQtyChange(index, -1, e)}
                      className="px-2 py-1 bg-gray-200 text-black rounded hover:bg-gray-300 transition"
                    >
                      -
                    </button>
                    <button
                      onClick={(e) => handleQtyChange(index, 1, e)}
                      className="px-2 py-1 bg-gray-200 rounded text-black hover:bg-gray-200 transition"
                    >
                      +
                    </button>
                    <button
                      onClick={() => handleRemove(index)}
                      className="text-red-500 font-bold text-xl hover:text-red-700 transition"
                    >
                      ×
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <p className="font-bold text-lg">
                Σύνολο: {cartItems.reduce((acc, item) => acc + item.qty * item.price, 0)}€
              </p>
              <button
                onClick={() => setActiveSection("checkout")}
                className="mt-4 w-full bg-white text-black py-2 rounded hover:bg-gray-200 transition font-medium"
              >
                Προχωρήστε στην Αγορά
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white text-black min-h-screen font-sans pb-16 md:pb-0">
      {/* Desktop header */}
      <header className="hidden md:flex items-center justify-between px-4 py-4 bg-black border-b border-zinc-800 gap-4">
        {/* Logo */}
        <img
          src="steez.png"
          alt="STEEZ.GR Logo"
          className="h-24 md:h-24 w-auto cursor-pointer"
          onClick={() => {
            setActiveSection("Αρχική Σελίδα");
            setSearchTerm("");
            setActiveBrand(null);
          }}
        />

        {/* Desktop navigation */}
        <nav className="flex items-center gap-2 md:gap-4 text-sm md:text-base font-medium uppercase">
          {["Αρχική Σελίδα", "Προϊόντα", "Επικοινωνία", "Αναζήτηση Δέματος"].map(
            (key) => (
              <button
                key={key}
                onClick={() => {
                  setActiveSection(key);
                  setActiveBrand(null);
                }}
                className={`px-4 py-2 rounded-lg border border-white/20 hover:bg-white hover:text-black transition ${activeSection === key ? "bg-white text-black" : "bg-zinc-800 text-white"
                  }`}
              >
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </button>
            )
          )}
          {showProfileOption && (
            <button
              onClick={() => {
                setActiveSection("Προφίλ");
              }}
              className={`px-4 py-2 rounded-lg border border-white/20 hover:bg-white hover:text-black transition ${activeSection === "Προφίλ" ? "bg-white text-black" : "bg-zinc-800 text-white"
                }`}
            >
              Προφίλ
            </button>
          )}
          {isAdmin && (
            <button
              onClick={() => {
                setActiveSection("Admin");
              }}
              className={`px-4 py-2 rounded-lg border border-white/20 hover:bg-white hover:text-black transition ${activeSection === "Admin" ? "bg-white text-black" : "bg-zinc-800 text-white"
                }`}
            >
              Admin
            </button>
          )}
        </nav>

        {/* Right side buttons (auth + cart) */}
        <div className="flex items-center gap-4">
          {/* Auth buttons */}
          <div className="flex items-center gap-2">
            {renderAuthButtons()}
          </div>

          {/* Cart button - desktop */}
          <div className="relative">
            <button onClick={() => setShowCart(!showCart)} className="relative">
              <ShoppingCart size={24} color="white" />
              {cartItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-white text-black rounded-full px-2 py-0.5 text-xs font-bold select-none">
                  {cartItems.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Cart dropdown */}
        {showCart && (
          <div className="absolute right-0 md:right-14 top-[20%] md:top-4 mt-2 w-full md:w-80 max-h-[70vh] overflow-y-auto bg-white text-black rounded-lg shadow-xl p-4 z-50 border border-gray-300">
            <h3 className="text-lg font-semibold mb-2">Καλάθι Αγορών</h3>
            {cartItems.length === 0 ? (
              <p className="text-sm">Το καλάθι σας είναι άδειο.</p>
            ) : (
              <ul className="space-y-2">
                {cartItems.map((item, index) => (
                  <li key={index} className="flex justify-between items-center border-b border-gray-200 pb-2">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm">Ποσότητα: {item.qty}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleQtyChange(index, -1)}
                        className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 transition"
                      >
                        -
                      </button>
                      <button
                        onClick={() => handleQtyChange(index, 1)}
                        className="px-2 py-1 bg-gray-200 rounded"
                      >
                        +
                      </button>
                      <button
                        onClick={() => handleRemove(index)}
                        className="text-red-500 font-bold text-xl hover:text-red-700 transition"
                      >
                        ×
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {cartItems.length > 0 && (
              <div className="mt-4">
                <p className="font-bold">Σύνολο: {cartItems.reduce((acc, item) => acc + item.qty * item.price, 0)}€</p>
                <button
                  onClick={() => {
                    setActiveSection("Καλάθι Αγορών");
                    setShowCart(false);
                  }}
                  className="mt-2 w-full bg-black text-white py-2 rounded hover:bg-zinc-800 transition font-medium"
                >
                  Προβολή Καλαθιού
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Mobile header - simplified version with just logo */}
      <header className="md:hidden flex items-center justify-between px-4 py-4 bg-black border-b border-zinc-800">
        <img
          src="steez.png"
          alt="STEEZ.GR Logo"
          className="h-28 w-auto cursor-pointer"
          onClick={() => {
            setActiveSection("Αρχική Σελίδα");
            setSearchTerm("");
            setActiveBrand(null);
          }}
        />
        {/*         <div className="relative">
          <button onClick={() => setShowCart(!showCart)} className="relative">
            <ShoppingCart size={24} />
            {cartItems.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-white text-black rounded-full px-2 py-0.5 text-xs font-bold select-none">
                {cartItems.length}
              </span>
            )}
          </button>
        </div> */}
      </header>

      {/* Main content */}
      <main className="pb-16 md:pb-0">
        {/* Categories Bar */}
        {activeSection === "Προϊόντα" && (
          <div className="bg-zinc-900 py-3 border-b border-zinc-800">
            <div className="container mx-auto px-4">
              <div className="flex flex-wrap">
                {categories.map((category) => (
                  <div key={category} className="w-1/3 sm:w-1/5 mb-2">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setSearchTerm(category);
                        setActiveBrand(null);
                      }}
                      className="w-full px-2 py-1 text-white hover:text-blue-400 transition focus:outline-none"
                    >
                      {category}
                    </button>
                  </div>
                ))}
                <div className="w-full mt-2">
                  <button
                    onClick={() => setShowBrands(!showBrands)}
                    className="px-2 py-1 text-white hover:text-blue-400 focus:outline-none flex items-center gap-1"
                  >
                    View All Brands <span>▼</span>
                  </button>
                </div>
              </div>
              {showBrands && (
                <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 p-3 bg-zinc-800 rounded">
                  {brands.map((brand) => (
                    <button
                      key={brand}
                      onClick={() => {
                        setActiveBrand(brand);
                        setShowBrands(false);
                      }}
                      className="text-left px-2 py-1 text-white hover:text-blue-400 focus:outline-none"
                    >
                      {brand}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Shop Section */}
        {(activeSection === "Προϊόντα" || activeSection === "Αρχική Σελίδα") && (
          <section className="pt-16 pb-20 px-4 md:px-16">
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-10 uppercase tracking-widest flex items-center justify-center gap-2">
              {activeBrand ? `${activeBrand}` : <> <Flame className="text-red-500" />FEATURED</>}
            </h2>

            {loading ? (
              <div className="text-center py-20">
                <p className="text-xl">Φόρτωση προϊόντων...</p>
              </div>
            ) : error ? (
              <div className="text-center py-20 text-red-500">
                <p className="text-xl">{error}</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-xl">Δεν βρέθηκαν προϊόντα</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-6">
                {filteredProducts.map((product) => (
                  <Card
                    key={product.id}
                    className="overflow-hidden shadow-lg hover:scale-105 transition-transform duration-300"
                    onClick={() => {
                      setSelectedProduct({
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        image: product.image_url ? `http://51.21.248.18:5000${product.image_url}` : `https://via.placeholder.com/400x500?text=${encodeURIComponent(product.name)}`,
                        description: product.description,
                        sizes:product.sizes
                      });
                      setActiveSection("ProductDetails");
                    }}
                  >
                    <CardContent className="p-4">
                      <img
                        src={product.image_url ? `http://51.21.248.18:5000${product.image_url}` : `https://via.placeholder.com/400x500?text=${encodeURIComponent(product.name)}`}
                        alt={product.name}
                        className="w-full rounded-xl"
                        loading="lazy"
                      />
                      <div className="mt-4">
                        <h3 className="text-xl font-semibold text-black">{product.name}</h3>
                        <p className="text-gray-400 mt-1">{product.price}€</p>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            setCartItems((prev) => {
                              const existing = prev.find((p) => p.id === product.id);
                              if (existing) {
                                return prev.map((p) => (p.id === product.id ? { ...p, qty: p.qty + 1 } : p));
                              }
                              return [...prev, {
                                id: product.id,
                                name: product.name,
                                price: product.price,
                                image: product.image_url ? `http://51.21.248.18:5000${product.image_url}` : null,
                                qty: 1,
                                size: selectedSize, // Store selected size
                                sizes: product.sizes // Store available sizes for validation
                              }];
                            });
                            setShowCart(true);
                          }}
                          variant="ghost"
                          className="mt-2 text-white flex items-center gap-2 hover:underline"
                        >
                          <ShoppingCart size={16} /> Προσθήκη στο Καλάθι
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Contact Section */}
        {(activeSection === "Επικοινωνία" || activeSection === "Αρχική Σελίδα") && (
          <section className="py-20 px-4 md:px-16 text-center bg-black border-t border-zinc-800">
            <h3 className="text-2xl font-semibold text-white">ΠΛΗΡΟΦΟΡΙΕΣ ΚΑΤΑΣΤΗΜΑΤΟΣ</h3>
            <p className="text-gray-400">Διαδικτυακό κατάστημα με έδρα την Αττική.</p>
            <p className="text-gray-400">Τηλέφωνο: +30 210 000 0000</p>
            <p className="text-gray-400">Email: support@steez.gr</p>
            <h3 className="text-3xl md:text-4xl font-semibold mt-10 text-white">Γίνετε Μέλος</h3>
            <p className="text-gray-400 mt-3 text-lg">Μάθετε πρώτοι για τις νέες παραλαβές. Αποκλειστικές εκπτώσεις σε μέλη.</p>
            <div className="mt-6 flex flex-col md:flex-row justify-center gap-4 max-w-lg mx-auto">
              <input
                type="email"
                placeholder="Εισάγετε το email σας"
                className="p-4 rounded-xl w-full text-black focus:outline-none"
              />
              <Button className="bg-white text-black hover:bg-gray-200 px-6 py-3 text-lg">Εγγραφή</Button>
            </div>
          </section>
        )}

        {/* Package Tracking Section */}
        {(activeSection === "Αναζήτηση Δέματος") && (
          <section className="py-20 px-4 md:px-16 bg-black text-center">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-bold uppercase text-white">Αναζήτηση Δέματος</h2>
              <p className="text-gray-400 mt-6 text-lg">
                Αναζητήστε το δέμα σας από την υπηρεσία ACS Courier με τον αριθμό αποστολής.
              </p>
              <a
                href="https://www.acscourier.net/el/myacs/anafores-apostolwn/anazitisi-apostolwn/"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-block px-6 py-3 text-lg bg-white text-black rounded-lg hover:bg-gray-200 transition"
              >
                Αναζήτηση Δέματος
              </a>
            </div>
          </section>
        )}
        {(activeSection === "ProductDetails") && (
          <div className="min-h-screen bg-white text-black px-4 py-10 md:px-20 border border-black shadow-md hover:shadow-lg">
            {!selectedProduct ? (
              <div className="text-center">
                <p className="text-xl mb-4">Δεν βρέθηκε προϊόν</p>
                <button
                  onClick={() => setActiveSection("Αρχική Σελίδα")}
                  className="inline-flex items-center gap-2 text-sm px-4 py-2 border border-white/30 rounded-full hover:bg-black hover:text-white transition"
                >
                  <span className="text-lg">←</span> Πίσω στην Αρχική Σελίδα
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setActiveSection(products.length > 0 ? "Προϊόντα" : "Αρχική Σελίδα")}
                  className="inline-flex items-center gap-2 text-sm px-4 py-2 border border-black/30 rounded-full hover:bg-black hover:text-white transition mb-8"
                >
                  <span className="text-lg">←</span> Πίσω
                </button>
        
                <div className="max-w-4xl mx-auto bg-white border border-black text-black rounded-xl p-6 md:p-8 shadow-md hover:shadow-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="flex justify-center">
                      <img
                        src={selectedProduct.image || `https://via.placeholder.com/500x500?text=${encodeURIComponent(selectedProduct.name)}`}
                        alt={selectedProduct.name}
                        className="w-[270px] max-w-md h-auto object-cover rounded-lg"
                        loading="lazy"
                        onError={(e) => {
                          e.target.src = `https://via.placeholder.com/500x500?text=${encodeURIComponent(selectedProduct.name)}`;
                        }}
                      />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold mb-4">{selectedProduct.name}</h1>
                      <p className="text-2xl font-semibold mb-6">{selectedProduct.price}€</p>
                      <div className="prose prose-invert max-w-none mb-8">
                        <p className="text-black whitespace-pre-line">
                          {selectedProduct.description || "Δεν υπάρχει διαθέσιμη περιγραφή για αυτό το προϊόν."}
                        </p>
                      </div>
        
                      {/* Size Selection */}
                      {selectedProduct.sizes && selectedProduct.sizes.length > 0 && (
                        <div className="mb-6">
                          <h3 className="text-lg font-medium mb-3">Μέγεθος</h3>
                          <div className="flex flex-wrap gap-3">
                            {selectedProduct.sizes.map((sizeObj) => (
                              <div key={sizeObj.size} className="flex items-center">
                                <input
                                  type="radio"
                                  id={`size-${sizeObj.size}`}
                                  name="product-size"
                                  value={sizeObj.size}
                                  className="hidden peer"
                                  disabled={sizeObj.stock <= 0}
                                  onChange={() => setSelectedSize(sizeObj.size)}
                                />
                                <label
                                  htmlFor={`size-${sizeObj.size}`}
                                  className={`px-4 py-2 border rounded-md cursor-pointer transition
                                    ${sizeObj.stock <= 0 ? 
                                      'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed' :
                                      'border-black hover:bg-black hover:text-white peer-checked:bg-black peer-checked:text-white'
                                    }`}
                                >
                                  {sizeObj.size}
                                  {sizeObj.stock <= 0 && <span className="text-xs block text-gray-500">(Εξαντλήθηκε)</span>}
                                </label>
                              </div>
                            ))}
                          </div>
                          {!selectedSize && selectedProduct.sizes.some(s => s.stock > 0) && (
                            <p className="text-red-500 text-sm mt-2">Παρακαλώ επιλέξτε μέγεθος</p>
                          )}
                        </div>
                      )}
        
                      <Button
                        onClick={() => {
                          // Check if product has sizes and if a size is selected
                          if (selectedProduct.sizes?.length > 0 && !selectedSize) {
                            return;
                          }
        
                          setCartItems((prev) => {
                            const existing = prev.find((p) => 
                              p.id === selectedProduct.id && 
                              (!p.size || p.size === selectedSize)
                            );
                            
                            if (existing) {
                              return prev.map((p) =>
                                p.id === selectedProduct.id && 
                                (!p.size || p.size === selectedSize) 
                                  ? { ...p, qty: p.qty + 1 } 
                                  : p
                              );
                            }
                            
                            return [...prev, {
                              id: selectedProduct.id,
                              name: selectedProduct.name,
                              price: selectedProduct.price,
                              image: selectedProduct.image,
                              qty: 1,
                              size: selectedSize, // Store selected size
                              sizes: selectedProduct.sizes // Store available sizes for validation
                            }];
                          });
                          setShowCart(true);
                        }}
                        className={`w-full py-3 rounded-lg transition font-medium text-lg
                          ${selectedProduct.sizes?.length > 0 && !selectedSize 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-black text-white hover:bg-black-200'
                          }`}
                        disabled={selectedProduct.sizes?.length > 0 && !selectedSize}
                      >
                        Προσθήκη στο Καλάθι
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </main>

      {/* Mobile bottom navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-black border-t border-zinc-800 z-50">
        <div className="flex justify-around items-center py-3">
          {/* Home button */}
          <button
            onClick={() => {
              setActiveSection("Αρχική Σελίδα");
              setSearchTerm("");
              setActiveBrand(null);
            }}
            className={`flex flex-col items-center ${activeSection === "Αρχική Σελίδα" ? "text-white" : "text-gray-400"}`}
          >
            <Home size={24} />
            <span className="text-xs mt-1">Αρχική</span>
          </button>

          {/* Products button */}
          <button
            onClick={() => {
              setActiveSection("Προϊόντα");
            }}
            className={`flex flex-col items-center ${activeSection === "Προϊόντα" ? "text-white" : "text-gray-400"}`}
          >
            <Package size={24} />
            <span className="text-xs mt-1">Προϊόντα</span>
          </button>

          {/* Cart button */}
          <button
            onClick={() => {
              setActiveSection("Καλάθι Αγορών");
            }}
            className={`flex flex-col items-center relative ${activeSection === "Καλάθι Αγορών" ? "text-white" : "text-gray-400"}`}
          >
            <ShoppingCart size={24} />
            {cartItems.length > 0 && (
              <span className="absolute -top-1 right-2 bg-white text-black rounded-full px-1.5 py-0.5 text-xs font-bold select-none">
                {cartItems.length}
              </span>
            )}
            <span className="text-xs mt-1">Καλάθι</span>
          </button>

          {/* Contact button */}
          <button
            onClick={() => {
              setActiveSection("Επικοινωνία");
            }}
            className={`flex flex-col items-center ${activeSection === "Επικοινωνία" ? "text-white" : "text-gray-400"}`}
          >
            <Contact size={24} />
            <span className="text-xs mt-1">Επικοινωνία</span>
          </button>

          {/* Profile button - only shows when logged in */}
          {user && (
            <button
              onClick={() => {
                setActiveSection("Προφίλ");
              }}
              className={`flex flex-col items-center ${activeSection === "Προφίλ" ? "text-white" : "text-gray-400"}`}
            >
              <User size={24} />
              <span className="text-xs mt-1">Προφίλ</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home1;