import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Pressable,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Fonts, Typography } from "@/constants/theme";
import { Calendar, MapPin, Ticket } from "lucide-react-native";

interface EventCardProps {
  id: number;
  title: string;
  location: string;
  distance?: string;
  eventDate: string;
  timeRange: string;
  price: number;
  imageUrl: string;
  styles: string[];
  friendsGoing?: number;
  friendsAvatars?: string[];
  onPress?: () => void;
}

export const EventCard: React.FC<EventCardProps> = ({
  title,
  location,
  distance,
  eventDate,
  timeRange,
  price,
  imageUrl,
  styles: musicStyles,
  friendsGoing = 0,
  friendsAvatars = [],
  onPress,
}) => {
  // Formatter la date (ex: "ven. 06 juin")
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.toLocaleDateString("fr-FR", { weekday: "short" });
    const dayNum = date.getDate().toString().padStart(2, "0");
    const month = date.toLocaleDateString("fr-FR", { month: "short" });
    return { day, dayNum, month };
  };

  const { day, dayNum, month } = formatDate(eventDate);

  // Afficher maximum 2 styles
  const displayStyles = musicStyles.slice(0, 2);

  return (
    <Pressable onPress={onPress} style={styles.container}>
      <ImageBackground
        source={{ uri: imageUrl }}
        style={styles.imageBackground}
        imageStyle={styles.image}
      >
        {/* Gradients overlay */}
        <LinearGradient
          colors={["rgba(0, 0, 0, 0.35)", "rgba(0, 0, 0, 0)"]}
          locations={[0, 0.29]}
          style={styles.topGradient}
        />
        <LinearGradient
          colors={["rgba(0, 0, 0, 0)", "rgba(0, 0, 0, 0.45)"]}
          locations={[0.38, 1]}
          style={styles.bottomGradient}
        />
        <LinearGradient
          colors={["rgba(0, 0, 0, 0.2)", "rgba(0, 0, 0, 0.2)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.overlayGradient}
        />

        <View style={styles.content}>
          {/* Top Row - Date & Styles */}
          <View style={styles.topRow}>
            {/* Date Badge */}
            <BlurView intensity={15} style={styles.dateBadge}>
              <Text style={styles.dateDay}>{day}</Text>
              <Text style={styles.dateDayNum}>{dayNum}</Text>
              <Text style={styles.dateMonth}>{month}</Text>
            </BlurView>

            {/* Music Styles */}
            <View style={styles.stylesContainer}>
              {displayStyles.map((style, index) => (
                <BlurView key={index} intensity={15} style={styles.styleBadge}>
                  <Text style={styles.styleText}>{style}</Text>
                </BlurView>
              ))}
            </View>
          </View>
        </View>

        {/* Bottom Info Section */}
        <BlurView intensity={15} style={styles.bottomSection}>
          <View style={styles.infoLeft}>
            <Text style={styles.eventTitle} numberOfLines={1}>
              {title}
            </Text>
            <View style={styles.eventDetails}>
              <View style={styles.detailRow}>
                <Calendar size={12} color="#D7D7D7" />
                <Text style={styles.detailText}>{timeRange}</Text>
              </View>
              <View style={styles.detailRow}>
                <MapPin size={12} color="#D7D7D7" />
                <Text style={styles.detailText}>
                  {location}
                  {distance && ` - ${distance}`}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.infoRight}>
            {/* Price */}
            <View style={styles.priceRow}>
              <Ticket size={12} color="#FC5F67" />
              <Text style={styles.priceText}>
                {price.toFixed(2).replace(".", ",")}€
              </Text>
            </View>

            {/* Friends Going */}
            {friendsGoing > 0 && (
              <View style={styles.friendsRow}>
                <View style={styles.avatarsContainer}>
                  {friendsAvatars.slice(0, 3).map((avatar, index) => (
                    <Image
                      key={index}
                      source={{ uri: avatar }}
                      style={[
                        styles.avatar,
                        { marginLeft: index > 0 ? -13 : 0 },
                      ]}
                    />
                  ))}
                </View>
                <Text style={styles.friendsText}>
                  {friendsGoing} ami.e.s y vont
                </Text>
              </View>
            )}
          </View>
        </BlurView>
      </ImageBackground>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 355,
    height: 200,
    borderRadius: 20,
    overflow: "hidden",
  },
  imageBackground: {
    width: "100%",
    height: "100%",
  },
  image: {
    borderRadius: 20,
  },
  topGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "29%",
    borderRadius: 20,
  },
  bottomGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "62%",
    borderRadius: 20,
  },
  overlayGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
  },
  content: {
    flex: 1,
    padding: 10,
    justifyContent: "flex-start",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  dateBadge: {
    width: 54,
    height: 54,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  dateDay: {
    fontFamily: Fonts.bold,
    fontSize: 10,
    color: "#FFFFFF",
    letterSpacing: -0.4,
    textAlign: "center",
  },
  dateMonth: {
    fontFamily: Fonts.bold,
    fontSize: 10,
    color: "#FFFFFF",
    letterSpacing: -0.4,
    textAlign: "center",
  },
  dateDayNum: {
    ...Typography.body,
    fontSize: 20,
    color: "#FFFFFF",
    letterSpacing: -0.8,
    textAlign: "center",
    marginTop: -4,
    marginBottom: -6,
  },
  stylesContainer: {
    flexDirection: "row",
    gap: 5,
    flexWrap: "wrap",
  },
  styleBadge: {
    padding: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    overflow: "hidden",
    justifyContent: "center",
  },
  styleText: {
    fontFamily: Fonts.bold,
    fontSize: 10,
    color: "#FFFFFF",
    letterSpacing: -0.4,
  },
  bottomSection: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 74,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    overflow: "hidden",
  },
  infoLeft: {
    flex: 1,
    gap: 2,
  },
  eventTitle: {
    fontFamily: Fonts.extraBold,
    fontSize: 14,
    color: "#FFFFFF",
    letterSpacing: -0.56,
  },
  eventDetails: {
    gap: 3,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  detailText: {
    fontFamily: Fonts.bold,
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.7)",
    letterSpacing: -0.4,
  },
  infoRight: {
    width: 139,
    height: 46,
    gap: 5,
    alignItems: "flex-end",
    justifyContent: "flex-end",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  priceText: {
    fontFamily: Fonts.extraBold,
    fontSize: 12,
    color: "#FC5F67",
    letterSpacing: -0.48,
  },
  friendsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  avatarsContainer: {
    flexDirection: "row",
    paddingRight: 13,
  },
  avatar: {
    width: 25,
    height: 25,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#FFFFFF",
  },
  friendsText: {
    fontFamily: Fonts.regular,
    fontSize: 10,
    color: "#FFFFFF",
    letterSpacing: -0.4,
  },
});
