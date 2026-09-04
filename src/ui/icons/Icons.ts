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
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
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
  }
};
