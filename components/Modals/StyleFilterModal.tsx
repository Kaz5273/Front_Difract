import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  TextInput,
} from "react-native";
import { X, Search } from "lucide-react-native";
import { Fonts } from "@/constants/theme";
import type { MusicStyle } from "@/services/api/types";

interface StyleFilterModalProps {
  visible: boolean;
  onClose: () => void;
  styles: MusicStyle[];
  selectedStyleIds: number[];
  onSelectStyles: (ids: number[]) => void;
}

export const StyleFilterModal: React.FC<StyleFilterModalProps> = ({
  visible,
  onClose,
  styles,
  selectedStyleIds,
  onSelectStyles,
}) => {
  const [localSelected, setLocalSelected] = useState<number[]>(selectedStyleIds);
  const [search, setSearch] = useState("");

  const handleOpen = () => {
    setLocalSelected(selectedStyleIds);
    setSearch("");
  };

  const toggleStyle = (id: number) => {
    setLocalSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleApply = () => {
    onSelectStyles(localSelected);
    onClose();
  };

  const handleReset = () => {
    setLocalSelected([]);
    onSelectStyles([]);
    onClose();
  };

  const filteredStyles = useMemo(() => {
    if (!search.trim()) return styles;
    return styles.filter((s) =>
      s.name.toLowerCase().includes(search.toLowerCase().trim())
    );
  }, [styles, search]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      onShow={handleOpen}
    >
      <Pressable style={s.overlay} onPress={onClose}>
        <Pressable style={s.container} onPress={() => {}}>
          {/* Handle */}
          <View style={s.handleBar} />

          {/* Header */}
          <View style={s.header}>
            <Text style={s.title}>Styles musicaux</Text>
            <Pressable onPress={onClose} style={s.closeButton}>
              <X size={20} color="#7B7B7B" strokeWidth={2} />
            </Pressable>
          </View>

          {/* Search input */}
          <View style={s.searchContainer}>
            <Search size={16} color="#7B7B7B" strokeWidth={2} />
            <TextInput
              style={s.searchInput}
              value={search}
              onChangeText={setSearch}
              placeholder="Rechercher un style..."
              placeholderTextColor="#555555"
            />
            {search.length > 0 && (
              <Pressable onPress={() => setSearch("")}>
                <X size={14} color="#555555" strokeWidth={2} />
              </Pressable>
            )}
          </View>

          {/* Selected count */}
          {localSelected.length > 0 && (
            <View style={s.selectedInfo}>
              <Text style={s.selectedText}>
                {localSelected.length} style{localSelected.length > 1 ? "s" : ""} sélectionné{localSelected.length > 1 ? "s" : ""}
              </Text>
              <Pressable onPress={() => setLocalSelected([])}>
                <Text style={s.clearText}>Tout effacer</Text>
              </Pressable>
            </View>
          )}

          {/* Chips */}
          <ScrollView
            style={s.scrollView}
            contentContainerStyle={s.chipsContainer}
            showsVerticalScrollIndicator={false}
          >
            {filteredStyles.length === 0 ? (
              <Text style={s.noResult}>Aucun style trouvé</Text>
            ) : (
              filteredStyles.map((style) => {
                const isActive = localSelected.includes(style.id);
                return (
                  <Pressable
                    key={style.id}
                    style={[s.chip, isActive && s.chipActive]}
                    onPress={() => toggleStyle(style.id)}
                  >
                    <Text style={[s.chipText, isActive && s.chipTextActive]}>
                      {style.name}
                    </Text>
                  </Pressable>
                );
              })
            )}
          </ScrollView>

          {/* Footer */}
          <View style={s.footer}>
            <Pressable style={s.resetButton} onPress={handleReset}>
              <Text style={s.resetText}>Réinitialiser</Text>
            </Pressable>
            <Pressable style={s.applyButton} onPress={handleApply}>
              <Text style={s.applyText}>
                Appliquer{localSelected.length > 0 ? ` (${localSelected.length})` : ""}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 10,
    paddingBottom: 32,
    minHeight: "55%",
    maxHeight: "80%",
  },
  handleBar: {
    width: 53,
    height: 5,
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    alignSelf: "center",
    marginBottom: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  title: {
    fontFamily: Fonts.regular,
    fontSize: 18,
    color: "#1A1A1A",
    letterSpacing: -0.36,
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 20,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#333333",
  },
  searchInput: {
    flex: 1,
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: "#1A1A1A",
    padding: 0,
    margin: 0,
    letterSpacing: -0.28,
  },
  selectedInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  selectedText: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    color: "#FC5F67",
    letterSpacing: -0.24,
  },
  clearText: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    color: "#7B7B7B",
    letterSpacing: -0.24,
    textDecorationLine: "underline",
  },
  scrollView: {
    flex: 1,
    minHeight: 100,
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#818181",
  },
  chipActive: {
    backgroundColor: "#FC5F67",
    borderColor: "#FC5F67",
  },
  chipText: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    color: "#818181",
    letterSpacing: -0.26,
  },
  chipTextActive: {
    color: "#000000",
  },
  noResult: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: "#555555",
    textAlign: "center",
    paddingVertical: 20,
  },
  footer: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  resetButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 25,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#7B7B7B",
  },
  resetText: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: "#000000",
    letterSpacing: -0.28,
  },
  applyButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 25,
    backgroundColor: "#FC5F67",
    alignItems: "center",
  },
  applyText: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: "#000000",
    letterSpacing: -0.28,
  },
});

export default StyleFilterModal;
