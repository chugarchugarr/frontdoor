export const T = {
  // Brand palette
  cream: "#F4F1EC",
  creamDark: "#EAE6DE",
  stone: "#D4CFC6",
  stoneLight: "#E8E4DC",
  charcoal: "#1C1C1A",
  charcoalMid: "#252522",
  charcoalLight: "#2E2E2A",
  forest: "#2A5240",
  forestLight: "#3A6E54",
  forestMid: "#224436",
  forestPale: "#EAF0EC",
  gold: "#B8883A",
  goldLight: "#F0E4C8",
  goldDim: "#8A6428",
  ink: "#1A1A18",
  inkMid: "#4A4A44",
  inkLight: "#8A8A82",
  white: "#FFFFFF",

  // Semantic
  danger: "#B84040",
  dangerPale: "#F8EDED",
  dangerDim: "#8A2A2A",
  success: "#2A6040",
  successPale: "#EAF4EE",
  successDim: "#1E4A30",
  warn: "#8A6020",
  warnPale: "#FDF4E3",
  warnDim: "#6A4A18",
  blue: "#2A4A7A",
  bluePale: "#EAF0FA",
  blueDim: "#1E3660",
  purple: "#5A3A7A",
  purplePale: "#F0EAF8",
  purpleDim: "#3E2858",

  // Typography
  fontSerif: "'Playfair Display', 'Georgia', serif",
  fontSans: "'DM Sans', 'Helvetica Neue', sans-serif",
  fontMono: "'DM Mono', 'Courier New', monospace",

  // Spacing & shape
  radius: "6px",
  radiusMd: "10px",
  radiusLg: "16px",
  radiusXl: "20px",
};

export const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: ${T.cream};
    --bg-card: ${T.white};
    --bg-card-hover: #FAFAF7;
    --bg-subtle: ${T.creamDark};
    --bg-input: ${T.white};
    --border: ${T.stone};
    --border-subtle: ${T.stoneLight};
    --text: ${T.ink};
    --text-mid: ${T.inkMid};
    --text-light: ${T.inkLight};
    --shadow-sm: 0 1px 3px rgba(28,28,26,0.06), 0 1px 2px rgba(28,28,26,0.04);
    --shadow-md: 0 4px 16px rgba(28,28,26,0.08), 0 2px 6px rgba(28,28,26,0.05);
    --shadow-lg: 0 12px 40px rgba(28,28,26,0.12), 0 4px 12px rgba(28,28,26,0.07);
    --shadow-xl: 0 24px 80px rgba(28,28,26,0.18), 0 8px 24px rgba(28,28,26,0.10);
    --forest-glow: 0 0 0 2px rgba(42,82,64,0.14);
  }

  .dark {
    --bg: #111110;
    --bg-card: #1A1A18;
    --bg-card-hover: #222220;
    --bg-subtle: #1E1E1C;
    --bg-input: #1E1E1C;
    --border: #2E2E2C;
    --border-subtle: #252524;
    --text: #F0EDE8;
    --text-mid: #A8A8A0;
    --text-light: #666660;
    --shadow-sm: 0 1px 3px rgba(0,0,0,0.25), 0 1px 2px rgba(0,0,0,0.18);
    --shadow-md: 0 4px 16px rgba(0,0,0,0.32), 0 2px 6px rgba(0,0,0,0.22);
    --shadow-lg: 0 12px 40px rgba(0,0,0,0.40), 0 4px 12px rgba(0,0,0,0.28);
    --shadow-xl: 0 24px 80px rgba(0,0,0,0.55), 0 8px 24px rgba(0,0,0,0.35);
    --forest-glow: 0 0 0 2px rgba(58,110,84,0.28);
  }

  html, body {
    background: var(--bg);
    color: var(--text);
    font-family: ${T.fontSans};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    transition: background 0.2s, color 0.2s;
  }

  input, select, textarea { font-family: inherit; }
  button { cursor: pointer; font-family: inherit; }

  /* Grid bg */
  .gp-grid-bg {
    background-image:
      linear-gradient(rgba(42,82,64,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(42,82,64,0.04) 1px, transparent 1px);
    background-size: 44px 44px;
  }
  .dark .gp-grid-bg {
    background-image:
      linear-gradient(rgba(58,110,84,0.06) 1px, transparent 1px),
      linear-gradient(90deg, rgba(58,110,84,0.06) 1px, transparent 1px);
    background-size: 44px 44px;
  }

  /* Animations */
  @keyframes fadeUp   { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }
  @keyframes scaleUp  { from { opacity:0; transform:scale(0.97) translateY(8px); } to { opacity:1; transform:scale(1) translateY(0); } }
  @keyframes shimmer  { 0% { background-position:-400px 0; } 100% { background-position:400px 0; } }
  @keyframes aiPulse  { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.35; transform:scale(1.5); } }
  @keyframes aiRing   { 0%,100% { box-shadow:0 0 0 0 rgba(42,82,64,0.4); } 50% { box-shadow:0 0 0 6px rgba(42,82,64,0); } }
  @keyframes spin     { to { transform:rotate(360deg); } }

  .anim-up   { animation: fadeUp 0.45s cubic-bezier(0.16,1,0.3,1) both; }
  .anim-up-2 { animation: fadeUp 0.45s cubic-bezier(0.16,1,0.3,1) 0.06s both; }
  .anim-up-3 { animation: fadeUp 0.45s cubic-bezier(0.16,1,0.3,1) 0.12s both; }
  .anim-up-4 { animation: fadeUp 0.45s cubic-bezier(0.16,1,0.3,1) 0.18s both; }
  .anim-up-5 { animation: fadeUp 0.45s cubic-bezier(0.16,1,0.3,1) 0.24s both; }
  .anim-in   { animation: fadeIn 0.3s ease both; }
  .modal-in  { animation: scaleUp 0.28s cubic-bezier(0.16,1,0.3,1) both; }

  .ai-pulse { animation: aiPulse 1.4s ease-in-out infinite; }
  .ai-ring  { animation: aiRing 2s ease-in-out infinite; }
  .spin     { animation: spin 0.8s linear infinite; }

  /* Focus */
  input:focus, textarea:focus, select:focus {
    outline: none !important;
    border-color: ${T.forest} !important;
    box-shadow: var(--forest-glow) !important;
  }

  /* Button hover */
  .btn-primary:hover:not(:disabled) {
    background: ${T.forestLight} !important;
    transform: translateY(-1px);
    box-shadow: 0 4px 20px rgba(42,82,64,0.30) !important;
  }
  .btn-primary:active:not(:disabled) { transform:translateY(0); }
  .btn-ghost:hover  { background: var(--bg-subtle) !important; }
  .btn-outline:hover:not(:disabled) { background: rgba(42,82,64,0.06) !important; }
  .btn-gold:hover:not(:disabled)    { filter:brightness(1.1); transform:translateY(-1px); box-shadow:0 4px 20px rgba(184,136,58,0.3) !important; }
  .btn-danger:hover:not(:disabled)  { filter:brightness(1.08); transform:translateY(-1px); }
  .btn-icon:hover { background: var(--bg-subtle) !important; }

  /* Card hover */
  .card-hover {
    transition: border-color 0.15s, transform 0.15s, box-shadow 0.15s !important;
  }
  .card-hover:hover {
    border-color: rgba(42,82,64,0.35) !important;
    transform: translateY(-2px);
    box-shadow: var(--shadow-md) !important;
  }
  .card-hover:active { transform:translateY(0); }

  /* Nav */
  .nav-item { transition: background 0.12s, color 0.12s; }
  .nav-item:hover:not(.active) { background: rgba(255,255,255,0.06) !important; color: rgba(255,255,255,0.75) !important; }
  .nav-item.active { background: rgba(42,82,64,0.25) !important; color: #7EC99A !important; }

  /* Tab */
  .tab-btn.active { border-bottom: 2px solid ${T.forest}; color: ${T.forest}; }
  .dark .tab-btn.active { border-bottom-color: #5A9E7A; color: #5A9E7A; }

  /* Scrollbar */
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }

  /* Responsive */
  @media (max-width: 768px) {
    .sidebar { display: none !important; }
    .main-pad { padding: 20px 16px !important; }
    .mobile-hide { display: none !important; }
  }

  /* AI panel shimmer skeleton */
  .ai-skeleton {
    background: linear-gradient(90deg, var(--bg-subtle) 25%, var(--border) 50%, var(--bg-subtle) 75%);
    background-size: 400px 100%;
    animation: shimmer 1.4s ease-in-out infinite;
  }

  /* Dark-aware stat overrides */
  .dark .stat-value { color: #F0EDE8 !important; }
`;
