"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Sparkles,
  Building2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useUserAuth } from "@/context/AuthContext";
import { TrendsService, SponsorsService, type Trend, type Sponsor } from "@/lib/trends";
import { cn } from "@/lib/utils";

const ADMIN_UIDS = (process.env.NEXT_PUBLIC_ADMIN_UIDS || "").split(",").map((s) => s.trim()).filter(Boolean);

function useIsAdmin() {
  const { getUid } = useUserAuth();
  const uid = getUid();
  return Boolean(uid && ADMIN_UIDS.length && ADMIN_UIDS.includes(uid));
}

function getAuthHeaders(): HeadersInit {
  return { "Content-Type": "application/json", credentials: "include" as unknown as string };
}

export default function AdminPage() {
  const router = useRouter();
  const { getUid } = useUserAuth();
  const isAdmin = useIsAdmin();
  const uid = getUid();

  const [trends, setTrends] = useState<Trend[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"trends" | "sponsors">("trends");
  const [editingTrend, setEditingTrend] = useState<Trend | null>(null);
  const [editingSponsor, setEditingSponsor] = useState<Sponsor | null>(null);
  const [saving, setSaving] = useState(false);
  const [expandBias, setExpandBias] = useState(false);

  useEffect(() => {
    if (!uid) {
      setLoading(false);
      return;
    }
    if (!isAdmin) {
      router.replace("/");
      return;
    }
    Promise.all([
      fetch("/api/admin/trends", { credentials: "include" }).then((r) => r.json()),
      fetch("/api/admin/sponsors", { credentials: "include" }).then((r) => r.json()),
    ])
      .then(([t, s]) => {
        setTrends(Array.isArray(t) ? t : []);
        setSponsors(Array.isArray(s) ? s : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [uid, isAdmin, router]);

  const handleSaveTrend = async (data: Partial<Trend> & { name: string; description: string }) => {
    setSaving(true);
    try {
      if (editingTrend?.id) {
        await fetch(`/api/admin/trends/${editingTrend.id}`, {
          method: "PATCH",
          credentials: "include",
          headers: getAuthHeaders(),
          body: JSON.stringify(data),
        });
        setTrends((prev) =>
          prev.map((t) => (t.id === editingTrend.id ? { ...t, ...data } : t))
        );
      } else {
        const res = await fetch("/api/admin/trends", {
          method: "POST",
          credentials: "include",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            name: data.name,
            description: data.description,
            imageUrl: data.imageUrl,
            categoryFocus: data.categoryFocus,
            active: data.active !== false,
            order: data.order ?? 0,
          }),
        });
        const { id } = await res.json();
        if (id) setTrends((prev) => [...prev, { ...data, id } as Trend]);
      }
      setEditingTrend(null);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTrend = async (id: string) => {
    if (!confirm("Delete this trend?")) return;
    await fetch(`/api/admin/trends/${id}`, { method: "DELETE", credentials: "include" });
    setTrends((prev) => prev.filter((t) => t.id !== id));
  };

  const handleSaveSponsor = async (
    data: Partial<Sponsor> & { name: string }
  ) => {
    setSaving(true);
    try {
      if (editingSponsor?.id) {
        await fetch(`/api/admin/sponsors/${editingSponsor.id}`, {
          method: "PATCH",
          credentials: "include",
          headers: getAuthHeaders(),
          body: JSON.stringify(data),
        });
        setSponsors((prev) =>
          prev.map((s) => (s.id === editingSponsor.id ? { ...s, ...data } : s))
        );
      } else {
        const res = await fetch("/api/admin/sponsors", {
          method: "POST",
          credentials: "include",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            name: data.name,
            logoUrl: data.logoUrl,
            websiteUrl: data.websiteUrl,
            priority: data.priority ?? 5,
            featuredCategory: data.featuredCategory,
            active: data.active !== false,
          }),
        });
        const { id } = await res.json();
        if (id) setSponsors((prev) => [...prev, { ...data, id } as Sponsor]);
      }
      setEditingSponsor(null);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSponsor = async (id: string) => {
    if (!confirm("Remove this sponsor?")) return;
    await fetch(`/api/admin/sponsors/${id}`, { method: "DELETE", credentials: "include" });
    setSponsors((prev) => prev.filter((s) => s.id !== id));
  };

  if (!uid) {
    return (
      <div className="min-h-screen bg-background pt-24 flex items-center justify-center">
        <p className="text-muted-foreground">Sign in to access admin.</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background pt-24 flex items-center justify-center">
        <p className="text-muted-foreground">Access denied.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-24 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground pt-24 pb-20">
      <div className="mx-auto max-w-4xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="font-display text-4xl font-extrabold tracking-tight mb-2">
            Admin
          </h1>
          <p className="text-muted-foreground">
            Manage trends and sponsors. Sponsor priority (1–10) biases AI suggestions toward their looks.
          </p>
          <button
            type="button"
            onClick={() => setExpandBias((b) => !b)}
            className="mt-4 flex items-center gap-2 text-sm text-primary hover:underline"
          >
            {expandBias ? "Hide" : "How does bias work?"} {expandBias ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {expandBias && (
            <div className="mt-2 p-4 rounded-xl bg-white/5 border border-white/10 text-sm text-muted-foreground">
              Set each sponsor&apos;s <strong className="text-foreground">priority</strong> (1–10). Higher priority makes the AI more likely to surface their looks in Style Suggestions and the Outfit Mixer. Use <strong className="text-foreground">featured category</strong> (e.g. Tops, Shoes) to focus bias on that category.
            </div>
          )}
        </motion.div>

        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setTab("trends")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors",
              tab === "trends" ? "bg-primary text-primary-foreground" : "bg-white/5 text-foreground/80 hover:bg-white/10"
            )}
          >
            <Sparkles className="w-4 h-4" /> Trends
          </button>
          <button
            onClick={() => setTab("sponsors")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors",
              tab === "sponsors" ? "bg-primary text-primary-foreground" : "bg-white/5 text-foreground/80 hover:bg-white/10"
            )}
          >
            <Building2 className="w-4 h-4" /> Sponsors
          </button>
        </div>

        {tab === "trends" && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {editingTrend === null ? (
              <button
                onClick={() => setEditingTrend({ name: "", description: "", active: true, order: trends.length })}
                className="flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed border-white/20 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
              >
                <Plus className="w-4 h-4" /> Add trend
              </button>
            ) : (
              <TrendForm
                trend={editingTrend}
                onSave={handleSaveTrend}
                onCancel={() => setEditingTrend(null)}
                saving={saving}
              />
            )}
            {trends.map((t) => (
              <div
                key={t.id}
                className="flex items-start justify-between gap-4 p-4 rounded-xl border border-white/10 bg-card/50"
              >
                <div>
                  <h3 className="font-display font-bold">{t.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{t.description}</p>
                  <div className="flex gap-2 mt-2">
                    {t.categoryFocus && (
                      <span className="text-xs px-2 py-0.5 rounded bg-primary/20 text-primary">{t.categoryFocus}</span>
                    )}
                    {!t.active && <span className="text-xs text-muted-foreground">Inactive</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingTrend(t)}
                    className="p-2 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground"
                    aria-label={`Edit trend ${t.name}`}
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => t.id && handleDeleteTrend(t.id)}
                    className="p-2 rounded-lg hover:bg-red-500/20 text-muted-foreground hover:text-red-400"
                    aria-label={`Delete trend ${t.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </motion.section>
        )}

        {tab === "sponsors" && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {editingSponsor === null ? (
              <button
                onClick={() => setEditingSponsor({ name: "", priority: 5, active: true })}
                className="flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed border-white/20 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
              >
                <Plus className="w-4 h-4" /> Add sponsor
              </button>
            ) : (
              <SponsorForm
                sponsor={editingSponsor}
                onSave={handleSaveSponsor}
                onCancel={() => setEditingSponsor(null)}
                saving={saving}
              />
            )}
            {sponsors.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between gap-4 p-4 rounded-xl border border-white/10 bg-card/50"
              >
                <div className="flex items-center gap-3">
                  {s.logoUrl ? (
                    <img src={s.logoUrl} alt={s.name} className="h-8 w-auto object-contain" />
                  ) : (
                    <span className="font-display font-bold">{s.name}</span>
                  )}
                  <span className="text-sm text-muted-foreground">Priority: {s.priority}</span>
                  {s.featuredCategory && (
                    <span className="text-xs px-2 py-0.5 rounded bg-primary/20 text-primary">{s.featuredCategory}</span>
                  )}
                  {!s.active && <span className="text-xs text-muted-foreground">Inactive</span>}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingSponsor(s)}
                    className="p-2 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground"
                    aria-label={`Edit sponsor ${s.name}`}
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => s.id && handleDeleteSponsor(s.id)}
                    className="p-2 rounded-lg hover:bg-red-500/20 text-muted-foreground hover:text-red-400"
                    aria-label={`Delete sponsor ${s.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </motion.section>
        )}
      </div>
    </main>
  );
}

function TrendForm({
  trend,
  onSave,
  onCancel,
  saving,
}: {
  trend: Trend;
  onSave: (data: Partial<Trend> & { name: string; description: string }) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [name, setName] = useState(trend.name);
  const [description, setDescription] = useState(trend.description);
  const [imageUrl, setImageUrl] = useState(trend.imageUrl || "");
  const [categoryFocus, setCategoryFocus] = useState(trend.categoryFocus || "");
  const [active, setActive] = useState(trend.active);
  const [order, setOrder] = useState(trend.order ?? 0);

  return (
    <div className="p-6 rounded-xl border border-white/10 bg-card/50 space-y-4">
      <input
        type="text"
        placeholder="Trend name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:outline-none focus:border-primary"
      />
      <textarea
        placeholder="Description (what's hot, how to wear it)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
        className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:outline-none focus:border-primary resize-none"
      />
      <input
        type="url"
        placeholder="Image URL (optional)"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
        className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:outline-none focus:border-primary"
      />
      <input
        type="text"
        placeholder="Category focus (e.g. Minimalist, Y2K)"
        value={categoryFocus}
        onChange={(e) => setCategoryFocus(e.target.value)}
        className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:outline-none focus:border-primary"
      />
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
          Active (show in suggestions)
        </label>
        <label className="flex items-center gap-2 text-sm">
          Order
          <input
            type="number"
            value={order}
            onChange={(e) => setOrder(Number(e.target.value) || 0)}
            className="w-16 px-2 py-1 rounded bg-white/5 border border-white/10"
          />
        </label>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onSave({ name, description, imageUrl: imageUrl || undefined, categoryFocus: categoryFocus || undefined, active, order })}
          disabled={saving || !name.trim() || !description.trim()}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium disabled:opacity-50 flex items-center gap-2"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Save
        </button>
        <button onClick={onCancel} className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10">
          Cancel
        </button>
      </div>
    </div>
  );
}

function SponsorForm({
  sponsor,
  onSave,
  onCancel,
  saving,
}: {
  sponsor: Sponsor;
  onSave: (data: Partial<Sponsor> & { name: string }) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [name, setName] = useState(sponsor.name);
  const [logoUrl, setLogoUrl] = useState(sponsor.logoUrl || "");
  const [websiteUrl, setWebsiteUrl] = useState(sponsor.websiteUrl || "");
  const [priority, setPriority] = useState(sponsor.priority ?? 5);
  const [featuredCategory, setFeaturedCategory] = useState(sponsor.featuredCategory || "");
  const [active, setActive] = useState(sponsor.active);

  return (
    <div className="p-6 rounded-xl border border-white/10 bg-card/50 space-y-4">
      <input
        type="text"
        placeholder="Sponsor / brand name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:outline-none focus:border-primary"
      />
      <input
        type="url"
        placeholder="Logo URL (optional)"
        value={logoUrl}
        onChange={(e) => setLogoUrl(e.target.value)}
        className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:outline-none focus:border-primary"
      />
      <input
        type="url"
        placeholder="Website URL (optional)"
        value={websiteUrl}
        onChange={(e) => setWebsiteUrl(e.target.value)}
        className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:outline-none focus:border-primary"
      />
      <label className="block text-sm">
        Priority (1–10, higher = more likely in AI suggestions)
        <input
          type="number"
          min={1}
          max={10}
          value={priority}
          onChange={(e) => setPriority(Math.min(10, Math.max(1, Number(e.target.value) || 5)))}
          className="ml-2 w-14 px-2 py-1 rounded bg-white/5 border border-white/10"
        />
      </label>
      <input
        type="text"
        placeholder="Featured category (e.g. Tops, Shoes)"
        value={featuredCategory}
        onChange={(e) => setFeaturedCategory(e.target.value)}
        className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:outline-none focus:border-primary"
      />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
        Active (show in suggestions)
      </label>
      <div className="flex gap-2">
        <button
          onClick={() => onSave({ name, logoUrl: logoUrl || undefined, websiteUrl: websiteUrl || undefined, priority, featuredCategory: featuredCategory || undefined, active })}
          disabled={saving || !name.trim()}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium disabled:opacity-50 flex items-center gap-2"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Save
        </button>
        <button onClick={onCancel} className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10">
          Cancel
        </button>
      </div>
    </div>
  );
}
