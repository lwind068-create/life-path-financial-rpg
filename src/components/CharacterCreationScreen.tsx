import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "../engine/GameContext";
import { ColorPicker } from "./ColorPicker";

/**
 * Shown once, before the player's first arc — regardless of which arc they
 * picked. What it sets (name + color) lives on the profile, not on any one
 * arc's progress, so it carries into every arc after this. There's no
 * avatar/face step — identity in this game is just a name and a color.
 */
export function CharacterCreationScreen() {
  const { profile, setCharacterName, setAccentId, completeOnboarding } = useGame();
  const [nameDraft, setNameDraft] = useState("");
  const [step, setStep] = useState<"name" | "color">(
    profile.characterName ? "color" : "name",
  );

  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 px-5 py-10 sm:py-16">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col gap-6 rounded-3xl border p-6 shadow-2xl shadow-black/40 sm:p-8"
          style={{ borderColor: "var(--hairline)", background: "var(--bg-panel-solid)" }}
        >
          {step === "name" && (
            <>
              <p className="font-narrative text-lg sm:text-xl leading-relaxed text-[var(--ink)]">
                Before your story starts, who's living it?
              </p>
              <form
                className="flex flex-col gap-3 sm:flex-row"
                onSubmit={(e) => {
                  e.preventDefault();
                  setCharacterName(nameDraft);
                  setStep("color");
                }}
              >
                <input
                  autoFocus
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  placeholder="What should we call you?"
                  maxLength={24}
                  className="flex-1 rounded-lg border px-4 py-3 text-[var(--ink)] placeholder:text-[var(--ink-faint)] focus:border-[var(--accent)] focus:outline-none"
                  style={{ borderColor: "var(--hairline)", background: "var(--bg-panel-raised)" }}
                />
                <button
                  type="submit"
                  disabled={nameDraft.trim().length === 0}
                  className="rounded-lg px-5 py-3 text-sm font-semibold transition-opacity disabled:opacity-40"
                  style={{ background: "var(--accent)", color: "var(--accent-ink)" }}
                >
                  Continue
                </button>
              </form>
            </>
          )}

          {step === "color" && (
            <ColorPicker
              name={profile.characterName || nameDraft || "there"}
              accentId={profile.accentId}
              onSelectAccent={setAccentId}
              onConfirm={completeOnboarding}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
