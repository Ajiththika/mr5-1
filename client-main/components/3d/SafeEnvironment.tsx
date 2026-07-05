"use client";

import { Component, type ReactNode } from "react";
import { Environment, type EnvironmentProps } from "@react-three/drei";
import { resolveHdriPath } from "@/lib/hdri-presets";

type SafeEnvironmentProps = Omit<EnvironmentProps, "preset"> & {
  preset?: string;
};

class EnvironmentErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) {
      return this.props.fallback ?? null;
    }
    return this.props.children;
  }
}

/**
 * Loads environment maps from self-hosted HDRI files when available.
 * Falls back silently if the map cannot load (manual scene lights still apply).
 */
export function SafeEnvironment({ preset, files, ...rest }: SafeEnvironmentProps) {
  const localFile = preset ? resolveHdriPath(preset) : undefined;
  const resolvedFiles = files ?? localFile;

  if (!resolvedFiles) {
    return null;
  }

  return (
    <EnvironmentErrorBoundary>
      <Environment files={resolvedFiles} {...rest} />
    </EnvironmentErrorBoundary>
  );
}
