import { Fonts } from "@/constants/theme";
import { MusicStyle } from "@/services/api/types";
import { Ionicons } from "@expo/vector-icons";
import React, { useState, useMemo } from "react";
import {
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { StyleChip } from "./StyleChip";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface StylePickerModalProps {
  visible: boolean;
  onClose: () => void;
  musicStyles: MusicStyle[];
  mode: "primary" | "secondary";
  selectedIds: number[];
  onConfirm: (selectedIds: number[]) => void;
}

export function StylePickerModal({
  visible,
  onClose,
  musicStyles,
  mode,
  selectedIds,
  onConfirm,
}: StylePickerModalProps) {
  const [search, setSearch] = useState("");
  const [localSelected, setLocalSelected] = useState<number[]>(selectedIds);
  const maxSelection = mode === "primary" ? 1 : 3;

  // Reset local state when modal opens
  React.useEffect(() => {
    if (visible) {
      setLocalSelected(selectedIds);
      setSearch("");
    }
  }, [visible, selectedIds]);

  const filteredStyles = useMemo(
    () =>
      musicStyles.filter((s) =>
        s.name.toLowerCase().includes(search.toLowerCase())
      ),
    [musicStyles, search]
  );

  const selectedStyles = useMemo(
    () => musicStyles.filter((s) => localSelected.includes(s.id)),
    [musicStyles, localSelected]
  );

  const handleToggle = (id: number) => {
    if (mode === "primary") {
      setLocalSelected([id]);
    } else {
      setLocalSelected((prev) => {
        if (prev.includes(id)) {
          return prev.filter((s) => s !== id);
        }
        if (prev.length < maxSelection) {
          return [...prev, id];
        }
        return prev;
      });
    }
  };

  const handleValidate = () => {
    onConfirm(localSelected);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        {/* Backdrop */}
        <Pressable style={styles.backdrop} onPress={onClose} />

        {/* Bottom sheet */}
        <View style={styles.sheet}>
          {/* Handle bar */}
          <View style={styles.handleBar} />

          <View style={styles.sheetContent}>
            {/* Search bar */}
            <View style={styles.searchBar}>
              <Ionicons name="search" size={18} color="#b6b6b6" />
              <TextInput
                style={styles.searchInput}
                placeholder="Jazz, Rock, Rap ..."
                placeholderTextColor="#b6b6b6"
                value={search}
                onChangeText={setSearch}
              />
            </View>

            {/* Selected chips */}
            {selectedStyles.length > 0 && (
              <View style={styles.selectedSection}>
                <View style={styles.chipsRow}>
                  {selectedStyles.map((s) => (
                    <StyleChip
                      key={`selected-${s.id}`}
                      id={s.id}
                      name={s.name}
                      variant="selectedBlack"
                      onPress={handleToggle}
                    />
                  ))}
                </View>
                {mode === "secondary" && (
                  <Text style={styles.maxText}>
                    Sélectionnez {maxSelection} maximum
                  </Text>
                )}
              </View>
            )}

            {/* All styles - scrollable */}
            <ScrollView
              contentContainerStyle={styles.allChipsGrid}
              showsVerticalScrollIndicator={false}
            >
              {filteredStyles.map((s) => {
                const isSelected = localSelected.includes(s.id);
                const isDisabled =
                  mode === "secondary" &&
                  !isSelected &&
                  localSelected.length >= maxSelection;
                return (
                  <StyleChip
                    key={`all-${s.id}`}
                    id={s.id}
                    name={s.name}
                    variant={isSelected ? "selectedBlack" : "outline"}
                    onPress={handleToggle}
                    disabled={isDisabled}
                  />
                );
              })}
            </ScrollView>
          </View>

          {/* Validate button */}
          <View style={styles.footer}>
            <Pressable
              style={[
                styles.validateButton,
                mode === "primary" &&
                  localSelected.length === 0 &&
                  styles.buttonDisabled,
              ]}
              onPress={handleValidate}
              disabled={mode === "primary" && localSelected.length === 0}
            >
              <Text style={styles.validateText}>Valider</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  sheet: {
    height: SCREEN_HEIGHT * 0.85,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 15,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: "#D1D1D6",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 15,
  },
  sheetContent: {
    flex: 1,
    gap: 15,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "#a6a6a6",
    borderRadius: 49,
    paddingHorizontal: 15,
    paddingVertical: 13,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: Fonts.semiBold,
    color: "#000000",
    padding: 0,
  },
  selectedSection: {
    gap: 10,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  maxText: {
    fontSize: 15,
    fontFamily: Fonts.regular,
    color: "red",
  },
  allChipsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    paddingBottom: 10,
  },
  footer: {
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 20,
  },
  validateButton: {
    backgroundColor: "#000000",
    paddingHorizontal: 36,
    paddingVertical: 13,
    borderRadius: 49,
  },
  buttonDisabled: {
    opacity: 0.35,
  },
  validateText: {
    fontSize: 15,
    fontFamily: Fonts.semiBold,
    color: "#FFFFFF",
  },
});
