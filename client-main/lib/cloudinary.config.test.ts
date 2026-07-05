import {
  assertUnsignedUploadPreset,
  getCloudinaryClientConfig,
} from "./cloudinary.config";

describe("cloudinary.config", () => {
  const originalCloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const originalPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  afterEach(() => {
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = originalCloudName;
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET = originalPreset;
  });

  it("builds a valid upload URL when cloud name is set", () => {
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = "mr5";
    const config = getCloudinaryClientConfig();
    expect(config.uploadUrl).toBe("https://api.cloudinary.com/v1_1/mr5/image/upload");
    expect(config.deliveryBaseUrl).toBe("https://res.cloudinary.com/mr5");
  });

  it("throws when cloud name is missing", () => {
    delete process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    expect(() => getCloudinaryClientConfig()).toThrow(/NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is missing/);
  });

  it("never produces a double-slash upload URL", () => {
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = "mr5";
    const config = getCloudinaryClientConfig();
    expect(config.uploadUrl).not.toContain("/v1_1//");
  });

  it("requires upload preset for unsigned uploads", () => {
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = "mr5";
    delete process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    expect(() => assertUnsignedUploadPreset()).toThrow(/NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET is missing/);
  });
});
