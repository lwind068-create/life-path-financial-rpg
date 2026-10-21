export interface GameResult {
  /** Raw score for personal bests (portfolio value, items sorted, rounds right). */
  score: number;
  /** Life Points earned back. */
  reward: number;
  headline: string;
  lines: string[];
}
