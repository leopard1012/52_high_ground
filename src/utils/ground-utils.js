export function getGradientFromBg(bg) {
  if (bg.includes("rose")) return "#fecdd3, #f9a8d4";
  if (bg.includes("sky")) return "#bae6fd, #93c5fd";
  if (bg.includes("amber")) return "#fde68a, #fcd34d";
  if (bg.includes("violet")) return "#ddd6fe, #c4b5fd";
  if (bg.includes("green")) return "#a7f3d0, #5eead4";
  return "#fed7aa, #fca5a5";
}

export function getTreeLevel(seeds) {
  if (seeds < 100) return 0;
  if (seeds < 300) return 1;
  if (seeds < 600) return 2;
  return 3;
}

export const TREE_EMOJIS = ["🌱", "🌿", "🌲", "🌳"];
export const TREE_NAMES = ["씨앗", "새싹", "나무", "큰 나무"];
export const TREE_GOALS = [100, 300, 600, 999];

export function getTreeProgress(seeds) {
  const level = getTreeLevel(seeds);
  const previousGoal = level === 0 ? 0 : level === 1 ? 100 : level === 2 ? 300 : 600;
  const nextGoal = TREE_GOALS[level];
  if (level === 3) return 100;
  return Math.min(((seeds - previousGoal) / (nextGoal - previousGoal)) * 100, 100);
}
