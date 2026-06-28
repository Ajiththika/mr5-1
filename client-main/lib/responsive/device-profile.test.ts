/** @jest-environment node */
import { resolveDeviceProfile } from "./device-profile";

describe("resolveDeviceProfile", () => {
  it("maps watch width", () => {
    expect(resolveDeviceProfile(320)).toBe("watch");
    expect(resolveDeviceProfile(400)).toBe("watch");
  });

  it("maps phone width", () => {
    expect(resolveDeviceProfile(401)).toBe("phone");
    expect(resolveDeviceProfile(768)).toBe("phone");
  });

  it("maps fold when multi-segment", () => {
    expect(resolveDeviceProfile(800, 2)).toBe("fold");
  });

  it("maps tablet and laptop", () => {
    expect(resolveDeviceProfile(900)).toBe("tablet");
    expect(resolveDeviceProfile(1280)).toBe("laptop");
  });

  it("maps desktop, tv, ultrawide", () => {
    expect(resolveDeviceProfile(1600)).toBe("desktop");
    expect(resolveDeviceProfile(1920)).toBe("tv");
    expect(resolveDeviceProfile(5120)).toBe("ultrawide");
  });
});
