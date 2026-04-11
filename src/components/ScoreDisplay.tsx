import { useContext, useEffect, useState } from "react";
import { motion } from "framer-motion";
import GameContext from "./GameContext";

export default function ScoreDisplay() {
  const { score, distance, setPhase } = useContext(GameContext);
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    if (score === null) {
      setDisplayScore(0);
      return;
    }

    let start = 0;
    const duration = 1500;
    const stepTime = 16;
    const steps = duration / stepTime;
    const increment = score / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= score) {
        setDisplayScore(score);
        clearInterval(timer);
      } else {
        setDisplayScore(Math.round(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [score]);

  if (score === null || distance === null) return null;

  const distanceMiles = distance.toFixed(2);
  const rating =
    score >= 4500
      ? { label: "Incredible!", emoji: "🏆" }
      : score >= 3000
      ? { label: "Great Guess!", emoji: "🎯" }
      : score >= 1500
      ? { label: "Not Bad!", emoji: "👍" }
      : { label: "Woah buddy!", emoji: "😬" };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.26 }}
      className="score-display"
    >
      <motion.div
        className="score-display__emoji"
        initial={{ scale: 0.88 }}
        animate={{ scale: 1 }}
      >
        {rating.emoji}
      </motion.div>
      <div className="score-display__label">{rating.label}</div>
      <div className="score-display__score">
        {displayScore.toLocaleString()}
        <span className="score-display__max">/5,000</span>
      </div>
      <div className="score-display__distance">{distanceMiles} Miles Away</div>
      <button
        type="button"
        className="score-display__cta"
        onClick={() => setPhase("LEADERBOARD")}
      >
        Submit Your Score To Leaderboard!
      </button>
    </motion.div>
  );
}
