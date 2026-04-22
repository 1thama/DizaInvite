import React from 'react';
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
import { ELITE_CONFIGS } from './templates/CreativeEliteConfigs';
import { MODERN_CONFIGS } from './templates/ModernStyleConfigs';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const DUMMY_DATA = {
  brideName: 'Emily Sophia Watson',
  brideNickname: 'Emily',
  brideFather: 'Mr. Robert Watson',
  brideMother: 'Mrs. Sarah Watson',
  bridePhoto: 'https://picsum.photos/seed/bride-sample/800/1200',
  groomName: 'Alexander James Miller',
  groomNickname: 'Alex',
  groomFather: 'Mr. William Miller',
  groomMother: 'Mrs. Elizabeth Miller',
  groomPhoto: 'https://picsum.photos/seed/groom-sample/800/1200',
  weddingDate: { toDate: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
  akadTime: '10:00 AM - 11:30 AM',
  akadLocation: 'St. Patrick\'s Cathedral, New York',
  receptionTime: '01:00 PM - 04:00 PM',
  receptionLocation: 'The Plaza Hotel, Fifth Avenue, NY',
  googleMapsUrl: 'https://maps.google.com',
  musicUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  gallery: [
    'https://picsum.photos/seed/gallery-1/800/1200',
    'https://picsum.photos/seed/gallery-2/800/1200',
    'https://picsum.photos/seed/gallery-3/800/1200',
    'https://picsum.photos/seed/gallery-4/800/1200',
    'https://picsum.photos/seed/gallery-5/800/1200',
    'https://picsum.photos/seed/gallery-6/800/1200',
  ],
  heroImage: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=2070&auto=format&fit=crop',
  isGiftEnabled: true,
  bankAccounts: [
    { bankName: 'BCA', accountNumber: '1234567890', accountHolder: 'Emily Sophia' },
    { bankName: 'Mandiri', accountNumber: '0987654321', accountHolder: 'Alexander James' }
  ],
  loveStory: [
    { year: '2019', title: 'Pertemuan Pertama', description: 'Takdir mempertemukan kami di sebuah perayaan sederhana sahabat karib.' },
    { year: '2021', title: 'Janji Setia', description: 'Di bawah langit senja, kami memutuskan untuk melangkah bersama selamanya.' },
    { year: '2024', title: 'Hari Bahagia', description: 'Kini, kami memulai babak baru dalam janji suci pernikahan.' }
  ]
};

const DUMMY_GUESTS = [
  'Mr. & Mrs. John Smith',
  'The Anderson Family',
  'College Best Friends',
  'Office Colleagues',
  'Special Invited Guest'
];

interface TemplatePreviewProps {
  templateId: string;
  onClose: () => void;
}

const TemplatePreview: React.FC<TemplatePreviewProps> = ({ templateId, onClose }) => {
  // Use a random guest name from the list for variety
  const randomGuest = DUMMY_GUESTS[Math.floor(Math.random() * DUMMY_GUESTS.length)];

  const props = { 
    invitation: { ...DUMMY_DATA, templateId }, 
    guestName: randomGuest 
  };

  const renderTemplate = () => {
    // Check if it's an Elite template
    if (templateId in ELITE_CONFIGS) {
      return <CreativeEliteTemplate invitation={props.invitation} guestName={props.guestName} theme={ELITE_CONFIGS[templateId]} />;
    }

    // Check if it's a Modern style template
    if (templateId in MODERN_CONFIGS) {
      return <ModernStyleTemplate invitation={props.invitation} guestName={props.guestName} theme={MODERN_CONFIGS[templateId]} />;
    }

    switch (templateId) {
      case 'jawa_royal': return <JavaneseRoyalTemplate {...props} />;
      case 'sunda_serene': return <SundaneseRomanticTemplate {...props} />;
      case 'minang_luxury': return <MinangLuxuryTemplate {...props} />;
      case 'bali_sacred': return <BalineseSpiritualTemplate {...props} />;
      case 'bugis_silk': return <BugisSacredTemplate {...props} />;
      case 'batak_legacy': return <BatakEthnicTemplate {...props} />;
      case 'palembang_glory': return <PalembangGloryTemplate {...props} />;
      default: return <PalembangGloryTemplate {...props} />;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-white flex flex-col"
    >
      <div className="fixed top-6 left-6 z-[110] flex items-center gap-4">
        <button 
          onClick={onClose}
          className="w-12 h-12 bg-slate-900 text-white rounded-full flex items-center justify-center hover:bg-slate-800 transition-colors shadow-2xl border border-white/20"
        >
          <X size={24} />
        </button>
        <div className="hidden md:flex flex-col items-start bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-2xl shadow-sm border border-slate-100">
          <span className="text-[9px] font-bold text-rose-500 uppercase tracking-widest mb-0.5">Live Demo Mode</span>
          <span className="text-xs font-bold text-slate-900">Previewing: {templateId}</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {renderTemplate()}
      </div>
    </motion.div>
  );
};

export default TemplatePreview;
