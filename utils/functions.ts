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
