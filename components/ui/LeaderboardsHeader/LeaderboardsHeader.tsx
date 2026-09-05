import { TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, UnistylesRuntime } from "react-native-unistyles";
import { ThemedText } from "@/components/ui/ThemedText";
import { useAuthStore } from "@/zustand/AuthStore";
import LoginButton from "@/components/ui/LoginButton/LoginButton";
import LogoutButton from "@/components/ui/LogoutButton/LogoutButton";
import {
  HEADER_MIN_HEIGHT,
  HEADER_PADDING_VERTICAL,
} from "@/unistyles/constants";

type Props = {
  headerTitle: string;
  possibleRanges: string[];
  selectedRange: string;
  possibleModes?: string[];
  selectedMode?: string;
  breadcrumb?: string;
  infoText?: string;
  onRangePress?: (range: string) => void;
  onModePress?: (mode: string) => void;
  onBackPress?: () => void;
};

type PillGroupProps = {
  options: string[];
  selected?: string;
  onPress?: (option: string) => void;
};

// One segmented control. The header shows two of them — what is measured and
// over how long — so they share a component rather than drifting apart.
const PillGroup = ({ options, selected, onPress }: PillGroupProps) => (
  <View style={styles.pillGroup}>
    {options.map((option) => {
      const isSelected = option === selected;
      return (
        <TouchableOpacity
          key={option}
          onPress={() => onPress?.(option)}
          style={styles.pill(isSelected)}
        >
          <ThemedText type={"label"} style={styles.pillText(isSelected)}>
            {option}
          </ThemedText>
        </TouchableOpacity>
      );
    })}
  </View>
);

const LeaderboardsHeader = ({
  headerTitle,
  possibleRanges,
  selectedRange,
  possibleModes,
  selectedMode,
  breadcrumb,
  infoText,
  onRangePress,
  onModePress,
  onBackPress,
}: Props) => {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const textPrimary = UnistylesRuntime.getTheme().colors.textPrimary;

  return (
    <View style={styles.container(isLoggedIn)}>
      <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
        <Ionicons name={"chevron-back"} size={24} color={textPrimary} />
      </TouchableOpacity>

      <View style={styles.titleHolder}>
        {!!breadcrumb && (
          <ThemedText type={"label"} style={styles.breadcrumb}>
            {`${breadcrumb} /`}
          </ThemedText>
        )}
        <ThemedText type={"heading"} style={styles.title}>
          {headerTitle}
        </ThemedText>
      </View>

      <View style={styles.spacer} />

      {!!infoText && (
        <ThemedText type={"micro"} style={styles.infoText}>
          {infoText}
        </ThemedText>
      )}

      {!!possibleModes?.length && (
        <PillGroup
          options={possibleModes}
          selected={selectedMode}
          onPress={onModePress}
        />
      )}

      <PillGroup
        options={possibleRanges}
        selected={selectedRange}
        onPress={onRangePress}
      />

      <LoginButton />
      <LogoutButton />
    </View>
  );
};

export default LeaderboardsHeader;

const styles = StyleSheet.create((theme) => ({
  backButton: {
    backgroundColor: theme.colors.surface3,
    padding: theme.margins.md,
    borderRadius: 4,
    borderColor: theme.colors.borderStrong,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  // The breadcrumb sits on the same line as the title, so a long title keeps
  // the back button company rather than wrapping the whole row.
  titleHolder: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: theme.margins.md,
    flexShrink: 1,
    minWidth: 120,
  },
  breadcrumb: {
    color: theme.colors.textMuted,
  },
  title: {
    textTransform: "uppercase",
  },
  // A flexing spacer would claim a whole row once the header wraps.
  spacer: {
    display: { xs: "none", md: "flex" },
    flex: 1,
  },
  infoText: {
    color: theme.colors.textMuted,
    textTransform: "uppercase",
  },
  // One bordered group: the buttons inside share its outline rather than each
  // drawing their own.
  pillGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.margins.sm,
    backgroundColor: theme.colors.surface1,
    borderColor: theme.colors.borderStrong,
    borderWidth: 1,
    borderRadius: 4,
    padding: 3,
  },
  pill: (isSelected: boolean) => ({
    backgroundColor: isSelected ? theme.colors.surface3 : theme.colors.surface1,
    borderColor: isSelected ? theme.colors.borderStrong : theme.colors.surface1,
    borderWidth: 1,
    borderRadius: 3,
    paddingHorizontal: theme.margins.lg,
    paddingVertical: theme.margins.sm,
  }),
  pillText: (isSelected: boolean) => ({
    color: isSelected ? theme.colors.textPrimary : theme.colors.textMuted,
  }),
  container: (isLoggedIn: boolean) => ({
    backgroundColor: theme.colors.surface1,
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.margins.lg,
    minHeight: HEADER_MIN_HEIGHT,
    paddingHorizontal: { xs: theme.margins.lg, md: 25 },
    paddingVertical: HEADER_PADDING_VERTICAL,
    borderBottomColor: theme.colors.borderHairline,
    borderBottomWidth: 2,
    borderTopColor: isLoggedIn
      ? theme.colors.accentMedic
      : theme.colors.surface1,
    borderTopWidth: 2,
  }),
}));
