import React from "react";
import { T } from "./tokens";

// ─── Label ────────────────────────────────────────────────────────────
export function Label({ children, style: s }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 500, color: "var(--text-light)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8, ...s }}>
      {children}
    </div>
  );
}

// ─── Form inputs ──────────────────────────────────────────────────────
export function FDInput({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  return (
    <div style={{ marginBottom: 18 }}>
      {label && <Label>{label}</Label>}
      <input
        {...props}
        style={{
          width: "100%",
          padding: "12px 16px",
          border: `1px solid var(--border)`,
          borderRadius: "10px",
          background: "var(--bg-input)",
          fontSize: 14,
          color: "var(--text)",
          transition: "border-color 0.15s, box-shadow 0.15s",
          ...props.style,
        }}
      />
    </div>
  );
}

export function FDTextarea({ label, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }) {
  return (
    <div style={{ marginBottom: 18 }}>
      {label && <Label>{label}</Label>}
      <textarea
        {...props}
        style={{
          width: "100%",
          padding: "12px 16px",
          border: `1px solid var(--border)`,
          borderRadius: "10px",
          background: "var(--bg-input)",
          fontSize: 14,
          color: "var(--text)",
          resize: "vertical",
          minHeight: 80,
          transition: "border-color 0.15s, box-shadow 0.15s",
          lineHeight: 1.6,
          ...props.style,
        }}
      />
    </div>
  );
}

export function FDSelect({ label, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string }) {
  return (
    <div style={{ marginBottom: 18 }}>
      {label && <Label>{label}</Label>}
      <select
        {...props}
        style={{
          width: "100%",
          padding: "12px 36px 12px 16px",
          border: `1px solid var(--border)`,
          borderRadius: "10px",
          background: "var(--bg-input)",
          fontSize: 14,
          color: "var(--text)",
          appearance: "none",
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238A8A82' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 14px center",
          transition: "border-color 0.15s, box-shadow 0.15s",
        }}
      >
        {children}
      </select>
    </div>
  );
}

// ─── Button ───────────────────────────────────────────────────────────
type BtnVariant = "primary" | "ghost" | "outline" | "gold" | "danger";
export function Btn({ children, variant = "primary", onClick, disabled, type = "button", style: s, full }: {
  children: React.ReactNode; variant?: BtnVariant;
  onClick?: () => void; disabled?: boolean; type?: "button" | "submit"; style?: React.CSSProperties; full?: boolean;
}) {
  const base: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    gap: 7, padding: "11px 24px", borderRadius: "999px",
    fontSize: 13, fontWeight: 500, letterSpacing: "-0.01em",
    opacity: disabled ? 0.42 : 1,
    transition: "all 0.15s cubic-bezier(0.16,1,0.3,1)",
    cursor: disabled ? "not-allowed" : "pointer",
    width: full ? "100%" : undefined,
    whiteSpace: "nowrap" as const,
  };
  const variants: Record<BtnVariant, React.CSSProperties> = {
    primary: { background: T.ink, color: T.white, border: "none", boxShadow: "0 1px 3px rgba(0,0,0,0.15)" },
    ghost:   { background: "transparent", color: "var(--text-mid)", border: `1px solid var(--border)` },
    outline: { background: "transparent", color: T.forest, border: `1px solid ${T.forest}` },
    gold:    { background: T.gold, color: T.white, border: "none", boxShadow: "0 1px 3px rgba(184,136,58,0.20)" },
    danger:  { background: T.danger, color: T.white, border: "none" },
  };
  const cls = variant === "gold" ? "btn-gold" : variant === "ghost" ? "btn-ghost" : variant === "outline" ? "btn-outline" : variant === "danger" ? "btn-danger" : "btn-primary";
  return (
    <button type={type} onClick={disabled ? undefined : onClick} disabled={disabled} className={cls} style={{ ...base, ...variants[variant], ...s }}>
      {children}
    </button>
  );
}

// ─── Tag / Badge ──────────────────────────────────────────────────────
export function Tag({ children, color = T.forest, bg = T.forestPale, style: s }: { children: React.ReactNode; color?: string; bg?: string; style?: React.CSSProperties }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "3px 10px", borderRadius: 999,
      fontSize: 10, fontWeight: 600, fontFamily: T.fontMono,
      color, background: bg, letterSpacing: "0.05em",
      textTransform: "uppercase", whiteSpace: "nowrap",
      ...s,
    }}>
      {children}
    </span>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────
export function Card({ children, style: s, className, onClick }: { children: React.ReactNode; style?: React.CSSProperties; className?: string; onClick?: () => void }) {
  return (
    <div
      className={className}
      onClick={onClick}
      style={{
        background: "var(--bg-card)",
        border: `1px solid var(--border)`,
        borderRadius: "16px",
        boxShadow: "var(--shadow-sm)",
        ...s,
      }}
    >
      {children}
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────
export function StatCard({ label, value, sub, color, icon }: { label: string; value: string | number; sub?: string; color?: string; icon?: React.ReactNode }) {
  return (
    <Card style={{ padding: "20px 22px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
        <Label style={{ margin: 0 }}>{label}</Label>
        {icon && <span style={{ color: color || "var(--text-light)", opacity: 0.7 }}>{icon}</span>}
      </div>
      <div className="stat-value" style={{ fontFamily: T.fontSans, fontSize: 32, fontWeight: 700, color: color || "var(--text)", letterSpacing: "-0.03em", lineHeight: 1 }}>
        {value}
      </div>
      {sub && <div style={{ fontFamily: T.fontSans, fontSize: 12, color: "var(--text-light)", marginTop: 6, lineHeight: 1.4 }}>{sub}</div>}
    </Card>
  );
}

// ─── Section header ───────────────────────────────────────────────────
export function SectionHeader({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28, gap: 16 }}>
      <div>
        <h2 style={{ fontFamily: T.fontSans, fontSize: 24, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.025em", lineHeight: 1.2 }}>{title}</h2>
        {sub && <p style={{ fontFamily: T.fontSans, fontSize: 13, color: "var(--text-light)", marginTop: 5, lineHeight: 1.5 }}>{sub}</p>}
      </div>
      {action && <div style={{ flexShrink: 0 }}>{action}</div>}
    </div>
  );
}

// ─── Status tag ───────────────────────────────────────────────────────
export function StatusTag({ status }: { status: string }) {
  const map: Record<string, { color: string; bg: string }> = {
    open:              { color: T.warn,    bg: T.warnPale },
    noticed:           { color: T.warn,    bg: T.warnPale },
    escalated:         { color: T.danger,  bg: T.dangerPale },
    resolved:          { color: T.success, bg: T.successPale },
    completed:         { color: T.success, bg: T.successPale },
    confirmed:         { color: T.success, bg: T.successPale },
    approved:          { color: T.success, bg: T.successPale },
    denied:            { color: T.danger,  bg: T.dangerPale },
    submitted:         { color: T.blue,    bg: T.bluePale },
    under_review:      { color: T.blue,    bg: T.bluePale },
    scheduled:         { color: T.blue,    bg: T.bluePale },
    assigned:          { color: T.blue,    bg: T.bluePale },
    in_progress:       { color: T.purple,  bg: T.purplePale },
    pending:           { color: "var(--text-mid)", bg: "var(--bg-subtle)" },
    cancelled:         { color: "var(--text-light)", bg: "var(--bg-subtle)" },
    closed:            { color: "var(--text-mid)", bg: "var(--bg-subtle)" },
    certified:         { color: T.success, bg: T.successPale },
    fined:             { color: T.danger,  bg: T.dangerPale },
    revision_requested:{ color: T.gold,    bg: T.goldLight },
  };
  const s = map[status] || { color: "var(--text-light)", bg: "var(--bg-subtle)" };
  return <Tag color={s.color} bg={s.bg}>{status.replace(/_/g, " ")}</Tag>;
}

// ─── Modal ────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div
      className="anim-in"
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="modal-in"
        style={{
          background: "var(--bg-card)",
          borderRadius: "20px",
          width: "100%",
          maxWidth: 560,
          maxHeight: "88vh",
          overflow: "auto",
          boxShadow: "var(--shadow-xl)",
          border: `1px solid var(--border)`,
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{
          padding: "20px 26px",
          borderBottom: `1px solid var(--border)`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          position: "sticky", top: 0, background: "var(--bg-card)", zIndex: 1,
          borderRadius: "20px 20px 0 0",
        }}>
          <h3 style={{ fontFamily: T.fontSans, fontSize: 17, fontWeight: 600, color: "var(--text)", letterSpacing: "-0.02em" }}>{title}</h3>
          <button
            onClick={onClose}
            className="btn-icon"
            style={{
              background: "none", border: "none",
              color: "var(--text-light)", fontSize: 22,
              lineHeight: 1, cursor: "pointer",
              width: 32, height: 32, borderRadius: T.radius,
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "background 0.12s",
            }}
          >
            ×
          </button>
        </div>
        <div style={{ padding: 26 }}>{children}</div>
      </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────
export function EmptyState({ icon, title, sub }: { icon: string; title: string; sub?: string }) {
  return (
    <div style={{ textAlign: "center", padding: "64px 24px" }}>
      <div style={{ fontSize: 42, marginBottom: 16, opacity: 0.7 }}>{icon}</div>
      <div style={{ fontFamily: T.fontSans, fontSize: 16, color: "var(--text)", marginBottom: 7, fontWeight: 600, letterSpacing: "-0.02em" }}>{title}</div>
      {sub && <div style={{ fontFamily: T.fontSans, fontSize: 13, color: "var(--text-light)", lineHeight: 1.6, maxWidth: 320, margin: "0 auto" }}>{sub}</div>}
    </div>
  );
}

// ─── Divider ──────────────────────────────────────────────────────────
export function Divider({ style: s }: { style?: React.CSSProperties }) {
  return <div style={{ height: 1, background: "var(--border)", margin: "20px 0", ...s }} />;
}

// ─── Icons ────────────────────────────────────────────────────────────
export { Icons } from "./icons";
