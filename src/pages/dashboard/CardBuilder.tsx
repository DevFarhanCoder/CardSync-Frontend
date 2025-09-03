import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { nanoid } from "nanoid";
import CardPreview from "@/components/CardPreview";
import {
  CardData,
  CardType,
  DEFAULT_CARD_TYPE,
  filterCardByType,
  normalizeType,
  validateCard,
} from "@/lib/cardTypes";
import { api } from "@/lib/api";
import "@/styles/ic-form.css";

type Saved = { id: string; dbId?: string | null; createdAt: string; data: CardData };

const THEMES = [
  { value: "luxe", label: "Luxe (Black/Gold)" },
  { value: "minimal", label: "Minimal (Light)" },
  { value: "tech", label: "Tech (Indigo)" },
];

const TYPES: Array<{ value: CardType; label: string }> = [
  { value: "business", label: "Business" },
  { value: "personal", label: "Personal" },
];

export default function CardBuilder() {
  const nav = useNavigate();
  const loc = useLocation() as any;

  const [id, setId] = useState<string>(
    () =>
      loc.state?.id ||
      new URLSearchParams(location.search).get("id") ||
      nanoid(8)
  );

  const [data, setData] = useState<CardData>(
    () =>
      (loc.state?.data as CardData) || {
        type: DEFAULT_CARD_TYPE,
        theme: "luxe",
        title: "Card Title",
        socials: {},
        extra: {},
      }
  );

  const [toast, setToast] = useState<string | null>(null);
  const token = localStorage.getItem("token");

  const type = normalizeType(data.type);
  const theme = (data.theme || "luxe") as string;
  const view = useMemo(() => filterCardByType(data, type), [data, type]);

  /** helpers */
  const update = <K extends keyof CardData>(key: K, value: CardData[K]) =>
    setData((prev) => ({ ...prev, [key]: value }));

  const updateSocial = (
    k: keyof NonNullable<CardData["socials"]>,
    v: string
  ) =>
    setData((prev) => ({
      ...prev,
      socials: { ...(prev.socials || {}), [k]: v },
    }));

  const updatePersonal = (
    patch: Partial<NonNullable<CardData["extra"]>["personal"]>
  ) =>
    setData((p) => ({
      ...p,
      extra: {
        ...(p.extra || {}),
        personal: { ...(p.extra?.personal || {}), ...patch },
      },
    }));

  const updateCompany = (
    patch: Partial<NonNullable<CardData["extra"]>["company"]>
  ) =>
    setData((p) => ({
      ...p,
      extra: {
        ...(p.extra || {}),
        company: { ...(p.extra?.company || {}), ...patch },
      },
    }));

  const showToast = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(null), 1800);
  };

  const readSavedList = (): Saved[] => {
    const raw = localStorage.getItem("cards");
    return raw ? JSON.parse(raw) : [];
  };

  const writeSavedList = (arr: Saved[]) => {
    localStorage.setItem("cards", JSON.stringify(arr));
  };

  const upsertLocal = (partial?: { dbId?: string | null }) => {
    const arr = readSavedList();
    const exists = arr.find((x) => x.id === id);
    const record: Saved = exists
      ? { ...exists, data, ...(partial || {}) }
      : { id, createdAt: new Date().toISOString(), data, ...(partial || {}) };
    const next = exists ? arr.map((x) => (x.id === id ? record : x)) : [record, ...arr];
    writeSavedList(next);
    return record;
  };

  /** Save locally; if token exists also sync to backend */
  /** Save locally; if token exists also sync to backend */
  const onSave = async () => {
    const { ok, missing } = validateCard(data, type);
    if (!ok) {
      showToast(`Missing: ${missing.join(", ")}`);
      return;
    }

    const localRecord = upsertLocal();

    if (!token) {
      showToast("Saved locally");
      nav("/dashboard/cards"); // ✅ redirect after local save
      return;
    }

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      let dbId = localRecord.dbId || null;

      if (dbId) {
        const res = await fetch(api(`/cards/${dbId}`), {
          method: "PUT",
          headers,
          body: JSON.stringify({
            title: data.title || "Untitled",
            theme: data.theme || "luxe",
            data,
            isPublic: false,
          }),
        });
        if (!res.ok) throw new Error("Failed to sync (update)");
        const j = await res.json();
        dbId = j?.card?._id || dbId;
      } else {
        const res = await fetch(api("/cards"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",   // 👈
          },
          body: JSON.stringify({
            title: data.title || "Untitled",
            theme: data.theme || "luxe",
            data,
            isPublic: false,
          }),
        });
        if (!res.ok) throw new Error("Failed to sync (create)");
        const j = await res.json();
        dbId = j?.card?._id || null;
      }

      upsertLocal({ dbId });
      showToast("Synced");

      // ✅ redirect after sync
      nav("/dashboard/cards");
    } catch (e) {
      console.error(e);
      showToast("Saved locally (sync failed)");
      nav("/dashboard/cards");
    }
  };
  const onSaveAndExit = async () => {
    await onSave();
    nav("/dashboard/cards");
  };

  useEffect(() => {
    if (loc.state?.id) setId(loc.state.id);
  }, [loc.state?.id]);

  return (
    <div className="grid lg:grid-cols-[420px,1fr] gap-6">
      {/* Preview */}
      <div className="card p-4">
        <CardPreview
          id="builder-card"
          data={view}
          theme={theme}
        />
      </div>

      {/* Form — styled by ic-form.css */}
      <div className="card p-6 ic-form">
        <div className="text-base font-semibold mb-4">Properties</div>

        {/* ---------- BASICS ---------- */}
        <div className="space-y-4">
          <div>
            <label className="ic-label">Title</label>
            <input
              className="input ic-input"
              placeholder="Card Title"
              value={data.title || ""}
              onChange={(e) => update("title", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="ic-label">Theme</label>
              <select
                className="input ic-input"
                value={theme}
                onChange={(e) => update("theme", e.target.value)}
              >
                {THEMES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="ic-label">Type of Card</label>
              <select
                className="input ic-input"
                value={type}
                onChange={(e) => update("type", e.target.value as CardType)}
              >
                {TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="ic-label">Name</label>
              <input
                className="input ic-input"
                value={data.name || ""}
                onChange={(e) => update("name", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="ic-label">Role / Title</label>
              <input
                className="input ic-input"
                value={data.role || ""}
                onChange={(e) => update("role", e.target.value)}
              />
            </div>
            <div>
              <label className="ic-label">Email</label>
              <input
                className="input ic-input"
                value={data.email || ""}
                onChange={(e) => update("email", e.target.value)}
              />
            </div>
            <div>
              <label className="ic-label">Phone No.</label>
              <input
                className="input ic-input"
                value={data.phone || ""}
                onChange={(e) => update("phone", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="ic-label">Address</label>
              <input
                className="input ic-input"
                value={data.address || ""}
                onChange={(e) => update("address", e.target.value)}
              />
            </div>
            <div>
              <label className="ic-label">Google Maps link</label>
              <input
                className="input ic-input"
                placeholder="https://maps.google.com/…"
                value={data.addressMap || ""}
                onChange={(e) => update("addressMap", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="ic-label">Website</label>
              <input
                className="input ic-input"
                placeholder="https://…"
                value={data.website || ""}
                onChange={(e) => update("website", e.target.value)}
              />
            </div>
            <div>
              <label className="ic-label">Logo URL (optional)</label>
              <input
                className="input ic-input"
                placeholder="https://…/logo.png"
                value={data.logoUrl || ""}
                onChange={(e) => update("logoUrl", e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="ic-divider" />

        {/* ---------- PERSONAL (only for Personal type) ---------- */}
        {type === "personal" && (
          <div className="space-y-4">
            <div className="ic-section-title">Personal</div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="ic-label">Photo URL</label>
                <input
                  className="input ic-input"
                  placeholder="https://…/photo.jpg"
                  value={data.extra?.personal?.photoUrl || ""}
                  onChange={(e) => updatePersonal({ photoUrl: e.target.value })}
                />
              </div>
              <div>
                <label className="ic-label">Gender</label>
                <select
                  className="input ic-input"
                  value={data.extra?.personal?.gender || ""}
                  onChange={(e) =>
                    updatePersonal({ gender: e.target.value as any })
                  }
                >
                  <option value="">Select</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="ic-label">Birth Date</label>
                <input
                  type="date"
                  className="input ic-input"
                  value={data.extra?.personal?.birthDate || ""}
                  onChange={(e) =>
                    updatePersonal({ birthDate: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="ic-label">Anniversary Date</label>
                <input
                  type="date"
                  className="input ic-input"
                  value={data.extra?.personal?.anniversaryDate || ""}
                  onChange={(e) =>
                    updatePersonal({ anniversaryDate: e.target.value })
                  }
                />
              </div>
              <div className="md:col-span-2">
                <label className="ic-label">Education Details</label>
                <textarea
                  rows={2}
                  className="input ic-input"
                  value={data.extra?.personal?.education || ""}
                  onChange={(e) =>
                    updatePersonal({ education: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="ic-label">Res Address</label>
                <input
                  className="input ic-input"
                  value={data.extra?.personal?.resAddress || ""}
                  onChange={(e) =>
                    updatePersonal({ resAddress: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="ic-label">Pincode</label>
                <input
                  className="input ic-input"
                  value={data.extra?.personal?.pincode || ""}
                  onChange={(e) => updatePersonal({ pincode: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="ic-label">Maps link</label>
                <input
                  className="input ic-input"
                  placeholder="https://maps.google.com/…"
                  value={data.extra?.personal?.mapsLink || ""}
                  onChange={(e) =>
                    updatePersonal({ mapsLink: e.target.value })
                  }
                />
              </div>
              <div className="md:col-span-2">
                <label className="ic-label">Message</label>
                <textarea
                  rows={2}
                  className="input ic-input"
                  value={data.extra?.personal?.message || ""}
                  onChange={(e) =>
                    updatePersonal({ message: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
        )}

        {/* ---------- COMPANY (only for Business type) ---------- */}
        {type === "business" && (
          <div className="space-y-4">
            <div className="ic-section-title">Company</div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="ic-label">Company Name</label>
                <input
                  className="input ic-input"
                  value={data.extra?.company?.companyName || ""}
                  onChange={(e) =>
                    updateCompany({ companyName: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="ic-label">Logo URL</label>
                <input
                  className="input ic-input"
                  placeholder="https://…/logo.png"
                  value={data.extra?.company?.companyLogo || ""}
                  onChange={(e) =>
                    updateCompany({ companyLogo: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="ic-label">Designation</label>
                <input
                  className="input ic-input"
                  value={data.extra?.company?.designation || ""}
                  onChange={(e) =>
                    updateCompany({ designation: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="ic-label">Business Category</label>
                <input
                  className="input ic-input"
                  value={data.extra?.company?.category || ""}
                  onChange={(e) =>
                    updateCompany({ category: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="ic-label">Company Mob No</label>
                <input
                  className="input ic-input"
                  value={data.extra?.company?.companyMobile || ""}
                  onChange={(e) =>
                    updateCompany({ companyMobile: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="ic-label">Email ID</label>
                <input
                  className="input ic-input"
                  value={data.extra?.company?.email || ""}
                  onChange={(e) => updateCompany({ email: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="ic-label">Co Address</label>
                <input
                  className="input ic-input"
                  value={data.extra?.company?.address || ""}
                  onChange={(e) =>
                    updateCompany({ address: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="ic-label">Maps link</label>
                <input
                  className="input ic-input"
                  placeholder="https://maps.google.com/…"
                  value={data.extra?.company?.mapsLink || ""}
                  onChange={(e) =>
                    updateCompany({ mapsLink: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="ic-label">Website</label>
                <input
                  className="input ic-input"
                  placeholder="https://…"
                  value={data.extra?.company?.website || ""}
                  onChange={(e) =>
                    updateCompany({ website: e.target.value })
                  }
                />
              </div>
              <div className="md:col-span-2">
                <label className="ic-label">Message</label>
                <textarea
                  rows={2}
                  className="input ic-input"
                  value={data.extra?.company?.message || ""}
                  onChange={(e) =>
                    updateCompany({ message: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
        )}

        <div className="ic-divider" />

        {/* ---------- SOCIAL LINKS ---------- */}
        <div className="space-y-4">
          <div className="ic-section-title">Social Links</div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="ic-label">LinkedIn (username or URL)</label>
              <input
                className="input ic-input"
                value={data.socials?.linkedin || ""}
                onChange={(e) => updateSocial("linkedin", e.target.value)}
              />
            </div>
            <div>
              <label className="ic-label">Twitter/X (handle or URL)</label>
              <input
                className="input ic-input"
                value={data.socials?.twitter || ""}
                onChange={(e) => updateSocial("twitter", e.target.value)}
              />
            </div>

            <div>
              <label className="ic-label">Instagram</label>
              <input
                className="input ic-input"
                value={data.socials?.instagram || ""}
                onChange={(e) => updateSocial("instagram", e.target.value)}
              />
            </div>
            <div>
              <label className="ic-label">Facebook</label>
              <input
                className="input ic-input"
                value={data.socials?.facebook || ""}
                onChange={(e) => updateSocial("facebook", e.target.value)}
              />
            </div>

            <div>
              <label className="ic-label">YouTube</label>
              <input
                className="input ic-input"
                value={data.socials?.youtube || ""}
                onChange={(e) => updateSocial("youtube", e.target.value)}
              />
            </div>
            <div>
              <label className="ic-label">GitHub</label>
              <input
                className="input ic-input"
                value={data.socials?.github || ""}
                onChange={(e) => updateSocial("github", e.target.value)}
              />
            </div>

            <div>
              <label className="ic-label">WhatsApp (number or URL)</label>
              <input
                className="input ic-input"
                value={data.socials?.whatsapp || ""}
                onChange={(e) => updateSocial("whatsapp", e.target.value)}
              />
            </div>
            <div>
              <label className="ic-label">Telegram (@username or URL)</label>
              <input
                className="input ic-input"
                value={data.socials?.telegram || ""}
                onChange={(e) => updateSocial("telegram", e.target.value)}
              />
            </div>
          </div>

          <p className="text-xs text-[var(--subtle)]">
            Paste full URLs or just usernames/phone — we’ll auto-format on the card.
          </p>
        </div>

        {/* ---------- ACTIONS ---------- */}
        <div className="mt-6 flex gap-2">
          <button className="btn btn-gold rounded-2xl" onClick={onSave}>
            Save
          </button>
          <button className="btn rounded-2xl" onClick={onSaveAndExit}>
            Save &amp; Exit
          </button>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-[70]">
          <div className="bg-black/90 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-lg">
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}
