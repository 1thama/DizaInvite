
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Music2, 
  Send, 
  ChevronDown,
  Gift,
  Copy,
  Check,
  Heart,
  MessageCircle,
  User as UserIcon,
  Pause,
  Play,
  X
} from 'lucide-react';
import { ModernTheme, MODERN_CONFIGS } from './ModernStyleConfigs';
import { db, collection, addDoc, onSnapshot, query, where, orderBy, serverTimestamp, doc, updateDoc } from '../../firebase';

interface ModernStyleTemplateProps {
  invitation: any;
  guestName?: string;
  guestId?: string | null;
  theme?: ModernTheme;
}

const GoogleMapEmbed = ({ location }: { location: string }) => {
  if (!location) return null;
  return (
    <div className="w-full h-40 rounded-2xl overflow-hidden shadow-inner bg-slate-50 border border-slate-100 mt-4">
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

const ModernStyleTemplate: React.FC<ModernStyleTemplateProps> = ({ invitation, guestName, guestId, theme: providedTheme }) => {
  // Safe theme fallback
  const defaultTheme = MODERN_CONFIGS.modern_clean_white;
  const theme = {
    ...defaultTheme,
    ...providedTheme,
    colors: { ...defaultTheme.colors, ...providedTheme?.colors },
    fonts: { ...defaultTheme.fonts, ...providedTheme?.fonts }
  };

  const [hasOpened, setHasOpened] = useState(false);
  const [copied, setCopied] = useState(false);
  const [wishes, setWishes] = useState<any[]>([]);
  const [newWish, setNewWish] = useState({ name: guestName || '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rsvpData, setRsvpData] = useState({ name: guestName || '', status: 'Hadir', count: '1' });
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
    const q = query(collection(db, 'messages'), where('invitationId', '==', invitation.id), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setWishes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
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
        userId: invitation.userId,
        name: newWish.name,
        message: newWish.message,
        createdAt: serverTimestamp()
      });
      setNewWish({ ...newWish, message: '' });
    } catch (e) { console.error(e); }
    finally { setIsSubmitting(false); }
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
        await updateDoc(doc(db, 'guests', guestId), payload);
      } else {
        await addDoc(collection(db, 'guests'), {
          ...payload,
          invitationId: invitation.id,
          userId: invitation.userId,
          createdAt: serverTimestamp()
        });
      }
      setRsvpDone(true);
    } catch (e) { console.error(e); }
    finally { setIsSubmittingRSVP(false); }
  };

  const formatDate = (dateObj: any) => {
    if (!dateObj) return '';
    const date = dateObj.toDate ? dateObj.toDate() : new Date(dateObj);
    return new Intl.DateTimeFormat('id-ID', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    }).format(date);
  };

  return (
    <div 
      className="min-h-screen relative overflow-x-hidden"
      style={{ backgroundColor: theme.colors.bg, color: theme.colors.text, fontFamily: theme.fonts.body }}
    >
      <AnimatePresence>
        {!hasOpened && (
          <motion.div
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-8 text-center bg-white"
          >
            <div className="absolute inset-0 z-0 opacity-20 bg-cover bg-center" style={{ backgroundImage: `url(${invitation.heroImage || theme.background})` }} />
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 space-y-8 max-w-sm">
              <div className="space-y-4">
                <p className="tracking-[0.3em] uppercase text-[10px] opacity-40">Wedding Invitation</p>
                <h1 className="text-4xl sm:text-5xl font-serif break-words" style={{ fontFamily: theme.fonts.display, color: theme.colors.primary }}>
                  {invitation.brideNickname} & {invitation.groomNickname}
                </h1>
              </div>
              <div className="py-10 space-y-4 bg-white/40 backdrop-blur-md rounded-3xl border border-white/50 p-6">
                <p className="text-[10px] uppercase tracking-widest opacity-60">Dear Out Honored Guest</p>
                <p className="text-xl font-serif italic break-words px-2">{guestName || 'Tamu Undangan'}</p>
              </div>
              <button onClick={() => setHasOpened(true)} className="w-full py-4 bg-black text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:scale-105 transition-transform shadow-xl">
                Open Invitation
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10">
        <header className="min-h-screen flex flex-col items-center justify-center p-6 sm:p-8 text-center bg-transparent">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="space-y-6">
            <Heart size={32} style={{ color: theme.colors.primary }} className="mx-auto opacity-30" />
            <div className="space-y-2">
              <p className="tracking-[0.4em] uppercase text-[10px] opacity-50">Save the Date</p>
              <h1 className="text-5xl sm:text-6xl md:text-8xl font-serif italic break-words" style={{ color: theme.colors.primary, fontFamily: theme.fonts.display }}>
                {invitation.brideNickname}<br/>& {invitation.groomNickname}
              </h1>
            </div>
            <p className="text-sm font-bold tracking-widest opacity-60 uppercase">{formatDate(invitation.weddingDate)}</p>
            <ChevronDown className="animate-bounce mx-auto opacity-20 mt-12" size={32} />
          </motion.div>
        </header>

        <section className="py-24 md:py-32 px-6 md:px-8 max-w-2xl mx-auto space-y-20 md:space-y-24 text-center">
          <div className="space-y-16">
            {/* Mempelai Wanita */}
            <div className="space-y-6 text-center">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedImage(invitation.bridePhoto)}
                className="w-48 h-48 mx-auto rounded-full overflow-hidden shadow-2xl border-4 border-white cursor-pointer block"
              >
                <img src={invitation.bridePhoto} alt="Bride" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </motion.button>
              <h2 className="text-2xl sm:text-3xl font-serif break-words" style={{ color: theme.colors.primary }}>{invitation.brideName}</h2>
              <p className="text-sm opacity-60 max-w-xs mx-auto">Putri dari Bapak {invitation.brideFather} & Ibu {invitation.brideMother}</p>
            </div>

            <div className="text-4xl font-serif italic opacity-10">&</div>

            {/* Mempelai Pria */}
            <div className="space-y-6 text-center">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedImage(invitation.groomPhoto)}
                className="w-48 h-48 mx-auto rounded-full overflow-hidden shadow-2xl border-4 border-white cursor-pointer block"
              >
                <img src={invitation.groomPhoto} alt="Groom" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </motion.button>
              <h2 className="text-2xl sm:text-3xl font-serif break-words" style={{ color: theme.colors.primary }}>{invitation.groomName}</h2>
              <p className="text-sm opacity-60 max-w-xs mx-auto">Putra dari Bapak {invitation.groomFather} & Ibu {invitation.groomMother}</p>
            </div>
          </div>
        </section>

        <section className="py-24 md:py-32 px-6 md:px-8 bg-current/5">
          <div className="max-w-xl mx-auto text-center space-y-12 md:space-y-16">
            <h2 className="text-3xl sm:text-4xl font-serif" style={{ color: theme.colors.primary }}>Wedding Event</h2>
            
            <div className="space-y-8">
              <div className="p-6 md:p-10 bg-white rounded-[2rem] shadow-xl border border-slate-50 space-y-6">
                <Calendar className="mx-auto" style={{ color: theme.colors.accent }} />
                <h3 className="text-xl uppercase tracking-widest font-bold">Akad Nikah</h3>
                <div className="space-y-1">
                  <p className="text-lg font-bold">{formatDate(invitation.weddingDate)}</p>
                  <p className="text-sm opacity-60">{invitation.akadTime}</p>
                </div>
                <p className="text-sm leading-relaxed break-words px-2">{invitation.akadLocation}</p>
                <GoogleMapEmbed location={invitation.akadLocation} />
                {invitation.akadMapLink && (
                  <a href={invitation.akadMapLink} target="_blank" className="inline-block px-8 py-3 bg-slate-100 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-slate-200 transition-colors">See Location</a>
                )}
              </div>

              <div className="p-6 md:p-10 bg-white rounded-[2rem] shadow-xl border border-slate-50 space-y-6">
                <Heart className="mx-auto" style={{ color: theme.colors.primary }} />
                <h3 className="text-xl uppercase tracking-widest font-bold">Wedding Reception</h3>
                <div className="space-y-1">
                  <p className="text-lg font-bold">{formatDate(invitation.weddingDate)}</p>
                  <p className="text-sm opacity-60">{invitation.receptionTime}</p>
                </div>
                <p className="text-sm leading-relaxed break-words px-2">{invitation.receptionLocation}</p>
                <GoogleMapEmbed location={invitation.receptionLocation} />
                {invitation.receptionMapLink && (
                  <a href={invitation.receptionMapLink} target="_blank" className="inline-block px-8 py-3 bg-slate-100 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-slate-200 transition-colors">See Location</a>
                )}
              </div>
            </div>
          </div>
          
          {/* General Maps Button as Fallback */}
          {(invitation.googleMapsUrl && !invitation.akadMapLink && !invitation.receptionMapLink) && (
            <div className="max-w-xl mx-auto mt-12 space-y-6 text-center px-8">
              <GoogleMapEmbed location={invitation.location || invitation.googleMapsUrl} />
              <a 
                href={invitation.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-10 py-4 bg-black text-white rounded-full font-bold uppercase tracking-widest text-[10px] shadow-xl hover:scale-105 transition-transform"
              >
                See Location
              </a>
            </div>
          )}
        </section>

        {/* Cerita Cinta Section */}
        {invitation.loveStory && invitation.loveStory.length > 0 && (
          <section className="py-32 px-8 max-w-2xl mx-auto space-y-16">
            <div className="text-center">
              <h2 className="text-4xl font-serif" style={{ color: theme.colors.primary }}>Cerita Cinta</h2>
              <div className="w-12 h-0.5 bg-current mx-auto opacity-10 mt-4" />
            </div>

            <div className="space-y-12">
              {invitation.loveStory.map((story: any, i: number) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="relative pl-12 border-l border-slate-100 pb-12 last:pb-0"
                >
                  <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-slate-200" />
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-40 px-2 py-0.5 bg-slate-50 rounded-md">{story.year}</span>
                    <h3 className="text-xl font-serif italic">{story.title}</h3>
                    <p className="text-sm opacity-60 leading-relaxed">{story.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        <section className="py-32 px-8">
          <div className="max-w-4xl mx-auto space-y-12 text-center">
            <h2 className="text-4xl font-serif" style={{ color: theme.colors.primary }}>Gallery</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {invitation.gallery?.filter((img: any) => img && (typeof img === 'string' ? img : img.url)).map((img: any, idx: number) => {
                const url = typeof img === 'string' ? img : img.url;
                return (
                  <motion.button 
                    key={idx} 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedImage(url)}
                    className="aspect-square rounded-2xl overflow-hidden shadow-lg cursor-pointer"
                  >
                    <img src={url} alt={`Gallery ${idx}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </motion.button>
                );
              })}
            </div>
          </div>
        </section>

        {invitation.isGiftEnabled && (
          <section className="py-32 px-8 bg-current/5">
            <div className="max-w-xl mx-auto text-center space-y-8">
              <Gift className="mx-auto opacity-30" size={40} />
              <h2 className="text-4xl font-serif">Wedding Gift</h2>
              <div className="grid gap-4">
                {invitation.bankAccounts?.map((acc: any, i: number) => (
                  <div key={i} className="p-8 bg-white rounded-3xl shadow-sm border border-slate-100 space-y-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">{acc.bankName}</p>
                    <p className="text-xl font-bold">{acc.accountNumber}</p>
                    <p className="text-xs opacity-60">A/N {acc.accountHolder}</p>
                    <button onClick={() => { navigator.clipboard.writeText(acc.accountNumber); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="px-6 py-2 bg-slate-50 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 mx-auto hover:bg-slate-100">
                      {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />} {copied ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="py-32 px-8 max-w-xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-serif" style={{ color: theme.colors.primary }}>RSVP</h2>
            <p className="text-sm opacity-60">Please kindly confirm your attendance</p>
          </div>
          
          <div className="bg-white p-8 rounded-3xl shadow-xl space-y-6">
            {!rsvpDone ? (
              <form onSubmit={handleSubmitRSVP} className="space-y-4">
                <input className="w-full p-4 rounded-xl bg-slate-50 border-none outline-none focus:ring-1 focus:ring-current/10" placeholder="Full Name" value={rsvpData.name} onChange={(e) => setRsvpData({...rsvpData, name: e.target.value})} required />
                <select className="w-full p-4 rounded-xl bg-slate-50 border-none outline-none focus:ring-1 focus:ring-current/10" value={rsvpData.status} onChange={(e) => setRsvpData({...rsvpData, status: e.target.value})}>
                  <option value="Hadir">Will Attend</option>
                  <option value="Berhalangan Hadir">Sorry, Can't Attend</option>
                </select>
                {rsvpData.status === 'Hadir' && (
                  <select className="w-full p-4 rounded-xl bg-slate-50 border-none outline-none focus:ring-1 focus:ring-current/10" value={rsvpData.count} onChange={(e) => setRsvpData({...rsvpData, count: e.target.value})}>
                    {[1,2,3,4,5].map(v => <option key={v} value={v}>{v} Guest(s)</option>)}
                  </select>
                )}
                <button type="submit" disabled={isSubmittingRSVP} className="w-full py-4 bg-black text-white rounded-xl font-bold uppercase tracking-widest text-[10px] shadow-xl hover:scale-105 transition-transform disabled:opacity-50">
                  {isSubmittingRSVP ? 'Sending...' : 'Confirm Presence'}
                </button>
              </form>
            ) : (
              <div className="text-center py-6 space-y-4">
                <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto"><Check className="text-green-500" /></div>
                <p className="text-sm font-bold">Attendance Confirmed!</p>
                <button onClick={() => setRsvpDone(false)} className="text-[10px] uppercase font-bold opacity-30 hover:opacity-100 transition-opacity">Change status</button>
              </div>
            )}
          </div>
        </section>

        <section className="py-32 px-8 max-w-xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-serif underline decoration-1 underline-offset-8" style={{ color: theme.colors.primary }}>Guest Book</h2>
          </div>
          <div className="space-y-8">
            <form onSubmit={handleSubmitWish} className="space-y-4">
              <input className="w-full p-4 rounded-xl bg-slate-50 border-none outline-none" placeholder="Name" value={newWish.name} onChange={(e) => setNewWish({...newWish, name: e.target.value})} required />
              <textarea className="w-full p-4 rounded-xl bg-slate-50 border-none outline-none h-32 resize-none" placeholder="Share your blessings..." value={newWish.message} onChange={(e) => setNewWish({...newWish, message: e.target.value})} required />
              <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-black text-white rounded-xl font-bold uppercase tracking-widest text-[10px] shadow-xl hover:scale-105 transition-transform disabled:opacity-50">
                {isSubmitting ? 'Sending...' : 'Send Wishes'}
              </button>
            </form>
            <div className="space-y-4">
              {wishes.map((w, i) => (
                <div key={i} className="p-6 border-b border-slate-100 space-y-2">
                  <p className="text-xs font-bold uppercase tracking-widest">{w.name}</p>
                  <p className="text-sm opacity-70 italic leading-relaxed">"{w.message}"</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <footer className="py-32 px-8 text-center space-y-6">
          <Heart size={24} className="mx-auto opacity-20" />
          <h2 className="text-3xl sm:text-4xl font-serif italic break-words" style={{ color: theme.colors.primary }}>{invitation.brideNickname} & {invitation.groomNickname}</h2>
          <p className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-40">Thank You for Being Part of Our Journey</p>
        </footer>
      </div>

      {/* Floating Music Toggle */}
      <motion.button 
        onClick={toggleMusic}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-8 right-8 z-[200] flex items-center gap-3 bg-white shadow-2xl px-4 py-2.5 rounded-2xl border border-slate-100"
      >
        <div className="flex items-center gap-0.5 h-3">
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              animate={{
                height: isPlaying ? [4, 14, 4] : 4
              }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
                delay: i * 0.15
              }}
              className="w-1 bg-black rounded-full"
            />
          ))}
        </div>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={isPlaying ? 'pause' : 'play'}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            {isPlaying ? (
              <Pause className="text-black fill-black" size={14} />
            ) : (
              <Play className="text-black fill-black" size={14} />
            )}
          </motion.div>
        </AnimatePresence>
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
            className="fixed inset-0 z-[300] bg-white/95 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.button
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="absolute top-8 right-8 text-black bg-black/5 p-3 rounded-full hover:bg-black/10 transition-colors"
              onClick={() => setSelectedImage(null)}
            >
              <X size={24} />
            </motion.button>
            <motion.img
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
              src={selectedImage}
              alt="Full view"
              className="max-w-full max-h-[80vh] rounded-3xl shadow-2xl pointer-events-none"
              referrerPolicy="no-referrer"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ModernStyleTemplate;
