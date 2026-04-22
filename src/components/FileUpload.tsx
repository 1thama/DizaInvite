import React, { useState, useRef } from 'react';
import { storage, ref, uploadBytesResumable, getDownloadURL, db, collection, addDoc, serverTimestamp, auth, signInAnonymously } from '../firebase';
import { Upload, X, Check, Loader2, Link as LinkIcon, Copy, Music, Image as ImageIcon, FileAudio } from 'lucide-react';
import { motion } from 'motion/react';

interface FileUploadProps {
  value: string;
  onChange: (url: string) => void;
  label: string;
  folder?: string;
  accept?: string;
  fileType?: 'image' | 'audio';
  aspectRatio?: string;
  className?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ 
  value, 
  onChange, 
  label, 
  folder = 'invitations',
  accept = 'image/*',
  fileType = 'image',
  aspectRatio = 'aspect-square',
  className = ""
}) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check Firebase Auth status
    if (!auth.currentUser) {
      console.warn('[FileUpload] No authenticated Firebase user found. Upload may fail if rules are strict.');
      // Attempt a quick sign-in if possible, but don't block
      try {
        await signInAnonymously(auth);
      } catch (err: any) {
        console.error('[FileUpload] Failed to auto sign-in:', err);
        setError('Fitur upload memerlukan autentikasi. Mohon pastikan Anonymous Auth diaktifkan di Firebase Console.');
        return;
      }
    }

    // Validate file type
    if (fileType === 'image' && !file.type.startsWith('image/')) {
      setError('Hanya file gambar yang diperbolehkan');
      return;
    }
    if (fileType === 'audio' && !file.type.startsWith('audio/')) {
      setError('Hanya file audio yang diperbolehkan');
      return;
    }

    // Validate file size (max 10MB for audio, 5MB for image)
    const maxSize = fileType === 'audio' ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError(`Ukuran file maksimal ${fileType === 'audio' ? '10MB' : '5MB'}`);
      return;
    }

    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      const fileName = `${Date.now()}-${file.name}`;
      const path = `${folder}/${fileName}`;
      const storageRef = ref(storage, path);
      
      console.log(`[FileUpload] Starting upload to ${path}...`);
      
      // Use uploadBytes for better reliability in some environments, 
      // but we'll simulate progress if it takes time or just show as 100%
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on('state_changed', 
        (snapshot) => {
          const p = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`[FileUpload] Progress: ${p.toFixed(2)}% (${snapshot.state})`);
          setProgress(p);
        }, 
        (err) => {
          console.error('[FileUpload] Upload Task error:', err);
          // If resumable fails, show a more descriptive error
          if (err.code === 'storage/unauthorized') {
            setError('Maaf, Anda tidak memiliki izin untuk mengunggah. Mohon cek konfigurasi Firebase Storage Anda.');
          } else if (err.code === 'storage/retry-limit-exceeded') {
            setError('Koneksi terputus. Mohon coba lagi dengan koneksi yang lebih stabil.');
          } else {
            setError(`Upload gagal: ${err.message}`);
          }
          setUploading(false);
        }, 
        async () => {
          try {
            console.log('[FileUpload] Task completed, fetching URL...');
            const url = await getDownloadURL(uploadTask.snapshot.ref);
            console.log(`[FileUpload] URL obtained: ${url}`);
            
            // Record in media collection for tracking
            const userId = auth.currentUser?.uid || JSON.parse(localStorage.getItem('consumer_user') || '{}').id || 'anonymous';
            
            await addDoc(collection(db, 'media'), {
              userId: userId,
              url,
              type: fileType,
              fileName: file.name,
              fileSize: file.size,
              storagePath: path,
              createdAt: serverTimestamp()
            });

            onChange(url);
            setUploading(false);
            setProgress(0);
          } catch (err: any) {
            console.error('[FileUpload] Post-upload error:', err);
            setError(`Gagal memproses file: ${err.message}`);
            setUploading(false);
          }
        }
      );
    } catch (err: any) {
      console.error('[FileUpload] Catch error:', err);
      setError(`Terjadi kesalahan: ${err.message}`);
      setUploading(false);
    }
  };

  const removeFile = () => {
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const copyToClipboard = () => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold">{label}</label>
      
      <div className="relative">
        {value ? (
          <div className="space-y-3">
            <div className={`relative group w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm transition-all ${fileType === 'image' ? aspectRatio : 'p-4 bg-slate-50'}`}>
              {fileType === 'image' ? (
                <img 
                  src={value} 
                  alt="Uploaded" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-rose-500 shadow-sm">
                    <Music size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">Audio File Loaded</p>
                    <audio src={value} controls className="h-8 mt-2 w-full" />
                  </div>
                </div>
              )}
              
              <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 bg-white rounded-full text-slate-900 hover:scale-110 active:scale-95 transition-all"
                  title="Ganti File"
                >
                  <Upload size={18} />
                </button>
                <button 
                  type="button"
                  onClick={removeFile}
                  className="p-3 bg-white rounded-full text-red-500 hover:scale-110 active:scale-95 transition-all"
                  title="Hapus File"
                >
                  <X size={18} />
                </button>
              </div>
              
              <div className="absolute top-3 right-3 bg-green-500 text-white p-1.5 rounded-full shadow-lg">
                <Check size={12} />
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-100 rounded-xl">
              <LinkIcon size={12} className="text-slate-400 shrink-0" />
              <p className="text-[9px] text-slate-400 truncate flex-1 font-mono tracking-tight">{value}</p>
              <button 
                type="button"
                onClick={copyToClipboard}
                className={`p-2 rounded-lg transition-all ${copied ? 'bg-green-500 text-white' : 'bg-white text-slate-400 hover:text-slate-600 border border-slate-200'}`}
                title="Salin URL"
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className={`w-full rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all relative overflow-hidden ${
              fileType === 'image' ? aspectRatio : 'py-10'
            } ${
              uploading ? 'bg-slate-50 border-slate-100' : 'bg-slate-50 border-slate-200 hover:border-rose-300 hover:bg-rose-50/20'
            }`}
          >
            {uploading ? (
              <>
                <div className="relative z-10 flex flex-col items-center gap-3">
                  <div className="relative">
                    <Loader2 className="animate-spin text-rose-500" size={32} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-1 h-1 bg-rose-500 rounded-full" />
                    </div>
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Uploading {Math.round(progress)}%</p>
                </div>
                <div className="absolute bottom-0 left-0 h-1.5 bg-rose-100 w-full" />
                <div 
                  className="absolute bottom-0 left-0 h-1.5 bg-rose-500 transition-all duration-300" 
                  style={{ width: `${progress}%` }}
                />
              </>
            ) : (
              <>
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-slate-300 transition-transform group-hover:scale-110">
                  {fileType === 'image' ? <ImageIcon size={24} /> : <FileAudio size={24} />}
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {fileType === 'image' ? 'Upload Photo' : 'Upload Audio'}
                  </p>
                  <p className="text-[9px] text-slate-300 mt-1 uppercase tracking-tighter">Max 5MB</p>
                </div>
              </>
            )}
          </button>
        )}
        
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden" 
          accept={accept}
        />
      </div>
      
      {error && (
        <motion.p 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[10px] text-red-500 font-bold bg-red-50 p-2 rounded-lg border border-red-100"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};

export default FileUpload;
