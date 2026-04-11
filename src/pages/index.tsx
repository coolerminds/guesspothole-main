import GameContainer from "@/components/GameContainer";
import Head from "next/head";

export default function Home() {
  return (
    <>
      <Head>
        <title>Guess That Pothole! - Fresno, CA</title>
        <meta
          name="description"
          content="Guess where Fresno's potholes are! A daily guessing game inspired by The Price Is Right."
        />

        {/* Open Graph (Facebook, iMessage, Slack, Discord, etc.) */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Guess The Pothole! – Daily Guessing Game" />
        <meta
          property="og:description"
          content="Can you guess where Fresno's worst potholes are? Play the daily guessing game — Better Roads. Safe Streets."
        />
        <meta property="og:image" content="http://147.182.248.128/og-image.jpeg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:url" content="http://147.182.248.128" />
        <meta property="og:site_name" content="Guess The Pothole!" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Guess The Pothole! – Daily Guessing Game" />
        <meta
          name="twitter:description"
          content="Can you guess where Fresno's worst potholes are? Play the daily guessing game — Better Roads. Safe Streets."
        />
        <meta name="twitter:image" content="http://147.182.248.128/og-image.jpeg" />
      </Head>
      <GameContainer />
    </>
  );
}
