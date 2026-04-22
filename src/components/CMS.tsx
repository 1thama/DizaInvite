import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as XLSX from 'xlsx';
import { 
  Heart, 
  Copy,
  Trash2,
  Download,
  FileSpreadsheet,
  Users,
  MessageSquare,
  FileText,
  UserPlus,
  ExternalLink,
  LayoutDashboard,
  Search,
  PieChart,
  Calendar,
  Settings,
  ShieldCheck,
  MoreVertical,
  Plus,
  Check,
  MessageCircle
} from 'lucide-react';
import { 
  db, 
  auth, 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp, 
  doc, 
  updateDoc, 
  deleteDoc, 
  signInWithPopup, 
  googleProvider, 
  onAuthStateChanged,
  signOut,
  handleFirestoreError,
  OperationType
} from '../firebase';

const CMS = ({ onClose }: { onClose: () => void }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'guests' | 'messages' | 'invitations' | 'consumers'>('dashboard');
  const [guests, setGuests] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [consumers, setConsumers] = useState<any[]>([]);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [newGuestName, setNewGuestName] = useState("");
  const [newGuestJabatan, setNewGuestJabatan] = useState("");
  const [newGuestWhatsApp, setNewGuestWhatsApp] = useState("");
  const [newConsumer, setNewConsumer] = useState({ name: '', email: '', password: '' });
  
  const [user, setUser] = useState<any>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [editingGuestId, setEditingGuestId] = useState<string | null>(null);
  const [editingConsumerId, setEditingConsumerId] = useState<string | null>(null);
  const [editingInvitationId, setEditingInvitationId] = useState<string | null>(null);
  
  const [editName, setEditName] = useState("");
  const [editTotal, setEditTotal] = useState("0");
  const [editConsumer, setEditConsumer] = useState({ name: '', email: '', password: '' });
  const [editInvitation, setEditInvitation] = useState({ brideName: '', groomName: '', slug: '' });
  
  const [guestFilter, setGuestFilter] = useState<string>("all");
  
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{isOpen: boolean, message: string, onConfirm: () => void} | null>(null);
  
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const loginInProgress = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;
    const userEmail = user.email?.toLowerCase().trim();
    if (userEmail !== "desrieprathama@gmail.com") return;
    
    const qGuests = query(collection(db, "guests"), orderBy("createdAt", "desc"));
    const unsubscribeGuests = onSnapshot(qGuests, (snapshot) => {
      setGuests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => handleFirestoreError(err, OperationType.LIST, "guests"));

    const qMessages = query(collection(db, "messages"), orderBy("createdAt", "desc"));
    const unsubscribeMessages = onSnapshot(qMessages, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => handleFirestoreError(err, OperationType.LIST, "messages"));

    const qInvitations = query(collection(db, "invitations"), orderBy("createdAt", "desc"));
    const unsubscribeInvitations = onSnapshot(qInvitations, (snapshot) => {
      setInvitations(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => handleFirestoreError(err, OperationType.LIST, "invitations"));

    const qConsumers = query(collection(db, "consumers"), orderBy("createdAt", "desc"));
    const unsubscribeConsumers = onSnapshot(qConsumers, (snapshot) => {
      setConsumers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => handleFirestoreError(err, OperationType.LIST, "consumers"));

    return () => {
      unsubscribeGuests();
      unsubscribeMessages();
      unsubscribeInvitations();
      unsubscribeConsumers();
    };
  }, [user]);

  const isAdmin = user?.email?.toLowerCase().trim() === "desrieprathama@gmail.com";

  const handleLogin = async () => {
    if (loginInProgress.current) return;
    loginInProgress.current = true;
    setIsLoggingIn(true);
    
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      const isCancelled = err.code === 'auth/cancelled-popup-request' || 
                          err.code === 'auth/popup-closed-by-user' ||
                          err.message?.includes('cancelled-popup-request');
      
      if (!isCancelled) {
        console.error("Login failed:", err);
        showNotification("Gagal masuk. Silakan coba lagi.", "error");
      }
    } finally {
      loginInProgress.current = false;
      setIsLoggingIn(false);
    }
  };

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const formatWhatsApp = (num: string) => {
    let cleaned = num.replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = '62' + cleaned.slice(1);
    } else if (cleaned.startsWith('8')) {
      cleaned = '62' + cleaned;
    }
    return '+' + cleaned;
  };

  const handleAddGuest = async () => {
    if (!newGuestName.trim() || !newGuestWhatsApp.trim()) {
      if (!newGuestWhatsApp.trim() && newGuestName.trim()) {
        showNotification("Nomor WhatsApp wajib diisi", "error");
      } else if (!newGuestName.trim()) {
        showNotification("Nama tamu wajib diisi", "error");
      }
      return;
    }
    try {
      await addDoc(collection(db, "guests"), {
        name: newGuestName.trim(),
        jabatan: newGuestJabatan.trim(),
        whatsapp: formatWhatsApp(newGuestWhatsApp.trim()),
        status: "Pending",
        totalGuests: 0,
        consumerId: guestFilter === 'all' ? null : guestFilter,
        userId: guestFilter === 'all' ? null : guestFilter, // Also set as userId for rules
        createdAt: serverTimestamp()
      });
      setNewGuestName("");
      setNewGuestJabatan("");
      setNewGuestWhatsApp("");
      showNotification("Tamu berhasil ditambahkan");
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, "guests");
    }
  };

  const handleAddConsumer = async () => {
    if (!newConsumer.name || !newConsumer.email || !newConsumer.password) {
      showNotification("Semua field harus diisi", "error");
      return;
    }
    try {
      await addDoc(collection(db, "consumers"), {
        ...newConsumer,
        createdAt: serverTimestamp()
      });
      setNewConsumer({ name: '', email: '', password: '' });
      showNotification("Konsumen berhasil didaftarkan");
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, "consumers");
    }
  };

  const handleDeleteItem = (e: React.MouseEvent, collectionName: string, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setConfirmDialog({
      isOpen: true,
      message: "Apakah Anda yakin ingin menghapus data ini?",
      onConfirm: async () => {
        setIsDeleting(true);
        try {
          await deleteDoc(doc(db, collectionName, id));
          showNotification("Data berhasil dihapus");
          setConfirmDialog(null);
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, collectionName);
        } finally {
          setIsDeleting(false);
        }
      }
    });
  };

  const handleUpdateGuestStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, "guests", id), { status });
      showNotification("Status diperbarui");
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, "guests");
    }
  };

  const handleStartEdit = (guest: any) => {
    setEditingGuestId(guest.id);
    setEditName(guest.name);
    setEditTotal(guest.totalGuests?.toString() || "0");
  };

  const handleSaveEdit = async (id: string) => {
    if (!editName) return;
    try {
      await updateDoc(doc(db, "guests", id), { 
        name: editName,
        totalGuests: parseInt(editTotal) || 0
      });
      setEditingGuestId(null);
      showNotification("Data tamu diperbarui");
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, "guests");
    }
  };

  const handleStartEditConsumer = (consumer: any) => {
    setEditingConsumerId(consumer.id);
    setEditConsumer({
      name: consumer.name,
      email: consumer.email,
      password: consumer.password
    });
  };

  const handleSaveEditConsumer = async (id: string) => {
    if (!editConsumer.name || !editConsumer.email || !editConsumer.password) return;
    try {
      await updateDoc(doc(db, "consumers", id), { ...editConsumer });
      setEditingConsumerId(null);
      showNotification("Data konsumen diperbarui");
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, "consumers");
    }
  };

  const handleStartEditInvitation = (inv: any) => {
    setEditingInvitationId(inv.id);
    setEditInvitation({
      brideName: inv.brideName,
      groomName: inv.groomName,
      slug: inv.slug
    });
  };

  const handleSaveEditInvitation = async (id: string) => {
    if (!editInvitation.brideName || !editInvitation.groomName || !editInvitation.slug) return;
    try {
      await updateDoc(doc(db, "invitations", id), { ...editInvitation });
      setEditingInvitationId(null);
      showNotification("Data undangan diperbarui");
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, "invitations");
    }
  };

  const copyLink = (name: string) => {
    const baseUrl = window.location.origin + window.location.pathname;
    const link = `${baseUrl}?to=${encodeURIComponent(name).replace(/%20/g, '+')}`;
    navigator.clipboard.writeText(link);
    showNotification(`Link untuk ${name} disalin`);
  };

  const downloadTemplate = () => {
    const data = [
      ["Nama Tamu", "Jabatan", "Nomor WhatsApp"],
      ["Budi Santoso", "Manager", "08123456789"],
      ["Siti Aminah", "Supervisor", "08122334455"],
      ["Keluarga Besar Jaka", "-", "-"]
    ];
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Daftar Tamu");
    XLSX.writeFile(wb, "Template_Tamu_Undangan.xlsx");
  };

  const handleExportGuests = () => {
    const data = guests.map(g => ({
      'Nama': g.name,
      'Jabatan': g.jabatan || '-',
      'Nomor WhatsApp': g.whatsapp || '-',
      'Status': g.status,
      'Total Tamu': g.totalGuests || 0,
      'Konsumen ID': g.consumerId || '-',
      'Tanggal': g.createdAt?.toDate() ? new Date(g.createdAt.toDate()).toLocaleString() : '-'
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Daftar Tamu");
    XLSX.writeFile(wb, `Laporan_Tamu_${new Date().toLocaleDateString()}.xlsx`);
    showNotification("Laporan berhasil diunduh");
  };

  const handleSendWhatsApp = async (guest: any) => {
    if (!guest.whatsapp) {
      showNotification("Nomor WhatsApp tidak tersedia", "error");
      return;
    }

    const invitation = invitations.find(inv => inv.id === guest.invitationId);
    const slug = invitation ? invitation.slug : '';
    const baseUrl = window.location.origin;
    const guestUrl = `${baseUrl}/v/${slug}?to=${encodeURIComponent(guest.name)}&gid=${guest.id}`;

    const message = `Halo ${guest.name},
Tanpa mengurangi rasa hormat, kami mengundang Bapak/Ibu/Saudara/i untuk hadir di acara pernikahan kami.

Berikut link undangan digital kami:
${guestUrl}

Terima kasih.`;

    const encodedMessage = encodeURIComponent(message);
    const waUrl = `https://wa.me/${guest.whatsapp.replace(/\D/g, '')}?text=${encodedMessage}`;
    
    window.open(waUrl, '_blank');

    try {
      await updateDoc(doc(db, "guests", guest.id), {
        isSent: true
      });
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const bstr = event.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];

        const guestData = data.slice(1)
          .map(row => ({
            name: row[0],
            jabatan: row[1] || "",
            whatsapp: row[2] || ""
          }))
          .filter(g => typeof g.name === 'string' && g.name.trim() !== "");

        if (guestData.length === 0) {
          showNotification("Tidak ada data tamu yang valid ditemukan.", "error");
          setIsImporting(false);
          if (fileInputRef.current) fileInputRef.current.value = "";
          return;
        }

        let successCount = 0;
        for (const g of guestData) {
          try {
            await addDoc(collection(db, "guests"), {
              name: g.name.trim(),
              jabatan: g.jabatan.toString().trim(),
              whatsapp: formatWhatsApp(g.whatsapp.toString().trim()),
              status: "Pending",
              consumerId: guestFilter === 'all' ? null : guestFilter,
              userId: guestFilter === 'all' ? null : guestFilter, // Set userId
              createdAt: serverTimestamp()
            });
            successCount++;
          } catch (err) {
            console.error(`Gagal menambah tamu ${g.name}:`, err);
          }
        }

        showNotification(`Berhasil mengimpor ${successCount} tamu!`);
      } catch (err) {
        console.error("Import error:", err);
        showNotification("Gagal mengimpor file Excel", "error");
      } finally {
        setIsImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsBinaryString(file);
  };

  if (!user) {
    return (
      <div className="fixed inset-0 z-[200] bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-2xl border border-slate-100 text-center">
          <Heart size={32} className="text-rose-500 mx-auto mb-6" />
          <h2 className="text-3xl font-serif text-slate-900 mb-4">Admin CMS</h2>
          <p className="text-sm text-slate-500 mb-8">Silakan masuk untuk mengelola sistem undangan digital.</p>
          <button 
            onClick={handleLogin}
            disabled={isLoggingIn}
            className={`w-full py-4 bg-rose-500 text-white rounded-2xl font-bold tracking-widest text-xs flex items-center justify-center gap-3 transition-opacity ${isLoggingIn ? 'opacity-50 cursor-not-allowed' : 'hover:bg-rose-600'}`}
          >
            {isLoggingIn ? 'MENGHUBUNGKAN...' : 'MASUK DENGAN GOOGLE'}
          </button>
          <button onClick={onClose} className="mt-6 text-xs text-slate-400 hover:text-rose-500 underline">Kembali ke Beranda</button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="fixed inset-0 z-[200] bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-2xl border border-slate-100 text-center">
          <Heart size={32} className="text-rose-500 mx-auto mb-6" />
          <h2 className="text-3xl font-serif text-slate-900 mb-4">Akses Ditolak</h2>
          <p className="text-sm text-slate-500 mb-8">Maaf, akun {user.email} tidak memiliki akses admin.</p>
          <button onClick={() => signOut(auth)} className="w-full py-4 bg-rose-500 text-white rounded-2xl font-bold tracking-widest text-xs">KELUAR</button>
          <button onClick={onClose} className="mt-6 text-xs text-slate-400 hover:text-rose-500 underline">Kembali ke Beranda</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] bg-slate-50 overflow-y-auto">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 md:mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-serif text-slate-900 tracking-tight">Admin Dashboard</h2>
            <p className="text-xs md:text-sm text-slate-500">Selamat datang kembali, {user.displayName}</p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <AnimatePresence>
              {notification && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`px-3 py-1.5 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-widest hidden md:block ${
                    notification.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}
                >
                  {notification.message}
                </motion.div>
              )}
            </AnimatePresence>
            <button onClick={() => signOut(auth)} className="flex-1 md:flex-none px-4 md:px-6 py-2 border border-slate-200 rounded-xl md:rounded-full text-[10px] md:text-xs font-bold text-slate-500 hover:bg-slate-100 transition-colors uppercase tracking-widest">KELUAR</button>
            <button onClick={onClose} className="flex-1 md:flex-none px-4 md:px-6 py-2 bg-slate-900 text-white rounded-xl md:rounded-full text-[10px] md:text-xs font-bold hover:bg-slate-800 transition-colors uppercase tracking-widest">TUTUP</button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-white p-2 rounded-2xl shadow-sm border border-slate-100 w-full overflow-x-auto no-scrollbar">
          <div className="flex gap-2">
            {[
              { id: 'dashboard', label: 'Ringkasan', icon: LayoutDashboard },
              { id: 'invitations', label: 'Undangan', icon: FileText },
              { id: 'consumers', label: 'Konsumen', icon: UserPlus },
              { id: 'guests', label: 'Tamu', icon: Users },
              { id: 'messages', label: 'Ucapan', icon: MessageSquare },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setSearchQuery("");
                }}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === tab.id ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 min-h-[600px]">
              {activeTab === 'dashboard' && (
                <div className="space-y-12">
                  <div>
                    <h3 className="text-2xl font-serif text-slate-900 mb-6">Analistik Situs</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                          <FileText size={48} />
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Konversi Undangan</p>
                        <h4 className="text-4xl font-serif text-slate-900">{invitations.length}</h4>
                        <div className="mt-4 flex items-center gap-2 text-[10px] text-green-600 font-bold uppercase tracking-widest">
                          <PieChart size={12} /> Aktif & Live
                        </div>
                      </div>
                      
                      <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                          <Users size={48} />
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Total RSVP Hadir</p>
                        <h4 className="text-4xl font-serif text-slate-900">
                          {guests.filter(g => g.status === 'Hadir').length}
                        </h4>
                        <div className="mt-4 flex items-center gap-2 text-[10px] text-rose-500 font-bold uppercase tracking-widest">
                          <Users size={12} /> {guests.filter(g => g.status === 'Hadir').reduce((acc, g) => acc + (g.totalGuests || 0), 0)} orang total
                        </div>
                      </div>

                      <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                          <MessageSquare size={48} />
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Pesan Ucapan</p>
                        <h4 className="text-4xl font-serif text-slate-900">{messages.length}</h4>
                        <div className="mt-4 flex items-center gap-2 text-[10px] text-blue-500 font-bold uppercase tracking-widest">
                          <MessageSquare size={12} /> Dari Semua Tamu
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <h4 className="text-lg font-serif text-slate-900">Aktivitas Terbaru</h4>
                      <div className="space-y-4">
                        {messages.slice(0, 5).map(msg => (
                          <div key={msg.id} className="flex gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-rose-500 border border-slate-100 shadow-sm shrink-0">
                              <MessageSquare size={16} />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-900">{msg.name}</p>
                              <p className="text-[10px] text-slate-500 line-clamp-1 italic mb-1">"{msg.message}"</p>
                              <p className="text-[9px] text-slate-400 font-bold uppercase">{msg.createdAt?.toDate() ? new Date(msg.createdAt.toDate()).toLocaleDateString() : '-'}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <h4 className="text-lg font-serif text-slate-900">Undangan Baru</h4>
                      <div className="space-y-4">
                        {invitations.slice(0, 5).map(inv => (
                          <div key={inv.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="flex gap-4 items-center">
                              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-rose-500 border border-slate-100 shadow-sm shrink-0 uppercase font-bold text-xs">
                                {inv.templateId[0]}
                              </div>
                              <div>
                                <p className="text-xs font-bold text-slate-900">{inv.brideName.split(' ')[0]} & {inv.groomName.split(' ')[0]}</p>
                                <p className="text-[10px] text-slate-500 font-mono tracking-tight">{inv.slug}</p>
                              </div>
                            </div>
                            <a href={`/v/${inv.slug}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-white text-slate-400 hover:text-rose-500 rounded-lg border border-slate-100 transition-colors">
                              <ExternalLink size={14} />
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'guests' && (
                <div className="space-y-8">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <h3 className="text-xl font-serif text-slate-900">Manajemen Tamu</h3>
                      <select 
                        value={guestFilter}
                        onChange={(e) => setGuestFilter(e.target.value)}
                        className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-600 focus:outline-none"
                      >
                        <option value="all">Semua Konsumen</option>
                        {consumers.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={handleExportGuests}
                        className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-[10px] font-bold flex items-center gap-2 hover:bg-slate-50 transition-colors"
                        title="Ekspor Laporan Tamu"
                      >
                        <PieChart size={14} />
                        EKSPOR LAPORAN
                      </button>
                      <button 
                        onClick={() => fileInputRef.current?.click()} 
                        disabled={isImporting}
                        className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-[10px] font-bold flex items-center gap-2 hover:bg-slate-50 transition-colors"
                      >
                        <FileSpreadsheet size={14} />
                        {isImporting ? 'MENGIMPOR...' : 'IMPORT EXCEL'}
                      </button>
                      <button 
                        onClick={downloadTemplate}
                        className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-[10px] font-bold flex items-center gap-2 hover:bg-slate-50 transition-colors"
                        title="Unduh Template Excel"
                      >
                        <Download size={14} />
                      </button>
                      {guests.length > 0 && (
                        <button 
                          onClick={() => {
                            const filtered = guests
                              .filter(g => guestFilter === 'all' || g.consumerId === guestFilter)
                              .filter(g => g.name.toLowerCase().includes(searchQuery.toLowerCase()));
                            
                            setConfirmDialog({
                              isOpen: true,
                              message: `Hapus seluruh ${filtered.length} tamu yang tampil saat ini? Tindakan ini tidak dapat dibatalkan.`,
                              onConfirm: async () => {
                                setIsDeleting(true);
                                try {
                                  for (const guest of filtered) {
                                    await deleteDoc(doc(db, 'guests', guest.id));
                                  }
                                  showNotification(`${filtered.length} tamu berhasil dihapus`);
                                } catch (err) {
                                  handleFirestoreError(err, OperationType.DELETE, "guests");
                                } finally {
                                  setIsDeleting(false);
                                  setConfirmDialog(null);
                                }
                              }
                            });
                          }}
                          className="px-4 py-2 border border-red-100 text-red-600 rounded-xl text-[10px] font-bold flex items-center gap-2 hover:bg-red-50 transition-colors"
                          title="Hapus Semua Tamu"
                        >
                          <Trash2 size={14} />
                          HAPUS SEMUA
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-6">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari nama tamu..."
                        className="w-full pl-12 pr-6 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none text-sm"
                      />
                    </div>

                    <div className="flex flex-col gap-4 p-6 bg-slate-50 border border-slate-100 rounded-[2rem]">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase px-2">Nama Tamu &ast;</label>
                          <input 
                            type="text" 
                            value={newGuestName}
                            onChange={(e) => setNewGuestName(e.target.value)}
                            placeholder="Contoh: Budi Santoso"
                            className="w-full px-6 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none text-sm shadow-sm"
                          />
                        </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase px-2">Jabatan (Opsional)</label>
                        <input 
                          type="text" 
                          value={newGuestJabatan}
                          onChange={(e) => setNewGuestJabatan(e.target.value)}
                          placeholder="Contoh: Manager"
                          className="w-full px-6 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none text-sm shadow-sm"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase px-2">Nomor WhatsApp &ast;</label>
                        <input 
                          type="tel" 
                          value={newGuestWhatsApp}
                          onChange={(e) => setNewGuestWhatsApp(e.target.value)}
                          placeholder="Contoh: 08123456789"
                          className="w-full px-6 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none text-sm shadow-sm"
                        />
                      </div>
                    </div>
                    <button 
                      onClick={handleAddGuest} 
                      disabled={!newGuestName.trim() || !newGuestWhatsApp.trim()}
                      className="w-full md:w-auto self-end px-12 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                    >
                      TAMBAH TAMU
                    </button>
                  </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-slate-100">
                          <th className="py-4 font-serif italic opacity-50">Nama</th>
                          <th className="py-4 font-serif italic opacity-50">Status</th>
                          <th className="py-4 font-serif italic opacity-50">Tamu</th>
                          <th className="py-4 font-serif italic opacity-50">Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {guests
                          .filter(g => guestFilter === 'all' || g.consumerId === guestFilter)
                          .filter(g => g.name.toLowerCase().includes(searchQuery.toLowerCase()))
                          .map(guest => (
                          <tr key={guest.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                            <td className="py-4 font-medium">
                              {editingGuestId === guest.id ? (
                                <div className="flex gap-2">
                                  <input 
                                    type="text" 
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="px-2 py-1 border border-slate-200 rounded text-xs"
                                    autoFocus
                                  />
                                  <button onClick={() => handleSaveEdit(guest.id)} className="text-green-600 font-bold text-[10px]">SIMPAN</button>
                                  <button onClick={() => setEditingGuestId(null)} className="text-gray-400 font-bold text-[10px]">BATAL</button>
                                </div>
                              ) : (
                                <div className="flex flex-col gap-0.5 group/name">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-slate-900">{guest.name}</span>
                                    <button 
                                      onClick={() => handleStartEdit(guest)}
                                      className="opacity-0 group-hover/name:opacity-100 text-[10px] text-rose-500 hover:underline"
                                    >
                                      Edit
                                    </button>
                                  </div>
                                  {(guest.jabatan || guest.whatsapp) && (
                                    <span className="text-[10px] text-slate-400 flex items-center gap-2">
                                      <span>{guest.jabatan} {guest.jabatan && guest.whatsapp && ' • '} {guest.whatsapp}</span>
                                      {guest.isSent && (
                                        <span className="text-[8px] font-bold text-emerald-500 bg-emerald-50 px-1 py-0.5 rounded flex items-center gap-0.5 uppercase tracking-wider">
                                          <Check size={8} /> Terkirim
                                        </span>
                                      )}
                                    </span>
                                  )}
                                </div>
                              )}
                            </td>
                            <td className="py-4">
                              <select 
                                value={guest.status}
                                onChange={(e) => handleUpdateGuestStatus(guest.id, e.target.value)}
                                className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase appearance-none cursor-pointer focus:outline-none ${
                                  guest.status === 'Hadir' ? 'bg-green-100 text-green-700' : 
                                  guest.status === 'Tidak Hadir' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                                }`}
                              >
                                <option value="Pending">Pending</option>
                                <option value="Hadir">Hadir</option>
                                <option value="Tidak Hadir">Tidak Hadir</option>
                              </select>
                            </td>
                            <td className="py-4">
                              {editingGuestId === guest.id ? (
                                <input 
                                  type="number" 
                                  value={editTotal}
                                  onChange={(e) => setEditTotal(e.target.value)}
                                  className="w-16 px-2 py-1 border border-slate-200 rounded text-xs"
                                />
                              ) : (
                                <span>{guest.totalGuests || '-'}</span>
                              )}
                            </td>
                            <td className="py-4">
                              <div className="flex items-center gap-3">
                                <button onClick={() => copyLink(guest.name)} className="text-slate-400 hover:text-rose-500 transition-colors" title="Salin Link">
                                  <Copy size={14} />
                                </button>
                                <button onClick={(e) => handleDeleteItem(e, 'guests', guest.id)} className="text-slate-400 hover:text-red-500 transition-colors" title="Hapus Tamu">
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'messages' && (
                <div className="space-y-8">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-serif text-slate-900">Semua Ucapan</h3>
                    <button 
                      onClick={() => {
                        setConfirmDialog({
                          isOpen: true,
                          message: "Hapus semua pesan ucapan? Tindakan ini tidak dapat dibatalkan.",
                          onConfirm: async () => {
                            for (const msg of messages) {
                              await deleteDoc(doc(db, 'messages', msg.id));
                            }
                            showNotification("Semua pesan dikosongkan");
                            setConfirmDialog(null);
                          }
                        });
                      }}
                      className="px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50 rounded-xl border border-red-100 transition-colors"
                    >
                      KOSONGKAN SEMUA
                    </button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    {messages.map(msg => (
                      <div key={msg.id} className="p-6 bg-slate-50 rounded-3xl relative group border border-slate-100">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h5 className="text-sm font-bold text-slate-900">{msg.name}</h5>
                            <p className="text-[10px] text-slate-400">{msg.createdAt?.toDate().toLocaleDateString()}</p>
                          </div>
                          <button onClick={(e) => handleDeleteItem(e, 'messages', msg.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <p className="text-xs text-slate-600 italic leading-relaxed">"{msg.message}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'invitations' && (
                <div className="space-y-8">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-serif text-slate-900">Manajemen Undangan</h3>
                    <div className="relative w-72">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari undangan..."
                        className="w-full pl-12 pr-6 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none text-sm"
                      />
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-slate-100">
                          <th className="py-4 font-serif italic opacity-50">Mempelai</th>
                          <th className="py-4 font-serif italic opacity-50">Slug / URL</th>
                          <th className="py-4 font-serif italic opacity-50">Template</th>
                          <th className="py-4 font-serif italic opacity-50">Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invitations
                          .filter(inv => 
                            inv.brideName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            inv.groomName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            inv.slug.toLowerCase().includes(searchQuery.toLowerCase())
                          )
                          .map(inv => (
                          <tr key={inv.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                            <td className="py-4">
                              {editingInvitationId === inv.id ? (
                                <div className="space-y-2">
                                  <input 
                                    type="text" 
                                    value={editInvitation.brideName}
                                    onChange={(e) => setEditInvitation(prev => ({ ...prev, brideName: e.target.value }))}
                                    className="w-full px-2 py-1 border border-slate-200 rounded text-xs"
                                    placeholder="Nama Mempelai Wanita"
                                  />
                                  <input 
                                    type="text" 
                                    value={editInvitation.groomName}
                                    onChange={(e) => setEditInvitation(prev => ({ ...prev, groomName: e.target.value }))}
                                    className="w-full px-2 py-1 border border-slate-200 rounded text-xs"
                                    placeholder="Nama Mempelai Pria"
                                  />
                                </div>
                              ) : (
                                <>
                                  <p className="font-bold text-slate-900">{inv.brideName} & {inv.groomName}</p>
                                  <p className="text-[10px] text-slate-400">{inv.weddingDate?.toDate() ? new Date(inv.weddingDate.toDate()).toLocaleDateString() : '-'}</p>
                                </>
                              )}
                            </td>
                            <td className="py-4">
                              {editingInvitationId === inv.id ? (
                                <input 
                                  type="text" 
                                  value={editInvitation.slug}
                                  onChange={(e) => setEditInvitation(prev => ({ ...prev, slug: e.target.value }))}
                                  className="w-full px-2 py-1 border border-slate-200 rounded text-xs"
                                />
                              ) : (
                                <span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-mono text-slate-600">{inv.slug}</span>
                              )}
                            </td>
                            <td className="py-4">
                              <span className="text-xs capitalize">{inv.templateId}</span>
                            </td>
                            <td className="py-4">
                              <div className="flex items-center gap-3">
                                {editingInvitationId === inv.id ? (
                                  <>
                                    <button onClick={() => handleSaveEditInvitation(inv.id)} className="text-green-600 font-bold text-[10px]">SIMPAN</button>
                                    <button onClick={() => setEditingInvitationId(null)} className="text-gray-400 font-bold text-[10px]">BATAL</button>
                                  </>
                                ) : (
                                  <>
                                    <button onClick={() => handleStartEditInvitation(inv)} className="text-slate-400 hover:text-rose-500 transition-colors" title="Edit Undangan">
                                      <Copy size={14} className="rotate-90" />
                                    </button>
                                    <a 
                                      href={`/v/${inv.slug}`} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-slate-400 hover:text-rose-500 transition-colors"
                                    >
                                      <ExternalLink size={14} />
                                    </a>
                                    <button onClick={(e) => handleDeleteItem(e, 'invitations', inv.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                                      <Trash2 size={14} />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'consumers' && (
                <div className="space-y-8">
                  <h3 className="text-xl font-serif text-slate-900">Manajemen Konsumen</h3>
                  
                  <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
                    <h4 className="text-sm font-bold mb-6 flex items-center gap-2">
                      <UserPlus size={16} className="text-rose-500" />
                      Daftarkan Konsumen Baru
                    </h4>
                    <div className="grid md:grid-cols-3 gap-4">
                      <input 
                        type="text" 
                        value={newConsumer.name}
                        onChange={(e) => setNewConsumer(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Nama Lengkap"
                        className="px-6 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none text-sm"
                      />
                      <input 
                        type="email" 
                        value={newConsumer.email}
                        onChange={(e) => setNewConsumer(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="Email / Username"
                        className="px-6 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none text-sm"
                      />
                      <input 
                        type="text" 
                        value={newConsumer.password}
                        onChange={(e) => setNewConsumer(prev => ({ ...prev, password: e.target.value }))}
                        placeholder="Password"
                        className="px-6 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none text-sm"
                      />
                    </div>
                    <button 
                      onClick={handleAddConsumer}
                      className="mt-6 px-10 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all"
                    >
                      BUAT AKUN KONSUMEN
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-slate-100">
                          <th className="py-4 font-serif italic opacity-50">Nama</th>
                          <th className="py-4 font-serif italic opacity-50">Email / Username</th>
                          <th className="py-4 font-serif italic opacity-50">Password</th>
                          <th className="py-4 font-serif italic opacity-50">Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {consumers.map(c => (
                          <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                            <td className="py-4 font-bold text-slate-900">
                              {editingConsumerId === c.id ? (
                                <input 
                                  type="text" 
                                  value={editConsumer.name}
                                  onChange={(e) => setEditConsumer(prev => ({ ...prev, name: e.target.value }))}
                                  className="px-2 py-1 border border-slate-200 rounded text-xs"
                                />
                              ) : (
                                c.name
                              )}
                            </td>
                            <td className="py-4 text-slate-600">
                              {editingConsumerId === c.id ? (
                                <input 
                                  type="text" 
                                  value={editConsumer.email}
                                  onChange={(e) => setEditConsumer(prev => ({ ...prev, email: e.target.value }))}
                                  className="px-2 py-1 border border-slate-200 rounded text-xs"
                                />
                              ) : (
                                c.email
                              )}
                            </td>
                            <td className="py-4">
                              {editingConsumerId === c.id ? (
                                <input 
                                  type="text" 
                                  value={editConsumer.password}
                                  onChange={(e) => setEditConsumer(prev => ({ ...prev, password: e.target.value }))}
                                  className="px-2 py-1 border border-slate-200 rounded text-xs"
                                />
                              ) : (
                                <span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-mono text-slate-500">{c.password}</span>
                              )}
                            </td>
                            <td className="py-4">
                              <div className="flex items-center gap-3">
                                {editingConsumerId === c.id ? (
                                  <>
                                    <button onClick={() => handleSaveEditConsumer(c.id)} className="text-green-600 font-bold text-[10px]">SIMPAN</button>
                                    <button onClick={() => setEditingConsumerId(null)} className="text-gray-400 font-bold text-[10px]">BATAL</button>
                                  </>
                                ) : (
                                  <>
                                    <button onClick={() => handleStartEditConsumer(c)} className="text-slate-400 hover:text-rose-500 transition-colors" title="Edit Konsumen">
                                      <Copy size={14} className="rotate-90" />
                                    </button>
                                    <button onClick={(e) => handleDeleteItem(e, 'consumers', c.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                                      <Trash2 size={14} />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Stats */}
          <div className="space-y-8">
            <div className="bg-rose-500 text-white p-8 rounded-[2rem] shadow-xl shadow-rose-500/20">
              <h3 className="text-xl font-serif mb-6">Ringkasan</h3>
              <div className="space-y-4">
                <div className="bg-white/10 p-4 rounded-2xl">
                  <p className="text-[10px] uppercase tracking-widest opacity-60 mb-1">Total Undangan</p>
                  <p className="text-2xl font-serif">{invitations.length}</p>
                </div>
                <div className="bg-white/10 p-4 rounded-2xl">
                  <p className="text-[10px] uppercase tracking-widest opacity-60 mb-1">Total Konsumen</p>
                  <p className="text-2xl font-serif">{consumers.length}</p>
                </div>
                <div className="bg-white/10 p-4 rounded-2xl">
                  <p className="text-[10px] uppercase tracking-widest opacity-60 mb-1">Total Tamu</p>
                  <p className="text-2xl font-serif">{guests.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
              <h3 className="text-xl font-serif text-slate-900 mb-6">Info Admin</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                    <Users size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Role</p>
                    <p className="text-xs font-bold text-slate-900">Super Admin</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                    <FileText size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Status Sistem</p>
                    <p className="text-xs font-bold text-green-500">Online</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleImportExcel} 
        accept=".xlsx, .xls, .csv" 
        className="hidden" 
      />

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmDialog?.isOpen && (
          <div className="fixed inset-0 z-[300] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center"
            >
              <h3 className="text-xl font-serif text-slate-900 mb-4">Konfirmasi Hapus</h3>
              <p className="text-sm text-slate-500 mb-8">{confirmDialog.message}</p>
              <div className="flex gap-4 justify-center">
                <button 
                  onClick={() => !isDeleting && setConfirmDialog(null)}
                  disabled={isDeleting}
                  className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors disabled:opacity-50"
                >
                  BATAL
                </button>
                <button 
                  onClick={confirmDialog.onConfirm}
                  disabled={isDeleting}
                  className="px-6 py-3 bg-red-500 text-white rounded-xl text-xs font-bold hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      MENGHAPUS...
                    </>
                  ) : 'HAPUS'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CMS;
