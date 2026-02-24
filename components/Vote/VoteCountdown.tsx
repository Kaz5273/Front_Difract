import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Fonts } from "@/constants/theme";

interface VoteCountdownProps {
  endDate: Date;
  compact?: boolean;
}

export const VoteCountdown: React.FC<VoteCountdownProps> = ({ endDate, compact = false }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = endDate.getTime() - new Date().getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  const formatNumber = (num: number) => num.toString().padStart(2, "0");

  const timeString = `${formatNumber(timeLeft.days)}j ${formatNumber(
    timeLeft.hours
  )}h ${formatNumber(timeLeft.minutes)}m ${formatNumber(timeLeft.seconds)}s`;

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      <Text style={[styles.label, compact && styles.labelCompact]}>
        {compact ? "Temps restants" : "Temps restants avant la fin des votes"}
      </Text>
      <View style={styles.timerBadge}>
        <Text style={[styles.timerText, compact && styles.timerTextCompact]}>
          {timeString}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 40,
    paddingHorizontal: 10,
  },
  label: {
    fontFamily: Fonts.bold,
    fontSize: 12,
    color: "#FFFFFF",
    letterSpacing: -0.4,
    flex: 1,
    
  },
  timerBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 15,
    padding: 8,
    minWidth: 110,
    alignItems: "center",
    justifyContent: "center",
  },
  timerText: {
    fontFamily: Fonts.extraBold,
    fontSize: 12,
    textAlign: "center",
    color: "#FFFFFF",
    letterSpacing: -0.48,
  },
  containerCompact: {
    justifyContent: "center",
    gap: 5,
    paddingHorizontal: 0,
  },
  labelCompact: {
    flex: 0,
    fontSize: 14,
    letterSpacing: -0.56,
  },
  timerTextCompact: {
    fontSize: 14,
    letterSpacing: -0.28,
    
  },
});

export default VoteCountdown;
