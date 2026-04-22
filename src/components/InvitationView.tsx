import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { db, collection, query, where, onSnapshot, doc, getDoc, updateDoc, serverTimestamp, limit } from '../firebase';
import { 
  JavaneseRoyalTemplate,
  SundaneseRomanticTemplate,
  MinangLuxuryTemplate,
  BalineseSpiritualTemplate,
  BugisSacredTemplate,
  BatakEthnicTemplate,
  PalembangGloryTemplate,
  CreativeEliteTemplate,
  ModernStyleTemplate
} from './templates';

const InvitationView = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const guestName = searchParams.get('to') || 'Tamu Undangan';
  const guestId = searchParams.get('gid') || null;
  
  const [invitation, setInvitation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [consumer, setConsumer] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem('consumer_user');
    if (saved) setConsumer(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (guestId) {
      updateDoc(doc(db, "guests", guestId), {
        isOpened: true,
        openedAt: serverTimestamp()
      }).catch(err => console.error("Error updating opened status:", err));
    }
  }, [guestId]);

  useEffect(() => {
    if (!slug) return;

    // Try to find by slug first
    const q = query(
      collection(db, "invitations"), 
      where("slug", "==", slug),
      limit(1)
    );
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      if (!snapshot.empty) {
        setInvitation({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
        setLoading(false);
      } else {
        // If not found by slug, try by ID (fallback)
        try {
          const docRef = doc(db, "invitations", slug);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setInvitation({ id: docSnap.id, ...docSnap.data() });
          }
        } catch (err) {
          console.error("Error fetching by ID:", err);
        }
        setLoading(false);
      }
    }, (err) => {
      console.error("Snapshot listener error in InvitationView:", err);
      // Fallback: try by ID if slug lookup fails due to permissions (unlikely now with public rules)
      if (slug) {
        getDoc(doc(db, "invitations", slug))
          .then(docSnap => {
            if (docSnap.exists()) setInvitation({ id: docSnap.id, ...docSnap.data() });
          })
          .catch(e => console.error("ID fallback error:", e))
          .finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-bg">
        <div className="animate-pulse text-brand-accent font-serif text-2xl">Memuat Undangan...</div>
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-bg p-6 text-center">
        <div className="max-w-md">
          <h2 className="text-3xl font-serif text-brand-text mb-4">Undangan Tidak Ditemukan</h2>
          <p className="text-brand-text/60">Maaf, link yang Anda tuju tidak valid atau telah dihapus.</p>
        </div>
      </div>
    );
  }

  const props = { invitation, guestName, guestId };

  const renderTemplate = () => {
    // Handle category-based groups
    if (invitation.templateId?.startsWith('elite_')) {
      const themeKey = invitation.templateId as any;
      const theme = (window as any).ELITE_CONFIGS?.[themeKey] || (window as any).ELITE_CONFIGS?.elite_modern_minimal;
      // We need to import configs too or find a better way. 
      // Actually CreativeEliteTemplate likely imports its own configs.
      // Looking at Editor.tsx usage would be better.
    }

    // Let's use a simpler switch that handles the IDs correctly
    const tid = invitation.templateId;
    if (tid?.startsWith('elite_')) return <CreativeEliteTemplate key={invitation.id} {...props} theme={(invitation as any).theme || {}} />;
    if (tid?.startsWith('modern_')) return <ModernStyleTemplate key={invitation.id} {...props} theme={(invitation as any).theme || {}} />;

    switch (tid) {
      case 'jawa_royal': return <JavaneseRoyalTemplate key={invitation.id} {...props} />;
      case 'sunda_serene': return <SundaneseRomanticTemplate key={invitation.id} {...props} />;
      case 'minang_luxury': return <MinangLuxuryTemplate key={invitation.id} {...props} />;
      case 'bali_sacred': return <BalineseSpiritualTemplate key={invitation.id} {...props} />;
      case 'bugis_silk': return <BugisSacredTemplate key={invitation.id} {...props} />;
      case 'batak_legacy': return <BatakEthnicTemplate key={invitation.id} {...props} />;
      case 'palembang_glory': return <PalembangGloryTemplate key={invitation.id} {...props} />;
      case 'creative_elite': return <CreativeEliteTemplate key={invitation.id} {...props} theme={(invitation as any).theme || {}} />;
      case 'modern_style': return <ModernStyleTemplate key={invitation.id} {...props} theme={(invitation as any).theme || {}} />;
      default: return <PalembangGloryTemplate key={invitation.id} {...props} />;
    }
  };

  return (
    <>
      {consumer && (
        <button 
          onClick={() => navigate('/create')}
          className="fixed top-6 left-6 z-[200] bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-full shadow-2xl transition-all hover:scale-110 active:scale-95 group flex items-center justify-center hover:bg-white hover:text-black w-12 h-12"
          title="Kembali ke Dashboard"
        >
          <X size={24} className="text-white group-hover:text-black transition-colors" />
        </button>
      )}
      {renderTemplate()}
    </>
  );
};

export default InvitationView;
