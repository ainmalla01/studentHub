
export const challengeStatus = (startDate, endDate) => {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (now < start) {
    return "UPCOMING";
  }

  if (now >= start && now <= end) {
    return "ACTIVE";
  }

  if (now > end) {
    return "CLOSED";
  }

  return "UNKNOWN";
};
