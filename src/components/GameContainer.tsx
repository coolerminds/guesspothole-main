import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import dynamic from "next/dynamic";
import Image from "next/image";
import GameContext, { GamePhase } from "./GameContext";
import {
  Pothole,
  getDailyPothole,
  getDistanceMiles,
  calculateScore,
} from "@/data/potholes";
import { getOrCreateVisitorId, trackVisitorEvent } from "@/lib/visitorClient";
import PotholeViewer from "./PotholeViewer";
import ScoreDisplay from "./ScoreDisplay";
import Leaderboard from "./Leaderboard";

const FresnoMap = dynamic(() => import("./FresnoMap"), { ssr: false });
const PANEL_COPY = [
  "You'll be shown a photo of a real pothole in Fresno County. Choose and click a location on the map where you think the pothole is at.",
  "The closer your guess, the higher your score. Every 24 hours there will be a new pothole to find.",
];

export default function GameContainer() {
  const [phase, setPhase] = useState<GamePhase>("INTRO");
  const [guessPos, setGuessPos] = useState<[number, number] | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [activePothole, setActivePothole] = useState<Pothole | null>(null);
  const visitorIdRef = useRef<string | null>(null);
  const startedKeysRef = useRef<Set<string>>(new Set());
  const placedGuessKeysRef = useRef<Set<string>>(new Set());
  const submittedKeysRef = useRef<Set<string>>(new Set());

  const dailyPothole = useMemo(() => getDailyPothole(), []);
  const todaysPothole = activePothole || dailyPothole;
  const isPastPlay = activePothole !== null;
  const potholeTrackingKey = `${todaysPothole.id}:${todaysPothole.date}:${
    isPastPlay ? "past" : "daily"
  }`;
  const showGameStage = phase === "INTRO" || phase === "PLAYING";

  const handlePlayPast = useCallback(() => {
    if (window.__pastPothole) {
      setActivePothole(window.__pastPothole);
      setGuessPos(null);
      setScore(null);
      setDistance(null);
      setPhase("PLAYING");
      window.__pastPothole = undefined;
    }
  }, []);

  useEffect(() => {
    window.addEventListener("play-past-pothole", handlePlayPast);
    return () =>
      window.removeEventListener("play-past-pothole", handlePlayPast);
  }, [handlePlayPast]);

  useEffect(() => {
    visitorIdRef.current = getOrCreateVisitorId();

    void trackVisitorEvent({
      event: "visited",
      visitorId: visitorIdRef.current,
      potholeId: todaysPothole.id,
      potholeDate: todaysPothole.date,
      isPastPlay,
    });
  }, [todaysPothole.id, todaysPothole.date, isPastPlay]);

  useEffect(() => {
    if (phase !== "PLAYING" || startedKeysRef.current.has(potholeTrackingKey)) {
      return;
    }

    const visitorId = visitorIdRef.current || getOrCreateVisitorId();
    visitorIdRef.current = visitorId;
    startedKeysRef.current.add(potholeTrackingKey);

    void trackVisitorEvent({
      event: "started_game",
      visitorId,
      potholeId: todaysPothole.id,
      potholeDate: todaysPothole.date,
      isPastPlay,
    });
  }, [phase, potholeTrackingKey, todaysPothole.id, todaysPothole.date, isPastPlay]);

  useEffect(() => {
    if (!guessPos || placedGuessKeysRef.current.has(potholeTrackingKey)) {
      return;
    }

    const visitorId = visitorIdRef.current || getOrCreateVisitorId();
    visitorIdRef.current = visitorId;
    placedGuessKeysRef.current.add(potholeTrackingKey);

    void trackVisitorEvent({
      event: "placed_guess_pin",
      visitorId,
      potholeId: todaysPothole.id,
      potholeDate: todaysPothole.date,
      isPastPlay,
      guessLat: guessPos[0],
      guessLng: guessPos[1],
    });
  }, [guessPos, potholeTrackingKey, todaysPothole.id, todaysPothole.date, isPastPlay]);

  useEffect(() => {
    if (
      phase !== "SCORED" ||
      score === null ||
      distance === null ||
      submittedKeysRef.current.has(potholeTrackingKey)
    ) {
      return;
    }

    const visitorId = visitorIdRef.current || getOrCreateVisitorId();
    visitorIdRef.current = visitorId;
    submittedKeysRef.current.add(potholeTrackingKey);

    void trackVisitorEvent({
      event: "submitted_guess",
      visitorId,
      potholeId: todaysPothole.id,
      potholeDate: todaysPothole.date,
      isPastPlay,
      score,
      distanceMiles: distance,
      guessLat: guessPos?.[0],
      guessLng: guessPos?.[1],
    });
  }, [
    phase,
    score,
    distance,
    guessPos,
    potholeTrackingKey,
    todaysPothole.id,
    todaysPothole.date,
    isPastPlay,
  ]);

  function handleGuess() {
    if (!guessPos) return;

    const dist = getDistanceMiles(
      guessPos[0],
      guessPos[1],
      todaysPothole.lat,
      todaysPothole.lng
    );
    const pts = calculateScore(dist);

    setDistance(dist);
    setScore(pts);
    setPhase("SCORED");
  }

  function goToLeaderboard() {
    setPhase("LEADERBOARD");
  }

  function restart() {
    setActivePothole(null);
    setGuessPos(null);
    setScore(null);
    setDistance(null);
    setPhase("INTRO");
  }

  const contextValue = {
    phase,
    setPhase,
    todaysPothole,
    guessPos,
    setGuessPos,
    score,
    setScore,
    distance,
    setDistance,
    handleGuess,
    restart,
    isPastPlay,
  };

  return (
    <GameContext.Provider value={contextValue}>
      <main className="app-shell">
        <AnimatePresence mode="wait">
          {showGameStage && (
            <motion.section
              key="play"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.24 }}
              className="app-shell__stage"
            >
              <div className="app-card app-card--play">
                <Image
                  src="/brand/brss-color-light.svg"
                  alt="Better Roads. Safe Streets."
                  className="app-card__brandmark"
                  width={220}
                  height={72}
                />
                <h1 className="app-card__title">Guess The Pothole!</h1>
                <div className="app-card__copy">
                  {PANEL_COPY.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
                {isPastPlay && (
                  <div className="app-card__note">
                    Past pothole · {todaysPothole.date}
                  </div>
                )}
                <PotholeViewer />
                <FresnoMap />
                <button
                  type="button"
                  onClick={goToLeaderboard}
                  className="app-card__text-link"
                >
                  View Leaderboard
                </button>
              </div>
            </motion.section>
          )}

          {phase === "SCORED" && (
            <motion.section
              key="scored"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.24 }}
              className="app-shell__stage"
            >
              <div className="app-card app-card--score">
                <Image
                  src="/brand/brss-color-light.svg"
                  alt="Better Roads. Safe Streets."
                  className="app-card__brandmark"
                  width={220}
                  height={72}
                />
                <h1 className="app-card__title">Guess The Pothole</h1>
                <div className="app-card__copy">
                  <p>Thanks for Playing!</p>
                </div>
                <ScoreDisplay />
                <FresnoMap />
                <button
                  type="button"
                  onClick={goToLeaderboard}
                  className="app-card__text-link"
                >
                  View Leaderboard
                </button>
              </div>
            </motion.section>
          )}

          {phase === "LEADERBOARD" && (
            <motion.section
              key="leaderboard"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.24 }}
              className="app-shell__stage"
            >
              <div className="app-card app-card--leaderboard">
                <Image
                  src="/brand/brss-color-light.svg"
                  alt="Better Roads. Safe Streets."
                  className="app-card__brandmark"
                  width={220}
                  height={72}
                />
                <h1 className="app-card__title">Guess The Pothole</h1>
                <Leaderboard />
                <button
                  type="button"
                  onClick={restart}
                  className="app-card__text-link"
                >
                  Back To Game
                </button>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>
    </GameContext.Provider>
  );
}
