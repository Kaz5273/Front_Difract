import { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";
import { PlatformPressable } from "@react-navigation/elements";
import * as Haptics from "expo-haptics";
import { StyleSheet, View } from "react-native";
import { useSegments } from "expo-router";

export function HapticTab(props: BottomTabBarButtonProps) {
  const segments = useSegments();

  // ✅ Le dernier segment représente la route actuelle
  const currentRoute = segments[segments.length - 1] || "index";

  // ✅ Récupérer le href depuis les props (casting pour accéder à href)
  const href = (props as any).href || "";

  // ✅ Extraire le nom de la route depuis href
  // Exemple: "/(tabs)" -> "index", "/(tabs)/Vote" -> "Vote"
  const routeParts = href.split("/").filter(Boolean);
  const targetRoute = routeParts[routeParts.length - 1] || "index";

  // ✅ Normaliser : "(tabs)" devient "index"
  const normalizedCurrent = currentRoute === "(tabs)" ? "index" : currentRoute;
  const normalizedTarget = targetRoute === "(tabs)" ? "index" : targetRoute;

  const isSelected = normalizedCurrent === normalizedTarget;

  return (
    <View style={[styles.wrapper, isSelected && styles.wrapperActive]}>
      <PlatformPressable
        {...props}
        onPressIn={(ev) => {
          if (process.env.EXPO_OS === "ios") {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
          props.onPressIn?.(ev);
        }}
        style={styles.pressable}
      >
        {props.children}
      </PlatformPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: 60,
    width: 80,
    borderRadius: 100, // ✅ Arrondi pour suivre la forme de la barre
    marginHorizontal: 4, // ✅ Petit espace entre les boutons
  },
  wrapperActive: {
    backgroundColor: "#1E1E1E", // ✅ Fond violet semi-transparent
    // Vous pouvez aussi utiliser :
    // backgroundColor: "#6366f1",  // Fond plein
    // backgroundColor: "rgba(255, 255, 255, 0.1)",  // Fond blanc transparent
  },
  pressable: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
});
