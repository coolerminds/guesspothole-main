import { useEffect, useState, useContext } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Pothole } from "@/data/potholes";
import GameContext from "./GameContext";

export default function PastPotholes() {
  const [pastPotholes, setPastPotholes] = useState<Pothole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/potholes")
      .then((r) => r.json())
      .then((data) => {
        setPastPotholes(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="past-potholes">
        <div className="past-potholes__loading">Loading past potholes...</div>
      </div>
    );
  }

  if (pastPotholes.length === 0) {
    return (
      <div className="past-potholes">
        <h3 className="past-potholes__title">
          <i className="fa-solid fa-scroll"></i> Past Quests
        </h3>
        <p className="past-potholes__empty">No past potholes yet. Come back tomorrow!</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="past-potholes"
    >
      <h3 className="past-potholes__title">
        <i className="fa-solid fa-scroll"></i> Past Quests
      </h3>
      <p className="past-potholes__desc">
        Missed a day? Play the potholes you missed.
      </p>
      <div className="past-potholes__grid">
        {pastPotholes.map((pothole, i) => (
          <motion.div
            key={pothole.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="past-potholes__card"
          >
            <div className="past-potholes__thumb">
              <Image
                src={pothole.image}
                alt={`Pothole ${pothole.id}`}
                fill
                sizes="56px"
                className="past-potholes__thumb-img"
              />
            </div>
            <div className="past-potholes__info">
              <span className="past-potholes__date">
                <i className="fa-solid fa-calendar"></i> {pothole.date}
              </span>
              {pothole.hint && (
                <span className="past-potholes__hint">{pothole.hint}</span>
              )}
            </div>
            <button
              className="past-potholes__play-btn"
              onClick={() => {
                // Store the selected pothole and start playing
                window.__pastPothole = pothole;
                window.dispatchEvent(new CustomEvent("play-past-pothole"));
              }}
            >
              <i className="fa-solid fa-play"></i> Play
            </button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// Type augmentation for window
declare global {
  interface Window {
    __pastPothole?: Pothole;
  }
}
