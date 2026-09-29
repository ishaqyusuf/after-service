import { ImageResponse } from "next/og";

export const alt =
  "afterservice — The job ends. The care carries on. A service journey from completed work to a recorded customer reply.";
export const contentType = "image/png";
export const runtime = "edge";
export const size = { height: 630, width: 1200 };

const ink = "#143c37";
const accent = "#007a6e";

export default async function Image() {
  const inter = await fetch(
    new URL("./fonts/inter-regular.ttf", import.meta.url),
  ).then((res) => res.arrayBuffer());

  return new ImageResponse(
    <div
      style={{
        background: "#f6faf9",
        color: ink,
        display: "flex",
        height: "100%",
        overflow: "hidden",
        padding: "52px 58px",
        position: "relative",
        width: "100%",
      }}
    >
      <div
        style={{
          background: "#e4f1eb",
          borderRadius: 999,
          display: "flex",
          height: 560,
          position: "absolute",
          right: -195,
          top: -270,
          width: 560,
        }}
      />
      <div
        style={{
          background: "#e4f1eb",
          borderRadius: 999,
          bottom: -275,
          display: "flex",
          height: 480,
          left: -210,
          position: "absolute",
          width: 480,
        }}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          justifyContent: "space-between",
          position: "relative",
          width: 635,
        }}
      >
        <div style={{ alignItems: "center", display: "flex", gap: 13 }}>
          <div
            style={{
              alignItems: "center",
              background: ink,
              borderRadius: 13,
              color: "#f6faf9",
              display: "flex",
              height: 47,
              justifyContent: "center",
              width: 47,
            }}
          >
            <svg
              aria-hidden="true"
              fill="none"
              height="32"
              viewBox="0 0 64 64"
              width="32"
            >
              <path
                d="M50 51V29C50 18.5 41.5 10 31 10S12 18.5 12 29s8.5 19 19 19c5.1 0 9.8-2 13.2-5.3"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="12"
              />
              <circle cx="31" cy="29" fill="#62c6aa" r="6.5" />
            </svg>
          </div>
          <div
            style={{
              display: "flex",
              fontFamily: "Inter",
              fontSize: 32,
              fontWeight: 700,
              letterSpacing: -1,
            }}
          >
            afterservice
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 22,
            paddingBottom: 26,
          }}
        >
          <div
            style={{
              alignItems: "center",
              color: accent,
              display: "flex",
              fontFamily: "Inter",
              fontSize: 17,
              gap: 10,
              letterSpacing: 2.5,
              textTransform: "uppercase",
            }}
          >
            <div
              style={{
                background: accent,
                borderRadius: 999,
                display: "flex",
                height: 9,
                width: 9,
              }}
            />
            Better follow-through
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontFamily: "Inter",
              fontSize: 76,
              fontWeight: 700,
              gap: 1,
              letterSpacing: -3.8,
              lineHeight: 1.02,
            }}
          >
            <span>The job ends.</span>
            <span style={{ color: accent }}>The care</span>
            <span style={{ color: accent }}>carries on.</span>
          </div>
          <div
            style={{
              color: "#526e67",
              display: "flex",
              fontFamily: "Inter",
              fontSize: 22,
              lineHeight: 1.35,
              maxWidth: 560,
            }}
          >
            A check-in remembered. A reply kept in context.
          </div>
        </div>

        <div
          style={{
            alignItems: "center",
            display: "flex",
            fontFamily: "Inter",
            fontSize: 17,
            gap: 12,
          }}
        >
          <span>Built for local service teams</span>
          <span style={{ color: "#9bb9ad" }}>·</span>
          <span style={{ color: accent }}>afterservice.app</span>
        </div>
      </div>

      <div
        style={{
          background: ink,
          borderRadius: 10,
          boxShadow: "0 20px 44px rgba(20, 60, 55, 0.18)",
          color: "#f6faf9",
          display: "flex",
          flexDirection: "column",
          height: 492,
          justifyContent: "space-between",
          marginLeft: "auto",
          marginTop: 17,
          padding: "31px 30px",
          position: "relative",
          width: 383,
        }}
      >
        <div
          style={{
            color: "#a9d5c7",
            display: "flex",
            fontFamily: "Inter",
            fontSize: 14,
            letterSpacing: 2.1,
            textTransform: "uppercase",
          }}
        >
          The customer journey
        </div>
        {[
          {
            number: "01",
            title: "The work",
            detail: "Job completed and recorded",
          },
          {
            number: "02",
            title: "The follow-through",
            detail: "A useful check-in planned",
          },
          {
            number: "03",
            title: "The relationship",
            detail: "Customer reply kept in context",
          },
        ].map((step) => (
          <div
            key={step.number}
            style={{
              alignItems: "flex-start",
              borderTop: "1px solid #52716b",
              display: "flex",
              gap: 20,
              paddingTop: 22,
            }}
          >
            <div
              style={{
                color: "#84d0b4",
                display: "flex",
                fontFamily: "Inter",
                fontSize: 18,
                paddingTop: 3,
              }}
            >
              {step.number}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div
                style={{
                  display: "flex",
                  fontFamily: "Inter",
                  fontSize: 27,
                  fontWeight: 700,
                  lineHeight: 1.1,
                }}
              >
                {step.title}
              </div>
              <div
                style={{
                  color: "#c0d8d0",
                  display: "flex",
                  fontFamily: "Inter",
                  fontSize: 16,
                  lineHeight: 1.2,
                }}
              >
                {step.detail}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>,
    {
      ...size,
      fonts: [{ name: "Inter", data: inter, weight: 400 }],
    },
  );
}
