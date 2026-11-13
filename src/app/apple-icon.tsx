import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Felt tile and white spade, the same mark as the home page logo. */
const AppleIcon = () =>
  new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background: "#0B1224",
      }}>
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundImage: "linear-gradient(135deg, #17895F, #0A4430)",
          borderRadius: 55,
        }}>
        <svg width="95" height="95" viewBox="0 0 100 100" fill="#ffffff">
          <path d="M50 2C82 30 100 45 96 62C92 82 62 84 53 68L47 68C38 84 8 82 4 62C0 45 18 30 50 2Z" />
          <path d="M50 60L66 98L34 98Z" />
        </svg>
      </div>
    </div>,
    { ...size },
  );

export default AppleIcon;
