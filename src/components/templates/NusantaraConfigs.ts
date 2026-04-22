
// Images (References to generated assets)
import palembangBg from '../../assets/images/bg_palembang_luxury_1776836783740.png';
import javaneseBg from '../../assets/images/bg_java_royal_1776836803429.png';
import balineseBg from '../../assets/images/bg_bali_sacred_1776836819827.png';
import minangBg from '../../assets/images/bg_minang_gold_1776836837840.png';
import sundaneseBg from '../../assets/images/bg_sunda_serene_1776836854818.png';
import batakBg from '../../assets/images/bg_batak_legacy_1776836873922.png';
import bugisBg from '../../assets/images/bg_bugis_silk_1776836891766.png';

export interface NusantaraTheme {
  id: string;
  name: string;
  background: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    bg: string;
  };
  fonts: {
    display: string;
    serif: string;
    sans: string;
  };
  traditionalText: {
    opening: string;
    closing: string;
  };
}

export const NUSANTARA_CONFIGS: Record<string, NusantaraTheme> = {
  palembang_glory: {
    id: 'palembang_glory',
    name: 'Palembang Glory',
    background: palembangBg,
    colors: {
      primary: '#7F1D1D', // Deep Red
      secondary: '#B45309', // Amber/Gold
      accent: '#F59E0B', // Gold
      text: '#451A03',
      bg: '#FFFBEB'
    },
    fonts: {
      display: 'serif',
      serif: 'serif',
      sans: 'sans-serif'
    },
    traditionalText: {
      opening: 'Bebuko kato dengan Bismillah, mengharap keridhoan Allah SWT. Kami bermaksud mengundang Bapak/Ibu dalam Perayaan Walimatul Ursy...',
      closing: 'Demikian undangan ini kami sampaikan, teriring doa dan syukur atas kehadiran Bapak/Ibu sekalian.'
    }
  },
  jawa_royal: {
    id: 'jawa_royal',
    name: 'Jawa Royal',
    background: javaneseBg,
    colors: {
      primary: '#78350F', // Soga Brown
      secondary: '#451A03',
      accent: '#92400E',
      text: '#2D1B0D',
      bg: '#FFF9F2'
    },
    fonts: {
      display: 'serif',
      serif: 'serif',
      sans: 'sans-serif'
    },
    traditionalText: {
      opening: 'Nyuwun donga pangestu dumateng Gusti Allah SWT, anggenipun kawula badhe ngawontenaken hajat kanthi pranata adat Jawa...',
      closing: 'Matur nuwun sanget dumateng sedaya kawigatosan lan rawuh panjenengan sedaya.'
    }
  },
  bali_sacred: {
    id: 'bali_sacred',
    name: 'Bali Sacred',
    background: balineseBg,
    colors: {
      primary: '#BE185D', // Magenta/Pink
      secondary: '#7C2D12',
      accent: '#B45309',
      text: '#431407',
      bg: '#FFFDF5'
    },
    fonts: {
      display: 'serif',
      serif: 'serif',
      sans: 'sans-serif'
    },
    traditionalText: {
      opening: 'Om Swastyastu. Dengan memanjatkan puja dan puji syukur ke hadapan Ida Sang Hyang Widhi Wasa...',
      closing: 'Matur suksma atas doa restu dan kehadiran Bapak/Ibu/Saudara/i sekalian.'
    }
  },
  minang_luxury: {
    id: 'minang_luxury',
    name: 'Minang Luxury',
    background: minangBg,
    colors: {
      primary: '#064E3B', // Emerald
      secondary: '#7F1D1D', // Ruby Red
      accent: '#F59E0B',
      text: '#064E3B',
      bg: '#F0FDF4'
    },
    fonts: {
      display: 'serif',
      serif: 'serif',
      sans: 'sans-serif'
    },
    traditionalText: {
      opening: 'Siriah sakapiang mintak dikunyah, pinang sairis mintak di makan. Memadukan duo urang dalam ikatan suci parnikahan...',
      closing: 'Tarimo kasih ateh kadatangan Bapak/Ibu sadonyo. Wassalamualaikum Warahmatullahi Wabarakatuh.'
    }
  },
  sunda_serene: {
    id: 'sunda_serene',
    name: 'Sunda Serene',
    background: sundaneseBg,
    colors: {
      primary: '#5B21B6', // Lilac/Purple
      secondary: '#065F46',
      accent: '#A78BFA',
      text: '#2E1065',
      bg: '#F5F3FF'
    },
    fonts: {
      display: 'serif',
      serif: 'serif',
      sans: 'sans-serif'
    },
    traditionalText: {
      opening: 'Mugia aya dina pangriksa Gusti Allah SWT, sim kuring sakulawarga bade ngawontenaken akad parnikahan...',
      closing: 'Hatur nuhun kana sagala perhatosan sinareng doa restu ti sadayana.'
    }
  },
  batak_legacy: {
    id: 'batak_legacy',
    name: 'Batak Legacy',
    background: batakBg,
    colors: {
      primary: '#991B1B', // Red
      secondary: '#111827', // Black
      accent: '#FFFFFF',
      text: '#111827',
      bg: '#FEF2F2'
    },
    fonts: {
      display: 'serif',
      serif: 'serif',
      sans: 'sans-serif'
    },
    traditionalText: {
      opening: 'Diparade hita ma pangidoan tu Amanta Debata, laho padasiphon parbogason di bagasan holong ni roha...',
      closing: 'Mauliate godang di hamu saluhutna naung ro mandulo hami.'
    }
  },
  bugis_silk: {
    id: 'bugis_silk',
    name: 'Bugis Silk',
    background: bugisBg,
    colors: {
      primary: '#DB2777', // Hot Pink
      secondary: '#1E3A8A', // Navy
      accent: '#FCD34D',
      text: '#500724',
      bg: '#FDF2F8'
    },
    fonts: {
      display: 'serif',
      serif: 'serif',
      sans: 'sans-serif'
    },
    traditionalText: {
      opening: 'Mappatabe dolo ki ri puang Allahu Taala, makkoro lalakki naeng nritutui pammarisingna...',
      closing: 'Kurru sumange, tarima kasih polaki maneng ri kehadiratta.'
    }
  }
};
