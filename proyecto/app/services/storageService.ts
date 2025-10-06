import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@notifications_enabled_areas';

export type AreaStatus = {
  [areaId: string]: boolean;
};

export async function saveAreasStatus(status: AreaStatus): Promise<void> {
  try {
    const jsonValue = JSON.stringify(status);
    await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
    console.log('💾 Estado de áreas guardado:', status);
  } catch (error) {
    console.error('❌ Error guardando estado de áreas:', error);
  }
}


export async function loadAreasStatus(): Promise<AreaStatus> {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
    if (jsonValue != null) {
      const status = JSON.parse(jsonValue);
      console.log('📂 Estado de áreas cargado:', status);
      return status;
    }
    console.log('📂 No hay estado guardado, usando valores por defecto');
    return {};
  } catch (error) {
    console.error('❌ Error cargando estado de áreas:', error);
    return {};
  }
}


export async function toggleAreaStatus(areaId: string, enabled: boolean): Promise<void> {
  try {
    const currentStatus = await loadAreasStatus();
    currentStatus[areaId] = enabled;
    await saveAreasStatus(currentStatus);
    console.log(`🔄 Área ${areaId} ${enabled ? 'activada' : 'desactivada'}`);
  } catch (error) {
    console.error('❌ Error actualizando estado de área:', error);
  }
}


export function isAreaEnabled(areaId: string, status: AreaStatus): boolean {
  return status[areaId] !== undefined ? status[areaId] : true;
}
