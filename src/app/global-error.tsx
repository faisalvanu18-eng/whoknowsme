"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", background: "#F4F1FF", color: "#1C1838", display: "grid", placeItems: "center", minHeight: "100vh", margin: 0 }}>
        <div style={{ textAlign: "center", padding: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800 }}>Something went wrong</h1>
          <p>Please try again in a moment.</p>
          <button
            type="button"
            onClick={reset}
            style={{ marginTop: 16, height: 48, padding: "0 24px", borderRadius: 16, border: 0, background: "#7047EB", color: "#fff", fontWeight: 700 }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
