import {
  formatPhoneDisplay,
  mailtoHref,
  mapsHref,
  telHref,
  whatsappHref,
} from "./contact";

describe("contact helpers", () => {
  it("formats Sri Lanka numbers for display", () => {
    expect(formatPhoneDisplay("+940767422005")).toBe("+94 76 742 2005");
    expect(formatPhoneDisplay("+940761234451")).toBe("+94 76 123 4451");
  });

  it("builds clickable tel and whatsapp links", () => {
    expect(telHref("+940767422005")).toBe("tel:+940767422005");
    expect(whatsappHref("+940767422005")).toBe("https://wa.me/940767422005");
  });

  it("builds maps and mailto links", () => {
    expect(mapsHref("Vavuniya")).toContain("google.com/maps");
    expect(mailtoHref("a@b.com", "Hi")).toContain("mailto:a@b.com");
  });
});
