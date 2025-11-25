import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";
import TaskItem from "@/components/todo/TaskItem";
import { saveTasks, loadTasks } from "@/storage/taskStorage";
import ConfettiCannon from "react-native-confetti-cannon";
import DateTimePicker from "@react-native-community/datetimepicker";

type Task = {
  id: string;
  text: string;
  completed: boolean;
  emoji?: string;
  color?: string;
  date: string;    // creation date
  dueDate: string; // mandatory user-selected due date
};

export default function TodoScreen() {
  const [task, setTask] = useState<string>("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const confettiRef = useRef<any>(null);

  const emojis = ["📝", "📌", "🎯", "⚡", "💡"];
  const colors = ["#FFD700", "#FF6F61", "#6BCB77", "#4D96FF", "#FF6EC7"];

  // Load saved tasks
  useEffect(() => {
    async function fetchData() {
      const saved: Task[] = await loadTasks();
      const sorted = saved.sort((a, b) => Number(b.id) - Number(a.id));
      setTasks(sorted);
    }
    fetchData();
  }, []);

  // Save tasks
  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  // Add task
  const addTask = () => {
    if (!task.trim() || !dueDate) return;

    const randomIndex = Math.floor(Math.random() * emojis.length);

    const newTask: Task = {
      id: Date.now().toString(),
      text: task,
      completed: false,
      emoji: emojis[randomIndex],
      color: colors[randomIndex],
      date: new Date().toISOString(),
      dueDate: dueDate.toISOString(),
    };

    setTasks([newTask, ...tasks]);
    setTask("");
    setDueDate(null);
  };

  // Toggle task completion
  const toggleTask = (id: string) => {
    const updatedTasks = tasks.map((t) => {
      if (t.id === id) {
        if (!t.completed) setShowConfetti(true);
        return { ...t, completed: !t.completed };
      }
      return t;
    });
    setTasks(updatedTasks);
  };

  // Delete task
  const deleteTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  // Date label: Today / Yesterday / Older
  const getDateLabel = (taskDate: string) => {
    const taskTime = new Date(taskDate);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (
      taskTime.getFullYear() === today.getFullYear() &&
      taskTime.getMonth() === today.getMonth() &&
      taskTime.getDate() === today.getDate()
    ) {
      return "Today";
    } else if (
      taskTime.getFullYear() === yesterday.getFullYear() &&
      taskTime.getMonth() === yesterday.getMonth() &&
      taskTime.getDate() === yesterday.getDate()
    ) {
      return "Yesterday";
    } else {
      return taskTime.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
  };

  // Group tasks by creation date
  const groupedTasks: { type: "header" | "task"; label?: string; item?: Task }[] = [];
  let lastLabel = "";
  tasks.forEach((t) => {
    const label = getDateLabel(t.date);
    if (label !== lastLabel) {
      groupedTasks.push({ type: "header", label });
      lastLabel = label;
    }
    groupedTasks.push({ type: "task", item: t });
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎉 Fun To-Do List</Text>

      <View style={styles.row}>
        <TextInput
          style={styles.input}
          placeholder="Add your next task..."
          placeholderTextColor="#888"
          value={task}
          onChangeText={setTask}
        />

        {/* Calendar button opens Date Picker directly */}
        <TouchableOpacity
          style={styles.calendarButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.calendarButtonText}>📅</Text>
        </TouchableOpacity>

        {/* Add button is disabled until a due date is selected */}
        <TouchableOpacity
          style={[styles.addButton, !dueDate && styles.addButtonDisabled]}
          onPress={addTask}
          disabled={!dueDate}
        >
          <Text style={styles.addText}>➕</Text>
        </TouchableOpacity>
      </View>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={dueDate || new Date()}
          mode="date"
          display="spinner"
          minimumDate={new Date()} // Prevent past dates
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) setDueDate(selectedDate);
          }}
        />
      )}

      <FlatList
        data={groupedTasks}
        keyExtractor={(item, index) =>
          item.type === "header" ? item.label! + index : item.item!.id
        }
        renderItem={({ item }) => {
          if (item.type === "header") {
            return <Text style={styles.headerText}>{item.label}</Text>;
          } else {
            return (
              <TaskItem
                item={item.item!}
                onToggle={toggleTask}
                onDelete={deleteTask}
              />
            );
          }
        }}
      />

      {showConfetti && (
        <ConfettiCannon
          count={50}
          origin={{ x: -10, y: 0 }}
          autoStart={true}
          fadeOut={true}
          onAnimationEnd={() => setShowConfetti(false)}
          ref={confettiRef}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60, backgroundColor: "#f0f4f7" },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  row: { flexDirection: "row", marginBottom: 20, alignItems: "center" },
  input: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 20,
    fontSize: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
  calendarButton: {
    backgroundColor: "#4D96FF",
    padding: 12,
    borderRadius: 20,
    marginLeft: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  calendarButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
  addButton: {
    backgroundColor: "#FF6F61",
    padding: 15,
    marginLeft: 10,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonDisabled: {
    backgroundColor: "#ccc",
  },
  addText: { color: "#fff", fontWeight: "bold", fontSize: 20 },
  headerText: { fontSize: 16, fontWeight: "bold", marginVertical: 10, color: "#444" },
});
