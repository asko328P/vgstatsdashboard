import { StyleProp, StyleSheet, View } from "react-native";
import { Image, ImageStyle } from "expo-image";
import { GameRound } from "@/components/ui/GameRoundItem2/GameRoundItem2";
import { useMemo } from "react";
import mapNameToImageUrl from "@/components/ui/MapImage/mapNameToImageUrl";

type Props = {
  gameRound?: GameRound;
  style?: ImageStyle;
};

const MapImage = ({ gameRound, style }: Props) => {
  const imageUri = useMemo(() => {
    if (!gameRound) {
      return "";
    }
    // @ts-ignore
    let text = gameRound.id;
    text = text.replaceAll("_", " ");
    text = text.substring(20, text.length);
    text = text.replaceAll("gpm coop", "");
    text = text.replaceAll("16", "");
    text = text.replaceAll("32", "");
    text = text.replaceAll("64", "");
    text = text.replaceAll("128", "");
    text = text.replaceAll(" ", "");

    if (!mapNameToImageUrl[text]) {
      console.log(text);
    }

    if (mapNameToImageUrl[text]) {
      return mapNameToImageUrl[text];
    }
    return "";
  }, [gameRound]);

  if (imageUri) {
    return (
      <Image
        blurRadius={2}
        style={[styles.image, style]}
        source={{ uri: imageUri }}
      />
    );
  }
  return <View></View>;
};

export default MapImage;

const styles = StyleSheet.create({
  image: {
    height: "100%",
    // aspectRatio: 300 / 200,
  },
});
