import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client as rpc } from "@/lib/client";
import { T } from "./tokens";
import { SectionHeader, Btn, Card, Tag, EmptyState, Modal, FDInput, FDSelect, FDTextarea, Icons } from "./ui-kit";

const ANN_CATS = ["general","urgent","maintenance","events","financial","governance"];

export function CommHub({ hoaId }: { hoaId: string }) {
  const qc = useQueryClient();
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ title: "", body: "", category: "general", authorName: "", pinned: "false", expiresAt: "" });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const { data: announcements = [], isLoading } = useQuery({
    queryKey: ["announcements", hoaId],
    queryFn: () => rpc.getAnnouncements(hoaId),
  });

  const createMut = useMutation({
    mutationFn: () => rpc.createAnnouncement({
      hoaId,
      title: form.title,
      body: form.body,
      category: form.category,
      authorName: form.authorName,
      pinned: form.pinned === "true",
      expiresAt: form.expiresAt || undefined,
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["announcements"] }); setModal(false); setForm({ title: "", body: "", category: "general", authorName: "", pinned: "false", expiresAt: "" }); },
  });

  const catColors: Record<string, { color: string; bg: string }> = {
    urgent:     { color: T.danger,  bg: T.dangerPale },
    financial:  { color: T.gold,    bg: T.goldLight },
    governance: { color: T.blue,    bg: T.bluePale },
    maintenance:{ color: T.purple,  bg: T.purplePale },
    events:     { color: T.forest,  bg: T.forestPale },
    general:    { color: T.inkMid,  bg: T.creamDark },
  };

  type ANN = { id: string; title: string; body: string; category: string; pinned: boolean; authorName: string; createdAt: Date | string; expiresAt?: Date | string | null };

  return (
    <div style={{ padding: "32px 40px" }} className="main-pad">
      <SectionHeader
        title="CommHub — Communications"
        sub="Announcements, newsletters, and resident messaging"
        action={<Btn onClick={() => setModal(true)}><Icons.Plus /> Post Announcement</Btn>}
      />

      {isLoading && <div style={{ padding: 40, textAlign: "center", color: T.inkLight }}>Loading...</div>}
      {!isLoading && (announcements as ANN[]).length === 0 && (
        <EmptyState icon="📣" title="No announcements yet" sub="Post updates, notices, and news to your community." />
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {(announcements as ANN[]).map(a => {
          const c = catColors[a.category] || catColors.general;
          return (
            <Card key={a.id} style={{ padding: "20px 26px", borderLeft: a.pinned ? `3px solid ${T.gold}` : undefined }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                    {a.pinned && <Tag color={T.gold} bg={T.goldLight}>📌 Pinned</Tag>}
                    <Tag color={c.color} bg={c.bg}>{a.category}</Tag>
                  </div>
                  <h3 style={{ fontFamily: T.fontSerif, fontSize: 17, fontWeight: 600, color: T.charcoal, marginBottom: 8 }}>{a.title}</h3>
                  <div style={{ fontFamily: T.fontSans, fontSize: 13, color: T.inkMid, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{a.body}</div>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 10, borderTop: `1px solid ${T.stone}30`, marginTop: 10 }}>
                <div style={{ fontFamily: T.fontMono, fontSize: 11, color: T.inkLight }}>
                  Posted by {a.authorName} · {new Date(a.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </div>
                {a.expiresAt && (
                  <div style={{ fontFamily: T.fontMono, fontSize: 11, color: T.inkLight }}>
                    Expires {new Date(a.expiresAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Post Announcement">
        <FDInput label="Title" placeholder="Pool maintenance this weekend" value={form.title} onChange={e => set("title", e.target.value)} />
        <FDSelect label="Category" value={form.category} onChange={e => set("category", e.target.value)}>
          {ANN_CATS.map(c => <option key={c} value={c}>{c}</option>)}
        </FDSelect>
        <FDTextarea label="Message" placeholder="Write your announcement..." value={form.body} onChange={e => set("body", e.target.value)} style={{ minHeight: 140 }} />
        <FDInput label="Author Name" placeholder="HOA Board" value={form.authorName} onChange={e => set("authorName", e.target.value)} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <FDSelect label="Pin to top?" value={form.pinned} onChange={e => set("pinned", e.target.value)}>
            <option value="false">No</option>
            <option value="true">Yes — pin it</option>
          </FDSelect>
          <FDInput label="Expires (optional)" type="date" value={form.expiresAt} onChange={e => set("expiresAt", e.target.value)} />
        </div>
        <Btn full onClick={() => createMut.mutate()} disabled={!form.title || !form.body || !form.authorName || createMut.isPending}>
          {createMut.isPending ? "Posting…" : "Post Announcement"}
        </Btn>
        {createMut.isError && <div style={{ marginTop: 12, color: T.danger, fontFamily: T.fontSans, fontSize: 13 }}>Error — please try again.</div>}
      </Modal>
    </div>
  );
}
