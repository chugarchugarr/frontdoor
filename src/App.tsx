import React, { useState } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "@adaptive-ai/sdk/client";
import { client as rpc } from "@/lib/client";
import LandingPage from "./pages/Landing";
import Pricing from "./pages/Pricing";
import Investors from "./pages/Investors";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import { T, GLOBAL_CSS } from "./components/tokens";
import { Btn, Card, EmptyState, FDInput, FDSelect, FDTextarea, Icons, Label, Tag } from "./components/ui-kit";
import { Sidebar, type OSView } from "./components/Sidebar";
import { Dashboard } from "./components/Dashboard";
import { Homeowners } from "./components/Homeowners";
import { PayOS } from "./components/PayOS";
import { Violations } from "./components/Violations";
import { ARCAgent } from "./components/ARCAgent";
import { BoardRoom } from "./components/BoardRoom";
import { VoteBox } from "./components/VoteBox";
import { WorkOrders } from "./components/WorkOrders";
import { AmenityModule } from "./components/AmenityModule";
import { CommHub } from "./components/CommHub";
import { ContractorWaitlist } from "./components/ContractorWaitlist";
import { HomeownerPortal } from "./components/HomeownerPortal";
import { ContractorPortal } from "./components/ContractorPortal";
import { LiveFeeds } from "./components/LiveFeeds";
import { ComplianceTimeline } from "./components/ComplianceTimeline";
import { TransitionMoat } from "./components/TransitionMoat";
import { MarketplaceProofLoop } from "./components/MarketplaceProofLoop";
import { InvestorProofDashboard } from "./components/InvestorProofDashboard";
import AdminConsole from "./components/AdminConsole";
import { ErrorBoundary } from "./components/error-boundary";
import { DEMO_HOA_ID, MODELED_DEMO_BANNER, modeledDemoData } from "./lib/modeledDemoData";

const DEMO_VIEW_OPTIONS: { id: OSView; label: string }[] = [
  { id: "dashboard", label: "Overview" },
  { id: "homeowners", label: "Homeowners" },
  { id: "payos", label: "PayOS" },
  { id: "violations", label: "FineBot" },
  { id: "arc", label: "ARC Agent" },
  { id: "workorders", label: "WorkOrder" },
  { id: "boardroom", label: "BoardRoom" },
  { id: "votebox", label: "VoteBox" },
  { id: "amenity", label: "Amenity" },
  { id: "commhub", label: "CommHub" },
  { id: "permits", label: "Permit Feed" },
  { id: "livefeeds", label: "Live Feeds" },
  { id: "marketplace", label: "Property Work Path" },
  { id: "transition", label: "Association Records" },
  { id: "compliance", label: "Compliance" },
];

function HOAOnboarding({ onBack }: { onBack: () => void }) {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    community: "",
    zip: "",
    units: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    role: "",
    managementSetup: "",
    needsHelpWith: "",
  });
  const totalCost = form.units ? Number(form.units) * 20 : 0;
  const set = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const canSubmit = Boolean(form.community && form.zip && form.units && form.contactName && form.contactEmail && form.role && form.managementSetup && form.needsHelpWith && !submitted);
  const mutation = useMutation({
    mutationFn: () => rpc.createHOAAccessReview({
      community: form.community,
      zip: form.zip,
      units: Number(form.units),
      contactName: form.contactName,
      contactEmail: form.contactEmail,
      contactPhone: form.contactPhone,
      role: form.role,
      managementSetup: form.managementSetup,
      needsHelpWith: form.needsHelpWith,
    }),
    onSuccess: () => setSubmitted(true),
  });

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <style>{GLOBAL_CSS}</style>
      <header style={{ padding: "0 32px", height: 60, borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 14, background: "var(--bg)", position: "sticky", top: 0, zIndex: 100 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "var(--text-light)", display: "flex", alignItems: "center", gap: 6, fontFamily: T.fontSans, fontSize: 13, cursor: "pointer" }}><Icons.Back /> Back</button>
        <div style={{ width: 1, height: 18, background: "var(--border)" }} />
        <span style={{ fontFamily: T.fontSans, fontSize: 15, fontWeight: 700, color: "var(--text)" }}>GatePass</span>
        <Tag>Association Workflow Review</Tag>
      </header>

      <main style={{ maxWidth: 600, margin: "0 auto", padding: "64px 32px" }}>
        <div className="anim-up" style={{ marginBottom: 36 }}>
          <div style={{ fontFamily: T.fontSans, fontSize: 11, color: T.forest, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12, fontWeight: 600 }}>For association boards</div>
          <h1 style={{ fontFamily: T.fontSans, fontSize: 34, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.03em", marginBottom: 12 }}>Show us how property work moves through your community.</h1>
          <p style={{ fontFamily: T.fontSans, fontSize: 14, color: "var(--text-mid)", lineHeight: 1.7 }}>GatePass reviews the path from exterior signal to permission, contractor execution, and permanent association record before any agreement or payment. Software is $20 per unit per year after approval.</p>
        </div>

        <Card style={{ padding: 32 }}>
          {submitted ? (
            <>
              <h2 style={{ fontFamily: T.fontSans, fontSize: 20, fontWeight: 700, color: "var(--text)", marginBottom: 12 }}>Workflow review received.</h2>
              <p style={{ fontFamily: T.fontSans, fontSize: 14, color: "var(--text-mid)", lineHeight: 1.7, marginBottom: 24 }}>No enrollment or payment was created. GatePass will follow up to review the association's current workflow.</p>
              <Btn onClick={onBack}>Back to GatePass</Btn>
            </>
          ) : (
            <form onSubmit={(event) => { event.preventDefault(); if (canSubmit && !mutation.isPending) mutation.mutate(); }}>
              <FDInput label="Contact name" required name="contactName" placeholder="Your name" value={form.contactName} onChange={(event) => set("contactName", event.target.value)} />
              <FDInput label="Email" required name="contactEmail" type="email" placeholder="you@example.com" value={form.contactEmail} onChange={(event) => set("contactEmail", event.target.value)} />
              <FDInput label="Phone" name="contactPhone" type="tel" placeholder="512-555-0100" value={form.contactPhone} onChange={(event) => set("contactPhone", event.target.value)} />
              <FDInput label="Board or management role" required name="role" placeholder="Board member, president, manager, etc." value={form.role} onChange={(event) => set("role", event.target.value)} />
              <FDInput label="Community name" required name="community" placeholder="Sample Austin Association" value={form.community} onChange={(event) => set("community", event.target.value)} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <FDInput label="ZIP code" required name="zip" placeholder="78732" value={form.zip} onChange={(event) => set("zip", event.target.value)} />
                <FDInput label="Number of units" required name="units" type="number" placeholder="200" value={form.units} onChange={(event) => set("units", event.target.value)} />
              </div>
              <FDSelect label="Current management setup" required name="managementSetup" value={form.managementSetup} onChange={(event) => set("managementSetup", event.target.value)}>
                <option value="">Select setup…</option>
                <option value="management_company">Management company</option>
                <option value="self_managed">Self-managed board</option>
                <option value="hybrid">Hybrid / part-time manager</option>
                <option value="unknown">Not sure</option>
              </FDSelect>
              <FDTextarea label="Where the workflow breaks" required name="needsHelpWith" placeholder="Describe where signals, approvals, contractor access, completion evidence, or records break down today." value={form.needsHelpWith} onChange={(event) => set("needsHelpWith", event.target.value)} />

              {totalCost > 0 && (
                <div style={{ padding: "14px 18px", background: T.forestPale, borderRadius: T.radius, marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div><Label>Estimated annual software price</Label><div style={{ fontFamily: T.fontSans, fontSize: 26, fontWeight: 700, color: "var(--text)" }}>${totalCost.toLocaleString()}</div></div>
                  <div style={{ textAlign: "right", fontFamily: T.fontSans, fontSize: 12, color: T.inkLight }}><div>{form.units} units × $20/year</div><div style={{ color: T.success, marginTop: 4 }}>No setup fee</div></div>
                </div>
              )}

              <Btn full onClick={() => { if (canSubmit && !mutation.isPending) mutation.mutate(); }} disabled={!canSubmit || mutation.isPending}>{mutation.isPending ? "Submitting…" : <>Request a workflow review <Icons.ArrowR /></>}</Btn>
              {mutation.isError && <div style={{ marginTop: 14, padding: "10px 14px", background: T.dangerPale, borderRadius: T.radius, fontFamily: T.fontSans, fontSize: 13, color: T.danger }}>Something went wrong. Please try again.</div>}
            </form>
          )}
        </Card>
      </main>
    </div>
  );
}

type DemoPersona = "select" | "board" | "homeowner" | "contractor";

function MobileViewNav({ view, onChange }: { view: OSView; onChange: (view: OSView) => void }) {
  return (
    <div className="gp-mobile-view-nav">
      <label htmlFor="gatepass-mobile-view">Workspace screen</label>
      <select id="gatepass-mobile-view" value={view} onChange={(event) => onChange(event.target.value as OSView)}>
        {DEMO_VIEW_OPTIONS.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
      </select>
    </div>
  );
}

function DemoSelector({ onSelect, onBack }: { onSelect: (persona: Exclude<DemoPersona, "select">) => void; onBack: () => void }) {
  const personas = [
    { id: "board" as const, label: "Board Member", sub: "See the association-owned workspace and the full property-work path.", tag: "Association OS", color: T.forest },
    { id: "homeowner" as const, label: "Homeowner", sub: "Submit requests, view decisions, book amenities, and vote.", tag: "Resident Portal", color: T.blue },
    { id: "contractor" as const, label: "Contractor", sub: "See approved work, public signals, and contractor records.", tag: "Trusted Access", color: T.gold },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#FFFFFF" }}>
      <style>{GLOBAL_CSS}</style>
      <div style={{ background: "#FFFFFF", borderBottom: "1px solid #E5E5E5", padding: "0 24px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}><strong style={{ color: "#0A0A0A" }}>GatePass</strong><span style={{ color: "#737373", fontSize: 12 }}>Modeled Demo</span></div>
        <button onClick={onBack} style={{ fontFamily: T.fontSans, fontSize: 12, color: "#525252", background: "none", border: "1px solid #E5E5E5", borderRadius: 999, padding: "5px 14px", cursor: "pointer" }}>← Back to site</button>
      </div>
      <main style={{ maxWidth: 960, margin: "0 auto", padding: "72px 24px 80px" }}>
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <Tag color={T.forest} bg={T.forestPale}>{MODELED_DEMO_BANNER}</Tag>
          <h1 style={{ fontFamily: T.fontSans, fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 800, color: "#0A0A0A", letterSpacing: "-0.04em", lineHeight: 1.05, margin: "24px 0 14px" }}>Choose your perspective</h1>
          <p style={{ fontFamily: T.fontSans, fontSize: 15, color: "#737373", maxWidth: 560, margin: "0 auto", lineHeight: 1.7 }}>Every view belongs to one operating path: exterior signal → association permission → verified execution → permanent record.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
          {personas.map((persona) => (
            <button key={persona.id} onClick={() => onSelect(persona.id)} style={{ background: "#FFFFFF", border: "1px solid #E5E5E5", borderRadius: 20, padding: "30px 28px", textAlign: "left", cursor: "pointer" }}>
              <div style={{ fontFamily: T.fontMono, fontSize: 10, color: persona.color, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>{persona.tag}</div>
              <div style={{ fontFamily: T.fontSans, fontSize: 20, fontWeight: 700, color: "#0A0A0A", marginBottom: 10 }}>{persona.label}</div>
              <div style={{ fontFamily: T.fontSans, fontSize: 13, color: "#737373", lineHeight: 1.65 }}>{persona.sub}</div>
              <div style={{ marginTop: 24, color: persona.color, fontSize: 13, fontWeight: 600 }}>Enter demo →</div>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}

function PermitFeedView() {
  const { data: permits = [], isLoading } = useQuery({ queryKey: ["permits"], queryFn: () => rpc.getAustinPermits() });
  type Permit = { id: string; type: string; contractor: string; value: string | null; address: string; date: string | null; status: string };
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", padding: 28 }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, gap: 16 }}>
          <div><h2 style={{ fontFamily: T.fontSans, fontSize: 22, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>Austin Permit Feed</h2><div style={{ fontFamily: T.fontSans, fontSize: 13, color: "var(--text-light)" }}>Public Austin permit activity is a signal. It is not association permission or a property diagnosis.</div></div>
          <Tag bg="rgba(90,158,122,0.12)" color="#2A5240">Austin Open Data</Tag>
        </div>
        {isLoading && <div style={{ textAlign: "center", padding: 48, color: "var(--text-light)", fontFamily: T.fontSans }}>Loading permits…</div>}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {(permits as Permit[]).map((permit) => (
            <Card key={permit.id} style={{ padding: "16px 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}><div><div style={{ fontFamily: T.fontSans, fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{permit.type}</div><div style={{ fontFamily: T.fontSans, fontSize: 12, color: "var(--text-light)", marginTop: 2 }}>{permit.contractor}</div></div>{permit.value && <div style={{ fontFamily: T.fontMono, fontSize: 12, fontWeight: 600, color: T.gold }}>{permit.value}</div>}</div>
              <div style={{ display: "flex", gap: 12, marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--border)", flexWrap: "wrap" }}>{permit.address && <span style={{ fontFamily: T.fontMono, fontSize: 11, color: "var(--text-light)" }}>{permit.address}</span>}{permit.date && <span style={{ fontFamily: T.fontMono, fontSize: 11, color: "var(--text-light)" }}>{permit.date}</span>}{permit.status && <Tag>{permit.status}</Tag>}</div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function WorkspaceContent({ view, hoaId, hoaZip, demo = false }: { view: OSView; hoaId: string; hoaZip?: string; demo?: boolean }) {
  if (view === "dashboard") return <Dashboard hoaId={hoaId} onNav={() => undefined} />;
  if (view === "homeowners") return <Homeowners hoaId={hoaId} />;
  if (view === "payos") return <PayOS hoaId={hoaId} />;
  if (view === "violations") return <Violations hoaId={hoaId} />;
  if (view === "arc") return <ARCAgent hoaId={hoaId} />;
  if (view === "boardroom") return <BoardRoom hoaId={hoaId} />;
  if (view === "votebox") return <VoteBox hoaId={hoaId} />;
  if (view === "workorders") return <WorkOrders hoaId={hoaId} />;
  if (view === "amenity") return <AmenityModule hoaId={hoaId} />;
  if (view === "commhub") return <CommHub hoaId={hoaId} />;
  if (view === "permits") return <PermitFeedView />;
  if (view === "livefeeds") return <LiveFeeds hoaZip={hoaZip} />;
  if (view === "transition") return <TransitionMoat hoaId={hoaId} />;
  if (view === "compliance") return <ComplianceTimeline hoaId={hoaId} />;
  if (view === "marketplace") return <MarketplaceProofLoop hoaId={hoaId} demo={demo} />;
  if (view === "investor") return <InvestorProofDashboard hoaId={hoaId} demo={demo} />;
  return <Dashboard hoaId={hoaId} onNav={() => undefined} />;
}

function BoardWorkspace({ onBack, initialView = "dashboard", demo = false, hoaId = DEMO_HOA_ID, hoaName, hoaZip }: { onBack: () => void; initialView?: OSView; demo?: boolean; hoaId?: string; hoaName?: string; hoaZip?: string }) {
  const [view, setView] = useState<OSView>(initialView);
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--bg)" }}>
      <style>{GLOBAL_CSS}</style>
      {demo && (
        <div className="gp-demo-banner" style={{ background: "#FFFFFF", borderBottom: "1px solid #E5E5E5", padding: "10px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, position: "sticky", top: 0, zIndex: 200 }}>
          <span style={{ fontFamily: T.fontSans, fontSize: 12, color: "#525252" }}>{MODELED_DEMO_BANNER}</span>
          <button onClick={onBack} style={{ fontFamily: T.fontSans, fontSize: 12, color: "#525252", background: "none", border: "1px solid #E5E5E5", borderRadius: 999, padding: "4px 14px", cursor: "pointer" }}>← Exit</button>
        </div>
      )}
      <MobileViewNav view={view} onChange={setView} />
      <div style={{ display: "flex", flex: 1, minWidth: 0 }}>
        <Sidebar current={view} onNav={(next) => { if (next === "landing") onBack(); else setView(next); }} hoaName={hoaName ?? `${modeledDemoData.hoa.community} (Modeled)`} />
        <main style={{ flex: 1, overflow: "auto", minWidth: 0, background: "var(--bg)" }}>
          {view === "dashboard" ? <Dashboard hoaId={hoaId} onNav={setView} /> : <WorkspaceContent view={view} hoaId={hoaId} hoaZip={hoaZip} demo={demo} />}
        </main>
      </div>
    </div>
  );
}

function GatePassDemo({ onBack }: { onBack: () => void }) {
  const [persona, setPersona] = useState<DemoPersona>("select");
  if (persona === "board") return <BoardWorkspace demo onBack={() => setPersona("select")} />;
  if (persona === "homeowner") return <HomeownerPortal onBack={() => setPersona("select")} />;
  if (persona === "contractor") return <ContractorPortal onBack={() => setPersona("select")} />;
  return <DemoSelector onSelect={setPersona} onBack={onBack} />;
}

function HOASelector({ onSelect, onPublic }: { onSelect: (id: string) => void; onPublic: () => void }) {
  const { data: hoas = [], isLoading } = useQuery({ queryKey: ["hoa-list"], queryFn: () => rpc.getHOAList() });
  type HOAListItem = { id: string; community: string; units: number; paid: boolean; plan: string };
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <style>{GLOBAL_CSS}</style>
      <main style={{ width: "100%", maxWidth: 480 }}>
        <h1 style={{ fontFamily: T.fontSans, fontSize: 28, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>Select an association</h1>
        <p style={{ fontFamily: T.fontSans, fontSize: 14, color: "var(--text-light)", marginBottom: 28 }}>Open the association-owned workspace for an enrolled community.</p>
        {isLoading && <div style={{ color: T.inkLight, fontFamily: T.fontSans }}>Loading…</div>}
        {!isLoading && (hoas as HOAListItem[]).length === 0 && <EmptyState icon="🏘️" title="No associations enrolled yet" sub="Begin with an association workflow review." />}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
          {(hoas as HOAListItem[]).map((hoa) => (
            <Card key={hoa.id} style={{ padding: "16px 20px", cursor: "pointer" }} onClick={() => onSelect(hoa.id)}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><div><div style={{ fontFamily: T.fontSans, fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{hoa.community}</div><div style={{ fontFamily: T.fontMono, fontSize: 11, color: "var(--text-light)", marginTop: 3 }}>{hoa.units} units · {hoa.plan}</div></div><Tag color={hoa.paid ? T.success : T.warn} bg={hoa.paid ? T.successPale : T.warnPale}>{hoa.paid ? "Active" : "Pending"}</Tag></div>
            </Card>
          ))}
        </div>
        <button onClick={onPublic} style={{ fontFamily: T.fontSans, fontSize: 13, color: "var(--text-light)", background: "none", border: "none", cursor: "pointer" }}>← Back to public site</button>
      </main>
    </div>
  );
}

function OnboardRoute() {
  const navigate = useNavigate();
  return <ErrorBoundary><HOAOnboarding onBack={() => navigate("/")} /></ErrorBoundary>;
}

function ContractorRoute() {
  const navigate = useNavigate();
  return <ErrorBoundary><ContractorWaitlist onBack={() => navigate("/")} /></ErrorBoundary>;
}

function DemoRoute() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requested = searchParams.get("view");
  if (requested === "transition") return <ErrorBoundary><BoardWorkspace demo initialView="transition" onBack={() => navigate("/demo")} /></ErrorBoundary>;
  if (requested === "marketplace") return <ErrorBoundary><BoardWorkspace demo initialView="marketplace" onBack={() => navigate("/demo")} /></ErrorBoundary>;
  if (requested === "compliance") return <ErrorBoundary><BoardWorkspace demo initialView="compliance" onBack={() => navigate("/demo")} /></ErrorBoundary>;
  if (requested === "investor") return <Navigate to="/investors#current-status" replace />;
  return <ErrorBoundary><GatePassDemo onBack={() => navigate("/")} /></ErrorBoundary>;
}

function TransitionDemoRoute() {
  const navigate = useNavigate();
  return <ErrorBoundary><BoardWorkspace demo initialView="transition" onBack={() => navigate("/demo")} /></ErrorBoundary>;
}

function PropertyWorkPathRoute() {
  return <ErrorBoundary><MarketplaceProofLoop hoaId={DEMO_HOA_ID} demo /></ErrorBoundary>;
}

const ROUTE_META: Record<string, { title: string; description: string; noindex?: boolean }> = {
  "/": { title: "GatePass | Association-Owned Operating System for Property Work", description: "GatePass routes property work from an exterior signal to association permission, verified execution, and a permanent record." },
  "/investors": { title: "GatePass Pre-Seed | Operating System for Governed Property Work", description: "GatePass is raising $500,000 to move its modeled association-owned property-work system into production." },
  "/pricing": { title: "GatePass Pricing | $20 Per Unit Per Year", description: "GatePass association software is $20 per unit per year with no setup fee." },
  "/contractors": { title: "GatePass for Contractors | Apply for Trusted Access", description: "Apply for founding contractor access. Approval happens before payment, and access does not guarantee leads or work." },
  "/onboard": { title: "GatePass for Association Boards | Workflow Review", description: "Request a review of how exterior signals, permissions, contractor work, and records move through your association." },
  "/demo": { title: "GatePass Modeled Product Demo", description: "Explore a modeled GatePass demo with no production customer or transaction data.", noindex: true },
  "/demo/transition": { title: "GatePass Association Records Demo", description: "Explore modeled association-owned records.", noindex: true },
  "/demo/marketplace": { title: "GatePass Property Work Path Demo", description: "Explore the modeled path from exterior signal to permanent association record.", noindex: true },
  "/marketplace-loop": { title: "GatePass Property Work Path", description: "Internal modeled review of the GatePass property-work sequence.", noindex: true },
  "/investor-status": { title: "GatePass Investor Status", description: "GatePass current status and modeled-product boundary.", noindex: true },
  "/os": { title: "GatePass Association Workspace", description: "GatePass association-owned operating workspace.", noindex: true },
  "/admin": { title: "GatePass Admin", description: "GatePass administrative workspace.", noindex: true },
  "/privacy": { title: "GatePass Privacy", description: "Privacy information for the GatePass prelaunch website and workflow-review forms." },
  "/terms": { title: "GatePass Terms", description: "Terms for the GatePass prelaunch website, modeled demo, and workflow-review forms." },
};

function RouteMetadata() {
  const location = useLocation();
  React.useEffect(() => {
    const meta = ROUTE_META[location.pathname] ?? ROUTE_META["/"];
    const canonicalUrl = `https://www.gatepasshoa.com${location.pathname === "/" ? "" : location.pathname}`;
    document.title = meta.title;
    const setMeta = (selector: string, attribute: "content" | "href", value: string) => {
      const element = document.head.querySelector(selector);
      if (element) element.setAttribute(attribute, value);
    };
    setMeta('meta[name="description"]', "content", meta.description);
    setMeta('meta[property="og:title"]', "content", meta.title);
    setMeta('meta[property="og:description"]', "content", meta.description);
    setMeta('meta[property="og:url"]', "content", canonicalUrl);
    setMeta('meta[name="twitter:title"]', "content", meta.title);
    setMeta('meta[name="twitter:description"]', "content", meta.description);
    setMeta('link[rel="canonical"]', "href", canonicalUrl);
    setMeta('meta[name="robots"]', "content", meta.noindex ? "noindex,nofollow" : "index,follow");
  }, [location.pathname]);
  return null;
}

function OSRoute() {
  const auth = useAuth({ required: false });
  const navigate = useNavigate();
  const [activeHoaId, setActiveHoaId] = useState<string | null>(null);
  const { data: activeHoa } = useQuery({ queryKey: ["active-hoa", activeHoaId], queryFn: () => activeHoaId ? rpc.getHOA(activeHoaId) : null, enabled: Boolean(activeHoaId) });
  if (auth.status !== "authenticated") {
    return <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}><style>{GLOBAL_CSS}</style><div style={{ textAlign: "center" }}><div style={{ fontFamily: T.fontSans, fontSize: 20, color: "var(--text)", marginBottom: 16 }}>Sign in to access the GatePass association workspace</div><Btn onClick={() => auth.signIn()}>Sign In</Btn></div></div>;
  }
  if (activeHoaId) {
    const hoa = activeHoa as { community?: string; zip?: string } | null;
    return <BoardWorkspace hoaId={activeHoaId} hoaName={hoa?.community} hoaZip={hoa?.zip} onBack={() => setActiveHoaId(null)} />;
  }
  return <HOASelector onSelect={setActiveHoaId} onPublic={() => navigate("/")} />;
}

function AdminRoute() {
  const auth = useAuth({ required: false });
  if (auth.status !== "authenticated") {
    return <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}><style>{GLOBAL_CSS}</style><div style={{ textAlign: "center" }}><div style={{ fontFamily: T.fontSans, fontSize: 20, color: "var(--text)", marginBottom: 16 }}>Sign in to access GatePass Admin</div><Btn onClick={() => auth.signIn()}>Sign In</Btn></div></div>;
  }
  return <ErrorBoundary><AdminConsole /></ErrorBoundary>;
}

function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a130d] text-white">
      <main className="min-h-screen flex items-center justify-center px-6 text-center">
        <div className="max-w-lg"><p className="text-xs text-[#B8883A] tracking-[0.25em] uppercase">404</p><h1 className="gp-display text-5xl md:text-6xl mt-5">Page not found.</h1><p className="text-white/55 mt-5 leading-relaxed">Return to GatePass or open the modeled demo.</p><div className="flex flex-col sm:flex-row justify-center gap-3 mt-8"><a href="/" className="inline-flex justify-center text-sm font-semibold text-[#0d1a12] bg-[#B8883A] px-7 py-3.5 rounded-full">Go home</a><a href="/demo" className="inline-flex justify-center text-sm text-white/70 border border-white/20 px-7 py-3.5 rounded-full">Open demo</a></div></div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <>
      <RouteMetadata />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/onboard" element={<OnboardRoute />} />
        <Route path="/contractors" element={<ContractorRoute />} />
        <Route path="/demo" element={<DemoRoute />} />
        <Route path="/demo/transition" element={<TransitionDemoRoute />} />
        <Route path="/demo/marketplace" element={<PropertyWorkPathRoute />} />
        <Route path="/marketplace-loop" element={<PropertyWorkPathRoute />} />
        <Route path="/investor-status" element={<Navigate to="/investors#current-status" replace />} />
        <Route path="/os" element={<OSRoute />} />
        <Route path="/admin" element={<AdminRoute />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/investors" element={<Investors />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}