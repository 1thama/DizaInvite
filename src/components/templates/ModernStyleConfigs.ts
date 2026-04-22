
export interface ModernTheme {
  id: string;
  name: string;
  colors: {
    bg: string;
    text: string;
    primary: string;
    accent: string;
    card: string;
    input: string;
  };
  fonts: {
    display: string;
    body: string;
  };
  background: string;
  layout: 'centered' | 'split' | 'minimal';
}

export const MODERN_CONFIGS: Record<string, ModernTheme> = {
  modern_clean_white: {
    id: 'modern_clean_white',
    name: 'Serene White',
    colors: {
      bg: '#FFFFFF',
      text: '#2D3436',
      primary: '#636E72',
      accent: '#B2BEC3',
      card: '#F9F9F9',
      input: '#F1F2F6'
    },
    fonts: {
      display: "'Lora', serif",
      body: "'Plus Jakarta Sans', sans-serif"
    },
    background: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=2070&auto=format&fit=crop',
    layout: 'centered'
  },
  modern_warm_beige: {
    id: 'modern_warm_beige',
    name: 'Warm Beige',
    colors: {
      bg: '#FDFCF0',
      text: '#4A4A4A',
      primary: '#C5A059',
      accent: '#E5D9B6',
      card: '#FFFFFF',
      input: '#F8F5E9'
    },
    fonts: {
      display: "'Playfair Display', serif",
      body: "'Plus Jakarta Sans', sans-serif"
    },
    background: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=800&auto=format&fit=crop',
    layout: 'minimal'
  },
  modern_dusty_rose: {
    id: 'modern_dusty_rose',
    name: 'Dusty Rose',
    colors: {
      bg: '#FFF5F5',
      text: '#5D4037',
      primary: '#A67C7C',
      accent: '#D4B8B8',
      card: '#FFFFFF',
      input: '#FFF9F9'
    },
    fonts: {
      display: "'Lora', serif",
      body: "'Plus Jakarta Sans', sans-serif"
    },
    background: 'https://images.unsplash.com/photo-1533616688419-b7a585564566?q=80&w=800&auto=format&fit=crop',
    layout: 'centered'
  },
  modern_classic_grey: {
    id: 'modern_classic_grey',
    name: 'Classic Grey',
    colors: {
      bg: '#F8F9FA',
      text: '#212529',
      primary: '#495057',
      accent: '#CED4DA',
      card: '#FFFFFF',
      input: '#E9ECEF'
    },
    fonts: {
      display: "'Playfair Display', serif",
      body: "'Plus Jakarta Sans', sans-serif"
    },
    background: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop',
    layout: 'minimal'
  }
};
