import React from 'react';
import { StyleSheet, View, Pressable, Image } from 'react-native';
import { Link } from 'expo-router';

import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';


export default function WelcomeScreen() {
  return (
    <ThemedView style={styles.container}>
      <View style={styles.topSpacer} />

      <View style={styles.card}> 
        <Image source={require('@/assets/images/Logofesc.png')} style={styles.icon} />
      </View>

      <ThemedText type="title" style={styles.title}>
        Horario Administrativo
      </ThemedText>
      <ThemedText style={styles.subtitle}>FESC</ThemedText>

      <View style={styles.flexGrow} />

      <View style={styles.buttonWrapper}>
        <View style={styles.enterBox}>
          <Link href="/(tabs)" asChild>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Entrar"
              android_ripple={{ color: 'rgba(255,255,255,0.18)' }}
              style={({ pressed }) => [
                styles.enterButton,
                pressed && styles.enterButtonPressed,
              ]}
            >
              <ThemedText type="defaultSemiBold" style={styles.enterText}>Entrar</ThemedText>
            </Pressable>
          </Link>
        </View>
      </View>

      <View style={styles.bottomSpacer}/>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    backgroundColor: 'transparent',
  },
  topSpacer: {
    height: 80,
  },
  bottomSpacer: {
    height: 24,
  },
  card: {
    width: 160,
    height: 160,
    borderRadius: 0,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
    marginBottom: 12,
  },
  icon: {
    width: 130,
    height: 130,
    resizeMode: 'contain',
  },
  title: {
    marginTop: 8,
    textAlign: 'center',
    alignSelf: 'center',
  },
  subtitle: {
    marginTop: 6,
    textAlign: 'center',
    alignSelf: 'center',
    color: '#666',
  },
  flexGrow: { flex: 1 },
  buttonWrapper: {
    width: '100%',
    paddingHorizontal: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  enterBox: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#ee0000ff',
    borderRadius: 18,
    padding: 6,
    // sombra ligera
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  enterButton: {
    width: '100%',
    alignSelf: 'center',
    backgroundColor: '#c8102e', // cambiar aquí si quieres otro rojo
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  enterButtonPressed: {
    opacity: 0.92,
  },
  enterText: {
    color: '#ffffffff',
    fontSize: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
    alignSelf: 'center',
  },
});
