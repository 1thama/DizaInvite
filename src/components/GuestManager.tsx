import React, { useState, useEffect, useRef } from 'react';
import { db, collection, query, where, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc, handleFirestoreError, OperationType, auth, onAuthStateChanged, signInAnonymously, updateDoc, orderBy } from '../firebase';
import { motion, AnimatePresence } from 'motion/react';
import { 
  UserPlus, Trash2, ExternalLink, Copy, Search, UserCheck, 
  UserMinus, Clock, Users, Check, FileSpreadsheet, Download, 
  PieChart, RefreshCw, X, MessageSquare, Quote, MessageCircle
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface GuestManagerProps {
  invitationId: string;
  slug: string;
  userId?: string;
  onClose: () => void;
}

const GuestManager: React.FC<GuestManagerProps> = ({ invitationId, slug, userId, onClose }) => {
  const [guests, setGuests] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'guests' | 'guestbook'>('guests');
  const [newGuestName, setNewGuestName] = useState('');
  const [newGuestJabatan, setNewGuestJabatan] = useState('');
  const [newGuestWhatsApp, setNewGuestWhatsApp] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [waStyle, setWaStyle] = useState<'formal' | 'standard' | 'casual'>('standard');
  const [isAdding, setIsAdding] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [guestToDelete, setGuestToDelete] = useState<string | null>(null);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let unsubscribeGuests: () => void;
    let unsubscribeMessages: () => void;
    
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        try {
          await signInAnonymously(auth);
        } catch (err) {
          console.error("GuestManager auto sign-in failed:", err);
        }
      } else {
        // Sync authUid for safety
        try {
          const consumerData = localStorage.getItem('consumer_user');
          if (consumerData) {
            const parsed = JSON.parse(consumerData);
            await updateDoc(doc(db, "consumers", parsed.id), { authUid: user.uid });
          }
        } catch (e) {
          // Silently fail sync if not allowed, but rules should allow it now
        }
      }
      
      if (!invitationId) return;

      const qGuests = query(collection(db, "guests"), where("invitationId", "==", invitationId));
      unsubscribeGuests = onSnapshot(qGuests, (snapshot) => {
        setGuests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }, (err) => handleFirestoreError(err, OperationType.LIST, "guests"));

      const qMessages = query(collection(db, "messages"), where("invitationId", "==", invitationId), orderBy("createdAt", "desc"));
      unsubscribeMessages = onSnapshot(qMessages, (snapshot) => {
        setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }, (err) => handleFirestoreError(err, OperationType.LIST, "messages"));
    });

    return () => {
      if (unsubscribeAuth) unsubscribeAuth();
      if (unsubscribeGuests) unsubscribeGuests();
      if (unsubscribeMessages) unsubscribeMessages();
    };
  }, [invitationId]);

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

  const handleAddGuest = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newGuestName.trim() || !newGuestWhatsApp.trim()) {
      if (!newGuestWhatsApp.trim() && newGuestName.trim()) {
        showNotification("Nomor WhatsApp wajib diisi", "error");
      }
      return;
    }

    setIsAdding(true);
    try {
      await addDoc(collection(db, "guests"), {
        name: newGuestName.trim(),
        jabatan: newGuestJabatan.trim(),
        whatsapp: formatWhatsApp(newGuestWhatsApp.trim()),
        status: 'Pending',
        invitationId: invitationId,
        userId: userId, // Add userId for easier rules
        createdAt: serverTimestamp()
      });
      setNewGuestName('');
      setNewGuestJabatan('');
      setNewGuestWhatsApp('');
      showNotification("Tamu berhasil ditambahkan");
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, "guests");
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteGuest = async (id: string) => {
    try {
      await deleteDoc(doc(db, "guests", id));
      showNotification("Tamu berhasil dihapus");
      setGuestToDelete(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, "guests");
    }
  };

  const handleDeleteMessage = async (id: string) => {
    try {
      await deleteDoc(doc(db, "messages", id));
      showNotification("Pesan berhasil dihapus");
      setMessageToDelete(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, "messages");
    }
  };

  const handleDeleteAllGuests = async () => {
    setIsDeletingAll(true);
    try {
      const gToDelete = [...guests];
      for (const guest of gToDelete) {
        await deleteDoc(doc(db, "guests", guest.id));
      }
      showNotification(`Berhasil menghapus ${gToDelete.length} tamu`);
      setShowDeleteAllConfirm(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, "guests");
    } finally {
      setIsDeletingAll(false);
    }
  };

  const handleSendWhatsApp = async (guest: any, guestUrl: string) => {
    if (!guest.whatsapp) {
      showNotification("Nomor WhatsApp tidak tersedia", "error");
      return;
    }

    let message = "";
    
    if (waStyle === 'formal') {
      message = `Assalamu’alaikum Wr. Wb. / Salam Sejahtera,

Yth. ${guest.name},

Tanpa mengurangi rasa hormat, perkenankan kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri acara pernikahan kami. Merupakan suatu kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.

Informasi lengkap mengenai acara dapat diakses melalui tautan undangan digital berikut:
${guestUrl}

Atas perhatian dan kehadirannya, kami ucapkan terima kasih.`;
    } else if (waStyle === 'casual') {
      message = `Halo ${guest.name}! 😊

Apa kabar? Semoga sehat selalu ya. 

Kami ingin berbagi kabar bahagia dan mengundang kamu hadir di acara pernikahan kami. Kehadiranmu sangat berarti banget buat melengkapi momen spesial kami nanti.

Detail acaranya bisa cek di link undangan ini ya:
${guestUrl}

Makasih banyak ya, sampai ketemu di sana!`;
    } else {
      // Standard
      message = `Halo ${guest.name},

Tanpa mengurangi rasa hormat, kami mengundang Bapak/Ibu/Saudara/i untuk hadir di acara pernikahan kami.

Berikut link undangan digital kami:
${guestUrl}

Terima kasih.`;
    }

    const encodedMessage = encodeURIComponent(message);
    const waUrl = `https://wa.me/${guest.whatsapp.replace(/\D/g, '')}?text=${encodedMessage}`;
    
    window.open(waUrl, '_blank');

    // Update sent status
    try {
      await updateDoc(doc(db, "guests", guest.id), {
        isSent: true,
        sentAt: serverTimestamp()
      });
    } catch (err) {
      console.error("Failed to update sent status:", err);
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
              invitationId: invitationId,
              userId: userId, // Add userId
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

  const downloadTemplate = () => {
    const data = [
      ["NAMA TAMU", "JABATAN", "NOMOR WHATSAPP"],
      ["Bapak Budi", "Kepala Desa", "081234567890"],
      ["Ibu Siti", "Sekretaris", "089876543210"]
    ];
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "Template_Tamu_DizaInvite.xlsx");
  };

  const handleExportGuests = () => {
    const data = guests.map(g => ({
      'Nama Tamu': g.name,
      'Jabatan': g.jabatan || '-',
      'Nomor WhatsApp': g.whatsapp || '-',
      'Status': g.status,
      'Jumlah Orang': g.totalGuests || 1,
      'Ucapan': g.message || '-'
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Daftar Tamu");
    XLSX.writeFile(wb, `Laporan_Tamu_${slug}.xlsx`);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(id);
    setTimeout(() => setCopySuccess(null), 2000);
  };

  const filteredGuests = guests.filter(g => 
    g.name.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

  const filteredMessages = messages.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.message.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

  const stats = {
    total: guests.length,
    hadir: guests.filter(g => g.status === 'Hadir').length,
    tidakHadir: guests.filter(g => g.status === 'Tidak Hadir').length,
    pending: guests.filter(g => g.status === 'Pending').length,
    totalOrang: guests.filter(g => g.status === 'Hadir').reduce((acc, g) => acc + (g.totalGuests || 0), 0),
    totalPesan: messages.length
  };

  const baseUrl = window.location.origin;

  return (
    <div className="fixed inset-0 z-50 bg-white md:bg-slate-900/60 md:backdrop-blur-sm flex items-center justify-center md:p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.98, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white w-full max-w-4xl h-full md:h-[90vh] md:rounded-[2.5rem] md:shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="p-5 md:p-8 border-b border-slate-100 flex flex-col gap-6 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-rose-500 rounded-xl md:rounded-2xl shrink-0 flex items-center justify-center shadow-lg shadow-rose-500/20 text-white">
                {activeTab === 'guests' ? <Users size={20} className="md:w-6 md:h-6" /> : <MessageSquare size={20} className="md:w-6 md:h-6" />}
              </div>
              <div className="overflow-hidden">
                <h2 className="text-lg md:text-2xl font-serif text-slate-900 truncate">
                  {activeTab === 'guests' ? 'Database Tamu' : 'Buku Tamu'}
                </h2>
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className="text-[9px] md:text-[10px] text-rose-500 font-bold uppercase tracking-widest truncate">{slug}</span>
                  <span className="hidden xs:block w-1 h-1 bg-slate-300 rounded-full shrink-0" />
                  <span className="hidden xs:block text-[9px] md:text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none truncate">Console</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <AnimatePresence>
                {notification && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-sm border ${
                      notification.type === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                    }`}
                  >
                    {notification.message}
                  </motion.div>
                )}
              </AnimatePresence>
              <button 
                onClick={onClose}
                className="p-3 hover:bg-slate-200 rounded-2xl transition-colors text-slate-400"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex p-1.5 bg-slate-200/50 rounded-2xl w-fit">
            <button 
              onClick={() => setActiveTab('guests')}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                activeTab === 'guests' ? 'bg-white text-rose-500 shadow-sm ring-1 ring-slate-900/5' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Daftar Tamu
            </button>
            <button 
              onClick={() => setActiveTab('guestbook')}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                activeTab === 'guestbook' ? 'bg-white text-rose-500 shadow-sm ring-1 ring-slate-900/5' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Ucapan / Doa
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar space-y-6 md:space-y-8">
          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
            {activeTab === 'guests' ? [
              { label: 'Total Undangan', value: stats.total, color: 'blue', icon: Users },
              { label: 'RSVP Hadir', value: stats.hadir, color: 'emerald', icon: UserCheck },
              { label: 'Tdk Hadir', value: stats.tidakHadir, color: 'rose', icon: UserMinus },
              { label: 'Pending', value: stats.pending, color: 'amber', icon: Clock },
              { label: 'Total Orang', value: stats.totalOrang, color: 'indigo', icon: Users },
            ].map((stat, i) => (
              <div key={i} className={`p-4 md:p-5 bg-${stat.color}-50 rounded-2xl md:rounded-[1.5rem] border border-${stat.color}-100 relative overflow-hidden group`}>
                <div className="absolute top-0 right-0 p-2 md:p-3 opacity-10 group-hover:scale-110 transition-transform">
                  <stat.icon size={20} className="md:w-6 md:h-6" />
                </div>
                <p className={`text-[8px] md:text-[10px] uppercase tracking-widest font-bold text-${stat.color}-600/60 mb-1 md:mb-2`}>{stat.label}</p>
                <h4 className={`text-xl md:text-2xl font-serif text-${stat.color}-700`}>{stat.value}</h4>
              </div>
            )) : (
              <div className="col-span-full flex gap-4">
                {[
                  { label: 'Total Ucapan', value: stats.totalPesan, color: 'rose', icon: MessageSquare },
                ].map((stat, i) => (
                  <div key={i} className={`p-4 md:p-5 bg-${stat.color}-50 rounded-2xl md:rounded-[1.5rem] border border-${stat.color}-100 relative overflow-hidden group min-w-[200px]`}>
                    <div className="absolute top-0 right-0 p-2 md:p-3 opacity-10 group-hover:scale-110 transition-transform">
                      <stat.icon size={20} className="md:w-6 md:h-6" />
                    </div>
                    <p className={`text-[8px] md:text-[10px] uppercase tracking-widest font-bold text-${stat.color}-600/60 mb-1 md:mb-2`}>{stat.label}</p>
                    <h4 className={`text-xl md:text-2xl font-serif text-${stat.color}-700`}>{stat.value}</h4>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Toolbar */}
          <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl border border-slate-100 shadow-sm space-y-4 md:space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6">
              <div className="flex items-center gap-2">
                <div className="w-1 h-6 bg-rose-500 rounded-full" />
                <h3 className="text-base md:text-lg font-serif text-slate-900">
                  {activeTab === 'guests' ? 'Alat Manajemen Tamu' : 'Cari Pesan'}
                </h3>
              </div>
              {activeTab === 'guests' && (
                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImportExcel} 
                    accept=".xlsx, .xls" 
                    className="hidden" 
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isImporting}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-[9px] font-bold hover:bg-slate-50 transition-all uppercase tracking-widest disabled:opacity-50"
                  >
                    <FileSpreadsheet size={14} className="text-emerald-500" />
                    IMPORT
                  </button>
                  <button 
                    onClick={downloadTemplate}
                    className="flex items-center justify-center p-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all"
                    title="Unduh Template Excel"
                  >
                    <Download size={16} className="text-blue-500" />
                  </button>
                  <button 
                    onClick={handleExportGuests}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-[9px] font-bold hover:bg-rose-100 transition-all uppercase tracking-widest"
                  >
                    <PieChart size={14} />
                    LAPORAN
                  </button>
                  {guests.length > 0 && (
                    <button 
                      onClick={() => setShowDeleteAllConfirm(true)}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-red-50 border border-red-100 text-red-600 rounded-xl text-[9px] font-bold hover:bg-red-100 transition-all uppercase tracking-widest"
                    >
                      <Trash2 size={14} />
                      HAPUS SEMUA
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-col md:flex-row gap-4 pt-4 md:pt-6 border-t border-slate-50">
              {/* Search Box */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={activeTab === 'guests' ? "Cari nama tamu..." : "Cari pengirim atau ucapan..."}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:border-rose-500 transition-all"
                />
              </div>

              {/* Add Guest Form */}
              {activeTab === 'guests' && (
                <div className="flex-[2]">
                  <form onSubmit={handleAddGuest} className="flex flex-col md:flex-row gap-3 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                      <input 
                        type="text" 
                        value={newGuestName}
                        onChange={(e) => setNewGuestName(e.target.value)}
                        placeholder="Nama Tamu *"
                        required
                        className="px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 transition-all text-sm"
                      />
                      <input 
                        type="text" 
                        value={newGuestJabatan}
                        onChange={(e) => setNewGuestJabatan(e.target.value)}
                        placeholder="Jabatan (Opsional)"
                        className="px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 transition-all text-sm"
                      />
                      <input 
                        type="tel" 
                        value={newGuestWhatsApp}
                        onChange={(e) => setNewGuestWhatsApp(e.target.value)}
                        placeholder="WhatsApp *"
                        required
                        className="px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 transition-all text-sm"
                      />
                    </div>
                    <button 
                      type="submit"
                      disabled={isAdding || !newGuestName.trim() || !newGuestWhatsApp.trim()}
                      className="md:w-auto px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap"
                    >
                      {isAdding ? <RefreshCw size={14} className="animate-spin" /> : <><UserPlus size={14} /> TAMBAH</>}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>

          {/* WhatsApp Message Options Box */}
          {activeTab === 'guests' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500">
                    <MessageSquare size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest leading-none mb-1">Opsi Kalimat Undangan</h3>
                    <p className="text-[10px] text-slate-400 font-medium">Pilih gaya bahasa yang sesuai untuk dikirim ke WhatsApp</p>
                  </div>
                </div>

                <div className="bg-slate-100/50 p-1.5 rounded-2xl flex items-center gap-1 w-full md:w-fit">
                  <div className="flex bg-white rounded-xl p-0.5 shadow-sm w-full md:w-auto">
                    <button 
                      onClick={() => setWaStyle('formal')}
                      className={`flex-1 md:flex-none px-4 md:px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${waStyle === 'formal' ? 'bg-rose-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      Formal
                    </button>
                    <button 
                      onClick={() => setWaStyle('standard')}
                      className={`flex-1 md:flex-none px-4 md:px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${waStyle === 'standard' ? 'bg-rose-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      Standar
                    </button>
                    <button 
                      onClick={() => setWaStyle('casual')}
                      className={`flex-1 md:flex-none px-4 md:px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${waStyle === 'casual' ? 'bg-rose-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      Santai
                    </button>
                  </div>
                </div>
              </div>

              {/* Preview Area */}
              <div className="relative group">
                <div className="absolute -top-2.5 left-6 bg-white px-3 py-0.5 border border-slate-100 rounded-full flex items-center gap-2">
                  <Quote size={10} className="text-rose-500" />
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Preview Kata-kata</span>
                </div>
                <div className="p-6 bg-slate-50 rounded-[1.5rem] border border-dashed border-slate-200 text-xs md:text-sm text-slate-500 leading-relaxed italic">
                  {waStyle === 'formal' ? (
                    "Assalamu’alaikum... Yth. [Nama Tamu], Tanpa mengurangi rasa hormat, perkenankan kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri..."
                  ) : waStyle === 'casual' ? (
                    "Halo [Nama Tamu]! 😊 Apa kabar? Semoga sehat selalu ya. Kami ingin berbagi kabar bahagia dan mengundang kamu hadir di acara pernikahan kami..."
                  ) : (
                    "Halo [Nama Tamu], Tanpa mengurangi rasa hormat, kami mengundang Bapak/Ibu/Saudara/i untuk hadir di acara pernikahan kami..."
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'guests' ? (
            /* Guest Table/List */
          <div className="bg-white rounded-2xl md:rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden min-h-[300px]">
             {/* Mobile Card Layout */}
             <div className="md:hidden divide-y divide-slate-50">
              {filteredGuests.length > 0 ? (
                filteredGuests.map((guest) => {
                  const guestUrl = `${baseUrl}/v/${slug}?to=${encodeURIComponent(guest.name)}&gid=${guest.id}`;
                  return (
                    <div key={guest.id} className="p-4 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-xs uppercase">
                            {guest.name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-800">{guest.name}</h4>
                            {(guest.jabatan || guest.whatsapp) && (
                              <p className="text-[10px] text-slate-400 leading-tight mb-1 flex items-center gap-2">
                                <span>{guest.jabatan} {guest.jabatan && guest.whatsapp && ' • '} {guest.whatsapp}</span>
                                {guest.isSent && (
                                  <span className="text-emerald-500 font-bold flex items-center gap-0.5 text-[8px] uppercase tracking-wider">
                                    <Check size={8} /> Terkirim
                                  </span>
                                )}
                                {guest.isOpened && (
                                  <span className="text-blue-500 font-bold flex items-center gap-0.5 text-[8px] uppercase tracking-wider">
                                    <Check size={8} /> Dibuka
                                  </span>
                                )}
                              </p>
                            )}
                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest text-[8px] ${
                              guest.status === 'Hadir' ? 'bg-emerald-50 text-emerald-600' :
                              guest.status === 'Tidak Hadir' ? 'bg-rose-50 text-rose-600' :
                              'bg-slate-50 text-slate-500'
                            }`}>
                              {guest.status}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={() => handleSendWhatsApp(guest, guestUrl)}
                            className={`p-2 transition-all ${guest.isSent ? 'text-emerald-500' : 'text-slate-400'}`}
                            title="Kirim WhatsApp"
                          >
                            <MessageCircle size={16} />
                          </button>
                          <button 
                            onClick={() => window.open(guestUrl, '_blank')}
                            className="p-2 text-slate-400 hover:text-rose-500"
                          >
                            <ExternalLink size={16} />
                          </button>
                          <button 
                            onClick={() => copyToClipboard(guestUrl, guest.id)}
                            className={`p-2 ${copySuccess === guest.id ? 'text-emerald-500' : 'text-slate-400'}`}
                          >
                            {copySuccess === guest.id ? <Check size={16} /> : <Copy size={16} />}
                          </button>
                          <button 
                            onClick={() => setGuestToDelete(guest.id)}
                            className="p-2 text-slate-400 hover:text-red-500"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 bg-slate-50 p-2 rounded-lg">
                        <span className="flex items-center gap-1 font-bold">
                          <Users size={12} /> {guest.totalGuests || 1} Pax
                        </span>
                        {guest.message && <span className="italic truncate max-w-[150px]">"{guest.message}"</span>}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-12 px-6 text-center text-slate-300 text-sm">Belum ada tamu</div>
              )}
            </div>

            {/* Desktop Table Layout */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] w-12 text-center">No</th>
                    <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Profil Tamu</th>
                    <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Status RSVP</th>
                    <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Pesan & Jumlah</th>
                    <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-right">Opsi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredGuests.length > 0 ? (
                    filteredGuests.map((guest, idx) => {
                      const guestUrl = `${baseUrl}/v/${slug}?to=${encodeURIComponent(guest.name)}&gid=${guest.id}`;
                      return (
                        <tr key={guest.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-6 py-5 text-center text-xs font-mono text-slate-300">{idx + 1}</td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-xs uppercase shadow-inner">
                                {guest.name.charAt(0)}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-sm font-bold text-slate-800">{guest.name}</span>
                                {guest.jabatan || guest.whatsapp ? (
                                  <span className="text-[10px] text-slate-400 flex items-center gap-2">
                                    <span>{guest.jabatan} {guest.jabatan && guest.whatsapp && ' • '} {guest.whatsapp}</span>
                                    {guest.isSent && (
                                      <span className="inline-flex items-center gap-0.5 text-emerald-500 font-bold px-1.5 py-0.5 bg-emerald-50 rounded-md text-[8px] uppercase tracking-wider">
                                        <Check size={8} /> Terkirim
                                      </span>
                                    )}
                                    {guest.isOpened && (
                                      <span className="inline-flex items-center gap-0.5 text-blue-500 font-bold px-1.5 py-0.5 bg-blue-50 rounded-md text-[8px] uppercase tracking-wider">
                                        <Check size={8} /> Dibuka
                                      </span>
                                    )}
                                  </span>
                                ) : null}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-xs">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold uppercase tracking-widest text-[9px] ${
                              guest.status === 'Hadir' ? 'bg-emerald-100 text-emerald-600' :
                              guest.status === 'Tidak Hadir' ? 'bg-rose-100 text-rose-600' :
                              'bg-slate-100 text-slate-500'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                guest.status === 'Hadir' ? 'bg-emerald-500' :
                                guest.status === 'Tidak Hadir' ? 'bg-rose-500' :
                                'bg-slate-400'
                              }`} />
                              {guest.status}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Users size={12} className="text-slate-400" />
                                <span className="text-xs font-bold text-slate-500">{guest.totalGuests || 1} Pax</span>
                              </div>
                              {guest.message && (
                                <p className="text-[10px] text-slate-400 italic line-clamp-1 max-w-[200px]">"{guest.message}"</p>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                              <button 
                                onClick={() => handleSendWhatsApp(guest, guestUrl)}
                                className={`p-2.5 bg-white border border-slate-100 rounded-xl shadow-sm transition-all ${guest.isSent ? 'text-emerald-500 bg-emerald-50/50' : 'text-slate-400 hover:text-emerald-500'}`}
                                title="Kirim WhatsApp"
                              >
                                <MessageCircle size={16} />
                              </button>
                              <button 
                                onClick={() => window.open(guestUrl, '_blank')}
                                className="p-2.5 bg-white border border-slate-100 text-slate-400 hover:text-rose-500 rounded-xl shadow-sm transition-all"
                                title="Buka Undangan"
                              >
                                <ExternalLink size={14} />
                              </button>
                              <button 
                                onClick={() => copyToClipboard(guestUrl, guest.id)}
                                className={`p-2.5 border border-slate-100 rounded-xl shadow-sm transition-all ${copySuccess === guest.id ? 'bg-emerald-100 text-emerald-600 border-emerald-200' : 'bg-white text-slate-400 hover:text-rose-500'}`}
                                title="Salin Link"
                              >
                                {copySuccess === guest.id ? <Check size={14} /> : <Copy size={14} />}
                              </button>
                              <button 
                                onClick={() => setGuestToDelete(guest.id)}
                                className="p-2.5 bg-white border border-slate-100 text-slate-400 hover:text-red-500 rounded-xl shadow-sm transition-all"
                                title="Hapus Data"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-24 text-center">
                        <div className="flex flex-col items-center gap-4 text-slate-300">
                          <Users size={48} className="opacity-20" />
                          <p className="text-sm font-medium">Database tamu kosong atau tidak ditemukan</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
            /* Guestbook Messages List */
            <div className="space-y-4">
              {filteredMessages.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  {filteredMessages.map((msg) => (
                    <motion.div 
                      layout
                      key={msg.id}
                      className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative group overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-all">
                        <button 
                          onClick={() => setMessageToDelete(msg.id)}
                          className="p-2 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-100 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-500">
                          <Quote size={16} />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-800">{msg.name}</h4>
                          <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                            {msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : 'Baru saja'}
                          </span>
                        </div>
                      </div>
                      <p className="text-slate-600 text-sm italic leading-relaxed">"{msg.message}"</p>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl md:rounded-[2rem] border border-slate-100 py-24 text-center min-h-[300px] flex flex-col items-center justify-center gap-4 text-slate-300">
                  <MessageSquare size={48} className="opacity-20" />
                  <p className="text-sm font-medium">Belum ada ucapan dari tamu</p>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* Custom Delete Confirmation Modal */}
      <AnimatePresence>
        {(guestToDelete || messageToDelete || showDeleteAllConfirm) && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white p-8 rounded-[2rem] shadow-2xl max-w-sm w-full text-center"
            >
              <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 mx-auto mb-6">
                <Trash2 size={32} />
              </div>
              <h3 className="text-xl font-serif text-slate-900 mb-2">
                {showDeleteAllConfirm ? 'Hapus Semua Tamu?' : `Hapus ${guestToDelete ? 'Tamu' : 'Ucapan'}?`}
              </h3>
              <p className="text-sm text-slate-500 mb-8 leading-relaxed">
                {showDeleteAllConfirm 
                  ? `Tindakan ini akan menghapus seluruh ${guests.length} data tamu secara permanen dari database.` 
                  : 'Tindakan ini tidak dapat dibatalkan. Data terpilih akan dihapus dari database.'}
              </p>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => { setGuestToDelete(null); setMessageToDelete(null); setShowDeleteAllConfirm(false); }}
                  disabled={isDeletingAll}
                  className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-200 transition-all disabled:opacity-50"
                >
                  Batal
                </button>
                <button 
                  onClick={() => {
                    if (showDeleteAllConfirm) handleDeleteAllGuests();
                    else guestToDelete ? handleDeleteGuest(guestToDelete) : handleDeleteMessage(messageToDelete!);
                  }}
                  disabled={isDeletingAll}
                  className="flex-1 py-3 bg-rose-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isDeletingAll ? <RefreshCw size={14} className="animate-spin" /> : 'Ya, Hapus'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GuestManager;
