"use client";

import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import Image from "next/image";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { authService } from "@/services/auth.service";
import { uploadToCloudinary } from "@/services/cloudinary.service";
import { AVATAR_PRESETS } from "@/lib/avatar-presets";

export interface ProfileEditForm {
  name: string;
  email: string;
  language: string;
  timezone: string;
  avatarUrl?: string;
  avatarPreset?: string;
}

interface ProfileEditModalProps {
  open: boolean;
  initial: ProfileEditForm;
  onClose: () => void;
  onSaved: () => Promise<void>;
}

export function ProfileEditModal({
  open,
  initial,
  onClose,
  onSaved,
}: ProfileEditModalProps) {
  const [editing, setEditing] = useState<ProfileEditForm>(initial);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    initial.avatarUrl || null,
  );
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      toast.error("Please select a valid image file (JPEG, PNG)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setIsUploading(true);
      let avatarUrl = editing.avatarUrl;
      if (avatarFile) {
        const uploadResult = await uploadToCloudinary(avatarFile, {
          folder: "avatars",
          tags: ["profile", "avatar"],
        });
        if (!uploadResult) throw new Error("Failed to upload avatar");
        avatarUrl = uploadResult.secure_url;
      }
      await authService.updateProfile({ ...editing, avatarUrl });
      await onSaved();
      onClose();
      toast.success("Profile updated successfully!");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to update profile";
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-card p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-bold">Edit Profile</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            Close
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/5">
                {avatarPreview ? (
                  <Image
                    src={avatarPreview}
                    alt="Avatar preview"
                    width={96}
                    height={96}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-2xl text-muted-foreground">?</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 rounded-full border-2 border-background bg-primary p-1.5"
                disabled={isUploading}
              >
                <Upload className="h-4 w-4 text-primary-foreground" />
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/jpg"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">3D Avatar Preset</label>
            <div className="grid grid-cols-4 gap-2">
              {AVATAR_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() =>
                    setEditing({ ...editing, avatarPreset: preset.id })
                  }
                  className={`rounded-lg border p-2 text-lg ${
                    editing.avatarPreset === preset.id
                      ? "border-primary bg-primary/10"
                      : "border-white/10 hover:border-white/30"
                  }`}
                >
                  {preset.emoji}
                </button>
              ))}
            </div>
          </div>
          {(["name", "email", "language", "timezone"] as const).map((field) => (
            <div key={field}>
              <label className="mb-1 block text-sm font-medium capitalize">
                {field}
              </label>
              <input
                type={field === "email" ? "email" : "text"}
                value={editing[field]}
                onChange={(e) =>
                  setEditing({ ...editing, [field]: e.target.value })
                }
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2"
                disabled={isUploading}
              />
            </div>
          ))}
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isUploading}>
              {isUploading ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
