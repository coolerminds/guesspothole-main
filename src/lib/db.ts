import fs from "fs";
import path from "path";
import { LeaderboardEntry } from "@/data/potholes";

const DB_PATH = path.join(process.cwd(), "db", "leaderboard.json");

// Shape: { "2026-03-18": LeaderboardEntry[], "2026-03-19": [...], ... }
type LeaderboardDB = Record<string, LeaderboardEntry[]>;

function ensureDb() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DB_PATH)) fs.writeFileSync(DB_PATH, "{}");
}

function readAll(): LeaderboardDB {
  ensureDb();
  try {
    const raw = fs.readFileSync(DB_PATH, "utf-8");
    return JSON.parse(raw) as LeaderboardDB;
  } catch {
    return {};
  }
}

function writeAll(db: LeaderboardDB) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

// Get leaderboard for a specific pothole date
export function readLeaderboard(potholeDate: string): LeaderboardEntry[] {
  const db = readAll();
  const board = db[potholeDate] || [];
  return board.sort((a, b) => b.score - a.score).slice(0, 10);
}

// Add entry to a specific pothole date's leaderboard
export function writeLeaderboard(
  potholeDate: string,
  entry: LeaderboardEntry
): LeaderboardEntry[] {
  const db = readAll();
  if (!db[potholeDate]) db[potholeDate] = [];
  db[potholeDate].push(entry);
  db[potholeDate].sort((a, b) => b.score - a.score);
  db[potholeDate] = db[potholeDate].slice(0, 10);
  writeAll(db);
  return db[potholeDate];
}

export function qualifiesForBoard(
  potholeDate: string,
  score: number
): boolean {
  const board = readLeaderboard(potholeDate);
  if (board.length < 10) return true;
  return score > board[board.length - 1].score;
}
