/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
    colors: {
      //TEXT COLORS
      text_title: "#1E2772",
      text_description: "#555555",
      tex_color_white: "#FFFFFF",

      //MAIN COLORS
      color_primary_500: " #1A2A38",
      color_primary_400: "#2C3E50",
      color_primary_300: "#3D5367",

      color_secondary: "#F39C12",
      color_tertiary: "#3498DB",

      neutral: "#BDC3C7",

      //INPUT COLORS
      border_input_color: "#E0E0E0",
      bg_input_color: "#F5F7FA",

      // STATUS COLORS
      color_sucess: "#2ECC71",
      color_info: "#3498DB",
      color_error: "#E74C3C",
    },
  },
  plugins: [],
};
