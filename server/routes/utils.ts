import type { Request } from "express";

export function getRequestUserId(req: Request): string | undefined {
  const claims = (req as any)?.user?.claims;
  if (claims && typeof claims.sub === "string" && claims.sub.length > 0) {
    return claims.sub;
  }
  return undefined;
}

export function getRequestRole(req: Request): string | undefined {
  const claims = (req as any)?.user?.claims;
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
  const role = getRequestRole(req);
  if (!role) {
    return false;
  }
  return allowedRoles.includes(role);
}
