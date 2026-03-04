import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Clock } from "lucide-react-native";
import { Fonts } from "@/constants/theme";

interface VoteCountdownProps {
  endDate: Date;
}

export const VoteCountdown: React.FC<VoteCountdownProps> = ({ endDate }) => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = endDate.getTime() - new Date().getTime();

      if (difference > 0) {
        const totalHours = Math.floor(difference / (1000 * 60 * 60));
        setTimeLeft({
          hours: totalHours,
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

  const timeString = `${formatNumber(timeLeft.hours)}:${formatNumber(
    timeLeft.minutes
  )}:${formatNumber(timeLeft.seconds)}`;

  return (
    <View style={styles.container}>
      <Clock size={20} color="#FC5F67" />
      <Text style={styles.timerText}>{timeString}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#402123",
    borderRadius: 10,
    paddingHorizontal: 8,
    height: 30,
  },
  timerText: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: "#FC5F67",
    letterSpacing: -0.24,
  },
});

export default VoteCountdown;
