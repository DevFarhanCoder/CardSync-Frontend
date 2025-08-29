import React, { useMemo, useState } from "react";
import CardPreview from "@/components/CardPreview";
import { CardData, CardType, filterCardByType, validateCard } from "@/lib/cardTypes";

const TYPES: CardType[] = ["business", "personal", "portfolio", "event"];

export default function NewCard() {
    const [type, setType] = useState<CardType>("business");

    const [form, setForm] = useState<CardData>({
        name: "",
        role: "",
        email: "",
        phone: "",
        address: "",
        website: "",
        logoUrl: "",
        tagline: "",
        socials: {
            linkedin: "",
            instagram: "",
            facebook: "",
            youtube: "",
            github: "",
            twitter: "",
            whatsapp: "",
        },
    });

    // === THIS is the “filterCardByType” usage you asked about ===
    const onChangeType = (t: CardType) => {
        setType(t);
        setForm(prev => filterCardByType(prev, t));
    };

    const onChange = (key: keyof CardData, value: string) =>
        setForm((p) => ({ ...p, [key]: value }));

    const onSocial = (key: keyof NonNullable<CardData["socials"]>, value: string) =>
        setForm((p) => ({ ...p, socials: { ...(p.socials || {}), [key]: value } }));

    // computed: what actually goes into preview (filtered)
    const previewData = useMemo(() => filterCardByType(form, type), [form, type]);

    // === THIS is the “validateCard” usage you asked about ===
    const onSave = () => {
        const result = validateCard(form, type);
        if (!result.ok) {
            alert(`Missing: ${result.missing.join(", ")}`);
            return;
        }
        // call your backend create API here if you want (not required for preview)
        alert("Looks valid. Hook your POST here.");
    };

    return (
        <div className="container py-6 grid lg:grid-cols-2 gap-8">
            <div className="space-y-4">
                <h1 className="text-xl font-semibold">Create a new card</h1>

                <div className="flex gap-2 flex-wrap">
                    {TYPES.map((t) => (
                        <button
                            key={t}
                            onClick={() => onChangeType(t)}
                            className={`px-3 py-1.5 rounded-lg border ${type === t ? "bg-white/10 border-white/20" : "border-white/10 hover:bg-white/5"}`}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input className="input" placeholder="Name" value={form.name} onChange={(e) => onChange("name", e.target.value)} />
                    <input className="input" placeholder="Role" value={form.role || ""} onChange={(e) => onChange("role", e.target.value)} />
                    <input className="input" placeholder="Email" value={form.email || ""} onChange={(e) => onChange("email", e.target.value)} />
                    <input className="input" placeholder="Phone" value={form.phone || ""} onChange={(e) => onChange("phone", e.target.value)} />
                    <input className="input" placeholder="Address" value={form.address || ""} onChange={(e) => onChange("address", e.target.value)} />
                    <input className="input" placeholder="Website" value={form.website || ""} onChange={(e) => onChange("website", e.target.value)} />
                    <input className="input" placeholder="Logo URL" value={form.logoUrl || ""} onChange={(e) => onChange("logoUrl", e.target.value)} />
                    <input className="input sm:col-span-2" placeholder="Tagline" value={form.tagline || ""} onChange={(e) => onChange("tagline", e.target.value)} />
                </div>

                <h2 className="font-medium mt-4">Social links</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input className="input" placeholder="LinkedIn" value={form.socials?.linkedin || ""} onChange={(e) => onSocial("linkedin", e.target.value)} />
                    <input className="input" placeholder="Instagram" value={form.socials?.instagram || ""} onChange={(e) => onSocial("instagram", e.target.value)} />
                    <input className="input" placeholder="Facebook" value={form.socials?.facebook || ""} onChange={(e) => onSocial("facebook", e.target.value)} />
                    <input className="input" placeholder="YouTube" value={form.socials?.youtube || ""} onChange={(e) => onSocial("youtube", e.target.value)} />
                    <input className="input" placeholder="Github" value={form.socials?.github || ""} onChange={(e) => onSocial("github", e.target.value)} />
                    <input className="input" placeholder="Twitter/X" value={form.socials?.twitter || ""} onChange={(e) => onSocial("twitter", e.target.value)} />
                    <input className="input" placeholder="WhatsApp (number)" value={form.socials?.whatsapp || ""} onChange={(e) => onSocial("whatsapp", e.target.value)} />
                </div>

                <div className="flex gap-2 pt-3">
                    <button onClick={onSave} className="btn btn-gold px-4 py-2">Save</button>
                </div>
            </div>

            <div>
                {/* This is the CardPreview usage you asked about */}
                <CardPreview type={type} data={previewData} />
            </div>
        </div>
    )
}
