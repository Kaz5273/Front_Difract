import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  ImageBackground,
} from "react-native";
import { BlurView } from "expo-blur";
import { Fonts } from "@/constants/theme";
import { Calendar, Clock, MapPin } from "lucide-react-native";
import { router } from "expo-router";
import { StyleBadges } from "@/components/Badges/StyleBadges";
import { EarlyAccessBadge } from "@/components/Badges/EarlyAccessBadge";

type TicketTier = "early_access" | "standard" | "last_minute";

const TIER_PRICES: Record<TicketTier, number> = {
  early_access: 20,
  standard: 25,
  last_minute: 30,
};

const DAY_MS = 24 * 60 * 60 * 1000;

const toDay = (ms: number) => Math.floor(ms / DAY_MS) * DAY_MS;

function getActiveTicketSale(
  votingEndDate: string | null | undefined,
  eventDate: string
): { tier: TicketTier; price: number } | null {
  const now = toDay(Date.now());
  const event = toDay(new Date(eventDate).getTime());

  if (votingEndDate) {
    const votingEnd = toDay(new Date(votingEndDate).getTime());
    if (now >= votingEnd && now <= votingEnd + 5 * DAY_MS)
      return { tier: "early_access", price: TIER_PRICES.early_access };
  }
  if (now >= event - 20 * DAY_MS && now <= event - 5 * DAY_MS)
    return { tier: "standard", price: TIER_PRICES.standard };
  if (now >= event - 4 * DAY_MS && now <= event)
    return { tier: "last_minute", price: TIER_PRICES.last_minute };
  return null;
}

interface EventCardProps {
  id: number;
  title: string;
  location: string;
  distance?: string;
  eventDate: string;
  timeRange: string;
  imageUrl: string;
  styles: string[];
  isVotingOpen?: boolean;
  votingEndDate?: string | null;
  friendsGoing?: number;
  friendsAvatars?: string[];
  purchasedTier?: TicketTier;
  purchasedPrice?: number;
  onPress?: () => void;
}

export const EventCard: React.FC<EventCardProps> = ({
  id,
  title,
  location,
  distance,
  eventDate,
  timeRange,
  imageUrl,
  styles: musicStyles,
  isVotingOpen = true,
  votingEndDate,
  friendsAvatars = [],
  purchasedTier,
  purchasedPrice,
  onPress,
}) => {
  const activeSale = purchasedTier
    ? { tier: purchasedTier, price: purchasedPrice ?? 0 }
    : !isVotingOpen ? getActiveTicketSale(votingEndDate, eventDate) : null;
  const formatShortDate = (dateString: string) => {
    const date = new Date(dateString);
    const dayNum = date.getDate();
    const month = date.toLocaleDateString("fr-FR", { month: "long" });
    const year = date.getFullYear();
    return `${dayNum} ${month.charAt(0).toUpperCase() + month.slice(1)} ${year}`;
  };

  const formatFullDate = (dateString: string) => {
    const date = new Date(dateString);
    const weekday = date.toLocaleDateString("fr-FR", { weekday: "long" });
    const dayNum = date.getDate();
    const month = date.toLocaleDateString("fr-FR", { month: "long" });
    const year = date.getFullYear();
    return `${weekday.charAt(0).toUpperCase() + weekday.slice(1)} ${dayNum} ${month.charAt(0).toUpperCase() + month.slice(1)} ${year}`;
  };

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/event/${id}`);
    }
  };

  return (
    <Pressable onPress={handlePress} style={styles.container}>
      {/* Header: Title + Early Access Badge */}
      <View style={styles.headerRow}>
        <Text style={styles.eventTitle} numberOfLines={1}>
          {title}
        </Text>
        {activeSale && (
          <EarlyAccessBadge price={activeSale.price} tier={activeSale.tier} />
        )}
      </View>

      {/* Image Section */}
      <View style={styles.imageContainer}>
        <ImageBackground
          source={{ uri: imageUrl }}
          style={styles.imageBackground}
          imageStyle={styles.imageStyle}
        >
          {/* Top overlay badges */}
          <View style={styles.imageTopRow}>
            {/* Date pill */}
            <BlurView intensity={40} tint="dark" style={styles.datePill}>
              <Calendar size={12} color="#FFFFFF" />
              <Text style={styles.datePillText}>{formatShortDate(eventDate)}</Text>
            </BlurView>

            {/* Style pills — 1 badge max + "+N" pour éviter le débordement */}
            <StyleBadges styles={musicStyles} maxVisible={1} />
          </View>

          {/* Bottom info section */}
          <BlurView intensity={25} tint="dark" style={styles.bottomSection}>
            <View style={styles.bottomContent}>
              {/* Left: date, time, location */}
              <View style={styles.infoLeft}>
                <View style={styles.infoRow}>
                  <Calendar size={12} color="#FFFFFF" />
                  <Text style={styles.infoText}>{formatFullDate(eventDate)}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Clock size={12} color="#FFFFFF" />
                  <Text style={styles.infoText}>{timeRange}</Text>
                </View>
                <View style={styles.infoRow}>
                  <MapPin size={12} color="#FFFFFF" />
                  <Text style={styles.infoText}>
                    {location}
                    {distance ? ` - ${distance}` : ""}
                  </Text>
                </View>
              </View>

              {/* Right: artist avatars */}
              {friendsAvatars.length > 0 && (
                <View style={styles.avatarsWrapper}>
                  <View style={styles.avatarsContainer}>
                    {friendsAvatars.slice(0, 3).map((avatar, index) => (
                      <Image
                        key={index}
                        source={{ uri: avatar }}
                        style={[
                          styles.avatar,
                          { marginLeft: index > 0 ? -13 : 0, zIndex: 3 - index },
                        ]}
                      />
                    ))}
                  </View>
                </View>
              )}
            </View>
          </BlurView>
        </ImageBackground>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    gap: 12,
  },
  // Header row
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
  eventTitle: {
    fontFamily: Fonts.regular,
    fontSize: 16,
    color: "#FFFFFF",
    letterSpacing: -0.32,
    flex: 1,
  },
  // Image section
  imageContainer: {
    width: "100%",
    borderRadius: 20,
    overflow: "hidden",
  },
  imageBackground: {
    width: "100%",
  },
  imageStyle: {
    borderRadius: 20,
  },
  // Top overlay
  imageTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 8,
    height: 94,
  },
  datePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    height: 30,
    paddingHorizontal: 8,
    borderRadius: 25,
    overflow: "hidden",
    backgroundColor: "rgba(26, 26, 26, 0.8)",
  },
  datePillText: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    color: "#FFFFFF",
    letterSpacing: -0.24,
  },
  // Bottom info section
  bottomSection: {
    width: "100%",
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "rgba(26, 26, 26, 0.8)",
  },
  bottomContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 16,
  },
  infoLeft: {
    flex: 1,
    gap: 6,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  infoText: {
    fontFamily: Fonts.bold,
    fontSize: 12,
    color: "#FFFFFF",
    letterSpacing: -0.24,
  },
  // Avatars
  avatarsWrapper: {
    justifyContent: "flex-end",
    alignItems: "flex-end",
    alignSelf: "flex-end",
  },
  avatarsContainer: {
    flexDirection: "row",
  },
  avatar: {
    width: 25,
    height: 25,
    borderRadius: 51,
  },
});
