/**
 * Servicio para enviar mensajes a Telegram
 * Requiere: VITE_TELEGRAM_BOT_TOKEN y VITE_TELEGRAM_CHAT_ID en variables de entorno
 */

const TELEGRAM_BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID;
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

/**
 * Envía un mensaje a Telegram
 * @param {string} message - Mensaje a enviar (soporta Markdown)
 * @returns {Promise<{ok: boolean, error?: string}>}
 */
export async function sendTelegramMessage(message) {
    // Validar que existan las variables de entorno
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
        return {
            ok: false,
            error: "Configuración de Telegram no encontrada. Verifica las variables de entorno VITE_TELEGRAM_BOT_TOKEN y VITE_TELEGRAM_CHAT_ID"
        };
    }

    try {
        const response = await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: 'Markdown', // Permite formato Markdown
            }),
        });

        const data = await response.json();

        if (!response.ok || !data.ok) {
            return {
                ok: false,
                error: data.description || 'Error al enviar mensaje a Telegram'
            };
        }

        return { ok: true };
    } catch (error) {
        console.error('Error enviando mensaje a Telegram:', error);
        return {
            ok: false,
            error: error.message || 'Error de red al enviar mensaje'
        };
    }
}

/**
 * Obtiene el icono de urgencia según el nivel de señal
 * @param {number} rxPower - Potencia RX en dbm
 * @returns {string} Icono de urgencia
 */
function getUrgencyIcon(rxPower) {
    if (rxPower === null || rxPower === undefined) return '❓';
    if (rxPower <= -27) return '🔴'; // Muy crítica
    if (rxPower <= -25) return '🟠'; // Crítica
    if (rxPower <= -23) return '🟡'; // Advertencia
    return '⚠️'; // Baja
}

/**
 * Obtiene el nivel de urgencia en texto
 * @param {number} rxPower - Potencia RX en dbm
 * @returns {string} Nivel de urgencia
 */
function getUrgencyLevel(rxPower) {
    if (rxPower === null || rxPower === undefined) return 'Desconocido';
    if (rxPower <= -27) return 'MUY CRÍTICA';
    if (rxPower <= -25) return 'CRÍTICA';
    if (rxPower <= -23) return 'ADVERTENCIA';
    return 'BAJA';
}

/**
 * Formatea un mensaje de alerta para una ONT con señal baja
 * @param {Object} ont - Objeto con los datos de la ONT
 * @param {number} index - Índice de la ONT en la lista ordenada
 * @returns {string} Mensaje formateado en Markdown
 */
export function formatOntAlertMessage(ont, index = null) {
    const cliente = ont.abonado || 'Sin asignar';
    const potencia = ont.RX_Power !== null && ont.RX_Power !== undefined
        ? ont.RX_Power
        : null;
    const potenciaFormatted = potencia !== null
        ? `${potencia.toFixed(2)} dbm`
        : 'N/A';
    const serie = ont.serialnumber || 'N/A';
    const modelo = ont.productclass || 'N/A';
    const ultimoReporte = ont.ont_lastinform_local || 'N/A';

    const urgencyIcon = getUrgencyIcon(potencia);
    const urgencyLevel = getUrgencyLevel(potencia);
    const numero = index !== null ? `${index + 1}. ` : '';

    return `${numero}${urgencyIcon} *${cliente}*
📊 *Potencia RX:* ${potenciaFormatted} (${urgencyLevel})
🔢 *Serie:* ${serie}
📦 *Modelo:* ${modelo}
🕐 *Último Reporte:* ${ultimoReporte}
━━━━━━━━━━━━━━━━━━━━`;
}

/**
 * Ordena las ONTs por urgencia (señal más baja primero)
 * @param {Array} onts - Array de objetos ONT
 * @returns {Array} Array ordenado por urgencia
 */
function sortOntsByUrgency(onts) {
    return [...onts].sort((a, b) => {
        const powerA = a.RX_Power !== null && a.RX_Power !== undefined ? a.RX_Power : -999;
        const powerB = b.RX_Power !== null && b.RX_Power !== undefined ? b.RX_Power : -999;
        // Ordenar de menor a mayor (valores más negativos primero = más urgente)
        return powerA - powerB;
    });
}

/**
 * Agrupa las ONTs por nivel de urgencia
 * @param {Array} onts - Array de objetos ONT ordenados
 * @returns {Object} Objeto con ONTs agrupadas por urgencia
 */
function groupOntsByUrgency(onts) {
    const groups = {
        muyCritica: [], // <= -27
        critica: [],    // -27 a -25
        advertencia: [], // -25 a -23
        baja: []        // > -23
    };

    onts.forEach(ont => {
        const power = ont.RX_Power;
        if (power === null || power === undefined) {
            groups.baja.push(ont);
        } else if (power <= -27) {
            groups.muyCritica.push(ont);
        } else if (power <= -25) {
            groups.critica.push(ont);
        } else if (power <= -23) {
            groups.advertencia.push(ont);
        } else {
            groups.baja.push(ont);
        }
    });

    return groups;
}

/**
 * Formatea un mensaje de alerta para una ONT sin reporte
 * @param {Object} ont - Objeto con los datos de la ONT
 * @param {number} index - Índice de la ONT en la lista
 * @returns {string} Mensaje formateado en Markdown
 */
export function formatOntNoReportMessage(ont, index = null) {
    const cliente = ont.abonado || 'Sin asignar';
    const serie = ont.serialnumber || 'N/A';
    const modelo = ont.productclass || 'N/A';
    const ultimoReporte = ont.ont_lastinform_local || 'N/A';
    
    // Calcular horas sin reporte
    let horasSinReporte = 'N/A';
    if (ont.ont_lastinform_local) {
        try {
            const lastReport = new Date(ont.ont_lastinform_local);
            const ahora = new Date();
            const diffMs = ahora - lastReport;
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            horasSinReporte = `${diffHours} horas`;
        } catch (e) {
            horasSinReporte = 'N/A';
        }
    }

    const numero = index !== null ? `${index + 1}. ` : '';

    return `${numero}⏰ *${cliente}* - Sin reporte hace más de 12 horas
🔢 *Serie:* ${serie}
📦 *Modelo:* ${modelo}
🕐 *Último Reporte:* ${ultimoReporte}
⏱️ *Tiempo sin reporte:* ${horasSinReporte}
━━━━━━━━━━━━━━━━━━━━`;
}

/**
 * Formatea un mensaje de alerta para una ONT que cambió de estado
 * @param {Object} ont - Objeto con los datos de la ONT
 * @param {Object} previousState - Estado anterior de la ONT
 * @param {number} index - Índice de la ONT en la lista
 * @returns {string} Mensaje formateado en Markdown
 */
export function formatOntStateChangeMessage(ont, previousState, index = null) {
    const cliente = ont.abonado || 'Sin asignar';
    const serie = ont.serialnumber || 'N/A';
    const modelo = ont.productclass || 'N/A';
    
    const estadoAnterior = previousState?.RX_Estado || 'unknown';
    const estadoActual = ont.RX_Estado || 'unknown';
    
    const estados = {
        'success': '✅ En línea',
        'danger': '🔴 Señal baja',
        'warning': '⚠️ Advertencia',
        'unknown': '❓ Desconocido'
    };

    const numero = index !== null ? `${index + 1}. ` : '';

    return `${numero}🔄 *${cliente}* - Cambio de Estado
🔢 *Serie:* ${serie}
📦 *Modelo:* ${modelo}
📊 *Estado Anterior:* ${estados[estadoAnterior] || estadoAnterior}
📊 *Estado Actual:* ${estados[estadoActual] || estadoActual}
━━━━━━━━━━━━━━━━━━━━`;
}

/**
 * Envía alertas para múltiples ONTs con diferentes tipos de problemas
 * @param {Object|Array} alerts - Objeto con arrays de ONTs o Array simple (compatibilidad)
 * @returns {Promise<{ok: boolean, sent: number, errors: Array}>}
 */
export async function sendMultipleOntAlerts(alerts) {
    // Compatibilidad: si es un array, tratarlo como señal baja
    let ontsWithLowSignal = [];
    let ontsWithoutReport = [];
    let ontsWithStateChange = [];
    let previousStates = {};

    if (Array.isArray(alerts)) {
        // Modo legacy: solo señal baja
        ontsWithLowSignal = alerts;
    } else {
        // Nuevo modo: objeto con diferentes tipos
        ontsWithLowSignal = alerts.lowSignal || [];
        ontsWithoutReport = alerts.withoutReport || [];
        ontsWithStateChange = alerts.stateChange || [];
        previousStates = alerts.previousStates || {};
    }

    const totalAlerts = ontsWithLowSignal.length + ontsWithoutReport.length + ontsWithStateChange.length;

    if (totalAlerts === 0) {
        return {
            ok: true,
            sent: 0,
            errors: []
        };
    }

    const errors = [];
    let sent = 0;

    // Construir mensaje completo
    let header = `🚨 *ALERTAS DE ONT*\n\n`;

    // Resumen por tipo
    const summary = [];
    if (ontsWithLowSignal.length > 0) {
        summary.push(`🔴 Señal Baja: ${ontsWithLowSignal.length}`);
    }
    if (ontsWithoutReport.length > 0) {
        summary.push(`⏰ Sin Reporte (>12h): ${ontsWithoutReport.length}`);
    }
    if (ontsWithStateChange.length > 0) {
        summary.push(`🔄 Cambio de Estado: ${ontsWithStateChange.length}`);
    }

    if (summary.length > 0) {
        header += `*Resumen:*\n${summary.join('\n')}\n\n`;
    }

    // Construir mensajes por tipo
    const messages = [];

    // ONTs con señal baja
    if (ontsWithLowSignal.length > 0) {
        const sortedOnts = sortOntsByUrgency(ontsWithLowSignal);
        const groups = groupOntsByUrgency(sortedOnts);
        const allOntsOrdered = [
            ...groups.muyCritica,
            ...groups.critica,
            ...groups.advertencia,
            ...groups.baja
        ];

        messages.push(`*🔴 ONTs con Señal Baja (${ontsWithLowSignal.length}):*\n`);
        allOntsOrdered.forEach((ont, index) => {
            messages.push(formatOntAlertMessage(ont, index));
        });
    }

    // ONTs sin reporte
    if (ontsWithoutReport.length > 0) {
        messages.push(`\n*⏰ ONTs sin Reporte hace más de 12 horas (${ontsWithoutReport.length}):*\n`);
        ontsWithoutReport.forEach((ont, index) => {
            messages.push(formatOntNoReportMessage(ont, index));
        });
    }

    // ONTs con cambio de estado
    if (ontsWithStateChange.length > 0) {
        messages.push(`\n*🔄 ONTs con Cambio de Estado (${ontsWithStateChange.length}):*\n`);
        ontsWithStateChange.forEach((ont, index) => {
            const previousState = previousStates[ont.id] || {};
            messages.push(formatOntStateChangeMessage(ont, previousState, index));
        });
    }

    const fullMessage = header + messages.join('\n\n');

    // Si el mensaje es muy largo, dividirlo en partes
    const maxLength = 4000; // Límite de Telegram es 4096, dejamos margen
    if (fullMessage.length > maxLength) {
        // Enviar en partes
        const parts = [];
        let currentPart = header;

        // Agregar ONTs con señal baja
        if (ontsWithLowSignal.length > 0) {
            const sortedOnts = sortOntsByUrgency(ontsWithLowSignal);
            const groups = groupOntsByUrgency(sortedOnts);
            const allOntsOrdered = [
                ...groups.muyCritica,
                ...groups.critica,
                ...groups.advertencia,
                ...groups.baja
            ];

            const sectionHeader = `*🔴 ONTs con Señal Baja (${ontsWithLowSignal.length}):*\n`;
            if ((currentPart + sectionHeader).length > maxLength) {
                parts.push(currentPart);
                currentPart = sectionHeader;
            } else {
                currentPart += sectionHeader;
            }

            allOntsOrdered.forEach((ont, index) => {
                const ontMessage = formatOntAlertMessage(ont, index);
                if ((currentPart + ontMessage).length > maxLength) {
                    parts.push(currentPart);
                    currentPart = ontMessage;
                } else {
                    currentPart += '\n\n' + ontMessage;
                }
            });
        }

        // Agregar ONTs sin reporte
        if (ontsWithoutReport.length > 0) {
            const sectionHeader = `\n*⏰ ONTs sin Reporte (${ontsWithoutReport.length}):*\n`;
            if ((currentPart + sectionHeader).length > maxLength) {
                parts.push(currentPart);
                currentPart = sectionHeader;
            } else {
                currentPart += sectionHeader;
            }

            ontsWithoutReport.forEach((ont, index) => {
                const ontMessage = formatOntNoReportMessage(ont, index);
                if ((currentPart + ontMessage).length > maxLength) {
                    parts.push(currentPart);
                    currentPart = ontMessage;
                } else {
                    currentPart += '\n\n' + ontMessage;
                }
            });
        }

        // Agregar ONTs con cambio de estado
        if (ontsWithStateChange.length > 0) {
            const sectionHeader = `\n*🔄 ONTs con Cambio de Estado (${ontsWithStateChange.length}):*\n`;
            if ((currentPart + sectionHeader).length > maxLength) {
                parts.push(currentPart);
                currentPart = sectionHeader;
            } else {
                currentPart += sectionHeader;
            }

            ontsWithStateChange.forEach((ont, index) => {
                const previousState = previousStates[ont.id] || {};
                const ontMessage = formatOntStateChangeMessage(ont, previousState, index);
                if ((currentPart + ontMessage).length > maxLength) {
                    parts.push(currentPart);
                    currentPart = ontMessage;
                } else {
                    currentPart += '\n\n' + ontMessage;
                }
            });
        }

        if (currentPart) {
            parts.push(currentPart);
        }

        // Enviar cada parte
        for (const part of parts) {
            const result = await sendTelegramMessage(part);
            if (result.ok) {
                sent += part.split('━━━━━━━━━━━━━━━━━━━━').length - 1;
            } else {
                errors.push(result.error);
            }
            // Pausa entre mensajes
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    } else {
        // Enviar mensaje único
        const result = await sendTelegramMessage(fullMessage);
        if (result.ok) {
            sent = totalAlerts;
        } else {
            errors.push(result.error);
        }
    }

    return {
        ok: errors.length === 0,
        sent,
        errors
    };
}

