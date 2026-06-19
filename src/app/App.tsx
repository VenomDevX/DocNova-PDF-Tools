import { RouterProvider } from "react-router";
import { router } from "./routes";
import { ThemeProvider } from "./context/ThemeContext";
import { SpeedInsights } from "@vercel/speed-insights/react";

export default function App() {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
      <SpeedInsights />
    </ThemeProvider>
  );
}
