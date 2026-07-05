import { HDRI_PRESETS, resolveHdriPath } from "@/lib/hdri-presets";

describe("hdri-presets", () => {
  it("maps apartment preset to local lebombo file", () => {
    expect(resolveHdriPath("apartment")).toBe("/assets/hdri/lebombo_1k.hdr");
  });

  it("returns undefined for unknown presets", () => {
    expect(resolveHdriPath("warehouse")).toBeUndefined();
  });

  it("includes all homepage-critical presets", () => {
    expect(HDRI_PRESETS.apartment).toBeTruthy();
    expect(HDRI_PRESETS.sunset).toBeTruthy();
    expect(HDRI_PRESETS.night).toBeTruthy();
    expect(HDRI_PRESETS.city).toBeTruthy();
  });
});
