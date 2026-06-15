import { createBrowserRouter } from "react-router";
import Root from "./Root";
import HomePage from "./pages/HomePage";
import ToolsPage from "./pages/ToolsPage";
import ToolDetailPage from "./pages/ToolDetailPage";
import CategoryPage from "./pages/CategoryPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
import AuthPage from "./pages/AuthPage";
import ResultPage from "./pages/ResultPage";
import GenericAIToolPage from "./pages/ai/GenericAIToolPage";
import AIAssistantPage from "./pages/ai/AIAssistantPage";
import NotFoundPage from "./pages/NotFoundPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: HomePage },
      { path: "tools", Component: ToolsPage },
      { path: "tools/:toolId", Component: ToolDetailPage },
      { path: "convert", Component: CategoryPage },
      { path: "organize", Component: CategoryPage },
      { path: "edit", Component: CategoryPage },
      { path: "secure", Component: CategoryPage },
      { path: "ocr", Component: CategoryPage },
      { path: "ai", Component: CategoryPage },
      { path: "about", Component: AboutPage },
      { path: "contact", Component: ContactPage },
      { path: "privacy", Component: PrivacyPage },
      { path: "terms", Component: TermsPage },
      { path: "ai-tools/chat", Component: AIAssistantPage },
      { path: "ai-tools/:toolId", Component: GenericAIToolPage },
      { path: "result/:jobId", Component: ResultPage },
      { path: "*", Component: NotFoundPage },
    ],
  },
  {
    path: "/auth",
    Component: AuthPage,
  },
]);
