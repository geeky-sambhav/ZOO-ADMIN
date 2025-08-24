/**
 * Cookie utility functions for token management
 */

export const getCookie = (name: string): string | null => {
  if (typeof document === "undefined") {
    return null; // Server-side rendering
  }

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(";").shift() || null;
  }
  return null;
};

export const setCookie = (
  name: string,
  value: string,
  options: {
    expires?: Date;
    maxAge?: number;
    path?: string;
    domain?: string;
    secure?: boolean;
    httpOnly?: boolean;
    sameSite?: "strict" | "lax" | "none";
  } = {}
): void => {
  if (typeof document === "undefined") {
    return; // Server-side rendering
  }

  const {
    expires,
    maxAge,
    path = "/",
    domain,
    secure = true,
    sameSite = "lax",
  } = options;

  let cookieString = `${name}=${value}`;

  if (expires) {
    cookieString += `; expires=${expires.toUTCString()}`;
  }

  if (maxAge) {
    cookieString += `; max-age=${maxAge}`;
  }

  cookieString += `; path=${path}`;

  if (domain) {
    cookieString += `; domain=${domain}`;
  }

  if (secure) {
    cookieString += `; secure`;
  }

  cookieString += `; samesite=${sameSite}`;

  document.cookie = cookieString;
};

export const deleteCookie = (name: string, path: string = "/"): void => {
  if (typeof document === "undefined") {
    return; // Server-side rendering
  }

  setCookie(name, "", {
    expires: new Date(0),
    path,
  });
};

// Note: Authentication cookies are now managed by the backend
// These utility functions remain available for other client-side cookie needs
