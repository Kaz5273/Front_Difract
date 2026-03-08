import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  Pressable,
  View,
  Text,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { BlurView } from "expo-blur";
import { ChevronLeft, Pencil, MapPin } from "lucide-react-native";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { ImageCarousel } from "@/components/Artist/ImageCarousel";
import { ArtistAbout } from "@/components/Artist/ArtistAbout";
import { MusicPlayer } from "@/components/Artist/MusicPlayer";
import { VideoClip } from "@/components/Artist/VideoClip";
import { GlobalAudioPlayer } from "@/components/GlobalAudioPlayer";
import { Fonts } from "@/constants/theme";
import { useAuth } from "@/hooks/use-auth";
import { userService } from "@/services/user/user.service";
import {
  subscriptionService,
  type SubscriptionStatusResponse,
} from "@/services/subscription/subscription.service";
import { getMediaUrl } from "@/services/api/client";
import type { Media, SocialLink, MediaGrouped } from "@/services/api/types";

const SOCIAL_COLORS: Record<string, string> = {
  spotify: "#1DB954",
  youtube: "#FF0000",
  soundcloud: "#FF5500",
  tiktok: "#FFFFFF",
  twitter: "#1DA1F2",
  instagram: "#E4405F",
  facebook: "#1877F2",
  website: "#FFFFFF",
};

function EditButton({ onPress }: { onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.editButton}>
      <Pencil size={18} color="#111111" />
    </Pressable>
  );
}

function SubscriptionBadge({ plan }: { plan: string | null }) {
  if (!plan) return null;
  const isPro = plan === "pro";
  return (
    <View
      style={[
        styles.subscriptionBadge,
        { backgroundColor: isPro ? "#F9F871" : "#FC5F67" },
      ]}
    >
      <Text
        style={[
          styles.subscriptionBadgeText,
          { color: isPro ? "#111111" : "#FFFFFF" },
        ]}
      >
        {isPro ? "PRO" : "STANDARD"}
      </Text>
    </View>
  );
}

export default function ArtistProfileManageScreen() {
  const { user, updateUser } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [cityModalVisible, setCityModalVisible] = useState(false);
  const [cityInput, setCityInput] = useState("");
  const [cityLoading, setCityLoading] = useState(false);
  const [mediaGrouped, setMediaGrouped] = useState<MediaGrouped | null>(null);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [subscription, setSubscription] =
    useState<SubscriptionStatusResponse | null>(null);

  const loadData = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const [mediaRes, socialRes, subRes] = await Promise.allSettled([
        userService.getMedia(),
        userService.getSocialLinks(user.id),
        subscriptionService.getStatus(),
      ]);

      if (mediaRes.status === "fulfilled") setMediaGrouped(mediaRes.value);
      if (socialRes.status === "fulfilled") setSocialLinks(socialRes.value);
      if (subRes.status === "fulfilled") setSubscription(subRes.value);
    } catch (err) {
      console.error("Failed to load artist profile data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // --- Build gallery image URLs from media ---
  const galleryImages: string[] = [];
  if (mediaGrouped?.profile_picture) {
    const url = getMediaUrl(mediaGrouped.profile_picture);
    if (url) galleryImages.push(url);
  }
  if (mediaGrouped?.gallery) {
    for (const m of mediaGrouped.gallery) {
      const url = getMediaUrl(m);
      if (url) galleryImages.push(url);
    }
  }
  if (galleryImages.length === 0 && user?.media_url) {
    galleryImages.push(user.media_url);
  }

  // --- Build tracks for MusicPlayer ---
  const tracks =
    mediaGrouped?.tracks?.map((t) => ({
      id: String(t.id),
      title: extractTrackName(t),
      duration: "",
      url: getMediaUrl(t) ?? undefined,
    })) ?? [];

  // --- Build intro video ---
  const introVideo = mediaGrouped?.intro_video;
  const introVideoUrl = introVideo ? getMediaUrl(introVideo) : null;

  // --- Subscription plan ---
  const plan = subscription?.subscribed
    ? (subscription.subscription?.plan ?? null)
    : null;

  const handleEditCity = () => {
    setCityInput(user?.city ?? "");
    setCityModalVisible(true);
  };

  const handleSaveCity = async () => {
    if (!user) return;
    setCityLoading(true);
    try {
      const updated = await userService.updateProfile(user.id, { city: cityInput.trim() });
      updateUser({ ...user, ...updated });
      setCityModalVisible(false);
    } catch {
      Alert.alert("Erreur", "Impossible de mettre à jour la ville.");
    } finally {
      setCityLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F9F871" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Back button */}
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <BlurView intensity={15} style={styles.backButtonBlur}>
          <ChevronLeft size={24} color="#FFFFFF" />
        </BlurView>
      </Pressable>

      <ParallaxScrollView
        headerBackgroundColor={{ light: "#111111", dark: "#111111" }}
        showsVerticalScrollIndicator={false}
        headerImage={
          <ImageCarousel
            images={
              galleryImages.length > 0
                ? galleryImages
                : ["https://via.placeholder.com/800x600/2A2A2A/666?text=+"]
            }
            showFavoriteButton={false}
          />
        }
      >
        <ThemedView style={styles.contentContainer}>
          {/* Artist name + subscription badge + edit */}
          <View style={styles.sectionRow}>
            <View style={{ flex: 1, gap: 6 }}>
              <ThemedText style={styles.artistName}>
                {user?.name ?? "Artiste"}
                <SubscriptionBadge plan={plan} />
              </ThemedText>
              
            </View>
            <EditButton />
          </View>

          {/* City + edit */}
          <View style={styles.sectionRow}>
            <View style={styles.cityBadge}>
              <MapPin size={14} color="#FFFFFF" />
              <Text style={styles.cityText}>
                {user?.city || "Ville non renseignée"}
              </Text>
            </View>
            <EditButton onPress={handleEditCity} />
          </View>

          {/* Music player + edit */}
          {tracks.length > 0 && (
            <View style={styles.sectionRow}>
              <View style={{ flex: 1 }}>
                <MusicPlayer
                  tracks={tracks}
                  artistName={user?.name ?? ""}
                  artistImage={galleryImages[0] ?? ""}
                />
              </View>
              <EditButton />
            </View>
          )}

          {/* About + edit */}
          <View style={styles.sectionRow}>
            <View style={{ flex: 1 }}>
              <ArtistAbout
                description={user?.bio ?? "Aucune biographie renseignée."}
              />
            </View>
            <EditButton />
          </View>

          {/* Video clip + edit */}
          <View style={styles.sectionRow}>
            <View style={{ flex: 1 }}>
              {introVideoUrl ? (
                <VideoClip
                  videoUrl={introVideoUrl}
                  thumbnailUrl={introVideoUrl}
                  videoType="local"
                />
              ) : (
                <View>
                  <ThemedText style={styles.sectionTitle}>Extrait</ThemedText>
                  <View style={styles.emptySection}>
                    <Text style={styles.emptyText}>
                      Aucune vidéo d'introduction
                    </Text>
                  </View>
                </View>
              )}
            </View>
            <EditButton />
          </View>

          {/* Social networks + edit */}
          <View style={styles.sectionRow}>
            <View style={{ flex: 1 }}>
              <ThemedText style={styles.sectionTitle}>
                Réseaux sociaux
              </ThemedText>
              {socialLinks.length > 0 ? (
                <View style={styles.socialsGrid}>
                  {socialLinks.map((social) => (
                    <View key={social.id} style={styles.socialItem}>
                      <View
                        style={[
                          styles.socialDot,
                          {
                            backgroundColor:
                              SOCIAL_COLORS[social.platform] || "#FFFFFF",
                          },
                        ]}
                      />
                      <Text style={styles.socialHandle} numberOfLines={1}>
                        {extractHandle(social.url)}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.emptySection}>
                  <Text style={styles.emptyText}>
                    Aucun réseau social renseigné
                  </Text>
                </View>
              )}
            </View>
            <EditButton />
          </View>

          {/* FAQ footer */}
          <View style={styles.faqFooter}>
            <Text style={styles.faqText}>
              Vous ne trouvez pas votre bonheur ? Des questions ?
            </Text>
            <Pressable>
              <Text style={styles.faqLink}>Rendez-vous dans notre FAQ.</Text>
            </Pressable>
          </View>
        </ThemedView>
      </ParallaxScrollView>

      <GlobalAudioPlayer forceShow={true} bottomPosition={25} />

      {/* Modal édition ville */}
      <Modal
        visible={cityModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCityModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Modifier la ville</Text>
            <TextInput
              style={styles.modalInput}
              value={cityInput}
              onChangeText={setCityInput}
              placeholder="Ex: Paris"
              placeholderTextColor="#666666"
              autoFocus
            />
            <View style={styles.modalActions}>
              <Pressable style={styles.modalCancel} onPress={() => setCityModalVisible(false)}>
                <Text style={styles.modalCancelText}>Annuler</Text>
              </Pressable>
              <Pressable style={styles.modalSave} onPress={handleSaveCity} disabled={cityLoading}>
                <Text style={styles.modalSaveText}>
                  {cityLoading ? "..." : "Enregistrer"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/** Extract a display name from a media track (filename without extension) */
function extractTrackName(media: Media): string {
  const path = media.path || media.url || "";
  const filename = path.split("/").pop() || "Track";
  return filename.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ");
}

/** Extract @handle from a full URL */
function extractHandle(url: string): string {
  try {
    const parsed = new URL(url);
    const parts = parsed.pathname.split("/").filter(Boolean);
    const last = parts[parts.length - 1];
    return last ? `@${last}` : url;
  } catch {
    return url;
  }
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: "#111111",
    justifyContent: "center",
    alignItems: "center",
  },
  backButton: {
    position: "absolute",
    top: 60,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 50,
    overflow: "hidden",
    zIndex: 10,
  },
  backButtonBlur: {
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingRight: 2,
  },
  contentContainer: {
    gap: 24,
    backgroundColor: "#111111",
  },
  sectionRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    
    gap: 12,
  },
  artistName: {
    fontFamily: Fonts.extraBold,
    fontSize: 25,
    lineHeight: 32,
  },
  sectionTitle: {
    fontFamily: Fonts.normalBlack,
    fontSize: 17,
    lineHeight: 17,
    letterSpacing: -0.68,
    color: "#FFFFFF",
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F9F871",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  // Subscription badge
  subscriptionBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  subscriptionBadgeText: {
    fontFamily: Fonts.semiBold,
    fontSize: 11,
    letterSpacing: -0.22,
  },
  // Social networks
  socialsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 12,
    gap: 8,
    rowGap: 12,
  },
  socialItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    width: "48%",
  },
  socialDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  socialHandle: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: "#FFFFFF",
    letterSpacing: -0.24,
    flex: 1,
  },
  // Empty states
  emptySection: {
    marginTop: 12,
    paddingVertical: 16,
    borderRadius: 10,
    backgroundColor: "#212121",
    alignItems: "center",
  },
  emptyText: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: "#888888",
    letterSpacing: -0.26,
  },
  // City badge
  cityBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
    paddingVertical: 8,
  },
  cityText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: "#FFFFFF",
    letterSpacing: -0.28,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  modalBox: {
    width: "100%",
    backgroundColor: "#1E1E1E",
    borderRadius: 16,
    padding: 24,
    gap: 16,
  },
  modalTitle: {
    fontFamily: Fonts.regular,
    fontSize: 16,
    color: "#FFFFFF",
    letterSpacing: -0.32,
  },
  modalInput: {
    backgroundColor: "#2A2A2A",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: "#FFFFFF",
    letterSpacing: -0.28,
  },
  modalActions: {
    flexDirection: "row",
    gap: 10,
  },
  modalCancel: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#2A2A2A",
    alignItems: "center",
  },
  modalCancelText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: "#FFFFFF",
  },
  modalSave: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#F9F871",
    alignItems: "center",
  },
  modalSaveText: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: "#111111",
  },
  // FAQ footer
  faqFooter: {
    alignItems: "center",
    marginTop: 16,
    paddingBottom: 40,
    gap: 2,
  },
  faqText: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: "#888888",
    textAlign: "center",
    letterSpacing: -0.24,
  },
  faqLink: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    color: "#FFFFFF",
    textAlign: "center",
    letterSpacing: -0.24,
    textDecorationLine: "underline",
  },
});
