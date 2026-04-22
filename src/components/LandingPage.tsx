import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Sparkles, Palette, Image as ImageIcon, Send, User, Eye, LogOut, Globe, Compass, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import TemplatePreview from './TemplatePreview';

// Import Nusantara Assets for Thumbnails
import palembangBg from '../assets/images/bg_palembang_luxury_1776836783740.png';
import javaneseBg from '../assets/images/bg_java_royal_1776836803429.png';
import balineseBg from '../assets/images/bg_bali_sacred_1776836819827.png';
import minangBg from '../assets/images/bg_minang_gold_1776836837840.png';
import sundaneseBg from '../assets/images/bg_sunda_serene_1776836854818.png';
import batakBg from '../assets/images/bg_batak_legacy_1776836873922.png';
import bugisBg from '../assets/images/bg_bugis_silk_1776836891766.png';

const LandingPage = () => {
  const [consumer, setConsumer] = useState<any>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    const savedConsumer = localStorage.getItem('consumer_user');
    if (savedConsumer) {
      setConsumer(JSON.parse(savedConsumer));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('consumer_user');
    setConsumer(null);
  };

  const renderTemplates = () => {
    const templates = [
      { id: 'palembang_glory', name: 'Palembang Glory', tag: 'Royal', desc: 'Kemegahan Sriwijaya dengan nuansa Aesan Gede dan Songket Emas.', image: palembangBg, category: 'adat' },
      { id: 'jawa_royal', name: 'Jawa Royal', tag: 'Heritage', desc: 'Kesakralan budaya Jawa dengan motif Sidomukti dan nuansa klasik.', image: javaneseBg, category: 'adat' },
      { id: 'bali_sacred', name: 'Bali Sacred', tag: 'Tropical', desc: 'Keindahan artistik Pulau Dewata dengan sentuhan Candi Bentar.', image: balineseBg, category: 'adat' },
      { id: 'minang_luxury', name: 'Minang Luxury', tag: 'Prestige', desc: 'Kemewahan adat Minangkabau dengan atap Rumah Gadang yang ikonik.', image: minangBg, category: 'adat' },
      { id: 'sunda_serene', name: 'Sunda Serene', tag: 'Ethnic', desc: 'Ketenangan alam Parahyangan dengan rangkaian bunga Melati.', image: sundaneseBg, category: 'adat' },
      { id: 'batak_legacy', name: 'Batak Legacy', tag: 'Bold', desc: 'Kekuatan warisan Batak dengan tenun Ulos dan ukiran Gorga.', image: batakBg, category: 'adat' },
      { id: 'bugis_silk', name: 'Bugis Silk', tag: 'Noble', desc: 'Keanggunan sutra Lontara dan corak Sarung Sabbe yang elegan.', image: bugisBg, category: 'adat' },
      // Elite Category
      { id: 'modern_minimal', name: 'Modern Minimal', tag: 'Elite', desc: 'Fokus pada esensi dengan tipografi bersih dan white space yang lapang.', image: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?q=80&w=2067&auto=format&fit=crop', category: 'elite' },
      { id: 'editorial_fashion', name: 'Editorial Fashion', tag: 'Elite', desc: 'Desain berani bergaya majalah fashion dengan komposisi teks yang artistik.', image: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop', category: 'elite' },
      { id: 'abstract_geometric', name: 'Abstract Geometric', tag: 'Elite', desc: 'Harmoni struktur geometri dan palet warna kontemporer yang sophisticated.', image: 'https://images.unsplash.com/photo-1550684376-efcbd6e3f031?q=80&w=2070&auto=format&fit=crop', category: 'elite' },
      { id: 'botanical_contemporary', name: 'Botanical', tag: 'Elite', desc: 'Sentuhan botani modern yang organik, puitis, dan dipadukan dengan tipografi monospaced.', image: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?q=80&w=2070&auto=format&fit=crop', category: 'elite' },
      { id: 'luxury_monochrome', name: 'Monochrome', tag: 'Elite', desc: 'Kemewahan abadi dalam spektrum hitam dan putih dengan kesan prestisius.', image: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?q=80&w=1974&auto=format&fit=crop', category: 'elite' },
      { id: 'experimental_typography', name: 'Experimental', tag: 'Elite', desc: 'Eksplorasi tipografi yang berani dan artistik sebagai elemen visual utama.', image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1964&auto=format&fit=crop', category: 'elite' },
      // Modern Category
      { id: 'modern_clean_white', name: 'Serene White', tag: 'Clean', desc: 'Kombinasi putih bersih dan tipografi Lora yang elegan untuk kesan abadi.', image: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=2070&auto=format&fit=crop', category: 'modern' },
      { id: 'modern_warm_beige', name: 'Warm Beige', tag: 'Warm', desc: 'Nuansa krem hangat yang ramah, menciptakan atmosfer perayaan yang intim.', image: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=800&auto=format&fit=crop', category: 'modern' },
      { id: 'modern_dusty_rose', name: 'Dusty Rose', tag: 'Romantic', desc: 'Palet merah muda pudar yang romantis, lembut, dan menenangkan.', image: 'https://images.unsplash.com/photo-1533616688419-b7a585564566?q=80&w=800&auto=format&fit=crop', category: 'modern' },
      { id: 'modern_classic_grey', name: 'Classic Grey', tag: 'Classic', desc: 'Kemurnian abu-abu klasik yang profesional dan canggih di setiap layarnya.', image: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop', category: 'modern' }
    ];

    const filteredTemplates = templates.filter(t => {
      if (selectedCategory === 'all') return true;
      return t.category === selectedCategory;
    });

    return filteredTemplates.map((t, i) => (
      <motion.div 
        key={t.id}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: i * 0.1 }}
        className="group relative"
      >
        <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-rose-500/10 group-hover:-translate-y-2">
          <img 
            src={t.image} 
            alt={t.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            referrerPolicy="no-referrer"
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
          
          <div className="absolute inset-0 p-8 flex flex-col justify-end">
            <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
              <span className="inline-block px-3 py-1 rounded-full bg-rose-500 text-white text-[10px] font-bold uppercase tracking-widest mb-3">
                {t.tag}
              </span>
              <h4 className="text-2xl font-serif text-white mb-2">{t.name}</h4>
              <p className="text-slate-300 text-xs mb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500 line-clamp-2">
                {t.desc}
              </p>
              
              <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                <button 
                  onClick={() => setPreviewId(t.id)}
                  className="flex-1 bg-white text-slate-900 py-3 rounded-xl text-xs font-bold hover:bg-rose-500 hover:text-white transition-colors flex items-center justify-center gap-2"
                >
                  <Eye size={14} /> Live Preview
                </button>
                <Link to="/login" className="p-3 bg-white/20 backdrop-blur-md rounded-xl text-white hover:bg-white/40 transition-colors">
                  <Heart size={18} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    ));
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Heart className="text-rose-500 fill-rose-500" size={24} />
          <span className="font-serif text-xl font-bold tracking-tight">DizaInvite</span>
        </div>
        <div className="flex items-center gap-4">
          {consumer ? (
            <div className="flex items-center gap-2">
              <Link 
                to="/create" 
                className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 rounded-full transition-all group"
              >
                <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 group-hover:bg-rose-500 group-hover:text-white transition-colors">
                  <User size={16} />
                </div>
                <span className="hidden md:block text-sm font-bold text-slate-700">{consumer.name}</span>
              </Link>
              <div className="w-px h-4 bg-slate-200 mx-1" />
              <button 
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                title="Keluar"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link 
              to="/login" 
              className="bg-rose-500 text-white px-6 py-2 rounded-full text-sm font-bold hover:bg-rose-600 transition-colors shadow-lg shadow-rose-500/20"
            >
              Mulai Sekarang
            </Link>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 md:pt-32 pb-12 md:pb-20 px-6 text-center max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-7xl font-serif leading-tight mb-8">
            Abadikan Momen Bahagia dengan <span className="text-rose-500 italic">Undangan Digital</span>
          </h1>
          <p className="text-slate-500 text-base md:text-lg mb-10 md:mb-12 max-w-2xl mx-auto px-4">
            Platform eksklusif untuk membuat undangan pernikahan elegan. Masuk dengan akun yang telah diberikan admin untuk mulai berkarya.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              to={consumer ? "/create" : "/login"} 
              className="w-full md:w-auto bg-rose-500 text-white px-10 py-4 rounded-2xl font-bold text-base md:text-lg hover:shadow-xl hover:shadow-rose-500/20 transition-all active:scale-95"
            >
              {consumer ? 'Lanjut ke Dashboard' : 'Login untuk Membuat'}
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-20 bg-slate-50 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10">
          {[
            { icon: <Palette className="text-rose-500" size={32} />, title: "Template Eksklusif", desc: "30+ template desain premium yang bisa disesuaikan dengan tema pernikahanmu." },
            { icon: <ImageIcon className="text-rose-500" size={32} />, title: "Galeri Foto", desc: "Upload foto-foto prewedding terbaikmu untuk mempercantik undangan." },
            { icon: <Send className="text-rose-500" size={32} />, title: "Bagikan Mudah", desc: "Dapatkan link unik dan bagikan ke tamu undangan melalui WhatsApp atau media sosial." }
          ].map((feature, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-10 rounded-[3rem] shadow-xl shadow-slate-200/50 border border-slate-100 hover:-translate-y-2 transition-all duration-500 group"
            >
              <div className="mb-8 transition-transform group-hover:scale-110 duration-500">{feature.icon}</div>
              <h3 className="text-2xl font-bold mb-5 text-slate-900">{feature.title}</h3>
              <p className="text-slate-500 text-base leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Templates Preview */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-rose-500 font-bold text-xs uppercase tracking-[0.3em] mb-4 block">Koleksi Desain</span>
            <h2 className="text-4xl md:text-5xl font-serif mb-6">Pilih Desain Favoritmu</h2>
            <p className="text-slate-500 max-w-xl mx-auto mb-12">Berbagai pilihan tema mulai dari botanical hingga modern minimalist yang dirancang khusus untuk hari spesialmu.</p>
          </motion.div>

          {/* Categories Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {[
              { id: 'all', name: 'Semua', icon: Check },
              { id: 'adat', name: 'Adat Nusantara', icon: Globe },
              { id: 'elite', name: 'Creative Elite', icon: Sparkles },
              { id: 'modern', name: 'Modern Style', icon: Compass }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                  selectedCategory === cat.id 
                    ? 'bg-rose-500 text-white shadow-lg shadow-rose-200' 
                    : 'bg-white text-slate-400 hover:bg-slate-50 hover:text-slate-600 border border-slate-100'
                }`}
              >
                <cat.icon size={12} />
                {cat.name}
              </button>
            ))}
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-10">
          {renderTemplates()}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-100 text-center text-slate-400 text-sm">
        <p className="mb-2">&copy; 2026 DizaInvite Digital Invitation. All rights reserved.</p>
        <Link to="/admin" className="text-[10px] uppercase tracking-widest hover:text-rose-500 transition-colors opacity-50 hover:opacity-100">
          Admin CMS
        </Link>
      </footer>

      <AnimatePresence>
        {previewId && (
          <TemplatePreview 
            templateId={previewId} 
            onClose={() => setPreviewId(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default LandingPage;
