export const T = {
  cream: "#F4F1EC",
  creamDark: "#EAE6DE",
  stone: "#D4CFC6",
  charcoal: "#1C1C1A",
  charcoalMid: "#2E2E2A",
  forest: "#2A5240",
  forestLight: "#3A6E54",
  forestPale: "#EAF0EC",
  gold: "#B8883A",
  goldLight: "#F0E4C8",
  ink: "#1A1A18",
  inkMid: "#4A4A44",
  inkLight: "#8A8A82",
  white: "#FFFFFF",
  danger: "#B84040",
  dangerPale: "#F8EDED",
  success: "#2A6040",
  successPale: "#EAF4EE",
  warn: "#8A6020",
  warnPale: "#FDF4E3",
  blue: "#2A4A7A",
  bluePale: "#EAF0FA",
  purple: "#5A3A7A",
  purplePale: "#F0EAF8",
  fontSerif: "'Playfair Display', 'Georgia', serif",
  fontSans: "'DM Sans', 'Helvetica Neue', sans-serif",
  fontMono: "'DM Mono', 'Courier New', monospace",
  radius: "4px",
  radiusMd: "8px",
  radiusLg: "12px",
};

export const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { background: ${T.cream}; color: ${T.ink}; font-family: ${T.fontSans}; -webkit-font-smoothing: antialiased; }
  input, select, textarea { font-family: inherit; }
  button { cursor: pointer; font-family: inherit; }
  .gp-grid-bg {
    background-image:
      linear-gradient(rgba(42,82,64,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(42,82,64,0.04) 1px, transparent 1px);
    background-size: 40px 40px;
  }
  @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
  .anim-up { animation: fadeUp 0.5s ease both; }
  .anim-up-2 { animation: fadeUp 0.5s ease 0.07s both; }
  .anim-up-3 { animation: fadeUp 0.5s ease 0.14s both; }
  .anim-up-4 { animation: fadeUp 0.5s ease 0.21s both; }
  input:focus, textarea:focus, select:focus { outline: none; border-color: ${T.forest} !important; box-shadow: 0 0 0 2px rgba(42,82,64,0.12); }
  .btn-primary:hover:not(:disabled) { background: ${T.forestLight} !important; transform:translateY(-1px); box-shadow:0 4px 16px rgba(42,82,64,0.25); }
  .btn-ghost:hover { background: ${T.creamDark} !important; }
  .btn-gold:hover:not(:disabled) { filter:brightness(1.08); transform:translateY(-1px); }
  .btn-danger:hover:not(:disabled) { filter:brightness(1.08); transform:translateY(-1px); }
  .card-hover:hover { border-color: ${T.forest} !important; transform:translateY(-1px); box-shadow:0 4px 20px rgba(42,82,64,0.1) !important; }
  .nav-item:hover { background: rgba(42,82,64,0.06) !important; }
  .nav-item.active { background: ${T.forestPale} !important; color: ${T.forest} !important; }
  .tab-btn.active { border-bottom: 2px solid ${T.forest}; color: ${T.forest}; }
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-thumb { background: ${T.stone}; border-radius:3px; }
  @keyframes aiPulse { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.4; transform:scale(1.4); } }
  .ai-pulse { animation: aiPulse 1.2s ease-in-out infinite; }
  @media (max-width: 768px) {
    .sidebar { display: none !important; }
    .main-pad { padding: 16px !important; }
  }
`;
