import React, { useState } from 'react';
import { Shield, Cloud, Zap, Lock, ChevronRight, Moon, Sun, AlertCircle } from 'lucide-react';

import { API_URL } from '../config';

const LandingPage = ({ onLogin, isDarkMode, toggleTheme }) => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('email');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'error'|'info', text: '' }

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`${API_URL}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (res.ok) {
        setStep('otp');
        setMessage({ type: 'info', text: 'Code sent! Check backend terminal.' });
      }
    } catch (err) { setMessage({ type: 'error', text: 'Server connection failed.' }); }
    setLoading(false);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      const data = await res.json();
      if (res.ok) {
        onLogin(data);
      } else {
        setMessage({ type: 'error', text: 'Invalid Code. Please try again.' });
      }
    } catch (err) { setMessage({ type: 'error', text: 'Verification failed.' }); }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 font-bold text-xl text-brand-500">
          <Cloud className="h-8 w-8 text-blue-500" />
          <span>CloudVault</span>
        </div>
        <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-white/10 transition">
          {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
        </button>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10 grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-8">
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
            Secure Cloud Storage <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400">For The Future.</span>
          </h1>
          <p className="text-lg opacity-80">Experience next-gen file management. AI-powered OCR, real-time cost analytics, and bank-grade encryption.</p>
        </div>

        {/* LOGIN CARD */}
        <div className={`p-8 rounded-2xl shadow-2xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
          <h2 className="text-2xl font-bold mb-2">Get Started</h2>
          
          {/* IN-UI NOTIFICATION AREA */}
          {message && (
            <div className={`p-3 rounded-lg text-sm flex items-center gap-2 mb-4 ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
              <AlertCircle size={16} /> {message.text}
            </div>
          )}

          {step === 'email' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email Address</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-300'}`}
                  placeholder="name@example.com" />
              </div>
              <button disabled={loading} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition flex justify-center items-center gap-2">
                {loading ? 'Sending...' : <>Send Code <ChevronRight size={18}/></>}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4 animate-fade-in">
               <div>
                <label className="block text-sm font-medium mb-1">Enter Code</label>
                <input type="text" required value={otp} onChange={(e) => setOtp(e.target.value)}
                  className={`w-full p-3 text-center text-2xl tracking-widest rounded-lg border ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-300'}`}
                  placeholder="XXXX" />
              </div>
              <button className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition">Verify & Login</button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
};

export default LandingPage;