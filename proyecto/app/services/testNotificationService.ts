/**
 * Servicio de prueba para notificaciones
 * Permite programar notificaciones de prueba que llegan en pocos minutos
 */

import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

/**
 * Programar notificación de prueba que llega en X segundos
 */
export async function scheduleTestNotification(
seconds: number,
title: string,
body: string
): Promise<string> {
try {
const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
    title,
    body,
    sound: true,
    priority: Notifications.AndroidNotificationPriority.HIGH,
    data: { test: true },
    },
    trigger: {
    type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
    seconds: seconds,
    },
});

console.log(`Notificación de prueba programada para ${seconds} segundos`);
console.log(`ID: ${notificationId}`);

return notificationId;
} catch (error) {
console.error("Error al programar notificación de prueba:", error);
throw error;
}
}

/**
 * Programar serie de notificaciones de prueba
 * Simula el sistema real pero con tiempos reducidos
 */
export async function scheduleTestNotificationSeries(): Promise<number> {
try {
await Notifications.cancelAllScheduledNotificationsAsync();
console.log("🧹 Notificaciones anteriores canceladas");

const testNotifications = [
    {
    seconds: 10,
    title: "Prueba 1 - Apertura",
    body: "Esta es una notificación de prueba de apertura (10 segundos)"
    },
    {
    seconds: 30,
    title: "Prueba 2 - Cierre",
    body: "Esta es una notificación de prueba de cierre (30 segundos)"
    },
    {
    seconds: 60,
    title: "Prueba 3 - Final",
    body: "Esta es la última notificación de prueba (1 minuto)"
    }
];

for (const notif of testNotifications) {
    await scheduleTestNotification(notif.seconds, notif.title, notif.body);
}

console.log(`✅ ${testNotifications.length} notificaciones de prueba programadas`);
return testNotifications.length;
} catch (error) {
console.error("❌ Error programando serie de pruebas:", error);
throw error;
}
}

/**
 * Programar notificación de prueba inmediata (5 segundos)
 */
export async function scheduleImmediateTestNotification(): Promise<string> {
const now = new Date();
const time = now.toLocaleTimeString('es-ES');

return await scheduleTestNotification(
5,
"Notificación de Prueba Inmediata",
`Esta notificación fue programada a las ${time} y llegará en 5 segundos`
);
}

/**
 * Programar notificaciones de prueba para apertura y cierre
 * Simula el comportamiento real pero en minutos en lugar de horas
 */
export async function scheduleRealisticTestNotifications(): Promise<number> {
try {
await Notifications.cancelAllScheduledNotificationsAsync();

const notifications = [
    // Simula "1 hora antes de apertura" pero en 1 minuto
    {
    seconds: 60,
    title: "📢 Secretaría Académica - Apertura",
    body: "Abre en 1 minuto (simulando 1 hora antes)"
    },
    // Simula "45 minutos antes de cierre" pero en 2 minutos
    {
    seconds: 120,
    title: "⏰ Secretaría Académica - Cierre",
    body: "Cierra en 2 minutos (simulando 45 minutos antes)"
    },
    // Simula otra área
    {
    seconds: 90,
    title: "📚 Biblioteca - Apertura",
    body: "Abre en 1.5 minutos (simulando 1 hora antes)"
    }
];

for (const notif of notifications) {
    await scheduleTestNotification(notif.seconds, notif.title, notif.body);
}

console.log(`✅ ${notifications.length} notificaciones realistas de prueba programadas`);
return notifications.length;
} catch (error) {
console.error("❌ Error programando notificaciones realistas:", error);
throw error;
}
}

/**
 * Obtener información de notificaciones de prueba programadas
 */
export async function getTestNotificationsInfo(): Promise<string[]> {
const scheduled = await Notifications.getAllScheduledNotificationsAsync();

const info = scheduled.map((notif, index) => {
const trigger = notif.trigger as any;
const seconds = trigger.seconds || 0;
const title = notif.content.title || 'Sin título';

return `${index + 1}. ${title} - En ${seconds} segundos`;
});

return info;
}
