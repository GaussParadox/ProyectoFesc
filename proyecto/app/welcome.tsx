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
        <Link href="/(tabs)" asChild>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Entrar"
            style={({ pressed }) => [
              styles.enterButton,
              pressed && styles.enterButtonPressed,
            ]}
          >
            <ThemedText type="defaultSemiBold" style={styles.enterText}>Entrar</ThemedText>
          </Pressable>
        </Link>
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
    width: 120,
    height: 120,
    borderRadius: 0,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
    marginBottom: 8,
  },
  icon: {
    width: 96,
    height: 96,
    resizeMode: 'contain',
  },
  title: {
    marginTop: 8,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 6,
    textAlign: 'center',
    color: '#666',
  },
  flexGrow: { flex: 1 },
  buttonWrapper: {
    width: '100%',
    paddingHorizontal: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  enterButton: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    backgroundColor: '#c8102e',
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
    opacity: 0.9,
  },
  enterText: {
    color: '#000000ff',
    fontSize: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
