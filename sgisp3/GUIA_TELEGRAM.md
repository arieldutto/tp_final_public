# Guía: Envío de Alertas a Telegram

## 📋 Requisitos Previos

Para enviar mensajes a Telegram necesitas:

1. **Bot Token de Telegram**
2. **Chat ID** (ID del chat donde quieres recibir los mensajes)

---

## 🔧 Paso 1: Crear un Bot de Telegram

### 1.1. Crear el Bot

1. Abre Telegram y busca **@BotFather**
2. Envía el comando `/newbot`
3. Sigue las instrucciones para darle un nombre y username a tu bot
4. BotFather te dará un **Token** que se ve así: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`

### 1.2. Obtener el Chat ID

Hay dos formas:

**Opción A: Usando @userinfobot**

1. Busca **@userinfobot** en Telegram
2. Inicia una conversación y envía `/start`
3. Te mostrará tu Chat ID (un número como `123456789`)

**Opción B: Usando @getidsbot**

1. Busca **@getidsbot** en Telegram
2. Inicia una conversación
3. Te mostrará tu Chat ID

**Opción C: Crear un grupo y agregar el bot**

1. Crea un grupo en Telegram
2. Agrega tu bot al grupo
3. Envía un mensaje al grupo
4. Visita: `https://api.telegram.org/8216913209:AAHX3G036MHP_t7I_5HTnrnEi9z3yzO82NY/getUpdates`
5. Busca el `chat.id` en la respuesta JSON

---

## 📝 Paso 2: Configurar Variables de Entorno

Agrega estas variables a tu archivo `.env`:

```env
VITE_TELEGRAM_BOT_TOKEN=tu_bot_token_aqui
VITE_TELEGRAM_CHAT_ID=tu_chat_id_aqui
```

**⚠️ IMPORTANTE:**

- En producción (Vercel), agrega estas variables en el dashboard de Vercel
- Nunca subas el archivo `.env` con tokens reales a GitHub

---

## 🚀 Paso 3: Implementación en el Código

### Estructura de Archivos a Crear:

```
src/
├── services/
│   └── telegramService.js    # Servicio para enviar mensajes
└── features/
    └── onts/
        ├── hooks/
        │   └── useTelegramAlert.js  # Hook para manejar alertas
        └── components/
            └── TelegramAlertButton.jsx  # Botón para enviar alertas
```

---

## 📊 Datos que se Enviarán

Para cada ONT con señal baja se enviará:

- **Nombre del Cliente** (abonado)
- **Estado de Señal** (Señal baja)
- **Valor de Potencia RX** (ej: -26.2 dbm)
- **Número de Serie** (serialnumber)
- **Modelo** (productclass)
- **Último Reporte** (ont_lastinform_local)

---

## 🔐 Seguridad

- Los tokens de Telegram son sensibles
- Úsalos solo en variables de entorno
- No los expongas en el código fuente
- En producción, usa variables de entorno del hosting

---

## 📱 Formato del Mensaje

El mensaje se enviará en formato Markdown de Telegram:

```
⚠️ ALERTA: ONT con Señal Baja

👤 Cliente: [Nombre del Cliente]
📡 Estado: Señal Baja
📊 Potencia RX: -26.2 dbm
🔢 Serie: 4857544396215740
📦 Modelo: DN-HG8421A
🕐 Último Reporte: 2025-12-10 08:14:38
```

---

## ⚙️ Funcionalidades Adicionales

Puedes extender esto para:

- Envío automático cada X minutos
- Envío solo cuando cambia el estado
- Agrupar múltiples alertas en un solo mensaje
- Enviar a múltiples chats/grupos
