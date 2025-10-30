import React, { useEffect, useState, useCallback } from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity, Alert, Platform, Modal, Pressable } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Bell, Clock, X, DoorOpen, DoorClosed } from 'lucide-react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AREAS } from '../services/areasData';
import { loadAreasStatus, isAreaEnabled, type AreaStatus } from '../services/storageService';
import { loadTimePreferences, updateTimePreference, getTimePreference, formatTimePreference, isNotificationConfigured, type TimePreferences, type TimePreference } from '../services/timePreferencesService';
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

type PickerMode = {
    areaId: string;
    areaTitle: string;
    type: 'open' | 'close';
} | null;

export default function ManageSchedulesScreen() {
    const [areasStatus, setAreasStatus] = useState<AreaStatus>({});
    const [timePreferences, setTimePreferences] = useState<TimePreferences>({});
    const [activeAreas, setActiveAreas] = useState<AreaConfig[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [pickerMode, setPickerMode] = useState<PickerMode>(null);
    const [selectedTime, setSelectedTime] = useState(new Date());

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

    const handleUpdateTime = async (areaId: string, type: 'open' | 'close', hour: number, minute: number) => {
        try {
            const area = activeAreas.find(a => a.id === areaId);
            if (!area) return;

            const updatedPref: TimePreference = {
                ...area.timePreference,
                [type === 'open' ? 'openNotificationTime' : 'closeNotificationTime']: { hour, minute },
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

            const formattedTime = formatTime(hour, minute);
            console.log(`✅ ${area.title} - Notificación de ${type === 'open' ? 'apertura' : 'cierre'} actualizada a ${formattedTime}`);
            
            Alert.alert(
                'Horario configurado',
                `La notificación de ${type === 'open' ? 'apertura' : 'cierre'} de "${area.title}" llegará a las ${formattedTime}`,
                [{ text: 'Entendido' }]
            );
        } catch (error) {
            console.error('Error actualizando tiempo:', error);
            Alert.alert('Error', 'No se pudo actualizar la preferencia');
        }
    };

    const showTimePicker = (areaId: string, areaTitle: string, type: 'open' | 'close') => {
        const area = activeAreas.find(a => a.id === areaId);
        if (!area) return;

        // Obtener tiempo actual configurado o usar hora actual
        let initialTime = new Date();
        if (type === 'open' && isNotificationConfigured(area.timePreference.openNotificationTime)) {
            const { hour, minute } = area.timePreference.openNotificationTime;
            initialTime = new Date();
            initialTime.setHours(hour, minute, 0, 0);
        } else if (type === 'close' && isNotificationConfigured(area.timePreference.closeNotificationTime)) {
            const { hour, minute } = area.timePreference.closeNotificationTime;
            initialTime = new Date();
            initialTime.setHours(hour, minute, 0, 0);
        }

        setSelectedTime(initialTime);
        setPickerMode({ areaId, areaTitle, type });
    };

    const handleTimeSelected = (event: any, date?: Date) => {
        if (Platform.OS === 'android') {
            setPickerMode(null);
        }

        if (event.type === 'set' && date && pickerMode) {
            const hour = date.getHours();
            const minute = date.getMinutes();
            handleUpdateTime(pickerMode.areaId, pickerMode.type, hour, minute);
            
            if (Platform.OS === 'ios') {
                setPickerMode(null);
            }
        } else if (event.type === 'dismissed') {
            setPickerMode(null);
        }
    };

    const handleClearNotification = async (areaId: string, type: 'open' | 'close') => {
        const area = activeAreas.find(a => a.id === areaId);
        if (!area) return;

        Alert.alert(
            'Eliminar notificación',
            `¿Deseas eliminar la notificación de ${type === 'open' ? 'apertura' : 'cierre'} de "${area.title}"?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        const updatedPref: TimePreference = {
                            ...area.timePreference,
                            [type === 'open' ? 'openNotificationTime' : 'closeNotificationTime']: { hour: -1, minute: -1 },
                        };

                        const newPrefs = await updateTimePreference(areaId, updatedPref, timePreferences);
                        setTimePreferences(newPrefs);

                        setActiveAreas(prev =>
                            prev.map(a =>
                                a.id === areaId
                                    ? { ...a, timePreference: updatedPref }
                                    : a
                            )
                        );

                        await reprogramAllNotifications(AREAS, areasStatus, newPrefs);
                        
                        Alert.alert('Notificación eliminada', `Ya no recibirás notificaciones de ${type === 'open' ? 'apertura' : 'cierre'} para esta área.`);
                    }
                }
            ]
        );
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
                                <View style={styles.sectionHeader}>
                                    <Bell size={16} color="#666" />
                                    <ThemedText style={styles.sectionLabel}>Horarios de Notificación</ThemedText>
                                </View>

                                {/* Configuración de apertura */}
                                <View style={styles.notificationRow}>
                                    <TouchableOpacity
                                        style={[
                                            styles.timeOption,
                                            isNotificationConfigured(area.timePreference.openNotificationTime) && styles.timeOptionConfigured
                                        ]}
                                        onPress={() => showTimePicker(area.id, area.title, 'open')}
                                        activeOpacity={0.7}
                                    >
                                        <View style={styles.timeOptionIcon}>
                                            <DoorOpen size={20} color={isNotificationConfigured(area.timePreference.openNotificationTime) ? "#4caf50" : "#999"} />
                                        </View>
                                        <View style={styles.timeOptionContent}>
                                            <ThemedText style={styles.timeLabel}>Apertura ({area.openTime})</ThemedText>
                                            <ThemedText style={[
                                                styles.timeValue,
                                                !isNotificationConfigured(area.timePreference.openNotificationTime) && styles.timeValueUnconfigured
                                            ]}>
                                                {formatTimePreference(area.timePreference.openNotificationTime)}
                                            </ThemedText>
                                        </View>
                                        <Clock size={20} color="#999" style={styles.chevron} />
                                    </TouchableOpacity>
                                    {isNotificationConfigured(area.timePreference.openNotificationTime) && (
                                        <TouchableOpacity
                                            style={styles.clearButton}
                                            onPress={() => handleClearNotification(area.id, 'open')}
                                        >
                                            <X size={18} color="#d32f2f" />
                                        </TouchableOpacity>
                                    )}
                                </View>

                                {/* Configuración de cierre */}
                                <View style={styles.notificationRow}>
                                    <TouchableOpacity
                                        style={[
                                            styles.timeOption,
                                            isNotificationConfigured(area.timePreference.closeNotificationTime) && styles.timeOptionConfigured
                                        ]}
                                        onPress={() => showTimePicker(area.id, area.title, 'close')}
                                        activeOpacity={0.7}
                                    >
                                        <View style={styles.timeOptionIcon}>
                                            <DoorClosed size={20} color={isNotificationConfigured(area.timePreference.closeNotificationTime) ? "#4caf50" : "#999"} />
                                        </View>
                                        <View style={styles.timeOptionContent}>
                                            <ThemedText style={styles.timeLabel}>Cierre ({area.closeTime})</ThemedText>
                                            <ThemedText style={[
                                                styles.timeValue,
                                                !isNotificationConfigured(area.timePreference.closeNotificationTime) && styles.timeValueUnconfigured
                                            ]}>
                                                {formatTimePreference(area.timePreference.closeNotificationTime)}
                                            </ThemedText>
                                        </View>
                                        <Clock size={20} color="#999" style={styles.chevron} />
                                    </TouchableOpacity>
                                    {isNotificationConfigured(area.timePreference.closeNotificationTime) && (
                                        <TouchableOpacity
                                            style={styles.clearButton}
                                            onPress={() => handleClearNotification(area.id, 'close')}
                                        >
                                            <X size={18} color="#d32f2f" />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                        </View>
                    ))}
                </View>

                <View style={styles.helpBox}>
                    <ThemedText style={styles.helpText}>
                        <ThemedText style={styles.helpBold}>Consejo:</ThemedText> Configura la hora exacta en la que deseas recibir cada notificación.
                        Las notificaciones se enviarán automáticamente todos los días a la hora que configures.
                    </ThemedText>
                </View>
            </ScrollView>

            {/* Modal para iOS con DateTimePicker */}
            {Platform.OS === 'ios' && pickerMode && (
                <Modal
                    transparent
                    animationType="slide"
                    visible={pickerMode !== null}
                    onRequestClose={() => setPickerMode(null)}
                >
                    <Pressable style={styles.modalOverlay} onPress={() => setPickerMode(null)}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <ThemedText type="defaultSemiBold" style={styles.modalTitle}>
                                    {pickerMode.areaTitle}
                                </ThemedText>
                                <ThemedText style={styles.modalSubtitle}>
                                    Notificación de {pickerMode.type === 'open' ? 'Apertura' : 'Cierre'}
                                </ThemedText>
                            </View>
                            <DateTimePicker
                                value={selectedTime}
                                mode="time"
                                display="spinner"
                                onChange={handleTimeSelected}
                                style={styles.timePicker}
                            />
                            <TouchableOpacity
                                style={styles.modalButton}
                                onPress={() => {
                                    const hour = selectedTime.getHours();
                                    const minute = selectedTime.getMinutes();
                                    handleUpdateTime(pickerMode.areaId, pickerMode.type, hour, minute);
                                    setPickerMode(null);
                                }}
                            >
                                <ThemedText style={styles.modalButtonText}>Confirmar</ThemedText>
                            </TouchableOpacity>
                        </View>
                    </Pressable>
                </Modal>
            )}

            {/* DateTimePicker para Android */}
            {Platform.OS === 'android' && pickerMode && (
                <DateTimePicker
                    value={selectedTime}
                    mode="time"
                    display="default"
                    onChange={handleTimeSelected}
                />
            )}
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
    
    timeSection: { gap: 12 },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    sectionLabel: {
        fontSize: 14,
        fontWeight: '600',
        opacity: 0.7,
    },
    
    notificationRow: {
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
    },
    
    timeOption: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#f5f5f5',
        padding: 12,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: 'transparent',
        gap: 12,
    },
    timeOptionConfigured: {
        backgroundColor: '#e8f5e9',
        borderColor: '#4caf50',
    },
    timeOptionIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    timeOptionContent: { flex: 1 },
    timeLabel: {
        fontSize: 14,
        marginBottom: 4,
        fontWeight: '500',
    },
    timeValue: {
        fontSize: 15,
        color: '#4caf50',
        fontWeight: '700',
    },
    timeValueUnconfigured: {
        color: '#999',
        fontWeight: '500',
        fontStyle: 'italic',
    },
    chevron: {
        marginLeft: 8,
    },
    
    clearButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#ffebee',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ef5350',
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

    // Estilos del modal (iOS)
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        paddingBottom: 40,
    },
    modalHeader: {
        marginBottom: 16,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        marginBottom: 4,
        color: '#000',
    },
    modalSubtitle: {
        fontSize: 14,
        color: '#666',
    },
    timePicker: {
        height: 200,
        marginVertical: 8,
    },
    modalButton: {
        backgroundColor: '#4caf50',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 16,
    },
    modalButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
});
