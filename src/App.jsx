import React, { useState, useEffect, useMemo } from 'react';
import { 
  Leaf, Coins, Truck, Users, Plus, ArrowRight, Globe, Signal, Smartphone,
  CheckCircle, Clock, Search, MapPin, User, Save, Sparkles, Wand2,
  Loader, AlertTriangle, Key, Info, FileText, Camera, Tag, Receipt, X, Gavel, 
  TrendingUp, Scale, Trash2, Navigation
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, signInAnonymously, onAuthStateChanged
} from 'firebase/auth';
import { 
  getFirestore, collection, addDoc, onSnapshot, serverTimestamp, doc, updateDoc, setDoc, deleteDoc
} from 'firebase/firestore';

// --- Configuration & Constants ---

const LANGUAGES = { EN: 'English', HI: 'हिंदी (Hindi)' };

// GST Rates configuration
const GST_RATES = {
  'Vegetable': 0,
  'Fruit': 0,
  'Seeds': 0,
  'Tools': 12,
  'Machinery': 18,
  'Other': 5
};

const UNITS = ['kg', 'quintal', 'pcs', 'ton'];

const ITEM_TYPES = Object.keys(GST_RATES);

const TRANSLATIONS = {
  EN: {
    app_name: "AgriLite Market",
    select_role: "Who are you?",
    farmer: "Seller / Farmer",
    buyer: "Buyer",
    farmer_desc: "I want to sell items",
    buyer_desc: "I want to buy items",
    my_listings: "My Listings",
    add_listing: "List New Item",
    market_feed: "Market Feed",
    buy_now: "Buy & Bill",
    item_name: "Item Name",
    item_category: "Category / Breed / Brand",
    item_type: "Item Type",
    quantity: "Quantity",
    unit: "Unit",
    price_per_unit: "Price per Unit (₹)",
    instant_price: "Instant Sell Price (per Unit)",
    total_value: "Total Value",
    avail_date: "Available Date",
    submit: "Post Listing",
    posting: "Posting...",
    loading: "Loading market...",
    switch_lang: "भाषा बदलें",
    back: "Back",
    contact_seller: "Call Seller",
    posted: "Posted",
    expires: "Harvest",
    low_data_mode: "Lite Mode Active",
    status_active: "Active",
    status_sold: "Sold",
    mark_sold: "Mark as Sold",
    verify_number: "Phone Number",
    start_app: "Start",
    search_placeholder: "Search items...",
    profile_setup: "Setup Profile",
    your_name: "Your Name",
    pincode: "Pincode (Auto-fill)",
    state: "State",
    district: "District",
    city_village: "City / Village",
    save_profile: "Save Profile",
    saving: "Saving...",
    edit_profile: "Edit Profile",
    location: "Location",
    welcome: "Welcome",
    fill_profile: "Please fill your details once to continue.",
    magic_fill_label: "✨ Magic Fill (Type naturally)",
    magic_fill_placeholder: "e.g., Selling 500kg onions for 20rs/kg next monday...",
    magic_fill_btn: "Auto-Fill Form",
    generating: "Thinking...",
    tips_error: "Could not load tips.",
    auth_error: "Authentication Error",
    auth_help: "Please check if 'Anonymous Auth' is enabled in Firebase Console.",
    taking_long: "Taking longer than usual...",
    check_connection: "Check your internet or Firebase config.",
    db_error: "Database Error",
    db_help: "If this persists, check your Firestore Rules (Test Mode) or Project ID.",
    upload_photo: "Add Photo",
    photo_compressed: "Photo added!",
    bill_invoice: "TAX INVOICE",
    bill_to: "Bill To",
    bill_from: "Sold By",
    bill_details: "Order Details",
    subtotal: "Subtotal",
    gst: "GST",
    total: "Grand Total",
    confirm_order: "Confirm Order",
    order_placed: "Order Placed Successfully!",
    sale_mode: "Sale Mode",
    fixed_price: "Fixed Price",
    auction: "Auction",
    current_bids: "Current Bids",
    place_bid: "Place Bid",
    bid_amount: "Your Bid (per Unit ₹)",
    no_bids: "No bids yet",
    accept_bid: "Accept Bid",
    highest_bid: "Highest Bid",
    market_insight: "Market Insight",
    insight_bullish: "📈 High Demand! You might want to wait for higher bids.",
    insight_bearish: "📉 Market Slow. Consider selling at current price.",
    instant_sold: "⚡ Instant Price Met!",
    delete_listing: "Delete",
    fetching_loc: "Fetching location...",
    loc_found: "Location Found!",
    closest_farmers: "Nearby Farmers First",
    buy_qty: "Buy Quantity",
    max_avail: "Max Available"
  },
  HI: {
    app_name: "एग्री-लाइट मंडी",
    select_role: "आप कौन हैं?",
    farmer: "विक्रेता / किसान",
    buyer: "खरीदार (व्यापारी)",
    farmer_desc: "मैं सामान बेचना चाहता हूँ",
    buyer_desc: "मैं सामान खरीदना चाहता हूँ",
    my_listings: "मेरी लिस्टिंग",
    add_listing: "नया सामान जोड़ें",
    market_feed: "मंडी के भाव",
    buy_now: "खरीदें और बिल",
    item_name: "वस्तु का नाम",
    item_category: "किस्म / नस्ल / ब्रांड",
    item_type: "वस्तु का प्रकार",
    quantity: "मात्रा",
    unit: "इकाई (Unit)",
    price_per_unit: "मूल्य प्रति इकाई (₹)",
    instant_price: "तत्काल बिक्री मूल्य (प्रति इकाई)",
    total_value: "कुल मूल्य",
    avail_date: "उपलब्धता की तारीख",
    submit: "पोस्ट करें",
    posting: "पोस्ट हो रहा है...",
    loading: "मंडी लोड हो रही है...",
    switch_lang: "Switch to English",
    back: "पीछे",
    contact_seller: "विक्रेता को कॉल करें",
    posted: "पोस्ट किया",
    expires: "कटाई",
    low_data_mode: "लाइट मोड सक्रिय",
    status_active: "सक्रिय",
    status_sold: "बिक गया",
    mark_sold: "बिका हुआ मार्क करें",
    verify_number: "फ़ोन नंबर",
    start_app: "शुरू करें",
    search_placeholder: "वस्तु खोजें...",
    profile_setup: "प्रोफाइल बनाएं",
    your_name: "आपका नाम",
    pincode: "पिन कोड (ऑटो-फिल)",
    state: "राज्य",
    district: "ज़िला",
    city_village: "शहर / गाँव",
    save_profile: "प्रोफाइल सहेजें",
    saving: "सहेजा जा रहा है...",
    edit_profile: "प्रोफाइल बदलें",
    location: "स्थान",
    welcome: "स्वागत है",
    fill_profile: "कृपया आगे बढ़ने के लिए अपना विवरण भरें।",
    magic_fill_label: "✨ मैजिक फिल (बोलचाल की भाषा में लिखें)",
    magic_fill_placeholder: "जैसे: मैं 500 किलो प्याज 20 रुपये में अगले सोमवार बेचूंगा...",
    magic_fill_btn: "ऑटो-फिल फॉर्म",
    generating: "सोच रहा हूँ...",
    tips_error: "सुझाव लोड नहीं हो सके।",
    auth_error: "प्रमाणीकरण त्रुटि",
    auth_help: "कृपया फायरबेस कंसोल में 'Anonymous Auth' जांचें।",
    taking_long: "सामान्य से अधिक समय लग रहा है...",
    check_connection: "अपना इंटरनेट या फायरबेस कॉन्फ़िगरेशन जांचें।",
    db_error: "डेटाबेस त्रुटि",
    db_help: "अगर यह जारी रहता है, तो फायरबेस रूल्स (Test Mode) या प्रोजेक्ट ID जांचें।",
    upload_photo: "फोटो जोड़ें",
    photo_compressed: "फोटो जोड़ा गया!",
    bill_invoice: "टैक्स चालान",
    bill_to: "ग्राहक",
    bill_from: "विक्रेता",
    bill_details: "ऑर्डर विवरण",
    subtotal: "उप-योग",
    gst: "जीएसटी",
    total: "कुल योग",
    confirm_order: "ऑर्डर पक्का करें",
    order_placed: "ऑर्डर सफलतापूर्वक दिया गया!",
    sale_mode: "बिक्री का तरीका",
    fixed_price: "फिक्स्ड रेट",
    auction: "नीलामी (बोली)",
    current_bids: "मौजूदा बोलियाँ",
    place_bid: "बोली लगाओ",
    bid_amount: "आपकी बोली (प्रति इकाई ₹)",
    no_bids: "कोई बोली नहीं",
    accept_bid: "बोली स्वीकारें",
    highest_bid: "सबसे ऊंची बोली",
    market_insight: "बाज़ार की राय",
    insight_bullish: "📈 मांग अधिक है! ऊँची बोली का इंतज़ार कर सकते हैं।",
    insight_bearish: "📉 बाज़ार धीमा है। मौजूदा भाव पर बेचना ठीक रहेगा।",
    instant_sold: "⚡ तत्काल मूल्य मिल गया!",
    delete_listing: "हटाएं",
    fetching_loc: "स्थान प्राप्त हो रहा है...",
    loc_found: "स्थान मिला!",
    closest_farmers: "नज़दीकी किसान पहले",
    buy_qty: "खरीदने की मात्रा",
    max_avail: "अधिकतम उपलब्ध"
  }
};

// --- Firebase Initialization ---
// ⚠️ IMPORTANT: YOU MUST PASTE YOUR KEYS HERE OR THE APP WILL NOT LOAD ⚠️
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {
  apiKey: "AIzaSyBW4V8VBwTbAtSb_NALSudR4sN1YbfzjPA",
  authDomain: "agrilite-292f4.firebaseapp.com",
  projectId: "agrilite-292f4",
  storageBucket: "agrilite-292f4.firebasestorage.app",
  messagingSenderId: "22274005992",
  appId: "1:22274005992:web:9e3dc446170bceb097625d",
  measurementId: "G-TERH32Y2SW"
};

// Initialize only if config is valid to prevent crashes
let app, auth, db;
try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (e) {
  console.error("Firebase Init Error:", e);
}

const appId = 'agri-lite-v1';

// --- Gemini API Helper ---
const callGemini = async (prompt) => {
  const apiKey = "AIzaSyCuh8CYOBPpO9gcWwlRggutLzJkQw8TrB0"; // <--- PASTE GEMINI KEY HERE
  if (!apiKey) {
      alert("Please add your Gemini API Key in src/App.jsx to use AI features.");
      return null;
  }
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return null;
  }
};

// --- Helper: Compress Image to Base64 ---
const compressImage = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const scaleSize = 300 / img.width;
        canvas.width = 300;
        canvas.height = img.height * scaleSize;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.7)); 
      };
    };
  });
};

// --- Components ---

export default function AgriLiteApp() {
  const [user, setUser] = useState(null);
  const [lang, setLang] = useState('EN');
  const [role, setRole] = useState(null); 
  const [view, setView] = useState('LANDING'); 
  const [listings, setListings] = useState([]);
  const [bids, setBids] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItemForBill, setSelectedItemForBill] = useState(null); 
  
  // New States for Error Handling
  const [authError, setAuthError] = useState(null);
  const [longLoad, setLongLoad] = useState(false);
  const [saving, setSaving] = useState(false); 
  const [saveError, setSaveError] = useState(null); 
  
  const t = (key) => TRANSLATIONS[lang][key] || key;

  // --- 1. Check for Missing Keys (The Fix for the Spinner) ---
  if (firebaseConfig.apiKey === "YOUR_API_KEY_HERE" && typeof __firebase_config === 'undefined') {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-red-50 text-red-900 p-6 text-center">
        <Key size={64} className="mb-4 text-red-600" />
        <h1 className="text-3xl font-bold mb-2">Setup Required</h1>
        <p className="text-lg mb-6">You haven't pasted your Firebase Keys yet!</p>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-red-200 text-left max-w-md w-full">
            <h3 className="font-bold mb-2">How to fix:</h3>
            <ol className="list-decimal pl-5 space-y-2 text-sm">
                <li>Open <code className="bg-gray-100 p-1 rounded">src/App.jsx</code> in your code editor.</li>
                <li>Scroll to line ~78 (firebaseConfig).</li>
                <li>Replace <code className="text-red-600">"YOUR_API_KEY_HERE"</code> with your actual keys from Firebase Console.</li>
                <li>Save the file. This page will refresh automatically.</li>
            </ol>
        </div>
      </div>
    );
  }

  // --- Auth & Data Effects ---

  useEffect(() => {
    const timer = setTimeout(() => {
        if (!user && !authError) setLongLoad(true);
    }, 5000);

    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (error) {
        console.error("Auth Error:", error);
        setAuthError(error.message);
      }
    };
    initAuth();
    
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
          setLoading(false);
          setLongLoad(false);
      }
    });

    return () => {
        unsubscribe();
        clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!user) return;

    const profileRef = doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'main');
    const unsubProfile = onSnapshot(profileRef, (doc) => {
        if (doc.exists()) {
            const data = doc.data();
            setProfile(data);
            if (data.role) setRole(data.role);
        }
    });

    const listingsRef = collection(db, 'artifacts', appId, 'public', 'data', 'listings');
    const unsubListings = onSnapshot(listingsRef, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Default Sort by Timestamp
      data.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
      setListings(data);
      setLoading(false);
    }, (error) => {
      console.error("Listings fetch error", error);
      setLoading(false); 
    });

    const bidsRef = collection(db, 'artifacts', appId, 'public', 'data', 'bids');
    const unsubBids = onSnapshot(bidsRef, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBids(data);
    }, (error) => console.error("Bids fetch error", error));

    return () => {
      unsubProfile();
      unsubListings();
      unsubBids();
    };
  }, [user]);

  // --- Helpers ---
  const getBidsForListing = (listingId) => {
    return bids.filter(b => b.listingId === listingId).sort((a, b) => b.amount - a.amount);
  };

  // --- Actions ---

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    const form = e.target;
    
    const profileData = {
        name: form.name.value,
        phone: form.phone.value,
        pincode: form.pincode.value,
        state: form.state.value,
        district: form.district.value,
        city: form.city.value,
        address: `${form.city.value}, ${form.district.value}, ${form.state.value}, ${form.pincode.value}`, // Combo for backward compatibility
        role: role || 'BUYER' 
    };
    
    try {
        const savePromise = setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'main'), profileData);
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Network/Database Timeout")), 15000)
        );
        await Promise.race([savePromise, timeoutPromise]);
        setView('DASHBOARD');
    } catch (err) {
        console.error("Error saving profile:", err);
        setSaveError(err.message);
    } finally {
        setSaving(false);
    }
  };

  const handleAddListing = async (e, imageBase64) => {
    e.preventDefault();
    
    const newListing = {
      itemName: e.target.itemName.value,
      category: e.target.category.value,
      type: e.target.type.value,
      saleMode: e.target.saleMode.value || 'fixed', 
      quantity: e.target.quantity.value,
      unit: e.target.unit.value,
      price: e.target.price.value,
      date: e.target.date.value,
      phone: e.target.phone.value,     
      
      // Save structured location to listing for filtering
      pincode: profile?.pincode || '',
      district: profile?.district || '',
      state: profile?.state || '',
      address: profile?.address || 'Unknown',
      farmerId: user.uid,
      sellerName: profile?.name || 'Unknown',
      image: imageBase64 || null, 
      status: 'active',
      gstRate: GST_RATES[e.target.type.value] || 0, 
      timestamp: serverTimestamp(),
      lang: lang
    };

    setSaving(true); 

    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'listings'), newListing);
      setSaving(false);
      setView('DASHBOARD');
    } catch (err) {
      console.error("Error adding listing:", err);
      alert("Error posting listing: " + err.message);
      setSaving(false);
    }
  };

  const handleAcceptBid = async (listing, bidAmount) => {
    try {
      const ref = doc(db, 'artifacts', appId, 'public', 'data', 'listings', listing.id);
      await updateDoc(ref, { 
          status: 'sold',
          finalPrice: bidAmount 
      });
      const itemWithFinalPrice = { ...listing, price: bidAmount };
      setSelectedItemForBill(itemWithFinalPrice);
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const handleDeleteListing = async (listingId) => {
      if(!confirm("Are you sure you want to delete this listing?")) return;
      try {
          await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'listings', listingId));
      } catch(err) {
          console.error("Error deleting listing", err);
          alert("Failed to delete listing.");
      }
  };

  const handlePlaceBid = async (listing, amount, phone) => {
    if (!amount || !phone) return;
    const bidValue = parseFloat(amount);
    
    if (listing.saleMode === 'auction' && bidValue >= parseFloat(listing.price)) {
        if(confirm(`Your bid of ₹${bidValue} meets the Instant Sell Price! Do you want to buy it immediately?`)) {
            await handleAcceptBid(listing, bidValue);
            return;
        }
    }

    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'bids'), {
        listingId: listing.id,
        buyerId: user.uid,
        buyerName: profile?.name || 'Unknown',
        amount: bidValue,
        phone,
        timestamp: serverTimestamp()
      });
      alert("Bid placed!");
    } catch (err) {
      console.error("Error placing bid:", err);
    }
  };

  const handleRoleSelection = (selectedRole) => {
      setRole(selectedRole);
      if (profile && profile.name) {
          setView('DASHBOARD');
      } else {
          setView('PROFILE_SETUP');
      }
  };

  // --- Views ---

  const LandingPage = () => (
    <div className="flex flex-col h-full bg-slate-50">
      <header className="bg-green-700 text-white p-4 shadow-md flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Leaf size={24} />
          <h1 className="font-bold text-xl">{t('app_name')}</h1>
        </div>
        <button 
          onClick={() => setLang(l => l === 'EN' ? 'HI' : 'EN')}
          className="text-xs bg-green-800 px-2 py-1 rounded flex items-center gap-1 border border-green-600"
        >
          <Globe size={12} />
          {lang === 'EN' ? 'हिंदी' : 'ENG'}
        </button>
      </header>
      
      <main className="flex-1 p-6 flex flex-col justify-center gap-6 max-w-md mx-auto w-full">
        <div className="text-center space-y-2 mb-4">
          <h2 className="text-2xl font-bold text-gray-800">{t('select_role')}</h2>
          <div className="flex items-center justify-center gap-2 text-xs text-green-700 font-medium bg-green-100 py-1 px-3 rounded-full w-fit mx-auto">
            <Signal size={12} /> {t('low_data_mode')}
          </div>
        </div>

        <button 
          onClick={() => handleRoleSelection('FARMER')}
          className="flex items-center gap-4 p-6 bg-white border-2 border-green-600 rounded-xl shadow-sm hover:bg-green-50 active:scale-95 transition-transform"
        >
          <div className="bg-green-100 p-4 rounded-full text-green-700">
            <Truck size={32} />
          </div>
          <div className="text-left">
            <h3 className="text-xl font-bold text-gray-900">{t('farmer')}</h3>
            <p className="text-sm text-gray-500">{t('farmer_desc')}</p>
          </div>
        </button>

        <button 
          onClick={() => handleRoleSelection('BUYER')}
          className="flex items-center gap-4 p-6 bg-white border-2 border-blue-600 rounded-xl shadow-sm hover:bg-blue-50 active:scale-95 transition-transform"
        >
          <div className="bg-blue-100 p-4 rounded-full text-blue-700">
            <Coins size={32} />
          </div>
          <div className="text-left">
            <h3 className="text-xl font-bold text-gray-900">{t('buyer')}</h3>
            <p className="text-sm text-gray-500">{t('buyer_desc')}</p>
          </div>
        </button>
      </main>
    </div>
  );

  const ProfileSetup = () => {
      const [fetchingLoc, setFetchingLoc] = useState(false);
      
      const handlePincodeChange = async (e) => {
          const code = e.target.value;
          if (code.length === 6) {
              setFetchingLoc(true);
              try {
                  const res = await fetch(`https://api.postalpincode.in/pincode/${code}`);
                  const data = await res.json();
                  if (data[0].Status === "Success") {
                      const details = data[0].PostOffice[0];
                      // Auto-fill form fields by ID
                      document.getElementById('state').value = details.State;
                      document.getElementById('district').value = details.District;
                      document.getElementById('city').value = details.Block;
                  }
              } catch (err) {
                  console.error("Pincode fetch error", err);
              } finally {
                  setFetchingLoc(false);
              }
          }
      };

      return (
      <div className="p-4 max-w-lg mx-auto bg-white h-full overflow-y-auto flex flex-col">
        <div className="flex items-center gap-2 mb-6 text-gray-800 border-b pb-4">
            <button onClick={() => setView('LANDING')} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
                <ArrowRight className="rotate-180" size={24} />
            </button>
            <User size={24} className="text-green-700"/>
            <h2 className="text-xl font-bold">{t('profile_setup')}</h2>
        </div>
        
        <p className="text-gray-500 mb-6 text-sm bg-blue-50 p-3 rounded">{t('fill_profile')}</p>

        <form onSubmit={handleSaveProfile} className="space-y-4 flex-1">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('your_name')}</label>
                <input required name="name" defaultValue={profile?.name || ''} type="text" className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-green-500 text-lg" placeholder="Ram Kumar" />
            </div>
            
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('verify_number')}</label>
                <input required name="phone" defaultValue={profile?.phone || ''} type="tel" inputMode="numeric" className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-green-500 text-lg" placeholder="98XXXXXXXX" />
            </div>

            <div className="bg-gray-50 p-3 rounded border border-gray-200 space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-gray-700 border-b pb-2 mb-2">
                    <MapPin size={16}/> {t('location')}
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">{t('pincode')}</label>
                    <div className="relative">
                        <input required name="pincode" id="pincode" onChange={handlePincodeChange} defaultValue={profile?.pincode || ''} type="text" inputMode="numeric" maxLength="6" className="w-full p-2 border border-gray-300 rounded bg-white" placeholder="110001" />
                        {fetchingLoc && <Loader size={16} className="absolute right-3 top-3 animate-spin text-green-600"/>}
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">{t('state')}</label>
                        <input required name="state" id="state" defaultValue={profile?.state || ''} readOnly className="w-full p-2 border border-gray-300 rounded bg-gray-100" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">{t('district')}</label>
                        <input required name="district" id="district" defaultValue={profile?.district || ''} readOnly className="w-full p-2 border border-gray-300 rounded bg-gray-100" />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">{t('city_village')}</label>
                    <input required name="city" id="city" defaultValue={profile?.city || ''} type="text" className="w-full p-2 border border-gray-300 rounded bg-white" />
                </div>
            </div>
            
            {saveError && (
                <div className="bg-red-50 text-red-700 p-3 rounded text-sm flex items-start gap-2">
                    <AlertTriangle size={16} className="mt-1 shrink-0" /> 
                    <div>
                        <p className="font-bold">{t('db_error')}</p>
                        <p>{saveError}</p>
                    </div>
                </div>
            )}

            <button 
                type="submit" 
                disabled={saving}
                className="w-full bg-green-700 text-white font-bold text-lg p-4 rounded-lg mt-6 active:bg-green-800 flex items-center justify-center gap-2 disabled:opacity-70"
            >
                {saving ? <Loader className="animate-spin" size={20} /> : <Save size={20} />}
                {saving ? t('saving') : t('save_profile')}
            </button>
        </form>
      </div>
      );
  };

  const AddListingForm = () => {
    const [magicText, setMagicText] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const [img, setImg] = useState(null); 
    const [saleMode, setSaleMode] = useState('fixed');
    
    const [formData, setFormData] = useState({
        itemName: '',
        category: '', 
        type: 'Vegetable',
        quantity: '',
        unit: 'kg', 
        price: '',
        date: new Date().toISOString().split('T')[0]
    });

    const totalValue = (parseFloat(formData.quantity) || 0) * (parseFloat(formData.price) || 0);

    const handleMagicFill = async () => {
        if (!magicText) return;
        setIsThinking(true);
        const prompt = `
          Extract fields: itemName, category (breed/brand), type (Vegetable, Fruit, Seeds, Tools, Machinery), quantity, unit (kg, quintal, pcs), price (per unit number), date (YYYY-MM-DD) from: "${magicText}". 
          Return raw JSON only.
        `;
        const result = await callGemini(prompt);
        setIsThinking(false);
        if (result) {
            try {
                const cleaned = result.replace(/```json/g, '').replace(/```/g, '').trim();
                const data = JSON.parse(cleaned);
                setFormData(prev => ({ ...prev, ...data }));
            } catch (e) {
                console.error("Magic fill parse error");
            }
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if(file) {
            const compressed = await compressImage(file);
            setImg(compressed);
        }
    };

    return (
      <div className="p-4 max-w-lg mx-auto bg-white h-full overflow-y-auto">
         <div className="flex items-center gap-2 mb-6 text-green-800 border-b pb-2">
          <button onClick={() => setView('DASHBOARD')} className="p-2 -ml-2"><ArrowRight className="rotate-180" /></button>
          <h2 className="text-xl font-bold">{t('add_listing')}</h2>
        </div>

        {/* Magic Fill */}
        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 mb-6 shadow-sm">
            <div className="flex items-center gap-2 text-indigo-800 font-bold mb-2">
                <Sparkles size={18} /> <label className="text-sm">{t('magic_fill_label')}</label>
            </div>
            <textarea value={magicText} onChange={(e) => setMagicText(e.target.value)} placeholder={t('magic_fill_placeholder')} className="w-full p-3 rounded-lg border border-indigo-200 text-sm outline-none" rows="2"/>
            <button onClick={handleMagicFill} disabled={isThinking || !magicText} className="mt-2 w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50">
                {isThinking ? <Loader className="animate-spin" size={16} /> : <Wand2 size={16} />} {t('magic_fill_btn')}
            </button>
        </div>

        <form onSubmit={(e) => handleAddListing(e, img)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('item_name')}</label>
            <input required name="itemName" value={formData.itemName} onChange={e => setFormData({...formData, itemName: e.target.value})} type="text" className="w-full p-3 border-2 border-gray-300 rounded-lg text-lg" placeholder="Potato" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('item_category')}</label>
            <input required name="category" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} type="text" className="w-full p-3 border-2 border-gray-300 rounded-lg text-lg" placeholder="e.g. Jyoti / Mahindra" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('item_type')}</label>
            <select name="type" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full p-3 border-2 border-gray-300 rounded-lg text-lg bg-white">
                {ITEM_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('sale_mode')}</label>
            <div className="grid grid-cols-2 gap-3">
                <label className={`p-3 border-2 rounded-lg flex items-center justify-center gap-2 cursor-pointer ${saleMode === 'fixed' ? 'border-blue-600 bg-blue-50 text-blue-800 font-bold' : 'border-gray-200'}`}>
                    <input type="radio" name="saleMode" value="fixed" checked={saleMode === 'fixed'} onChange={() => setSaleMode('fixed')} className="hidden" />
                    <Tag size={18} /> {t('fixed_price')}
                </label>
                <label className={`p-3 border-2 rounded-lg flex items-center justify-center gap-2 cursor-pointer ${saleMode === 'auction' ? 'border-amber-600 bg-amber-50 text-amber-800 font-bold' : 'border-gray-200'}`}>
                    <input type="radio" name="saleMode" value="auction" checked={saleMode === 'auction'} onChange={() => setSaleMode('auction')} className="hidden" />
                    <Gavel size={18} /> {t('auction')}
                </label>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('quantity')}</label>
              <input required name="quantity" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} type="text" inputMode="decimal" className="w-full p-3 border-2 border-gray-300 rounded-lg text-lg" />
            </div>
            <div className="w-1/3">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('unit')}</label>
              <select name="unit" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} className="w-full p-3 border-2 border-gray-300 rounded-lg text-lg bg-white">
                  {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>

          <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                  {saleMode === 'fixed' ? t('price_per_unit') : t('instant_price')}
              </label>
              <input required name="price" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} type="number" inputMode="numeric" className="w-full p-3 border-2 border-gray-300 rounded-lg text-lg" />
              
              {/* Auto-calculated total */}
              {totalValue > 0 && (
                  <div className="mt-2 text-right font-bold text-green-700">
                      {t('total_value')}: ₹{totalValue.toFixed(2)}
                  </div>
              )}

              {/* Mock Market Insight for Auction */}
              {saleMode === 'auction' && (
                  <div className="mt-2 text-xs flex items-center gap-2 p-2 bg-amber-50 border border-amber-200 rounded text-amber-800">
                      <TrendingUp size={14} /> 
                      <span className="font-bold">{t('market_insight')}:</span> 
                      {Math.random() > 0.5 ? t('insight_bullish') : t('insight_bearish')}
                  </div>
              )}
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <label className="flex flex-col items-center gap-2 cursor-pointer">
                  {img ? (
                      <>
                        <img src={img} alt="Preview" className="h-32 object-contain" />
                        <span className="text-green-600 text-sm font-bold">{t('photo_compressed')}</span>
                      </>
                  ) : (
                      <>
                        <Camera size={32} className="text-gray-400" />
                        <span className="text-gray-500">{t('upload_photo')}</span>
                      </>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </label>
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">{t('avail_date')}</label>
             <input required name="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} type="date" className="w-full p-3 border-2 border-gray-300 rounded-lg text-lg" />
          </div>

          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 space-y-3">
              <h4 className="text-sm font-bold text-gray-500 uppercase">Contact Details</h4>
              <div><label className="block text-xs font-medium text-gray-500 mb-1">{t('location')}</label><input required name="address" defaultValue={profile?.address} type="text" className="w-full p-2 border border-gray-300 rounded" /></div>
              <div><label className="block text-xs font-medium text-gray-500 mb-1">{t('verify_number')}</label><input required name="phone" defaultValue={profile?.phone} type="tel" className="w-full p-2 border border-gray-300 rounded" /></div>
          </div>

          <button type="submit" disabled={saving} className="w-full bg-green-700 text-white font-bold text-lg p-4 rounded-lg mt-2 active:bg-green-800 disabled:opacity-70">
              {saving ? <Loader className="animate-spin inline mr-2" /> : null}
              {saving ? t('posting') : t('submit')}
          </button>
        </form>
      </div>
    );
  };

  const BillingView = ({ item, onBack }) => {
      // State for customizable quantity
      const [buyQty, setBuyQty] = useState(item.quantity);
      
      // Calculate total based on Price Per Unit * Custom Quantity
      const subtotal = parseFloat(item.price) * parseFloat(buyQty || 0);
      const gstRate = item.gstRate || 0;
      const gstAmount = (subtotal * gstRate) / 100;
      const total = subtotal + gstAmount;

      return (
          <div className="bg-white min-h-screen flex flex-col">
              <div className="bg-blue-700 text-white p-4 shadow-md flex justify-between items-center print:hidden">
                  <h1 className="font-bold text-lg">{t('bill_invoice')}</h1>
                  <button onClick={onBack} className="p-2"><X /></button>
              </div>
              
              <div className="p-6 flex-1 overflow-y-auto">
                  <div className="border border-gray-200 rounded-lg p-6 shadow-sm bg-white">
                      <div className="flex justify-between items-start border-b pb-4 mb-4">
                          <div>
                              <h2 className="text-2xl font-bold text-gray-800">{t('app_name')}</h2>
                              <p className="text-xs text-gray-500">Invoice #{Math.floor(Math.random() * 10000)}</p>
                              <p className="text-xs text-gray-500">{new Date().toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                              <Receipt size={32} className="ml-auto text-blue-600 mb-1"/>
                              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-bold">PAID</span>
                          </div>
                      </div>

                      <div className="grid grid-cols-2 gap-8 mb-6 text-sm">
                          <div>
                              <h3 className="font-bold text-gray-500 uppercase mb-1">{t('bill_from')}</h3>
                              <p className="font-bold text-lg">{item.sellerName}</p>
                              <p>{item.phone}</p>
                              <p>{item.address}</p>
                          </div>
                          <div className="text-right">
                              <h3 className="font-bold text-gray-500 uppercase mb-1">{t('bill_to')}</h3>
                              <p className="font-bold text-lg">{profile?.name}</p>
                              <p>{profile?.phone}</p>
                              <p>{profile?.address}</p>
                          </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                          <h3 className="font-bold text-gray-700 mb-3 border-b pb-2">{t('bill_details')}</h3>
                          <div className="flex justify-between mb-2 items-center">
                              <div>
                                  <p className="font-bold">{item.itemName}</p>
                                  <p className="text-xs text-gray-500">{item.category}</p>
                              </div>
                              <div className="text-right">
                                  <p className="font-bold">₹{item.price} / {item.unit}</p>
                                  <div className="flex items-center justify-end gap-2 mt-1">
                                      <span className="text-xs text-gray-500">{t('buy_qty')}:</span>
                                      <input 
                                          type="number" 
                                          value={buyQty}
                                          onChange={(e) => setBuyQty(e.target.value)}
                                          max={item.quantity}
                                          min="1"
                                          className="w-20 p-1 border rounded text-right text-sm"
                                      />
                                      <span className="text-xs text-gray-500">{item.unit}</span>
                                  </div>
                                  <p className="text-[10px] text-gray-400">{t('max_avail')}: {item.quantity}</p>
                              </div>
                          </div>
                          <div className="flex justify-between mb-2 text-gray-500 text-xs mt-2 border-t pt-2">
                              <span>Type: {item.type}</span>
                              <span>Mode: {item.saleMode === 'auction' ? 'Auction (Instant)' : 'Fixed'}</span>
                          </div>
                      </div>

                      <div className="space-y-2 border-t pt-4">
                          <div className="flex justify-between text-gray-600">
                              <span>{t('subtotal')}</span>
                              <span>₹{subtotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-gray-600">
                              <span>{t('gst')} ({gstRate}%)</span>
                              <span>₹{gstAmount.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-xl font-bold text-gray-900 border-t border-dashed pt-2 mt-2">
                              <span>{t('total')}</span>
                              <span>₹{total.toFixed(2)}</span>
                          </div>
                      </div>
                  </div>

                  <button onClick={() => { alert(t('order_placed')); onBack(); }} className="w-full bg-blue-600 text-white font-bold py-4 rounded-lg mt-6 shadow-lg print:hidden">
                      {t('confirm_order')}
                  </button>
              </div>
          </div>
      );
  };

  const ListingCard = ({ listing, isOwner }) => {
    const [expanded, setExpanded] = useState(false);
    const isSold = listing.status === 'sold';
    
    // Auction specific state
    const [bidAmount, setBidAmount] = useState('');
    const listingBids = getBidsForListing(listing.id);
    const highestBid = listingBids.length > 0 ? listingBids[0].amount : 0;

    return (
      <div className={`bg-white border-l-4 ${isSold ? 'border-gray-400 opacity-75' : isOwner ? 'border-green-500' : 'border-blue-500'} shadow-sm rounded-r-lg mb-4 overflow-hidden`}>
        <div className="p-4" onClick={() => !isSold && setExpanded(!expanded)}>
          <div className="flex gap-4">
              {listing.image && (
                  <img src={listing.image} alt="Crop" className="w-20 h-20 object-cover rounded-lg bg-gray-100" />
              )}
              <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                          {listing.itemName}
                          {listing.saleMode === 'auction' && <Gavel size={16} className="text-amber-600" />}
                      </h3>
                      <p className="text-gray-500 font-medium text-xs mb-1">{listing.category}</p>
                      <p className="text-gray-600 font-medium text-sm">{listing.type} • {listing.quantity} {listing.unit}</p>
                    </div>
                    <div className="text-right">
                        <span className="font-bold text-lg text-green-700">₹{listing.price}</span>
                        <div className="text-xs text-gray-500">/{listing.unit}</div>
                        {listing.saleMode === 'auction' && <div className="text-xs text-amber-600 font-bold mt-1">Instant Price</div>}
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                      <MapPin size={10} /> {listing.address || 'No Location'}
                      <Clock size={10} className="ml-2" /> {listing.date}
                  </div>
              </div>
          </div>
          
          <div className="mt-3 flex items-center justify-between">
             
             {/* Highest Bid Indicator for Auction */}
             {listing.saleMode === 'auction' && !isSold && (
                 <span className="flex items-center gap-1 bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs font-bold">
                     <ArrowRight size={12} /> {t('highest_bid')}: ₹{highestBid || 0}
                 </span>
             )}

             {isSold && <span className="bg-gray-200 px-2 py-1 rounded text-xs font-bold">{t('status_sold')}</span>}
          </div>
          
        </div>

        {/* Expanded Actions */}
        {expanded && !isSold && (
          <div className="bg-gray-50 p-4 border-t border-gray-100">
            {isOwner ? (
                // FARMER ACTIONS
                <div className="space-y-3">
                    {listing.saleMode === 'fixed' ? (
                       <button onClick={() => handleAcceptBid(listing, listing.price)} className="w-full py-3 bg-gray-200 text-gray-700 rounded font-medium text-sm flex justify-center items-center gap-2">
                          <CheckCircle size={14} /> {t('mark_sold')}
                       </button>
                    ) : (
                       // Auction Mode for Farmer
                       <div className="space-y-2">
                           <h4 className="text-xs font-bold text-gray-500 uppercase">{t('current_bids')}</h4>
                           {listingBids.length === 0 ? <p className="text-sm italic text-gray-400">{t('no_bids')}</p> : (
                               listingBids.map(bid => (
                                   <div key={bid.id} className="flex justify-between items-center bg-white p-2 rounded border border-gray-200">
                                       <div>
                                           <span className="font-bold text-green-700">₹{bid.amount}</span>
                                           <span className="text-xs text-gray-500 ml-2">{bid.buyerName}</span>
                                       </div>
                                       <div className="flex gap-2">
                                           <a href={`tel:${bid.phone}`} className="p-2 bg-gray-100 rounded text-gray-600"><Smartphone size={14}/></a>
                                           <button onClick={() => handleAcceptBid(listing, bid.amount)} className="px-3 py-1 bg-green-600 text-white text-xs rounded font-bold">
                                               {t('accept_bid')}
                                           </button>
                                       </div>
                                   </div>
                               ))
                           )}
                       </div>
                    )}
                    {/* Delete Button for Farmer */}
                    <button onClick={() => handleDeleteListing(listing.id)} className="w-full py-2 text-red-600 bg-red-50 rounded border border-red-100 text-sm flex justify-center items-center gap-2">
                        <Trash2 size={14} /> {t('delete_listing')}
                    </button>
                </div>
            ) : (
               // BUYER ACTIONS
               listing.saleMode === 'fixed' ? (
                   <div className="flex gap-2">
                       <a href={`tel:${listing.phone}`} className="flex-1 text-center py-3 bg-white border border-gray-300 text-gray-700 rounded font-bold">
                           {t('contact_seller')}
                       </a>
                       <button onClick={() => setSelectedItemForBill(listing)} className="flex-1 bg-blue-600 text-white font-bold py-3 rounded">
                           {t('buy_now')}
                       </button>
                   </div>
               ) : (
                   // Auction Mode for Buyer
                   <div className="space-y-3">
                       <div className="flex gap-2">
                           <input 
                                type="number" 
                                placeholder={t('bid_amount')} 
                                className="flex-1 p-2 border rounded"
                                value={bidAmount}
                                onChange={(e) => setBidAmount(e.target.value)}
                           />
                           <button 
                                onClick={() => { handlePlaceBid(listing, bidAmount, profile?.phone); setBidAmount(''); }}
                                className="bg-amber-600 text-white px-4 rounded font-bold"
                           >
                               {t('place_bid')}
                           </button>
                       </div>
                       <p className="text-xs text-center text-gray-500">
                           {t('contact_seller')}: <a href={`tel:${listing.phone}`} className="underline">{listing.phone}</a>
                       </p>
                   </div>
               )
            )}
          </div>
        )}
      </div>
    );
  };

  const Dashboard = () => {
    // Sort logic for proximity
    const sortedListings = useMemo(() => {
        if (!listings.length) return [];
        if (role !== 'BUYER' || !profile?.pincode) return listings; // Farmers or no-profile buyers see default sort

        return [...listings].sort((a, b) => {
            // Priority 1: Exact Pincode Match
            if (a.pincode === profile.pincode && b.pincode !== profile.pincode) return -1;
            if (b.pincode === profile.pincode && a.pincode !== profile.pincode) return 1;

            // Priority 2: Same District
            const distA = a.district?.toLowerCase() === profile.district?.toLowerCase();
            const distB = b.district?.toLowerCase() === profile.district?.toLowerCase();
            if (distA && !distB) return -1;
            if (distB && !distA) return 1;

            // Priority 3: Same State
            const stateA = a.state?.toLowerCase() === profile.state?.toLowerCase();
            const stateB = b.state?.toLowerCase() === profile.state?.toLowerCase();
            if (stateA && !stateB) return -1;
            if (stateB && !stateA) return 1;

            return 0; // No location preference
        });
    }, [listings, profile, role]);

    let displayListings = role === 'FARMER' 
      ? listings.filter(l => l.farmerId === user.uid)
      : sortedListings.filter(l => l.status === 'active');
    
    if (searchQuery) {
        displayListings = displayListings.filter(l => 
            l.itemName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
            l.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            l.type?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }

    return (
      <div className="flex flex-col h-full bg-slate-100 pb-20">
        <header className={`${role === 'FARMER' ? 'bg-green-700' : 'bg-blue-700'} text-white p-4 shadow-md sticky top-0 z-10`}>
          <div className="flex justify-between items-center mb-2">
             <div>
                 <h1 className="font-bold text-lg">{role === 'FARMER' ? t('my_listings') : t('market_feed')}</h1>
                 {profile && <span className="text-xs opacity-90">{t('welcome')}, {profile.name}</span>}
             </div>
             <div className="flex gap-2">
                <button onClick={() => setView('PROFILE_SETUP')} className="p-2 bg-white/20 rounded-full"><User size={16}/></button>
                <button onClick={() => setView('LANDING')} className="text-xs bg-white/20 px-2 py-1 rounded h-fit self-center">{t('back')}</button>
             </div>
          </div>
          {role === 'BUYER' && (
             <div className="mt-3 relative">
                 <input type="text" className="w-full p-2 pl-9 rounded text-sm text-gray-800" placeholder={t('search_placeholder')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                 <Search className="absolute left-2 top-2 text-gray-400" size={16} />
             </div>
          )}
          {role === 'BUYER' && profile?.pincode && (
              <div className="mt-2 text-xs flex items-center gap-1 text-blue-100 bg-blue-800/30 p-1 rounded w-fit px-2">
                  <Navigation size={12} /> {t('closest_farmers')}: {profile.district || profile.pincode}
              </div>
          )}
        </header>

        <main className="p-4 flex-1 overflow-y-auto">
          {loading ? (
             <div className="flex justify-center items-center h-40 text-gray-500 gap-2"><Loader className="animate-spin"/> {t('loading')}</div>
          ) : (
            <>
              {displayListings.length === 0 && <div className="text-center mt-10 text-gray-400"><Leaf size={48} className="mx-auto mb-2 opacity-20" /><p>List is empty</p></div>}
              {displayListings.map(item => <ListingCard key={item.id} listing={item} isOwner={role === 'FARMER'} />)}
            </>
          )}
        </main>

        {role === 'FARMER' && (
          <button onClick={() => setView('ADD_ITEM')} className="fixed bottom-6 right-6 bg-green-700 text-white p-4 rounded-full shadow-lg border-4 border-green-50 active:scale-95 transition-transform">
            <Plus size={32} />
          </button>
        )}
      </div>
    );
  };

  if (authError) return <div className="h-screen flex flex-col items-center justify-center bg-red-50 text-red-800 p-6 text-center"><AlertTriangle size={48} /><h2 className="text-2xl font-bold">{t('auth_error')}</h2><p>{authError}</p></div>;
  if (!user) return <div className="h-screen flex items-center justify-center bg-green-50"><Loader className="animate-spin text-green-700" size={40}/></div>;

  return (
    <div className="font-sans h-screen max-w-md mx-auto bg-white shadow-xl overflow-hidden text-gray-900">
      {selectedItemForBill ? (
          <BillingView item={selectedItemForBill} onBack={() => setSelectedItemForBill(null)} />
      ) : (
          <>
            {view === 'LANDING' && <LandingPage />}
            {view === 'PROFILE_SETUP' && <ProfileSetup />}
            {view === 'DASHBOARD' && <Dashboard />}
            {view === 'ADD_ITEM' && <AddListingForm />}
          </>
      )}
    </div>
  );
}