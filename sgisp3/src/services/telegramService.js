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
 * Envía alertas para múltiples ONTs con señal baja
 * @param {Array} onts - Array de objetos ONT con señal baja
 * @returns {Promise<{ok: boolean, sent: number, errors: Array}>}
 */
export async function sendMultipleOntAlerts(onts) {
    if (!onts || onts.length === 0) {
        return {
            ok: true,
            sent: 0,
            errors: []
        };
    }

    // Ordenar por urgencia (señal más baja primero)
    const sortedOnts = sortOntsByUrgency(onts);
    const groups = groupOntsByUrgency(sortedOnts);

    const errors = [];
    let sent = 0;

    // Construir mensaje agrupado y ordenado
    let header = `🚨 *ALERTA: ${onts.length} ONT(s) con Señal Baja*\n\n`;

    // Agregar resumen por urgencia
    const summary = [];
    if (groups.muyCritica.length > 0) {
        summary.push(`🔴 Muy Crítica (≤-27dbm): ${groups.muyCritica.length}`);
    }
    if (groups.critica.length > 0) {
        summary.push(`🟠 Crítica (-27 a -25dbm): ${groups.critica.length}`);
    }
    if (groups.advertencia.length > 0) {
        summary.push(`🟡 Advertencia (-25 a -23dbm): ${groups.advertencia.length}`);
    }
    if (groups.baja.length > 0) {
        summary.push(`⚠️ Baja (>-23dbm): ${groups.baja.length}`);
    }

    if (summary.length > 0) {
        header += `*Resumen por Urgencia:*\n${summary.join('\n')}\n\n`;
        header += `*Listado ordenado por urgencia (más críticas primero):*\n\n`;
    }

    // Construir lista de ONTs ordenadas
    const allOntsOrdered = [
        ...groups.muyCritica,
        ...groups.critica,
        ...groups.advertencia,
        ...groups.baja
    ];

    const messages = allOntsOrdered.map((ont, index) => {
        return formatOntAlertMessage(ont, index);
    });

    const fullMessage = header + messages.join('\n\n');

    // Si el mensaje es muy largo, dividirlo en partes
    const maxLength = 4000; // Límite de Telegram es 4096, dejamos margen
    if (fullMessage.length > maxLength) {
        // Enviar en partes
        const parts = [];
        let currentPart = header;

        allOntsOrdered.forEach((ont, index) => {
            const ontMessage = formatOntAlertMessage(ont, index);
            if ((currentPart + ontMessage).length > maxLength) {
                parts.push(currentPart);
                currentPart = ontMessage;
            } else {
                currentPart += '\n\n' + ontMessage;
            }
        });

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
            sent = onts.length;
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

