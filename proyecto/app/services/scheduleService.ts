import * as Notifications from "expo-notifications";
import { scheduleDailyNotification } from "./notificationService";
import { isAreaEnabled } from "./storageService";

    export function parseSchedule(subtitle: string): { openTime: string; closeTime: string } | null {
    const match = subtitle.match(/(\d{1,2}:\d{2})\s*(am|pm)\s*a\s*(\d{1,2}:\d{2})\s*(am|pm)/i);
    if (!match) return null;

    const [_, openHour, openPeriod, closeHour, closePeriod] = match;
    return {
        openTime: `${openHour} ${openPeriod}`,
        closeTime: `${closeHour} ${closePeriod}`,
    };
    }

    function convertTo24Hour(time: string): { hour: number; minute: number } {
    const match = time.match(/(\d{1,2}):(\d{2})\s*(am|pm)/i);
    if (!match) throw new Error(`Formato de hora inválido: ${time}`);

    let [_, hourStr, minuteStr, period] = match;
    let hour = parseInt(hourStr);
    const minute = parseInt(minuteStr);

    if (period.toLowerCase() === "pm" && hour !== 12) {
        hour += 12;
    } else if (period.toLowerCase() === "am" && hour === 12) {
        hour = 0;
    }

    return { hour, minute };
    }

    function subtractMinutes(hour: number, minute: number, minutesToSubtract: number): { hour: number; minute: number } {
    let totalMinutes = hour * 60 + minute - minutesToSubtract;
    if (totalMinutes < 0) totalMinutes += 24 * 60;

    return {
        hour: Math.floor(totalMinutes / 60) % 24,
        minute: totalMinutes % 60,
    };
    }

    // Formatear hora para mostrar
    export function formatTime(hour: number, minute: number): string {
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    const displayMinute = minute.toString().padStart(2, "0");
    return `${displayHour}:${displayMinute} ${period}`;
    }

interface Area {
  id: string;
  title: string;
  subtitle: string;
}

type TimePreferences = { 
  [areaId: string]: { 
    openNotificationTime: { hour: number; minute: number };
    closeNotificationTime: { hour: number; minute: number };
  } 
};

export async function scheduleNotificationsForAreas(
  areas: Area[],
  areasStatus: { [key: string]: boolean },
  timePreferences?: TimePreferences
) {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();

    console.log("📅 Programando notificaciones con horarios personalizados...");
    let scheduledCount = 0;

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeStr = formatTime(currentHour, currentMinute);
    
    console.log(`⏰ Hora actual: ${currentTimeStr} (${currentHour}:${currentMinute})`);

    for (const area of areas) {
      // Verificar si el área está habilitada
      const enabled = areasStatus[area.id] !== false;

      if (!enabled) {
        console.log(`⏭️ Saltando "${area.title}" - desactivada`);
        continue;
      }

      const schedule = parseSchedule(area.subtitle);
      if (!schedule) {
        console.warn(`⚠️ No se pudo parsear el horario: ${area.subtitle}`);
        continue;
      }

      const openTime = convertTo24Hour(schedule.openTime);
      const closeTime = convertTo24Hour(schedule.closeTime);

      // Obtener preferencias de tiempo personalizadas
      const prefs = timePreferences?.[area.id];
      
      // Notificación de apertura (solo si está configurada)
      if (prefs?.openNotificationTime && prefs.openNotificationTime.hour !== -1) {
        const notifyOpen = prefs.openNotificationTime;
        
        console.log(`🔔 ${area.title} - Notificación de apertura: ${formatTime(notifyOpen.hour, notifyOpen.minute)}`);
        
        await scheduleDailyNotification(
          notifyOpen.hour,
          notifyOpen.minute,
          `📢 ${area.title} abrirá pronto`,
          `Horario de apertura: ${formatTime(openTime.hour, openTime.minute)}`
        );
        scheduledCount++;
      } else {
        console.log(`⏸️ ${area.title} - Notificación de apertura no configurada`);
      }

      // Notificación de cierre (solo si está configurada)
      if (prefs?.closeNotificationTime && prefs.closeNotificationTime.hour !== -1) {
        const notifyClose = prefs.closeNotificationTime;
        
        console.log(`🔔 ${area.title} - Notificación de cierre: ${formatTime(notifyClose.hour, notifyClose.minute)}`);
        
        await scheduleDailyNotification(
          notifyClose.hour,
          notifyClose.minute,
          `⏰ ${area.title} cerrará pronto`,
          `Horario de cierre: ${formatTime(closeTime.hour, closeTime.minute)}`
        );
        scheduledCount++;
      } else {
        console.log(`⏸️ ${area.title} - Notificación de cierre no configurada`);
      }
    }

    console.log(`✅ Total: ${scheduledCount} notificaciones programadas`);
    return scheduledCount;
  } catch (error) {
    console.error("❌ Error al programar notificaciones:", error);
    throw error;
  }
}

export async function reprogramAllNotifications(
  areas: Area[],
  areasStatus: { [key: string]: boolean },
  timePreferences?: TimePreferences
): Promise<number> {
  const count = await scheduleNotificationsForAreas(areas, areasStatus, timePreferences);

  const activeAreas = Object.values(areasStatus).filter((v) => v).length;
  console.log(`${count} notificaciones para ${activeAreas} áreas activas`);
  
  return count;
}

    export async function getScheduledNotificationsInfo(): Promise<string[]> {
    try {
        const notifications = await Notifications.getAllScheduledNotificationsAsync();
        
        return notifications.map((notif, index) => {
        const trigger = notif.trigger as any;
        if (trigger && trigger.hour !== undefined && trigger.minute !== undefined) {
            const timeStr = formatTime(trigger.hour, trigger.minute);
            return `📅 ${notif.content.title} - ${timeStr}`;
        }
        return `📅 ${notif.content.title}`;
        });
    } catch (error) {
        console.error('Error obteniendo info de notificaciones:', error);
        return [];
    }
    }

    async function loadAreasStatus() {
    try {
        const { loadAreasStatus: load } = await import("./storageService");
        return await load();
    } catch {
        return {};
    }
    }
