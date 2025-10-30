import AsyncStorage from '@react-native-async-storage/async-storage';

const TIME_PREFERENCES_KEY = '@notification_time_preferences';

export type TimePreference = {
  openNotificationTime: { hour: number; minute: number };  // Hora exacta de notificación de apertura
  closeNotificationTime: { hour: number; minute: number }; // Hora exacta de notificación de cierre
};

export type TimePreferences = {
  [areaId: string]: TimePreference;
};

// Preferencias por defecto (sin configurar)
export const DEFAULT_TIME_PREFERENCE: TimePreference = {
  openNotificationTime: { hour: -1, minute: -1 },   // -1 indica no configurado
  closeNotificationTime: { hour: -1, minute: -1 },  // -1 indica no configurado
};

/**
 * Guardar preferencias de tiempo personalizadas
 */
export async function saveTimePreferences(preferences: TimePreferences): Promise<void> {
  try {
    const jsonValue = JSON.stringify(preferences);
    await AsyncStorage.setItem(TIME_PREFERENCES_KEY, jsonValue);
    console.log('💾 Preferencias de tiempo guardadas:', preferences);
  } catch (error) {
    console.error('Error guardando preferencias de tiempo:', error);
  }
}

/**
 * Cargar preferencias de tiempo personalizadas
 * Migra automáticamente formato antiguo al nuevo
 */
export async function loadTimePreferences(): Promise<TimePreferences> {
  try {
    const jsonValue = await AsyncStorage.getItem(TIME_PREFERENCES_KEY);
    if (jsonValue != null) {
      const prefs = JSON.parse(jsonValue);
      
      // Migrar formato antiguo al nuevo si es necesario
      const migratedPrefs: TimePreferences = {};
      let needsMigration = false;

      for (const [areaId, pref] of Object.entries(prefs)) {
        const oldPref = pref as any;
        
        // Verificar si usa el formato antiguo (openMinutesBefore, closeMinutesBefore)
        if ('openMinutesBefore' in oldPref || 'closeMinutesBefore' in oldPref) {
          needsMigration = true;
          console.log(`🔄 Migrando preferencias del área ${areaId} al nuevo formato`);
          
          // Resetear a no configurado - el usuario tendrá que reconfigurar
          migratedPrefs[areaId] = {
            openNotificationTime: { hour: -1, minute: -1 },
            closeNotificationTime: { hour: -1, minute: -1 },
          };
        } else {
          // Ya usa el formato nuevo
          migratedPrefs[areaId] = pref as TimePreference;
        }
      }

      if (needsMigration) {
        console.log('💾 Guardando preferencias migradas al nuevo formato');
        await saveTimePreferences(migratedPrefs);
        console.log('✅ Migración completada. Usuario deberá reconfigurar sus notificaciones.');
      }

      console.log('📂 Preferencias de tiempo cargadas:', migratedPrefs);
      return migratedPrefs;
    }
    console.log('📂 No hay preferencias guardadas, usando valores por defecto');
    return {};
  } catch (error) {
    console.error('Error cargando preferencias de tiempo:', error);
    return {};
  }
}

/**
 * Obtener preferencia de tiempo para un área específica
 */
export function getTimePreference(areaId: string, preferences: TimePreferences): TimePreference {
  return preferences[areaId] || DEFAULT_TIME_PREFERENCE;
}

/**
 * Actualizar preferencia de tiempo para un área
 */
export async function updateTimePreference(
  areaId: string,
  preference: TimePreference,
  currentPreferences: TimePreferences
): Promise<TimePreferences> {
  const newPreferences = {
    ...currentPreferences,
    [areaId]: preference,
  };
  await saveTimePreferences(newPreferences);
  return newPreferences;
}

/**
 * Formatear hora para mostrar (formato 12 horas)
 */
export function formatTimePreference(time?: { hour: number; minute: number }): string {
  if (!time || time.hour === -1 || time.minute === -1) {
    return 'No configurado';
  }
  
  const period = time.hour >= 12 ? 'PM' : 'AM';
  const displayHour = time.hour > 12 ? time.hour - 12 : time.hour === 0 ? 12 : time.hour;
  const displayMinute = time.minute.toString().padStart(2, '0');
  return `${displayHour}:${displayMinute} ${period}`;
}

/**
 * Verificar si una notificación está configurada
 */
export function isNotificationConfigured(time?: { hour: number; minute: number }): boolean {
  if (!time) return false;
  return time.hour !== -1 && time.minute !== -1;
}
