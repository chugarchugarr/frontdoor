import React from "react";
import { T } from "./tokens";

export function Label({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: T.fontMono, fontSize: 10, fontWeight: 500, color: T.inkLight, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>
      {children}
    </div>
  );
}

export function FDInput({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  return (
    <div style={{ marginBottom: 18 }}>
      {label && <Label>{label}</Label>}
      <input {...props} style={{ width: "100%", padding: "10px 14px", border: `1px solid ${T.stone}`, borderRadius: T.radius, background: T.white, fontSize: 14, color: T.ink, transition: "border-color 0.15s", ...props.style }} />
    </div>
  );
}

export function FDTextarea({ label, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }) {
  return (
    <div style={{ marginBottom: 18 }}>
      {label && <Label>{label}</Label>}
      <textarea {...props} style={{ width: "100%", padding: "10px 14px", border: `1px solid ${T.stone}`, borderRadius: T.radius, background: T.white, fontSize: 14, color: T.ink, resize: "vertical", minHeight: 80, transition: "border-color 0.15s", ...props.style }} />
    </div>
  );
}

export function FDSelect({ label, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string }) {
  return (
    <div style={{ marginBottom: 18 }}>
      {label && <Label>{label}</Label>}
      <select {...props} style={{ width: "100%", padding: "10px 14px", border: `1px solid ${T.stone}`, borderRadius: T.radius, background: T.white, fontSize: 14, color: T.ink, appearance: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238A8A82' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center" }}>
        {children}
      </select>
    </div>
  );
}

type BtnVariant = "primary" | "ghost" | "outline" | "gold" | "danger";
export function Btn({ children, variant = "primary", onClick, disabled, type = "button", style: s, full }: {
  children: React.ReactNode; variant?: BtnVariant;
  onClick?: () => void; disabled?: boolean; type?: "button" | "submit"; style?: React.CSSProperties; full?: boolean;
}) {
  const base: React.CSSProperties = { display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "10px 20px", borderRadius: T.radius, fontSize: 13, fontWeight: 600, letterSpacing: "0.01em", opacity: disabled ? 0.45 : 1, transition: "all 0.15s", cursor: disabled ? "not-allowed" : "pointer", width: full ? "100%" : undefined };
  const variants: Record<BtnVariant, React.CSSProperties> = {
    primary: { background: T.forest, color: T.white, border: "none" },
    ghost: { background: "transparent", color: T.inkMid, border: `1px solid ${T.stone}` },
    outline: { background: "transparent", color: T.forest, border: `1px solid ${T.forest}` },
    gold: { background: T.gold, color: T.white, border: "none" },
    danger: { background: T.danger, color: T.white, border: "none" },
  };
  const cls = variant === "gold" ? "btn-gold" : variant === "ghost" ? "btn-ghost" : variant === "danger" ? "btn-danger" : "btn-primary";
  return <button type={type} onClick={disabled ? undefined : onClick} disabled={disabled} className={cls} style={{ ...base, ...variants[variant], ...s }}>{children}</button>;
}

export function Tag({ children, color = T.forest, bg = T.forestPale, style: s }: { children: React.ReactNode; color?: string; bg?: string; style?: React.CSSProperties }) {
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 9px", borderRadius: 20, fontSize: 10, fontWeight: 600, fontFamily: T.fontMono, color, background: bg, letterSpacing: "0.05em", textTransform: "uppercase", whiteSpace: "nowrap", ...s }}>{children}</span>;
}

export function Card({ children, style: s, className, onClick }: { children: React.ReactNode; style?: React.CSSProperties; className?: string; onClick?: () => void }) {
  return <div className={className} onClick={onClick} style={{ background: T.white, border: `1px solid ${T.stone}`, borderRadius: T.radiusMd, ...s }}>{children}</div>;
}

export function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <Card style={{ padding: "20px 24px" }}>
      <Label>{label}</Label>
      <div style={{ fontFamily: T.fontSerif, fontSize: 30, fontWeight: 700, color: color || T.charcoal, letterSpacing: "-0.02em", lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontFamily: T.fontSans, fontSize: 12, color: T.inkLight, marginTop: 4 }}>{sub}</div>}
    </Card>
  );
}

export function SectionHeader({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
      <div>
        <h2 style={{ fontFamily: T.fontSerif, fontSize: 22, fontWeight: 700, color: T.charcoal, letterSpacing: "-0.01em" }}>{title}</h2>
        {sub && <p style={{ fontFamily: T.fontSans, fontSize: 13, color: T.inkLight, marginTop: 4 }}>{sub}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function StatusTag({ status }: { status: string }) {
  const map: Record<string, { color: string; bg: string }> = {
    open:       { color: T.warn,    bg: T.warnPale },
    noticed:    { color: T.warn,    bg: T.warnPale },
    escalated:  { color: T.danger,  bg: T.dangerPale },
    resolved:   { color: T.success, bg: T.successPale },
    completed:  { color: T.success, bg: T.successPale },
    confirmed:  { color: T.success, bg: T.successPale },
    approved:   { color: T.success, bg: T.successPale },
    denied:     { color: T.danger,  bg: T.dangerPale },
    submitted:  { color: T.blue,    bg: T.bluePale },
    under_review: { color: T.blue,  bg: T.bluePale },
    scheduled:  { color: T.blue,    bg: T.bluePale },
    assigned:   { color: T.blue,    bg: T.bluePale },
    in_progress:{ color: T.purple,  bg: T.purplePale },
    pending:    { color: T.inkMid,  bg: T.creamDark },
    cancelled:  { color: T.inkLight,bg: T.creamDark },
    closed:     { color: T.inkMid,  bg: T.creamDark },
    certified:  { color: T.success, bg: T.successPale },
    fined:      { color: T.danger,  bg: T.dangerPale },
  };
  const s = map[status] || { color: T.inkLight, bg: T.creamDark };
  return <Tag color={s.color} bg={s.bg}>{status.replace(/_/g, " ")}</Tag>;
}

export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(28,28,26,0.55)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} onClick={onClose}>
      <div style={{ background: T.cream, borderRadius: T.radiusLg, width: "100%", maxWidth: 560, maxHeight: "80vh", overflow: "auto", boxShadow: "0 24px 80px rgba(0,0,0,0.25)" }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: "22px 28px", borderBottom: `1px solid ${T.stone}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h3 style={{ fontFamily: T.fontSerif, fontSize: 18, fontWeight: 600, color: T.charcoal }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: T.inkLight, fontSize: 22, lineHeight: 1, cursor: "pointer" }}>×</button>
        </div>
        <div style={{ padding: 28 }}>{children}</div>
      </div>
    </div>
  );
}

export function EmptyState({ icon, title, sub }: { icon: string; title: string; sub?: string }) {
  return (
    <div style={{ textAlign: "center", padding: "60px 20px" }}>
      <div style={{ fontSize: 40, marginBottom: 14 }}>{icon}</div>
      <div style={{ fontFamily: T.fontSerif, fontSize: 18, color: T.charcoal, marginBottom: 6 }}>{title}</div>
      {sub && <div style={{ fontFamily: T.fontSans, fontSize: 13, color: T.inkLight }}>{sub}</div>}
    </div>
  );
}

// Icons — exported from icons.tsx
export { Icons } from "./icons";
