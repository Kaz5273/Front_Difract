import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Dimensions,
} from "react-native";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { Fonts } from "@/constants/theme";

interface CalendarModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectDate?: (date: Date) => void;
  selectedDate?: Date;
}

const DAYS_OF_WEEK = ["Lun.", "Mar.", "Mer.", "Jeu.", "Ven.", "Sam.", "Dim."];
const MONTHS = [
  "janvier",
  "février",
  "mars",
  "avril",
  "mai",
  "juin",
  "juillet",
  "août",
  "septembre",
  "octobre",
  "novembre",
  "décembre",
];

export const CalendarModal: React.FC<CalendarModalProps> = ({
  visible,
  onClose,
  onSelectDate,
  selectedDate,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [quickFilter, setQuickFilter] = useState<"weekend" | "month" | null>(
    null
  );

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Obtenir le premier jour du mois (0 = Dimanche, on veut Lundi = 0)
  const getFirstDayOfMonth = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1).getDay();
    // Convertir de Dimanche=0 à Lundi=0
    return firstDay === 0 ? 6 : firstDay - 1;
  };

  // Obtenir le nombre de jours dans le mois
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Générer les jours du calendrier
  const generateCalendarDays = () => {
    const days: { day: number; isCurrentMonth: boolean; date: Date }[] = [];
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const daysInPrevMonth = getDaysInMonth(currentYear, currentMonth - 1);

    // Jours du mois précédent
    for (let i = firstDay - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      days.push({
        day,
        isCurrentMonth: false,
        date: new Date(currentYear, currentMonth - 1, day),
      });
    }

    // Jours du mois actuel
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        isCurrentMonth: true,
        date: new Date(currentYear, currentMonth, i),
      });
    }

    // Jours du mois suivant (pour compléter la grille)
    const remainingDays = 42 - days.length; // 6 semaines * 7 jours
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
        date: new Date(currentYear, currentMonth + 1, i),
      });
    }

    return days;
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleDayPress = (date: Date) => {
    onSelectDate?.(date);
  };

  const isSelectedDate = (date: Date) => {
    if (!selectedDate) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const calendarDays = generateCalendarDays();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.container} onPress={() => {}}>
          {/* Handle bar */}
          <View style={styles.handleBar} />

          {/* Quick filters */}
          <View style={styles.quickFilters}>
            <Pressable
              style={[
                styles.filterButton,
                quickFilter === "weekend" && styles.filterButtonActive,
              ]}
              onPress={() =>
                setQuickFilter(quickFilter === "weekend" ? null : "weekend")
              }
            >
              <Text
                style={[
                  styles.filterText,
                  quickFilter === "weekend" && styles.filterTextActive,
                ]}
              >
                Ce week-end
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.filterButton,
                quickFilter === "month" && styles.filterButtonActive,
              ]}
              onPress={() =>
                setQuickFilter(quickFilter === "month" ? null : "month")
              }
            >
              <Text
                style={[
                  styles.filterText,
                  quickFilter === "month" && styles.filterTextActive,
                ]}
              >
                Ce mois-ci
              </Text>
            </Pressable>
          </View>

          {/* Month navigation */}
          <View style={styles.monthNav}>
            <View style={styles.monthNavRow}>
              <Pressable onPress={goToPreviousMonth} style={styles.navButton}>
                <ChevronLeft size={20} color="#000000" />
              </Pressable>
              <Text style={styles.monthText}>
                {MONTHS[currentMonth]} {currentYear}
              </Text>
              <Pressable onPress={goToNextMonth} style={styles.navButton}>
                <ChevronRight size={20} color="#000000" />
              </Pressable>
            </View>

            {/* Days of week header */}
            <View style={styles.daysHeader}>
              {DAYS_OF_WEEK.map((day, index) => (
                <View key={index} style={styles.dayHeaderCell}>
                  <Text style={styles.dayHeaderText}>{day}</Text>
                </View>
              ))}
            </View>

            {/* Calendar grid */}
            <View style={styles.calendarGrid}>
              {calendarDays.map((item, index) => (
                <Pressable
                  key={index}
                  style={styles.dayCell}
                  onPress={() =>
                    item.isCurrentMonth && handleDayPress(item.date)
                  }
                >
                  <View
                    style={[
                      styles.dayContent,
                      isSelectedDate(item.date) && styles.selectedDay,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        !item.isCurrentMonth && styles.dayTextOutside,
                        isSelectedDate(item.date) && styles.selectedDayText,
                        isToday(item.date) && styles.todayText,
                      ]}
                    >
                      {item.day}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    paddingTop: 9,
    paddingBottom: 10,
    paddingHorizontal: 39,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 46.6,
    elevation: 10,
  },
  handleBar: {
    width: 53,
    height: 5,
    backgroundColor: "#707070",
    borderRadius: 16,
    alignSelf: "center",
    marginBottom: 38,
  },
  quickFilters: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 24,
  },
  filterButton: {
    borderWidth: 1,
    borderColor: "#9A9A9A",
    borderRadius: 23,
    paddingVertical: 4,
    width: 117,
    alignItems: "center",
    justifyContent: "center",
  },
  filterButtonActive: {
    backgroundColor: "#000000",
    borderColor: "#000000",
  },
  filterText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: "#000000",
    textAlign: "center",
    lineHeight: 28,
  },
  filterTextActive: {
    color: "#FFFFFF",
  },
  monthNav: {
    gap: 15,
    alignItems: "center",
  },
  monthNavRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: 297,
    height: 28,
  },
  navButton: {
    padding: 4,
  },
  monthText: {
    fontFamily: Fonts.extraBold,
    fontSize: 14,
    color: "#000000",
    textAlign: "center",
  },
  daysHeader: {
    flexDirection: "row",
    width: width - 78,
  },
  dayHeaderCell: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 5,
  },
  dayHeaderText: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: "#B8B8B8",
    textAlign: "center",
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: width - 78,
  },
  dayCell: {
    width: (width - 78) / 7,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    paddingVertical: 5,
  },
  dayContent: {
    width: 38,
    height: 37,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 21,
  },
  selectedDay: {
    borderWidth: 1,
    borderColor: "#A9A9A9",
  },
  dayText: {
    fontFamily: Fonts.bold,
    fontSize: 16,
    color: "#000000",
    textAlign: "center",
  },
  dayTextOutside: {
    color: "#9B9B9B",
  },
  selectedDayText: {
    color: "#000000",
  },
  todayText: {
    color: "#FC5F67",
  },
});

export default CalendarModal;
