import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  ImageBackground,
  Modal,
} from "react-native";
import { Play, X } from "lucide-react-native";
import * as WebBrowser from "expo-web-browser";
import { ThemedText } from "@/components/themed-text";
import { Fonts } from "@/constants/theme";
import { VideoView, useVideoPlayer } from "expo-video";
import { BlurView } from "expo-blur";

interface VideoClipProps {
  videoUrl?: string | number; // string pour URL, number pour require()
  thumbnailUrl: string;
  videoType?: "youtube" | "local"; // Type de vidéo
}

export function VideoClip({
  videoUrl,
  thumbnailUrl,
  videoType = "youtube",
}: VideoClipProps) {
  const [showVideoModal, setShowVideoModal] = useState(false);

  // Créer le player vidéo avec expo-video
  const player = useVideoPlayer(videoUrl && videoType === "local" ? videoUrl : null, (player) => {
    player.loop = false;
  });

  // Si pas de vidéo, ne rien afficher
  if (!videoUrl) {
    return null;
  }

  // Fonction pour ouvrir la vidéo
  const handleOpenVideo = async () => {
    if (videoType === "youtube") {
      // Ouvrir YouTube dans un navigateur in-app (même style que Lemon Squeezy)
      await WebBrowser.openBrowserAsync(String(videoUrl), {
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.FORM_SHEET,
        dismissButtonStyle: "close",
        toolbarColor: "#080808",
        controlsColor: "#FFFFFF",
      });
    } else {
      // Ouvrir la vidéo locale dans un modal
      setShowVideoModal(true);
      player.play();
    }
  };

  const closeVideoModal = () => {
    // Arrêter la vidéo avant de fermer
    player.pause();
    setShowVideoModal(false);
  };

  return (
    <>
      <View style={styles.container}>
        {/* Titre de la section */}
        <ThemedText style={styles.sectionTitle}>Extrait</ThemedText>

        {/* Vidéo avec thumbnail */}
        <Pressable onPress={handleOpenVideo} style={styles.videoContainer}>
          <ImageBackground
            source={{ uri: thumbnailUrl }}
            style={styles.thumbnail}
            imageStyle={styles.thumbnailImage}
          >
            {/* Bouton Play au centre */}
            <View style={styles.playButtonContainer}>
              <View style={styles.playButton}>
                <Play size={28} color="#FFFFFF" fill="#FFFFFF" />
              </View>
            </View>
          </ImageBackground>
        </Pressable>
      </View>

      {/* Modal pour la vidéo locale uniquement */}
      {videoType === "local" && (
        <Modal
          visible={showVideoModal}
          transparent={true}
          animationType="fade"
          onRequestClose={closeVideoModal}
        >
          <View style={styles.modalContainer}>
            <BlurView intensity={95} style={styles.modalBlur}>
              {/* Bouton fermer */}
              <Pressable style={styles.closeButton} onPress={closeVideoModal}>
                <BlurView intensity={15} style={styles.closeButtonBlur}>
                  <X size={24} color="#FFFFFF" />
                </BlurView>
              </Pressable>

              {/* Lecteur vidéo */}
              <View style={styles.videoPlayerContainer}>
                <VideoView
                  player={player}
                  style={styles.videoPlayer}
                  nativeControls={true}
                  contentFit="contain"
                  allowsPictureInPicture={false}
                />
              </View>
            </BlurView>
          </View>
        </Modal>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 15,
  },
  sectionTitle: {
    fontFamily: Fonts.extraBold,
    fontSize: 22,
    lineHeight: 25,
    letterSpacing: -1,
    color: "#FFFFFF",
  },
  videoContainer: {
    width: "100%",
    aspectRatio: 16 / 9,
    borderRadius: 15,
    overflow: "hidden",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  thumbnailImage: {
    borderRadius: 15,
  },
  playButtonContainer: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -29.5 }, { translateY: -29.5 }],
  },
  playButton: {
    width: 59,
    height: 59,
    borderRadius: 35,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.9)",
  },
  modalBlur: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  closeButton: {
    position: "absolute",
    top: 60,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: "hidden",
    zIndex: 10,
  },
  closeButtonBlur: {
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  videoPlayerContainer: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "#000000",
    borderRadius: 15,
    overflow: "hidden",
  },
  videoPlayer: {
    width: "100%",
    height: "100%",
  },
});
