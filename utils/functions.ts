import { GameRoundPlayer } from "@/app/viewDemo";

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

// Postgres `timestamptz` comes back with an offset ("...+00:00"); a plain
// `timestamp` comes back without one, and JS would parse that as local time.
// Treat a missing offset as UTC, which is what the database stores.
function parseDate(isoString: string) {
  if (!isoString) return new Date(NaN);

  const hasOffset = /(?:Z|[+-]\d{2}:?\d{2})$/.test(isoString);
  // Some drivers use a space instead of "T"; JS parsing of that is
  // implementation-defined, so normalise it.
  const normalised = isoString.replace(" ", "T");

  return new Date(hasOffset ? normalised : `${normalised}Z`);
}

// "2026-08-12T18:44:28.716251+00:00" -> "Aug 12, 2026, 2:41 PM" in the device's local timezone
export function toReadableDate(isoString: string) {
  const date = parseDate(isoString);

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
  const date = parseDate(isoString);

  if (isNaN(date.getTime())) return "";

  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
  });
}

// Turns a raw game round id into a readable map name + game mode
export function formatRoundTitle(roundId: string) {
  if (!roundId) return "";

  let text = roundId;
  text = text.replaceAll("_", " ");
  text = text.substring(20, text.length);
  text = text.replaceAll("gpm coop", "");
  text = text.replaceAll("16", "-  Infantry");
  text = text.replaceAll("32", "-  Alternative");
  text = text.replaceAll("64", "-  Standard");
  text = text.replaceAll("128", "-  Large");
  return text;
}

// 1320 -> "22 mins", 4320 -> "1 hr 12 mins"
export function formatDuration(totalSeconds: number) {
  const seconds = Math.max(0, Math.floor(totalSeconds));

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  const parts: string[] = [];

  if (hours > 0) {
    parts.push(`${hours} ${hours === 1 ? "hr" : "hrs"}`);
  }
  if (minutes > 0 || hours === 0) {
    parts.push(`${minutes} ${minutes === 1 ? "min" : "mins"}`);
  }

  return parts.join(" ");
}

// "2026-08-13T07:32:54+00:00" -> "2026-08-13 09:32" in the device's local timezone
export function toTimestamp(isoString: string) {
  const date = parseDate(isoString);

  if (isNaN(date.getTime())) return "";

  const pad = (n: number) => String(n).padStart(2, "0");

  const day = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  const time = `${pad(date.getHours())}:${pad(date.getMinutes())}`;

  return `${day} • ${time}`;
}

// "2026-08-12T18:44:28.716251+00:00" -> "3 hours ago"
export function timeSince(isoString: string) {
  const date = parseDate(isoString);

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

export function adjustColorBrightness(hex: string, brighten: number): string {
  // 1. Normalize the hex string (remove '#' and handle 3-digit hex)
  let cleanHex = hex.replace("#", "");
  if (cleanHex.length === 3) {
    cleanHex = cleanHex
      .split("")
      .map((char) => char + char)
      .join("");
  }

  // 2. Convert Hex to RGB (values between 0 and 1)
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

  // 3. Convert RGB to HSL
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  let l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  // 4. Adjust Lightness based on the 'brighten' parameter and clamp it
  // We divide by 100 because our internal 'l' is on a 0 to 1 scale
  l = l + brighten / 100;
  l = Math.max(0, Math.min(1, l)); // Ensures Lightness stays between 0% and 100%

  // 5. Convert HSL back to RGB
  let rOut: number, gOut: number, bOut: number;

  if (s === 0) {
    rOut = gOut = bOut = l; // Achromatic (gray)
  } else {
    const hueToRgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    rOut = hueToRgb(p, q, h + 1 / 3);
    gOut = hueToRgb(p, q, h);
    bOut = hueToRgb(p, q, h - 1 / 3);
  }

  // 6. Convert RGB back to Hex string
  const toHex = (x: number) => {
    const hexStr = Math.round(x * 255).toString(16);
    return hexStr.length === 1 ? `0${hexStr}` : hexStr;
  };

  return `#${toHex(rOut)}${toHex(gOut)}${toHex(bOut)}`;
}

// Highest scorer of a round by whatever stat is passed in. Bots always outclass
// humans, so they are never eligible. Returns "" when nobody qualifies.
export function findTopPlayer(
  players: GameRoundPlayer[] | undefined,
  getStat: (player: GameRoundPlayer) => number,
) {
  if (!players?.length) {
    return "";
  }
  const best = players
    .filter((player) => !player.player_id.startsWith("[R-BOT]"))
    .reduce<GameRoundPlayer | undefined>((acc, player) => {
      return !acc || getStat(player) > getStat(acc) ? player : acc;
    }, undefined);

  if (!best || getStat(best) <= 0) {
    return "";
  }
  return `${best.player_id}: ${getStat(best)}`;
}
