import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Music2, 
  Send, 
  Users, 
  ChevronDown,
  Gift,
  Copy,
  Check,
  Sparkles,
  Heart,
  MessageCircle,
  User as UserIcon,
  Pause,
  Play,
  X
} from 'lucide-react';
import { NusantaraTheme } from './NusantaraConfigs';
import { db, collection, addDoc, onSnapshot, query, where, orderBy, serverTimestamp, doc, updateDoc } from '../../firebase';

interface NusantaraTemplateProps {
  invitation: any;
  guestName?: string;
  guestId?: string | null;
  theme: NusantaraTheme;
}

const GoogleMapEmbed = ({ location }: { location: string }) => {
  if (!location) return null;
  return (
    <div className="w-full h-48 rounded-2xl overflow-hidden shadow-inner bg-slate-100 border border-current/5 mt-4">
      <iframe
        title="Map Preview"
        width="100%"
        height="100%"
        frameBorder="0"
        scrolling="no"
        marginHeight={0}
        marginWidth={0}
        src={`https://maps.google.com/maps?q=${encodeURIComponent(location)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
        referrerPolicy="no-referrer"
      />
    </div>
  );
};

const NusantaraTemplate: React.FC<NusantaraTemplateProps> = ({ invitation, guestName, guestId, theme }) => {
  const [hasOpened, setHasOpened] = useState(false);
  const [copied, setCopied] = useState(false);
  const [wishes, setWishes] = useState<any[]>([]);
  const [newWish, setNewWish] = useState({ name: guestName || '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rsvpData, setRsvpData] = useState({ 
    name: guestName || '', 
    status: 'Hadir', 
    count: '1' 
  });
  const [isSubmittingRSVP, setIsSubmittingRSVP] = useState(false);
  const [rsvpDone, setRsvpDone] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (hasOpened && audioRef.current && !isPlaying) {
      audioRef.current.play().catch(e => console.log("Autoplay blocked:", e));
      setIsPlaying(true);
    }
  }, [hasOpened]);

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.log("Play failed:", e));
    }
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    if (!invitation?.id) return;

    const q = query(
      collection(db, 'messages'),
      where('invitationId', '==', invitation.id),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setWishes(docs);
    });

    return () => unsubscribe();
  }, [invitation?.id]);

  const handleSubmitWish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWish.name || !newWish.message || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'messages'), {
        invitationId: invitation.id,
        userId: invitation.userId, // Link to owner
        name: newWish.name,
        message: newWish.message,
        createdAt: serverTimestamp()
      });
      setNewWish({ ...newWish, message: '' });
    } catch (error) {
      console.error("Error submitting wish:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitRSVP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rsvpData.name || isSubmittingRSVP) return;

    setIsSubmittingRSVP(true);
    try {
      const payload = {
        name: rsvpData.name,
        status: rsvpData.status,
        totalGuests: rsvpData.status === 'Hadir' ? parseInt(rsvpData.count) : 0,
        updatedAt: serverTimestamp()
      };

      if (guestId) {
        // Update existing guest
        await updateDoc(doc(db, 'guests', guestId), payload);
      } else {
        // Create new guest record
        await addDoc(collection(db, 'guests'), {
          ...payload,
          invitationId: invitation.id,
          userId: invitation.userId, // Link to owner
          createdAt: serverTimestamp()
        });
      }
      setRsvpDone(true);
    } catch (error) {
      console.error("Error submitting RSVP:", error);
    } finally {
      setIsSubmittingRSVP(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateObj: any) => {
    if (!dateObj) return '';
    const date = dateObj.toDate ? dateObj.toDate() : new Date(dateObj);
    return new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  return (
    <div 
      className="min-h-screen relative overflow-x-hidden font-sans"
      style={{ backgroundColor: theme.colors.bg, color: theme.colors.text }}
    >
      {/* Background Image Layer */}
      <div 
        className="fixed inset-0 z-0 opacity-40 mix-blend-multiply bg-cover bg-center transition-all duration-1000"
        style={{ backgroundImage: `url(${invitation.heroImage || theme.background})` }}
      />

      <AnimatePresence>
        {!hasOpened ? (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -1000 }}
            transition={{ duration: 1, ease: 'easeInOut' }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-6 text-center overflow-hidden"
          >
            {/* Overlay for Opening */}
            <div className="absolute inset-0 z-[-1] bg-gradient-to-b from-black/60 to-black/30" />
            <div 
              className="absolute inset-0 z-[-2] bg-cover bg-center scale-110"
              style={{ backgroundImage: `url(${invitation.heroImage || theme.background})` }}
            />

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="space-y-6 max-w-lg"
            >
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 rounded-full border-2 border-white/30 flex items-center justify-center backdrop-blur-sm">
                  <Heart className="text-white animate-pulse" size={32} />
                </div>
              </div>
              
              <h1 className="text-white text-lg font-medium tracking-[0.2em] uppercase">The Wedding of</h1>
              
              <div className="space-y-2">
                <h2 className="text-white text-4xl sm:text-5xl md:text-7xl font-serif italic break-words">{invitation.brideNickname} & {invitation.groomNickname}</h2>
              </div>

              <div className="pt-8">
                <p className="text-white/80 text-sm mb-2 uppercase tracking-widest">Kepada Yth. Bapak/Ibu/Sdr/i</p>
                <div className="bg-white/10 backdrop-blur-md border border-white/20 px-6 py-4 rounded-2xl mb-8">
                  <h3 className="text-white text-2xl font-serif break-words">{guestName || 'Tamu Undangan'}</h3>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setHasOpened(true)}
                  className="bg-white text-black px-10 py-4 rounded-full font-bold shadow-2xl flex items-center gap-3 mx-auto transition-all hover:bg-opacity-90"
                >
                  <Send size={18} />
                  Buka Undangan
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="relative z-10">
        {/* Header Section */}
        <section className="min-h-screen flex flex-col items-center justify-center p-6 sm:p-8 text-center bg-transparent">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="space-y-8"
          >
            <div className="w-16 h-1 w-16 bg-current mx-auto opacity-20" />
            <p className="uppercase tracking-[0.3em] text-sm font-bold opacity-60">Walimatul Ursy</p>
            <h1 className="text-5xl sm:text-6xl md:text-8xl font-serif italic leading-tight break-words" style={{ color: theme.colors.primary }}>
              {invitation.brideNickname}<br/>&<br/>{invitation.groomNickname}
            </h1>
            <p className="max-w-md mx-auto text-lg leading-relaxed italic opacity-80">
              "{theme.traditionalText.opening}"
            </p>
            <ChevronDown className="animate-bounce mx-auto opacity-40 mt-12" size={32} />
          </motion.div>
        </section>

        {/* Profile Section */}
        <section className="py-20 px-6 md:px-8 max-w-4xl mx-auto space-y-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              className="space-y-4 text-center md:text-right"
            >
              <div className="relative inline-block">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedImage(invitation.bridePhoto)}
                  className="w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden border-8 border-white shadow-2xl mx-auto md:ml-auto cursor-pointer"
                >
                  <img 
                    src={invitation.bridePhoto} 
                    alt="Bride" 
                    className="w-full h-full object-cover" 
                    referrerPolicy="no-referrer"
                  />
                </motion.button>
                <div className="absolute -bottom-4 -right-4 bg-white p-3 rounded-full shadow-lg">
                  <Sparkles className="text-yellow-500" size={24} />
                </div>
              </div>
              <h2 className="text-3xl sm:text-4xl font-serif break-words" style={{ color: theme.colors.primary }}>{invitation.brideName}</h2>
              <p className="text-sm opacity-70">Putri dari Bapak {invitation.brideFather} <br/> & Ibu {invitation.brideMother}</p>
            </motion.div>

            <motion.div
              initial={{ x: 50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              className="space-y-4 text-center md:text-left"
            >
              <div className="relative inline-block">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedImage(invitation.groomPhoto)}
                  className="w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden border-8 border-white shadow-2xl mx-auto md:mr-auto cursor-pointer"
                >
                  <img 
                    src={invitation.groomPhoto} 
                    alt="Groom" 
                    className="w-full h-full object-cover" 
                    referrerPolicy="no-referrer"
                  />
                </motion.button>
                <div className="absolute -bottom-4 -left-4 bg-white p-3 rounded-full shadow-lg">
                  <Heart className="text-rose-500" size={24} />
                </div>
              </div>
              <h2 className="text-3xl sm:text-4xl font-serif break-words" style={{ color: theme.colors.primary }}>{invitation.groomName}</h2>
              <p className="text-sm opacity-70">Putra dari Bapak {invitation.groomFather} <br/> & Ibu {invitation.groomMother}</p>
            </motion.div>
          </div>
        </section>

        {/* Event Section */}
        <section className="py-20 px-6 md:px-8 bg-black/5 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto text-center space-y-10">
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl sm:text-4xl font-serif mb-10" style={{ color: theme.colors.primary }}>Hari Kebahagiaan</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <div className="p-6 md:p-8 bg-white/50 rounded-3xl border border-white/20 shadow-xl space-y-4">
                  <Calendar className="mx-auto" style={{ color: theme.colors.accent }} />
                  <h3 className="text-2xl font-serif uppercase tracking-widest">Akad Nikah</h3>
                  <div className="w-12 h-0.5 bg-current mx-auto opacity-20" />
                  <p className="font-bold">{formatDate(invitation.weddingDate)}</p>
                  <p className="text-sm flex items-center justify-center gap-2">
                    <Clock size={16} /> {invitation.akadTime}
                  </p>
                  <p className="text-sm flex items-center justify-center gap-2 break-words px-4">
                    <MapPin size={16} /> {invitation.akadLocation}
                  </p>
                  
                  <GoogleMapEmbed location={invitation.akadLocation} />

                  {invitation.akadMapLink && (
                    <div className="pt-4">
                      <a 
                        href={invitation.akadMapLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-white/80 px-4 py-2 rounded-full text-xs font-bold shadow-sm transition-all hover:bg-white"
                        style={{ color: theme.colors.primary }}
                      >
                        <MapPin size={14} /> Lihat Lokasi
                      </a>
                    </div>
                  )}
                </div>

                <div className="p-6 md:p-8 bg-white rounded-3xl shadow-xl space-y-4">
                  <Heart className="mx-auto" style={{ color: theme.colors.secondary }} />
                  <h3 className="text-2xl font-serif uppercase tracking-widest">Resepsi</h3>
                  <div className="w-12 h-0.5 bg-current mx-auto opacity-20" />
                  <p className="font-bold">{formatDate(invitation.weddingDate)}</p>
                  <p className="text-sm flex items-center justify-center gap-2">
                    <Clock size={16} /> {invitation.receptionTime}
                  </p>
                  <p className="text-sm flex items-center justify-center gap-2 break-words px-4">
                    <MapPin size={16} /> {invitation.receptionLocation}
                  </p>

                  <GoogleMapEmbed location={invitation.receptionLocation} />
                  
                  {invitation.receptionMapLink && (
                    <div className="pt-4">
                      <a 
                        href={invitation.receptionMapLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-full text-xs font-bold shadow-sm transition-all hover:bg-slate-100"
                        style={{ color: theme.colors.primary }}
                      >
                        <MapPin size={14} /> Lihat Lokasi
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* General Maps Button as Fallback */}
              {(invitation.googleMapsUrl && !invitation.akadMapLink && !invitation.receptionMapLink) && (
                <div className="mt-12 space-y-6">
                  <GoogleMapEmbed location={invitation.location || invitation.googleMapsUrl} />
                  <a 
                    href={invitation.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 bg-white px-8 py-3 rounded-full font-bold shadow-lg transition-all hover:scale-105"
                    style={{ color: theme.colors.primary }}
                  >
                    <MapPin size={18} />
                    Petunjuk Lokasi
                  </a>
                </div>
              )}
            </motion.div>
          </div>
        </section>

        {/* Cerita Cinta Section */}
        {invitation.loveStory && invitation.loveStory.length > 0 && (
          <section className="py-24 px-8 max-w-4xl mx-auto space-y-16">
            <div className="text-center">
              <h2 className="text-4xl font-serif mb-4" style={{ color: theme.colors.primary }}>Cerita Cinta</h2>
              <div className="w-16 h-1 bg-current mx-auto opacity-20" />
            </div>

            <div className="relative space-y-12">
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-current opacity-10 hidden md:block" />
              
              {invitation.loveStory.map((story: any, i: number) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className={`flex flex-col md:flex-row items-center gap-8 ${i % 2 === 0 ? '' : 'md:flex-row-reverse'}`}
                >
                  <div className="flex-1 text-center md:text-right space-y-2">
                    <span className="text-xs font-bold uppercase tracking-widest opacity-40 px-3 py-1 bg-current/5 rounded-full">{story.year}</span>
                    <h3 className="text-2xl font-serif break-words">{story.title}</h3>
                    <p className="text-sm opacity-60 leading-relaxed italic">{story.description}</p>
                  </div>
                  
                  <div className="relative z-10 w-12 h-12 rounded-full bg-white shadow-xl border border-slate-100 flex items-center justify-center shrink-0">
                    <Heart size={20} style={{ color: theme.colors.primary }} fill={theme.colors.primary} />
                  </div>
                  
                  <div className="flex-1 hidden md:block" />
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Gallery */}
        <section className="py-24 px-8 overflow-hidden">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="text-center">
              <h2 className="text-4xl font-serif mb-4" style={{ color: theme.colors.primary }}>Galeri Kami</h2>
              <div className="w-16 h-1 bg-current mx-auto opacity-20" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {invitation.gallery?.filter((img: any) => img && (typeof img === 'string' ? img : img.url)).map((img: any, idx: number) => {
                const imageUrl = typeof img === 'string' ? img : img.url;
                return (
                  <motion.button
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ delay: idx * 0.1 }}
                    onClick={() => setSelectedImage(imageUrl)}
                    className={`overflow-hidden rounded-2xl shadow-lg aspect-[4/5] relative group cursor-pointer ${idx % 3 === 0 ? 'md:col-span-2 md:aspect-video' : ''}`}
                  >
                    <img 
                      src={imageUrl} 
                      alt={`Gallery ${idx}`} 
                      className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110" 
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <Sparkles className="text-white" size={32} />
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Digital Gift Section */}
        {invitation.isGiftEnabled && (
          <section className="py-20 px-6 md:px-8 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="bg-white/40 backdrop-blur-md p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] border border-white text-center space-y-8 shadow-2xl"
            >
              <Gift className="mx-auto" size={40} style={{ color: theme.colors.accent }} />
              <h2 className="text-3xl font-serif">Hadiah Digital</h2>
              <p className="opacity-70">Doa restu Anda merupakan hadiah terindah. Namun jika ingin memberikan tanda kasih secara digital, Anda dapat melalui tautan di bawah ini.</p>
              
              <div className="space-y-6">
                {invitation.bankAccounts?.filter((acc: any) => acc.bankName && acc.accountNumber).map((acc: any, idx: number) => (
                  <div key={idx} className="p-6 bg-white rounded-2xl text-left border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-bold uppercase opacity-40 mb-1">Bank Account</p>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-bold">{acc.bankName}</p>
                        <p className="text-lg">{acc.accountNumber}</p>
                        <p className="text-sm opacity-60">a.n {acc.accountHolder}</p>
                      </div>
                      <button 
                        onClick={() => copyToClipboard(acc.accountNumber)}
                        className="p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                      >
                        {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                      </button>
                    </div>
                  </div>
                ))}
                
                {(!invitation.bankAccounts || invitation.bankAccounts.filter((acc: any) => acc.bankName && acc.accountNumber).length === 0) && (
                  <p className="text-sm italic opacity-40">Belum ada data rekening yang ditambahkan.</p>
                )}
              </div>
            </motion.div>
          </section>
        )}

        {/* Kehadiran Section */}
        <section className="py-20 px-6 md:px-8 bg-black/5">
          <div className="max-w-2xl mx-auto text-center space-y-10">
            <h2 className="text-3xl sm:text-4xl font-serif" style={{ color: theme.colors.primary }}>Kehadiran</h2>
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl space-y-6">
              {!rsvpDone ? (
                <>
                  <p className="opacity-70">Mohon konfirmasi kehadiran Anda melalui formulir RSVP digital di bawah ini.</p>
                  <form onSubmit={handleSubmitRSVP} className="space-y-4">
                    <input 
                      className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500/20 outline-none transition-all" 
                      placeholder="Nama Anda"
                      value={rsvpData.name}
                      onChange={(e) => setRsvpData({ ...rsvpData, name: e.target.value })}
                      required
                    />
                    <select 
                      className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500/20 outline-none transition-all"
                      value={rsvpData.status}
                      onChange={(e) => setRsvpData({ ...rsvpData, status: e.target.value })}
                    >
                      <option value="Hadir">Hadir</option>
                      <option value="Berhalangan Hadir">Berhalangan Hadir</option>
                    </select>
                    
                    {rsvpData.status === 'Hadir' && (
                      <div className="text-left animate-in fade-in slide-in-from-top-2">
                        <label className="block text-[10px] uppercase tracking-widest font-bold opacity-50 mb-2 ml-1">Jumlah Orang yang Hadir</label>
                        <select 
                          className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500/20 outline-none transition-all"
                          value={rsvpData.count}
                          onChange={(e) => setRsvpData({ ...rsvpData, count: e.target.value })}
                        >
                          <option value="1">1 Orang</option>
                          <option value="2">2 Orang</option>
                          <option value="3">3 Orang</option>
                          <option value="4">4 Orang</option>
                          <option value="5">5 Orang</option>
                        </select>
                      </div>
                    )}

                    <button 
                      type="submit"
                      disabled={isSubmittingRSVP}
                      className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 text-white shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                      style={{ backgroundColor: theme.colors.primary }}
                    >
                      {isSubmittingRSVP ? 'Mengirim...' : 'Kirim Konfirmasi'}
                    </button>
                  </form>
                </>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-8 space-y-4"
                >
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="text-green-600" size={32} />
                  </div>
                  <h3 className="text-xl font-bold">Terima Kasih!</h3>
                  <p className="opacity-70">Konfirmasi kehadiran Anda telah berhasil kami simpan.</p>
                  <button 
                    onClick={() => setRsvpDone(false)}
                    className="text-xs font-bold uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity"
                  >
                    Ubah Konfirmasi
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </section>

        {/* Wishes Section */}
        <section className="py-20 px-6 md:px-8 max-w-4xl mx-auto space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            <MessageCircle className="mx-auto" size={40} style={{ color: theme.colors.primary }} />
            <h2 className="text-3xl sm:text-4xl font-serif" style={{ color: theme.colors.primary }}>Ucapan & Doa Restu</h2>
            <p className="opacity-70 text-sm">Berikan ucapan selamat dan doa restu Anda kepada kedua mempelai.</p>
          </motion.div>

          {/* Wish Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="bg-white/40 backdrop-blur-md p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] border border-white shadow-xl"
          >
            <form onSubmit={handleSubmitWish} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-widest font-bold opacity-50 mb-2">Nama Anda</label>
                <input 
                  type="text"
                  value={newWish.name}
                  onChange={(e) => setNewWish({ ...newWish, name: e.target.value })}
                  placeholder="Masukkan nama Anda..."
                  className="w-full p-4 rounded-xl border border-white bg-white/50 focus:bg-white focus:ring-2 focus:ring-rose-500/20 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest font-bold opacity-50 mb-2">Pesan & Doa</label>
                <textarea 
                  value={newWish.message}
                  onChange={(e) => setNewWish({ ...newWish, message: e.target.value })}
                  placeholder="Tulis ucapan selamat..."
                  className="w-full p-4 rounded-xl border border-white bg-white/50 focus:bg-white focus:ring-2 focus:ring-rose-500/20 outline-none transition-all h-32 resize-none"
                />
              </div>
              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 text-white shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                style={{ backgroundColor: theme.colors.primary }}
              >
                {isSubmitting ? 'Mengirim...' : <><Send size={18} /> Kirim Ucapan</>}
              </button>
            </form>
          </motion.div>

          {/* Wishes List */}
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {wishes.map((wish, i) => (
              <motion.div
                key={wish.id || i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-white shadow-sm space-y-2"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                    <UserIcon size={18} className="text-slate-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{wish.name}</h4>
                    <p className="text-[10px] opacity-40 uppercase tracking-widest">
                      {wish.createdAt?.toDate ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(wish.createdAt.toDate()) : 'Baru saja'}
                    </p>
                  </div>
                </div>
                <p className="text-slate-600 leading-relaxed italic">"{wish.message}"</p>
              </motion.div>
            ))}
            
            {wishes.length === 0 && (
              <div className="text-center py-12 opacity-40 italic">
                Belum ada ucapan. Jadilah yang pertama memberikan doa restu!
              </div>
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className="py-24 px-8 text-center space-y-8 bg-transparent">
          <div className="w-12 h-0.5 bg-current mx-auto opacity-20" />
          <p className="max-w-md mx-auto text-lg leading-relaxed italic opacity-80">
            "{theme.traditionalText.closing}"
          </p>
          <div className="space-y-4">
            <h2 className="text-3xl sm:text-4xl font-serif italic break-words" style={{ color: theme.colors.primary }}>{invitation.brideNickname} & {invitation.groomNickname}</h2>
            <p className="text-xs uppercase tracking-widest opacity-40">Terima kasih atas doa restunya</p>
          </div>
        </footer>
      </div>

      {/* Floating Music Toggle */}
      <motion.button 
        onClick={toggleMusic}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-6 right-6 z-[200] flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full shadow-2xl border border-white/30"
      >
        <div className="flex items-center gap-0.5 h-3 w-4">
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              animate={{
                height: isPlaying ? [4, 12, 4] : 4
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.2
              }}
              className="w-0.5 bg-white rounded-full"
            />
          ))}
        </div>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={isPlaying ? 'pause' : 'play'}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.2 }}
          >
            {isPlaying ? (
              <Pause className="text-white fill-white" size={14} />
            ) : (
              <Play className="text-white fill-white" size={14} />
            )}
          </motion.div>
        </AnimatePresence>
        <span className="text-[10px] font-bold text-white uppercase tracking-widest hidden sm:inline">
          {isPlaying ? 'Pause' : 'Play'}
        </span>
      </motion.button>

      {invitation.musicUrl && (
        <audio 
          ref={audioRef}
          src={invitation.musicUrl}
          loop
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
      )}

      {/* Image Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-[300] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.button
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="absolute top-6 right-6 text-white bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors"
              onClick={() => setSelectedImage(null)}
            >
              <X size={24} />
            </motion.button>
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={selectedImage}
              alt="Full view"
              className="max-w-full max-h-[90vh] rounded-xl shadow-2xl pointer-events-none"
              referrerPolicy="no-referrer"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NusantaraTemplate;
