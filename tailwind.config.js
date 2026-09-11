/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // 主色：蜜桃粉，用於按鈕與強調元素
        primary: {
          DEFAULT: "#FF99A8",
          light: "#FFE5E9",
        },
        // 全局底色：奶油雪紡白
        background: "#FFFDFD",
        // 主內文／次要資訊文字色
        text: {
          main: "#5C4B49",
          muted: "#9E8C8A",
        },
        // 狀態色：正確／錯誤
        success: "#86D5B7",
        error: "#FFB3A7",
        // 夜晚場景底色（深梅紫棕，非純黑，維持整體暖色調）
        night: {
          DEFAULT: "#3B2A3E",
          light: "#5C4363",
        },
      },
      fontFamily: {
        // 日文／漢字
        jp: ['"Zen Maru Gothic"', "sans-serif"],
        // 英數預設字體
        sans: ["Nunito", '"Zen Maru Gothic"', "sans-serif"],
      },
      boxShadow: {
        // 帶粉色調的彌散投影，用於卡片、按鈕
        peach: "0 8px 24px rgba(255, 153, 168, 0.12)",
        "peach-lg": "0 12px 32px rgba(255, 153, 168, 0.2)",
      },
      backdropBlur: {
        xs: "2px",
      },
      keyframes: {
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "20%": { transform: "translateX(-6px)" },
          "40%": { transform: "translateX(6px)" },
          "60%": { transform: "translateX(-4px)" },
          "80%": { transform: "translateX(4px)" },
        },
      },
      animation: {
        shake: "shake 0.4s ease-in-out",
      },
    },
  },
  plugins: [],
};
