import Head from "next/head";
import Link from "next/link";
import type { GetServerSideProps } from "next";
import { VISITOR_COOKIE_NAME } from "@/lib/visitorClient";
import { readCookieValue } from "@/lib/visitorTracking";

interface HistoryIndexProps {
  hasHistoryCookie: boolean;
}

export default function HistoryIndex({ hasHistoryCookie }: HistoryIndexProps) {
  return (
    <>
      <Head>
        <title>My Pothole History</title>
      </Head>
      <main className="history-page">
        <section className="history-card">
          <div className="history-card__badge">
            <i className="fa-solid fa-bookmark"></i>
            <span>History Link</span>
          </div>
          <h1 className="history-card__title">Pothole History</h1>
          <p className="history-card__desc">
            {hasHistoryCookie
              ? "Your browser already has a saved history key. Reload this page and you should be redirected to your bookmarkable history URL."
              : "This browser does not have a saved history key yet. Play a round first, then come back here to get your bookmarkable history link."}
          </p>
          <div className="history-card__actions">
            <Link href="/" className="history-card__primary">
              Back To Game
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<HistoryIndexProps> = async ({
  req,
}) => {
  const visitorId = readCookieValue(req.headers.cookie, VISITOR_COOKIE_NAME);

  if (visitorId) {
    return {
      redirect: {
        destination: `/history/${encodeURIComponent(visitorId)}`,
        permanent: false,
      },
    };
  }

  return {
    props: {
      hasHistoryCookie: false,
    },
  };
};
