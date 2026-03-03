import { Fonts } from "@/constants/theme";
import { Pencil, X } from "lucide-react-native";
import React, { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const SOCIAL_NETWORKS = [
  { key: "soundcloud", label: "SoundCloud", icon: "logo-soundcloud" as const },
  { key: "spotify", label: "Spotify", icon: "logo-spotify" as const },
  { key: "instagram", label: "Instagram", icon: "logo-instagram" as const },
  { key: "facebook", label: "Facebook", icon: "logo-facebook" as const },
  { key: "tiktok", label: "TikTok", icon: "logo-tiktok" as const },
  { key: "youtube", label: "YouTube", icon: "logo-youtube" as const },
  { key: "twitter", label: "Twitter / X", icon: "logo-twitter" as const },
  { key: "website", label: "Site web", icon: "globe-outline" as const },
];

export type SocialLinks = Record<string, string>;

interface StepSocialLinksProps {
  links: SocialLinks;
  onUpdate: (links: SocialLinks) => void;
}

function SocialRow({
  network,
  url,
  onChangeUrl,
  onBlurUrl,
  onClear,
}: {
  network: (typeof SOCIAL_NETWORKS)[number];
  url: string;
  onChangeUrl: (url: string) => void;
  onBlurUrl: () => void;
  onClear: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const hasUrl = url.length > 0;

  return (
    <View style={styles.row}>
      {/* Remove button */}
      <Pressable
        onPress={hasUrl ? onClear : undefined}
        style={[styles.actionButton, !hasUrl && styles.actionButtonDisabled]}
      >
        <X
          size={20}
          color={hasUrl ? "#FFFFFF" : "rgba(255,255,255,0.3)"}
        />
      </Pressable>

      {/* Bar */}
      <View style={styles.bar}>
        {isEditing ? (
          <TextInput
            style={styles.urlInput}
            value={url}
            onChangeText={onChangeUrl}
            onBlur={() => {
              onBlurUrl();
              setIsEditing(false);
            }}
            placeholder={`Lien ${network.label}...`}
            placeholderTextColor="rgba(255,255,255,0.3)"
            autoFocus
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />
        ) : (
          <Text style={[styles.label, hasUrl && styles.labelFilled]} numberOfLines={1}>
            {hasUrl ? url : network.label}
          </Text>
        )}

        {/* Edit button */}
        <Pressable
          onPress={() => setIsEditing(!isEditing)}
          style={styles.editButton}
        >
          <Pencil size={14} color="#FFFFFF" />
        </Pressable>
      </View>
    </View>
  );
}

export function StepSocialLinks({
  links,
  onUpdate,
}: StepSocialLinksProps) {
  const filledCount = Object.values(links).filter((v) => v.length > 0).length;

  const handleChangeUrl = (key: string, url: string) => {
    onUpdate({ ...links, [key]: url });
  };

  /**
   * Normalise les URLs au blur : ajoute https:// si manquant
   */
  const handleBlurUrl = (key: string) => {
    const url = links[key];
    if (url && url.length > 0 && !/^https?:\/\//i.test(url)) {
      onUpdate({ ...links, [key]: `https://${url}` });
    }
  };

  const handleClear = (key: string) => {
    const updated = { ...links };
    delete updated[key];
    onUpdate(updated);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upload vos réseaux</Text>
      <Text style={styles.subtitle}>
        Ajoutez vos liens vers vos différents réseaux sociaux !
      </Text>

      {/* Network list */}
      <View style={styles.list}>
        {SOCIAL_NETWORKS.map((network) => (
          <SocialRow
            key={network.key}
            network={network}
            url={links[network.key] || ""}
            onChangeUrl={(url) => handleChangeUrl(network.key, url)}
            onBlurUrl={() => handleBlurUrl(network.key)}
            onClear={() => handleClear(network.key)}
          />
        ))}
      </View>

      {/* Counter */}
      <Text style={styles.counterText}>
        Vous avez uploadé {filledCount} réseaux
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 16,
  },
  title: {
    fontSize: 17,
    fontFamily: Fonts.extraBold,
    color: "#FFFFFF",
    textAlign: "center",
    letterSpacing: -0.34,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: Fonts.bold,
    color: "#b6b6b6",
    textAlign: "center",
    letterSpacing: -0.3,
    maxWidth: 321,
  },

  // List
  list: {
    width: 313,
    gap: 12,
    marginTop: 8,
  },

  // Row
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    height: 44,
  },
  actionButton: {
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  actionButtonDisabled: {
    opacity: 0.4,
  },
  bar: {
    flex: 1,
    backgroundColor: "#161616",
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: 15,
    paddingRight: 5,
    paddingVertical: 8,
    gap: 10,
  },
  label: {
    flex: 1,
    fontSize: 15,
    fontFamily: Fonts.bold,
    color: "rgba(255, 255, 255, 0.7)",
    letterSpacing: -0.6,
  },
  labelFilled: {
    color: "#FFFFFF",
  },
  urlInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: Fonts.bold,
    color: "#FFFFFF",
    letterSpacing: -0.6,
    padding: 0,
  },
  editButton: {
    width: 32,
    height: 32,
    borderRadius: 32,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },

  // Counter
  counterText: {
    fontSize: 15,
    fontFamily: Fonts.bold,
    color: "#b6b6b6",
    marginTop: 8,
  },
});
