/**
 * Professional Vector SVG Icon Library
 * Zero text emojis, crisp vector graphics for all UI elements and categories.
 */

export const Icons = {
  arrowLeft: (size = 22, color = 'currentColor') => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M19 12H5M12 19l-7-7 7-7"/>
    </svg>
  `,

  refresh: (size = 22, color = 'currentColor') => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3"/>
    </svg>
  `,

  pause: (size = 22, color = 'currentColor') => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <rect x="6" y="4" width="4" height="16" rx="1.5" fill="${color}"/>
      <rect x="14" y="4" width="4" height="16" rx="1.5" fill="${color}"/>
    </svg>
  `,

  play: (size = 22, color = 'currentColor') => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}">
      <path d="M7 4v16l13-8z"/>
    </svg>
  `,

  close: (size = 22, color = 'currentColor') => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  `,

  settings: (size = 22, color = 'currentColor') => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l-.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  `,

  trophy: (size = 22, color = 'currentColor') => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M6 9H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h2"/>
      <path d="M18 9h2a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-2"/>
      <path d="M4 22h16"/>
      <path d="M10 14.66V17c0 .55-.45 1-1 1H8c-.55 0-1 .45-1 1v1c0 .55.45 1 1 1h8c.55 0 1-.45 1-1v-1c0-.55-.45-1-1-1h-1c-.55 0-1-.45-1-1v-2.34"/>
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/>
    </svg>
  `,

  chart: (size = 22, color = 'currentColor') => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  `,

  book: (size = 22, color = 'currentColor') => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
    </svg>
  `,

  palette: (size = 22, color = 'currentColor') => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="13.5" cy="6.5" r=".5" fill="${color}"/>
      <circle cx="17.5" cy="10.5" r=".5" fill="${color}"/>
      <circle cx="8.5" cy="7.5" r=".5" fill="${color}"/>
      <circle cx="6.5" cy="12.5" r=".5" fill="${color}"/>
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.93 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.02-.23-.27-.38-.62-.38-1.03 0-.83.67-1.5 1.5-1.5H16c3.31 0 6-2.69 6-6 0-5.5-4.5-9.95-10-9.95z"/>
    </svg>
  `,

  // Rich Colorful 3D-feel Menu Icons
  menuBook: (size = 28) => `
    <svg width="${size}" height="${size}" viewBox="0 0 32 32" fill="none">
      <rect x="4" y="5" width="24" height="22" rx="4" fill="#3b82f6"/>
      <path d="M4 23c4 0 8 1 12 3 4-2 8-3 12-3V5c-4 0-8 1-12 3-4-2-8-3-12-3v18z" fill="#60a5fa"/>
      <path d="M16 8v18" stroke="#1e3a8a" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="8" y1="12" x2="13" y2="12" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>
      <line x1="8" y1="16" x2="13" y2="16" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>
      <line x1="19" y1="12" x2="24" y2="12" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>
      <line x1="19" y1="16" x2="24" y2="16" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>
    </svg>
  `,

  menuStats: (size = 28) => `
    <svg width="${size}" height="${size}" viewBox="0 0 32 32" fill="none">
      <rect x="5" y="16" width="5" height="11" rx="2" fill="#38bdf8"/>
      <rect x="13.5" y="7" width="5" height="20" rx="2" fill="#22c55e"/>
      <rect x="22" y="12" width="5" height="15" rx="2" fill="#f59e0b"/>
      <path d="M4 28h24" stroke="#1e354d" stroke-width="2.5" stroke-linecap="round"/>
    </svg>
  `,

  menuTrophy: (size = 28) => `
    <svg width="${size}" height="${size}" viewBox="0 0 32 32" fill="none">
      <path d="M8 8H4a2 2 0 0 0-2 2v2a6 6 0 0 0 6 6h1" stroke="#d97706" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M24 8h4a2 2 0 0 1 2 2v2a6 6 0 0 1-6 6h-1" stroke="#d97706" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M7 6h18v8a9 9 0 0 1-18 0V6z" fill="#facc15" stroke="#d97706" stroke-width="2"/>
      <path d="M12 22h8v2h-8z" fill="#d97706"/>
      <path d="M10 24h12v3H10z" fill="#f59e0b" stroke="#b45309" stroke-width="1.5" rx="1.5"/>
      <polygon points="16,8 17.5,11.5 21,11.5 18,13.5 19.5,17 16,15 12.5,17 14,13.5 11,11.5 14.5,11.5" fill="#ffffff"/>
    </svg>
  `,

  menuPalette: (size = 28) => `
    <svg width="${size}" height="${size}" viewBox="0 0 32 32" fill="none">
      <path d="M16 3C8.8 3 3 8.8 3 16c0 3.6 1.5 6.8 4 9 1.2 1.1 2.8 1.7 4.4 1.4 1.3-.2 2.3-1.3 2.6-2.6.3-1.4 1.5-2.4 3-2.4h2c4.4 0 8-3.6 8-8 0-5.8-4.7-10.4-11-10.4z" fill="#ec4899" stroke="#be185d" stroke-width="2"/>
      <circle cx="9.5" cy="11.5" r="2.2" fill="#38bdf8"/>
      <circle cx="16" cy="8.5" r="2.2" fill="#facc15"/>
      <circle cx="22.5" cy="12.5" r="2.2" fill="#4ade80"/>
      <circle cx="19.5" cy="18.5" r="2.2" fill="#a855f7"/>
    </svg>
  `,

  menuSettings: (size = 28) => `
    <svg width="${size}" height="${size}" viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="12" fill="#64748b"/>
      <circle cx="16" cy="16" r="5" fill="#f8fafc" stroke="#334155" stroke-width="2"/>
      <path d="M16 2v4M16 26v4M2 16h4M26 16h4M6.1 6.1l2.8 2.8M23.1 23.1l2.8 2.8M6.1 25.9l2.8-2.8M23.1 8.9l2.8-2.8" stroke="#334155" stroke-width="3" stroke-linecap="round"/>
    </svg>
  `,

  sparkle: (size = 24, color = '#ffffff') => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}">
      <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5z"/>
    </svg>
  `,

  // Category Tiles matching references:
  house: (size = 26, color = '#2d2538') => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}">
      <path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3z"/>
    </svg>
  `,

  cardsSmall: () => `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%;">
      <svg width="24" height="20" viewBox="0 0 32 24" fill="#2d2538">
        <rect x="2" y="5" width="10" height="15" rx="1.5" transform="rotate(-20 2 5)" fill="#2d2538"/>
        <rect x="8" y="2" width="10" height="16" rx="1.5" transform="rotate(-8 8 2)" fill="#3d334d"/>
        <rect x="14" y="2" width="10" height="16" rx="1.5" transform="rotate(8 14 2)" fill="#2d2538"/>
        <rect x="20" y="5" width="10" height="15" rx="1.5" transform="rotate(20 20 5)" fill="#3d334d"/>
      </svg>
      <span style="font-size: 0.52rem; font-weight: 900; letter-spacing: 0.05em; color: #2d2538; margin-top: 1px;">SMALL</span>
    </div>
  `,

  cardsLarge: () => `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%;">
      <svg width="26" height="20" viewBox="0 0 36 24" fill="#2d2538">
        <rect x="2" y="6" width="9" height="14" rx="1.5" transform="rotate(-28 2 6)" fill="#2d2538"/>
        <rect x="7" y="3" width="9" height="15" rx="1.5" transform="rotate(-14 7 3)" fill="#3d334d"/>
        <rect x="13" y="1" width="9" height="16" rx="1.5" transform="rotate(0 13 1)" fill="#2d2538"/>
        <rect x="19" y="3" width="9" height="15" rx="1.5" transform="rotate(14 19 3)" fill="#3d334d"/>
        <rect x="24" y="6" width="9" height="14" rx="1.5" transform="rotate(28 24 6)" fill="#2d2538"/>
      </svg>
      <span style="font-size: 0.52rem; font-weight: 900; letter-spacing: 0.05em; color: #2d2538; margin-top: 1px;">LARGE</span>
    </div>
  `,

  yatzyLogo: () => `
    <div style="
      font-size: 0.72rem;
      font-weight: 900;
      color: #ffd200;
      text-shadow:
        -1px -1px 0 #2d2538,
        1px -1px 0 #2d2538,
        -1px 1px 0 #2d2538,
        1px 1px 0 #2d2538,
        0 2px 0 #2d2538;
      letter-spacing: -0.02em;
      transform: rotate(-3deg);
    ">
      YATZY
    </div>
  `,

  question: (size = 24, color = '#2d2538') => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="18" r="1.5" fill="${color}"/>
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
    </svg>
  `,

  dieFaceTile: (value: number) => {
    // Generates the mini die face tile for upper section matching reference screenshot
    const pips: Record<number, Array<{cx: number, cy: number}>> = {
      1: [{ cx: 12, cy: 12 }],
      2: [{ cx: 7, cy: 7 }, { cx: 17, cy: 17 }],
      3: [{ cx: 7, cy: 7 }, { cx: 12, cy: 12 }, { cx: 17, cy: 17 }],
      4: [{ cx: 7, cy: 7 }, { cx: 17, cy: 7 }, { cx: 7, cy: 17 }, { cx: 17, cy: 17 }],
      5: [{ cx: 7, cy: 7 }, { cx: 17, cy: 7 }, { cx: 12, cy: 12 }, { cx: 7, cy: 17 }, { cx: 17, cy: 17 }],
      6: [{ cx: 7, cy: 6 }, { cx: 17, cy: 6 }, { cx: 7, cy: 12 }, { cx: 17, cy: 12 }, { cx: 7, cy: 18 }, { cx: 17, cy: 18 }]
    };

    const circles = pips[value] || [];
    return `
      <svg width="26" height="26" viewBox="0 0 24 24">
        ${circles.map(c => `<circle cx="${c.cx}" cy="${c.cy}" r="2.2" fill="#2d2538"/>`).join('')}
      </svg>
    `;
  },

  flame: (size = 20, color = '#ff5252') => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}" style="flex-shrink:0;">
      <path d="M12 2c-.5 2.5-3 4.5-3 7.5a6 6 0 0 0 11.2 3c-.2-1.8-1.2-3.4-2.2-4.5-.3 1.5-1.5 2.7-3 2.7-1.7 0-3-1.3-3-3 0-1.8 1.5-3.8 2-5.7-1.5.5-2 1.5-2 0z"/>
    </svg>
  `,

  lightbulb: (size = 20, color = '#facc15') => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;">
      <path d="M9 18h6"/>
      <path d="M10 22h4"/>
      <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5.76.76 1.23 1.52 1.41 2.5"/>
    </svg>
  `
};

