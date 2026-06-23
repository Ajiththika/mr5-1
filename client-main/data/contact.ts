export const MR5_CONTACT = {
  email: "ushanthamr@gmail.com",
  supportHours: "Mon–Fri, 9am–5pm (Sri Lanka time)",
  phones: [
    {
      id: "primary",
      e164: "+940767422005",
      label: "Main line",
      whatsapp: true,
    },
    {
      id: "secondary",
      e164: "+940761234451",
      label: "Support line",
      whatsapp: true,
    },
  ],
  address: {
    line1: "Pillayar Road Street, Kallikulam",
    line2: "Vavuniya, 36000",
    country: "Sri Lanka",
    mapsQuery: "Pillayar Road Street, Kallikulam, Vavuniya 36000, Sri Lanka",
  },
} as const;

export function formatPhoneDisplay(e164: string): string {
  const digits = e164.replace(/\D/g, "");
  if (digits.startsWith("94") && digits.length >= 11) {
    let national = digits.slice(2);
    if (national.startsWith("0")) national = national.slice(1);
    if (national.length === 9) {
      return `+94 ${national.slice(0, 2)} ${national.slice(2, 5)} ${national.slice(5)}`;
    }
  }
  return e164;
}

export function telHref(e164: string): string {
  return `tel:${e164.replace(/\s/g, "")}`;
}

export function whatsappHref(e164: string, text?: string): string {
  const digits = e164.replace(/\D/g, "");
  const base = `https://wa.me/${digits}`;
  if (!text) return base;
  return `${base}?text=${encodeURIComponent(text)}`;
}

export function mapsHref(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function mailtoHref(
  email: string,
  subject?: string,
  body?: string,
): string {
  const params = new URLSearchParams();
  if (subject) params.set("subject", subject);
  if (body) params.set("body", body);
  const qs = params.toString();
  return qs ? `mailto:${email}?${qs}` : `mailto:${email}`;
}
