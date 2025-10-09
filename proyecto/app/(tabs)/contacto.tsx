import React, { useState } from 'react';
import { ScrollView, StyleSheet, View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function ContactoScreen() {
const [nombre, setNombre] = useState('');
const [email, setEmail] = useState('');
const [mensaje, setMensaje] = useState('');

const handleEnviar = () => {
    // TODO: Implementar funcionalidad de envío
    console.log('Formulario enviado:', { nombre, email, mensaje });
};

return (
    <ThemedView style={styles.container}>
    <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
    >
        <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        >
        <View style={styles.header}>
            <ThemedText type="title" style={styles.headerTitle}>Contacto</ThemedText>
        </View>

        <View style={styles.pqrsSection}>
            <ThemedText type="defaultSemiBold" style={styles.pqrsTitle}>PQRS</ThemedText>
            <ThemedText style={styles.pqrsDescription}>
            Envía tus preguntas, quejas, reclamos o sugerencias. Nos pondremos en contacto contigo antes posible.
            </ThemedText>
        </View>

        <View style={styles.form}>
            <TextInput
            style={styles.input}
            placeholder="Nombre"
            placeholderTextColor="#999"
            value={nombre}
            onChangeText={setNombre}
            />

            <TextInput
            style={styles.input}
            placeholder="Correo electrónico"
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            />

            <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Mensaje"
            placeholderTextColor="#999"
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            value={mensaje}
            onChangeText={setMensaje}
            />

            <TouchableOpacity
            style={styles.submitButton}
            activeOpacity={0.8}
            onPress={handleEnviar}
            >
            <ThemedText type="defaultSemiBold" style={styles.submitButtonText}>
                Enviar
            </ThemedText>
            </TouchableOpacity>
        </View>
        </ScrollView>
    </KeyboardAvoidingView>
    </ThemedView>
);
}

const styles = StyleSheet.create({
container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
},
keyboardView: {
    flex: 1,
},
scrollContent: {
    padding: 16,
    paddingTop: 60,
    paddingBottom: 40,
},
header: {
    alignItems: 'center',
    marginBottom: 24,
},
headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000',
},
pqrsSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
},
pqrsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
},
pqrsDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
},
form: {
    gap: 16,
},
input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    fontSize: 15,
    color: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
},
textArea: {
    height: 150,
    paddingTop: 16,
},
submitButton: {
    backgroundColor: '#d81b25',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#d81b25',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
},
submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
},
});
