import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import type { GetServerSideProps } from "next";
import {
  getPublicVisitorHistory,
  PublicVisitorHistory,
} from "@/lib/visitorTracking";

interface HistoryPageProps {
  history: PublicVisitorHistory;
  shareUrl: string;
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function HistoryPage({ history, shareUrl }: HistoryPageProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <>
      <Head>
        <title>My Pothole History</title>
      </Head>
      <main className="history-page">
        <section className="history-card history-card--wide">
          <div className="history-card__badge">
            <i className="fa-solid fa-link"></i>
            <span>Bookmark This Page</span>
          </div>
          <h1 className="history-card__title">Your Pothole History</h1>
          <p className="history-card__desc">
            This URL is your lightweight history key. Bookmark it, save it, or
            turn it into a QR code later if you want cross-device access.
          </p>

          <div className="history-summary">
            <div className="history-summary__item">
              <span className="history-summary__label">Total Guesses</span>
              <strong className="history-summary__value">{history.guessCount}</strong>
            </div>
            <div className="history-summary__item">
              <span className="history-summary__label">First Seen</span>
              <strong className="history-summary__value">
                {formatDateTime(history.firstVisitedAt)}
              </strong>
            </div>
            <div className="history-summary__item">
              <span className="history-summary__label">Latest Activity</span>
              <strong className="history-summary__value">
                {formatDateTime(history.lastVisitedAt)}
              </strong>
            </div>
          </div>

          <div className="history-share">
            <input
              className="history-share__input"
              value={shareUrl}
              readOnly
              aria-label="Your history URL"
            />
            <button className="history-share__button" onClick={handleCopy}>
              {copied ? "Copied" : "Copy Link"}
            </button>
          </div>

          <div className="history-card__actions">
            <Link href="/" className="history-card__primary">
              Back To Game
            </Link>
          </div>

          {history.entries.length === 0 ? (
            <div className="history-empty">
              You have not submitted any pothole guesses yet.
            </div>
          ) : (
            <div className="history-list">
              {history.entries.map((entry) => (
                <article
                  key={`${entry.at}-${entry.potholeId}`}
                  className="history-entry"
                >
                  <div className="history-entry__topline">
                    <span className="history-entry__date">
                      Pothole for {entry.potholeDate}
                    </span>
                    <span className="history-entry__played-at">
                      Played {formatDateTime(entry.at)}
                    </span>
                  </div>
                  <div className="history-entry__stats">
                    <span className="history-entry__stat">
                      Score:{" "}
                      <strong>
                        {entry.score !== null ? entry.score.toLocaleString() : "N/A"}
                      </strong>
                    </span>
                    <span className="history-entry__stat">
                      Distance:{" "}
                      <strong>
                        {entry.distanceMiles !== null
                          ? `${entry.distanceMiles.toFixed(2)} miles`
                          : "N/A"}
                      </strong>
                    </span>
                    <span className="history-entry__stat">
                      Mode: <strong>{entry.isPastPlay ? "Past pothole" : "Daily pothole"}</strong>
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<HistoryPageProps> = async ({
  params,
  req,
}) => {
  const visitorId = typeof params?.visitorId === "string" ? params.visitorId : "";
  const history = getPublicVisitorHistory(visitorId);

  if (!history) {
    return { notFound: true };
  }

  const protocol =
    (req.headers["x-forwarded-proto"] as string | undefined)?.split(",")[0] ||
    "http";
  const host = req.headers.host || "localhost:3000";

  return {
    props: {
      history,
      shareUrl: `${protocol}://${host}/history/${encodeURIComponent(visitorId)}`,
    },
  };
};
