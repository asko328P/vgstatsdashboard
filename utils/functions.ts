export function formatTime(totalSeconds: number) {
  // Ensure the input is treated as a non-negative integer
  const seconds = Math.max(0, Math.floor(totalSeconds));

  // Calculate minutes and remaining seconds
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  // Pad numbers with a leading zero if they are less than 10
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

// "2026-08-12T18:44:28.716251+00:00" -> "Aug 12, 2026, 2:41 PM" in the device's local timezone
export function toReadableDate(isoString: string) {
  const date = new Date(isoString);

  if (isNaN(date.getTime())) return "";

  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

// "2026-08-12T18:44:28.716251+00:00" -> "Aug 12" in the device's local timezone
export function toReadableDayMonth(isoString: string) {
  const date = new Date(isoString);

  if (isNaN(date.getTime())) return "";

  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
  });
}

// "2026-08-12T18:44:28.716251+00:00" -> "3 hours ago"
export function timeSince(isoString: string) {
  const date = new Date(isoString);

  if (isNaN(date.getTime())) return "";

  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";

  const units = [
    { label: "min", secs: 60 },
    { label: "hr", secs: 3600 },
    { label: "day", secs: 86400 },
  ];

  // Pick the largest unit that still yields a whole number
  const unit = units.reduce((biggest, u) => (seconds >= u.secs ? u : biggest));

  const value = Math.floor(seconds / unit.secs);

  return `${value} ${unit.label}${value === 1 ? "" : "s"} ago`;
}
