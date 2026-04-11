import { useContext, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import GameContext from "./GameContext";
import { LeaderboardEntry } from "@/data/potholes";
import { getFresnoDateString } from "@/lib/date";

function getOrdinalLabel(index: number) {
  const rank = index + 1;
  if (rank === 1) return "1st";
  if (rank === 2) return "2nd";
  if (rank === 3) return "3rd";
  return `${rank}th`;
}

export default function Leaderboard() {
  const { score, todaysPothole, isPastPlay } = useContext(GameContext);
  const [board, setBoard] = useState<LeaderboardEntry[]>([]);
  const [initials, setInitials] = useState(["", "", ""]);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [justSavedIdx, setJustSavedIdx] = useState<number | null>(null);
  const [saveError, setSaveError] = useState("");
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const potholeDate = todaysPothole.date;

  useEffect(() => {
    fetch(`/api/leaderboard?date=${potholeDate}`)
      .then((r) => r.json())
      .then((data) => {
        setBoard(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [potholeDate]);

  const qualifies =
    !isPastPlay &&
    score !== null &&
    (board.length < 10 || score > (board[9]?.score ?? 0));

  function handleInitialChange(idx: number, val: string) {
    const char = val.replace(/[^a-zA-Z]/g, "").toUpperCase().slice(-1);
    const next = [...initials];
    next[idx] = char;
    setInitials(next);
    if (char && idx < 2) {
      inputRefs[idx + 1].current?.focus();
    }
  }

  function handleKeyDown(idx: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !initials[idx] && idx > 0) {
      inputRefs[idx - 1].current?.focus();
    }
  }

  async function handleSave() {
    if (score === null || initials.some((c) => !c) || isPastPlay) return;

    setSaveError("");

    const entry = {
      potholeDate,
      initials: initials.join(""),
      score,
      date: getFresnoDateString(),
    };

    try {
      const res = await fetch("/api/leaderboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Unable to save your score right now.");
      }

      const updatedBoard = await res.json();
      setBoard(updatedBoard);
      const idx = updatedBoard.findIndex(
        (item: LeaderboardEntry) =>
          item.initials === entry.initials && item.score === entry.score
      );
      setJustSavedIdx(idx >= 0 ? idx : null);
      setSaved(true);
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : "Unable to save your score right now."
      );
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="leaderboard"
    >
      {qualifies && !saved && (
        <motion.div
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="leaderboard__entry"
        >
          <div className="leaderboard__entry-title">Leave your mark!</div>
          <div className="leaderboard__entry-label">
            You scored {score?.toLocaleString()}! Enter your initials
          </div>
          <div className="leaderboard__initials-row">
            {initials.map((ch, i) => (
              <input
                key={i}
                ref={inputRefs[i]}
                className="leaderboard__initial-input"
                type="text"
                maxLength={1}
                value={ch}
                onChange={(e) => handleInitialChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                autoFocus={i === 0}
              />
            ))}
          </div>
          <button
            className="leaderboard__submit-btn"
            onClick={handleSave}
            disabled={initials.some((c) => !c)}
          >
            Submit Score!
          </button>
        </motion.div>
      )}


      {saved && (
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="leaderboard__saved-msg"
        >
          Score submitted.
        </motion.div>
      )}

      {saveError && <div className="leaderboard__subscribe-error">{saveError}</div>}

      {isPastPlay && score !== null && (
        <div className="leaderboard__past-notice">
          You scored {score.toLocaleString()} on this past pothole. Past potholes
          do not change the daily rankings.
        </div>
      )}

      <div className="leaderboard__table">
        <div className="leaderboard__table-title">
          <i className="fa-solid fa-trophy"></i>
          <span>{isPastPlay ? "Past Leaders" : "Today's Leaders"}</span>
        </div>

        {loading ? (
          <div className="leaderboard__empty">Loading scores...</div>
        ) : board.length === 0 ? (
          <div className="leaderboard__empty">No scores yet for this pothole.</div>
        ) : (
          board.map((entry, i) => (
            <motion.div
              key={`${entry.initials}-${entry.score}-${i}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`leaderboard__row ${
                i < 3 ? "leaderboard__row--top" : ""
              } ${justSavedIdx === i ? "leaderboard__row--highlight" : ""}`}
            >
              <span className="leaderboard__rank">{getOrdinalLabel(i)}</span>
              <span className="leaderboard__name">{entry.initials}</span>
              <span className="leaderboard__score">
                {entry.score.toLocaleString()}
              </span>
            </motion.div>
          ))
        )}
      </div>

      {!isPastPlay && (
        <div className="leaderboard__comeback">
          Come back tomorrow for a new Guess The Pothole game!
        </div>
      )}
    </motion.div>
  );
}
