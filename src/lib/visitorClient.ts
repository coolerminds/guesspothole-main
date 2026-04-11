export const VISITOR_COOKIE_NAME = "pothole_visitor_id";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export type VisitorEventType =
  | "visited"
  | "started_game"
  | "placed_guess_pin"
  | "submitted_guess";

export interface VisitorEventPayload {
  event: VisitorEventType;
  visitorId: string;
  potholeId: string;
  potholeDate: string;
  isPastPlay: boolean;
  score?: number;
  distanceMiles?: number;
  guessLat?: number;
  guessLng?: number;
}

function readCookie(name: string): string | null {
  const cookie = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${name}=`));

  if (!cookie) return null;

  return decodeURIComponent(cookie.split("=").slice(1).join("="));
}

function writeCookie(name: string, value: string) {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${ONE_YEAR_SECONDS}; SameSite=Lax${secure}`;
}

function createVisitorId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `visitor-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function getVisitorId(): string | null {
  return readCookie(VISITOR_COOKIE_NAME);
}

export function getOrCreateVisitorId(): string {
  const existing = getVisitorId();
  if (existing) return existing;

  const visitorId = createVisitorId();
  writeCookie(VISITOR_COOKIE_NAME, visitorId);
  return visitorId;
}

export async function trackVisitorEvent(payload: VisitorEventPayload) {
  await fetch("/api/visitor-events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    keepalive: true,
  });
}
