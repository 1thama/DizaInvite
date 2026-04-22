import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, collection, query, where, onSnapshot, auth, signInAnonymously, updateDoc, doc } from '../firebase';
import { Heart, Lock, User, ChevronLeft, Eye, EyeOff } from 'lucide-react';
import { motion } from 'motion/react';

const ConsumerLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const q = query(
      collection(db, "consumers"), 
      where("email", "==", email), 
      where("password", "==", password)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      if (!snapshot.empty) {
        try {
          // Attempt anonymous sign-in and link UID for security rules if needed
          try {
            const userCredential = await signInAnonymously(auth);
            const authUid = userCredential.user.uid;
            
            // If the consumer document doesn't have this authUid or has a different one, update it
            // We can also just search by authUid in rules if we want, but for now let's ensure it's synced
            const consumerDoc = snapshot.docs[0];
            if (consumerDoc.data().authUid !== authUid) {
              await updateDoc(doc(db, "consumers", consumerDoc.id), { authUid });
            }
          } catch (authErr: any) {
            console.warn("Anonymous auth disabled/restricted, continuing with local session only:", authErr.message);
          }
          
          const consumerData = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
          localStorage.setItem('consumer_user', JSON.stringify(consumerData));
          navigate('/create');
        } catch (err) {
          console.error("Login process error:", err);
          setError('Terjadi kesalahan saat login');
        }
      } else {
        setError('Email atau password salah');
      }
      setLoading(false);
      unsubscribe();
    }, (err) => {
      console.error("Login error:", err);
      setError('Terjadi kesalahan sistem');
      setLoading(false);
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-2xl border border-slate-100"
      >
        <button onClick={() => navigate('/')} className="mb-8 flex items-center gap-2 text-slate-400 hover:text-rose-500 transition-colors text-xs font-bold">
          <ChevronLeft size={16} /> KEMBALI
        </button>

        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Heart size={32} className="text-rose-500 fill-rose-500" />
          </div>
          <h2 className="text-3xl font-serif text-slate-900 mb-2">Login Konsumen</h2>
          <p className="text-sm text-slate-500">Masuk untuk mulai membuat undangan digital Anda</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">Email / Username</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="text" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Masukkan email Anda"
                className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-rose-500 transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-rose-500 transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                title={showPassword ? "Sembunyikan password" : "Tampilkan password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-500 font-bold text-center bg-red-50 py-2 rounded-lg">{error}</p>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-rose-500 text-white rounded-2xl font-bold tracking-widest text-xs hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/20 disabled:opacity-50"
          >
            {loading ? 'MEMPROSES...' : 'MASUK SEKARANG'}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-slate-50 text-center">
          <p className="text-[10px] text-slate-400 uppercase tracking-widest leading-relaxed">
            Belum punya akun? <br />
            <span className="text-slate-900 font-bold">Hubungi admin untuk pendaftaran</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default ConsumerLogin;
