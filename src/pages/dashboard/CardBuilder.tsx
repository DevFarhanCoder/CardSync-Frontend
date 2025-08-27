import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import CardPreview, { CardData, CardType, Theme, SocialLinks } from "@/components/CardPreview";
import { useAuth } from "@/context/AuthContext";

type FieldKey =
  | "name" | "email" | "phone" | "address" | "logoUrl" | "website"
  | "tagline" | "role" | "eventDate" | "eventVenue";

type TypeConfig = {
  required: FieldKey[];
  optional: FieldKey[];
  requiresRootTitle?: boolean;
};

const TYPE_FIELDS: Record<CardType, TypeConfig> = {
  business: { required: ["name", "email", "phone", "address"], optional: ["logoUrl", "website", "role"] },
  personal:  { required: ["name", "email", "phone"], optional: ["logoUrl", "website", "role", "address", "tagline"] },
  portfolio: { required: ["name", "email", "website"], optional: ["logoUrl", "tagline", "phone", "role", "address"] },
  event:     { required: ["eventDate", "eventVenue"], optional: ["name", "website", "phone", "email", "logoUrl"], requiresRootTitle: true },
};

function isVisible(type: CardType, key: FieldKey): boolean {
  const cfg = TYPE_FIELDS[type];
  return cfg.required.includes(key) || cfg.optional.includes(key);
}

/** API helper:
 * - In production (no VITE_API_BASE_URL), call same-origin `/api/...` so Vercel rewrite handles proxying (no CORS).
 * - In local dev, set VITE_API_BASE_URL=http://localhost:8080 and we’ll call http://localhost:8080/api/...
 */
const RAW_BASE: string = (import.meta as any)?.env?.VITE_API_BASE_URL || "";
const api = (path: string) => {
  const base = RAW_BASE.replace(/\/$/, "");
  const p = path.startsWith("/api/") ? path : `/api${path.startsWith("/") ? path : `/${path}`}`;
  return base ? `${base}${p}` : p;
};

export default function CardBuilder() {
  const location = useLocation();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { token: ctxToken } = (useAuth?.() as any) ?? { token: undefined };

  const editingLocalId = params.get("id") ?? (location as any).state?.id ?? null;

  const [title, setTitle] = useState("");
  const [theme, setTheme] = useState<Theme>("luxe");
  const [type, setType] = useState<CardType>("business");

  const [form, setForm] = useState<Record<FieldKey, string>>({
    name: "", email: "", phone: "", address: "", logoUrl: "", website: "",
    tagline: "", role: "", eventDate: "", eventVenue: "",
  });

  const [socials, setSocials] = useState<SocialLinks>({
    linkedin: "", twitter: "", instagram: "", facebook: "", youtube: "", github: "", whatsapp: "",
  });

  const [keywordsRaw, setKeywordsRaw] = useState("");
  const [dbId, setDbId] = useState<string | null>(null); // Mongo _id
  const token = ctxToken || localStorage.getItem("token") || undefined;

  // hydrate if editing
  useEffect(() => {
    if (!editingLocalId) return;
    const raw = localStorage.getItem("cards");
    const arr: any[] = raw ? JSON.parse(raw) : [];
    const found = arr.find((x) => x.id === editingLocalId);
    if (!found) return;
    const d = found.data || {};
    setDbId(found.dbId || null);

    setTitle(d.title ?? "Card Title");
    setTheme((d.theme as Theme) ?? "luxe");
    setType((d.type as CardType) ?? "business");

    setForm({
      name: d.name ?? "", email: d.email ?? "", phone: d.phone ?? "", address: d.address ?? "",
      logoUrl: d.logoUrl ?? "", website: d.website ?? "", tagline: d.tagline ?? "", role: d.role ?? "",
      eventDate: d.eventDate ?? "", eventVenue: d.eventVenue ?? "",
    });

    setSocials({
      linkedin: d.socials?.linkedin ?? "", twitter: d.socials?.twitter ?? "", instagram: d.socials?.instagram ?? "",
      facebook: d.socials?.facebook ?? "", youtube: d.socials?.youtube ?? "", github: d.socials?.github ?? "", whatsapp: d.socials?.whatsapp ?? "",
    });

    if (Array.isArray(d.keywords)) setKeywordsRaw(d.keywords.join(", "));
  }, [editingLocalId]);

  const data: CardData = useMemo(() => ({
    title, type, theme,
    name: form.name, email: form.email, phone: form.phone, address: form.address,
    logoUrl: form.logoUrl, website: form.website, tagline: form.tagline, role: form.role,
    eventDate: form.eventDate, eventVenue: form.eventVenue, socials,
  }), [title, type, theme, form, socials]);

  const reqOk = useMemo(() => {
    const cfg = TYPE_FIELDS[type];
    const baseOk = cfg.required.every((k) => form[k].trim().length > 0);
    const titleOk = cfg.requiresRootTitle ? title.trim().length > 0 : true;
    return baseOk && titleOk;
  }, [type, form, title]);

  const onChange = (key: FieldKey, v: string) => setForm((f) => ({ ...f, [key]: v }));
  const onSocial = (key: keyof SocialLinks, v: string) => setSocials((s) => ({ ...s, [key]: v }));

  async function saveCard() {
    const keywords = Array.from(
      new Set(
        keywordsRaw.split(/[,\n]/g).map((s) => s.trim().toLowerCase()).filter(Boolean)
      )
    );

    // Prepare backend-friendly payload
    const payload = {
      title,
      theme,
      data: {
        type,
        name: form.name,
        email: form.email,
        phone: form.phone,
        address: form.address,
        logoUrl: form.logoUrl,
        website: form.website,
        tagline: form.tagline,
        role: form.role,
        eventDate: form.eventDate,
        eventVenue: form.eventVenue,
        socials,
        keywords,
      },
    };

    if (!token) {
      alert("Please sign in to sync your card.");
      upsertLocalOnly({ data, keywords });
      return navigate("/dashboard/cards");
    }

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;

      let res: Response;
      if (dbId) {
        // backend exposes PUT /api/cards/:id
        res = await fetch(api(`/cards/${dbId}`), {
          method: "PUT",
          headers,
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(api("/cards"), {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
        });
      }

      const json: any = await res.json().catch(() => ({}));
      if (res.status === 401) {
        alert("Session expired. Please sign in again.");
        upsertLocalOnly({ data, keywords });
        return navigate("/signin");
      }

      if (!res.ok) {
        console.error("Card save failed:", json);
        upsertLocalOnly({ data, keywords });
        return navigate("/dashboard/cards");
      }

      // accept either { _id } or { card: { _id } }
      const newId = json?._id || json?.card?._id || dbId || null;
      setDbId(newId);
      upsertLocalOnly({ data, keywords, dbId: newId });
      navigate("/dashboard/cards");
    } catch (e) {
      console.warn("Backend unreachable, saving locally only.", e);
      upsertLocalOnly({ data, keywords });
      navigate("/dashboard/cards");
    }
  }

  function upsertLocalOnly({
    data,
    keywords,
    dbId,
  }: {
    data: CardData;
    keywords: string[];
    dbId?: string | null;
  }) {
    const localId = editingLocalId || Date.now().toString();
    const payload = {
      id: localId,
      dbId: dbId ?? null,
      createdAt: new Date().toISOString(),
      data: { ...data, keywords },
    };

    const existingRaw = localStorage.getItem("cards");
    const arr: any[] = existingRaw ? JSON.parse(existingRaw) : [];
    const idx = arr.findIndex((x) => x.id === localId);
    if (idx >= 0) {
      (payload as any).createdAt = arr[idx].createdAt || (payload as any).createdAt;
      arr[idx] = payload;
    } else {
      arr.unshift(payload);
    }
    localStorage.setItem("cards", JSON.stringify(arr));
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="card p-6 lg:col-span-2 min-h-[500px]">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">{editingLocalId ? "Edit Card" : "Canvas"}</h3>
          {dbId && <span className="chip">Synced</span>}
        </div>
        <div className="mt-3 grid place-items-center h-[420px] border border-[var(--border)] rounded-xl bg-[var(--muted)] text-[var(--subtle)]">
          <CardPreview data={data} />
        </div>
      </div>

      <div className="card p-6 space-y-4">
        <h3 className="font-semibold">Properties</h3>

        <div className="grid grid-cols-1 gap-3">
          <div>
            <label className="text-sm">Title</label>
            <input className="mt-1 w-full rounded-xl bg-[var(--muted)] text-[var(--text)] border border-[var(--border)] px-3 py-2"
              placeholder="Card Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div>
            <label className="text-sm">Theme</label>
            <select className="mt-1 w-full rounded-xl bg-[var(--muted)] text-[var(--text)] border border-[var(--border)] px-3 py-2"
              value={theme} onChange={(e) => setTheme(e.target.value as Theme)}>
              <option value="luxe">Luxe (Black/Gold)</option>
              <option value="minimal">Minimal (Light)</option>
              <option value="tech">Tech (Indigo)</option>
            </select>
          </div>

          <div>
            <label className="text-sm">Type of Card</label>
            <select className="mt-1 w-full rounded-xl bg-[var(--muted)] text-[var(--text)] border border-[var(--border)] px-3 py-2"
              value={type} onChange={(e) => setType(e.target.value as CardType)}>
              <option value="business">Business</option>
              <option value="personal">Personal Profile</option>
              <option value="portfolio">Portfolio</option>
              <option value="event">Event / Invite</option>
            </select>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          {isVisible(type, "name") && <Field label="Name" value={form.name} onChange={(v) => onChange("name", v)} />}
          {isVisible(type, "role") && <Field label="Role / Title" value={form.role} onChange={(v) => onChange("role", v)} />}
          {isVisible(type, "email") && <Field label="Email" type="email" value={form.email} onChange={(v) => onChange("email", v)} />}
          {isVisible(type, "phone") && <Field label="Phone No." value={form.phone} onChange={(v) => onChange("phone", v)} />}
          {isVisible(type, "address") && <Field label="Address" value={form.address} onChange={(v) => onChange("address", v)} />}
          {isVisible(type, "website") && <Field label="Website" placeholder="https://…" value={form.website} onChange={(v) => onChange("website", v)} />}
          {isVisible(type, "tagline") && <Field label="Tagline" value={form.tagline} onChange={(v) => onChange("tagline", v)} />}
          {isVisible(type, "logoUrl") && <Field label="Logo URL (optional)" placeholder="https://…/logo.png" value={form.logoUrl} onChange={(v) => onChange("logoUrl", v)} />}

          {type === "event" && (
            <>
              <Field label="Event Date & Time" placeholder="e.g., 21 Sep 2025, 7:00 PM" value={form.eventDate} onChange={(v) => onChange("eventDate", v)} />
              <Field label="Venue" value={form.eventVenue} onChange={(v) => onChange("eventVenue", v)} />
            </>
          )}
        </div>

        <div className="pt-4 border-t border-[var(--border)]">
          <h4 className="font-medium mb-2">Social Links</h4>
          <div className="grid grid-cols-1 gap-3">
            <Field label="LinkedIn (username or URL)" value={socials.linkedin || ""} onChange={(v) => onSocial("linkedin", v)} />
            <Field label="Twitter/X (handle or URL)" value={socials.twitter || ""} onChange={(v) => onSocial("twitter", v)} />
            <Field label="Instagram" value={socials.instagram || ""} onChange={(v) => onSocial("instagram", v)} />
            <Field label="Facebook" value={socials.facebook || ""} onChange={(v) => onSocial("facebook", v)} />
            <Field label="YouTube" value={socials.youtube || ""} onChange={(v) => onSocial("youtube", v)} />
            <Field label="GitHub" value={socials.github || ""} onChange={(v) => onSocial("github", v)} />
            <Field label="WhatsApp (number or URL)" value={socials.whatsapp || ""} onChange={(v) => onSocial("whatsapp", v)} />
          </div>
          <p className="text-xs text-[var(--subtle)] mt-2">Paste full URLs or just usernames/phone — we’ll auto-format the links on the card.</p>
        </div>

        <div className="pt-4 border-t border-[var(--border)]">
          <h4 className="font-medium mb-2">Keywords</h4>
          <textarea rows={2} className="w-full rounded-xl bg-[var(--muted)] text-[var(--text)] border border-[var(--border)] px-3 py-2"
            placeholder="e.g., product manager, fintech, react, design"
            value={keywordsRaw} onChange={(e) => setKeywordsRaw(e.target.value)} />
          <p className="text-xs text-[var(--subtle)] mt-1">Separate with commas. These help others find this card in Explore.</p>
        </div>

        <button className={`btn w-full ${reqOk ? "btn-gold" : "opacity-60 cursor-not-allowed"}`} disabled={!reqOk} onClick={saveCard}>
          Save
        </button>

        <div className="text-xs text-[var(--subtle)]">Required fields change with card type. Logo & Website are optional for all types.</div>
      </div>
    </div>
  );
}

function Field({
  label, value, onChange, type = "text", placeholder,
}: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; }) {
  return (
    <div>
      <label className="text-sm">{label}</label>
      <input className="mt-1 w-full rounded-xl bg-[var(--muted)] text-[var(--text)] border border-[var(--border)] px-3 py-2"
        type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}
