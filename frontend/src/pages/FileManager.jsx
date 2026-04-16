import React from 'react';
import { Upload, RefreshCw } from 'lucide-react';
import FileCard from '../components/FileCard';

export default function FileManager({ files, onUpload, isUploading, onDelete, user, notify }) {
  return (
    <div>
      {/* Upload Area: Stacks vertically on mobile */}
      <div className="bg-white dark:bg-slate-700 p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-600 mb-8 transition-colors">
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-500 rounded-xl p-6 md:p-10 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer relative">
          <input type="file" onChange={onUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
          
          {isUploading ? (
            <div className="animate-pulse flex flex-col items-center text-brand-500">
              <RefreshCw className="h-10 w-10 animate-spin mb-4" />
              <p className="font-bold">Uploading...</p>
            </div>
          ) : (
            <>
              <Upload className="h-10 w-10 text-brand-500 mb-4" />
              <p className="text-slate-600 dark:text-slate-300 font-medium text-center">Click to Upload Files</p>
            </>
          )}
        </div>
      </div>

      {/* Grid: 1 col on Mobile, 2 on Tablet, 3 on Desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {files.map((file) => (
          <FileCard key={file.id} file={file} onDelete={onDelete} user={user} notify={notify} />
        ))}
      </div>
    </div>
  );
}