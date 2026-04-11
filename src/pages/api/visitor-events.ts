import type { NextApiRequest, NextApiResponse } from "next";
import { isTrackableEvent, getRequestIp, writeVisitorEvent } from "@/lib/visitorTracking";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  const {
    event,
    visitorId,
    potholeId,
    potholeDate,
    isPastPlay,
    score,
    distanceMiles,
    guessLat,
    guessLng,
  } = req.body ?? {};

  if (
    !isTrackableEvent(event) ||
    typeof visitorId !== "string" ||
    !visitorId.trim() ||
    typeof potholeId !== "string" ||
    !potholeId.trim() ||
    typeof potholeDate !== "string" ||
    !potholeDate.trim() ||
    typeof isPastPlay !== "boolean"
  ) {
    return res.status(400).json({ error: "Invalid visitor tracking payload." });
  }

  const ip = getRequestIp(req);
  const userAgent = req.headers["user-agent"] || "unknown";
  const record = writeVisitorEvent(
    {
      event,
      visitorId,
      potholeId,
      potholeDate,
      isPastPlay,
      score: typeof score === "number" ? score : undefined,
      distanceMiles: typeof distanceMiles === "number" ? distanceMiles : undefined,
      guessLat: typeof guessLat === "number" ? guessLat : undefined,
      guessLng: typeof guessLng === "number" ? guessLng : undefined,
    },
    ip,
    userAgent
  );

  return res.status(200).json({ ok: true, visitorId: record.visitorId });
}
