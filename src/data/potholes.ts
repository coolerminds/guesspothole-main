import { getFresnoDateString, getFresnoDayOfYear } from "@/lib/date";

export interface Pothole {
  id: string;
  image: string;
  lat: number;
  lng: number;
  hint?: string;
  date: string; // YYYY-MM-DD — the day this pothole is featured
}

// Fresno-area pothole locations sourced from the provided BRSS challenge sheet.
// The source publish dates were TBD, so these are scheduled sequentially through
// April 15, 2026 to keep one active daily challenge and seven immediately
// available past potholes.
export const potholes: Pothole[] = [
  {
    id: "pot1",
    image: "/potholes/fig-garden-near-santafe.jpg",
    lat: 36.829444,
    lng: -119.866806,
    hint: "On Fig Garden Loop",
    date: "2026-04-08",
  },
  {
    id: "pot2",
    image: "/potholes/first-and-ashlan.jpg",
    lat: 36.7943366467119,
    lng: -119.77223548832579,
    hint: "Near Fresno Ag Hardware",
    date: "2026-04-09",
  },
  {
    id: "pot3",
    image: "/potholes/first-and-lamona.jpg",
    lat: 36.760435,
    lng: -119.772273,
    hint: "Near Romain Park",
    date: "2026-04-10",
  },
  {
    id: "pot4",
    image: "/potholes/golden-state-near-herndon.jpg",
    lat: 36.835627,
    lng: -119.91927,
    hint: "Parallel to Highway 99",
    date: "2026-04-11",
  },
  {
    id: "pot5",
    image: "/potholes/minarets-and-ingram.jpg",
    lat: 36.842648,
    lng: -119.801657,
    hint: "Near Porsche Fresno",
    date: "2026-04-12",
  },
  {
    id: "pot6",
    image: "/potholes/minarets-and-san-pablo.jpg",
    lat: 36.842661,
    lng: -119.794709,
    hint: "Near Pinedale Elementary",
    date: "2026-04-13",
  },
  {
    id: "pot7",
    image: "/potholes/stanislaus-and-o-street.jpg",
    lat: 36.742827,
    lng: -119.790468,
    hint: "Near Dicky Playground",
    date: "2026-04-14",
  },
  {
    id: "pot8",
    image: "/potholes/van-ness-courthouse.jpg",
    lat: 36.735877,
    lng: -119.790356,
    hint: "Near Fresno County Superior Court",
    date: "2026-04-15",
  },
];

// Get today's daily pothole
export function getDailyPothole(): Pothole {
  const today = getFresnoDateString();
  // Try to find a pothole scheduled for today
  const scheduled = potholes.find((p) => p.date === today);
  if (scheduled) return scheduled;
  // Fallback: cycle through Fresno's day-of-year so the daily roll-over matches Fresno time.
  const dayOfYear = getFresnoDayOfYear();
  return potholes[(dayOfYear - 1) % potholes.length];
}

// Get past potholes (dates before today)
export function getPastPotholes(): Pothole[] {
  const today = getFresnoDateString();
  return potholes.filter((p) => p.date < today);
}

// Haversine distance in MILES between two lat/lng points
export function getDistanceMiles(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 3958.8; // Earth radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Score: 5000 for perfect, 0 for >= MAX_DISTANCE_MILES away
const MAX_DISTANCE_MILES = 10; // roughly the radius of Fresno
export function calculateScore(distanceMiles: number): number {
  return Math.round(5000 * Math.max(0, 1 - distanceMiles / MAX_DISTANCE_MILES));
}

// Leaderboard helpers
export interface LeaderboardEntry {
  initials: string;
  score: number;
  date: string;
}

const LEADERBOARD_KEY = "pothole-leaderboard";

export function getLeaderboard(): LeaderboardEntry[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(LEADERBOARD_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as LeaderboardEntry[];
  } catch {
    return [];
  }
}

export function saveToLeaderboard(entry: LeaderboardEntry): LeaderboardEntry[] {
  const board = getLeaderboard();
  board.push(entry);
  board.sort((a, b) => b.score - a.score);
  const trimmed = board.slice(0, 10);
  localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(trimmed));
  return trimmed;
}

export function qualifiesForLeaderboard(score: number): boolean {
  const board = getLeaderboard();
  if (board.length < 10) return true;
  return score > board[board.length - 1].score;
}
