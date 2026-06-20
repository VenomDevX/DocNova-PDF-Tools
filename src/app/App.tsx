import { RouterProvider } from "react-router";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { router } from "./routes";
import { ThemeProvider } from "./context/ThemeContext";

export default function App() {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
      <SpeedInsights />
    </ThemeProvider>
  );
}
