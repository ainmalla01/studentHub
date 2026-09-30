export const LEVEL_THRESHOLDS = Object.freeze({ INTERMEDIATE: 50, ADVANCED: 80 });

export const levelForScore = (score) => {
  if (score >= LEVEL_THRESHOLDS.ADVANCED) return "ADVANCED";
  if (score >= LEVEL_THRESHOLDS.INTERMEDIATE) return "INTERMEDIATE";
  return "BASIC";
};

/**
 * Turns a student's evaluated submissions into per-skill average scores.
 *
 * @param {Array<{score:number|null, challenge:{skills:Array<{skillId:string}>}}>} evaluated
 * @returns {Array<{skillId:string, score:number, level:string}>}
 */
export const calculateSkillScores = (evaluated) => {
  const totals = new Map();

  for (const submission of evaluated) {
    if (submission.score == null) continue;
    for (const { skillId } of submission.challenge?.skills ?? []) {
      const t = totals.get(skillId) ?? { sum: 0, count: 0 };
      t.sum += submission.score;
      t.count += 1;
      totals.set(skillId, t);
    }
  }

  return [...totals].map(([skillId, { sum, count }]) => {
    const score = Number((sum / count).toFixed(2));
    return { skillId, score, level: levelForScore(score) };
  });
};
