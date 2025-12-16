/**
 * Servicio para enviar mensajes por Email
 * Utiliza la API del backend para envío de emails
 */

import { API_SGISP } from '../config';

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
    const numero = index !== null ? `${index + 1}. ` : '';

    return `
        <div style="margin-bottom: 20px; padding: 15px; background-color: #f5f5f5; border-left: 4px solid ${urgencyColor}; border-radius: 4px;">
            <div style="display: flex; align-items: center; margin-bottom: 10px;">
                <strong style="font-size: 16px; color: #333;">${numero}${cliente}</strong>
            </div>
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="padding: 5px 10px; color: #666; width: 150px;"><strong>Potencia RX:</strong></td>
                    <td style="padding: 5px 10px; color: #333;">${potenciaFormatted} <span style="color: ${urgencyColor}; font-weight: bold;">(${urgencyLevel})</span></td>
                </tr>
                <tr>
                    <td style="padding: 5px 10px; color: #666;"><strong>Serie:</strong></td>
                    <td style="padding: 5px 10px; color: #333;">${serie}</td>
                </tr>
                <tr>
                    <td style="padding: 5px 10px; color: #666;"><strong>Modelo:</strong></td>
                    <td style="padding: 5px 10px; color: #333;">${modelo}</td>
                </tr>
                <tr>
                    <td style="padding: 5px 10px; color: #666;"><strong>Último Reporte:</strong></td>
                    <td style="padding: 5px 10px; color: #333;">${ultimoReporte}</td>
                </tr>
            </table>
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

    return `
        <div style="margin-bottom: 20px; padding: 15px; background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
            <div style="display: flex; align-items: center; margin-bottom: 10px;">
                <strong style="font-size: 16px; color: #333;">${numero}${cliente} - Sin reporte hace mas de 12 horas</strong>
            </div>
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="padding: 5px 10px; color: #666; width: 150px;"><strong>Serie:</strong></td>
                    <td style="padding: 5px 10px; color: #333;">${serie}</td>
                </tr>
                <tr>
                    <td style="padding: 5px 10px; color: #666;"><strong>Modelo:</strong></td>
                    <td style="padding: 5px 10px; color: #333;">${modelo}</td>
                </tr>
                <tr>
                    <td style="padding: 5px 10px; color: #666;"><strong>Último Reporte:</strong></td>
                    <td style="padding: 5px 10px; color: #333;">${ultimoReporte}</td>
                </tr>
                <tr>
                    <td style="padding: 5px 10px; color: #666;"><strong>Tiempo sin reporte:</strong></td>
                    <td style="padding: 5px 10px; color: #333; font-weight: bold;">${horasSinReporte}</td>
                </tr>
            </table>
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
        'success': { text: 'En linea', color: '#4caf50' },
        'danger': { text: 'Senal baja', color: '#f44336' },
        'warning': { text: 'Advertencia', color: '#ff9800' },
        'unknown': { text: 'Desconocido', color: '#757575' }
    };

    const estadoAnteriorInfo = estados[estadoAnterior] || { text: estadoAnterior, color: '#757575' };
    const estadoActualInfo = estados[estadoActual] || { text: estadoActual, color: '#757575' };

    const potencia = ont.RX_Power !== null && ont.RX_Power !== undefined
        ? `${ont.RX_Power.toFixed(2)} dbm`
        : 'N/A';

    const numero = index !== null ? `${index + 1}. ` : '';

    return `
        <div style="margin-bottom: 20px; padding: 15px; background-color: #e3f2fd; border-left: 4px solid #2196f3; border-radius: 4px;">
            <div style="display: flex; align-items: center; margin-bottom: 10px;">
                <strong style="font-size: 16px; color: #333;">${numero}${cliente} - Cambio de Estado</strong>
            </div>
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="padding: 5px 10px; color: #666; width: 150px;"><strong>Serie:</strong></td>
                    <td style="padding: 5px 10px; color: #333;">${serie}</td>
                </tr>
                <tr>
                    <td style="padding: 5px 10px; color: #666;"><strong>Modelo:</strong></td>
                    <td style="padding: 5px 10px; color: #333;">${modelo}</td>
                </tr>
                <tr>
                    <td style="padding: 5px 10px; color: #666;"><strong>Estado Anterior:</strong></td>
                    <td style="padding: 5px 10px; color: ${estadoAnteriorInfo.color}; font-weight: bold;">${estadoAnteriorInfo.text}</td>
                </tr>
                <tr>
                    <td style="padding: 5px 10px; color: #666;"><strong>Estado Actual:</strong></td>
                    <td style="padding: 5px 10px; color: ${estadoActualInfo.color}; font-weight: bold;">${estadoActualInfo.text}</td>
                </tr>
                <tr>
                    <td style="padding: 5px 10px; color: #666;"><strong>Potencia RX:</strong></td>
                    <td style="padding: 5px 10px; color: #333;">${potencia}</td>
                </tr>
            </table>
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
    // Solo enviamos el contenido interno con estilos inline
    let html = `
        <style>
            .summary {
                background-color: white;
                padding: 20px;
                border-radius: 8px;
                margin-bottom: 30px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .summary h2 {
                margin-top: 0;
                color: #333;
                border-bottom: 2px solid #667eea;
                padding-bottom: 10px;
            }
            .summary-item {
                display: inline-block;
                margin: 10px 15px 10px 0;
                padding: 10px 20px;
                background-color: #f5f5f5;
                border-radius: 6px;
                font-weight: bold;
            }
            .section {
                background-color: white;
                padding: 20px;
                border-radius: 8px;
                margin-bottom: 20px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .section h3 {
                margin-top: 0;
                color: #333;
                border-bottom: 2px solid #e0e0e0;
                padding-bottom: 10px;
            }
        </style>
        
        <div class="summary">
            <h2>Resumen</h2>
    `;

    // Agregar resumen por tipo (sin emojis para evitar problemas de codificación)
    if (lowSignal.length > 0) {
        html += `<span class="summary-item" style="border-left: 4px solid #f44336;">Señal Baja: ${lowSignal.length}</span>`;
    }
    if (withoutReport.length > 0) {
        html += `<span class="summary-item" style="border-left: 4px solid #ffc107;">Sin Reporte: ${withoutReport.length}</span>`;
    }
    if (stateChange.length > 0) {
        html += `<span class="summary-item" style="border-left: 4px solid #2196f3;">Cambio Estado: ${stateChange.length}</span>`;
    }

    html += `
                <span class="summary-item" style="border-left: 4px solid #667eea;">Total: ${totalAlerts} ONT(s)</span>
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
                <h3>ONTs con Señal Baja (${lowSignal.length})</h3>
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
                <h3>ONTs sin Reporte hace mas de 12 horas (${withoutReport.length})</h3>
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
                <h3>ONTs con Cambio de Estado (${stateChange.length})</h3>
        `;

        stateChange.forEach((ont, index) => {
            const previousState = previousStates[ont.id] || {};
            html += formatOntStateChangeHTML(ont, previousState, index);
        });

        html += `</div>`;
    }

    // Agregar información de la empresa al final del contenido
    html += `
        <div style="margin-top: 40px; padding: 20px; background-color: #f5f5f5; border-radius: 8px; text-align: center; border-top: 2px solid #667eea;">
            <p style="margin: 0; color: #666; font-size: 14px;">
                <strong>Sistema desarrollado por:</strong><br>
                <span style="color: #667eea; font-weight: bold; font-size: 16px;">AAD INGENIERIA SRL</span>
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

