import { RouterProvider } from "react-router";
import { Analytics } from "@vercel/analytics/react";
import { router } from "./routes";
import { ThemeProvider } from "./context/ThemeContext";

export default function App() {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
      <Analytics />
    </ThemeProvider>
  );
}
