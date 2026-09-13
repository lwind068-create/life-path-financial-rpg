import { useGame } from "../engine/GameContext";
import { ChapterScreen } from "../components/ChapterScreen";
import { EndingScreen } from "../components/EndingScreen";
import { CharacterCreationScreen } from "../components/CharacterCreationScreen";

export function Game() {
  const { profile, currentChapter } = useGame();

  if (!profile.onboarded) return <CharacterCreationScreen />;
  return currentChapter.isEnding ? <EndingScreen /> : <ChapterScreen />;
}
