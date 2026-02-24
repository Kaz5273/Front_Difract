import { Fonts } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React from "react";
import { Alert, Image, Pressable, StyleSheet, Text, View } from "react-native";

const DECO_IMAGES = [
  require("@/assets/images/onbo1.png"),
  require("@/assets/images/onbo2.png"),
  require("@/assets/images/onbo3.png"),
  require("@/assets/images/scene.png"),
  require("@/assets/images/onboar1.png"),
];

interface StepProfilePhotoProps {
  profilePhoto: ImagePicker.ImagePickerAsset | null;
  onUpdate: (photo: ImagePicker.ImagePickerAsset) => void;
}

export function StepProfilePhoto({
  profilePhoto,
  onUpdate,
}: StepProfilePhotoProps) {
  const pickImage = async () => {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permission requise",
        "L'accès aux photos est nécessaire pour choisir une photo de profil."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      onUpdate(result.assets[0]);
    }
  };

  return (
    <View style={styles.container}>
      {/* Main content */}
      <View style={styles.formSection}>
        <Text style={styles.fieldTitle}>Votre photo de profil</Text>

        <Pressable onPress={pickImage} style={styles.photoWrapper}>
          <View style={styles.photoContainer}>
            {profilePhoto ? (
              <Image
                source={{ uri: profilePhoto.uri }}
                style={styles.photo}
              />
            ) : (
              <Text style={styles.uploadText}>
                Cliquez pour{"\n"}upload
              </Text>
            )}
          </View>
          {/* Pencil icon */}
          <View style={styles.pencilButton}>
            <Ionicons name="pencil" size={20} color="#FFFFFF" />
          </View>
        </Pressable>

        <View style={styles.helperContainer}>
          <Text style={styles.helperText}>
            Le fichier ne doit pas dépasser 5 mo
          </Text>
          <Text style={styles.helperText}>Fichier PNG ou JPG.</Text>
          <Text style={styles.helperText}>Taille minimale 1080x1080px</Text>
        </View>
      </View>

      {/* Decorative images */}
      <Image
        source={DECO_IMAGES[0]}
        style={[styles.decoImage, styles.decoBottomLeftLarge]}
      />
      <Image
        source={DECO_IMAGES[1]}
        style={[styles.decoImage, styles.decoLeftSmall]}
      />
      <Image
        source={DECO_IMAGES[2]}
        style={[styles.decoImage, styles.decoTopRightLarge]}
      />
      <Image
        source={DECO_IMAGES[3]}
        style={[styles.decoImage, styles.decoMiddleRight]}
      />
      <Image
        source={DECO_IMAGES[4]}
        style={[styles.decoImage, styles.decoBottomRight]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  formSection: {
    gap: 24,
    alignItems: "center",
  },
  fieldTitle: {
    fontSize: 20,
    fontFamily: Fonts.extraBold,
    color: "#FFFFFF",
    textAlign: "center",
    letterSpacing: -0.34,
  },
  photoWrapper: {
    position: "relative",
  },
  photoContainer: {
    width: 161,
    height: 156,
    borderRadius: 5000,
    borderWidth: 1,
    borderColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  photo: {
    width: "100%",
    height: "100%",
  },
  uploadText: {
    fontSize: 15,
    fontFamily: Fonts.semiBold,
    color: "#FFFFFF",
    textAlign: "center",
  },
  pencilButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 44,
    height: 44,
    borderRadius: 33,
    backgroundColor: "#333333",
    justifyContent: "center",
    alignItems: "center",
  },
  helperContainer: {
    alignItems: "center",
    paddingVertical: 13,
  },
  helperText: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: "#b6b6b6",
    textAlign: "center",
  },

  // Decorative images
  decoImage: {
    position: "absolute",
    borderRadius: 5000,
  },
  // Bottom-left large - rotated 20.75deg
  decoBottomLeftLarge: {
    width: 129,
    height: 127,
    left: -30,
    bottom: -10,
    transform: [{ rotate: "20.75deg" }],
  },
  // Left small
  decoLeftSmall: {
    width: 100,
    height: 98,
    left: -40,
    bottom: 70,
    transform: [{ rotate: "-0.2deg" }],
  },
  // Top-right large - rotated -14.27deg
  decoTopRightLarge: {
    width: 129,
    height: 127,
    right: -75,
    bottom: 80,
    transform: [{ rotate: "-14.27deg" }],
  },
  // Middle right
  decoMiddleRight: {
    width: 100,
    height: 98,
    right: -10,
    bottom: 30,
  },
  // Bottom right
  decoBottomRight: {
    width: 100,
    height: 98,
    right: -40,
    bottom: -20,
  },
});
