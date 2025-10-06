import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform, LogBox } from "react-native";

// Suprimir warnings específicos de expo-notifications
LogBox.ignoreLogs([
  'expo-notifications: Android Push notifications',
  'Failed to schedule the notification',
]);

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

    export async function registerForPushNotificationsAsync() {
    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        
        if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
        }
        
        if (finalStatus !== "granted") {
        console.log(" No se concedieron permisos para las notificaciones.");
        return false;
        }
        
        console.log(" Permisos de notificaciones concedidos");
    } else {
        console.log("ℹ Las notificaciones locales funcionan mejor en dispositivos físicos.");
    }
    
    if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
        });
    }

    return true;
    }

    export async function scheduleDailyNotification(
    hour: number,
    minute: number,
    title: string,
    body: string
    ): Promise<string> {
    try {
        let trigger: Notifications.NotificationTriggerInput;
        
        if (Platform.OS === 'android') {
        const now = new Date();
        const scheduledDate = new Date();
        scheduledDate.setHours(hour, minute, 0, 0);

        if (scheduledDate <= now) {
            scheduledDate.setDate(scheduledDate.getDate() + 1);
        }

        trigger = {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour,
            minute,
        };
        } else {
        trigger = {
            type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
            hour,
            minute,
            repeats: true,
        };
        }

        const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
            title,
            body,
            sound: true,
            priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger,
        });

        return notificationId;
    } catch (error) {
        console.error("❌ Error al programar notificación:", error);
        throw error;
    }
    }

    export async function cancelAllNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
    }

    export async function getAllScheduledNotifications() {
    return await Notifications.getAllScheduledNotificationsAsync();
    }
