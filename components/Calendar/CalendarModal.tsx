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

export type QuickFilter = "weekend" | "month";

interface CalendarModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectDate?: (date: Date) => void;
  onSelectQuickFilter?: (type: QuickFilter, label: string, start: Date, end: Date) => void;
  selectedDate?: Date;
  activeQuickFilter?: QuickFilter | null;
}

const DAYS_OF_WEEK = ["Lun.", "Mar.", "Mer.", "Jeu.", "Ven.", "Sam.", "Dim."];
const MONTHS = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];

function getWeekendDates(): { start: Date; end: Date } {
  const today = new Date();
  const day = today.getDay(); // 0=Sun, 1=Mon ... 6=Sat
  const daysToSat = day === 6 ? 0 : day === 0 ? 6 : 6 - day;
  const saturday = new Date(today);
  saturday.setDate(today.getDate() + daysToSat);
  saturday.setHours(0, 0, 0, 0);
  const sunday = new Date(saturday);
  sunday.setDate(saturday.getDate() + 1);
  return { start: saturday, end: sunday };
}

function getMonthDates(): { start: Date; end: Date } {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), 1);
  const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  return { start, end };
}

export const CalendarModal: React.FC<CalendarModalProps> = ({
  visible,
  onClose,
  onSelectDate,
  onSelectQuickFilter,
  selectedDate,
  activeQuickFilter,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const getFirstDayOfMonth = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1).getDay();
    return firstDay === 0 ? 6 : firstDay - 1;
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const generateCalendarDays = () => {
    const days: { day: number; isCurrentMonth: boolean; date: Date }[] = [];
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const daysInPrevMonth = getDaysInMonth(currentYear, currentMonth - 1);

    for (let i = firstDay - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      days.push({ day, isCurrentMonth: false, date: new Date(currentYear, currentMonth - 1, day) });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, isCurrentMonth: true, date: new Date(currentYear, currentMonth, i) });
    }
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ day: i, isCurrentMonth: false, date: new Date(currentYear, currentMonth + 1, i) });
    }
    return days;
  };

  const goToPreviousMonth = () => setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  const goToNextMonth = () => setCurrentDate(new Date(currentYear, currentMonth + 1, 1));

  const handleDayPress = (date: Date) => {
    onSelectDate?.(date);
    onClose();
  };

  const handleWeekend = () => {
    const { start, end } = getWeekendDates();
    onSelectQuickFilter?.("weekend", "Ce week-end", start, end);
    onClose();
  };

  const handleMonth = () => {
    const { start, end } = getMonthDates();
    onSelectQuickFilter?.("month", "Ce mois-ci", start, end);
    onClose();
  };

  const isSelectedDate = (date: Date) => {
    if (!selectedDate || activeQuickFilter) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const isInWeekend = (date: Date) => {
    if (activeQuickFilter !== "weekend") return false;
    const { start, end } = getWeekendDates();
    const d = date.getTime();
    return d >= start.getTime() && d <= end.getTime();
  };

  const isInMonth = (date: Date) => {
    if (activeQuickFilter !== "month") return false;
    const today = new Date();
    return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
  };

  const isHighlighted = (date: Date) => isInWeekend(date) || isInMonth(date);

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
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.container} onPress={() => {}}>
          <View style={styles.handleBar} />

          {/* Quick filters */}
          <View style={styles.quickFilters}>
            <Pressable
              style={[styles.filterButton, activeQuickFilter === "weekend" && styles.filterButtonActive]}
              onPress={handleWeekend}
            >
              <Text style={[styles.filterText, activeQuickFilter === "weekend" && styles.filterTextActive]}>
                Ce week-end
              </Text>
            </Pressable>
            <Pressable
              style={[styles.filterButton, activeQuickFilter === "month" && styles.filterButtonActive]}
              onPress={handleMonth}
            >
              <Text style={[styles.filterText, activeQuickFilter === "month" && styles.filterTextActive]}>
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
                  onPress={() => item.isCurrentMonth && handleDayPress(item.date)}
                >
                  <View
                    style={[
                      styles.dayContent,
                      isSelectedDate(item.date) && styles.selectedDay,
                      isHighlighted(item.date) && styles.highlightedDay,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        !item.isCurrentMonth && styles.dayTextOutside,
                        isSelectedDate(item.date) && styles.selectedDayText,
                        isHighlighted(item.date) && styles.highlightedDayText,
                        isToday(item.date) && !isHighlighted(item.date) && styles.todayText,
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
  highlightedDay: {
    backgroundColor: "#FC5F67",
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
  highlightedDayText: {
    color: "#FFFFFF",
  },
  todayText: {
    color: "#FC5F67",
  },
});

export default CalendarModal;
