
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
  Sparkles,
  Pause,
  Play,
  X
} from 'lucide-react';
import { EliteTheme } from './CreativeEliteConfigs';
import { db, collection, addDoc, onSnapshot, query, where, orderBy, serverTimestamp, doc, updateDoc } from '../../firebase';

interface CreativeEliteTemplateProps {
  invitation: any;
  guestName?: string;
  guestId?: string | null;
  theme: EliteTheme;
}

const GoogleMapEmbed = ({ location }: { location: string }) => {
  if (!location) return null;
  return (
    <div className="w-full h-40 rounded-2xl overflow-hidden shadow-inner bg-current/5 border border-current/5 mt-4">
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

const CreativeEliteTemplate: React.FC<CreativeEliteTemplateProps> = ({ invitation, guestName, guestId, theme }) => {
  const [hasOpened, setHasOpened] = useState(false);
  const [copied, setCopied] = useState(false);
  const [wishes, setWishes] = useState<any[]>([]);
  const [newWish, setNewWish] = useState({ name: guestName || '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittingRSVP, setIsSubmittingRSVP] = useState(false);
  const [rsvpDone, setRsvpDone] = useState(false);
  const [rsvpData, setRsvpData] = useState({ name: guestName || '', status: 'Hadir', count: '1' });
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
      day: 'numeric', month: 'long', year: 'numeric'
    }).format(date);
  };

  const layoutClass = {
    minimal: 'max-w-2xl mx-auto',
    editorial: 'max-w-4xl mx-auto',
    geometric: 'max-w-3xl mx-auto',
    experimental: 'max-w-full'
  }[theme.layout];

  return (
    <div 
      className="min-h-screen relative overflow-x-hidden"
      style={{ 
        backgroundColor: theme.colors.bg, 
        color: theme.colors.text,
        fontFamily: theme.fonts.body 
      }}
    >
      {/* Dynamic Background */}
      <div 
        className="fixed inset-0 z-0 opacity-20 transition-all duration-1000 bg-cover bg-center mix-blend-luminosity"
        style={{ backgroundImage: `url(${invitation.heroImage || theme.background})` }}
      />

      <AnimatePresence>
        {!hasOpened && (
          <motion.div
            exit={{ opacity: 0, y: -200 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-black/90 backdrop-blur-xl"
          >
            <div className="text-center space-y-12">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
              >
                <p className="tracking-[0.5em] text-white/40 uppercase text-xs">A Celebration of Love</p>
                <h1 
                  className="text-5xl sm:text-6xl md:text-8xl text-white italic break-words"
                  style={{ fontFamily: theme.fonts.display }}
                >
                  {invitation.brideNickname} & {invitation.groomNickname}
                </h1>
              </motion.div>
              
              <div className="space-y-6">
                <div className="text-white/60 space-y-2">
                  <p className="text-[10px] uppercase tracking-widest opacity-60">Dear valued guest</p>
                  <p className="text-2xl font-serif break-words px-4">{guestName || 'Tamu Undangan'}</p>
                </div>
                
                <button 
                  onClick={() => setHasOpened(true)}
                  className="px-12 py-4 bg-white text-black rounded-full font-bold uppercase tracking-widest text-xs hover:scale-105 transition-transform"
                >
                  Enter Experience
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="min-h-screen flex flex-col items-center justify-center px-8 py-20 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="space-y-12"
          >
            <div 
               className="w-24 h-0.5 mx-auto bg-current opacity-20"
            />
            <h1 
              className="text-6xl sm:text-7xl md:text-[10rem] leading-none mb-4 break-words"
              style={{ fontFamily: theme.fonts.display, color: theme.colors.primary }}
            >
              {invitation.brideNickname} <br/> & {invitation.groomNickname}
            </h1>
            <p className="text-sm tracking-[0.3em] uppercase font-bold opacity-60">
              {formatDate(invitation.weddingDate)}
            </p>
            <ChevronDown className="mx-auto opacity-20 animate-bounce mt-20" size={32} />
          </motion.div>
        </section>

        {/* Profile Section - Magazine Style */}
        <section className={`py-40 px-6 md:px-8 ${layoutClass}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-start">
            <motion.div 
               whileInView={{ y: window.innerWidth >= 768 ? -50 : 0 }}
               className="space-y-8 md:space-y-12"
            >
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedImage(invitation.bridePhoto)}
                className="w-full aspect-[3/4] rounded-[3rem] overflow-hidden bg-slate-200 shadow-2xl relative group cursor-pointer"
              >
                <img src={invitation.bridePhoto} alt="Bride" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute bottom-10 left-10 text-white text-left">
                  <p className="text-xs uppercase tracking-widest mb-2 opacity-80">The Bride</p>
                  <h2 className="text-3xl sm:text-4xl font-serif break-words" style={{ fontFamily: theme.fonts.display }}>{invitation.brideName}</h2>
                </div>
              </motion.button>
              <div className="px-4">
                <p className="text-sm opacity-60 leading-relaxed italic">
                  Daughter of Bapak {invitation.brideFather} and Ibu {invitation.brideMother}
                </p>
              </div>
            </motion.div>

            <motion.div 
               whileInView={{ y: window.innerWidth >= 768 ? 50 : 0 }}
               className="space-y-8 md:space-y-12 md:mt-40"
            >
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedImage(invitation.groomPhoto)}
                className="w-full aspect-[3/4] rounded-[3rem] overflow-hidden bg-slate-200 shadow-2xl relative group cursor-pointer"
              >
                <img src={invitation.groomPhoto} alt="Groom" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute bottom-10 left-10 text-white text-left">
                  <p className="text-xs uppercase tracking-widest mb-2 opacity-80">The Groom</p>
                  <h2 className="text-3xl sm:text-4xl font-serif break-words" style={{ fontFamily: theme.fonts.display }}>{invitation.groomName}</h2>
                </div>
              </motion.button>
              <div className="px-4">
                <p className="text-sm opacity-60 leading-relaxed italic">
                  Son of Bapak {invitation.groomFather} and Ibu {invitation.groomMother}
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Event Section */}
        <section className="py-20 md:py-40 px-6 md:px-8 bg-current/5 backdrop-blur-2xl">
          <div className={`${layoutClass} space-y-16 md:space-y-32`}>
            <div className="text-center space-y-4 px-4">
              <h2 className="text-3xl sm:text-5xl md:text-7xl underline underline-offset-8 decoration-1 break-words pb-4" style={{ fontFamily: theme.fonts.display }}>Ceremony Details</h2>
              <p className="text-[10px] tracking-[0.4em] uppercase opacity-40">Join Us for the Best Day</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-current/10 rounded-[2rem] sm:rounded-[3rem] overflow-hidden border border-current/10">
              <div className="p-8 md:p-16 bg-transparent space-y-8 flex flex-col justify-between min-h-[350px] md:h-[500px]">
                <div className="space-y-4">
                  <h3 className="text-[10px] uppercase tracking-widest opacity-40">Section 01</h3>
                  <h4 className="text-3xl sm:text-5xl font-serif italic break-words">Holy Matrimony</h4>
                </div>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <Clock size={16} className="opacity-40" />
                    <p className="text-xl">{invitation.akadTime}</p>
                  </div>
                  <div className="flex items-start gap-4">
                    <MapPin size={16} className="opacity-40 mt-1.5" />
                    <div className="space-y-4">
                      <p className="text-xl flex-1 leading-tight">{invitation.akadLocation}</p>
                      <GoogleMapEmbed location={invitation.akadLocation} />
                      {invitation.akadMapLink && (
                        <a href={invitation.akadMapLink} target="_blank" className="inline-block text-[10px] font-bold uppercase tracking-widest border-b border-current pb-1 hover:opacity-60 transition-opacity">Open Maps</a>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 md:p-16 bg-current/5 space-y-8 flex flex-col justify-between min-h-[400px] md:h-[500px]">
                <div className="space-y-4">
                  <h3 className="text-[10px] uppercase tracking-widest opacity-40">Section 02</h3>
                  <h4 className="text-3xl sm:text-5xl font-serif italic break-words">Wedding Reception</h4>
                </div>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <Clock size={16} className="opacity-40" />
                    <p className="text-xl">{invitation.receptionTime}</p>
                  </div>
                  <div className="flex items-start gap-4">
                    <MapPin size={16} className="opacity-40 mt-1.5" />
                    <div className="space-y-4">
                      <p className="text-xl flex-1">{invitation.receptionLocation}</p>
                      <GoogleMapEmbed location={invitation.receptionLocation} />
                      {invitation.receptionMapLink && (
                        <a href={invitation.receptionMapLink} target="_blank" className="inline-block text-[10px] font-bold uppercase tracking-widest border-b border-current pb-1 hover:opacity-60 transition-opacity">Open Maps</a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* General Maps Button as Fallback */}
          {(invitation.googleMapsUrl && !invitation.akadMapLink && !invitation.receptionMapLink) && (
            <div className="max-w-4xl mx-auto mt-32 space-y-8 text-center px-8">
              <GoogleMapEmbed location={invitation.location || invitation.googleMapsUrl} />
              <div className="pt-4">
                <a 
                  href={invitation.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-12 py-5 bg-black text-white rounded-full font-bold uppercase tracking-[0.3em] text-[10px] hover:scale-105 transition-transform shadow-2xl"
                >
                  Get Directions
                </a>
              </div>
            </div>
          )}
        </section>

        {/* Cerita Cinta Section */}
        {invitation.loveStory && invitation.loveStory.length > 0 && (
          <section className={`py-40 px-8 ${layoutClass}`}>
            <div className="space-y-32">
              <div className="text-center space-y-4">
                <h2 className="text-5xl md:text-7xl italic" style={{ fontFamily: theme.fonts.display }}>Our Journey</h2>
                <p className="text-xs tracking-[0.4em] uppercase opacity-40">How it all began</p>
              </div>

              <div className="space-y-24 relative">
                <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-current opacity-10" />
                
                {invitation.loveStory.map((story: any, i: number) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className={`flex flex-col md:flex-row items-start md:items-center gap-12 ${i % 2 === 0 ? '' : 'md:flex-row-reverse'}`}
                  >
                    <div className={`flex-1 space-y-4 ${i % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                      <span className="inline-block px-6 py-2 bg-current/5 rounded-full text-xs font-bold tracking-widest">{story.year}</span>
                      <h3 className="text-3xl font-serif italic" style={{ fontFamily: theme.fonts.display }}>{story.title}</h3>
                      <p className="text-base opacity-60 leading-relaxed max-w-md mx-auto md:mx-0">{story.description}</p>
                    </div>

                    <div className="relative z-10 w-16 h-16 rounded-full bg-white shadow-2xl border border-current/5 flex items-center justify-center shrink-0">
                      <Heart size={20} fill="currentColor" className="opacity-20" />
                    </div>

                    <div className="flex-1 hidden md:block" />
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Gallery - Editorial Style */}
        <section className={`py-40 px-8 ${layoutClass}`}>
          <div className="space-y-32">
            <div className="flex flex-col md:flex-row justify-between items-end gap-8">
              <h2 className="text-6xl md:text-8xl leading-none" style={{ fontFamily: theme.fonts.display }}>Moments<br/>Frozen in Time</h2>
              <p className="max-w-xs text-xs opacity-60 leading-relaxed uppercase tracking-widest">A visual collection of our journey toward the beginning of forever.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:auto-rows-[400px]">
              {invitation.gallery?.filter((img: any) => img && (typeof img === 'string' ? img : img.url)).slice(0, 5).map((img: any, idx: number) => {
                const url = typeof img === 'string' ? img : img.url;
                const spans = [
                  'md:col-span-12 md:row-span-2', 
                  'md:col-span-7 md:row-span-1',
                  'md:col-span-5 md:row-span-1',
                  'md:col-span-5 md:row-span-2',
                  'md:col-span-7 md:row-span-2'
                ];
                return (
                  <motion.button
                    key={idx}
                    initial={{ opacity: 0, filter: 'grayscale(100%)' }}
                    whileInView={{ opacity: 1, filter: 'grayscale(0%)' }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    viewport={{ once: true }}
                    onClick={() => setSelectedImage(url)}
                    className={`${spans[idx % spans.length]} bg-slate-300 rounded-[2.5rem] overflow-hidden shadow-xl group cursor-pointer relative block`}
                  >
                    <img src={url} alt={`Gallery ${idx}`} className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110 group-hover:rotate-1" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <Sparkles className="text-white" size={32} />
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Gift Section */}
        {invitation.isGiftEnabled && (
          <section className="py-40 px-8 bg-current/5">
            <div className={`${layoutClass} text-center space-y-16`}>
              <div className="space-y-4">
                <Gift className="mx-auto opacity-20" size={48} />
                <h2 className="text-5xl font-serif" style={{ fontFamily: theme.fonts.display }}>Love & Gift</h2>
                <p className="text-xs uppercase tracking-widest opacity-60 max-w-sm mx-auto leading-loose">While your presence is the greatest gift, your well wishes may be shared here.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {invitation.bankAccounts?.map((acc: any, i: number) => (
                  <div key={i} className="p-12 bg-white/40 backdrop-blur-3xl rounded-[3rem] border border-white flex flex-col justify-between items-center text-center space-y-8 group transition-all hover:bg-white/80">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-4">{acc.bankName}</p>
                      <p className="text-2xl font-serif mb-2">{acc.accountNumber}</p>
                      <p className="text-sm opacity-60">{acc.accountHolder}</p>
                    </div>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(acc.accountNumber);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="px-8 py-3 bg-black text-white rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
                    >
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                      {copied ? 'Copied' : 'Copy Items'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* RSVP Section */}
        <section className="py-40 px-8 bg-current/5 backdrop-blur-3xl">
          <div className={`${layoutClass} space-y-20`}>
            <div className="text-center space-y-4">
              <p className="text-[10px] uppercase tracking-[0.5em] opacity-40">Reservation</p>
              <h2 className="text-5xl md:text-7xl italic" style={{ fontFamily: theme.fonts.display }}>Will You Join Us?</h2>
            </div>

            <div className="max-w-xl mx-auto">
              {!rsvpDone ? (
                <form onSubmit={handleSubmitRSVP} className="p-12 bg-white/40 backdrop-blur-md rounded-[3rem] border border-white space-y-8">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest opacity-40 font-bold ml-1">Full Name</label>
                      <input 
                        value={rsvpData.name}
                        onChange={(e) => setRsvpData({ ...rsvpData, name: e.target.value })}
                        className="w-full bg-transparent border-b border-current/20 py-4 outline-none focus:border-current transition-colors text-lg"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest opacity-40 font-bold ml-1">Attendance Status</label>
                      <select 
                        value={rsvpData.status}
                        onChange={(e) => setRsvpData({ ...rsvpData, status: e.target.value })}
                        className="w-full bg-transparent border-b border-current/20 py-4 outline-none focus:border-current transition-colors text-lg appearance-none"
                      >
                        <option value="Hadir">Yes, I will attend</option>
                        <option value="Berhalangan Hadir">Sorry, I can't come</option>
                      </select>
                    </div>
                    {rsvpData.status === 'Hadir' && (
                      <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                        <label className="text-[10px] uppercase tracking-widest opacity-40 font-bold ml-1">Number of Guests</label>
                        <select 
                          value={rsvpData.count}
                          onChange={(e) => setRsvpData({ ...rsvpData, count: e.target.value })}
                          className="w-full bg-transparent border-b border-current/20 py-4 outline-none focus:border-current transition-colors text-lg appearance-none"
                        >
                          {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} Person{n > 1 ? 's' : ''}</option>)}
                        </select>
                      </div>
                    )}
                  </div>
                  <button 
                    type="submit"
                    disabled={isSubmittingRSVP}
                    className="w-full py-6 bg-black text-white rounded-full font-bold uppercase tracking-[0.3em] text-[10px] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                  >
                    {isSubmittingRSVP ? 'Processing...' : 'Confirm Attendance'}
                  </button>
                </form>
              ) : (
                <div className="text-center p-12 bg-white/40 backdrop-blur-md rounded-[3rem] border border-white space-y-6">
                  <div className="w-20 h-20 bg-black text-white rounded-full flex items-center justify-center mx-auto">
                    <Check size={32} />
                  </div>
                  <h3 className="text-3xl font-serif italic">Thank You!</h3>
                  <p className="opacity-60 max-w-xs mx-auto">Your reservation has been confirmed. We can't wait to see you!</p>
                  <button onClick={() => setRsvpDone(false)} className="text-[10px] uppercase font-bold tracking-widest opacity-40 hover:opacity-100 transition-opacity">Edit Response</button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Guestbook Section */}
        <section className={`py-20 md:py-40 px-6 md:px-8 ${layoutClass} space-y-12 md:space-y-20`}>
          <div className="flex flex-col md:flex-row justify-between items-center md:items-end gap-6 md:gap-8 text-center md:text-left">
            <div className="space-y-4">
              <MessageCircle className="mx-auto md:mx-0 opacity-20" size={40} />
              <h2 className="text-4xl sm:text-6xl font-serif leading-none" style={{ fontFamily: theme.fonts.display }}>Guest Book</h2>
            </div>
            <p className="text-[10px] uppercase tracking-widest opacity-40">Leave a sweet note for us</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">
            {/* Form */}
            <form onSubmit={handleSubmitWish} className="p-6 md:p-12 bg-white/40 backdrop-blur-3xl rounded-[2rem] md:rounded-[3rem] border border-white space-y-6 md:space-y-8">
              <div className="space-y-4">
                <input 
                  value={newWish.name}
                  onChange={(e) => setNewWish({ ...newWish, name: e.target.value })}
                  placeholder="Full Name"
                  className="w-full bg-transparent border-b border-current/10 py-4 outline-none focus:border-current transition-colors font-medium"
                />
                <textarea 
                  value={newWish.message}
                  onChange={(e) => setNewWish({ ...newWish, message: e.target.value })}
                  placeholder="Your message and blessings..."
                  className="w-full bg-transparent border-b border-current/10 py-4 h-32 outline-none focus:border-current transition-colors font-medium resize-none"
                />
              </div>
              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full py-5 bg-black text-white rounded-full font-bold uppercase tracking-[0.2em] text-[10px] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Sending...' : 'Publish Message'}
              </button>
            </form>

            {/* List */}
            <div className="space-y-6 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
              {wishes.map((wish, i) => (
                <div key={i} className="p-8 border-b border-current/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-sm uppercase tracking-widest">{wish.name}</h5>
                    <Sparkles size={12} className="opacity-20" />
                  </div>
                  <p className="text-lg font-serif italic opacity-80 leading-relaxed md:text-xl">"{wish.message}"</p>
                </div>
              ))}
              {wishes.length === 0 && <p className="text-center opacity-40 italic py-12">No messages yet. Be the first!</p>}
            </div>
          </div>
        </section>

        {/* Closing */}
        <section className="py-24 md:py-40 px-6 md:px-8 text-center space-y-12 md:space-y-20">
          <div className="w-px h-24 md:h-32 mx-auto bg-current opacity-20" />
          <div className="space-y-8">
            <h2 className="text-4xl sm:text-6xl md:text-8xl leading-none break-words" style={{ fontFamily: theme.fonts.display }}>Love, <br/> Always.</h2>
            <p className="text-xs sm:text-sm tracking-[0.4em] uppercase opacity-40 font-bold">{invitation.brideNickname} & {invitation.groomNickname}</p>
          </div>
          <p className="text-[10px] opacity-40 uppercase tracking-[0.2em]">Crafted with passion for your special day</p>
        </section>
      </div>

      {/* Floating Elements */}
      <motion.button 
        onClick={toggleMusic}
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-10 right-10 z-[200] flex items-center gap-4 p-4 bg-white/20 backdrop-blur-3xl rounded-full border border-white/20 shadow-2xl group overflow-hidden"
      >
        <div className="flex items-center gap-1 h-4">
          {[1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              animate={{
                scaleY: isPlaying ? [1, 2, 1] : 1,
                opacity: isPlaying ? [0.3, 1, 0.3] : 0.3
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.15
              }}
              className="w-0.5 h-2 bg-white rounded-full origin-center"
            />
          ))}
        </div>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={isPlaying ? 'pause' : 'play'}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {isPlaying ? (
              <Pause className="text-white fill-white/20" size={18} />
            ) : (
              <Play className="text-white fill-white/20" size={18} />
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
            className="fixed inset-0 z-[300] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-10"
          >
            <motion.button
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              className="absolute top-8 right-8 text-white bg-white/10 p-3 rounded-full hover:bg-white/30 transition-all hover:scale-110"
              onClick={() => setSelectedImage(null)}
            >
              <X size={28} />
            </motion.button>
            <motion.img
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: -50 }}
              src={selectedImage}
              alt="Full view"
              className="max-w-full max-h-[85vh] rounded-[2rem] shadow-2xl pointer-events-none"
              referrerPolicy="no-referrer"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CreativeEliteTemplate;
