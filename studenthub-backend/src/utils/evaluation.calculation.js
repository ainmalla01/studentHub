export const calculateEvaluation = (rubrics, scores) => {
  const maximumScore = rubrics.reduce(
    (sum, rubric) => sum + rubric.maxScore,
    0
  );

  const total = scores.reduce(
    (sum, item) => sum + item.score,
    0
  );

  const percentage =
    maximumScore > 0
      ? Number(((total / maximumScore) * 100).toFixed(2))
      : 0;

  let grade = "F";

  if (percentage >= 90) grade = "A+";
  else if (percentage >= 80) grade = "A";
  else if (percentage >= 70) grade = "B+";
  else if (percentage >= 60) grade = "B";
  else if (percentage >= 50) grade = "C+";
  else if (percentage >= 40) grade = "C";

  return {
    total,
    maximumScore,
    percentage,
    grade,
  };
};