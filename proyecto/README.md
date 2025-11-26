# Sistema de Notificaciones de Horarios FESC

## Descripción del Proyecto

### ¿De qué trata la aplicación?

Esta aplicación móvil permite a los usuarios recibir notificaciones automáticas sobre los horarios de atención de diferentes áreas administrativas y de servicios de la Fundación de Estudios Superiores Comfanorte (FESC). Los usuarios pueden suscribirse selectivamente a las áreas de su interés y recibir alertas diarias antes de los horarios de apertura.

### ¿A quién está dirigida?

La aplicación está dirigida a:
- Estudiantes de la FESC
- Personal administrativo
- Docentes
- Cualquier persona que necesite acceder a los servicios institucionales

### ¿Qué problema resuelve?

Resuelve la falta de información oportuna sobre la disponibilidad de servicios como secretarías, biblioteca y oficinas administrativas, evitando desplazamientos innecesarios y optimizando la gestión del tiempo de los usuarios.

---

## Tecnologías Utilizadas

### Frontend Móvil

- **React Native** (v0.81.5) - Framework multiplataforma
- **Expo** (v54.0.23) - Plataforma de desarrollo y despliegue
- **TypeScript** (v5.9.2) - Lenguaje de programación con tipado estático
- **Expo Router** (v6.0.14) - Sistema de navegación basado en archivos
- **React Navigation** (v7.1.8) - Navegación entre pantallas
- **AsyncStorage** (v2.2.0) - Almacenamiento persistente local
- **Expo Notifications** (v0.32.12) - Sistema de notificaciones locales
- **Lucide React Native** (v0.545.0) - Biblioteca de iconos
- **React Native Reanimated** (v4.1.1) - Animaciones fluidas

### Backend

**No aplica** - Esta aplicación funciona completamente en el cliente sin necesidad de servicios backend. Toda la lógica de negocio, almacenamiento de datos y gestión de notificaciones se ejecuta localmente en el dispositivo móvil.

### Base de Datos

**AsyncStorage** - Sistema de almacenamiento clave-valor local que persiste las preferencias del usuario en el dispositivo:
- **Android**: SharedPreferences
- **iOS**: NSUserDefaults

No se utiliza una base de datos tradicional cliente-servidor.

### Servicios Externos

- **Expo Application Services (EAS)** - Build y despliegue de aplicaciones
- **Expo Notifications API** - APIs nativas para notificaciones locales (iOS UserNotifications / Android NotificationManager)
- **Expo Device API** - Detección de capacidades del dispositivo

---

## Cómo Desplegarlo Paso a Paso

### Requisitos Previos

Asegúrate de tener instalado lo siguiente:

- **Node.js** (v18.0.0 o superior) - [Descargar aquí](https://nodejs.org/)
- **npm** (v8.0.0 o superior) o **yarn** (v1.22.0 o superior)
- **Git** - [Descargar aquí](https://git-scm.com/)
- **Expo CLI** (se instalará automáticamente)

**Para desarrollo en dispositivos físicos:**
- **Expo Go** app instalada en tu dispositivo móvil ([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) / [iOS](https://apps.apple.com/app/expo-go/id982107779))

**Para desarrollo en emuladores (opcional):**
- **Android Studio** con emulador Android configurado
- **Xcode** (solo macOS) para simulador iOS

### Instalación y Ejecución

#### 1. Clonar el Repositorio

```bash
git clone https://github.com/GaussParadox/ProyectoFesc.git
cd ProyectoFesc/proyecto
```

#### 2. Instalar Dependencias

```bash
npm install
```

o si prefieres usar yarn:

```bash
yarn install
```

#### 3. Ejecutar el Proyecto en Entorno Local

**Iniciar el servidor de desarrollo:**

```bash
npx expo start
```

Esto abrirá Expo Dev Tools en tu navegador y mostrará un código QR en la terminal.

**Opciones de ejecución:**

- **En dispositivo físico:**
  - Abre la app Expo Go en tu dispositivo
  - Escanea el código QR mostrado en la terminal
  - La aplicación se cargará automáticamente

- **En emulador Android:**
  ```bash
  npx expo start --android
  ```
  O presiona `a` en la terminal después de ejecutar `npx expo start`

- **En simulador iOS (solo macOS):**
  ```bash
  npx expo start --ios
  ```
  O presiona `i` en la terminal después de ejecutar `npx expo start`

- **En navegador web:**
  ```bash
  npx expo start --web
  ```
  O presiona `w` en la terminal después de ejecutar `npx expo start`

#### 4. Comandos Adicionales

**Limpiar caché y reiniciar:**
```bash
npx expo start --clear
```

**Ejecutar linter:**
```bash
npm run lint
```

**Resetear proyecto (mover código de ejemplo):**
```bash
npm run reset-project
```

---

## 🏗️ Ejecución en Modo Producción

### Build para Producción con EAS

#### 1. Instalar EAS CLI

```bash
npm install -g eas-cli
```

#### 2. Iniciar Sesión en Expo

```bash
eas login
```

#### 3. Configurar el Proyecto (si es primera vez)

```bash
eas build:configure
```

#### 4. Crear Build de Producción

**Para Android (APK):**
```bash
eas build --platform android --profile production
```

**Para iOS:**
```bash
eas build --platform ios --profile production
```

**Para ambas plataformas:**
```bash
eas build --platform all
```

#### 5. Despliegue en Tiendas

Una vez completado el build, descarga los archivos generados:

- **Android**: Archivo `.aab` o `.apk` para subir a Google Play Store
- **iOS**: Archivo `.ipa` para subir a Apple App Store

### Actualizaciones OTA (Over-The-Air)

Para actualizar la aplicación sin pasar por las tiendas (solo cambios de JavaScript):

```bash
eas update --branch production --message "Descripción de la actualización"
```

---

## Configuración de Variables de Entorno

### Variables Requeridas

Este proyecto **no requiere variables de entorno** para funcionar en desarrollo local, ya que toda la configuración está incluida en `app.json` y `eas.json`.

### Configuración en app.json

Las siguientes configuraciones están definidas en `app.json`:

```json
{
  "expo": {
    "name": "proyecto",
    "slug": "proyecto",
    "version": "1.0.0",
    "android": {
      "package": "co.edu.fesc.horarios"
    },
    "extra": {
      "eas": {
        "projectId": "ef208b4a-0a83-45ab-8432-3addf59171e5"
      }
    },
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/images/Logofesc.png",
          "color": "#d81b25",
          "mode": "production"
        }
      ]
    ]
  }
}
```

### Variables de Configuración (app.json)

| Variable | Descripción | Valor Actual |
|----------|-------------|--------------|
| `name` | Nombre de la aplicación | `proyecto` |
| `slug` | Identificador único del proyecto | `proyecto` |
| `version` | Versión de la aplicación | `1.0.0` |
| `android.package` | Package ID para Android | `co.edu.fesc.horarios` |
| `extra.eas.projectId` | ID del proyecto en EAS | `ef208b4a-0a83-45ab-8432-3addf59171e5` |
| `plugins[expo-notifications].icon` | Icono de notificaciones | `./assets/images/Logofesc.png` |
| `plugins[expo-notifications].color` | Color de notificaciones | `#d81b25` |

### Ejemplo de .env (No aplica)

Este proyecto no utiliza archivo `.env` ya que no hay variables sensibles ni configuraciones que varíen entre entornos. Toda la configuración está contenida en los archivos de configuración de Expo.

Si en el futuro se requieren variables de entorno, se podría crear un archivo `.env.example`:

```env
# Ejemplo para futuras implementaciones
# EXPO_PUBLIC_API_URL=https://api.ejemplo.com
# EXPO_PUBLIC_API_KEY=tu_api_key_aqui
```

---

## Estructura del Proyecto

```
proyecto/
├── app/                           # Directorio principal de la aplicación
│   ├── (tabs)/                    # Navegación por pestañas
│   │   ├── _layout.tsx            # Layout de tabs
│   │   ├── index.tsx              # Pantalla principal (Home)
│   │   └── secondview.tsx         # Vista secundaria
│   ├── services/                  # Servicios y lógica de negocio
│   │   ├── areasData.ts           # Definición de áreas
│   │   ├── notificationService.ts # Gestión de notificaciones
│   │   ├── scheduleService.ts     # Programación de horarios
│   │   ├── storageService.ts      # Persistencia de datos
│   │   └── timePreferencesService.ts # Preferencias de tiempo
│   ├── _layout.tsx                # Layout raíz
│   ├── welcome.tsx                # Pantalla de bienvenida
│   └── modal.tsx                  # Pantalla modal
├── components/                    # Componentes reutilizables
│   ├── themed-text.tsx
│   ├── themed-view.tsx
│   └── ui/                        # Componentes UI adicionales
├── constants/                     # Constantes y temas
│   └── theme.ts
├── hooks/                         # Custom React Hooks
├── assets/                        # Recursos estáticos
│   └── images/                    # Imágenes e iconos
├── app.json                       # Configuración de Expo
├── eas.json                       # Configuración de EAS Build
├── package.json                   # Dependencias del proyecto
├── tsconfig.json                  # Configuración de TypeScript
└── README.md                      # Este archivo
```

---

## 🔧 Solución de Problemas Comunes

### Error: "Expo CLI not found"

```bash
npm install -g expo-cli
```

### Error de permisos en notificaciones

Asegúrate de aceptar los permisos de notificaciones cuando la app lo solicite en el primer uso.

### La aplicación no se conecta al servidor de desarrollo

1. Verifica que tu computadora y dispositivo móvil estén en la misma red WiFi
2. Intenta ejecutar: `npx expo start --tunnel`

### Limpiar caché de Expo

```bash
npx expo start --clear
rm -rf node_modules
npm install
```

### Problemas con notificaciones en emuladores

Las notificaciones locales funcionan mejor en dispositivos físicos. Para probar completamente esta funcionalidad, se recomienda usar un dispositivo real.

---

## Funcionalidades Principales

- ✅ Gestión de notificaciones para 4 áreas de servicio
- ✅ Activación/desactivación selectiva por área
- ✅ Notificaciones diarias recurrentes
- ✅ Almacenamiento persistente de preferencias
- ✅ Funcionamiento offline completo
- ✅ Compatibilidad con Android e iOS
- ✅ Interfaz intuitiva y moderna
- ✅ Reprogramación manual de notificaciones

---

## 👥 Autores

**Fundación de Estudios Superiores Comfanorte (FESC)**

---

## Licencia

Este proyecto es privado y pertenece a la FESC.

---

## Enlaces Útiles

- [Documentación de Expo](https://docs.expo.dev/)
- [Documentación de React Native](https://reactnative.dev/)
- [Expo Notifications API](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [Repositorio del Proyecto](https://github.com/GaussParadox/ProyectoFesc)

---

## Soporte

Para soporte técnico o preguntas sobre el proyecto, contactar al equipo de desarrollo de la FESC.

---

*Última actualización: 23 de noviembre de 2025*
