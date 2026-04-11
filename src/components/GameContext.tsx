import { createContext } from "react";
import { Pothole } from "@/data/potholes";

export type GamePhase = "INTRO" | "PLAYING" | "SCORED" | "LEADERBOARD";

export interface GameContextType {
  phase: GamePhase;
  setPhase: (phase: GamePhase) => void;
  todaysPothole: Pothole;
  guessPos: [number, number] | null;
  setGuessPos: (pos: [number, number] | null) => void;
  score: number | null;
  setScore: (score: number | null) => void;
  distance: number | null; // in miles
  setDistance: (dist: number | null) => void;
  handleGuess: () => void;
  restart: () => void;
  isPastPlay: boolean; // true when playing a past pothole (no ranking)
}

const GameContext = createContext<GameContextType>({} as GameContextType);
export default GameContext;