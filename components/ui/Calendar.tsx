import { ChevronLeft, ChevronRight } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { styles } from "./Calendar.styles";

type CalendarProps = {
  selected?: Date;
  onSelect?: (date: Date) => void;
};

const WEEK_DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export function Calendar({ selected, onSelect }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(
    selected
      ? new Date(selected.getFullYear(), selected.getMonth(), 1)
      : new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );

  const days = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const startDay = firstDayOfMonth.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const result: (Date | null)[] = [];

    for (let i = 0; i < startDay; i += 1) {
      result.push(null);
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      result.push(new Date(year, month, day));
    }

    while (result.length % 7 !== 0) {
      result.push(null);
    }

    return result;
  }, [currentMonth]);

  const rows = [];
  for (let i = 0; i < days.length; i += 7) {
    rows.push(days.slice(i, i + 7));
  }

  const goToPreviousMonth = () => {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1),
    );
  };

  const goToNextMonth = () => {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1),
    );
  };

  const isSameDay = (a?: Date, b?: Date) => {
    if (!a || !b) return false;
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  };

  const isToday = (date?: Date) => {
    if (!date) return false;
    const today = new Date();
    return isSameDay(date, today);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.navButton} onPress={goToPreviousMonth}>
          <ChevronLeft size={18} color="#111827" />
        </Pressable>

        <Text style={styles.monthLabel}>
          {currentMonth.toLocaleString("en-US", {
            month: "long",
            year: "numeric",
          })}
        </Text>

        <Pressable style={styles.navButton} onPress={goToNextMonth}>
          <ChevronRight size={18} color="#111827" />
        </Pressable>
      </View>

      <View style={styles.weekHeader}>
        {WEEK_DAYS.map((day) => (
          <Text key={day} style={styles.weekDayText}>
            {day}
          </Text>
        ))}
      </View>

      <View style={styles.grid}>
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((date, colIndex) => {
              if (!date) {
                return (
                  <View
                    key={`${rowIndex}-${colIndex}`}
                    style={styles.emptyCell}
                  />
                );
              }

              const selectedDay = isSameDay(date, selected);
              const today = isToday(date);

              return (
                <Pressable
                  key={`${rowIndex}-${colIndex}`}
                  style={[
                    styles.dayButton,
                    today && styles.todayButton,
                    selectedDay && styles.selectedButton,
                  ]}
                  onPress={() => onSelect?.(date)}
                >
                  <Text
                    style={[
                      styles.dayText,
                      today && styles.todayText,
                      selectedDay && styles.selectedText,
                    ]}
                  >
                    {date.getDate()}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}
