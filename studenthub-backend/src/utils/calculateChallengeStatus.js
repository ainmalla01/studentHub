
export const calculateChallengeStatus = (challenge) => {
  if (challenge.status === "DRAFT") {
    return "DRAFT";
  }

  const now = new Date();
  const start = new Date(challenge.startDate);
  const end = new Date(challenge.deadline);

  if (now < start) {
    return "UPCOMING";
  }

  if (now >= start && now <= end) {
    return "PUBLISHED";
  }

  return "CLOSED";
};