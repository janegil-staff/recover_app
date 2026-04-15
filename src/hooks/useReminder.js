// src/hooks/useReminder.js
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY_TIME    = "reminderTime";    // "HH:MM"
const KEY_ENABLED = "reminderEnabled"; // "true" | "false"

async function requestPermission() {
  const { status } = await Notifications.getPermissionsAsync();
  if (status === "granted") return true;
  const { status: newStatus } = await Notifications.requestPermissionsAsync();
  return newStatus === "granted";
}

async function cancelReminder() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

async function scheduleReminder(hour, minute, title, body) {
  await cancelReminder();
  await Notifications.scheduleNotificationAsync({
    content: { title, body, sound: true },
    trigger: { type: "daily", hour, minute, repeats: true },
  });
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function getSavedReminderTime() {
  try {
    const val = await AsyncStorage.getItem(KEY_TIME);
    if (!val) return { hour: 19, minute: 0 };
    const [h, m] = val.split(":").map(Number);
    return { hour: h, minute: m };
  } catch {
    return { hour: 20, minute: 0 };
  }
}

export async function getSavedReminderEnabled() {
  try {
    const val = await AsyncStorage.getItem(KEY_ENABLED);
    if (val === null) return true; // default ON
    return val === "true";
  } catch {
    return true;
  }
}

export async function enableReminder(hour, minute, title, body) {
  const granted = await requestPermission();
  if (!granted) throw new Error("Notification permission denied");
  await AsyncStorage.setItem(KEY_TIME,    `${String(hour).padStart(2,"0")}:${String(minute).padStart(2,"0")}`);
  await AsyncStorage.setItem(KEY_ENABLED, "true");
  await scheduleReminder(hour, minute, title, body);
}

export async function disableReminder() {
  await AsyncStorage.setItem(KEY_ENABLED, "false");
  await cancelReminder();
}

// Restore reminder on app launch — call this once in App.js
export async function restoreReminderOnLaunch(title, body) {
  try {
    const enabled = await getSavedReminderEnabled();
    if (!enabled) return;
    const { hour, minute } = await getSavedReminderTime();
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    if (scheduled.length > 0) return; // already scheduled, nothing to do
    await scheduleReminder(hour, minute, title, body);
  } catch {
    // silently fail — don't block app launch
  }
}

// Test helper — fires after 5 seconds
export async function testReminder(title, body) {
  const granted = await requestPermission();
  if (!granted) throw new Error("Notification permission denied");
  const id = await Notifications.scheduleNotificationAsync({
    content: { title, body, sound: true },
    trigger: { type: "timeInterval", seconds: 5, repeats: false },
  });
  console.log("Test notification scheduled, id:", id);
  const all = await Notifications.getAllScheduledNotificationsAsync();
  console.log("Total scheduled:", all.length);
  return id;
}