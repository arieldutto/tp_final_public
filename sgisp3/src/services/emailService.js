/**
 * Servicio para enviar mensajes por Email
 * Utiliza la API del backend para envío de emails
 */

import { API_SGISP } from '../config';
import { getOntCriticalTime, formatCriticalTime } from '../utils/ontCriticalTimeTracker';

/**
 * Envía un email genérico
 * @param {string|Array} toEmail - Email(s) destinatario(s)
 * @param {string} subject - Asunto del email
 * @param {string} message - Mensaje en texto plano
 * @param {string} htmlMessage - Mensaje en HTML (opcional)
 * @param {string|Array} cc - Email(s) en copia (opcional)
 * @param {string|Array} bcc - Email(s) en copia oculta (opcional)
 * @returns {Promise<{ok: boolean, error?: string}>}
 */
export async function sendEmail(toEmail, subject, message, htmlMessage = null, cc = null, bcc = null) {
    try {
        // Convertir string con comas a array si es necesario
        let emailArray = toEmail;
        if (typeof toEmail === 'string' && toEmail.includes(',')) {
            emailArray = toEmail.split(',').map(email => email.trim()).filter(email => email.length > 0);
        }

        const body = {
            to_email: emailArray,
            subject: subject,
            message: message
        };

        if (htmlMessage) {
            body.html_message = htmlMessage;
        }
        if (cc) {
            body.cc = cc;
        }
        if (bcc) {
            body.bcc = bcc;
        }

        const response = await fetch(`${API_SGISP}/enviar_email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        });

        const data = await response.json();

        if (!response.ok || !data.enviado) {
            return {
                ok: false,
                error: data.message || 'Error al enviar email'
            };
        }

        return { ok: true };
    } catch (error) {
        console.error('Error enviando email:', error);
        return {
            ok: false,
            error: error.message || 'Error de red al enviar email'
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
 * Obtiene el color según el nivel de urgencia
 * @param {number} rxPower - Potencia RX en dbm
 * @returns {string} Color en hexadecimal
 */
function getUrgencyColor(rxPower) {
    if (rxPower === null || rxPower === undefined) return '#757575';
    if (rxPower <= -27) return '#f44336'; // Rojo - Muy crítica
    if (rxPower <= -25) return '#ff9800'; // Naranja - Crítica
    if (rxPower <= -23) return '#ffc107'; // Amarillo - Advertencia
    return '#ffeb3b'; // Amarillo claro - Baja
}

/**
 * Genera HTML para una ONT con señal baja
 * @param {Object} ont - Objeto con los datos de la ONT
 * @param {number} index - Índice de la ONT en la lista
 * @returns {string} HTML formateado
 */
function formatOntAlertHTML(ont, index = null) {
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
    const urgencyColor = getUrgencyColor(potencia);

    // Obtener tiempo en estado crítico
    const criticalTime = getOntCriticalTime(ont);
    const tiempoCritico = criticalTime ? formatCriticalTime(criticalTime) : null;

    // Determinar urgencia y emoji de estado
    let statusEmoji = '⚠️';
    let statusText = 'Advertencia';
    let cardBgColor = '#ffffff';
    let cardBorderColor = '#ffc107';
    let cardShadow = '0 2px 8px rgba(255, 193, 7, 0.15)';

    if (potencia !== null && potencia <= -27) {
        statusEmoji = '🔴';
        statusText = 'MUY CRITICA';
        cardBgColor = '#fff5f5';
        cardBorderColor = '#f44336';
        cardShadow = '0 4px 16px rgba(244, 67, 54, 0.25)';
    } else if (potencia !== null && potencia <= -25) {
        statusEmoji = '🟠';
        statusText = 'CRITICA';
        cardBgColor = '#fff8e1';
        cardBorderColor = '#ff9800';
        cardShadow = '0 3px 12px rgba(255, 152, 0, 0.2)';
    } else if (potencia !== null && potencia <= -23) {
        statusEmoji = '🟡';
        statusText = 'URGENTE';
        cardBgColor = '#fffde7';
        cardBorderColor = '#ffc107';
        cardShadow = '0 2px 8px rgba(255, 193, 7, 0.15)';
    }

    const numero = index !== null ? `${index + 1}. ` : '';

    return `
        <div style="margin-bottom: 20px; padding: 0; background-color: ${cardBgColor}; border: 2px solid ${cardBorderColor}; border-radius: 12px; box-shadow: ${cardShadow}; overflow: hidden;">
            <div style="padding: 20px;">
                <div style="display: flex; align-items: flex-start; gap: 16px; margin-bottom: 16px;">
                    <div style="font-size: 36px; line-height: 1; flex-shrink: 0;">${statusEmoji}</div>
                    <div style="flex: 1;">
                        <div style="font-size: 20px; font-weight: 700; color: #1a1a1a; margin-bottom: 8px; line-height: 1.3;">
                            ${numero}${cliente}
                        </div>
                        <div style="font-size: 18px; font-weight: 600; color: ${cardBorderColor}; margin-bottom: 4px;">
                            ${potenciaFormatted}
                        </div>
                        ${tiempoCritico ? `
                        <div style="font-size: 13px; color: ${cardBorderColor}; font-weight: 600; margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">
                            <span>⏱️</span>
                            <span>Tiempo en estado critico: ${tiempoCritico}</span>
                        </div>
                        ` : ''}
                        <div style="display: inline-block; padding: 4px 12px; background-color: ${cardBorderColor}; color: white; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 4px;">
                            ${statusText}
                        </div>
                    </div>
                </div>
                <div style="border-top: 1px solid ${cardBorderColor}30; padding-top: 16px; margin-top: 16px;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 13px;">
                        <div>
                            <div style="color: #666; margin-bottom: 4px;">Serie</div>
                            <div style="color: #1a1a1a; font-weight: 600; font-family: 'Courier New', monospace;">${serie}</div>
                        </div>
                        <div>
                            <div style="color: #666; margin-bottom: 4px;">Modelo</div>
                            <div style="color: #1a1a1a; font-weight: 600;">${modelo}</div>
                        </div>
                        <div style="grid-column: 1 / -1;">
                            <div style="color: #666; margin-bottom: 4px;">Ultimo Reporte</div>
                            <div style="color: #1a1a1a; font-weight: 500;">${ultimoReporte}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Genera HTML para una ONT sin reporte
 * @param {Object} ont - Objeto con los datos de la ONT
 * @param {number} index - Índice de la ONT en la lista
 * @returns {string} HTML formateado
 */
function formatOntNoReportHTML(ont, index = null) {
    const cliente = ont.abonado || 'Sin asignar';
    const serie = ont.serialnumber || 'N/A';
    const modelo = ont.productclass || 'N/A';
    const ultimoReporte = ont.ont_lastinform_local || 'N/A';

    // Calcular horas sin reporte
    let horasSinReporte = 'N/A';
    let horasNumero = 0;
    if (ont.ont_lastinform_local) {
        try {
            const lastReport = new Date(ont.ont_lastinform_local);
            const ahora = new Date();
            const diffMs = ahora - lastReport;
            horasNumero = Math.floor(diffMs / (1000 * 60 * 60));
            horasSinReporte = `${horasNumero} horas`;
        } catch (e) {
            horasSinReporte = 'N/A';
        }
    }

    // Determinar urgencia y emoji según horas sin reporte
    let statusEmoji = '⏰';
    let statusText = 'SIN REPORTE';
    let cardBgColor = '#fffbf0';
    let cardBorderColor = '#ffc107';
    let cardShadow = '0 2px 8px rgba(255, 193, 7, 0.15)';

    if (horasNumero >= 24) {
        statusEmoji = '🔴';
        statusText = 'MUY URGENTE';
        cardBgColor = '#fff3e0';
        cardBorderColor = '#ff5722';
        cardShadow = '0 4px 16px rgba(255, 87, 34, 0.25)';
    } else if (horasNumero >= 18) {
        statusEmoji = '🟠';
        statusText = 'URGENTE';
        cardBgColor = '#fff8e1';
        cardBorderColor = '#ff9800';
        cardShadow = '0 3px 12px rgba(255, 152, 0, 0.2)';
    }

    const numero = index !== null ? `${index + 1}. ` : '';

    return `
        <div style="margin-bottom: 20px; padding: 0; background-color: ${cardBgColor}; border: 2px solid ${cardBorderColor}; border-radius: 12px; box-shadow: ${cardShadow}; overflow: hidden;">
            <div style="padding: 20px;">
                <div style="display: flex; align-items: flex-start; gap: 16px; margin-bottom: 16px;">
                    <div style="font-size: 36px; line-height: 1; flex-shrink: 0;">${statusEmoji}</div>
                    <div style="flex: 1;">
                        <div style="font-size: 20px; font-weight: 700; color: #1a1a1a; margin-bottom: 8px; line-height: 1.3;">
                            ${numero}${cliente}
                        </div>
                        <div style="font-size: 18px; font-weight: 600; color: ${cardBorderColor}; margin-bottom: 4px;">
                            ${horasSinReporte} sin reporte
                        </div>
                        <div style="display: inline-block; padding: 4px 12px; background-color: ${cardBorderColor}; color: white; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 4px;">
                            ${statusText}
                        </div>
                    </div>
                </div>
                <div style="border-top: 1px solid ${cardBorderColor}30; padding-top: 16px; margin-top: 16px;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 13px;">
                        <div>
                            <div style="color: #666; margin-bottom: 4px;">Serie</div>
                            <div style="color: #1a1a1a; font-weight: 600; font-family: 'Courier New', monospace;">${serie}</div>
                        </div>
                        <div>
                            <div style="color: #666; margin-bottom: 4px;">Modelo</div>
                            <div style="color: #1a1a1a; font-weight: 600;">${modelo}</div>
                        </div>
                        <div style="grid-column: 1 / -1;">
                            <div style="color: #666; margin-bottom: 4px;">Ultimo Reporte</div>
                            <div style="color: #1a1a1a; font-weight: 500;">${ultimoReporte}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Genera HTML para una ONT con cambio de estado
 * @param {Object} ont - Objeto con los datos de la ONT
 * @param {Object} previousState - Estado anterior de la ONT
 * @param {number} index - Índice de la ONT en la lista
 * @returns {string} HTML formateado
 */
function formatOntStateChangeHTML(ont, previousState, index = null) {
    const cliente = ont.abonado || 'Sin asignar';
    const serie = ont.serialnumber || 'N/A';
    const modelo = ont.productclass || 'N/A';

    const estadoAnterior = previousState?.RX_Estado || 'unknown';
    const estadoActual = ont.RX_Estado || 'unknown';

    const estados = {
        'success': { text: 'En linea', color: '#4caf50', icon: '✅' },
        'danger': { text: 'Senal baja', color: '#f44336', icon: '🔴' },
        'warning': { text: 'Advertencia', color: '#ff9800', icon: '⚠️' },
        'unknown': { text: 'Desconocido', color: '#757575', icon: '❓' }
    };

    const estadoAnteriorInfo = estados[estadoAnterior] || { text: estadoAnterior, color: '#757575', icon: '❓' };
    const estadoActualInfo = estados[estadoActual] || { text: estadoActual, color: '#757575', icon: '❓' };

    const potencia = ont.RX_Power !== null && ont.RX_Power !== undefined
        ? `${ont.RX_Power.toFixed(2)} dbm`
        : 'N/A';

    // Determinar si el cambio es crítico (empeoró)
    const isCriticalChange = estadoAnterior === 'success' && estadoActual === 'danger';
    const isImprovement = estadoAnterior === 'danger' && estadoActual === 'success';

    let statusEmoji = '🔄';
    let statusText = 'CAMBIO DE ESTADO';
    let cardBgColor = '#e8f4fd';
    let cardBorderColor = '#2196f3';
    let cardShadow = '0 2px 8px rgba(33, 150, 243, 0.15)';

    if (isCriticalChange) {
        statusEmoji = '🔴';
        statusText = 'EMPEORO';
        cardBgColor = '#fff3e0';
        cardBorderColor = '#ff5722';
        cardShadow = '0 4px 16px rgba(255, 87, 34, 0.25)';
    } else if (isImprovement) {
        statusEmoji = '✅';
        statusText = 'MEJORO';
        cardBgColor = '#e8f5e9';
        cardBorderColor = '#4caf50';
        cardShadow = '0 2px 8px rgba(76, 175, 80, 0.15)';
    }

    const numero = index !== null ? `${index + 1}. ` : '';

    return `
        <div style="margin-bottom: 20px; padding: 0; background-color: ${cardBgColor}; border: 2px solid ${cardBorderColor}; border-radius: 12px; box-shadow: ${cardShadow}; overflow: hidden;">
            <div style="padding: 20px;">
                <div style="display: flex; align-items: flex-start; gap: 16px; margin-bottom: 16px;">
                    <div style="font-size: 36px; line-height: 1; flex-shrink: 0;">${statusEmoji}</div>
                    <div style="flex: 1;">
                        <div style="font-size: 20px; font-weight: 700; color: #1a1a1a; margin-bottom: 8px; line-height: 1.3;">
                            ${numero}${cliente}
                        </div>
                        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 4px; flex-wrap: wrap;">
                            <span style="font-size: 14px; color: ${estadoAnteriorInfo.color};">
                                ${estadoAnteriorInfo.icon} ${estadoAnteriorInfo.text}
                            </span>
                            <span style="color: #999;">→</span>
                            <span style="font-size: 15px; font-weight: 600; color: ${estadoActualInfo.color};">
                                ${estadoActualInfo.icon} ${estadoActualInfo.text}
                            </span>
                        </div>
                        <div style="display: inline-block; padding: 4px 12px; background-color: ${cardBorderColor}; color: white; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 4px;">
                            ${statusText}
                        </div>
                    </div>
                </div>
                <div style="border-top: 1px solid ${cardBorderColor}30; padding-top: 16px; margin-top: 16px;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 13px;">
                        <div>
                            <div style="color: #666; margin-bottom: 4px;">Serie</div>
                            <div style="color: #1a1a1a; font-weight: 600; font-family: 'Courier New', monospace;">${serie}</div>
                        </div>
                        <div>
                            <div style="color: #666; margin-bottom: 4px;">Modelo</div>
                            <div style="color: #1a1a1a; font-weight: 600;">${modelo}</div>
                        </div>
                        <div>
                            <div style="color: #666; margin-bottom: 4px;">Potencia RX</div>
                            <div style="color: #1a1a1a; font-weight: 600;">${potencia}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
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
 * Genera el HTML completo del reporte de alertas
 * @param {Object} alerts - Objeto con arrays de ONTs
 * @returns {string} HTML completo del reporte
 */
function generateAlertsHTML(alerts) {
    const { lowSignal, withoutReport, stateChange, previousStates } = alerts;

    const totalAlerts = lowSignal.length + withoutReport.length + stateChange.length;

    // El endpoint /api/reporte_personalizado ya incluye header y footer en su plantilla
    // Solo enviamos el contenido interno con estilos inline mejorados
    let html = `
        <style>
            .summary {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                padding: 24px;
                border-radius: 12px;
                margin-bottom: 32px;
                box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
            }
            .summary h2 {
                margin: 0 0 20px 0;
                color: white;
                font-size: 22px;
                font-weight: 600;
                text-shadow: 0 2px 4px rgba(0,0,0,0.2);
            }
            .summary-item {
                display: inline-block;
                margin: 8px 12px 8px 0;
                padding: 12px 20px;
                background-color: rgba(255, 255, 255, 0.95);
                border-radius: 8px;
                font-weight: 600;
                font-size: 14px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                transition: transform 0.2s ease;
            }
            .section {
                background-color: #fafafa;
                padding: 24px;
                border-radius: 12px;
                margin-bottom: 24px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                border: 1px solid #e0e0e0;
            }
            .section h3 {
                margin: 0 0 20px 0;
                color: #1a1a1a;
                font-size: 20px;
                font-weight: 600;
                padding-bottom: 12px;
                border-bottom: 3px solid #667eea;
            }
        </style>
        
        <div class="summary">
            <h2>📊 Resumen de Alertas</h2>
    `;

    // Agregar resumen por tipo con emojis y mejor diseño
    if (lowSignal.length > 0) {
        html += `<span class="summary-item" style="border-left: 4px solid #f44336; color: #f44336;">🔴 Señal Baja: <strong>${lowSignal.length}</strong></span>`;
    }
    if (withoutReport.length > 0) {
        html += `<span class="summary-item" style="border-left: 4px solid #ffc107; color: #f57c00;">⏰ Sin Reporte: <strong>${withoutReport.length}</strong></span>`;
    }
    if (stateChange.length > 0) {
        html += `<span class="summary-item" style="border-left: 4px solid #2196f3; color: #1976d2;">🔄 Cambio Estado: <strong>${stateChange.length}</strong></span>`;
    }

    html += `
                <span class="summary-item" style="border-left: 4px solid #667eea; color: #667eea; background: rgba(255,255,255,1); font-size: 15px;">📋 Total: <strong>${totalAlerts} ONT(s)</strong></span>
            </div>
    `;

    // ONTs con señal baja
    if (lowSignal.length > 0) {
        const sortedOnts = sortOntsByUrgency(lowSignal);
        const groups = groupOntsByUrgency(sortedOnts);
        const allOntsOrdered = [
            ...groups.muyCritica,
            ...groups.critica,
            ...groups.advertencia,
            ...groups.baja
        ];

        html += `
            <div class="section">
                <h3 style="color: #f44336;">🔴 ONTs con Señal Baja (${lowSignal.length})</h3>
        `;

        allOntsOrdered.forEach((ont, index) => {
            html += formatOntAlertHTML(ont, index);
        });

        html += `</div>`;
    }

    // ONTs sin reporte
    if (withoutReport.length > 0) {
        html += `
            <div class="section">
                <h3 style="color: #ff9800;">⏰ ONTs sin Reporte hace mas de 12 horas (${withoutReport.length})</h3>
        `;

        withoutReport.forEach((ont, index) => {
            html += formatOntNoReportHTML(ont, index);
        });

        html += `</div>`;
    }

    // ONTs con cambio de estado
    if (stateChange.length > 0) {
        html += `
            <div class="section">
                <h3 style="color: #2196f3;">🔄 ONTs con Cambio de Estado (${stateChange.length})</h3>
        `;

        stateChange.forEach((ont, index) => {
            const previousState = previousStates[ont.id] || {};
            html += formatOntStateChangeHTML(ont, previousState, index);
        });

        html += `</div>`;
    }

    // Agregar información de la empresa al final del contenido con diseño mejorado
    html += `
        <div style="margin-top: 48px; padding: 24px; background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); border-radius: 12px; text-align: center; border: 2px solid #667eea; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);">
            <p style="margin: 0 0 8px 0; color: #555; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">
                Sistema desarrollado por
            </p>
            <p style="margin: 0; color: #667eea; font-weight: 700; font-size: 20px; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                AAD INGENIERIA SRL
            </p>
        </div>
    `;

    // Limpiar el HTML de caracteres no ASCII
    // Reemplazar espacios no separadores (\xa0) por espacios normales
    // Reemplazar caracteres especiales por sus equivalentes ASCII
    const cleanHtml = html
        .replace(/\xa0/g, ' ') // Espacios no separadores
        .replace(/[\u2018\u2019]/g, "'") // Comillas simples tipográficas
        .replace(/[\u201C\u201D]/g, '"') // Comillas dobles tipográficas
        .replace(/\u2013/g, '-') // En dash
        .replace(/\u2014/g, '--') // Em dash
        .replace(/\u2026/g, '...') // Ellipsis
        .replace(/[^\x00-\x7F]/g, function (char) {
            // Reemplazar cualquier otro carácter no ASCII por su equivalente o espacio
            const map = {
                'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u',
                'Á': 'A', 'É': 'E', 'Í': 'I', 'Ó': 'O', 'Ú': 'U',
                'ñ': 'n', 'Ñ': 'N',
                'ü': 'u', 'Ü': 'U'
            };
            return map[char] || ' ';
        });

    return cleanHtml;
}

/**
 * Envía alertas por email para múltiples ONTs con diferentes tipos de problemas
 * Usa el endpoint /api/reporte_personalizado según la documentación de la API
 * @param {Object|Array} alerts - Objeto con arrays de ONTs o Array simple (compatibilidad)
 * @param {string|Array} toEmail - Email(s) destinatario(s)
 * @returns {Promise<{ok: boolean, sent: number, errors: Array}>}
 */
export async function sendMultipleOntAlertsByEmail(alerts, toEmail) {
    // Importar función de actualización del tracker
    const { updateCriticalTimeTracker } = await import('../utils/ontCriticalTimeTracker');

    // Compatibilidad: si es un array, tratarlo como señal baja
    let ontsWithLowSignal = [];
    let ontsWithoutReport = [];
    let ontsWithStateChange = [];
    let previousStates = {};
    let allOnts = [];

    if (Array.isArray(alerts)) {
        // Modo legacy: solo señal baja
        ontsWithLowSignal = alerts;
        allOnts = alerts;
    } else {
        // Nuevo modo: objeto con diferentes tipos
        ontsWithLowSignal = alerts.lowSignal || [];
        ontsWithoutReport = alerts.withoutReport || [];
        ontsWithStateChange = alerts.stateChange || [];
        previousStates = alerts.previousStates || {};

        // Combinar todas las ONTs para actualizar el tracker
        allOnts = [
            ...ontsWithLowSignal,
            ...ontsWithoutReport,
            ...ontsWithStateChange
        ];
    }

    // Actualizar tracker de tiempo crítico antes de generar el HTML
    if (allOnts.length > 0) {
        updateCriticalTimeTracker(allOnts);
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

    // Generar HTML del reporte
    const htmlContent = generateAlertsHTML({
        lowSignal: ontsWithLowSignal,
        withoutReport: ontsWithoutReport,
        stateChange: ontsWithStateChange,
        previousStates: previousStates
    });

    // Determinar el tipo de reporte según la urgencia
    let reportType = 'info';
    if (ontsWithLowSignal.length > 0) {
        // Verificar si hay ONTs muy críticas
        const muyCriticas = ontsWithLowSignal.filter(ont => {
            const power = ont.RX_Power;
            return power !== null && power !== undefined && power <= -27;
        });
        if (muyCriticas.length > 0) {
            reportType = 'error';
        } else {
            reportType = 'warning';
        }
    } else if (ontsWithoutReport.length > 0 || ontsWithStateChange.length > 0) {
        reportType = 'warning';
    }

    // Asunto del email
    const subject = `🚨 Alertas de ONT - ${totalAlerts} equipo(s) con problemas`;

    // Título del reporte (ahora con emoji ya que el backend está corregido)
    const title = `🚨 Alertas de ONT - Sistema SGISP`;

    try {
        // Convertir string con comas a array si es necesario
        let emailArray = toEmail;
        if (typeof toEmail === 'string') {
            if (toEmail.includes(',')) {
                emailArray = toEmail.split(',').map(email => email.trim()).filter(email => email.length > 0);
            } else {
                emailArray = [toEmail.trim()];
            }
        }

        // Validar que haya al menos un email válido
        if (!emailArray || emailArray.length === 0) {
            return {
                ok: false,
                sent: 0,
                errors: ['No se proporcionó un email válido']
            };
        }

        // Validar formato de emails
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const invalidEmails = emailArray.filter(email => !emailRegex.test(email));
        if (invalidEmails.length > 0) {
            return {
                ok: false,
                sent: 0,
                errors: [`Emails inválidos: ${invalidEmails.join(', ')}`]
            };
        }

        // Asegurar que el tipo sea válido
        const validTypes = ['info', 'warning', 'error', 'success'];
        if (!validTypes.includes(reportType)) {
            reportType = 'warning';
        }

        const body = {
            to_email: emailArray,
            report_data: {
                subject: subject,
                title: title,
                content: htmlContent,
                type: reportType
            }
        };

        console.log('Enviando email a:', emailArray);
        console.log('Tipo de reporte:', reportType);
        console.log('Total de alertas:', totalAlerts);

        // Construir el endpoint correctamente
        // Según otros endpoints en el código, no usan /api/ en la ruta
        // La documentación menciona /api/reporte_personalizado pero parece que API_SGISP ya incluye la ruta base
        // Probamos sin /api/ primero, igual que otros endpoints como /enviar_email
        const endpoint = `${API_SGISP}/reporte_personalizado`;
        console.log('Endpoint:', endpoint);
        console.log('API_SGISP base:', API_SGISP);

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        });

        // Intentar parsear la respuesta
        let data;
        try {
            const text = await response.text();
            console.log('Respuesta del servidor (texto):', text);
            data = text ? JSON.parse(text) : {};
        } catch (parseError) {
            console.error('Error parseando respuesta JSON:', parseError);
            return {
                ok: false,
                sent: 0,
                errors: ['Error al procesar la respuesta del servidor']
            };
        }

        console.log('Respuesta del servidor (JSON):', data);

        if (!response.ok) {
            // Error HTTP (400, 500, etc.)
            const errorMsg = data.message || data.error || data.detail || `Error HTTP ${response.status}: ${response.statusText}`;
            console.error('Error HTTP:', response.status, errorMsg);
            return {
                ok: false,
                sent: 0,
                errors: [errorMsg]
            };
        }

        if (!data.enviado) {
            // El servidor respondió pero no se envió el email
            const errorMsg = data.message || data.error || 'Error al enviar email';
            console.error('Email no enviado:', errorMsg);
            return {
                ok: false,
                sent: 0,
                errors: [errorMsg]
            };
        }

        // Éxito
        console.log('Email enviado exitosamente');
        sent = totalAlerts;
    } catch (error) {
        console.error('Error enviando email:', error);
        console.error('Stack trace:', error.stack);
        errors.push(error.message || 'Error de red al enviar email');
    }

    return {
        ok: errors.length === 0,
        sent,
        errors
    };
}

