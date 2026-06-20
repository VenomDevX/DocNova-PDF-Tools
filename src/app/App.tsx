import { RouterProvider } from "react-router";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { router } from "./routes";
import { ThemeProvider } from "./context/ThemeContext";

export default function App() {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
      <Analytics />
      <SpeedInsights />
    </ThemeProvider>
  );
}
