"use client";

import { useEnhancedUser } from "@/contexts/EnhancedUserContext";
import {
  getPermissions,
  hasPermission,
  resolveAdminRole,
  ROLE_LABELS,
  type Permission,
} from "@/lib/power-admin/permissions";

export function useAdminPermissions() {
  const { user } = useEnhancedUser();
  const hubRole = resolveAdminRole(user ?? undefined);
  const permissions = getPermissions(user ?? undefined);
  const roleLabel = hubRole ? ROLE_LABELS[hubRole] : null;

  return {
    hubRole,
    roleLabel,
    permissions,
    can: (permission: Permission) => hasPermission(user ?? undefined, permission),
    isHubAdmin: user?.role === "admin",
  };
}
