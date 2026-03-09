import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Clock } from "lucide-react-native";
import { Fonts } from "@/constants/theme";

interface VoteCountdownProps {
  secondsRemaining: number;
}

export const VoteCountdown: React.FC<VoteCountdownProps> = ({ secondsRemaining }) => {
  const [remaining, setRemaining] = useState(Math.max(0, secondsRemaining));

  useEffect(() => {
    const initial = Math.max(0, secondsRemaining);
    setRemaining(initial);

    if (initial <= 0) return;

    const startedAt = Date.now();
    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      const next = Math.max(0, initial - elapsed);
      setRemaining(next);
      if (next <= 0) clearInterval(timer);
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsRemaining]);

  const days = Math.floor(remaining / 86400);
  const hours = Math.floor((remaining % 86400) / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  const seconds = remaining % 60;

  const pad = (n: number) => n.toString().padStart(2, "0");

  const timeString =
    days > 0
      ? `${days}j ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
      : `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

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
