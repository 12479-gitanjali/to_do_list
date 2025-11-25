import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Task = {
  id: string;
  text: string;
  completed: boolean;
  emoji?: string;
  color?: string;
  date: string;      // creation date
  dueDate?: string;  // user-selected due date
};

type TaskItemProps = {
  item: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
};

const TaskItem = ({ item, onToggle, onDelete }: TaskItemProps) => {

  // Determine due-date indicator color
  const getDueColor = () => {
    if (!item.dueDate) return "#fff";
    const now = new Date();
    const due = new Date(item.dueDate);
    const diffDays = Math.ceil(
      (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays < 0) return "#FF6F61";    // overdue → red
    if (diffDays <= 2) return "#FFD700";   // soon → yellow
    return "#6BCB77";                      // later → green
  };

  return (
    <View
      style={[
        styles.container,
        { borderLeftColor: getDueColor(), borderLeftWidth: 5 },
      ]}
    >

      {/* Tick Circle */}
      <TouchableOpacity
        style={[
          styles.tickButton,
          item.completed && styles.tickButtonCompleted,
        ]}
        onPress={() => onToggle(item.id)}
      >
        {item.completed && <Text style={styles.tickText}>✓</Text>}
      </TouchableOpacity>

      {/* Task Text Area */}
      <View style={{ flex: 1 }}>
        <Text
          style={[
            styles.text,
            { textDecorationLine: item.completed ? "line-through" : "none" },
          ]}
        >
          {item.emoji} {item.text}
        </Text>

        <Text style={styles.dateText}>
          Created: {new Date(item.date).toLocaleDateString()}
        </Text>

        {item.dueDate && (
          <Text style={styles.dueText}>
            Due: {new Date(item.dueDate).toLocaleDateString()}
          </Text>
        )}
      </View>

      {/* Delete Button */}
      <TouchableOpacity onPress={() => onDelete(item.id)}>
        <Text style={styles.deleteText}>🗑️</Text>
      </TouchableOpacity>
    </View>
  );
};

export default TaskItem;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginVertical: 6,
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    alignItems: "center",
  },

  /* TICK BUTTON */
  tickButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#4D96FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  tickButtonCompleted: {
    backgroundColor: "#4D96FF",
  },
  tickText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  /* TEXT */
  text: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  dateText: {
    fontSize: 12,
    color: "#555",
    marginTop: 2,
  },
  dueText: {
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 2,
  },

  /* DELETE */
  deleteText: {
    color: "#FF6F61",
    fontWeight: "bold",
    fontSize: 18,
    marginLeft: 12,
  },
});
