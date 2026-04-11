import { getFresnoDateString, getFresnoDayOfYear } from "@/lib/date";

export interface Pothole {
  id: string;
  image: string;
  lat: number;
  lng: number;
  hint?: string;
  date: string; // YYYY-MM-DD — the day this pothole is featured
}

// Fresno, CA pothole locations (hardcoded with random Fresno-area coordinates)
// Fresno roughly spans: lat 36.68–36.86, lng -119.88–-119.68
export const potholes: Pothole[] = [
  {
    id: "pot1",
    image: "/potholes/pot1.png",
    lat: 36.7352,
    lng: -119.7861,
    hint: "Near Tower District",
    date: "2026-03-18",
  },
  {
    id: "pot2",
    image: "/potholes/pot2.jpg",
    lat: 36.8089,
    lng: -119.7193,
    hint: "North Fresno area",
    date: "2026-03-19",
  },
  {
    id: "pot3",
    image: "/potholes/pot3.png",
    lat: 36.7621,
    lng: -119.8234,
    hint: "West of Highway 99",
    date: "2026-03-20",
  },
  {
    id: "pot4",
    image: "/potholes/pot4.jpg",
    lat: 36.6943,
    lng: -119.7512,
    hint: "South Fresno",
    date: "2026-03-21",
  },
  {
    id: "pot5",
    image: "/potholes/pot5.png",
    lat: 36.7834,
    lng: -119.6897,
    hint: "Near Woodward Park",
    date: "2026-03-22",
  },
  {
    id: "pot6",
    image: "/potholes/pot2.jpg",
    lat: 36.7498,
    lng: -119.7715,
    hint: "Downtown area",
    date: "2026-03-23",
  },
  {
    id: "pot7",
    image: "/potholes/pot3.png",
    lat: 36.8312,
    lng: -119.7621,
    hint: "Near Fresno State",
    date: "2026-03-24",
  },
  {
    id: "pot8",
    image: "/potholes/pot4.jpg",
    lat: 36.7189,
    lng: -119.8103,
    hint: "Near Roeding Park",
    date: "2026-03-25",
  },
  {
    id: "pot9",
    image: "/potholes/pot5.png",
    lat: 36.7741,
    lng: -119.7342,
    hint: "East of Highway 41",
    date: "2026-03-26",
  },
  {
    id: "pot10",
    image: "/potholes/pot2.jpg",
    lat: 36.8456,
    lng: -119.7198,
    hint: "Copper River area",
    date: "2026-03-27",
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
