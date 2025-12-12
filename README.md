# Mandao Service Driver App

Aplicación móvil React Native para conductores del sistema Mandao Service. Permite a los conductores gestionar órdenes, enviar ubicación en tiempo real y comunicarse con el sistema de despacho.

## Stack Tecnológico

- **Framework:** React Native 0.83.0 (CLI)
- **Lenguaje:** TypeScript 5.8.3
- **Navegación:** React Navigation (pendiente)
- **Estado:** React Query / Context API (pendiente)
- **Geolocalización:** @react-native-community/geolocation (pendiente)
- **WebSocket:** react-native-websocket (pendiente)
- **Almacenamiento:** @react-native-async-storage/async-storage (pendiente)

## Requisitos Previos

- Node.js >= 20
- React Native CLI
- Android Studio (para Android)
- Xcode (para iOS, solo macOS)

## Instalación

```bash
# Instalar dependencias
npm install

# iOS (solo macOS)
cd ios && pod install && cd ..
```

## Ejecución

### Android

```bash
npm run android
```

### iOS

```bash
npm run ios
```

### Metro Bundler

```bash
npm start
```

## Estructura del Proyecto

```
mandao-service-driver-app/
├── android/          # Código nativo Android
├── ios/              # Código nativo iOS
├── src/              # Código fuente (pendiente)
│   ├── screens/      # Pantallas
│   ├── components/   # Componentes reutilizables
│   ├── navigation/   # Configuración de navegación
│   ├── services/     # Servicios (API, WebSocket, etc.)
│   ├── hooks/        # Custom hooks
│   ├── utils/        # Utilidades
│   └── types/        # Tipos TypeScript
├── App.tsx           # Componente raíz
└── package.json      # Dependencias
```

## Funcionalidades Principales

- ✅ Autenticación de conductores
- ⏳ Dashboard con órdenes asignadas
- ⏳ Aceptar/rechazar órdenes
- ⏳ Tracking de ubicación en tiempo real
- ⏳ Envío de ubicación vía WebSocket
- ⏳ Gestión de perfil y vehículo

## Desarrollo

### Testing

```bash
npm test
```

### Linting

```bash
npm run lint
```

## Notas

- Este proyecto usa React Native CLI (no Expo)
- La configuración de TypeScript está incluida
- Los permisos de ubicación deben configurarse en AndroidManifest.xml e Info.plist
