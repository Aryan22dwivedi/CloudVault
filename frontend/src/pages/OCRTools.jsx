import React, { useState, useRef, useEffect } from "react";
import { Camera, Upload, Type, Trash2, X, Phone, Mail, Globe, ScanLine, MessageCircle, MessageSquare, ExternalLink, Cpu, Layers, Zap } from "lucide-react";
import { API_URL } from '../config'; 

const TOOL_API = `${API_URL}/tools`; 

export default function OCRTools() {
  const [mode, setMode] = useState("idle");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [ocrMode, setOcrMode] = useState("auto");

  const [imageSrc, setImageSrc] = useState(null);
  const [extractedData, setExtractedData] = useState({ emails: [], phones: [], urls: [], method: "" });
  
  // Manual Input State
  const [manualInput, setManualInput] = useState({ emails: "", phones: "", urls: "" });

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => { return () => stopCamera(); }, []);

  // --- ACTIONS ---
  const openWhatsApp = (phone) => { window.open(`https://wa.me/${phone.replace(/\D/g, "")}`, "_blank"); };
  const openSMS = (phone) => { window.location.href = `sms:${phone.replace(/\s+/g, "")}`; };
  const openCall = (phone) => { window.location.href = `tel:${phone.replace(/\s+/g, "")}`; };
  const openMailApp = (email) => { window.location.href = `mailto:${email}`; };
  const openGmail = (email) => { window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${email}`, "_blank"); };
  const openSmartUrl = (url) => {
    let target = url.trim();
    if (!/^https?:\/\//i.test(target)) target = `https://${target}`;
    window.open(target, "_blank");
  };

  // --- CAMERA & UPLOAD ---
  const startCamera = async () => {
    try {
      setMode("camera");
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) { setErrorMsg("Camera access denied."); setMode("idle"); }
  };
  const stopCamera = () => {
    if (streamRef.current) { streamRef.current.getTracks().forEach((t) => t.stop()); streamRef.current = null; }
  };
  const handleCapture = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d").drawImage(videoRef.current, 0, 0);
    setImageSrc(canvas.toDataURL("image/png"));
    setMode("preview");
    stopCamera();
  };
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageSrc(URL.createObjectURL(file));
    setMode("preview");
    e.target.value = ""; 
  };

  // --- EXTRACT ---
  const handleExtract = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const blob = await (await fetch(imageSrc)).blob();
      const formData = new FormData();
      formData.append("file", blob, "scan.png");
      formData.append("ocr_mode", ocrMode);

      const res = await fetch(`${TOOL_API}/scan`, { method: "POST", body: formData });
      const json = await res.json();

      if (!res.ok) throw new Error(json.error || "Scan failed");
      
      setExtractedData({
        emails: json.emails || [],
        phones: json.phones || [],
        urls: json.urls || [],
        method: json.method || "Unknown"
      });
      setMode("results");
    } catch (err) { setErrorMsg(err.message); } 
    finally { setLoading(false); }
  };

  // --- MANUAL SUBMIT (Uses Backend Regex) ---
  const handleManualSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${TOOL_API}/manual`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(manualInput)
      });
      const json = await res.json();

      setExtractedData({
        emails: json.emails || [],
        phones: json.phones || [],
        urls: json.urls || [],
        method: json.method || "Manual Entry"
      });
      setMode("results");
    } catch (err) {
      setErrorMsg("Manual processing failed");
    } finally {
      setLoading(false);
    }
  };
  
  const handleReset = () => {
    stopCamera(); setImageSrc(null); setExtractedData({ emails: [], phones: [], urls: [], method: "" });
    setManualInput({ emails: "", phones: "", urls: "" }); setMode("idle"); setErrorMsg("");
  };

  const ActionButton = ({ icon: Icon, label, onClick, color = "brand" }) => (
    <button onClick={onClick} className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed transition-all duration-200 ${color === 'brand' ? 'border-brand-200 bg-brand-50 text-brand-600 hover:bg-brand-100 hover:border-brand-400 dark:bg-slate-800 dark:border-slate-600 dark:text-brand-400 dark:hover:bg-slate-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300'}`}>
      <Icon size={32} className="mb-2" /> <span className="font-semibold">{label}</span>
    </button>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Smart OCR Scanner</h2>
        <p className="text-slate-500 dark:text-slate-400">Extract contact info from cameras, images, or text instantly.</p>
      </div>

      {errorMsg && <div className="bg-red-100 text-red-700 p-3 rounded-lg flex items-center gap-2"><X size={18} /> {errorMsg}</div>}

      {/* --- MODE: IDLE --- */}
      {mode === "idle" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ActionButton icon={Camera} label="Start Camera" onClick={startCamera} />
          <ActionButton icon={Upload} label="Upload Image" onClick={() => fileInputRef.current.click()} />
          <ActionButton icon={Type} label="Manual Entry" onClick={() => setMode("manual")} color="slate" />
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
        </div>
      )}

      {/* --- MODE: CAMERA --- */}
      {mode === "camera" && (
        <div className="bg-black rounded-2xl overflow-hidden relative shadow-lg">
          <video ref={videoRef} autoPlay playsInline className="w-full h-[400px] object-cover" />
          <div className="absolute bottom-6 left-0 w-full flex justify-center gap-4">
            <button onClick={handleCapture} className="bg-white p-4 rounded-full shadow-xl hover:scale-105 transition"><div className="w-4 h-4 bg-red-500 rounded-full border-2 border-white ring-2 ring-red-500"></div></button>
            <button onClick={handleReset} className="bg-slate-800/80 text-white px-4 py-2 rounded-lg backdrop-blur-sm">Cancel</button>
          </div>
        </div>
      )}

      {/* --- MODE: PREVIEW --- */}
      {mode === "preview" && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="relative h-64 md:h-80 bg-slate-100 dark:bg-slate-900 rounded-xl overflow-hidden mb-6 flex items-center justify-center">
            <img src={imageSrc} alt="Preview" className="max-h-full max-w-full object-contain" />
          </div>

          <div className="flex justify-center mb-6">
            <div className="bg-slate-100 dark:bg-slate-900 p-1 rounded-xl flex shadow-inner">
                <button onClick={() => setOcrMode("auto")} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition ${ocrMode === "auto" ? "bg-white dark:bg-slate-700 text-brand-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}>
                    <Zap size={16}/> Auto
                </button>
                <button onClick={() => setOcrMode("gemini")} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition ${ocrMode === "gemini" ? "bg-white dark:bg-slate-700 text-purple-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}>
                    <Cpu size={16}/> Gemini AI
                </button>
                <button onClick={() => setOcrMode("tesseract")} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition ${ocrMode === "tesseract" ? "bg-white dark:bg-slate-700 text-orange-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}>
                    <Layers size={16}/> Tesseract
                </button>
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <button onClick={handleExtract} disabled={loading} className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-xl font-bold transition shadow-lg shadow-brand-500/20 disabled:opacity-50">
              {loading ? <ScanLine className="animate-spin" /> : <ScanLine />} {loading ? "Scanning..." : "Run Extraction"}
            </button>
            <button onClick={handleReset} className="px-6 py-3 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition">Retake</button>
          </div>
        </div>
      )}

      {/* --- MODE: MANUAL (WAS MISSING BEFORE!) --- */}
      {mode === "manual" && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 animate-fade-in">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Manual Entry</h3>
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Emails</label>
              <textarea placeholder="Paste emails here..." className="w-full p-3 border rounded-lg dark:bg-slate-900 dark:border-slate-600 text-sm focus:ring-2 focus:ring-blue-500 outline-none" rows={6} value={manualInput.emails} onChange={e => setManualInput({...manualInput, emails: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Phones</label>
              <textarea placeholder="Paste phones here..." className="w-full p-3 border rounded-lg dark:bg-slate-900 dark:border-slate-600 text-sm focus:ring-2 focus:ring-green-500 outline-none" rows={6} value={manualInput.phones} onChange={e => setManualInput({...manualInput, phones: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Links</label>
              <textarea placeholder="Paste URLs here..." className="w-full p-3 border rounded-lg dark:bg-slate-900 dark:border-slate-600 text-sm focus:ring-2 focus:ring-purple-500 outline-none" rows={6} value={manualInput.urls} onChange={e => setManualInput({...manualInput, urls: e.target.value})} />
            </div>
          </div>
          <div className="flex justify-end gap-3">
             <button onClick={handleReset} className="px-4 py-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition">Cancel</button>
             <button onClick={handleManualSubmit} disabled={loading} className="bg-brand-600 text-white px-6 py-2 rounded-lg hover:bg-brand-700 font-bold shadow-lg shadow-brand-500/20">
               {loading ? "Processing..." : "Process Data"}
             </button>
          </div>
        </div>
      )}

      {/* --- MODE: RESULTS --- */}
      {(mode === "results" || (mode === "preview" && extractedData.emails.length > 0)) && (
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
            <div className="md:col-span-3 flex justify-center mb-4">
                <span className={`px-4 py-1 rounded-full text-xs font-bold border flex items-center gap-2 ${extractedData.method.includes("Gemini") ? "bg-purple-100 text-purple-700 border-purple-200" : "bg-orange-100 text-orange-700 border-orange-200"}`}>
                   {extractedData.method.includes("Gemini") ? <Cpu size={14}/> : <Layers size={14}/>} 
                   Processed by: {extractedData.method}
                </span>
            </div>

            {/* PHONE RESULTS */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
              <h3 className="flex items-center gap-2 font-bold text-slate-700 dark:text-white mb-4"><Phone size={18} className="text-green-500"/> Phones</h3>
              {extractedData.phones.length > 0 ? extractedData.phones.map((p, i) => (
                 <div key={i} className="flex flex-col gap-2 bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg mb-2">
                    <span className="font-mono text-sm font-semibold text-slate-800 dark:text-slate-200">{p}</span>
                    <div className="flex gap-2 mt-1">
                        <button onClick={() => openCall(p)} className="flex-1 flex items-center justify-center gap-1 bg-green-100 text-green-700 py-1.5 rounded hover:bg-green-200 text-xs font-bold transition"><Phone size={12} /> Call</button>
                        <button onClick={() => openSMS(p)} className="flex-1 flex items-center justify-center gap-1 bg-blue-100 text-blue-700 py-1.5 rounded hover:bg-blue-200 text-xs font-bold transition"><MessageSquare size={12} /> SMS</button>
                        <button onClick={() => openWhatsApp(p)} className="flex-1 flex items-center justify-center gap-1 bg-green-50 text-green-600 border border-green-200 py-1.5 rounded hover:bg-green-100 text-xs font-bold transition"><MessageCircle size={12} /> WA</button>
                    </div>
                 </div>
              )) : <p className="text-sm text-slate-400 italic">No phones found</p>}
            </div>

            {/* EMAIL RESULTS */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
              <h3 className="flex items-center gap-2 font-bold text-slate-700 dark:text-white mb-4"><Mail size={18} className="text-blue-500"/> Emails</h3>
              {extractedData.emails.length > 0 ? extractedData.emails.map((e, i) => (
                 <div key={i} className="flex flex-col gap-2 bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg mb-2 text-sm">
                    <span className="truncate font-medium w-full">{e}</span>
                    <div className="flex gap-2">
                        <button onClick={() => openMailApp(e)} className="flex-1 bg-blue-50 text-blue-600 py-1.5 rounded hover:bg-blue-100 font-bold text-xs flex items-center justify-center gap-1"><Mail size={12}/> App</button>
                        <button onClick={() => openGmail(e)} className="flex-1 bg-red-50 text-red-600 py-1.5 rounded hover:bg-red-100 font-bold text-xs flex items-center justify-center gap-1"><Mail size={12}/> Gmail</button>
                    </div>
                 </div>
              )) : <p className="text-sm text-slate-400 italic">No emails found</p>}
            </div>

            {/* URL RESULTS */}
             <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
              <h3 className="flex items-center gap-2 font-bold text-slate-700 dark:text-white mb-4"><Globe size={18} className="text-purple-500"/> Links</h3>
              {extractedData.urls.length > 0 ? extractedData.urls.map((u, i) => (
                 <div key={i} className="flex justify-between items-center bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg mb-2 text-sm">
                    <span className="truncate w-32 font-medium">{u}</span>
                    <button onClick={() => openSmartUrl(u)} className="bg-purple-50 text-purple-600 px-3 py-1.5 rounded hover:bg-purple-100 font-bold text-xs flex items-center gap-1"><ExternalLink size={12}/> Open</button>
                 </div>
              )) : <p className="text-sm text-slate-400 italic">No links found</p>}
            </div>

            <div className="md:col-span-3 flex justify-center mt-4">
               <button onClick={handleReset} className="flex items-center gap-2 text-slate-500 hover:text-red-500 transition px-6 py-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                  <Trash2 size={16}/> Clear Results & Start Over
               </button>
            </div>
         </div>
      )}
    </div>
  );
}