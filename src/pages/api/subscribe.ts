import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

const DB_PATH = path.join(process.cwd(), "db", "subscribers.json");

function ensureDb() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DB_PATH)) fs.writeFileSync(DB_PATH, "[]");
}

function readSubscribers(): string[] {
  ensureDb();
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
  } catch {
    return [];
  }
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email } = req.body;

  if (!email || typeof email !== "string" || !email.includes("@")) {
    return res.status(400).json({ error: "Valid email required." });
  }

  const subscribers = readSubscribers();

  if (subscribers.includes(email.toLowerCase())) {
    return res.status(200).json({ message: "Already subscribed!", alreadySubscribed: true });
  }

  subscribers.push(email.toLowerCase());
  fs.writeFileSync(DB_PATH, JSON.stringify(subscribers, null, 2));

  return res.status(200).json({ message: "Subscribed successfully!", alreadySubscribed: false });
}
