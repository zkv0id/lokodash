export const OG_SIZE = {
  width: 1200,
  height: 630,
};

export const OG_ALT =
  "Data Pantauan Roda Lokomotif CC205 - Depo Lokomotif Kampung Durian Runtuh";

export function OgImage() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#070b14",
        color: "#e2e8f0",
        padding: 64,
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              display: "flex",
              fontSize: 46,
              fontWeight: 900,
              fontStyle: "italic",
              letterSpacing: -3,
              color: "#38bdf8",
            }}
          >
            KAI
          </div>
          <div
            style={{
              display: "flex",
              width: 10,
              height: 42,
              borderRadius: 4,
              background: "#f59e0b",
              transform: "skewX(-12deg)",
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
          }}
        >
          <div style={{ display: "flex", fontSize: 30, fontWeight: 700 }}>
            Danantara
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 14,
              letterSpacing: 5,
              color: "#64748b",
            }}
          >
            INDONESIA
          </div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 56 }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 18,
              letterSpacing: 6,
              color: "#38bdf8",
              marginBottom: 18,
            }}
          >
            DATA PANTAUAN RODA LOKOMOTIF
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 72,
              fontWeight: 800,
              letterSpacing: -2,
              lineHeight: 1.05,
            }}
          >
            CC205 Wheel Watch
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 20,
              fontSize: 28,
              color: "#94a3b8",
            }}
          >
            Depo Lokomotif Kampung Durian Runtuh
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 20,
              letterSpacing: 3,
              color: "#64748b",
              marginTop: 8,
            }}
          >
            DIVISI REGIONAL IV
          </div>
        </div>

        <div
          style={{
            display: "flex",
            width: 260,
            height: 260,
            borderRadius: 9999,
            border: "22px solid #f59e0b",
            alignItems: "center",
            justifyContent: "center",
            background: "#0f172a",
          }}
        >
          <div
            style={{
              display: "flex",
              width: 80,
              height: 80,
              borderRadius: 9999,
              background: "#38bdf8",
            }}
          />
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderTop: "1px solid #1e293b",
          paddingTop: 24,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 14,
            fontSize: 20,
            color: "#cbd5e1",
          }}
        >
          <span>Urgent</span>
          <span style={{ color: "#f43f5e" }}>•</span>
          <span>Warning</span>
          <span style={{ color: "#f59e0b" }}>•</span>
          <span>Normal</span>
          <span style={{ color: "#10b981" }}>•</span>
          <span>Invalid</span>
        </div>
        <div style={{ display: "flex", fontSize: 18, color: "#64748b" }}>
          Credit: <span style={{ color: "#e2e8f0" }}>zkvoid</span>
        </div>
      </div>
    </div>
  );
}
