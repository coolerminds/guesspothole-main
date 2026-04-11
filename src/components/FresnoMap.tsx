import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { Icon, LatLngBounds, LatLngExpression } from "leaflet";
import { useContext, useEffect, useState } from "react";
import { motion } from "framer-motion";
import GameContext from "./GameContext";

const FRESNO_CENTER: LatLngExpression = [36.7378, -119.7871];
const FRESNO_ZOOM = 12;

const guessIcon = new Icon({
  iconUrl: "/brand/cone.svg",
  iconSize: [34, 34],
  iconAnchor: [17, 31],
});

const answerIcon = new Icon({
  iconUrl:
    "data:image/svg+xml," +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><circle cx="12" cy="12" r="8" fill="%230e3a59"/><circle cx="12" cy="12" r="3" fill="%23ffffff"/></svg>'
    ),
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

function MapClickHandler() {
  const { phase, setGuessPos, setPhase } = useContext(GameContext);

  useMapEvents({
    click(e) {
      if (phase !== "INTRO" && phase !== "PLAYING") return;

      setGuessPos([e.latlng.lat, e.latlng.lng]);
      if (phase === "INTRO") {
        setPhase("PLAYING");
      }
    },
  });

  return null;
}

function FitBounds({
  guessPos,
  answerPos,
  active,
}: {
  guessPos: [number, number] | null;
  answerPos: LatLngExpression;
  active: boolean;
}) {
  const map = useMap();

  useEffect(() => {
    if (!active || !guessPos) return;

    const bounds = new LatLngBounds(
      [guessPos[0], guessPos[1]],
      answerPos as [number, number]
    );
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 15 });
  }, [active, guessPos, answerPos, map]);

  return null;
}

export default function FresnoMap() {
  const { phase, guessPos, todaysPothole, handleGuess } = useContext(GameContext);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    if (phase === "SCORED") {
      const timer = setTimeout(() => setShowAnswer(true), 300);
      return () => clearTimeout(timer);
    }

    setShowAnswer(false);
    return undefined;
  }, [phase]);

  const answerPos: LatLngExpression = [todaysPothole.lat, todaysPothole.lng];
  const isInteracting = guessPos !== null || phase === "SCORED";
  const showGuessButton = phase === "INTRO" || phase === "PLAYING";
  const isReadyToSubmit = phase === "PLAYING" && guessPos !== null;

  return (
    <div className={`fresno-map ${isInteracting ? "fresno-map--active" : ""}`}>
      <div className="fresno-map__container">
        <MapContainer
          center={FRESNO_CENTER}
          zoom={FRESNO_ZOOM}
          minZoom={10}
          maxZoom={18}
          scrollWheelZoom={true}
          doubleClickZoom={false}
          attributionControl={false}
          className="fresno-map__leaflet"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          <MapClickHandler />
          <FitBounds guessPos={guessPos} answerPos={answerPos} active={showAnswer} />

          {guessPos && (
            <Marker
              position={guessPos as LatLngExpression}
              icon={guessIcon}
            />
          )}

          {showAnswer && (
            <>
              <Marker position={answerPos} icon={answerIcon} />
              {guessPos && (
                <Polyline
                  positions={[guessPos as LatLngExpression, answerPos]}
                  pathOptions={{
                    color: "#0e3a59",
                    weight: 2,
                    dashArray: "5 7",
                  }}
                />
              )}
            </>
          )}
        </MapContainer>
      </div>

      {showGuessButton && (
        <div className="fresno-map__guess-wrapper">
          <motion.button
            whileHover={isReadyToSubmit ? { scale: 1.02 } : undefined}
            whileTap={isReadyToSubmit ? { scale: 0.98 } : undefined}
            onClick={handleGuess}
            disabled={!isReadyToSubmit}
            className={`fresno-map__guess-btn ${
              isReadyToSubmit ? "fresno-map__guess-btn--active" : ""
            }`}
          >
            <i className="fa-solid fa-crosshairs"></i>
            {isReadyToSubmit ? "Lock In Guess!" : "Click Map To Guess"}
          </motion.button>
        </div>
      )}
    </div>
  );
}
