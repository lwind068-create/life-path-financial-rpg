import { Analytics } from "@vercel/analytics/react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { GameProvider } from "./engine/GameContext";
import { AccentTheme } from "./components/AccentTheme";
import { BackgroundFX } from "./components/BackgroundFX";
import { NavBar } from "./components/NavBar";
import { Home } from "./routes/Home";
import { Game } from "./routes/Game";
import { About } from "./routes/About";
import { Character } from "./routes/Character";
import { Shop } from "./routes/Shop";
import { Arcade } from "./routes/Arcade";
import { Notices } from "./components/Notices";
import { Debug } from "./routes/Debug";
import { getTrafficSource } from "./engine/analytics";

// Record where this visitor came from (utm_source / referrer) as early as
// possible, before any in-app navigation drops the query string.
getTrafficSource();

function Shell() {
  // /debug is an internal data-review tool, not part of the game — keep it
  // free of game chrome (nav, background, accent theme) so it reads as what
  // it is.
  const isDebug = useLocation().pathname === "/debug";

  if (isDebug) {
    return (
      <Routes>
        <Route path="/debug" element={<Debug />} />
      </Routes>
    );
  }

  return (
    <AccentTheme>
      <BackgroundFX />
      <NavBar />
      <Notices />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/play" element={<Game />} />
        <Route path="/character" element={<Character />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/arcade" element={<Arcade />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </AccentTheme>
  );
}

function App() {
  return (
    <BrowserRouter>
      <GameProvider>
        <Shell />
      </GameProvider>
      <Analytics />
    </BrowserRouter>
  );
}

export default App;
