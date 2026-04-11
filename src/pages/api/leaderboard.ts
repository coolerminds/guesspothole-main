import type { NextApiRequest, NextApiResponse } from "next";
import { getFresnoDateString } from "@/lib/date";
import { readLeaderboard, writeLeaderboard } from "@/lib/db";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // GET /api/leaderboard?date=2026-03-18
  if (req.method === "GET") {
    const potholeDate = (req.query.date as string) || getFresnoDateString();
    const board = readLeaderboard(potholeDate);
    return res.status(200).json(board);
  }

  // POST /api/leaderboard  { potholeDate, initials, score, date }
  if (req.method === "POST") {
    const { potholeDate, initials, score, date } = req.body;

    if (
      !potholeDate ||
      !initials ||
      typeof initials !== "string" ||
      initials.length !== 3 ||
      typeof score !== "number" ||
      !date
    ) {
      return res.status(400).json({
        error: "Need: potholeDate, initials (3 chars), score (number), date.",
      });
    }

    const board = writeLeaderboard(potholeDate, {
      initials: initials.toUpperCase(),
      score,
      date,
    });

    return res.status(200).json(board);
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).json({ error: "Method not allowed" });
}
