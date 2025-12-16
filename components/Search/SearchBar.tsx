import React from "react";
import { View, TextInput, StyleSheet, Pressable } from "react-native";
import { Search } from "lucide-react-native";
import { Fonts } from "@/constants/theme";

interface SearchBarProps {
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  onPress?: () => void;
  editable?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = "Artistes, morceaux, lieux, ect.",
  onPress,
  editable = true,
}) => {
  const content = (
    <View style={styles.container}>
      <Search size={18} color="#8a8a8a" strokeWidth={2} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#8a8a8a"
        editable={editable}
        pointerEvents={onPress ? "none" : "auto"}
      />
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={styles.pressable}>
        {content}
      </Pressable>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  pressable: {
    width: "100%",
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 253, 0.08)",
    borderRadius: 26,
  },
  input: {
    flex: 1,
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: "#FFFFFF",
    letterSpacing: -0.48,
    padding: 0,
    margin: 0,
  },
});

export default SearchBar;
