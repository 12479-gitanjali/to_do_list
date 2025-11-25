import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "TASKS_V1";

export async function saveTasks(tasks: any[]) {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(tasks));
  } catch (e) {
    console.log("Save error:", e);
  }
}

export async function loadTasks() {
  try {
    const data = await AsyncStorage.getItem(KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.log("Load error:", e);
    return [];
  }
}
