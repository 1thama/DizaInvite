import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth, collection, addDoc, serverTimestamp, handleFirestoreError, OperationType, query, where, onSnapshot, deleteDoc, doc, updateDoc, onAuthStateChanged, signInAnonymously } from '../firebase';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Check, Palette, User, Calendar, Image as ImageIcon, Music, LogOut, Edit2, Trash2, ExternalLink, Eye, EyeOff, Upload, Users, CreditCard, Plus, Trash, User2, Lock, X, Globe, Heart, Star, ArrowUp, ArrowDown, Compass, Sparkles, Send, RefreshCw } from 'lucide-react';
import FileUpload from './FileUpload';
import GuestManager from './GuestManager';

// Import Generated Assets for Thumbnails
import palembangThumb from '../assets/images/bg_palembang_luxury_1776836783740.png';
import javaneseThumb from '../assets/images/bg_java_royal_1776836803429.png';
import balineseThumb from '../assets/images/bg_bali_sacred_1776836819827.png';
import minangThumb from '../assets/images/bg_minang_gold_1776836837840.png';
import sundaneseThumb from '../assets/images/bg_sunda_serene_1776836854818.png';
import batakThumb from '../assets/images/bg_batak_legacy_1776836873922.png';
import bugisThumb from '../assets/images/bg_bugis_silk_1776836891766.png';

const TEMPLATES = [
  { 
    id: 'palembang_glory', 
    name: 'Palembang Glory', 
    category: 'adat', 
    image: palembangThumb,
    description: 'Kemegahan Sriwijaya dengan nuansa Aesan Gede dan Songket Emas.'
  },
  { 
    id: 'jawa_royal', 
    name: 'Jawa Royal', 
    category: 'adat', 
    image: javaneseThumb,
    description: 'Kesakralan budaya Jawa dengan motif Sidomukti dan nuansa klasik.'
  },
  { 
    id: 'bali_sacred', 
    name: 'Bali Sacred', 
    category: 'adat', 
    image: balineseThumb,
    description: 'Keindahan artistik Pulau Dewata dengan sentuhan Candi Bentar.'
  },
  { 
    id: 'minang_luxury', 
    name: 'Minang Luxury', 
    category: 'adat', 
    image: minangThumb,
    description: 'Kemewahan adat Minangkabau dengan atap Rumah Gadang yang ikonik.'
  },
  { 
    id: 'sunda_serene', 
    name: 'Sunda Serene', 
    category: 'adat', 
    image: sundaneseThumb,
    description: 'Ketenangan alam Parahyangan dengan rangkaian bunga Melati.'
  },
  { 
    id: 'batak_legacy', 
    name: 'Batak Legacy', 
    category: 'adat', 
    image: batakThumb,
    description: 'Kekuatan warisan Batak dengan tenun Ulos dan ukiran Gorga.'
  },
  { 
    id: 'bugis_silk', 
    name: 'Bugis Silk', 
    category: 'adat', 
    image: bugisThumb,
    description: 'Keanggunan sutra Lontara dan corak Sarung Sabbe yang elegan.'
  },
  { 
    id: 'modern_minimal', 
    name: 'Modern Minimal', 
    category: 'elite', 
    image: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?q=80&w=2067&auto=format&fit=crop',
    description: 'Fokus pada esensi dengan tipografi bersih dan white space yang lapang.'
  },
  { 
    id: 'editorial_fashion', 
    name: 'Editorial Fashion', 
    category: 'elite', 
    image: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop',
    description: 'Desain berani bergaya majalah fashion dengan komposisi teks yang artistik.'
  },
  { 
    id: 'abstract_geometric', 
    name: 'Abstract Geometric', 
    category: 'elite', 
    image: 'https://images.unsplash.com/photo-1550684376-efcbd6e3f031?q=80&w=2070&auto=format&fit=crop',
    description: 'Harmoni struktur geometri dan palet warna kontemporer yang sophisticated.'
  },
  { 
    id: 'botanical_contemporary', 
    name: 'Botanical Contemporary', 
    category: 'elite', 
    image: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?q=80&w=2070&auto=format&fit=crop',
    description: 'Sentuhan botani modern yang organik, puitis, dan dipadukan dengan tipografi monospaced.'
  },
  { 
    id: 'luxury_monochrome', 
    name: 'Luxury Monochrome', 
    category: 'elite', 
    image: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?q=80&w=1974&auto=format&fit=crop',
    description: 'Kemewahan abadi dalam spektrum hitam dan putih dengan kesan prestisius.'
  },
  { 
    id: 'experimental_typography', 
    name: 'Experimental Type', 
    category: 'elite', 
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1964&auto=format&fit=crop',
    description: 'Eksplorasi tipografi yang berani dan artistik sebagai elemen visual utama.'
  },
  { 
    id: 'modern_clean_white', 
    name: 'Serene White', 
    category: 'modern', 
    image: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=2070&auto=format&fit=crop',
    description: 'Kombinasi putih bersih dan tipografi Lora yang elegan untuk kesan abadi.'
  },
  { 
    id: 'modern_warm_beige', 
    name: 'Warm Beige', 
    category: 'modern', 
    image: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=800&auto=format&fit=crop',
    description: 'Nuansa krem hangat yang ramah, menciptakan atmosfer perayaan yang intim.'
  },
  { 
    id: 'modern_dusty_rose', 
    name: 'Dusty Rose', 
    category: 'modern', 
    image: 'https://images.unsplash.com/photo-1533616688419-b7a585564566?q=80&w=800&auto=format&fit=crop',
    description: 'Palet merah muda pudar yang romantis, lembut, dan menenangkan.'
  },
  { 
    id: 'modern_classic_grey', 
    name: 'Classic Grey', 
    category: 'modern', 
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop',
    description: 'Kemurnian abu-abu klasik yang profesional dan canggih di setiap layarnya.'
  }
];

// Helper to check if a template satisfies category filters
const isTemplateInCategory = (template: typeof TEMPLATES[0], categoryId: string) => {
  if (categoryId === 'all') return true;
  return template.category === categoryId;
};

const Editor = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [consumer, setConsumer] = useState<any>(null);
  const [existingInvitation, setExistingInvitation] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [authReady, setAuthReady] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showGuestManager, setShowGuestManager] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
    showPass: false
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    templateId: 'javanese_royal',
    language: 'id',
    accentColor: '#f43f5e', // Default Rose-500
    brideName: '',
    brideNickname: '',
    brideFather: '',
    brideMother: '',
    bridePhoto: '',
    groomName: '',
    groomNickname: '',
    groomFather: '',
    groomMother: '',
    groomPhoto: '',
    weddingDate: '',
    akadTime: '',
    receptionTime: '',
    akadLocation: '',
    receptionLocation: '',
    akadMapLink: '',
    receptionMapLink: '',
    location: '',
    musicUrl: 'https://www.mfiles.co.uk/mp3-downloads/pachelbel-canon-in-d.mp3',
    photos: ['', '', ''],
    gallery: [
      { url: '', caption: '', isPrimary: true },
      { url: '', caption: '', isPrimary: false },
      { url: '', caption: '', isPrimary: false },
      { url: '', caption: '', isPrimary: false },
      { url: '', caption: '', isPrimary: false },
      { url: '', caption: '', isPrimary: false }
    ],
    heroImage: '',
    loveStory: [
      { year: '2020', title: 'First Meeting', description: 'When it all began...', icon: 'heart' }
    ],
    slug: '',
    isGiftEnabled: false,
    bankAccounts: [
      { bankName: '', accountNumber: '', accountHolder: '' }
    ]
  });

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        try {
          await signInAnonymously(auth);
        } catch (err) {
          console.error("Auto sign-in failed:", err);
        }
      }
      setAuthReady(true);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!authReady) return;
    
    const savedConsumer = localStorage.getItem('consumer_user');
    if (!savedConsumer) {
      navigate('/login');
    } else {
      const parsedConsumer = JSON.parse(savedConsumer);
      if (!parsedConsumer?.id) {
        navigate('/login');
        return;
      }
      setConsumer(parsedConsumer);
      
      // Check for existing invitation using a guaranteed valid ID
      const consumerId = parsedConsumer.id;
      const invitationQuery = query(
        collection(db, "invitations"), 
        where("userId", "==", consumerId)
      );
      
      // Auto-sync authUid if missing for already logged-in users
      const syncAuthUid = async () => {
        if (auth.currentUser) {
          try {
            const consumerDocRef = doc(db, "consumers", parsedConsumer.id);
            // Always attempt to set it to ensure its current
            await updateDoc(consumerDocRef, { authUid: auth.currentUser.uid });
          } catch (e: any) {
            console.error("Failed to sync identity:", e.message);
          }
        }
      };
      
      // Wait for auth to be fully ready before syncing
      const checkAuth = setInterval(() => {
        if (auth.currentUser) {
          syncAuthUid();
          clearInterval(checkAuth);
        }
      }, 500);
      setTimeout(() => clearInterval(checkAuth), 5000); // 5s timeout

      const unsubscribe = onSnapshot(invitationQuery, (snapshot) => {
        if (!snapshot.empty) {
          const invData = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as any;
          setExistingInvitation(invData);
          
          // Pre-fill form data in case they want to edit
          setFormData({
            templateId: invData.templateId || 'palembang_glory',
            brideName: invData.brideName || '',
            brideNickname: invData.brideNickname || '',
            brideFather: invData.brideFather || '',
            brideMother: invData.brideMother || '',
            bridePhoto: invData.bridePhoto || '',
            groomName: invData.groomName || '',
            groomNickname: invData.groomNickname || '',
            groomFather: invData.groomFather || '',
            groomMother: invData.groomMother || '',
            groomPhoto: invData.groomPhoto || '',
            weddingDate: invData.weddingDate?.toDate ? new Date(invData.weddingDate.toDate()).toISOString().slice(0, 10) : '',
            akadTime: invData.akadTime || '',
            receptionTime: invData.receptionTime || '',
            akadLocation: invData.akadLocation || '',
            receptionLocation: invData.receptionLocation || '',
            akadMapLink: invData.akadMapLink || '',
            receptionMapLink: invData.receptionMapLink || '',
            location: invData.location || '',
            musicUrl: invData.musicUrl || 'https://www.mfiles.co.uk/mp3-downloads/pachelbel-canon-in-d.mp3',
            language: invData.language || 'id',
            loveStory: invData.loveStory || [
              { year: '2020', title: 'First Meeting', description: 'When it all began...', icon: 'heart' }
            ],
            photos: invData.photos || ['', '', ''],
            gallery: (invData.gallery || []).map((item: any, i: number) => {
              if (typeof item === 'string') return { url: item, caption: '', isPrimary: i === 0 };
              return item;
            }),
            heroImage: invData.heroImage || '',
            slug: invData.slug || '',
            accentColor: invData.accentColor || '#f43f5e',
            isGiftEnabled: invData.isGiftEnabled || false,
            bankAccounts: invData.bankAccounts || [{ bankName: '', accountNumber: '', accountHolder: '' }]
          });
        } else {
          setExistingInvitation(null);
        }
        setIsChecking(false);
      }, (err) => {
        handleFirestoreError(err, OperationType.LIST, "invitations");
        setIsChecking(false);
      });
      
      return () => unsubscribe();
    }
  }, [navigate, authReady]);

  const handleLogout = () => {
    localStorage.removeItem('consumer_user');
    navigate('/login');
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');

    if (!profileData.oldPassword) {
      setProfileError('Password lama harus diisi');
      return;
    }

    if (profileData.oldPassword !== consumer.password) {
      setProfileError('Password lama salah');
      return;
    }

    if (!profileData.newPassword) {
      setProfileError('Password baru tidak boleh kosong');
      return;
    }

    if (profileData.newPassword === profileData.oldPassword) {
      setProfileError('Password baru tidak boleh sama dengan password lama');
      return;
    }

    if (profileData.newPassword !== profileData.confirmPassword) {
      setProfileError('Konfirmasi password tidak cocok');
      return;
    }

    setProfileLoading(true);
    try {
      if (consumer && consumer.id) {
        await updateDoc(doc(db, "consumers", consumer.id), {
          password: profileData.newPassword
        });
        
        // Update local session
        const updatedConsumer = { ...consumer, password: profileData.newPassword };
        localStorage.setItem('consumer_user', JSON.stringify(updatedConsumer));
        setConsumer(updatedConsumer);
        
        setProfileSuccess('Password berhasil diubah');
        setProfileData(prev => ({ ...prev, oldPassword: '', newPassword: '', confirmPassword: '' }));
      }
    } catch (err) {
      console.error("Update password error:", err);
      setProfileError('Gagal mengubah password');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (index: number, value: string) => {
    const newPhotos = [...formData.photos];
    newPhotos[index] = value;
    setFormData(prev => ({ ...prev, photos: newPhotos }));
  };

  const handleGalleryChange = (index: number, value: string) => {
    const newGallery = [...formData.gallery];
    if (typeof newGallery[index] === 'string') {
      newGallery[index] = { url: value, caption: '', isPrimary: index === 0 };
    } else {
      newGallery[index] = { ...newGallery[index], url: value };
    }
    setFormData(prev => ({ ...prev, gallery: newGallery }));
  };

  const handleGalleryFieldChange = (index: number, field: string, value: any) => {
    const newGallery = [...formData.gallery];
    newGallery[index] = { ...newGallery[index], [field]: value };
    
    // Ensure only one primary
    if (field === 'isPrimary' && value === true) {
      newGallery.forEach((item, i) => {
        if (i !== index) item.isPrimary = false;
      });
    }
    
    setFormData(prev => ({ ...prev, gallery: newGallery }));
  };

  const moveGalleryItem = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= formData.gallery.length) return;
    
    const newGallery = [...formData.gallery];
    const temp = newGallery[index];
    newGallery[index] = newGallery[newIndex];
    newGallery[newIndex] = temp;
    setFormData(prev => ({ ...prev, gallery: newGallery }));
  };

  const handleBankChange = (index: number, field: string, value: string) => {
    const newBankAccounts = [...formData.bankAccounts];
    newBankAccounts[index] = { ...newBankAccounts[index], [field]: value };
    setFormData(prev => ({ ...prev, bankAccounts: newBankAccounts }));
  };

  const addBankAccount = () => {
    setFormData(prev => ({
      ...prev,
      bankAccounts: [...prev.bankAccounts, { bankName: '', accountNumber: '', accountHolder: '' }]
    }));
  };

  const removeBankAccount = (index: number) => {
    if (formData.bankAccounts.length <= 1) return;
    const newBankAccounts = formData.bankAccounts.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, bankAccounts: newBankAccounts }));
  };

  const handleSubmit = async () => {
    if (!consumer) {
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const weddingDate = formData.weddingDate ? new Date(formData.weddingDate) : new Date();
      if (isNaN(weddingDate.getTime())) {
        alert("Tanggal pernikahan tidak valid");
        setLoading(false);
        return;
      }

      const finalSlug = formData.slug || `wedding-${Date.now()}`;
      
      // Ensure photos array is synced with individual fields for backward compatibility
      const syncedPhotos = [...formData.photos];
      if (formData.bridePhoto) syncedPhotos[0] = formData.bridePhoto;
      if (formData.groomPhoto) syncedPhotos[1] = formData.groomPhoto;

      const payload = {
        ...formData,
        photos: syncedPhotos,
        heroImage: formData.heroImage,
        userId: consumer.id,
        weddingDate: weddingDate,
        createdAt: existingInvitation?.createdAt || serverTimestamp(),
        updatedAt: serverTimestamp(),
        slug: finalSlug
      };

      if (existingInvitation && isEditing) {
        await updateDoc(doc(db, "invitations", existingInvitation.id), payload);
        setIsEditing(false);
      } else {
        await addDoc(collection(db, "invitations"), payload);
      }
      navigate(`/v/${finalSlug}`);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, "invitations");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!existingInvitation) return;
    
    setLoading(true);
    try {
      await deleteDoc(doc(db, "invitations", existingInvitation.id));
      setExistingInvitation(null);
      setIsEditing(false);
      setShowDeleteConfirm(false);
      setFormData({
        templateId: 'javanese_royal',
        language: 'id',
        accentColor: '#f43f5e',
        brideName: '',
        brideNickname: '',
        brideFather: '',
        brideMother: '',
        bridePhoto: '',
        groomName: '',
        groomNickname: '',
        groomFather: '',
        groomMother: '',
        groomPhoto: '',
        weddingDate: '',
        akadTime: '',
        receptionTime: '',
        akadLocation: '',
        receptionLocation: '',
        akadMapLink: '',
        receptionMapLink: '',
        location: '',
        musicUrl: 'https://www.mfiles.co.uk/mp3-downloads/pachelbel-canon-in-d.mp3',
        photos: ['', '', ''],
        gallery: [
          { url: '', caption: '', isPrimary: true },
          { url: '', caption: '', isPrimary: false },
          { url: '', caption: '', isPrimary: false },
          { url: '', caption: '', isPrimary: false },
          { url: '', caption: '', isPrimary: false },
          { url: '', caption: '', isPrimary: false }
        ],
        heroImage: '',
        loveStory: [
          { year: '2020', title: 'First Meeting', description: 'When it all began...', icon: 'heart' }
        ],
        slug: '',
        isGiftEnabled: false,
        bankAccounts: [
          { bankName: '', accountNumber: '', accountHolder: '' }
        ]
      });
      setStep(1);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, "invitations");
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setStep(s => Math.min(s + 1, 5));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  if (isChecking) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse text-rose-500 font-serif text-2xl">Memuat Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 md:px-6 py-4 flex items-center justify-between gap-2">
        <button 
          onClick={() => navigate('/')} 
          className="flex items-center gap-1 sm:gap-2 text-slate-500 hover:text-slate-900 transition-colors shrink-0"
          title="Kembali"
        >
          <ChevronLeft size={20} />
          <span className="text-sm font-medium hidden sm:inline">Kembali</span>
        </button>
        
        {(!existingInvitation || isEditing) && (
          <div className="flex items-center gap-1.5 sm:gap-2 px-2">
            {[1, 2, 3, 4, 5].map(i => (
              <button 
                key={i} 
                onClick={() => setStep(i)}
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                  step === i ? 'bg-rose-500 text-white scale-110' : 
                  step > i ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-400'
                } hover:scale-105 active:scale-95`}
              >
                {step > i ? <Check size={12} /> : i}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-4 md:gap-6">
          {consumer && (
            <button 
              onClick={() => setShowProfile(true)}
              className="flex items-center gap-2 sm:gap-3 group px-2 sm:px-4 py-2 hover:bg-rose-50 rounded-2xl transition-all"
              title="Profil Saya"
            >
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-rose-100 rounded-full flex items-center justify-center group-hover:bg-rose-500 transition-all shrink-0">
                  <User2 className="text-rose-500 group-hover:text-white" size={14} />
                </div>
                <div className="text-left">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mb-1 hidden md:block text-nowrap">Diza Account</p>
                  <p className="text-[9px] sm:text-xs font-bold text-slate-900 group-hover:text-rose-500 transition-colors line-clamp-1 max-w-[60px] sm:max-w-none">
                    {consumer.name}
                  </p>
                </div>
              </div>
            </button>
          )}

          <button 
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-red-500 transition-all hover:bg-red-50 rounded-xl"
            title="Keluar"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        {existingInvitation && !isEditing ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl w-full space-y-8"
          >
            <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
              <div className="p-8 md:p-12">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                  <div>
                    <h2 className="text-3xl font-serif text-slate-900 mb-2">Undangan Anda</h2>
                    <p className="text-sm text-slate-500">Kelola undangan pernikahan digital Anda di sini</p>
                  </div>
                  <div className="flex flex-col gap-3 w-full md:min-w-[400px]">
                    <button 
                      onClick={() => setShowGuestManager(true)}
                      className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-rose-500 text-white rounded-[1.25rem] text-sm font-bold hover:bg-rose-600 transition-all shadow-xl shadow-rose-500/25 active:scale-[0.98]"
                    >
                      <Users size={18} /> KELOLA DATA TAMU
                    </button>
                    <div className="grid grid-cols-3 gap-2">
                      <button 
                        onClick={() => navigate('/')}
                        className="flex items-center justify-center gap-2 py-3 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-bold hover:bg-slate-200 transition-all uppercase tracking-wider"
                      >
                        <ChevronLeft size={14} /> BACK
                      </button>
                      <button 
                        onClick={() => setIsEditing(true)}
                        className="flex items-center justify-center gap-2 py-3 bg-rose-50 text-rose-500 rounded-xl text-[10px] font-bold hover:bg-rose-100 transition-all border border-rose-100 uppercase tracking-wider"
                      >
                        <Edit2 size={14} /> EDIT
                      </button>
                      <button 
                        onClick={() => setShowDeleteConfirm(true)}
                        className="flex items-center justify-center gap-2 py-3 bg-red-50 text-red-500 rounded-xl text-[10px] font-bold hover:bg-red-100 transition-all uppercase tracking-wider"
                      >
                        <Trash2 size={14} /> HAPUS
                      </button>
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {showDeleteConfirm && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="mb-8 p-6 bg-red-50 border border-red-100 rounded-3xl"
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-500">
                          <Trash2 size={20} />
                        </div>
                        <div>
                          <h4 className="font-bold text-red-900">Hapus Undangan?</h4>
                          <p className="text-xs text-red-600">Tindakan ini tidak dapat dibatalkan.</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button 
                          onClick={handleDelete}
                          disabled={loading}
                          className="px-6 py-2 bg-red-500 text-white rounded-xl text-xs font-bold hover:bg-red-600 transition-all disabled:opacity-50"
                        >
                          {loading ? 'MENGHAPUS...' : 'YA, HAPUS'}
                        </button>
                        <button 
                          onClick={() => setShowDeleteConfirm(false)}
                          className="px-6 py-2 bg-white text-slate-600 border border-slate-200 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all"
                        >
                          BATAL
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                      <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-4">Preview Undangan</p>
                      <div className="aspect-[4/3] bg-white rounded-2xl border border-slate-200 flex items-center justify-center overflow-hidden group relative">
                        {existingInvitation.bridePhoto && (
                          <img 
                            src={existingInvitation.bridePhoto} 
                            alt="Background" 
                            className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-opacity" 
                            referrerPolicy="no-referrer"
                          />
                        )}
                        <div className="text-center p-6 relative z-10">
                          <h4 className="text-xl font-serif text-slate-900 mb-2">{existingInvitation.brideName} & {existingInvitation.groomName}</h4>
                          <p className="text-xs text-slate-500 mb-4 uppercase tracking-[0.2em]">{existingInvitation.templateId} Template</p>
                          <a 
                            href={`/v/${existingInvitation.slug}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-rose-500 text-xs font-bold hover:underline bg-white/80 px-4 py-2 rounded-full shadow-sm"
                          >
                            Lihat Undangan <ExternalLink size={14} />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                      <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-4">Informasi Link</p>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-[10px] text-slate-400 font-bold mb-1">SLUG URL</label>
                          <p className="text-sm font-mono text-slate-900 bg-white px-4 py-2 rounded-lg border border-slate-200">{existingInvitation.slug}</p>
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-400 font-bold mb-1">TANGGAL ACARA</label>
                          <p className="text-sm font-bold text-slate-900">
                            {existingInvitation.weddingDate?.toDate ? new Date(existingInvitation.weddingDate.toDate()).toLocaleDateString('id-ID', { dateStyle: 'full' }) : '-'}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => window.open(`/v/${existingInvitation.slug}`, '_blank')}
                      className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-800 transition-all"
                    >
                      <Eye size={18} /> LIHAT HASIL AKHIR
                    </button>
                  </div>
                </div>

                {/* Key Features / Product Highlights */}
                <div className="mt-12 pt-12 border-t border-slate-100">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400 font-black mb-8 text-center">Keunggulan DizaInvite</p>
                  <div className="grid md:grid-cols-3 gap-6">
                    {[
                      { icon: <Palette className="text-rose-500" />, title: "Template Eksklusif", desc: "30+ template desain premium yang bisa disesuaikan dengan tema pernikahanmu." },
                      { icon: <ImageIcon className="text-rose-500" />, title: "Galeri Foto", desc: "Upload foto-foto prewedding terbaikmu untuk mempercantik undangan." },
                      { icon: <Send className="text-rose-500" />, title: "Bagikan Mudah", desc: "Dapatkan link unik dan bagikan ke tamu melalui WhatsApp atau media sosial." }
                    ].map((feature, i) => (
                      <div key={i} className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all group">
                        <div className="mb-4 transition-transform group-hover:scale-110 duration-300">{feature.icon}</div>
                        <h5 className="font-bold text-slate-900 mb-2">{feature.title}</h5>
                        <p className="text-slate-500 text-[11px] leading-relaxed italic">{feature.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="max-w-2xl w-full bg-white rounded-3xl md:rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden mx-auto h-full md:h-auto flex flex-col">
            <div className="p-6 md:p-10 flex-1 flex flex-col overflow-hidden">
              {/* Progress Bar */}
              <div className="flex gap-1 mb-6 flex-none">
                {[1, 2, 3, 4, 5].map((s) => (
                  <div 
                    key={s} 
                    className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                      s <= step ? 'bg-rose-500' : 'bg-slate-100'
                    }`}
                  />
                ))}
              </div>
              <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="text-center">
                    <Palette className="text-rose-500 mx-auto mb-4" size={32} />
                    <h2 className="text-2xl font-serif font-bold">Pilih Template</h2>
                    <p className="text-slate-500 text-sm">Pilih gaya desain yang paling sesuai denganmu</p>
                  </div>

                  {/* Language Selection */}
                  <div className="p-4 bg-slate-50 rounded-[2rem] border border-slate-100">
                    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-4 text-center">Pilih Bahasa Undangan</p>
                    <div className="flex p-1 bg-slate-200 rounded-2xl w-fit mx-auto">
                      <button 
                        onClick={() => setFormData(prev => ({ ...prev, language: 'id' }))}
                        className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${
                          formData.language === 'id' ? 'bg-white text-rose-500 shadow-md' : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        Bahasa Indonesia
                      </button>
                      <button 
                        onClick={() => setFormData(prev => ({ ...prev, language: 'en' }))}
                        className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${
                          formData.language === 'en' ? 'bg-white text-rose-500 shadow-md' : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        English
                      </button>
                    </div>
                  </div>

                  {/* Theme Color Selection */}
                  <div className="p-4 bg-slate-50 rounded-[2rem] border border-slate-100">
                    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-4 text-center">Warna Tema Utama</p>
                    <div className="flex flex-wrap justify-center gap-3">
                      {[
                        '#f43f5e', // Rose
                        '#d97706', // Amber
                        '#059669', // Emerald
                        '#2563eb', // Blue
                        '#7c3aed', // Violet
                        '#db2777', // Pink
                      ].map((color) => (
                        <button
                          key={color}
                          onClick={() => setFormData(prev => ({ ...prev, accentColor: color }))}
                          className={`w-10 h-10 rounded-full border-4 transition-all ${
                            formData.accentColor === color ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                      <div className="relative group">
                        <input 
                          type="color"
                          value={formData.accentColor}
                          onChange={(e) => setFormData(prev => ({ ...prev, accentColor: e.target.value }))}
                          className="w-10 h-10 rounded-full border-4 border-transparent opacity-60 hover:opacity-100 cursor-pointer overflow-hidden p-0"
                        />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                          <Palette size={14} className="text-white drop-shadow-md" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Template Categories */}
                  <div className="flex flex-wrap justify-center gap-2 mb-4">
                    {[
                      { id: 'all', name: 'Semua', icon: Check },
                      { id: 'adat', name: 'Adat Nusantara', icon: Globe },
                      { id: 'elite', name: 'Creative Elite', icon: Sparkles },
                      { id: 'modern', name: 'Modern Style', icon: Compass }
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                          selectedCategory === cat.id 
                            ? 'bg-rose-500 text-white shadow-lg shadow-rose-200' 
                            : 'bg-white text-slate-400 hover:bg-white hover:text-slate-600 border border-slate-100'
                        }`}
                      >
                        <cat.icon size={12} />
                        {cat.name}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {TEMPLATES.filter(t => isTemplateInCategory(t, selectedCategory)).map(t => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, templateId: t.id }));
                          // Optional: Auto-advance to next step if it's the first time selecting
                          if (step === 1 && !formData.brideName && !formData.groomName) {
                            setTimeout(() => setStep(2), 500);
                          }
                        }}
                        className={`p-3 rounded-[2rem] border-2 transition-all text-left relative group flex flex-col ${
                          formData.templateId === t.id 
                            ? 'border-rose-500 bg-rose-50 shadow-xl shadow-rose-500/10 scale-[1.02] ring-4 ring-rose-500/5' 
                            : 'border-slate-100 bg-white hover:border-slate-300 hover:shadow-md'
                        }`}
                      >
                        <div className="aspect-video sm:aspect-square rounded-2xl mb-4 relative overflow-hidden transition-transform duration-500 group-hover:scale-[1.03] bg-slate-100">
                          {t.image && (
                            <img 
                              src={t.image} 
                              alt={t.name}
                              className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                              referrerPolicy="no-referrer"
                            />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          
                          {/* Category Badge */}
                          <div className="absolute top-2 right-2 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-[8px] font-black uppercase tracking-widest text-slate-900 shadow-sm">
                            {t.category}
                          </div>

                          <AnimatePresence>
                            {formData.templateId === t.id && (
                              <motion.div 
                                initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                exit={{ opacity: 0, scale: 0.8, rotate: 10 }}
                                className="absolute inset-0 flex items-center justify-center bg-rose-500/10 backdrop-blur-[1px]"
                              >
                                <div className="bg-white rounded-full p-2.5 shadow-xl border border-rose-100">
                                  <Check className="text-rose-500" size={20} strokeWidth={3} />
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                        <div className="flex-1 px-1">
                          <div className="flex items-center justify-between mb-1">
                            <p className={`text-[11px] font-extrabold uppercase tracking-wider transition-colors ${
                              formData.templateId === t.id ? 'text-rose-600' : 'text-slate-900'
                            }`}>
                              {t.name}
                            </p>
                            {formData.templateId === t.id && (
                              <motion.div 
                                layoutId="active-dot"
                                className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]" 
                              />
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">
                            {t.description}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6 flex-1 overflow-y-auto pr-2"
                >
                  <div className="text-center">
                    <User className="text-rose-500 mx-auto mb-4" size={32} />
                    <h2 className="text-2xl font-serif font-bold">Detail Mempelai</h2>
                    <p className="text-slate-500 text-sm">Masukkan detail lengkap kedua mempelai</p>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Mempelai Wanita */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-rose-500 border-b border-rose-100 pb-2">Mempelai Wanita</h3>
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">Nama Lengkap</label>
                        <input type="text" name="brideName" value={formData.brideName} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm" />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">Nama Panggilan</label>
                        <input type="text" name="brideNickname" value={formData.brideNickname} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm" />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">Nama Ayah</label>
                        <input type="text" name="brideFather" value={formData.brideFather} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm" />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">Nama Ibu</label>
                        <input type="text" name="brideMother" value={formData.brideMother} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm" />
                      </div>
                      <div>
                        <FileUpload 
                          label="Foto Mempelai Wanita" 
                          value={formData.bridePhoto} 
                          onChange={(url) => setFormData(prev => ({ ...prev, bridePhoto: url }))} 
                          folder="wedding/photos"
                          aspectRatio="aspect-[4/5]"
                          className="max-w-[200px]"
                        />
                      </div>
                    </div>

                    {/* Mempelai Pria */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-blue-500 border-b border-blue-100 pb-2">Mempelai Pria</h3>
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">Nama Lengkap</label>
                        <input type="text" name="groomName" value={formData.groomName} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm" />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">Nama Panggilan</label>
                        <input type="text" name="groomNickname" value={formData.groomNickname} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm" />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">Nama Ayah</label>
                        <input type="text" name="groomFather" value={formData.groomFather} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm" />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">Nama Ibu</label>
                        <input type="text" name="groomMother" value={formData.groomMother} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm" />
                      </div>
                      <div>
                        <FileUpload 
                          label="Foto Mempelai Pria" 
                          value={formData.groomPhoto} 
                          onChange={(url) => setFormData(prev => ({ ...prev, groomPhoto: url }))} 
                          folder="wedding/photos"
                          aspectRatio="aspect-[4/5]"
                          className="max-w-[200px]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <label className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">Slug URL (Opsional)</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        name="slug" 
                        value={formData.slug} 
                        onChange={(e) => {
                          const val = e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                          setFormData(prev => ({ ...prev, slug: val }));
                        }} 
                        placeholder="contoh: diza-thama-wedding" 
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm" 
                      />
                    </div>
                    <p className="text-[9px] text-slate-400 mt-2 px-1">Link Anda: diza.id/v/<span className="text-rose-500 font-bold">{formData.slug || '...' }</span></p>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6 flex-1 overflow-y-auto pr-2"
                >
                  <div className="text-center">
                    <Calendar className="text-rose-500 mx-auto mb-4" size={32} />
                    <h2 className="text-2xl font-serif font-bold">Waktu & Lokasi</h2>
                    <p className="text-slate-500 text-sm">Detail acara akad dan resepsi</p>
                  </div>
                  
                    <div className="space-y-6">
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">Tanggal Pernikahan</label>
                        <input type="date" name="weddingDate" value={formData.weddingDate} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm" />
                      </div>
  
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2">Akad Nikah</h3>
                          <div>
                            <label className="block text-[10px] text-slate-400 font-bold mb-1">Jam Akad</label>
                            <input type="time" name="akadTime" value={formData.akadTime} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm" />
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-400 font-bold mb-1">Lokasi Akad</label>
                            <input type="text" name="akadLocation" value={formData.akadLocation} onChange={handleInputChange} placeholder="Nama Gedung/Masjid" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm" />
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-400 font-bold mb-1 font-mono">Link Google Maps (Copy & Paste)</label>
                            <input type="url" name="akadMapLink" value={formData.akadMapLink} onChange={handleInputChange} placeholder="https://goo.gl/maps/..." className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-mono" />
                            <p className="text-[9px] text-slate-400 mt-1">Tips: Gunakan link "Share" dari aplikasi Google Maps untuk hasil terbaik.</p>
                          </div>
                        </div>
  
                        <div className="space-y-4">
                          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2">Resepsi</h3>
                          <div>
                            <label className="block text-[10px] text-slate-400 font-bold mb-1">Jam Resepsi</label>
                            <input type="time" name="receptionTime" value={formData.receptionTime} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm" />
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-400 font-bold mb-1">Lokasi Resepsi</label>
                            <input type="text" name="receptionLocation" value={formData.receptionLocation} onChange={handleInputChange} placeholder="Nama Gedung/Hotel" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm" />
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-400 font-bold mb-1 font-mono">Link Google Maps (Copy & Paste)</label>
                            <input type="url" name="receptionMapLink" value={formData.receptionMapLink} onChange={handleInputChange} placeholder="https://goo.gl/maps/..." className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-mono" />
                            <p className="text-[9px] text-slate-400 mt-1">Tips: Gunakan link "Share" dari aplikasi Google Maps untuk hasil terbaik.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6 flex-1 overflow-y-auto pr-2"
                >
                  <div className="text-center">
                    <CreditCard className="text-rose-500 mx-auto mb-4" size={32} />
                    <h2 className="text-2xl font-serif font-bold">Hadiah Pernikahan</h2>
                    <p className="text-slate-500 text-sm">Aktifkan modul amplop digital / kado pernikahan</p>
                  </div>

                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-sm font-bold">Aktifkan Fitur Gift</h3>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">Munculkan opsi amplop digital di undangan</p>
                      </div>
                      <button
                        onClick={() => setFormData(prev => ({ ...prev, isGiftEnabled: !prev.isGiftEnabled }))}
                        className={`w-11 h-6 rounded-full transition-colors relative flex items-center shrink-0 ${formData.isGiftEnabled ? 'bg-rose-500' : 'bg-slate-300'}`}
                      >
                        <div className={`absolute left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${formData.isGiftEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                    </div>

                    {formData.isGiftEnabled && (
                      <div className="space-y-6 animate-in fade-in slide-in-from-top-4">
                        <div className="space-y-4">
                          {formData.bankAccounts.map((account, index) => (
                            <div key={index} className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm relative group transition-all hover:shadow-md">
                              <div className="space-y-4">
                                <div className="space-y-1.5">
                                  <label className="text-[10px] text-slate-500 font-extrabold uppercase tracking-[0.15em] ml-1">
                                    Nama Bank / E-Wallet
                                  </label>
                                  <input
                                    type="text"
                                    value={account.bankName}
                                    onChange={(e) => handleBankChange(index, 'bankName', e.target.value)}
                                    placeholder="e.g. BCA, Mandiri, Dana, OVO"
                                    className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all outline-none"
                                  />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  <div className="space-y-1.5">
                                    <label className="text-[10px] text-slate-500 font-extrabold uppercase tracking-[0.15em] ml-1">
                                      No. Rekening
                                    </label>
                                    <input
                                      type="text"
                                      value={account.accountNumber}
                                      onChange={(e) => handleBankChange(index, 'accountNumber', e.target.value)}
                                      placeholder="000-123-xxxx"
                                      className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all outline-none"
                                    />
                                  </div>
                                  <div className="space-y-1.5">
                                    <label className="text-[10px] text-slate-500 font-extrabold uppercase tracking-[0.15em] ml-1">
                                      Atas Nama
                                    </label>
                                    <input
                                      type="text"
                                      value={account.accountHolder}
                                      onChange={(e) => handleBankChange(index, 'accountHolder', e.target.value)}
                                      placeholder="Nama Lengkap Pemilik"
                                      className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all outline-none"
                                    />
                                  </div>
                                </div>
                              </div>
                              {formData.bankAccounts.length > 1 && (
                                <button
                                  onClick={() => removeBankAccount(index)}
                                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Trash size={12} />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={addBankAccount}
                          className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-[10px] font-extrabold uppercase tracking-[0.2em] hover:border-rose-400 hover:text-rose-500 hover:bg-rose-50/30 transition-all flex items-center justify-center gap-2 group"
                        >
                          <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-rose-100 transition-colors">
                            <Plus size={12} />
                          </div>
                          Tambah Rekening Baru
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {step === 5 && (
                <motion.div
                  key="step5"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6 flex-1 overflow-y-auto pr-2"
                >
                  <div className="text-center">
                    <ImageIcon className="text-rose-500 mx-auto mb-4" size={32} />
                    <h2 className="text-2xl font-serif font-bold">Media & Galeri</h2>
                    <p className="text-slate-500 text-sm">Upload galeri foto dan pilih musik latar</p>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-4">Background Utama / Hero Image</label>
                      <FileUpload 
                        label="Ganti Background Utama"
                        value={formData.heroImage}
                        onChange={(url) => setFormData(prev => ({ ...prev, heroImage: url }))}
                        folder="wedding/hero"
                        aspectRatio="aspect-video"
                      />
                      <p className="text-[9px] text-slate-400 mt-2">PENTING: Kosongkan jika ingin menggunakan background default dari template yang Anda pilih.</p>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-4">Galeri Foto</label>
                      <div className="space-y-4">
                        {formData.gallery.map((item: any, i: number) => (
                          <div key={i} className="bg-slate-50 p-4 rounded-3xl border border-slate-100 flex flex-col sm:flex-row gap-6 relative group">
                            <div className="w-full sm:w-40 shrink-0">
                               <FileUpload 
                                label={`Foto ${i + 1}`}
                                value={typeof item === 'string' ? item : item.url}
                                onChange={(url) => handleGalleryChange(i, url)}
                                folder="gallery"
                                aspectRatio="aspect-square"
                              />
                            </div>
                            <div className="flex-1 space-y-4">
                               <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                     <button
                                      type="button"
                                      onClick={() => moveGalleryItem(i, 'up')}
                                      disabled={i === 0}
                                      className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-rose-500 disabled:opacity-30 transition-all"
                                     >
                                        <ArrowUp size={14} />
                                     </button>
                                     <button
                                      type="button"
                                      onClick={() => moveGalleryItem(i, 'down')}
                                      disabled={i === formData.gallery.length - 1}
                                      className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-rose-500 disabled:opacity-30 transition-all"
                                     >
                                        <ArrowDown size={14} />
                                     </button>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleGalleryFieldChange(i, 'isPrimary', !item.isPrimary)}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${
                                      item.isPrimary 
                                        ? 'bg-amber-100 text-amber-600 border border-amber-200' 
                                        : 'bg-white text-slate-400 border border-slate-200 hover:border-amber-200 hover:text-amber-500'
                                    }`}
                                  >
                                     <Star size={12} fill={item.isPrimary ? "currentColor" : "none"} />
                                     {item.isPrimary ? 'Foto Utama' : 'Set Utama'}
                                  </button>
                               </div>

                               <div className="space-y-1.5">
                                  <label className="text-[9px] uppercase tracking-widest text-slate-400 font-bold ml-1">Keterangan Foto (Caption)</label>
                                  <input 
                                    type="text"
                                    value={item.caption || ''}
                                    onChange={(e) => handleGalleryFieldChange(i, 'caption', e.target.value)}
                                    placeholder="Tulis cerita di balik foto ini..."
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-rose-500/10 focus:border-rose-300 outline-none transition-all placeholder:text-slate-300"
                                  />
                               </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-8 border-t border-slate-100 space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Heart size={14} className="text-rose-500" />
                          <label className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold">Cerita Cinta (Love Story)</label>
                        </div>
                        <button 
                          type="button"
                          onClick={() => setFormData(prev => ({
                            ...prev,
                            loveStory: [...(prev.loveStory || []), { year: '', title: '', description: '', icon: 'heart' }]
                          }))}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-600 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-rose-100 transition-all"
                        >
                          <Plus size={12} /> Tambah Momen
                        </button>
                      </div>

                      <div className="space-y-4">
                        {formData.loveStory?.map((story: any, index: number) => (
                          <div key={index} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-4 relative group">
                            <button 
                              type="button"
                              onClick={() => setFormData(prev => ({
                                ...prev,
                                loveStory: prev.loveStory.filter((_: any, i: number) => i !== index)
                              }))}
                              className="absolute top-2 right-2 p-1.5 text-slate-300 hover:text-red-500 transition-colors"
                            >
                              <Trash size={14} />
                            </button>
                            <div className="grid grid-cols-4 gap-3">
                              <div className="col-span-1">
                                <label className="block text-[9px] uppercase tracking-wider text-slate-400 font-bold mb-1">Tahun</label>
                                <input 
                                  type="text" value={story.year} 
                                  onChange={(e) => {
                                    const next = [...formData.loveStory];
                                    next[index].year = e.target.value;
                                    setFormData({ ...formData, loveStory: next });
                                  }}
                                  placeholder="2020" className="w-full px-3 py-2 bg-white border border-slate-100 rounded-lg text-xs" 
                                />
                              </div>
                              <div className="col-span-3">
                                <label className="block text-[9px] uppercase tracking-wider text-slate-400 font-bold mb-1">Judul</label>
                                <input 
                                  type="text" value={story.title} 
                                  onChange={(e) => {
                                    const next = [...formData.loveStory];
                                    next[index].title = e.target.value;
                                    setFormData({ ...formData, loveStory: next });
                                  }}
                                  placeholder="Pertemuan Pertama" className="w-full px-3 py-2 bg-white border border-slate-100 rounded-lg text-xs" 
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-[9px] uppercase tracking-wider text-slate-400 font-bold mb-1">Deskripsi Singkat</label>
                              <textarea 
                                value={story.description} 
                                onChange={(e) => {
                                  const next = [...formData.loveStory];
                                  next[index].description = e.target.value;
                                  setFormData({ ...formData, loveStory: next });
                                }}
                                placeholder="Ceritakan sedikit momen ini..." className="w-full px-3 py-2 bg-white border border-slate-100 rounded-lg text-xs h-16 resize-none" 
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 space-y-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Music size={14} className="text-rose-500" />
                        <label className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold">Musik Latar</label>
                      </div>
                      
                      <FileUpload 
                        label="Upload Musik (MP3)"
                        value={formData.musicUrl}
                        onChange={(url) => setFormData(prev => ({ ...prev, musicUrl: url }))}
                        folder="wedding/music"
                        accept="audio/*"
                        fileType="audio"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="bg-slate-50 p-4 md:p-6 flex justify-between items-center gap-2">
            <button 
              onClick={prevStep}
              disabled={step === 1}
              className={`px-4 md:px-8 py-3 rounded-xl font-bold text-[10px] md:text-xs transition-all shrink-0 ${
                step === 1 ? 'text-slate-300' : 'text-slate-500 hover:bg-slate-200'
              }`}
            >
              KEMBALI
            </button>
            {step < 5 ? (
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={nextStep}
                className="bg-rose-500 text-white px-5 md:px-10 py-3 rounded-xl font-bold text-[10px] md:text-xs hover:shadow-lg hover:shadow-rose-500/20 transition-all flex items-center gap-2 whitespace-nowrap shrink-0"
              >
                LANJUT <ChevronRight size={16} />
              </motion.button>
            ) : (
              <motion.button 
                whileHover={!loading ? { scale: 1.02 } : {}}
                whileTap={!loading ? { scale: 0.98 } : {}}
                onClick={handleSubmit}
                disabled={loading}
                className="bg-green-500 text-white px-5 md:px-10 py-3 rounded-xl font-bold text-[10px] md:text-xs hover:shadow-lg hover:shadow-green-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap shrink-0 min-w-[120px] md:min-w-[180px]"
              >
                <AnimatePresence mode="wait">
                  {loading ? (
                    <motion.div 
                      key="loading"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-2"
                    >
                      <RefreshCw size={14} className="animate-spin" />
                      <span>MENYIMPAN</span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="normal"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-2"
                    >
                      <span className="md:hidden">TERBITKAN</span>
                      <span className="hidden md:inline">TERBITKAN UNDANGAN</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            )}
          </div>
        </div>
      )}
      </main>

      {/* Profile Modal */}
      <AnimatePresence>
        {showProfile && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-0">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowProfile(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden"
            >
              <div className="bg-rose-50 p-8 flex items-center justify-between border-b border-rose-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-rose-200/50">
                    <User2 className="text-rose-500" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-serif text-slate-900">Profil Saya</h3>
                    <p className="text-[10px] text-rose-400 uppercase tracking-widest font-bold">Pengaturan Akun</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowProfile(false)}
                  className="p-2 text-slate-400 hover:text-slate-900 hover:bg-white rounded-xl transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">Username / Nama</label>
                  <div className="flex items-center gap-3 px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-600">
                    <User2 size={16} className="opacity-40" />
                    <span className="text-sm font-bold">{consumer?.name}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">Email</label>
                  <div className="flex items-center gap-3 px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-600">
                    <Globe size={16} className="opacity-40" />
                    <span className="text-sm font-bold">{consumer?.email}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-50">
                  <h4 className="text-xs font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Lock size={14} className="text-rose-500" /> GANTI PASSWORD
                  </h4>
                  
                  <form onSubmit={handleUpdatePassword} className="space-y-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">Password Lama</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                        <input 
                          type={profileData.showPass ? "text" : "password"}
                          value={profileData.oldPassword}
                          onChange={(e) => setProfileData(prev => ({ ...prev, oldPassword: e.target.value }))}
                          placeholder="Password saat ini"
                          className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-rose-500 transition-all text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">Password Baru</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                        <input 
                          type={profileData.showPass ? "text" : "password"}
                          value={profileData.newPassword}
                          onChange={(e) => setProfileData(prev => ({ ...prev, newPassword: e.target.value }))}
                          placeholder="Password baru"
                          className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-rose-500 transition-all text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setProfileData(prev => ({ ...prev, showPass: !prev.showPass }))}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                        >
                          {profileData.showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">Konfirmasi Password</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                        <input 
                          type={profileData.showPass ? "text" : "password"}
                          value={profileData.confirmPassword}
                          onChange={(e) => setProfileData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          placeholder="Ulangi password"
                          className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-rose-500 transition-all text-sm"
                        />
                      </div>
                    </div>

                    {profileError && (
                      <p className="text-[10px] text-red-500 font-bold bg-red-50 py-2 px-4 rounded-lg text-center">{profileError}</p>
                    )}
                    
                    {profileSuccess && (
                      <p className="text-[10px] text-green-500 font-bold bg-green-50 py-2 px-4 rounded-lg text-center">{profileSuccess}</p>
                    )}

                    <button 
                      type="submit"
                      disabled={profileLoading}
                      className="w-full py-4 bg-rose-500 text-white rounded-2xl font-bold tracking-widest text-[10px] hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/20 disabled:opacity-50"
                    >
                      {profileLoading ? 'MENYIMPAN...' : 'SIMPAN PERUBAHAN'}
                    </button>
                  </form>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Guest Manager Modal */}
      {showGuestManager && existingInvitation && (
        <GuestManager 
          invitationId={existingInvitation.id}
          slug={existingInvitation.slug}
          userId={consumer?.id}
          onClose={() => setShowGuestManager(false)}
        />
      )}
    </div>
  );
};

export default Editor;
