
export interface EliteTheme {
  id: string;
  name: string;
  mood: string;
  colors: {
    bg: string;
    text: string;
    primary: string;
    accent: string;
    card: string;
  };
  fonts: {
    display: string;
    body: string;
    heading: string;
  };
  background: string;
  ornament?: string;
  texture?: string;
  layout: 'minimal' | 'editorial' | 'geometric' | 'experimental';
}

export const ELITE_CONFIGS: Record<string, EliteTheme> = {
  modern_minimal: {
    id: 'modern_minimal',
    name: 'Modern Minimal',
    mood: 'Serene & Honest',
    colors: {
      bg: '#F5F5F5',
      text: '#1A1A1A',
      primary: '#2D3436',
      accent: '#B2BEC3',
      card: '#FFFFFF'
    },
    fonts: {
      display: "'Cormorant Garamond', serif",
      heading: "'Inter', sans-serif",
      body: "'Inter', sans-serif"
    },
    background: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?q=80&w=2067&auto=format&fit=crop',
    layout: 'minimal'
  },
  editorial_fashion: {
    id: 'editorial_fashion',
    name: 'Editorial Fashion',
    mood: 'Bold & Cinematic',
    colors: {
      bg: '#0A0A0A',
      text: '#FFFFFF',
      primary: '#F0F0F0',
      accent: '#D4AF37',
      card: 'rgba(255,255,255,0.05)'
    },
    fonts: {
      display: "'Playfair Display', serif",
      heading: "'Playfair Display', serif",
      body: "'Inter', sans-serif"
    },
    background: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop',
    layout: 'editorial'
  },
  abstract_geometric: {
    id: 'abstract_geometric',
    name: 'Abstract Geometric',
    mood: 'Structured & Sophisticated',
    colors: {
      bg: '#E9E3D5',
      text: '#1E3799',
      primary: '#B71540',
      accent: '#079992',
      card: 'rgba(255,255,255,0.8)'
    },
    fonts: {
      display: "'Space Grotesk', sans-serif",
      heading: "'Space Grotesk', sans-serif",
      body: "'Inter', sans-serif"
    },
    background: 'https://images.unsplash.com/photo-1550684376-efcbd6e3f031?q=80&w=2070&auto=format&fit=crop',
    layout: 'geometric'
  },
  botanical_contemporary: {
    id: 'botanical_contemporary',
    name: 'Botanical Contemporary',
    mood: 'Organic & Fresh',
    colors: {
      bg: '#F2F2F2',
      text: '#2C3E50',
      primary: '#27ae60',
      accent: '#95a5a6',
      card: '#FFFFFF'
    },
    fonts: {
      display: "'Playfair Display', serif",
      heading: "'JetBrains Mono', monospace",
      body: "'Inter', sans-serif"
    },
    background: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?q=80&w=2070&auto=format&fit=crop',
    layout: 'minimal'
  },
  luxury_monochrome: {
    id: 'luxury_monochrome',
    name: 'Luxury Monochrome',
    mood: 'Timeless Prestige',
    colors: {
      bg: '#000000',
      text: '#FFFFFF',
      primary: '#E0E0E0',
      accent: '#9E9E9E',
      card: 'rgba(20,20,20,0.9)'
    },
    fonts: {
      display: "'Playfair Display', serif",
      heading: "'Playfair Display', serif",
      body: "'Inter', sans-serif"
    },
    background: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?q=80&w=1974&auto=format&fit=crop',
    layout: 'editorial'
  },
  experimental_typography: {
    id: 'experimental_typography',
    name: 'Experimental Type',
    mood: 'Edgy & Artistic',
    colors: {
      bg: '#121212',
      text: '#FFFFFF',
      primary: '#CCFF00',
      accent: '#FF00FF',
      card: 'rgba(255,255,255,0.03)'
    },
    fonts: {
      display: "'Space Grotesk', sans-serif",
      heading: "'Space Grotesk', sans-serif",
      body: "'Space Grotesk', sans-serif"
    },
    background: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1964&auto=format&fit=crop',
    layout: 'experimental'
  }
};
