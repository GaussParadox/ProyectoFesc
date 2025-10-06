import React, { useEffect, useState, useCallback } from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AREAS } from '../services/areasData';
import { loadAreasStatus, isAreaEnabled, type AreaStatus } from '../services/storageService';
import { loadTimePreferences, updateTimePreference, getTimePreference, TIME_OPTIONS, type TimePreferences, type TimePreference } from '../services/timePreferencesService';
import { reprogramAllNotifications } from '../services/scheduleService';
import { parseSchedule, formatTime } from '../services/scheduleService';

type AreaConfig = {
    id: string;
    title: string;
    subtitle: string;
    openTime: string;
    closeTime: string;
    timePreference: TimePreference;
};

export default function ManageSchedulesScreen() {
    const [areasStatus, setAreasStatus] = useState<AreaStatus>({});
    const [timePreferences, setTimePreferences] = useState<TimePreferences>({});
    const [activeAreas, setActiveAreas] = useState<AreaConfig[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Cargar datos cuando la pantalla se enfoca (cada vez que cambias de pestaña)
    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const loadData = async () => {
        try {
            const status = await loadAreasStatus();
            const prefs = await loadTimePreferences();
            
            setAreasStatus(status);
            setTimePreferences(prefs);

            // Filtrar solo áreas activas y parsear horarios
            const active = AREAS.filter(area => isAreaEnabled(area.id, status))
                .map(area => {
                    const schedule = parseSchedule(area.subtitle);
                    const pref = getTimePreference(area.id, prefs);
                    
                    return {
                        id: area.id,
                        title: area.title,
                        subtitle: area.subtitle,
                        openTime: schedule?.openTime || '',
                        closeTime: schedule?.closeTime || '',
                        timePreference: pref,
                    };
                });

            setActiveAreas(active);
            setIsLoading(false);
        } catch (error) {
            console.error('Error cargando datos:', error);
            setIsLoading(false);
        }
    };

    const handleUpdateTime = async (areaId: string, type: 'open' | 'close', minutes: number) => {
        try {
            const area = activeAreas.find(a => a.id === areaId);
            if (!area) return;

            const updatedPref: TimePreference = {
                ...area.timePreference,
                [type === 'open' ? 'openMinutesBefore' : 'closeMinutesBefore']: minutes,
            };

            const newPrefs = await updateTimePreference(areaId, updatedPref, timePreferences);
            setTimePreferences(newPrefs);

            // Actualizar el área en el estado local inmediatamente
            setActiveAreas(prev =>
                prev.map(a =>
                    a.id === areaId
                        ? { ...a, timePreference: updatedPref }
                        : a
                )
            );

            // Reprogramar notificaciones con nuevos tiempos
            await reprogramAllNotifications(AREAS, areasStatus, newPrefs);

            console.log(`✅ ${area.title} - ${type === 'open' ? 'Apertura' : 'Cierre'} actualizado a ${minutes} minutos`);
        } catch (error) {
            console.error('Error actualizando tiempo:', error);
            Alert.alert('❌ Error', 'No se pudo actualizar la preferencia');
        }
    };

    const showTimeOptions = (areaId: string, areaTitle: string, type: 'open' | 'close') => {
        const options = type === 'open' ? TIME_OPTIONS.open : TIME_OPTIONS.close;
        const title = type === 'open' ? 'Notificación de Apertura' : 'Notificación de Cierre';

        Alert.alert(
            `${title}`,
            `${areaTitle}\n\nSelecciona cuánto tiempo antes quieres recibir la notificación:`,
            [
                ...options.map(opt => ({
                    text: opt.label,
                    onPress: () => handleUpdateTime(areaId, type, opt.value),
                })),
                { 
                    text: 'Cancelar', 
                    style: 'cancel',
                    onPress: () => {
                        // No hacer nada, solo cerrar el diálogo
                    }
                },
            ],
            {
                cancelable: true, // Permite cerrar tocando fuera del diálogo
                onDismiss: () => {
                    // Se ejecuta cuando se cierra sin seleccionar
                }
            }
        );
    };

    const getTimeLabel = (minutes: number): string => {
        if (minutes < 60) {
            return `${minutes} min antes`;
        }
        const hours = minutes / 60;
        return hours === 1 ? '1 hora antes' : `${hours} horas antes`;
    };

    if (isLoading) {
        return (
            <ThemedView style={styles.container}>
                <ThemedText style={styles.loadingText}>Cargando...</ThemedText>
            </ThemedView>
        );
    }

    if (activeAreas.length === 0) {
        return (
            <ThemedView style={styles.container}>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <ThemedText type="title" style={styles.header}>Administrar Horarios</ThemedText>
                    
                    <View style={styles.emptyState}>
                        <ThemedText type="subtitle" style={styles.emptyTitle}>
                            No hay áreas activas
                        </ThemedText>
                        <ThemedText style={styles.emptyText}>
                            Activa al menos un área en la pestaña "Horarios" para poder personalizar sus notificaciones.
                        </ThemedText>
                    </View>
                </ScrollView>
            </ThemedView>
        );
    }

    return (
        <ThemedView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <ThemedText type="title" style={styles.header}>Administrar Horarios</ThemedText>
                
                <View style={styles.infoBadge}>
                    <ThemedText style={styles.infoBadgeText}>
                        Personaliza cuándo recibir las notificaciones
                    </ThemedText>
                </View>

                <View style={styles.list}>
                    {activeAreas.map(area => (
                        <View key={area.id} style={styles.areaCard}>
                            <View style={styles.areaHeader}>
                                <ThemedText type="defaultSemiBold" style={styles.areaTitle}>
                                    {area.title}
                                </ThemedText>
                                <ThemedText style={styles.areaSubtitle}>
                                    {area.subtitle}
                                </ThemedText>
                            </View>

                            <View style={styles.timeSection}>
                                <ThemedText style={styles.sectionLabel}>🔔 Notificaciones:</ThemedText>

                                {/* Configuración de apertura */}
                                <TouchableOpacity
                                    style={styles.timeOption}
                                    onPress={() => showTimeOptions(area.id, area.title, 'open')}
                                    activeOpacity={0.7}
                                >
                                    <View style={styles.timeOptionContent}>
                                        <ThemedText style={styles.timeLabel}>Apertura ({area.openTime})</ThemedText>
                                        <ThemedText style={styles.timeValue}>
                                            {getTimeLabel(area.timePreference.openMinutesBefore)}
                                        </ThemedText>
                                    </View>
                                    <ThemedText style={styles.chevron}>›</ThemedText>
                                </TouchableOpacity>

                                {/* Configuración de cierre */}
                                <TouchableOpacity
                                    style={styles.timeOption}
                                    onPress={() => showTimeOptions(area.id, area.title, 'close')}
                                    activeOpacity={0.7}
                                >
                                    <View style={styles.timeOptionContent}>
                                        <ThemedText style={styles.timeLabel}>Cierre ({area.closeTime})</ThemedText>
                                        <ThemedText style={styles.timeValue}>
                                            {getTimeLabel(area.timePreference.closeMinutesBefore)}
                                        </ThemedText>
                                    </View>
                                    <ThemedText style={styles.chevron}>›</ThemedText>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}
                </View>

                <View style={styles.helpBox}>
                    <ThemedText style={styles.helpText}>
                        <ThemedText style={styles.helpBold}>Consejo:</ThemedText> Las notificaciones se enviarán
                        automáticamente según tus preferencias cada día a la hora configurada.
                    </ThemedText>
                </View>
            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { padding: 16, paddingTop: 48, paddingBottom: 40 },
    header: { textAlign: 'center', marginBottom: 8 },
    loadingText: { textAlign: 'center', marginTop: 50, fontSize: 16 },
    
    infoBadge: {
        backgroundColor: '#e3f2fd',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
        borderLeftWidth: 4,
        borderLeftColor: '#2196f3',
    },
    infoBadgeText: {
        color: '#1565c0',
        fontSize: 14,
        textAlign: 'center',
        fontWeight: '600',
    },

    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        paddingHorizontal: 32,
    },
    emptyTitle: {
        fontSize: 20,
        marginBottom: 12,
        textAlign: 'center',
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
        opacity: 0.7,
        lineHeight: 24,
    },

    list: { gap: 16, marginBottom: 16 },
    
    areaCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    
    areaHeader: {
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    areaTitle: { fontSize: 17, marginBottom: 4 },
    areaSubtitle: { fontSize: 14, opacity: 0.6 },
    
    timeSection: { gap: 8 },
    sectionLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
        opacity: 0.7,
    },
    
    timeOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#f5f5f5',
        padding: 12,
        borderRadius: 8,
    },
    timeOptionContent: { flex: 1 },
    timeLabel: {
        fontSize: 14,
        marginBottom: 4,
        fontWeight: '500',
    },
    timeValue: {
        fontSize: 13,
        color: '#4caf50',
        fontWeight: '600',
    },
    chevron: {
        fontSize: 24,
        color: '#999',
        marginLeft: 8,
    },

    helpBox: {
        backgroundColor: '#fff9e6',
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ffe082',
    },
    helpText: {
        fontSize: 14,
        lineHeight: 20,
        color: '#5d4037',
    },
    helpBold: {
        fontWeight: '700',
    },
});
