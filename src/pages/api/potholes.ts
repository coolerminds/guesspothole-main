import type { NextApiRequest, NextApiResponse } from "next";
import { potholes } from "@/data/potholes";
import { getFresnoDateString } from "@/lib/date";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  const today = getFresnoDateString();

  // Return potholes with dates before today (already played)
  const past = potholes
    .filter((p) => p.date < today)
    .sort((a, b) => (b.date > a.date ? 1 : -1)); // newest first

  return res.status(200).json(past);
}
