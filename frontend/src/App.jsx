import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from './components/Layout';
import LandingPage from './components/LandingPage';
import FileManager from './pages/FileManager';
import Analytics from './pages/Analytics';
import OCRTools from './pages/OCRTools';
import { CheckCircle, XCircle } from 'lucide-react';
import './index.css'; // Global Styles

import { API_URL } from './config';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('files');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notification, setNotification] = useState(null); // { type: 'success'|'error', message: '' }
  
  // Data States
  const [files, setFiles] = useState([]);
  const [analytics, setAnalytics] = useState({ current_cost: "$0.00", total_storage: "0 MB" });
  const [chartData, setChartData] = useState([]);
  const [ocrResult, setOcrResult] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessingOCR, setIsProcessingOCR] = useState(false);

  // === 1. PERSISTENCE LOGIC (Fixes Refresh Issue) ===
  useEffect(() => {
    const storedUser = localStorage.getItem('cloudvault_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('cloudvault_user', JSON.stringify(userData)); // Save to storage
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('cloudvault_user'); // Clear storage
    setActiveTab('files');
  };

  // === 2. NOTIFICATION SYSTEM ===
  const showToast = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  // === 3. DATA FETCHING ===
  useEffect(() => {
    if (isAuthenticated && user?.user_id) {
      fetchFiles();
      fetchAnalyticsHistory();
    }
  }, [isAuthenticated, user]);

  const fetchFiles = async () => {
    try {
      const res = await axios.get(`${API_URL}/files/`, { headers: { 'x-user-id': user.user_id } });
      setFiles(res.data);
    } catch (err) { console.error(err); }
  };

 const fetchAnalyticsHistory = async () => {
    try {
      // 1. Fetch data from Backend
      const res = await axios.get(`${API_URL}/analytics/history`, { 
        headers: { 'x-user-id': user.user_id } 
      });

      // 2. Format with Date AND Time
      const formatted = res.data.map(item => {
        const dateObj = new Date(item.recorded_at);
        
        // Format: "Feb 12, 10:30 PM"
        const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const timeStr = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

        return {
          time: `${timeStr},${dateStr}`,
          cost: item.current_cost
        };
      });

      setChartData(formatted);
    } catch (err) { console.error(err); }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      await axios.post(`${API_URL}/files/upload/`, formData, { headers: { 'x-user-id': user.user_id } });
      showToast('success', 'File Uploaded Successfully');
      fetchFiles();
    } catch (err) { showToast('error', 'Upload Failed'); } 
    finally { setIsUploading(false); }
  };

  const handleRefreshAnalytics = async () => {
    try {
      const res = await axios.post(`${API_URL}/analytics/refresh`, {}, { headers: { 'x-user-id': user.user_id } });
      setAnalytics(res.data);
      fetchAnalyticsHistory();
      showToast('success', 'Analytics Updated');
    } catch (err) { console.error(err); }
  };

  const handleOcrUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsProcessingOCR(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
        const res = await axios.post(`${API_URL}/tools/extract-contact`, formData);
        setOcrResult(res.data);
        showToast('success', 'Scan Complete');
    } catch (err) { showToast('error', 'OCR Failed'); } 
    finally { setIsProcessingOCR(false); }
  };

  // Toggle Theme
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  if (!isAuthenticated) {
    return <LandingPage onLogin={handleLoginSuccess} isDarkMode={isDarkMode} toggleTheme={toggleTheme} />;
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'dark bg-slate-900' : 'bg-slate-50'}`}>
      <Layout 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={handleLogout} 
        user={user} // Pass real user data
        isDarkMode={isDarkMode} 
        toggleTheme={toggleTheme}
      >
        
        {/* GLOBAL TOAST NOTIFICATION */}
        {notification && (
          <div className={`fixed top-5 right-5 z-50 px-6 py-4 rounded-xl shadow-xl flex items-center gap-3 animate-slide-in ${
            notification.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
          }`}>
            {notification.type === 'success' ? <CheckCircle size={24}/> : <XCircle size={24}/>}
            <span className="font-bold">{notification.message}</span>
          </div>
        )}

        {activeTab === 'files' && (
          <FileManager 
            files={files} 
            onUpload={handleUpload} 
            isUploading={isUploading} 
            user={user} 
            notify={showToast} // Pass notification function down
            onDelete={(id) => setFiles(files.filter(f => f.id !== id))}
          />
        )}

        {activeTab === 'analytics' && (
          <Analytics 
            data={analytics} 
            chartData={chartData} 
            onRefresh={handleRefreshAnalytics} 
            isDarkMode={isDarkMode}
          />
        )}

        {activeTab === 'tools' && (
          <OCRTools 
            result={ocrResult} 
            onScan={handleOcrUpload} 
            isProcessing={isProcessingOCR} 
          />
        )}
      </Layout>
    </div>
  );
}

export default App;