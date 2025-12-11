# Guía: Mapa de Ubicación del Cliente

## 📋 Formato de Dirección desde la API

Para que el mapa funcione correctamente, la API debe enviar la dirección en uno de estos formatos:

### Opción 1: Dirección Completa (Recomendado)

```json
{
  "cliente": {
    "Domicilio": "Av. San Martín 1234",
    "Localidad": "Buenos Aires",
    "Provincia": "Buenos Aires",
    "CodigoPostal": "1234"
  }
}
```

**Formato combinado:** `Domicilio + Localidad + Provincia + Código Postal`

- Ejemplo: "Av. San Martín 1234, Buenos Aires, Buenos Aires, 1234"

### Opción 2: Dirección con Coordenadas (Ideal)

```json
{
  "cliente": {
    "Domicilio": "Av. San Martín 1234",
    "Localidad": "Buenos Aires",
    "Provincia": "Buenos Aires",
    "Latitud": -34.603722,
    "Longitud": -58.381592
  }
}
```

Si la API ya tiene las coordenadas, el mapa se mostrará instantáneamente sin necesidad de geocodificación.

### Opción 3: Dirección Mínima

```json
{
  "cliente": {
    "Domicilio": "Av. San Martín 1234",
    "Localidad": "Buenos Aires"
  }
}
```

**Formato combinado:** `Domicilio + Localidad`

- Ejemplo: "Av. San Martín 1234, Buenos Aires"

---

## 🗺️ Componentes Implementados

1. **ClientMap.jsx** - Componente del mapa
2. **useGeocode.jsx** - Hook para geocodificación
3. **ClientInfo.jsx** - Actualizado con el mapa

---

## 🔧 Configuración

### Si usas Google Maps (requiere API Key):

1. Obtén una API Key de Google Maps
2. Agrega a `.env`: `VITE_GOOGLE_MAPS_API_KEY=tu_api_key`
3. El componente detectará automáticamente si hay API key

### Si usas OpenStreetMap (gratis, sin API Key):

- No requiere configuración adicional
- Funciona automáticamente

---

## 📍 Prioridad de Ubicación

El sistema intentará obtener la ubicación en este orden:

1. **Coordenadas directas** (Latitud/Longitud) - Si están disponibles
2. **Dirección completa** - Domicilio + Localidad + Provincia + CP
3. **Dirección básica** - Domicilio + Localidad

---

## ⚠️ Recomendaciones para la API

### Mejor Práctica:

```json
{
  "cliente": {
    "Domicilio": "Av. San Martín 1234",
    "Localidad": "Buenos Aires",
    "Provincia": "Buenos Aires",
    "CodigoPostal": "1234",
    "Latitud": -34.603722,
    "Longitud": -58.381592
  }
}
```

### Campos Opcionales pero Recomendados:

- `Provincia` - Mejora la precisión de geocodificación
- `CodigoPostal` - Ayuda a ubicar mejor la dirección
- `Latitud` / `Longitud` - Evita geocodificación (más rápido)

---

## 🎯 Ejemplo de Respuesta de API

```json
{
  "cliente": {
    "id": 1,
    "Razonsocial": "Cliente Ejemplo S.A.",
    "NumeroCliente": "12345",
    "Domicilio": "Av. San Martín 1234",
    "Localidad": "Buenos Aires",
    "Provincia": "Buenos Aires",
    "CodigoPostal": "1234",
    "Telefono": "11-1234-5678",
    "Latitud": -34.603722,
    "Longitud": -58.381592
  }
}
```

---

## 🔍 Geocodificación

Si no hay coordenadas, el sistema usará:

- **Nominatim (OpenStreetMap)** - Gratis, sin API key
- Límite: 1 solicitud por segundo (suficiente para uso normal)

Si tienes Google Maps API Key:

- **Google Geocoding API** - Más preciso, requiere API key
- Límite: Según tu plan de Google
