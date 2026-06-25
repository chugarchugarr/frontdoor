export const T = {
  // Base palette — Mobbin-inspired minimal
  white:       "#FFFFFF",
  offWhite:    "#FAFAFA",
  gray50:      "#F7F7F7",
  gray100:     "#F0F0F0",
  gray200:     "#E5E5E5",
  gray300:     "#D4D4D4",
  gray400:     "#A3A3A3",
  gray500:     "#737373",
  gray600:     "#525252",
  gray700:     "#404040",
  gray800:     "#262626",
  gray900:     "#171717",
  black:       "#0A0A0A",

  // Legacy aliases kept for component compatibility
  cream:       "#FAFAFA",
  creamDark:   "#F7F7F7",
  stone:       "#E5E5E5",
  stoneLight:  "#F0F0F0",
  charcoal:    "#0A0A0A",
  charcoalMid: "#171717",
  charcoalLight:"#262626",
  ink:         "#0A0A0A",
  inkMid:      "#525252",
  inkLight:    "#A3A3A3",

  // ONE accent — forest green, used sparingly
  forest:      "#2A5240",
  forestLight: "#3A6E54",
  forestMid:   "#224436",
  forestPale:  "#F0F5F2",

  // Semantic — muted, system-level only
  danger:      "#DC2626",
  dangerPale:  "#FEF2F2",
  dangerDim:   "#991B1B",
  success:     "#16A34A",
  successPale: "#F0FDF4",
  successDim:  "#15803D",
  warn:        "#D97706",
  warnPale:    "#FFFBEB",
  warnDim:     "#B45309",
  blue:        "#2563EB",
  bluePale:    "#EFF6FF",
  blueDim:     "#1D4ED8",
  purple:      "#7C3AED",
  purplePale:  "#F5F3FF",
  purpleDim:   "#6D28D9",
  gold:        "#B8883A",
  goldLight:   "#FEF3C7",
  goldDim:     "#92400E",

  // Typography — Inter everywhere
  fontSans:    "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  fontSerif:   "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  fontMono:    "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",

  // Shape — pill-first
  radius:      "12px",
  radiusMd:    "16px",
  radiusLg:    "20px",
  radiusXl:    "24px",
  radiusPill:  "999px",
};

export const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  /* Force light theme — GatePass is always light regardless of OS/app theme */
  :root,
  .dark,
  [data-theme="dark"],
  [color-scheme="dark"] {
    --bg:           #FFFFFF;
    --bg-card:      #FFFFFF;
    --bg-card-hover:#F7F7F7;
    --bg-subtle:    #F7F7F7;
    --bg-input:     #FFFFFF;
    --border:       #E5E5E5;
    --border-subtle:#F0F0F0;
    --text:         #0A0A0A;
    --text-mid:     #525252;
    --text-light:   #A3A3A3;
    --shadow-sm:    0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
    --shadow-md:    0 4px 16px rgba(0,0,0,0.06), 0 2px 6px rgba(0,0,0,0.04);
    --shadow-lg:    0 12px 40px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.05);
    --shadow-xl:    0 24px 80px rgba(0,0,0,0.12), 0 8px 24px rgba(0,0,0,0.07);
    --accent-glow:  0 0 0 3px rgba(42,82,64,0.12);
    --forest-glow:  0 0 0 3px rgba(42,82,64,0.12);
  }

  html, body {
    background: #FFFFFF !important;
    color: #0A0A0A !important;
    color-scheme: light !important;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  input, select, textarea { font-family: inherit; }
  button { cursor: pointer; font-family: inherit; }

  /* Grid bg — no-op, kept for class compatibility */
  .gp-grid-bg { background-image: none; }

  /* Animations */
  @keyframes fadeUp   { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }
  @keyframes scaleUp  { from { opacity:0; transform:scale(0.97) translateY(6px); } to { opacity:1; transform:scale(1) translateY(0); } }
  @keyframes shimmer  { 0% { background-position:-400px 0; } 100% { background-position:400px 0; } }
  @keyframes aiPulse  { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.35; transform:scale(1.5); } }
  @keyframes aiRing   { 0%,100% { box-shadow:0 0 0 0 rgba(42,82,64,0.4); } 50% { box-shadow:0 0 0 6px rgba(42,82,64,0); } }
  @keyframes spin     { to { transform:rotate(360deg); } }

  .anim-up   { animation: fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both; }
  .anim-up-2 { animation: fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.07s both; }
  .anim-up-3 { animation: fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.14s both; }
  .anim-up-4 { animation: fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.21s both; }
  .anim-up-5 { animation: fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.28s both; }
  .anim-in   { animation: fadeIn 0.3s ease both; }
  .modal-in  { animation: scaleUp 0.28s cubic-bezier(0.16,1,0.3,1) both; }

  .ai-pulse { animation: aiPulse 1.4s ease-in-out infinite; }
  .ai-ring  { animation: aiRing 2s ease-in-out infinite; }
  .spin     { animation: spin 0.8s linear infinite; }

  /* Focus */
  input:focus, textarea:focus, select:focus {
    outline: none !important;
    border-color: #2A5240 !important;
    box-shadow: var(--accent-glow) !important;
  }

  /* Button hover — pill style */
  .btn-primary:hover:not(:disabled) {
    background: #262626 !important;
    transform: translateY(-1px);
    box-shadow: 0 4px 16px rgba(0,0,0,0.20) !important;
  }
  .btn-primary:active:not(:disabled) { transform:translateY(0); }
  .btn-ghost:hover  { background: var(--bg-subtle) !important; }
  .btn-outline:hover:not(:disabled) { background: #F0F5F2 !important; }
  .btn-gold:hover:not(:disabled)    { filter:brightness(1.1); transform:translateY(-1px); }
  .btn-danger:hover:not(:disabled)  { filter:brightness(1.08); transform:translateY(-1px); }
  .btn-icon:hover { background: var(--bg-subtle) !important; }

  /* Card hover */
  .card-hover {
    transition: border-color 0.15s, transform 0.15s, box-shadow 0.15s !important;
  }
  .card-hover:hover {
    border-color: #D4D4D4 !important;
    transform: translateY(-2px);
    box-shadow: var(--shadow-md) !important;
  }
  .card-hover:active { transform:translateY(0); }

  /* Sidebar nav */
  .nav-item { transition: background 0.12s, color 0.12s; }
  .nav-item:hover { background: #F7F7F7 !important; color: #0A0A0A !important; }

  /* Tab */
  .tab-btn.active { border-bottom: 2px solid #0A0A0A; color: #0A0A0A; }
  .dark .tab-btn.active { border-bottom-color: #FAFAFA; color: #FAFAFA; }

  /* Scrollbar */
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }

  /* Responsive */
  @media (max-width: 768px) {
    .sidebar { display: none !important; }
    .main-pad { padding: 20px 16px !important; }
    .mobile-hide { display: none !important; }
    .gp-grid-3 { grid-template-columns: 1fr !important; }
    .gp-grid-2 { grid-template-columns: 1fr !important; }
    .gp-col-reverse { flex-direction: column-reverse !important; }
    .gp-hide-mobile { display: none !important; }
    .gp-full-mobile { width: 100% !important; max-width: 100% !important; }
    .gp-pad-mobile { padding-left: 16px !important; padding-right: 16px !important; }
    .gp-section-header { flex-direction: column !important; align-items: stretch !important; gap: 10px !important; margin-bottom: 20px !important; }
    .gp-section-header h2 { font-size: 22px !important; line-height: 1.05 !important; }
    .gp-section-action { align-self: flex-start !important; }
  }

  /* Focus rings (keyboard accessibility) */
  button:focus-visible,
  a:focus-visible,
  input:focus-visible,
  select:focus-visible,
  textarea:focus-visible {
    outline: 2px solid #2A5240;
    outline-offset: 2px;
    border-radius: 4px;
  }
  button:focus:not(:focus-visible),
  a:focus:not(:focus-visible) {
    outline: none;
  }

  /* AI panel shimmer skeleton */
  .ai-skeleton {
    background: linear-gradient(90deg, var(--bg-subtle) 25%, var(--border) 50%, var(--bg-subtle) 75%);
    background-size: 400px 100%;
    animation: shimmer 1.4s ease-in-out infinite;
  }

  .dark .stat-value { color: #FAFAFA !important; }
`;
