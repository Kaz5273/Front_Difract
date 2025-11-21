import IconApple from "@/components/icons/iconApple";
import IconGoogle from "@/components/icons/iconGoogle";
import { VignetteGradient } from "@/components/PictureGradient";
import { ThemedText } from "@/components/themed-text";
import { router } from "expo-router";
import React from "react";
import {
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const AuthIndex = () => {
  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          source={require("@/assets/images/ImgLogin.png")}
          style={styles.image}
        />
        <VignetteGradient
          intensity={0.85}
          size={30}
          sides={["bottom", "top"]}
        />
      </View>
      <Pressable
        style={styles.button}
        onPress={() => router.push("/Auth/Login")}
      >
        <Text style={styles.buttonText}>Se connecter</Text>
      </Pressable>
      <Pressable
        style={styles.buttonSecondary}
        onPress={() => router.push("/Auth/register")}
      >
        <Text style={styles.buttonTextSecondary}>Créer un compte</Text>
      </Pressable>
      <View style={styles.containerSocial}>
        <Pressable style={styles.buttonGoogle} onPress={() => {}}>
          <IconGoogle />
        </Pressable>
        <Pressable style={styles.buttonApple} onPress={() => {}}>
          <IconApple />
        </Pressable>
      </View>
      <Pressable onPress={() => router.push("/(tabs)")}>
        <ThemedText type="link" style={styles.text}>
          Continuez en tant qu'invité
        </ThemedText>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    marginTop: 20,
    color: "#625c5cff",
    fontSize: 14,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 16,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imageContainer: {
    marginBottom: 40,
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
    position: "relative",
  },
  button: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 15,
    paddingHorizontal: 68,
    borderRadius: 100,
    alignItems: "center",
  },
  buttonSecondary: {
    backgroundColor: "#585858",
    paddingVertical: 15,
    paddingHorizontal: 55,
    borderRadius: 100,
    alignItems: "center",
    marginTop: 15,
  },
  buttonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonTextSecondary: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  containerSocial: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
    paddingHorizontal: 20,
  },
  buttonGoogle: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 50,
    alignItems: "center",
    borderColor: "#4e4d4dff",
    borderWidth: 1,
  },
  buttonApple: {
    backgroundColor: "#000000",
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 50,
    alignItems: "center",
    borderColor: "#4e4d4dff",
    borderWidth: 1,
  },
});

export default AuthIndex;
