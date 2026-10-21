import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0b1220",
        }}
      >
        <div
          style={{
            width: 128,
            height: 128,
            borderRadius: 9999,
            border: "14px solid #f59e0b",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#0f172a",
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 9999,
              background: "#38bdf8",
            }}
          />
        </div>
      </div>
    ),
    { ...size },
  );
}
