// Every page header (PageHeader, DemoHeader, LeaderboardsHeader,
// ViewPlayerHeader) shares this floor so switching screens never nudges the
// content below up or down. Their contents differ in intrinsic height — a
// wordmark and login fields on one, a two line title on another — so it is a
// minHeight with centred content rather than a fixed height: on phones the
// header still wraps and grows past it.
export const HEADER_MIN_HEIGHT = 82;

// Uniform vertical padding, so a header whose content is shorter than
// HEADER_MIN_HEIGHT still breathes the same as one that is taller.
export const HEADER_PADDING_VERTICAL = 15;
