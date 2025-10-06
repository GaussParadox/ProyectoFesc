import AsyncStorage from '@react-native-async-storage/async-storage';

const TIME_PREFERENCES_KEY = '@notification_time_preferences';

export type TimePreference = {
  openMinutesBefore: number;  // Minutos antes de abrir (60 = 1 hora antes)
  closeMinutesBefore: number; // Minutos antes de cerrar (30 = 30 minutos antes)
};

export type TimePreferences = {
  [areaId: string]: TimePreference;
};

// Preferencias por defecto
export const DEFAULT_TIME_PREFERENCE: TimePreference = {
  openMinutesBefore: 60,  // 1 hora antes de abrir
  closeMinutesBefore: 30, // 30 minutos antes de cerrar
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
 */
export async function loadTimePreferences(): Promise<TimePreferences> {
  try {
    const jsonValue = await AsyncStorage.getItem(TIME_PREFERENCES_KEY);
    if (jsonValue != null) {
      const prefs = JSON.parse(jsonValue);
      console.log('📂 Preferencias de tiempo cargadas:', prefs);
      return prefs;
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
 * Obtener opciones de tiempo predefinidas
 */
export const TIME_OPTIONS = {
  open: [
    { label: '15 minutos antes', value: 15 },
    { label: '30 minutos antes', value: 30 },
    { label: '45 minutos antes', value: 45 },
    { label: '1 hora antes', value: 60 },
    { label: '1.5 horas antes', value: 90 },
    { label: '2 horas antes', value: 120 },
  ],
  close: [
    { label: '5 minutos antes', value: 5 },
    { label: '10 minutos antes', value: 10 },
    { label: '15 minutos antes', value: 15 },
    { label: '30 minutos antes', value: 30 },
    { label: '45 minutos antes', value: 45 },
    { label: '1 hora antes', value: 60 },
  ],
};
