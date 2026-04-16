import React, { useState } from 'react';
import axios from 'axios';
import { FileText, Download, Trash2, Share2 } from 'lucide-react';

import { API_URL } from '../config'; 

const FileCard = ({ file, onDelete, user, notify }) => {
  const [expiryTime, setExpiryTime] = useState(3600);

  const handleDelete = async () => {
    // Replaced window.confirm with a non-blocking check or just proceed for demo speed
    // For a cleaner look, you can skip the confirm or build a custom modal. 
    // For now, let's just make it seamless.
    try {
      await axios.delete(`${API_URL}/files/${file.id}`, {
        headers: { 'x-user-id': user.user_id }
      });
      onDelete(file.id);
      notify('success', 'File deleted permanently'); // <--- FIXED
    } catch (err) {
      notify('error', 'Could not delete file'); // <--- FIXED
    }
  };

  const handleDownload = async () => {
    try {
      const res = await axios.get(`${API_URL}/files/${file.id}/download`, {
        headers: { 'x-user-id': user.user_id }
      });
      const link = document.createElement('a');
      link.href = res.data.download_url;
      link.setAttribute('download', file.filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      notify('success', 'Download started'); // <--- FIXED
    } catch (err) {
      notify('error', 'Download failed'); // <--- FIXED
    }
  };

  const handleShare = async () => {
    try {
      const res = await axios.post(`${API_URL}/files/${file.id}/share`, 
        { expiry_seconds: parseInt(expiryTime) },
        { headers: { 'x-user-id': user.user_id } }
      );
      await navigator.clipboard.writeText(res.data.share_link);
      notify('success', 'Link copied to clipboard'); // <--- FIXED
    } catch (err) {
      notify('error', 'Could not generate link'); // <--- FIXED
    }
  };

  return (
    <div className="bg-white dark:bg-slate-700 p-5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-600 hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-brand-50 dark:bg-slate-600 rounded-lg text-brand-600 dark:text-brand-400">
          <FileText size={24} />
        </div>
        <span className="text-xs font-mono text-slate-400">{file.size_mb} MB</span>
      </div>
      <h3 className="font-semibold text-slate-700 dark:text-white truncate mb-1">{file.filename}</h3>
      <p className="text-xs text-slate-400 mb-4">{new Date(file.uploaded_at).toLocaleDateString()}</p>
      
      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-600">
          <button onClick={handleDownload} className="flex-1 flex justify-center items-center gap-2 py-2 bg-slate-100 dark:bg-slate-600 text-slate-600 dark:text-slate-200 rounded-lg text-xs hover:bg-brand-500 hover:text-white transition">
            <Download size={14} /> Download
          </button>
          <button onClick={handleDelete} className="p-2 text-slate-400 hover:text-red-500 transition rounded-lg"><Trash2 size={16}/></button>
          <button onClick={handleShare} className="p-2 text-slate-400 hover:text-blue-500 transition rounded-lg"><Share2 size={16}/></button>
      </div>
      
      <div className="mt-3">
        <select value={expiryTime} onChange={(e) => setExpiryTime(e.target.value)} className="w-full text-xs p-1 bg-transparent text-slate-400 border-none outline-none cursor-pointer">
            <option value="300">Expires: 5 minutes</option>
            <option value="1800">Expires: 30 minutes</option>
            <option value="3600">Expires: 1 Hour</option>
            <option value="86400">Expires: 1 Day</option>
            <option value="604800">Expires: 7 Days</option>
            {/* Note on Limits: MinIO and AWS S3 usually have a maximum limit of 7 days (604800 seconds) for presigned URLs. */}
        </select>
      </div>
    </div>
  );
};

export default FileCard;