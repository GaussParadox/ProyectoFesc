import React from 'react';
import { Image, ScrollView, StyleSheet, View, TouchableOpacity, Linking, Alert } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link } from 'expo-router';

type Area = {
  id: string;
  title: string;
  subtitle: string;
  image: any;
};

const AREAS: Area[] = [
  {
    id: '1',
    title: 'Secretaría Académica',
    subtitle: 'Abierto de 7:00 am a 8:00 pm',
    image: require('@/assets/images/partial-react-logo.png'),
  },
  {
    id: '2',
    title: 'Secretaría Administrativa',
    subtitle: 'Abierto de 8:00 am a 6:00 pm',
    image: require('@/assets/images/react-logo.png'),
  },
  {
    id: '3',
    title: 'Biblioteca',
    subtitle: 'Abierto de 9:00 am a 5:00 pm',
    image: require('@/assets/images/partial-react-logo.png'),
  },
  {
    id: '4',
    title: 'Oficina de Admisiones',
    subtitle: 'Abierto de 10:00 am a 4:00 pm',
    image: require('@/assets/images/react-logo.png'),
  },
];

function CardItem({ area }: { area: Area }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardText}>
        <ThemedText type="defaultSemiBold" style={styles.cardTitle}>{area.title}</ThemedText>
        <ThemedText style={styles.cardSubtitle}>{area.subtitle}</ThemedText>
      </View>
      <View style={styles.cardPlaceholder} />
    </View>
  );
}

export default function HomeScreen() {
  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedText type="title" style={styles.header}>Horarios</ThemedText>

        <ThemedText type="subtitle" style={styles.sectionTitle}>Áreas Administrativas</ThemedText>

        <View style={styles.list}>
          {AREAS.map(a => (
            <CardItem key={a.id} area={a} />
          ))}
        </View>

        <View style={styles.footerButtons}>
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
