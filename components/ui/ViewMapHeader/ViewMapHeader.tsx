import { TouchableOpacity, View } from "react-native";
import { ThemedText } from "@/components/ui/ThemedText";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, UnistylesRuntime } from "react-native-unistyles";
import { useAuthStore } from "@/zustand/AuthStore";
import LogoutButton from "@/components/ui/LogoutButton/LogoutButton";
import LoginButton from "@/components/ui/LoginButton/LoginButton";
import {
  HEADER_MIN_HEIGHT,
  HEADER_PADDING_VERTICAL,
} from "@/unistyles/constants";

type Props = {
  headerTitle: string;
  onBackPress?: () => void;
  onModeratorViewPress?: () => void;
};

const ViewMapHeader = ({
  headerTitle,
  onBackPress,
  onModeratorViewPress,
}: Props) => {
  const textPrimary = UnistylesRuntime.getTheme().colors.textPrimary;

  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  return (
    <View style={styles.container(isLoggedIn)}>
      <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
        <Ionicons name={"chevron-back"} size={24} color={textPrimary} />
      </TouchableOpacity>

      <View style={styles.titleHolder}>
        <ThemedText type={"micro"}>{"MAPS /"}</ThemedText>
        <ThemedText type={"heading"} style={styles.title}>
          {headerTitle}
        </ThemedText>
      </View>

      <View style={styles.spacer} />

      {isLoggedIn && (
        <TouchableOpacity
          onPress={onModeratorViewPress}
          style={styles.moderatorButton}
        >
          <ThemedText type={"micro"}>{"Moderator View"}</ThemedText>
        </TouchableOpacity>
      )}

      <LoginButton />
      <LogoutButton />
    </View>
  );
};

export default ViewMapHeader;

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
  titleHolder: {
    alignItems: "center",
    flexDirection: "row",
    // A long map name has to wrap rather than overflow.
    flexWrap: "wrap",
    flexShrink: 1,
    gap: theme.margins.md,
  },
  title: {
    textTransform: "uppercase",
  },
  moderatorButton: {
    backgroundColor: theme.colors.surface3,
    borderColor: theme.colors.borderStrong,
    borderWidth: 1,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: theme.margins.md,
    paddingVertical: theme.margins.sm,
  },
  // A flexing spacer would claim a whole row once the header wraps.
  spacer: {
    display: { xs: "none", md: "flex" },
    flex: 1,
  },
  container: (isLoggedIn: boolean) => ({
    backgroundColor: theme.colors.surface1,
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.margins.lg,
    minHeight: HEADER_MIN_HEIGHT,
    paddingHorizontal: { xs: theme.margins.lg, md: 25 },
    paddingVertical: HEADER_PADDING_VERTICAL,
    borderBottomColor: "#1d1f22",
    borderBottomWidth: 2,
    borderTopColor: isLoggedIn ? theme.colors.accentMedic : "transparent",
    borderTopWidth: 2,
  }),
}));
