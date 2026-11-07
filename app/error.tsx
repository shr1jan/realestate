"use client";
export default function ErrorPage({ reset }: { reset: () => void }) { return <main id="main" className="error-page page-width"><h1>A little pause in your search.</h1><p>We couldn’t load this page. Please try again in a moment.</p><button className="button button-primary" onClick={reset}>Try again</button></main>; }
