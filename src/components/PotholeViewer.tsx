import { useContext } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import GameContext from "./GameContext";

export default function PotholeViewer() {
  const { todaysPothole } = useContext(GameContext);

  return (
    <motion.figure
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className="pothole-viewer"
    >
      <div className="pothole-viewer__frame">
        <Image
          src={todaysPothole.image}
          alt={`Pothole ${todaysPothole.id}`}
          fill
          sizes="(max-width: 768px) calc(100vw - 72px), 560px"
          className="pothole-viewer__img"
          priority
        />
      </div>
      {todaysPothole.hint && (
        <motion.figcaption
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="pothole-viewer__hint"
        >
          <i className="fa-solid fa-lightbulb"></i>
          Hint: {todaysPothole.hint}
        </motion.figcaption>
      )}
    </motion.figure>
  );
}
