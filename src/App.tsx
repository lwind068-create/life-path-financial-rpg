import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { GameProvider } from "./engine/GameContext";
import { AccentTheme } from "./components/AccentTheme";
import { BackgroundFX } from "./components/BackgroundFX";
import { NavBar } from "./components/NavBar";
import { Home } from "./routes/Home";
import { Game } from "./routes/Game";
import { About } from "./routes/About";
import { Character } from "./routes/Character";
import { Debug } from "./routes/Debug";

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
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/play" element={<Game />} />
        <Route path="/character" element={<Character />} />
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
    </BrowserRouter>
  );
}

export default App;
