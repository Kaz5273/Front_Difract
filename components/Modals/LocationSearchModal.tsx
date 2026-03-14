import { Fonts } from "@/constants/theme";
import { X } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface LocationResult {
  id: string;
  label: string;
  city: string;
  region?: string;
  country?: string;
  latitude: number;
  longitude: number;
}

interface LocationSearchModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectLocation: (city: string, coords: { latitude: number; longitude: number }) => void;
}

async function searchLocations(query: string): Promise<LocationResult[]> {
  if (!query.trim()) return [];
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=6&featuretype=city,town,village`;
    const res = await fetch(url, {
      headers: { "Accept-Language": "fr", "User-Agent": "DifractApp/1.0" },
    });
    const data = await res.json();
    const seen = new Set<string>();
    return data
      .filter((item: any) => item.address?.city || item.address?.town || item.address?.village || item.address?.municipality)
      .reduce((acc: LocationResult[], item: any, idx: number) => {
        const city = item.address?.city || item.address?.town || item.address?.village || item.address?.municipality || "";
        const region = item.address?.state || item.address?.county || "";
        const country = item.address?.country || "";
        const parts = [city, region, country].filter(Boolean);
        const label = parts.join(", ");
        if (seen.has(label)) return acc;
        seen.add(label);
        acc.push({ id: String(item.place_id ?? idx), label, city, region, country, latitude: parseFloat(item.lat), longitude: parseFloat(item.lon) });
        return acc;
      }, []);
  } catch {
    return [];
  }
}

export function LocationSearchModal({
  visible,
  onClose,
  onSelectLocation,
}: LocationSearchModalProps) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<LocationResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (!visible) {
      setQuery("");
      setResults([]);
    } else {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [visible]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    debounceRef.current = setTimeout(async () => {
      const found = await searchLocations(query);
      setResults(found);
      setIsSearching(false);
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const handleSelect = (result: LocationResult) => {
    onSelectLocation(result.city || result.label, { latitude: result.latitude, longitude: result.longitude });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={[styles.inner, { paddingTop: insets.top + 16 }]}>
          {/* Search bar row */}
          <View style={styles.searchRow}>
            <Pressable onPress={onClose} style={styles.closeButton} hitSlop={8}>
              <X size={18} color="#FFFFFF" strokeWidth={2} />
            </Pressable>

            <View style={styles.searchBar}>
              <TextInput
                ref={inputRef}
                style={styles.searchInput}
                value={query}
                onChangeText={setQuery}
                placeholder="Rechercher..."
                placeholderTextColor="#a2a2a2"
                returnKeyType="search"
                autoCorrect={false}
              />
              {query.length > 0 && (
                <Pressable onPress={() => setQuery("")} style={styles.clearButton} hitSlop={8}>
                  <X size={14} color="#FFFFFF" strokeWidth={2} />
                </Pressable>
              )}
            </View>
          </View>

          {/* Results */}
          {isSearching ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#FC5F67" />
            </View>
          ) : (
            <FlatList
              data={results}
              keyExtractor={(item) => item.id}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => (
                <Pressable onPress={() => handleSelect(item)}>
                  <View style={styles.resultRow}>
                    <Text style={styles.resultText}>{item.label}</Text>
                  </View>
                  <View style={styles.separator} />
                </Pressable>
              )}
            />
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111111",
  },
  inner: {
    flex: 1,
    paddingHorizontal: 16,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 0,
    marginBottom: 16,
  },
  closeButton: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
  },
  searchBar: {
    flex: 1,
    height: 38,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#212121",
    borderWidth: 1,
    borderColor: "#404040",
    borderRadius: 53,
    paddingLeft: 19,
    paddingRight: 4,
  },
  searchInput: {
    flex: 1,
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    color: "#FFFFFF",
    letterSpacing: -0.24,
    padding: 0,
    margin: 0,
  },
  clearButton: {
    width: 30,
    height: 30,
    borderRadius: 37,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingContainer: {
    paddingTop: 32,
    alignItems: "center",
  },
  listContent: {
    paddingTop: 10,
  },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
  },
  resultText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: "#FFFFFF",
    letterSpacing: -0.42,
    lineHeight: 18,
  },
  separator: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.25)",
    width: "100%",
  },
});
