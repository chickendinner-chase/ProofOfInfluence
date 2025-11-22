/**
 * ProjectEX Roblox-Inspired Theme
 * 
 * Design Principles:
 * - Bright, colorful, and playful
 * - Rounded cards and buttons
 * - Gamification elements (badges, progress bars)
 * - 3D effects and shadows
 * - Block/brick aesthetic
 * - Friendly and approachable
 */

export const robloxTheme = {
  // Color Palette
  colors: {
    // Base backgrounds
    background: {
      primary: '#ffffff',      // White
      secondary: '#f5f5f8',    // Light gray
      tertiary: '#e8e8f0',     // Card backgrounds
      elevated: '#ffffff',     // Elevated cards
    },
    
    // Vibrant colors (Roblox-style)
    vibrant: {
      blue: '#0066ff',         // Primary blue
      green: '#00cc66',        // Success green
      yellow: '#ffcc00',       // Warning yellow
      red: '#ff3366',          // Error red
      purple: '#9933ff',       // Premium purple
      orange: '#ff6600',       // Accent orange
      pink: '#ff66cc',         // Fun pink
      cyan: '#00ccff',         // Info cyan
    },
    
    // Pastel backgrounds
    pastel: {
      blue: '#e6f2ff',
      green: '#e6fff2',
      yellow: '#fff9e6',
      red: '#ffe6ec',
      purple: '#f2e6ff',
      orange: '#fff0e6',
    },
    
    // Text
    text: {
      primary: '#1a1a2e',      // Almost black
      secondary: '#4a4a68',    // Dark gray
      muted: '#8a8aa8',        // Muted gray
      inverse: '#ffffff',      // White text
    },
    
    // Borders
    border: {
      light: '#e0e0f0',
      medium: '#c0c0d8',
      dark: '#a0a0c0',
    },
  },
  
  // Typography
  fonts: {
    display: '"Fredoka", "Poppins", "Nunito", sans-serif',  // Fun, rounded headers
    body: '"Poppins", "Inter", sans-serif',                  // Clean body text
    mono: '"JetBrains Mono", monospace',                     // Code/numbers
  },
  
  // Effects
  effects: {
    // 3D shadows
    shadow3D: {
      sm: '0 2px 0 rgba(0,0,0,0.1), 0 4px 8px rgba(0,0,0,0.15)',
      md: '0 4px 0 rgba(0,0,0,0.1), 0 8px 16px rgba(0,0,0,0.2)',
      lg: '0 8px 0 rgba(0,0,0,0.1), 0 16px 32px rgba(0,0,0,0.25)',
    },
    
    // Soft inner shadows
    innerShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
    
    // Colorful glows
    glowBlue: '0 0 20px rgba(0, 102, 255, 0.4)',
    glowGreen: '0 0 20px rgba(0, 204, 102, 0.4)',
    glowPurple: '0 0 20px rgba(153, 51, 255, 0.4)',
    
    // Gradient overlays
    gradients: {
      bluePurple: 'linear-gradient(135deg, #0066ff 0%, #9933ff 100%)',
      greenCyan: 'linear-gradient(135deg, #00cc66 0%, #00ccff 100%)',
      orangePink: 'linear-gradient(135deg, #ff6600 0%, #ff66cc 100%)',
      rainbow: 'linear-gradient(135deg, #0066ff 0%, #00cc66 33%, #ffcc00 66%, #ff3366 100%)',
    },
  },
  
  // Border Radius (extra rounded for Roblox feel)
  radius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    '2xl': '32px',
    full: '9999px',
  },
  
  // Animation
  animations: {
    // Bounce on click
    bounce: 'bounce-click 0.3s ease-in-out',
    
    // Pop in
    popIn: 'pop-in 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    
    // Wiggle
    wiggle: 'wiggle 0.5s ease-in-out',
    
    // Shimmer
    shimmer: 'shimmer 2s linear infinite',
    
    // Float
    float: 'float 3s ease-in-out infinite',
  },
  
  // Component presets
  components: {
    // Card
    card: {
      base: 'bg-white rounded-2xl shadow-lg border-2 border-gray-200',
      hover: 'hover:shadow-xl hover:-translate-y-1 transition-all duration-300',
      colored: 'bg-gradient-to-br shadow-2xl border-0',
      game: 'bg-white rounded-xl p-6 border-4 border-b-8', // Extra bottom border for 3D effect
    },
    
    // Button
    button: {
      primary: 'bg-blue-500 text-white rounded-xl px-6 py-3 font-bold shadow-[0_4px_0_#0052cc] hover:shadow-[0_2px_0_#0052cc] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px]',
      success: 'bg-green-500 text-white rounded-xl px-6 py-3 font-bold shadow-[0_4px_0_#00a855] hover:shadow-[0_2px_0_#00a855] hover:translate-y-[2px]',
      warning: 'bg-yellow-500 text-black rounded-xl px-6 py-3 font-bold shadow-[0_4px_0_#cc9900] hover:shadow-[0_2px_0_#cc9900] hover:translate-y-[2px]',
      playful: 'bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full px-8 py-4 font-bold shadow-lg hover:scale-105 transition-transform',
    },
    
    // Badge
    badge: {
      blue: 'bg-blue-100 text-blue-700 border-2 border-blue-300 rounded-full px-3 py-1 font-bold text-sm',
      green: 'bg-green-100 text-green-700 border-2 border-green-300 rounded-full px-3 py-1 font-bold text-sm',
      yellow: 'bg-yellow-100 text-yellow-700 border-2 border-yellow-300 rounded-full px-3 py-1 font-bold text-sm',
      purple: 'bg-purple-100 text-purple-700 border-2 border-purple-300 rounded-full px-3 py-1 font-bold text-sm',
    },
    
    // Progress bar
    progress: {
      container: 'bg-gray-200 rounded-full h-4 overflow-hidden border-2 border-gray-300',
      fill: 'bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full transition-all duration-500',
    },
    
    // Icon container
    icon: {
      sm: 'w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center',
      md: 'w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-lg',
      lg: 'w-20 h-20 rounded-3xl bg-gradient-to-br flex items-center justify-center shadow-xl',
    },
  },
  
  // Gamification elements
  gamification: {
    // Coin/reward display
    coin: 'inline-flex items-center gap-1 bg-yellow-100 border-2 border-yellow-400 rounded-full px-3 py-1 font-bold text-yellow-700',
    
    // Trophy/achievement
    trophy: 'bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-4 shadow-lg border-4 border-yellow-300',
    
    // Level badge
    level: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg shadow-lg',
    
    // Progress milestone
    milestone: 'relative bg-white rounded-full w-8 h-8 border-4 flex items-center justify-center font-bold',
  },
};

// CSS keyframes (to be added to global CSS or Tailwind config)
export const robloxKeyframes = `
  @keyframes bounce-click {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(0.95); }
  }
  
  @keyframes pop-in {
    0% { transform: scale(0); opacity: 0; }
    100% { transform: scale(1); opacity: 1; }
  }
  
  @keyframes wiggle {
    0%, 100% { transform: rotate(0deg); }
    25% { transform: rotate(-5deg); }
    75% { transform: rotate(5deg); }
  }
  
  @keyframes shimmer {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
`;

// Utility classes
export const robloxClasses = {
  // Brick/block pattern
  blockBg: 'bg-gradient-to-br from-blue-50 to-purple-50',
  
  // Game card
  gameCard: 'bg-white rounded-2xl p-6 shadow-[0_8px_0_rgba(0,0,0,0.1)] hover:shadow-[0_4px_0_rgba(0,0,0,0.1)] hover:translate-y-[4px] transition-all',
  
  // Stat display
  statDisplay: 'bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-2xl p-4 shadow-lg',
  
  // Achievement unlock
  achievement: 'bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 text-white rounded-2xl p-4 shadow-2xl animate-pulse',
};

