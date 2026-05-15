import { useEffect } from "react";
import AppHeader from "./components/AppHeader";
import Footer from "./components/Footer";
import CountyPage from "./pages/CountyPage";
import GuidePage from "./pages/GuidePage";
import Home from "./pages/Home";
import IndustryPage from "./pages/IndustryPage";
import MethodologyPage from "./pages/MethodologyPage";
import SimplePage from "./pages/SimplePage";
import RankingsPage from "./pages/RankingsPage";
import SourcesPage from "./pages/SourcesPage";
import StatePage from "./pages/StatePage";

export default function App() {
  const path = window.location.pathname;

  useEffect(() => {
    document.documentElement.lang = "en";
  }, []);

  let page;
  if (path.startsWith("/county/")) page = <CountyPage />;
  else if (path.startsWith("/state/")) page = <StatePage />;
  else if (path.startsWith("/rankings/")) page = <RankingsPage />;
  else if (path.startsWith("/industry/")) page = <IndustryPage />;
  else if (path.startsWith("/guides/")) page = <GuidePage />;
  else if (path === "/methodology") page = <MethodologyPage />;
  else if (path === "/data-sources") page = <SourcesPage />;
  else if (path === "/privacy") page = <SimplePage kind="privacy" />;
  else if (path === "/terms") page = <SimplePage kind="terms" />;
  else if (path === "/contact") page = <SimplePage kind="contact" />;
  else page = <Home />;
  return <><AppHeader />{page}<Footer /></>;
}
