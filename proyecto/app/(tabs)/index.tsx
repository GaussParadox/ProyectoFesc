import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity, Linking, Alert, Switch } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { registerForPushNotificationsAsync } from '../services/notificationService';
import { reprogramAllNotifications, getScheduledNotificationsInfo } from '../services/scheduleService';
import { loadAreasStatus, saveAreasStatus, isAreaEnabled, type AreaStatus } from '../services/storageService';
import { AREAS, type Area } from '../services/areasData';

function CardItem({ area, enabled, onToggle }: { area: Area; enabled: boolean; onToggle: (value: boolean) => void }) {
return (
  <View style={styles.card}>
    <View style={styles.cardText}>
      <ThemedText type="defaultSemiBold" style={styles.cardTitle}>{area.title}</ThemedText>
      <ThemedText style={styles.cardSubtitle}>{area.subtitle}</ThemedText>
    </View>
    <Switch
      value={enabled}
      onValueChange={onToggle}
      trackColor={{ false: '#ccc', true: '#4caf50' }}
      thumbColor={enabled ? '#fff' : '#f4f3f4'}
    />
  </View>
);
}

export default function HomeScreen() {
const [notificationsScheduled, setNotificationsScheduled] = useState<number>(0);
const [isLoading, setIsLoading] = useState(false);
const [areasStatus, setAreasStatus] = useState<AreaStatus>({});

useEffect(() => {
  const setupNotifications = async () => {
    try {
      const savedStatus = await loadAreasStatus();
      setAreasStatus(savedStatus);

      const permissionsGranted = await registerForPushNotificationsAsync();
      
      if (permissionsGranted === false) {
        console.log('⚠️ Permisos no concedidos, pero continuando...');
      }
      
      const count = await reprogramAllNotifications(AREAS, savedStatus);
      setNotificationsScheduled(count);
      
      console.log(` ${count} notificaciones programadas exitosamente`);
    } catch (error) {
      console.error(" Error configurando notificaciones:", error);
    }
  };

  setupNotifications();
}, []);

const handleToggleArea = async (areaId: string, enabled: boolean) => {
  const newStatus = { ...areasStatus, [areaId]: enabled };
  setAreasStatus(newStatus);
  await saveAreasStatus(newStatus);
  
  const count = await reprogramAllNotifications(AREAS, newStatus);
  setNotificationsScheduled(count);
  
  console.log(`${enabled ? '✅' : '❌'} Área ${areaId} ${enabled ? 'activada' : 'desactivada'}`);
};

const handleReprogramNotifications = async () => {
  setIsLoading(true);
  try {
    const count = await reprogramAllNotifications(AREAS, areasStatus);
    setNotificationsScheduled(count);
    
    const activeAreasCount = AREAS.filter(a => isAreaEnabled(a.id, areasStatus)).length;
    
    const info = await getScheduledNotificationsInfo();
    const now = new Date();
    const currentTime = now.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
    
    Alert.alert(
      "Notificaciones Reprogramadas",
      `Hora actual: ${currentTime}\n\n ${activeAreasCount} de ${AREAS.length} áreas activas\n🔔 ${count} notificaciones programadas\n\n${info.slice(0, 3).join('\n')}${info.length > 3 ? '\n...y más' : ''}`,
      [{ text: "OK" }]
    );
  } catch (error) {
    console.error("Error reprogramando notificaciones:", error);
    Alert.alert("Error", "No se pudieron reprogramar las notificaciones.");
  } finally {
    setIsLoading(false);
  }
};

return (
  <ThemedView style={styles.container}>
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <ThemedText type="title" style={styles.header}>Horarios</ThemedText>
      
      {notificationsScheduled > 0 && (
        <View style={styles.notificationBadge}>
          <ThemedText style={styles.notificationBadgeText}>
            {notificationsScheduled} notificaciones activas
          </ThemedText>
        </View>
      )}

      <ThemedText type="subtitle" style={styles.sectionTitle}>Áreas Administrativas</ThemedText>

      <View style={styles.list}>
        {AREAS.map(a => (
          <CardItem 
            key={a.id} 
            area={a} 
            enabled={isAreaEnabled(a.id, areasStatus)}
            onToggle={(value) => handleToggleArea(a.id, value)}
          />
        ))}
      </View>

      <View style={styles.footerButtons}>
        <TouchableOpacity
          style={styles.notificationButton}
          activeOpacity={0.8}
          onPress={handleReprogramNotifications}
          disabled={isLoading}
        >
          <ThemedText type="defaultSemiBold" style={styles.notificationButtonText}>
            {isLoading ? "Reprogramando..." : "Reprogramar Notificaciones"}
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.notificationButton, { backgroundColor: '#ff0000ff' }]}
          activeOpacity={0.8}
          onPress={async () => {
            const { debugScheduledNotifications } = await import('../services/debugService');
            await debugScheduledNotifications();
            Alert.alert('Debug', 'Revisa la consola para ver los detalles de las notificaciones programadas.');
          }}
        >
          <ThemedText type="defaultSemiBold" style={styles.notificationButtonText}>
            Ver Notificaciones Programadas
          </ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.primaryButton}
          activeOpacity={0.8}
          onPress={async () => {
            const url = 'https://www.fesc.edu.co/portal/component/weblinks/weblink/101-google?catid=87&Itemid=640';
            try {
              const supported = await Linking.canOpenURL(url);
              if (supported) await Linking.openURL(url);
              else Alert.alert('Error', 'No se puede abrir el enlace');
            } catch (e) {
              Alert.alert('Error', 'No se pudo abrir el enlace');
            }
          }}
        >
          <ThemedText type="defaultSemiBold" style={styles.primaryButtonText}>Página de la FESC</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryButton}
          activeOpacity={0.8}
          onPress={async () => {
            const url = 'https://www.suplataforma.net';
            try {
              const supported = await Linking.canOpenURL(url);
              if (supported) await Linking.openURL(url);
              else Alert.alert('Error', 'No se puede abrir el enlace');
            } catch (e) {
              Alert.alert('Error', 'No se pudo abrir el enlace');
            }
          }}
        >
          <ThemedText type="defaultSemiBold" style={styles.secondaryButtonText}>SIPAES</ThemedText>
        </TouchableOpacity>
      </View>
    </ScrollView>
  </ThemedView>
);
}

const styles = StyleSheet.create({
container: { flex: 1 },
scrollContent: { padding: 16, paddingTop: 48, paddingBottom: 40 },
header: { textAlign: 'center', marginBottom: 8, marginTop: 8 },
notificationBadge: {
  backgroundColor: '#e8f5e9',
  padding: 12,
  borderRadius: 8,
  marginBottom: 12,
  borderLeftWidth: 4,
  borderLeftColor: '#4caf50',
},
notificationBadgeText: {
  color: '#2e7d32',
  fontSize: 14,
  textAlign: 'center',
  fontWeight: '600',
},
sectionTitle: { fontSize: 22, marginTop: 8, marginBottom: 12 },
list: { gap: 12 },
card: {
  flexDirection: 'row',
  backgroundColor: '#fff',
  borderRadius: 12,
  padding: 12,
  alignItems: 'center',
  justifyContent: 'space-between',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.06,
  shadowRadius: 8,
  elevation: 2,
},
cardText: { flex: 1, paddingRight: 8 },
cardTitle: { fontSize: 16, marginBottom: 6 },
cardSubtitle: { color: '#333' },
cardImage: { width: 72, height: 56, borderRadius: 8 },
cardPlaceholder: { width: 72, height: 56, borderRadius: 8, backgroundColor: '#f0f0f0' },
footerButtons: { marginTop: 16, gap: 12 },
notificationButton: {
  backgroundColor: '#f30000ff',
  paddingVertical: 12,
  borderRadius: 12,
  alignItems: 'center',
},
notificationButtonText: { color: '#fff', fontWeight: '600' },
primaryButton: {
  backgroundColor: '#d81b25',
  paddingVertical: 12,
  borderRadius: 12,
  alignItems: 'center',
},
primaryButtonText: { color: '#fff' },
secondaryButton: {
  backgroundColor: '#f7caca',
  paddingVertical: 12,
  borderRadius: 12,
  alignItems: 'center',
},
secondaryButtonText: { color: '#b80000' },
});
