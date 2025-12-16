import React, { useEffect, useState } from 'react';
import { useTelegramAlert } from '../hooks/useTelegramAlert';
import { useEmailAlert } from '../hooks/useEmailAlert';
import { useTelegramAlertContext } from '../../../context/TelegramAlertContext';

/**
 * Componente botón para enviar alertas de ONTs a Telegram y/o Email
 * @param {Array} ontsList - Lista de ONTs
 */
function TelegramAlertButton({ ontsList }) {
    const [showEmailInput, setShowEmailInput] = useState(false);
    const [emailAddress, setEmailAddress] = useState('marcoarieldutto@gmail.com');
    const {
        sendAlerts: sendTelegramAlerts,
        loading: telegramLoading,
        error: telegramError,
        result: telegramResult,
        ontsWithLowSignal,
        ontsWithoutReport,
        ontsWithStateChange
    } = useTelegramAlert(ontsList);

    const {
        sendAlerts: sendEmailAlerts,
        loading: emailLoading,
        error: emailError,
        result: emailResult
    } = useEmailAlert(ontsList);

    const loading = telegramLoading || emailLoading;
    const error = telegramError || emailError;

    // Usar el contexto global para el envío automático
    const {
        isAutoSendEnabled,
        toggleAutoSend,
        lastAutoSend,
        updateOntsList
    } = useTelegramAlertContext();

    // Actualizar la lista de ONTs en el contexto cuando cambie
    useEffect(() => {
        if (ontsList && ontsList.length > 0) {
            updateOntsList(ontsList);
        }
    }, [ontsList, updateOntsList]);

    const handleSendTelegramAlerts = () => {
        const totalAlerts = ontsWithLowSignal.length + ontsWithoutReport.length + ontsWithStateChange.length;
        
        if (totalAlerts === 0) {
            alert('No hay ONTs con problemas para enviar alertas');
            return;
        }

        let alertMessage = `¿Enviar alertas a Telegram?\n\n`;
        if (ontsWithLowSignal.length > 0) {
            alertMessage += `🔴 Señal Baja: ${ontsWithLowSignal.length}\n`;
        }
        if (ontsWithoutReport.length > 0) {
            alertMessage += `⏰ Sin Reporte (>12h): ${ontsWithoutReport.length}\n`;
        }
        if (ontsWithStateChange.length > 0) {
            alertMessage += `🔄 Cambio de Estado: ${ontsWithStateChange.length}\n`;
        }
        alertMessage += `\nTotal: ${totalAlerts} ONT(s)`;

        if (window.confirm(alertMessage)) {
            sendTelegramAlerts(false);
        }
    };

    const handleSendEmailAlerts = () => {
        const totalAlerts = ontsWithLowSignal.length + ontsWithoutReport.length + ontsWithStateChange.length;
        
        if (totalAlerts === 0) {
            alert('No hay ONTs con problemas para enviar alertas');
            return;
        }

        if (!emailAddress || !emailAddress.includes('@')) {
            alert('Por favor ingresa un email válido');
            return;
        }

        let alertMessage = `¿Enviar alertas por Email a ${emailAddress}?\n\n`;
        if (ontsWithLowSignal.length > 0) {
            alertMessage += `🔴 Señal Baja: ${ontsWithLowSignal.length}\n`;
        }
        if (ontsWithoutReport.length > 0) {
            alertMessage += `⏰ Sin Reporte (>12h): ${ontsWithoutReport.length}\n`;
        }
        if (ontsWithStateChange.length > 0) {
            alertMessage += `🔄 Cambio de Estado: ${ontsWithStateChange.length}\n`;
        }
        alertMessage += `\nTotal: ${totalAlerts} ONT(s)`;

        if (window.confirm(alertMessage)) {
            sendEmailAlerts(emailAddress);
        }
    };

    const formatLastAutoSend = () => {
        if (!lastAutoSend) return 'Nunca';
        const date = new Date(lastAutoSend);
        return date.toLocaleString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="mb-4">
            <div className="d-flex flex-wrap gap-2 align-items-center mb-2">
                <button
                    onClick={handleSendTelegramAlerts}
                    disabled={telegramLoading || (ontsWithLowSignal.length === 0 && ontsWithoutReport.length === 0 && ontsWithStateChange.length === 0)}
                    className="btn btn-warning d-flex align-items-center gap-2"
                >
                    {telegramLoading ? (
                        <>
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            Enviando...
                        </>
                    ) : (
                        <>
                            <i className="bi bi-telegram"></i>
                            Enviar a Telegram ({ontsWithLowSignal.length + ontsWithoutReport.length + ontsWithStateChange.length})
                        </>
                    )}
                </button>

                <button
                    onClick={() => setShowEmailInput(!showEmailInput)}
                    className="btn btn-primary d-flex align-items-center gap-2"
                >
                    <i className="bi bi-envelope"></i>
                    Enviar por Email
                </button>

                <button
                    onClick={toggleAutoSend}
                    className={`btn d-flex align-items-center gap-2 ${isAutoSendEnabled ? 'btn-success' : 'btn-outline-success'
                        }`}
                >
                    <i className={`bi ${isAutoSendEnabled ? 'bi-toggle-on' : 'bi-toggle-off'}`}></i>
                    {isAutoSendEnabled ? 'Envío Automático: ON' : 'Envío Automático: OFF'}
                </button>

                {isAutoSendEnabled && (
                    <span className="badge bg-info text-dark">
                        <i className="bi bi-clock me-1"></i>
                        Cada 1 hora
                    </span>
                )}
            </div>

            {showEmailInput && (
                <div className="card mt-3 mb-3" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
                    <div className="card-body">
                        <h6 className="card-title text-light mb-3">
                            <i className="bi bi-envelope-fill me-2"></i>
                            Enviar Alertas por Email
                        </h6>
                        <div className="mb-3">
                            <label htmlFor="emailInput" className="form-label text-light">Email destinatario:</label>
                            <input
                                type="email"
                                id="emailInput"
                                className="form-control"
                                value={emailAddress}
                                onChange={(e) => setEmailAddress(e.target.value)}
                                placeholder="email@example.com"
                            />
                            <small className="form-text text-light opacity-75">
                                Puedes ingresar múltiples emails separados por comas
                            </small>
                        </div>
                        <button
                            onClick={handleSendEmailAlerts}
                            disabled={emailLoading || (ontsWithLowSignal.length === 0 && ontsWithoutReport.length === 0 && ontsWithStateChange.length === 0)}
                            className="btn btn-success d-flex align-items-center gap-2"
                        >
                            {emailLoading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                    Enviando...
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-send-fill"></i>
                                    Enviar Email ({ontsWithLowSignal.length + ontsWithoutReport.length + ontsWithStateChange.length})
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {isAutoSendEnabled && lastAutoSend && (
                <div className="alert alert-info mb-2" role="alert">
                    <i className="bi bi-info-circle-fill me-2"></i>
                    <strong>Último envío automático:</strong> {formatLastAutoSend()}
                </div>
            )}

            {error && (
                <div className="alert alert-danger mt-2" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {error}
                </div>
            )}

            {telegramResult && telegramResult.ok && telegramResult.sent > 0 && (
                <div className="alert alert-success mt-2" role="alert">
                    <i className="bi bi-check-circle-fill me-2"></i>
                    {telegramResult.sent} alerta(s) enviada(s) exitosamente a Telegram
                </div>
            )}

            {telegramResult && !telegramResult.ok && telegramResult.errors && telegramResult.errors.length > 0 && (
                <div className="alert alert-warning mt-2" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    Se enviaron {telegramResult.sent} de {ontsWithLowSignal.length} alertas a Telegram.
                    {telegramResult.errors.length > 0 && ` ${telegramResult.errors.length} error(es) ocurrieron.`}
                </div>
            )}

            {emailResult && emailResult.ok && emailResult.sent > 0 && (
                <div className="alert alert-success mt-2" role="alert">
                    <i className="bi bi-check-circle-fill me-2"></i>
                    {emailResult.sent} alerta(s) enviada(s) exitosamente por Email
                </div>
            )}

            {emailResult && !emailResult.ok && emailResult.errors && emailResult.errors.length > 0 && (
                <div className="alert alert-warning mt-2" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    Error al enviar email: {emailResult.errors.join(', ')}
                </div>
            )}

            {(ontsWithLowSignal.length === 0 && ontsWithoutReport.length === 0 && ontsWithStateChange.length === 0) && (
                <div className="alert alert-info mt-2" role="alert">
                    <i className="bi bi-info-circle-fill me-2"></i>
                    No hay ONTs con problemas en este momento
                </div>
            )}

            {(ontsWithLowSignal.length > 0 || ontsWithoutReport.length > 0 || ontsWithStateChange.length > 0) && (
                <div className="alert alert-warning mt-2" role="alert">
                    <i className="bi bi-info-circle-fill me-2"></i>
                    <strong>Alertas pendientes:</strong>
                    {ontsWithLowSignal.length > 0 && <span className="ms-2">🔴 Señal Baja: {ontsWithLowSignal.length}</span>}
                    {ontsWithoutReport.length > 0 && <span className="ms-2">⏰ Sin Reporte: {ontsWithoutReport.length}</span>}
                    {ontsWithStateChange.length > 0 && <span className="ms-2">🔄 Cambio Estado: {ontsWithStateChange.length}</span>}
                </div>
            )}

            {isAutoSendEnabled && (
                <div className="alert alert-success mt-2" role="alert">
                    <i className="bi bi-check-circle-fill me-2"></i>
                    <strong>Envió automático activo:</strong> El sistema enviará alertas cada 1 hora automáticamente,
                    incluso si sales de esta página. Los datos se actualizan cada 5 minutos.
                    {lastAutoSend && ` Último envío: ${formatLastAutoSend()}`}
                </div>
            )}
        </div>
    );
}

export default TelegramAlertButton;

