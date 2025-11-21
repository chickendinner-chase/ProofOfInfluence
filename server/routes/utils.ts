import type { Request } from "express";

export function getRequestUserId(req: Request): string | undefined {
  const claims = (req as any)?.user?.claims;
  if (claims && typeof claims.sub === "string" && claims.sub.length > 0) {
    return claims.sub;
  }
  return undefined;
}

export function getRequestRole(req: Request): string | undefined {
  // First check req.user.role (set by auth middleware)
  const user = (req as any)?.user;
  if (user) {
    if (typeof user.role === "string" && user.role.length > 0) {
      return user.role;
    }
  }

  // Then check claims.role (fallback)
  const claims = user?.claims;
  if (claims) {
    if (typeof claims.role === "string" && claims.role.length > 0) {
      return claims.role;
    }
    if (Array.isArray(claims.roles) && claims.roles.length > 0) {
      const firstRole = claims.roles.find((value: unknown) => typeof value === "string");
      if (typeof firstRole === "string") {
        return firstRole;
      }
    }
  }

  // Finally check header (for testing)
  const headerRole = req.headers["x-user-role"];
  if (Array.isArray(headerRole)) {
    return headerRole[0];
  }
  if (typeof headerRole === "string") {
    return headerRole;
  }
  return undefined;
}

export function hasRequiredRole(req: Request, allowedRoles: string[]): boolean {
  // DEV MODE: Grant access to all authenticated users if enabled
  // IMPORTANT: Only works when NODE_ENV is explicitly 'development' for security
  const isDevelopment = process.env.NODE_ENV === 'development';
  const devModeAdmin = process.env.DEV_MODE_ADMIN === 'true';
  
  if (isDevelopment && devModeAdmin && (req as any).isAuthenticated?.()) {
    return true; // Skip permission check in dev mode
  }
  
  // Normal role checking logic
  const role = getRequestRole(req);
  if (!role) {
    return false;
  }
  return allowedRoles.includes(role);
}
