import React, { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { client as rpc } from "@/lib/client";
import { T } from "./tokens";
import { Card, Tag, SectionHeader, FDInput, Label, EmptyState } from "./ui-kit";
import { Icons } from "./icons";

// ─── Types ────────────────────────────────────────────────────────────

type PermitRow = {
  id: string;
  type: string;
  description: string;
  address: string;
  zip: string;
  contractor: string;
  contractorTrade: string | null;
  contractorPhone: string | null;
  value: string | null;
  date: string | null;
  status: string;
  projectId: string | null;
  permitClass: string | null;
  latitude: string | null;
  longitude: string | null;
};

type ZoningCase = {
  id: string;
  caseNumber: string;
  caseName: string;
  caseType: string;
  workType: string;
  status: string;
  proposedZoning: string | null;
  existingZoning: string | null;
  proposedLandUse: string | null;
  existingLandUse: string | null;
  siteAddress: string;
  councilDistrict: string | null;
  applicationDate: string | null;
  statusDate: string | null;
  ownerName: string | null;
  caseManager: string | null;
  isResidentialImpact: boolean;
};

type ApplicationRow = {
  id: string;
  type: string;
  description: string;
  address: string;
  zip: string;
  applicant: string;
  contractor: string | null;
  value: string | null;
  appliedDate: string | null;
  status: string;
  permitClass: string | null;
};

// ─── Status badge ─────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  let bg = T.gray100;
  let color = T.gray600;
  if (s === "active" || s === "issued") { bg = T.successPale; color = T.success; }
  else if (s === "final" || s === "finaled") { bg = T.bluePale; color = T.blue; }
  else if (s === "expired" || s === "cancelled" || s === "void") { bg = T.dangerPale; color = T.danger; }
  else if (s === "pending" || s === "applied" || s.includes("review")) { bg = T.warnPale; color = T.warn; }
  else if (s.includes("approved")) { bg = T.successPale; color = T.success; }

  return (
    <span style={{
      display: "inline-block",
      padding: "2px 8px",
      borderRadius: 999,
      fontSize: 10,
      fontWeight: 600,
      fontFamily: T.fontMono,
      background: bg,
      color,
      textTransform: "uppercase",
      letterSpacing: "0.06em",
      whiteSpace: "nowrap",
    }}>
      {status}
    </span>
  );
}

// ─── Permit row ───────────────────────────────────────────────────────

function PermitCard({ p }: { p: PermitRow }) {
  const abcUrl = p.projectId
    ? `https://abc.austintexas.gov/web/permit/public-search-other?t_detail=1&t_selected_folderrsn=${p.projectId}`
    : null;

  return (
    <Card style={{ padding: "16px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
            <span style={{ fontFamily: T.fontSans, fontSize: 14, fontWeight: 600, color: "var(--text)" }}>
              {p.type}
            </span>
            {p.permitClass && (
              <Tag bg={T.gray100} color={T.gray600}>{p.permitClass}</Tag>
            )}
          </div>
          {p.description && (
            <div style={{ fontFamily: T.fontSans, fontSize: 12, color: "var(--text-mid)", marginBottom: 6, lineHeight: 1.4 }}>
              {p.description}
            </div>
          )}
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontFamily: T.fontMono, fontSize: 11, color: "var(--text-light)", display: "flex", alignItems: "center", gap: 4 }}>
              <Icons.Map /> {p.address}
            </span>
            {p.contractor && p.contractor !== "Unknown Contractor" && (
              <span style={{ fontFamily: T.fontMono, fontSize: 11, color: "var(--text-light)" }}>
                {p.contractor}{p.contractorTrade ? ` · ${p.contractorTrade}` : ""}
              </span>
            )}
            {p.date && (
              <span style={{ fontFamily: T.fontMono, fontSize: 11, color: "var(--text-light)" }}>{p.date}</span>
            )}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
          {p.value && (
            <span style={{ fontFamily: T.fontMono, fontSize: 13, fontWeight: 700, color: T.gold }}>{p.value}</span>
          )}
          <StatusBadge status={p.status} />
          {abcUrl && (
            <a
              href={abcUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 3,
                fontFamily: T.fontSans,
                fontSize: 11,
                color: T.forest,
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              View <Icons.ExternalLink />
            </a>
          )}
        </div>
      </div>
    </Card>
  );
}

// ─── Zoning case card ─────────────────────────────────────────────────

function ZoningCard({ c }: { c: ZoningCase }) {
  return (
    <Card style={{ padding: "18px 20px", borderLeft: c.isResidentialImpact ? `3px solid ${T.gold}` : `3px solid var(--border)` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 10 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
            <span style={{ fontFamily: T.fontMono, fontSize: 11, color: T.forest, fontWeight: 600 }}>{c.caseNumber}</span>
            {c.isResidentialImpact && (
              <Tag bg={T.goldLight} color={T.goldDim}>Residential Impact</Tag>
            )}
            <StatusBadge status={c.status || "Active"} />
          </div>
          <div style={{ fontFamily: T.fontSans, fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>
            {c.caseName || c.caseType || "Zoning Case"}
          </div>
          {c.siteAddress && (
            <div style={{ fontFamily: T.fontMono, fontSize: 11, color: "var(--text-light)", display: "flex", alignItems: "center", gap: 4 }}>
              <Icons.Map /> {c.siteAddress}
            </div>
          )}
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          {c.applicationDate && (
            <div style={{ fontFamily: T.fontMono, fontSize: 11, color: "var(--text-light)" }}>Applied {c.applicationDate}</div>
          )}
          {c.councilDistrict && (
            <div style={{ fontFamily: T.fontMono, fontSize: 11, color: "var(--text-light)" }}>District {c.councilDistrict}</div>
          )}
        </div>
      </div>

      {/* Zoning change indicators */}
      {(c.existingZoning || c.proposedZoning || c.existingLandUse || c.proposedLandUse) && (
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", paddingTop: 10, borderTop: "1px solid var(--border)" }}>
          {c.existingZoning && c.proposedZoning && (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Label>Zoning</Label>
              <span style={{ fontFamily: T.fontMono, fontSize: 11, color: "var(--text-mid)" }}>{c.existingZoning}</span>
              <span style={{ color: "var(--text-light)", fontSize: 12 }}>→</span>
              <span style={{ fontFamily: T.fontMono, fontSize: 11, color: T.forest, fontWeight: 600 }}>{c.proposedZoning}</span>
            </div>
          )}
          {c.existingLandUse && c.proposedLandUse && c.existingLandUse !== c.proposedLandUse && (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Label>Land Use</Label>
              <span style={{ fontFamily: T.fontMono, fontSize: 11, color: "var(--text-mid)" }}>{c.existingLandUse}</span>
              <span style={{ color: "var(--text-light)", fontSize: 12 }}>→</span>
              <span style={{ fontFamily: T.fontMono, fontSize: 11, color: T.gold, fontWeight: 600 }}>{c.proposedLandUse}</span>
            </div>
          )}
          {c.workType && (
            <Tag bg={T.gray100} color={T.gray600}>{c.workType}</Tag>
          )}
        </div>
      )}
    </Card>
  );
}

// ─── Application row ──────────────────────────────────────────────────

function ApplicationCard({ a }: { a: ApplicationRow }) {
  return (
    <Card style={{ padding: "16px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
            <span style={{ fontFamily: T.fontSans, fontSize: 14, fontWeight: 600, color: "var(--text)" }}>
              {a.type}
            </span>
            {a.permitClass && <Tag bg={T.gray100} color={T.gray600}>{a.permitClass}</Tag>}
          </div>
          {a.description && (
            <div style={{ fontFamily: T.fontSans, fontSize: 12, color: "var(--text-mid)", marginBottom: 6, lineHeight: 1.4 }}>
              {a.description}
            </div>
          )}
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontFamily: T.fontMono, fontSize: 11, color: "var(--text-light)", display: "flex", alignItems: "center", gap: 4 }}>
              <Icons.Map /> {a.address}
            </span>
            {a.applicant && a.applicant !== "Unknown" && (
              <span style={{ fontFamily: T.fontMono, fontSize: 11, color: "var(--text-light)" }}>
                {a.applicant}
              </span>
            )}
            {a.appliedDate && (
              <span style={{ fontFamily: T.fontMono, fontSize: 11, color: "var(--text-light)" }}>Applied {a.appliedDate}</span>
            )}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
          {a.value && (
            <span style={{ fontFamily: T.fontMono, fontSize: 13, fontWeight: 700, color: T.gold }}>{a.value}</span>
          )}
          <StatusBadge status={a.status} />
        </div>
      </div>
    </Card>
  );
}

// ─── Main LiveFeeds component ─────────────────────────────────────────

type FeedTab = "permits" | "zoning" | "pipeline";

export function LiveFeeds({ hoaZip }: { hoaZip?: string }) {
  const [tab, setTab] = useState<FeedTab>("permits");
  const [zip, setZip] = useState(hoaZip || "");
  const [debouncedZip, setDebouncedZip] = useState(hoaZip || "");
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Debounce ZIP input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedZip(zip), 600);
    return () => clearTimeout(t);
  }, [zip]);

  const permitQuery = useQuery({
    queryKey: ["lf-permits", debouncedZip],
    queryFn: () => rpc.getAustinPermits(debouncedZip || undefined),
    refetchInterval: 5 * 60 * 1000,
  });

  const zoningQuery = useQuery({
    queryKey: ["lf-zoning"],
    queryFn: () => rpc.getZoningCases({}),
    refetchInterval: 5 * 60 * 1000,
  });

  const pipelineQuery = useQuery({
    queryKey: ["lf-pipeline", debouncedZip],
    queryFn: () => rpc.getPermitApplications({ zip: debouncedZip || undefined }),
    refetchInterval: 5 * 60 * 1000,
  });

  const handleRefresh = useCallback(() => {
    permitQuery.refetch();
    zoningQuery.refetch();
    pipelineQuery.refetch();
    setLastRefresh(new Date());
  }, [permitQuery, zoningQuery, pipelineQuery]);

  const permits = (permitQuery.data ?? []) as PermitRow[];
  const zoningCases = (zoningQuery.data ?? []) as ZoningCase[];
  const applications = (pipelineQuery.data ?? []) as ApplicationRow[];

  const residentialFlags = zoningCases.filter(c => c.isResidentialImpact).length;

  const TABS: { id: FeedTab; label: string; count?: number; badge?: boolean }[] = [
    { id: "permits",  label: "Permit Activity", count: permits.length },
    { id: "zoning",   label: "Zoning Watch",    count: zoningCases.length, badge: residentialFlags > 0 },
    { id: "pipeline", label: "Permit Pipeline", count: applications.length },
  ];

  const isLoading = permitQuery.isLoading || zoningQuery.isLoading || pipelineQuery.isLoading;
  const isRefetching = permitQuery.isFetching || zoningQuery.isFetching || pipelineQuery.isFetching;

  return (
    <div style={{ padding: "32px 40px", minHeight: "100vh" }} className="main-pad">

      {/* Header */}
      <SectionHeader
        title="Live City Feeds"
        sub="Real-time Austin Open Data — permits, zoning changes, and contractor activity near your community."
        action={
          <button
            onClick={handleRefresh}
            disabled={isRefetching}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 14px",
              borderRadius: 8,
              border: "1px solid var(--border)",
              background: "var(--bg-card)",
              fontFamily: T.fontSans,
              fontSize: 13,
              fontWeight: 500,
              color: isRefetching ? "var(--text-light)" : "var(--text)",
              cursor: isRefetching ? "not-allowed" : "pointer",
              opacity: isRefetching ? 0.6 : 1,
              transition: "all 0.15s",
            }}
          >
            <span className={isRefetching ? "spin" : ""}><Icons.Refresh /></span>
            Refresh
          </button>
        }
      />

      {/* ZIP Filter */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <div style={{ width: 200 }}>
          <FDInput
            label="Filter by ZIP"
            value={zip}
            onChange={e => setZip((e.target as HTMLInputElement).value)}
            placeholder="e.g. 78752"
          />
        </div>
        {zip && (
          <button
            onClick={() => { setZip(""); setDebouncedZip(""); }}
            style={{
              marginTop: 20,
              fontFamily: T.fontSans,
              fontSize: 12,
              color: "var(--text-light)",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px 8px",
            }}
          >
            Clear
          </button>
        )}
        <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: T.success }} />
          <span style={{ fontFamily: T.fontMono, fontSize: 10, color: "var(--text-light)", letterSpacing: "0.04em" }}>
            LIVE · AUTO-REFRESH 5 MIN · Updated {lastRefresh.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 0, borderBottom: "1px solid var(--border)", marginBottom: 20 }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: "10px 18px",
              border: "none",
              borderBottom: tab === t.id ? `2px solid ${T.forest}` : "2px solid transparent",
              background: "none",
              fontFamily: T.fontSans,
              fontSize: 13,
              fontWeight: tab === t.id ? 600 : 400,
              color: tab === t.id ? "var(--text)" : "var(--text-light)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginBottom: -1,
              transition: "color 0.12s, border-color 0.12s",
            }}
          >
            {t.label}
            {t.count !== undefined && (
              <span style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minWidth: 18,
                height: 18,
                borderRadius: 999,
                padding: "0 5px",
                background: tab === t.id ? T.forestPale : T.gray100,
                color: tab === t.id ? T.forest : T.gray500,
                fontSize: 10,
                fontWeight: 700,
                fontFamily: T.fontMono,
              }}>
                {t.count}
              </span>
            )}
            {t.badge && (
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: T.gold, flexShrink: 0 }} />
            )}
          </button>
        ))}
      </div>

      {/* Loading state */}
      {isLoading && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[1, 2, 3, 4].map(i => (
            <div
              key={i}
              className="ai-skeleton"
              style={{ height: 80, borderRadius: 12 }}
            />
          ))}
        </div>
      )}

      {/* Permit Activity */}
      {!isLoading && tab === "permits" && (
        <div>
          {permits.length === 0 ? (
            <EmptyState
              icon="🏗️"
              title="No permits found"
              sub={zip ? `No issued permits found for ZIP ${zip}. Try a different ZIP code.` : "Enter a ZIP code to filter permit activity in your area."}
            />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {permits.map(p => <PermitCard key={p.id} p={p} />)}
            </div>
          )}
        </div>
      )}

      {/* Zoning Watch */}
      {!isLoading && tab === "zoning" && (
        <div>
          {residentialFlags > 0 && (
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "12px 16px",
              background: T.warnPale,
              border: `1px solid ${T.warn}22`,
              borderRadius: 10,
              marginBottom: 16,
            }}>
              <span style={{ fontSize: 16 }}>⚠️</span>
              <span style={{ fontFamily: T.fontSans, fontSize: 13, color: T.warnDim, fontWeight: 500 }}>
                {residentialFlags} active zoning case{residentialFlags > 1 ? "s" : ""} with residential land-use impact detected. Gold border = residential impact.
              </span>
            </div>
          )}
          {zoningCases.length === 0 ? (
            <EmptyState icon="🗺️" title="No zoning cases found" sub="No active rezoning cases returned. Try refreshing." />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {zoningCases.map(c => <ZoningCard key={c.id} c={c} />)}
            </div>
          )}
        </div>
      )}

      {/* Permit Pipeline */}
      {!isLoading && tab === "pipeline" && (
        <div>
          <div style={{ marginBottom: 14, padding: "10px 14px", background: T.bluePale, borderRadius: 10, fontFamily: T.fontSans, fontSize: 12, color: T.blueDim }}>
            Applications in the pipeline — submitted but not yet issued. Shows what contractors are planning near your community.
          </div>
          {applications.length === 0 ? (
            <EmptyState
              icon="📋"
              title="No pending applications"
              sub={zip ? `No permit applications in queue for ZIP ${zip}.` : "Enter a ZIP to see permit applications in the pipeline."}
            />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {applications.map(a => <ApplicationCard key={a.id} a={a} />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
