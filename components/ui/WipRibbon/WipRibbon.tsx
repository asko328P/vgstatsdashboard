import { View } from "react-native";
import { ThemedText } from "@/components/ui/ThemedText";
import { StyleSheet } from "react-native-unistyles";

// A 45° banner pinned to the top left corner of the app. Purely decorative, so
// it never takes touches — the screen underneath stays fully usable.
const WipRibbon = () => {
  return (
    <View pointerEvents={"none"} style={styles.clip}>
      <View style={styles.band}>
        <ThemedText type={"label"} style={styles.text}>
          {"W.I.P."}
        </ThemedText>
      </View>
    </View>
  );
};

export default WipRibbon;

const styles = StyleSheet.create((theme) => ({
  // Square that crops the rotated band to the corner.
  clip: {
    position: "absolute",
    left: 0,
    top: 0,
    width: 110,
    height: 110,
    overflow: "hidden",
    zIndex: 100,
  },
  // Wider than the square's diagonal so the band runs corner to corner, then
  // offset up and left so the rotation lands it across the corner.
  band: {
    position: "absolute",
    left: -70,
    top: 8,
    width: 180,
    alignItems: "center",
    paddingVertical: 4,
    backgroundColor: theme.colors.accentWarn,
    transform: [{ rotate: "-45deg" }],
  },
  text: {
    color: theme.colors.surfaceBase,
  },
}));
